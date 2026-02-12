# AutoApply AI - Technical Documentation

## Overview

AutoApply AI is a comprehensive web scraping and automation system designed for yacht crew recruitment platforms. It provides intelligent job scraping, data normalization, and automated form submission capabilities.

## Architecture

```
autoapply-scraper/
├── src/
│   ├── index.js              # Main orchestrator (AutoApplyAI class)
│   ├── scrapers/
│   │   ├── yotspot.js        # Yotspot.com scraper
│   │   └── yacrew.js         # YaCrew.com scraper
│   ├── form-filler/
│   │   └── index.js          # Form auto-fill & submission
│   ├── utils/
│   │   ├── rate-limiter.js   # Token bucket rate limiting
│   │   ├── proxy-rotator.js  # Proxy rotation & health checks
│   │   ├── parser.js         # Job data parser/normalizer
│   │   ├── logger.js         # Winston logging
│   │   └── browser-helpers.js # Browser utility functions
│   └── config/
│       └── index.js          # Centralized configuration
├── test/
│   └── parser.test.js        # Unit tests
├── data/                      # Output directory
└── package.json
```

## Components

### 1. Yotspot Scraper (`src/scrapers/yotspot.js`)

**Features:**
- Puppeteer-based scraping with stealth plugins
- Automatic login with credentials
- Pagination handling
- Detailed job extraction
- Configurable CSS selectors

**Key Methods:**
- `init()` - Initialize browser
- `login()` - Authenticate with credentials
- `scrapeJobs(filters)` - Main scraping method
- `extractJobsFromPage()` - Extract job cards from page
- `scrapeJobDetails(url)` - Get detailed job information

### 2. YaCrew Scraper (`src/scrapers/yacrew.js`)

**Features:**
- Infinite scroll handling
- Different DOM structure support
- Similar functionality to Yotspot scraper
- Custom selectors for YaCrew platform

**Key Methods:**
- Same interface as YotspotScraper
- `loadMore()` - Handle infinite scroll
- Supports scroll-based pagination

### 3. Form Auto-Filler (`src/form-filler/index.js`)

**Features:**
- Automatic form detection by platform
- Smart field mapping by label/placeholder
- File upload support
- Cover letter generation with templates
- Batch application processing

**Classes:**
- `FormAutoFiller` - Single form filling
- `BatchApplicationProcessor` - Process multiple applications

**Supported Platforms:**
- Yotspot
- YaCrew
- Generic (auto-detect)

### 4. Rate Limiter (`src/utils/rate-limiter.js`)

**Features:**
- Token bucket algorithm
- Configurable requests per minute
- Queue management for burst control
- Domain-specific rate limiting

**Classes:**
- `RateLimiter` - Token bucket implementation
- `DelayRateLimiter` - Simple delay-based
- `DomainRateLimiter` - Per-domain limits

### 5. Proxy Rotator (`src/utils/proxy-rotator.js`)

**Features:**
- Multiple proxy support
- Automatic rotation
- Health checking
- Failed proxy exclusion
- Support for Puppeteer and Axios

**Classes:**
- `ProxyRotator` - Full rotation with health checks
- `ProxyManager` - Simple single proxy

### 6. Job Parser (`src/utils/parser.js`)

**Features:**
- Normalizes job data to standard format
- Salary parsing (multiple currencies)
- Position classification
- Vessel type detection
- Location parsing
- Date parsing (relative and absolute)

**Standard Job Format:**
```javascript
{
  id: "unique-id",
  source: "yotspot|yacrew",
  title: "Job Title",
  position: "Position Type",
  vessel: {
    name: "Vessel Name",
    type: "Motor Yacht",
    length: { value: 100, unit: "m" }
  },
  location: {
    raw: "Mediterranean - Monaco",
    region: "mediterranean",
    country: "Monaco"
  },
  salary: {
    min: 6000,
    max: 7000,
    currency: "EUR",
    period: "month"
  },
  requirements: [...],
  description: "...",
  url: "https://...",
  postedAt: "2024-01-15T00:00:00.000Z",
  scrapedAt: "2024-01-15T12:00:00.000Z"
}
```

## Configuration

### Environment Variables (.env)

```env
# Scraping
HEADLESS=true                    # Run browser headless
RATE_LIMIT_DELAY=2000           # Delay between requests (ms)
MAX_CONCURRENT_REQUESTS=3       # Max parallel requests
SCRAPE_TIMEOUT=30000           # Page load timeout

# Proxy
USE_PROXY_ROTATION=true
PROXY_LIST=http://proxy1:port,http://proxy2:port

# Credentials
YOTSPOT_EMAIL=user@example.com
YOTSPOT_PASSWORD=secret
YACREW_EMAIL=user@example.com
YACREW_PASSWORD=secret

# Output
OUTPUT_DIR=./data
SAVE_SCREENSHOTS=false
```

