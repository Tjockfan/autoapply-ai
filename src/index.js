import { YotspotScraper } from './scrapers/yotspot.js';
import { YaCrewScraper } from './scrapers/yacrew.js';
import { FormAutoFiller, BatchApplicationProcessor } from './form-filler/index.js';
import { JobParser } from './utils/parser.js';
import logger from './utils/logger.js';
import { config } from './config/index.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * AutoApply AI - Main Orchestrator
 * Coordinates job scraping and application automation
 */
export class AutoApplyAI {
  constructor(options = {}) {
    this.options = {
      scrapeYotspot: true,
      scrapeYaCrew: true,
      autoApply: false,
      maxApplications: 5,
      ...options
    };
    
    this.yotspotScraper = null;
    this.yacrewScraper = null;
    this.formFiller = null;
    this.allJobs = [];
  }

  /**
   * Run the complete workflow
   */
  async run(filters = {}) {
    logger.info('=== AutoApply AI Starting ===');
    
    try {
      // Step 1: Scrape jobs
      await this.scrapeJobs(filters);

      // Step 2: Process and filter jobs
      const filteredJobs = await this.filterJobs();

      // Step 3: Auto-apply if enabled
      if (this.options.autoApply && this.options.profile) {
        await this.applyToJobs(filteredJobs);
      }

      // Step 4: Generate report
      await this.generateReport();

      logger.info('=== AutoApply AI Complete ===');
      return this.allJobs;

    } catch (error) {
      logger.error('AutoApply AI error:', error);
      throw error;
    }
  }

  /**
   * Scrape jobs from all sources
   */
  async scrapeJobs(filters = {}) {
    logger.info('Starting job scraping...');

    const scrapePromises = [];

    if (this.options.scrapeYotspot) {
      this.yotspotScraper = new YotspotScraper();
      scrapePromises.push(
        this.yotspotScraper.scrapeJobs(filters)
          .then(jobs => {
            logger.info(`Yotspot: ${jobs.length} jobs scraped`);
            return jobs;
          })
          .catch(error => {
            logger.error('Yotspot scraping failed:', error);
            return [];
          })
          .finally(() => this.yotspotScraper?.close())
      );
    }

    if (this.options.scrapeYaCrew) {
      this.yacrewScraper = new YaCrewScraper();
      scrapePromises.push(
        this.yacrewScraper.scrapeJobs(filters)
          .then(jobs => {
            logger.info(`YaCrew: ${jobs.length} jobs scraped`);
            return jobs;
          })
          .catch(error => {
            logger.error('YaCrew scraping failed:', error);
            return [];
          })
          .finally(() => this.yacrewScraper?.close())
      );
    }

    const results = await Promise.all(scrapePromises);
    this.allJobs = results.flat();

    logger.info(`Total jobs scraped: ${this.allJobs.length}`);
    return this.allJobs;
  }

  /**
   * Filter jobs based on criteria
   */
  async filterJobs(criteria = {}) {
    logger.info('Filtering jobs...');

    let filtered = this.allJobs;

    // Filter by position
    if (criteria.positions?.length > 0) {
      filtered = filtered.filter(job => 
        criteria.positions.some(pos => 
          job.position?.toLowerCase().includes(pos.toLowerCase()) ||
          job.title?.toLowerCase().includes(pos.toLowerCase())
        )
      );
    }

    // Filter by location
    if (criteria.locations?.length > 0) {
      filtered = filtered.filter(job => 
        criteria.locations.some(loc => 
          job.location?.raw?.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    // Filter by salary
    if (criteria.minSalary) {
      filtered = filtered.filter(job => 
        job.salary?.min >= criteria.minSalary || job.salary?.max >= criteria.minSalary
      );
    }

    // Filter by vessel type
    if (criteria.vesselTypes?.length > 0) {
      filtered = filtered.filter(job => 
        criteria.vesselTypes.some(type => 
          job.vessel?.type?.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Filter already applied
    const appliedJobs = await this.loadAppliedJobs();
    filtered = filtered.filter(job => !appliedJobs.includes(job.id));

    logger.info(`Filtered to ${filtered.length} jobs`);
    return filtered;
  }

  /**
   * Apply to filtered jobs
   */
  async applyToJobs(jobs) {
    const jobsToApply = jobs.slice(0, this.options.maxApplications);
    
    if (jobsToApply.length === 0) {
      logger.info('No jobs to apply for');
      return;
    }

    logger.info(`Applying to ${jobsToApply.length} jobs...`);

    const processor = new BatchApplicationProcessor(this.options.profile);
    const results = await processor.processJobs(jobsToApply, this.options.customMessage);

    // Save applied jobs
    await this.saveAppliedJobs(results.filter(r => r.success).map(r => r.jobId));

    logger.info(`Applications complete: ${results.filter(r => r.success).length} successful`);
    return results;
  }

  /**
   * Load previously applied jobs
   */
  async loadAppliedJobs() {
    try {
      const filepath = join(__dirname, '../data/applied-jobs.json');
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Save applied jobs
   */
  async saveAppliedJobs(jobIds) {
    try {
      const existing = await this.loadAppliedJobs();
      const updated = [...new Set([...existing, ...jobIds])];
      
      const filepath = join(__dirname, '../data/applied-jobs.json');
      await fs.mkdir(dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, JSON.stringify(updated, null, 2));
    } catch (error) {
      logger.error('Failed to save applied jobs:', error);
    }
  }

  /**
   * Generate final report
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalJobs: this.allJobs.length,
        bySource: this.allJobs.reduce((acc, job) => {
          acc[job.source] = (acc[job.source] || 0) + 1;
          return acc;
        }, {})
      },
      positions: this.allJobs.reduce((acc, job) => {
        const pos = job.position || 'Unknown';
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
      }, {}),
      locations: this.allJobs.reduce((acc, job) => {
        const loc = job.location?.region || 'Unknown';
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      }, {})
    };

    const filepath = join(__dirname, `../data/report-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    logger.info('Report generated:', filepath);
    return report;
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    scrapeYotspot: !args.includes('--no-yotspot'),
    scrapeYaCrew: !args.includes('--no-yacrew'),
    autoApply: args.includes('--apply'),
    maxApplications: parseInt(process.env.MAX_APPLICATIONS) || 5
  };

  const filters = {
    position: process.env.FILTER_POSITION,
    location: process.env.FILTER_LOCATION,
    maxPages: parseInt(process.env.MAX_PAGES) || 3,
    maxScrolls: parseInt(process.env.MAX_SCROLLS) || 10
  };

  const profile = process.env.PROFILE_PATH 
    ? JSON.parse(await fs.readFile(process.env.PROFILE_PATH, 'utf-8'))
    : null;

  const autoApply = new AutoApplyAI({
    ...options,
    profile
  });

  try {
    const jobs = await autoApply.run(filters);
    console.log(`\n✅ Complete! Scraped ${jobs.length} jobs total`);
    console.log(`📁 Results saved to ./data/`);
    
    // Print summary
    const bySource = jobs.reduce((acc, job) => {
      acc[job.source] = (acc[job.source] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Summary by source:');
    for (const [source, count] of Object.entries(bySource)) {
      console.log(`   ${source}: ${count} jobs`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default AutoApplyAI;