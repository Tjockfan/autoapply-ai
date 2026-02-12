import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import { config } from '../config/index.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { ProxyRotator } from '../utils/proxy-rotator.js';
import { JobParser } from '../utils/parser.js';
import logger from '../utils/logger.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add stealth plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUA());

/**
 * Yotspot Job Scraper
 */
export class YotspotScraper {
  constructor(options = {}) {
    this.config = { ...config.yotspot, ...config.scraping, ...options };
    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.proxyRotator = config.proxy.enabled ? new ProxyRotator(config.proxy) : null;
    this.parser = new JobParser();
    this.browser = null;
    this.page = null;
    
    if (this.proxyRotator && config.proxy.list.length > 0) {
      this.proxyRotator.addProxies(config.proxy.list);
    }
  }

  /**
   * Initialize browser
   */
  async init() {
    logger.info('Initializing Yotspot scraper...');

    const launchOptions = {
      headless: this.config.headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    };

    // Add proxy if enabled
    if (this.proxyRotator) {
      const proxy = this.proxyRotator.getPuppeteerProxy();
      if (proxy) {
        launchOptions.args.push(`--proxy-server=${proxy.server}`);
      }
    }

    this.browser = await puppeteer.launch(launchOptions);
    this.page = await this.browser.newPage();

    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });

    // Set default timeout
    this.page.setDefaultTimeout(this.config.timeout);
    this.page.setDefaultNavigationTimeout(this.config.timeout);

    logger.info('Yotspot scraper initialized');
  }

  /**
   * Login to Yotspot
   */
  async login() {
    if (!config.credentials.yotspot.email || !config.credentials.yotspot.password) {
      logger.warn('Yotspot credentials not configured, proceeding without login');
      return false;
    }

    try {
      logger.info('Logging into Yotspot...');
      
      await this.rateLimiter.execute(async () => {
        await this.page.goto(this.config.loginUrl, { waitUntil: 'networkidle2' });
      });

      // Wait for login form
      await this.page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 5000 });

      // Fill in credentials
      await this.page.type('input[type="email"], input[name="email"], #email', config.credentials.yotspot.email);
      await this.page.type('input[type="password"], input[name="password"], #password', config.credentials.yotspot.password);

      // Click login button
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
        this.page.click('button[type="submit"], input[type="submit"], .login-btn')
      ]);

      // Check if login successful
      const currentUrl = this.page.url();
      if (currentUrl.includes('dashboard') || currentUrl.includes('profile')) {
        logger.info('Successfully logged into Yotspot');
        return true;
      }

      logger.error('Yotspot login failed');
      return false;
    } catch (error) {
      logger.error('Error during Yotspot login:', error);
      return false;
    }
  }

  /**
   * Scrape job listings
   */
  async scrapeJobs(filters = {}) {
    const jobs = [];
    
    try {
      if (!this.browser) {
        await this.init();
      }

      // Login if credentials available
      await this.login();

      // Build search URL with filters
      let searchUrl = this.config.jobsUrl;
      const params = new URLSearchParams();
      
      if (filters.position) params.append('position', filters.position);
      if (filters.location) params.append('location', filters.location);
      if (filters.vesselType) params.append('vessel_type', filters.vesselType);
      
      if (params.toString()) {
        searchUrl += `?${params.toString()}`;
      }

      logger.info(`Navigating to: ${searchUrl}`);

      await this.rateLimiter.execute(async () => {
        await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
      });

      // Wait for job listings to load
      await this.page.waitForTimeout(3000);

      // Handle pagination
      let hasMorePages = true;
      let pageNum = 1;
      const maxPages = filters.maxPages || 5;

      while (hasMorePages && pageNum <= maxPages) {
        logger.info(`Scraping page ${pageNum}...`);

        // Extract jobs from current page
        const pageJobs = await this.extractJobsFromPage();
        jobs.push(...pageJobs);

        logger.info(`Found ${pageJobs.length} jobs on page ${pageNum}`);

        // Check for next page
        hasMorePages = await this.goToNextPage();
        pageNum++;

        // Rate limiting delay
        await this.rateLimiter.delay(this.config.rateLimitDelay);
      }

      // Parse and normalize jobs
      const normalizedJobs = this.parser.parseJobs(jobs, 'yotspot');
      const uniqueJobs = this.parser.deduplicateJobs(normalizedJobs);

      logger.info(`Total unique jobs scraped: ${uniqueJobs.length}`);

      // Save to file
      await this.saveJobs(uniqueJobs);

      return uniqueJobs;

    } catch (error) {
      logger.error('Error scraping Yotspot jobs:', error);
      throw error;
    }
  }

  /**
   * Extract jobs from current page
   */
  async extractJobsFromPage() {
    const { selectors } = this.config;

    return await this.page.evaluate((selectors) => {
      const jobs = [];
      const jobCards = document.querySelectorAll(selectors.jobCard);

      jobCards.forEach(card => {
        try {
          const job = {
            title: card.querySelector(selectors.title)?.textContent?.trim(),
            position: card.querySelector(selectors.position)?.textContent?.trim(),
            vesselName: card.querySelector(selectors.vessel)?.textContent?.trim(),
            location: card.querySelector(selectors.location)?.textContent?.trim(),
            salary: card.querySelector(selectors.salary)?.textContent?.trim(),
            description: card.querySelector(selectors.description)?.textContent?.trim(),
            postedDate: card.querySelector(selectors.postedDate)?.textContent?.trim(),
            url: card.querySelector('a')?.href || window.location.href
          };

          // Try to get vessel info from title or description
          const titleText = job.title || '';
          const vesselMatch = titleText.match(/on\s+([^,]+)/i);
          if (vesselMatch && !job.vesselName) {
            job.vesselName = vesselMatch[1].trim();
          }

          jobs.push(job);
        } catch (e) {
          console.error('Error extracting job:', e);
        }
      });

      return jobs;
    }, selectors);
  }

  /**
   * Navigate to next page
   */
  async goToNextPage() {
    try {
      const nextButton = await this.page.$('.pagination .next, .next-page, [rel="next"]');
      
      if (nextButton) {
        const isDisabled = await nextButton.evaluate(el => 
          el.disabled || el.classList.contains('disabled')
        );

        if (!isDisabled) {
          await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
            nextButton.click()
          ]);
          
          await this.page.waitForTimeout(2000);
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.debug('No next page found');
      return false;
    }
  }

  /**
   * Scrape detailed job information
   */
  async scrapeJobDetails(jobUrl) {
    try {
      await this.rateLimiter.execute(async () => {
        await this.page.goto(jobUrl, { waitUntil: 'networkidle2' });
      });

      await this.page.waitForTimeout(2000);

      const details = await this.page.evaluate(() => {
        return {
          fullDescription: document.querySelector('.job-description, .description, [data-description]')?.textContent?.trim(),
          requirements: Array.from(document.querySelectorAll('.requirements li, .qualifications li')).map(li => li.textContent?.trim()),
          benefits: Array.from(document.querySelectorAll('.benefits li')).map(li => li.textContent?.trim()),
          contactEmail: document.querySelector('a[href^="mailto:"]')?.href?.replace('mailto:', ''),
          companyName: document.querySelector('.company-name, .employer-name')?.textContent?.trim()
        };
      });

      return details;
    } catch (error) {
      logger.error(`Error scraping job details for ${jobUrl}:`, error);
      return null;
    }
  }

  /**
   * Save jobs to file
   */
  async saveJobs(jobs) {
    const outputDir = join(__dirname, '../../data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `yotspot-jobs-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = join(outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(jobs, null, 2));
    logger.info(`Saved ${jobs.length} jobs to ${filepath}`);
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info('Yotspot scraper closed');
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const scraper = new YotspotScraper();
  
  scraper.scrapeJobs({
    position: process.env.POSITION,
    location: process.env.LOCATION,
    maxPages: parseInt(process.env.MAX_PAGES) || 3
  })
  .then(jobs => {
    console.log(`Scraped ${jobs.length} jobs from Yotspot`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Scraper failed:', error);
    process.exit(1);
  })
  .finally(() => {
    scraper.close();
  });
}

export default YotspotScraper;