### Profile JSON

User profile for auto-fill:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1 234 567 8900",
  "currentPosition": "Executive Chef",
  "yearsExperience": "8",
  "certifications": ["STCW", "ENG1"],
  "languages": ["English", "Spanish"],
  "cvPath": "./documents/cv.pdf",
  "coverLetter": "Dear Hiring Manager...",
  "availableFrom": "2024-03-01"
}
```

## Usage Examples

### Basic Scraping

```javascript
import { YotspotScraper } from './src/scrapers/yotspot.js';

const scraper = new YotspotScraper();
const jobs = await scraper.scrapeJobs({
  position: 'Chef',
  location: 'Mediterranean',
  maxPages: 5
});
console.log(`Found ${jobs.length} jobs`);
await scraper.close();
```

### Auto-Apply

```javascript
import { FormAutoFiller } from './src/form-filler/index.js';

const profile = JSON.parse(await fs.readFile('./data/profile.json'));
const filler = new FormAutoFiller(profile);

await filler.init();
const result = await filler.applyToJob('https://yotspot.com/jobs/123', {
  title: 'Executive Chef',
  position: 'Chef'
});

console.log(result.success ? 'Applied!' : 'Failed');
await filler.close();
```

### Batch Processing

```javascript
import { BatchApplicationProcessor } from './src/form-filler/index.js';

const processor = new BatchApplicationProcessor(profile);
const results = await processor.processJobs(jobs, 'Custom message');
console.log(processor.getSummary());
```

### Full Workflow

```javascript
import { AutoApplyAI } from './src/index.js';

const autoApply = new AutoApplyAI({
  scrapeYotspot: true,
  scrapeYaCrew: true,
  autoApply: true,
  maxApplications: 5,
  profile: profile
});

const jobs = await autoApply.run({
  position: 'Chef',
  location: 'Mediterranean'
});
```

## CLI Usage

```bash
# Install dependencies
npm install

# Run all scrapers
npm start

# Run individual scrapers
npm run scrape:yotspot
npm run scrape:yacrew

# With filters
FILTER_POSITION=Chef FILTER_LOCATION=Caribbean npm start

# Auto-apply mode
MAX_APPLICATIONS=3 PROFILE_PATH=./data/profile.json npm start -- --apply

# Run tests
npm test
```

## Rate Limiting Strategy

The system implements multiple layers of rate limiting:

1. **Token Bucket** - Controls overall request rate
2. **Delay Between Requests** - Adds human-like delays
3. **Domain-Specific Limits** - Different limits per site
4. **Burst Control** - Handles traffic spikes

Default: 10 requests/minute with burst of 3

## Proxy Rotation

Proxies are rotated based on:
- Request count (every N requests)
- Health status (failed proxies excluded)
- Random selection from healthy pool

Health checks performed on proxy initialization.

## Security Considerations

- Credentials stored in `.env` (not in code)
- Stealth plugins to avoid detection
- User-agent rotation
- Proxy support for IP rotation
- Rate limiting to avoid blocking

## Error Handling

- Automatic retries with exponential backoff
- Screenshot capture on errors
- Failed request logging
- Graceful degradation

## Testing

```bash
# Run all tests
npm test

# Run specific test
node --test test/parser.test.js
```

## Output Files

- `data/yotspot-jobs-YYYY-MM-DD.json` - Yotspot jobs
- `data/yacrew-jobs-YYYY-MM-DD.json` - YaCrew jobs
- `data/report-YYYY-MM-DD.json` - Summary report
- `data/applied-jobs.json` - Applied job tracking
- `data/combined.log` - Application logs
- `data/error.log` - Error logs
- `data/screenshots/` - Screenshots (if enabled)

## Future Enhancements

1. **Queue Management** - Redis-based job queue
2. **More Platforms** - Expand to additional job sites
3. **AI Matching** - Smart job-candidate matching
4. **Email Notifications** - Alerts for new jobs
5. **Dashboard** - Web UI for monitoring
6. **API** - REST API for integration

## Troubleshooting

### Browser not launching
- Ensure Puppeteer dependencies installed
- Check headless mode setting
- Verify no sandbox issues (Linux)

### Login failures
- Verify credentials in .env
- Check for CAPTCHA challenges
- Review site changes

### Rate limiting
- Increase RATE_LIMIT_DELAY
- Enable proxy rotation
- Reduce MAX_CONCURRENT_REQUESTS

### Proxy errors
- Test proxies manually
- Check proxy format
- Verify proxy health status

## License

MIT