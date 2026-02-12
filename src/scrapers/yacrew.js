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
 * YaCrew Job Scraper
 */
export class YaCrewScraper {
  constructor(options = {}) {
    this.config = { ...config.yacrew, ...config.scraping, ...options };
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
    logger.info('Initializing YaCrew scraper...');

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

    logger.info('YaCrew scraper initialized');
  }

  /**
   * Login to YaCrew
   */
  async login() {
    if (!config.credentials.yacrew.email || !config.credentials.yacrew.password) {
      logger.warn('YaCrew credentials not configured, proceeding without login');
      return false;
    }

    try {
      logger.info('Logging into YaCrew...');
      
      await this.rateLimiter.execute(async () => {
        await this.page.goto(this.config.loginUrl, { waitUntil: 'networkidle2' });
      });

      // Wait for login form
      await this.page.waitForSelector('input[type="email"], input[name="email"], #email, input[placeholder*="email" i]', { timeout: 5000 });

      // Fill in credentials
      await this.page.type('input[type="email"], input[name="email"], #email, input[placeholder*="email" i]', config.credentials.yacrew.email);
      await this.page.type('input[type="password"], input[name="password"], #password, input[placeholder*="password" i]', config.credentials.yacrew.password);

      // Click login button
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
        this.page.click('button[type="submit"], input[type="submit"], .login-btn, button:has-text("Login"), button:has-text("Sign In")')
      ]);

      // Check if login successful
      const currentUrl = this.page.url();
      if (currentUrl.includes('dashboard') || currentUrl.includes('profile') || !currentUrl.includes('login')) {
        logger.info('Successfully logged into YaCrew');
        return true;
      }

      logger.error('YaCrew login failed');
      return false;
    } catch (error) {
      logger.error('Error during YaCrew login:', error);
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
      if (filters.vesselType) params.append('vessel', filters.vesselType);
      
      if (params.toString()) {
        searchUrl += `?${params.toString()}`;
      }

      logger.info(`Navigating to: ${searchUrl}`);

      await this.rateLimiter.execute(async () => {
        await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
      });

      // Wait for job listings to load
      await this.page.waitForTimeout(3000);

      // Handle infinite scroll or pagination
      let previousJobCount = 0;
      let scrollAttempts = 0;
      const maxScrolls = filters.maxScrolls || 10;

      while (scrollAttempts < maxScrolls) {
        logger.info(`Scrolling for more jobs (attempt ${scrollAttempts + 1})...`);

        // Extract jobs from current view
        const pageJobs = await this.extractJobsFromPage();
        
        // Add new unique jobs
        const newJobs = pageJobs.slice(previousJobCount);
        jobs.push(...newJobs);

        logger.info(`Found ${newJobs.length} new jobs (total: ${jobs.length})`);

        if (newJobs.length === 0) {
          break;
        }

        previousJobCount = pageJobs.length;

        // Try to load more (scroll or click)
        const hasMore = await this.loadMore();
        if (!hasMore) {
          break;
        }

        scrollAttempts++;
        await this.rateLimiter.delay(this.config.rateLimitDelay);
      }

      // Parse and normalize jobs
      const normalizedJobs = this.parser.parseJobs(jobs, 'yacrew');
      const uniqueJobs = this.parser.deduplicateJobs(normalizedJobs);

      logger.info(`Total unique jobs scraped: ${uniqueJobs.length}`);

      // Save to file
      await this.saveJobs(uniqueJobs);

      return uniqueJobs;

    } catch (error) {
      logger.error('Error scraping YaCrew jobs:', error);
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
            vesselType: card.querySelector('.vessel-type, .yacht-type')?.textContent?.trim(),
            location: card.querySelector(selectors.location)?.textContent?.trim(),
            salary: card.querySelector(selectors.salary)?.textContent?.trim(),
            description: card.querySelector(selectors.description)?.textContent?.trim(),
            postedDate: card.querySelector(selectors.postedDate)?.textContent?.trim(),
            employmentType: card.querySelector('.employment-type, .contract-type')?.textContent?.trim(),
            url: card.querySelector('a')?.href || window.location.href
          };

          // Extract vessel length if available
          const lengthMatch = card.textContent.match(/(\d+)\s*m/i);
          if (lengthMatch) {
            job.vesselLength = `${lengthMatch[1]}m`;
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
   * Load more jobs (infinite scroll or click)
   */
  async loadMore() {
    try {
      // Try click on "Load More" button first
      const loadMoreBtn = await this.page.$('.load-more, .show-more, button:has-text("Load More"), button:has-text("Show More")');
      
      if (loadMoreBtn) {
        const isVisible = await loadMoreBtn.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        });

        if (isVisible) {
          await loadMoreBtn.click();
          await this.page.waitForTimeout(2000);
          return true;
        }
      }

      // Try infinite scroll
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await this.page.waitForTimeout(2000);
      return true;

    } catch (error) {
      logger.debug('No more jobs to load');
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
          fullDescription: document.querySelector('.job-description, .description, .job-details')?.textContent?.trim(),
          requirements: Array.from(document.querySelectorAll('.requirements li, .qualifications li, .skills li')).map(li => li.textContent?.trim()),
          benefits: Array.from(document.querySelectorAll('.benefits li, .perks li')).map(li => li.textContent?.trim()),
          contactEmail: document.querySelector('a[href^="mailto:"]')?.href?.replace('mailto:', ''),
          companyName: document.querySelector('.company-name, .employer-name, .yacht-name')?.textContent?.trim(),
          startDate: document.querySelector('.start-date, .commencement')?.textContent?.trim()
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
    
    const filename = `yacrew-jobs-${new Date().toISOString().split('T')[0]}.json`;
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
      logger.info('YaCrew scraper closed');
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const scraper = new YaCrewScraper();
  
  scraper.scrapeJobs({
    position: process.env.POSITION,
    location: process.env.LOCATION,
    maxScrolls: parseInt(process.env.MAX_SCROLLS) || 10
  })
  .then(jobs => {
    console.log(`Scraped ${jobs.length} jobs from YaCrew`);
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

export default YaCrewScraper;