# Yotspot and YaCrew Job Scraper

Automated job listing scraper with form auto-fill capabilities for yacht crew recruitment platforms.

## Features

- **Yotspot Scraper**: Extracts job listings from yotspot.com
- **YaCrew Scraper**: Extracts job listings from yacrew.com
- **Auto-Fill Module**: Automated form submission with profile data
- **Rate Limiting**: Configurable delays and request throttling
- **Proxy Rotation**: Built-in proxy support for anonymity
- **Data Normalization**: Standardized job data format

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
# Redis (for queue management)
REDIS_URL=redis://localhost:6379

# Proxy Configuration (optional)
PROXY_LIST=http://proxy1:port,http://proxy2:port
USE_PROXY_ROTATION=true

# Scraping Settings
RATE_LIMIT_DELAY=2000
MAX_CONCURRENT_REQUESTS=3
HEADLESS=true

# Credentials (for form submission)
YOTSPOT_EMAIL=your@email.com
YOTSPOT_PASSWORD=yourpassword
YACREW_EMAIL=your@email.com
YACREW_PASSWORD=yourpassword
```

## Usage

### Run all scrapers
```bash
npm start
```

### Run individual scrapers
```bash
npm run scrape:yotspot
npm run scrape:yacrew
```

### Programmatic Usage

```javascript
import { YotspotScraper } from './src/scrapers/yotspot.js';
import { YaCrewScraper } from './src/scrapers/yacrew.js';

const yotspot = new YotspotScraper();
const jobs = await yotspot.scrapeJobs({ position: 'Chef', location: 'Mediterranean' });
```

## Project Structure

```
autoapply-scraper/
├── src/
│   ├── index.js              # Main entry point
│   ├── scrapers/
│   │   ├── yotspot.js        # Yotspot scraper
│   │   └── yacrew.js         # YaCrew scraper
│   ├── form-filler/
│   │   └── index.js          # Auto-fill module
│   ├── utils/
│   │   ├── rate-limiter.js   # Rate limiting
│   │   ├── proxy-rotator.js  # Proxy rotation
│   │   ├── parser.js         # Data parser
│   │   └── logger.js         # Logging utility
│   └── config/
│       └── index.js          # Configuration
├── data/                      # Output directory
└── package.json
```

## Output Format

Jobs are saved as normalized JSON:

```json
{
  "id": "unique-job-id",
  "source": "yotspot|yacrew",
  "title": "Job Title",
  "position": "Position Type",
  "vessel": {
    "name": "Vessel Name",
    "type": "Motor Yacht",
    "length": "100m"
  },
  "location": "Mediterranean",
  "salary": {
    "amount": 5000,
    "currency": "EUR",
    "period": "month"
  },
  "requirements": [...],
  "description": "Full job description",
  "url": "https://...",
  "postedAt": "2024-01-15",
  "expiresAt": "2024-02-15"
}
```

## Legal Notice

This scraper is for educational purposes. Always comply with website terms of service and robots.txt. Use responsibly and with appropriate rate limiting.