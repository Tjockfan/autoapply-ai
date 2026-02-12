import logger from './logger.js';

/**
 * Job Data Parser and Normalizer
 * Transforms raw scraped data into standardized format
 */
export class JobParser {
  constructor() {
    this.currencySymbols = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      'USD': 'USD',
      'EUR': 'EUR',
      'GBP': 'GBP'
    };
  }

  /**
   * Parse and normalize a job listing
   */
  parseJob(rawJob, source) {
    try {
      const parsed = {
        id: this.generateId(rawJob, source),
        source: source,
        title: this.cleanText(rawJob.title),
        position: this.parsePosition(rawJob.position || rawJob.title),
        vessel: this.parseVessel(rawJob),
        location: this.parseLocation(rawJob.location),
        salary: this.parseSalary(rawJob.salary),
        requirements: this.parseRequirements(rawJob.requirements),
        description: this.cleanText(rawJob.description),
        url: rawJob.url,
        postedAt: this.parseDate(rawJob.postedDate || rawJob.postedAt),
        expiresAt: this.parseDate(rawJob.expiresAt),
        contract: this.parseContract(rawJob),
        benefits: this.parseBenefits(rawJob.benefits),
        scrapedAt: new Date().toISOString()
      };

      return this.validateJob(parsed);
    } catch (error) {
      logger.error('Error parsing job:', error);
      return null;
    }
  }

  /**
   * Generate unique ID for job
   */
  generateId(rawJob, source) {
    const idString = `${source}-${rawJob.title}-${rawJob.url || Date.now()}`;
    return Buffer.from(idString).toString('base64').substring(0, 20);
  }

  /**
   * Clean and normalize text
   */
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }

  /**
   * Parse position type from title
   */
  parsePosition(title) {
    if (!title) return 'Unknown';
    
    const positionPatterns = [
      { pattern: /captain|master|skipper/i, role: 'Captain' },
      { pattern: /chef|cook|culinary|galley/i, role: 'Chef' },
      { pattern: /stewardess|steward|interior/i, role: 'Steward/Stewardess' },
      { pattern: /engineer|eto|mate/i, role: 'Engineer' },
      { pattern: /deckhand|deck/i, role: 'Deckhand' },
      { pattern: /first officer|1st officer/i, role: 'First Officer' },
      { pattern: /bosun/i, role: 'Bosun' },
      { pattern: /mate/i, role: 'Mate' }
    ];

    for (const { pattern, role } of positionPatterns) {
      if (pattern.test(title)) return role;
    }

    return title.split(' ').slice(0, 3).join(' ');
  }

  /**
   * Parse vessel information
   */
  parseVessel(rawJob) {
    const vessel = {
      name: rawJob.vessel?.name || rawJob.vesselName || null,
      type: this.parseVesselType(rawJob.vessel?.type || rawJob.vesselType),
      length: this.parseVesselLength(rawJob.vessel?.length || rawJob.vesselLength),
      flag: rawJob.vessel?.flag || null
    };

    return vessel;
  }

  /**
   * Parse vessel type
   */
  parseVesselType(type) {
    if (!type) return null;
    
    const types = [
      { pattern: /motor yacht|m\/y/i, name: 'Motor Yacht' },
      { pattern: /sailing yacht|s\/y|sail/i, name: 'Sailing Yacht' },
      { pattern: /superyacht|super yacht/i, name: 'Superyacht' },
      { pattern: /mega yacht|megayacht/i, name: 'Megayacht' },
      { pattern: /catamaran|cat/i, name: 'Catamaran' }
    ];

    for (const { pattern, name } of types) {
      if (pattern.test(type)) return name;
    }

    return type;
  }

  /**
   * Parse vessel length
   */
  parseVesselLength(length) {
    if (!length) return null;
    
    const match = length.toString().match(/(\d+(?:\.\d+)?)\s*(m|meters?|ft|feet)/i);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2].toLowerCase().startsWith('m') ? 'm' : 'ft'
      };
    }
    
    return { value: parseFloat(length), unit: 'm' };
  }

  /**
   * Parse location
   */
  parseLocation(location) {
    if (!location) return null;

    const cleaned = this.cleanText(location);
    
    // Common yachting locations
    const regions = {
      mediterranean: /med|mediterranean|france|italy|spain|greece|monaco/i,
      caribbean: /caribbean|bahamas|bvi|antigua|st\.?\s*martin/i,
      usa: /usa|united states|florida|california/i,
      middleEast: /dubai|uae|qatar|oman/i,
      asia: /asia|thailand|singapore|hong kong/i
    };

    const region = Object.entries(regions).find(([_, pattern]) => pattern.test(cleaned));

    return {
      raw: cleaned,
      region: region ? region[0] : 'Unknown',
      country: this.extractCountry(cleaned)
    };
  }

  /**
   * Extract country from location
   */
  extractCountry(location) {
    const countries = [
      'USA', 'UK', 'France', 'Italy', 'Spain', 'Greece', 'Monaco', 
      'Turkey', 'Croatia', 'Montenegro', 'Dubai', 'UAE', 'Qatar',
      'Bahamas', 'BVI', 'Antigua', 'St. Martin'
    ];

    for (const country of countries) {
      if (location.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    return null;
  }

  /**
   * Parse salary information
   */
  parseSalary(salaryText) {
    if (!salaryText) return null;

    const cleaned = this.cleanText(salaryText);
    
    // Extract currency
    let currency = 'USD';
    for (const [symbol, code] of Object.entries(this.currencySymbols)) {
      if (cleaned.includes(symbol)) {
        currency = code;
        break;
      }
    }

    // Extract amount range
    const amountMatch = cleaned.match(/(\d[,\d]*(?:\.\d+)?)\s*(?:-|\s*to\s*)\s*(\d[,\d]*(?:\.\d+)?)/);
    const singleMatch = cleaned.match(/(\d[,\d]*(?:\.\d+)?)/);

    let min = null, max = null;
    if (amountMatch) {
      min = parseFloat(amountMatch[1].replace(/,/g, ''));
      max = parseFloat(amountMatch[2].replace(/,/g, ''));
    } else if (singleMatch) {
      min = max = parseFloat(singleMatch[1].replace(/,/g, ''));
    }

    // Determine period
    const period = /monthly|month|pcm/i.test(cleaned) ? 'month' :
                   /yearly|year|annum|pa/i.test(cleaned) ? 'year' :
                   /week|weekly/i.test(cleaned) ? 'week' :
                   /day|daily/i.test(cleaned) ? 'day' : 'month';

    return {
      min,
      max,
      currency,
      period,
      raw: cleaned
    };
  }

  /**
   * Parse requirements list
   */
  parseRequirements(requirements) {
    if (!requirements) return [];
    
    if (Array.isArray(requirements)) {
      return requirements.map(r => this.cleanText(r)).filter(Boolean);
    }
    
    // Split by common delimiters
    return requirements
      .split(/[,;•\n]+/)
      .map(r => this.cleanText(r))
      .filter(r => r.length > 3);
  }

  /**
   * Parse contract type
   */
  parseContract(rawJob) {
    const contractText = rawJob.contract || rawJob.employmentType || '';
    
    return {
      type: /permanent|full[-\s]?time/i.test(contractText) ? 'Permanent' :
            /temporary|contract|seasonal/i.test(contractText) ? 'Temporary' :
            'Unknown',
      duration: this.extractDuration(rawJob.description),
      startDate: this.parseDate(rawJob.startDate)
    };
  }

  /**
   * Extract contract duration
   */
  extractDuration(text) {
    if (!text) return null;
    
    const match = text.match(/(\d+)\s*(month|year|week)s?/i);
    if (match) {
      return {
        value: parseInt(match[1]),
        unit: match[2].toLowerCase()
      };
    }
    return null;
  }

  /**
   * Parse benefits
   */
  parseBenefits(benefits) {
    if (!benefits) return [];
    
    if (Array.isArray(benefits)) {
      return benefits.map(b => this.cleanText(b));
    }
    
    return benefits
      .split(/[,;•\n]+/)
      .map(b => this.cleanText(b))
      .filter(Boolean);
  }

  /**
   * Parse date string to ISO format
   */
  parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle relative dates
    const relativeMatch = dateString.match(/(\d+)\s*(day|week|month)s?\s*ago/i);
    if (relativeMatch) {
      const num = parseInt(relativeMatch[1]);
      const unit = relativeMatch[2];
      const date = new Date();
      
      if (unit === 'day') date.setDate(date.getDate() - num);
      else if (unit === 'week') date.setDate(date.getDate() - num * 7);
      else if (unit === 'month') date.setMonth(date.getMonth() - num);
      
      return date.toISOString();
    }
    
    // Try standard parsing
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    return null;
  }

  /**
   * Validate parsed job
   */
  validateJob(job) {
    const required = ['title', 'source'];
    const missing = required.filter(field => !job[field]);
    
    if (missing.length > 0) {
      logger.warn(`Job validation failed, missing: ${missing.join(', ')}`);
      return null;
    }
    
    return job;
  }

  /**
   * Batch parse multiple jobs
   */
  parseJobs(rawJobs, source) {
    return rawJobs
      .map(job => this.parseJob(job, source))
      .filter(Boolean);
  }

  /**
   * Deduplicate jobs by ID
   */
  deduplicateJobs(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      return true;
    });
  }
}

export default JobParser;