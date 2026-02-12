import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

export const config = {
  // Scraping settings
  scraping: {
    headless: process.env.HEADLESS !== 'false',
    rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY) || 2000,
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 3,
    timeout: parseInt(process.env.SCRAPE_TIMEOUT) || 30000,
    retries: parseInt(process.env.MAX_RETRIES) || 3,
    userDataDir: process.env.USER_DATA_DIR || './data/browser-data'
  },

  // Proxy configuration
  proxy: {
    enabled: process.env.USE_PROXY_ROTATION === 'true',
    list: process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [],
    rotationInterval: parseInt(process.env.PROXY_ROTATION_INTERVAL) || 5,
    testUrl: process.env.PROXY_TEST_URL || 'https://httpbin.org/ip'
  },

  // Redis for queue management
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    maxRetriesPerRequest: 3
  },

  // Credentials
  credentials: {
    yotspot: {
      email: process.env.YOTSPOT_EMAIL,
      password: process.env.YOTSPOT_PASSWORD
    },
    yacrew: {
      email: process.env.YACREW_EMAIL,
      password: process.env.YACREW_PASSWORD
    }
  },

  // Output settings
  output: {
    dir: process.env.OUTPUT_DIR || './data',
    format: process.env.OUTPUT_FORMAT || 'json',
    saveScreenshots: process.env.SAVE_SCREENSHOTS === 'true'
  },

  // Yotspot specific
  yotspot: {
    baseUrl: 'https://www.yotspot.com',
    loginUrl: 'https://www.yotspot.com/login',
    jobsUrl: 'https://www.yotspot.com/jobs',
    selectors: {
      jobCard: '.job-card, .job-listing, [data-job-id]',
      title: '.job-title, h2, h3',
      position: '.position, .job-position',
      vessel: '.vessel-name, .yacht-name',
      location: '.location, .job-location',
      salary: '.salary, .job-salary',
      description: '.description, .job-description',
      postedDate: '.posted-date, .date-posted',
      applyButton: '.apply-btn, button[type="submit"]'
    }
  },

  // YaCrew specific
  yacrew: {
    baseUrl: 'https://www.yacrew.com',
    loginUrl: 'https://www.yacrew.com/login',
    jobsUrl: 'https://www.yacrew.com/jobs',
    selectors: {
      jobCard: '.job-item, .listing-item, [data-listing]',
      title: '.job-title, .listing-title, h2',
      position: '.position-title, .role',
      vessel: '.vessel, .yacht-name, .boat-name',
      location: '.job-location, .location',
      salary: '.salary, .pay-range',
      description: '.job-desc, .description',
      postedDate: '.posted, .date',
      applyButton: '.apply-button, .btn-apply'
    }
  },

  // Rate limiting
  rateLimit: {
    requestsPerMinute: parseInt(process.env.REQUESTS_PER_MINUTE) || 10,
    burstSize: parseInt(process.env.BURST_SIZE) || 3,
    cooldownPeriod: parseInt(process.env.COOLDOWN_PERIOD) || 60000
  }
};

export default config;