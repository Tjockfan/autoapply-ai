import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AnonymizeUA from 'puppeteer-extra-plugin-anonymize-ua';
import { config } from '../config/index.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import logger from '../utils/logger.js';

// Add stealth plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUA());

/**
 * Auto-fill Form Submission Module
 * Handles automated form filling and submission for job applications
 */
export class FormAutoFiller {
  constructor(profile = {}, options = {}) {
    this.profile = {
      // Personal Information
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      nationality: '',
      dateOfBirth: '',
      
      // Professional Information
      currentPosition: '',
      yearsExperience: '',
      certifications: [],
      languages: [],
      skills: [],
      
      // Documents
      cvPath: '',
      coverLetterPath: '',
      passportPath: '',
      certificates: [],
      
      // Preferences
      availableFrom: '',
      preferredPositions: [],
      preferredLocations: [],
      salaryExpectation: '',
      
      // Cover letter template
      coverLetter: '',
      
      ...profile
    };

    this.options = {
      headless: config.scraping.headless,
      timeout: config.scraping.timeout,
      screenshotOnError: true,
      ...options
    };

    this.rateLimiter = new RateLimiter(config.rateLimit);
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser
   */
  async init() {
    logger.info('Initializing Form Auto-Filler...');

    this.browser = await puppeteer.launch({
      headless: this.options.headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    this.page.setDefaultTimeout(this.options.timeout);

    logger.info('Form Auto-Filler initialized');
  }

  /**
   * Apply to a job with auto-filled form
   */
  async applyToJob(jobUrl, jobData = {}, customMessage = '') {
    try {
      if (!this.browser) {
        await this.init();
      }

      logger.info(`Applying to job: ${jobUrl}`);

      await this.rateLimiter.execute(async () => {
        await this.page.goto(jobUrl, { waitUntil: 'networkidle2' });
      });

      // Wait for page to load
      await this.page.waitForTimeout(2000);

      // Detect form type and fill accordingly
      const formType = await this.detectFormType();
      logger.info(`Detected form type: ${formType}`);

      let result;
      switch (formType) {
        case 'yotspot':
          result = await this.fillYotspotForm(jobData, customMessage);
          break;
        case 'yacrew':
          result = await this.fillYaCrewForm(jobData, customMessage);
          break;
        case 'generic':
        default:
          result = await this.fillGenericForm(jobData, customMessage);
          break;
      }

      return result;

    } catch (error) {
      logger.error('Error applying to job:', error);
      
      if (this.options.screenshotOnError) {
        await this.takeScreenshot(`error-${Date.now()}.png`);
      }
      
      throw error;
    }
  }

  /**
   * Detect form type based on URL or page structure
   */
  async detectFormType() {
    const url = this.page.url();
    
    if (url.includes('yotspot.com')) return 'yotspot';
    if (url.includes('yacrew.com')) return 'yacrew';
    
    // Detect by form structure
    const hasYotspotElements = await this.page.$('.yotspot-form, [data-platform="yotspot"]') !== null;
    const hasYaCrewElements = await this.page.$('.yacrew-form, [data-platform="yacrew"]') !== null;
    
    if (hasYotspotElements) return 'yotspot';
    if (hasYaCrewElements) return 'yacrew';
    
    return 'generic';
  }

  /**
   * Fill Yotspot application form
   */
  async fillYotspotForm(jobData, customMessage) {
    logger.info('Filling Yotspot application form...');

    const fields = {
      'input[name="first_name"], input[id="firstName"], input[placeholder*="First" i]': this.profile.firstName,
      'input[name="last_name"], input[id="lastName"], input[placeholder*="Last" i]': this.profile.lastName,
      'input[name="email"], input[type="email"], input[id="email"]': this.profile.email,
      'input[name="phone"], input[type="tel"], input[id="phone"]': this.profile.phone,
      'input[name="nationality"], select[name="nationality"], input[id="nationality"]': this.profile.nationality,
      'textarea[name="message"], textarea[name="cover_letter"], textarea[id="message"]': customMessage || this.generateCoverLetter(jobData),
      'textarea[name="experience"], textarea[id="experience"]': this.formatExperience()
    };

    // Fill text inputs
    for (const [selector, value] of Object.entries(fields)) {
      if (value) {
        await this.fillField(selector, value);
      }
    }

    // Handle file uploads
    if (this.profile.cvPath) {
      await this.uploadFile('input[type="file"][name*="cv" i], input[type="file"][name*="resume" i]', this.profile.cvPath);
    }

    if (this.profile.certificates.length > 0) {
      await this.uploadFile('input[type="file"][name*="certificate" i]', this.profile.certificates[0]);
    }

    // Submit form
    return await this.submitForm('button[type="submit"], .apply-btn, input[type="submit"]');
  }

  /**
   * Fill YaCrew application form
   */
  async fillYaCrewForm(jobData, customMessage) {
    logger.info('Filling YaCrew application form...');

    const fields = {
      'input[name="firstName"], input[id="first-name"]': this.profile.firstName,
      'input[name="lastName"], input[id="last-name"]': this.profile.lastName,
      'input[name="email"], input[type="email"]': this.profile.email,
      'input[name="phone"], input[type="tel"]': this.profile.phone,
      'input[name="currentPosition"], input[id="position"]': this.profile.currentPosition,
      'select[name="yearsExperience"], input[name="experience"]': this.profile.yearsExperience,
      'textarea[name="coverLetter"], textarea[name="message"]': customMessage || this.generateCoverLetter(jobData),
      'textarea[name="availability"], input[name="availableFrom"]': this.profile.availableFrom
    };

    // Fill text inputs
    for (const [selector, value] of Object.entries(fields)) {
      if (value) {
        await this.fillField(selector, value);
      }
    }

    // Select checkboxes for skills/certifications
    await this.selectCheckboxes(this.profile.certifications, 'certification');
    await this.selectCheckboxes(this.profile.languages, 'language');

    // Handle file uploads
    if (this.profile.cvPath) {
      await this.uploadFile('input[type="file"][accept*=".pdf"], input[name*="cv"]', this.profile.cvPath);
    }

    // Submit form
    return await this.submitForm('button[type="submit"], .submit-application, .btn-apply');
  }

  /**
   * Fill generic application form
   */
  async fillGenericForm(jobData, customMessage) {
    logger.info('Filling generic application form...');

    // Detect and fill common fields
    const fieldMappings = [
      { patterns: ['first name', 'firstname', 'first_name'], value: this.profile.firstName },
      { patterns: ['last name', 'lastname', 'last_name', 'surname'], value: this.profile.lastName },
      { patterns: ['email', 'e-mail'], value: this.profile.email },
      { patterns: ['phone', 'telephone', 'mobile', 'cell'], value: this.profile.phone },
      { patterns: ['address'], value: this.profile.address },
      { patterns: ['city'], value: this.profile.city },
      { patterns: ['country'], value: this.profile.country },
      { patterns: ['nationality'], value: this.profile.nationality },
      { patterns: ['position', 'role', 'job title'], value: this.profile.currentPosition },
      { patterns: ['experience', 'years'], value: this.profile.yearsExperience },
      { patterns: ['message', 'cover letter', 'coverletter'], value: customMessage || this.generateCoverLetter(jobData) },
      { patterns: ['salary', 'expectation', 'pay'], value: this.profile.salaryExpectation },
      { patterns: ['available', 'start date', 'commencement'], value: this.profile.availableFrom }
    ];

    for (const mapping of fieldMappings) {
      if (mapping.value) {
        await this.fillFieldByLabel(mapping.patterns, mapping.value);
      }
    }

    // Try to upload CV
    if (this.profile.cvPath) {
      const fileInputs = await this.page.$$('input[type="file"]');
      for (const input of fileInputs) {
        try {
          await input.uploadFile(this.profile.cvPath);
        } catch (e) {
          logger.debug('File upload failed for input:', e.message);
        }
      }
    }

    // Submit form
    return await this.submitForm('button[type="submit"], input[type="submit"], .apply, .submit');
  }

  /**
   * Fill a field by selector
   */
  async fillField(selector, value) {
    try {
      const element = await this.page.$(selector);
      if (element) {
        await element.click({ clickCount: 3 }); // Select all existing text
        await element.type(value.toString(), { delay: 10 });
        logger.debug(`Filled field ${selector}`);
        return true;
      }
    } catch (error) {
      logger.debug(`Could not fill field ${selector}: ${error.message}`);
    }
    return false;
  }

  /**
   * Fill a field by label text
   */
  async fillFieldByLabel(patterns, value) {
    for (const pattern of patterns) {
      // Try by label
      const labelSelector = `label:has-text("${pattern}" i)`;
      const label = await this.page.$(labelSelector);
      
      if (label) {
        const forAttr = await label.evaluate(el => el.getAttribute('for'));
        if (forAttr) {
          await this.fillField(`#${forAttr}`, value);
          return true;
        }
      }

      // Try by placeholder
      const placeholderSelector = `input[placeholder*="${pattern}" i], textarea[placeholder*="${pattern}" i]`;
      if (await this.fillField(placeholderSelector, value)) return true;

      // Try by name
      const nameSelector = `input[name*="${pattern.replace(/\s+/g, '')}" i], textarea[name*="${pattern.replace(/\s+/g, '')}" i]`;
      if (await this.fillField(nameSelector, value)) return true;
    }
    return false;
  }

  /**
   * Upload a file
   */
  async uploadFile(selector, filePath) {
    try {
      const input = await this.page.$(selector);
      if (input) {
        await input.uploadFile(filePath);
        logger.info(`Uploaded file: ${filePath}`);
        return true;
      }
    } catch (error) {
      logger.error(`Failed to upload file ${filePath}:`, error.message);
    }
    return false;
  }

  /**
   * Select checkboxes
   */
  async selectCheckboxes(items, category) {
    for (const item of items) {
      const selectors = [
        `input[type="checkbox"][value="${item}" i]`,
        `input[type="checkbox"][name*="${category}"][value*="${item}" i]`,
        `label:has-text("${item}") input[type="checkbox"]`
      ];

      for (const selector of selectors) {
        try {
          const checkbox = await this.page.$(selector);
          if (checkbox) {
            const isChecked = await checkbox.evaluate(el => el.checked);
            if (!isChecked) {
              await checkbox.click();
              logger.debug(`Selected checkbox: ${item}`);
            }
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }
  }

  /**
   * Submit the form
   */
  async submitForm(selector) {
    try {
      const submitBtn = await this.page.$(selector);
      if (submitBtn) {
        // Take screenshot before submission
        await this.takeScreenshot(`before-submit-${Date.now()}.png`);

        await submitBtn.click();
        
        // Wait for navigation or success message
        await this.page.waitForTimeout(3000);

        // Check for success indicators
        const successSelectors = [
          '.success-message',
          '.alert-success',
          '[data-success="true"]',
          'text/Success',
          'text/Application submitted',
          'text/Thank you'
        ];

        for (const successSel of successSelectors) {
          const element = await this.page.$(successSel);
          if (element) {
            logger.info('Form submitted successfully');
            return { success: true, message: 'Application submitted' };
          }
        }

        // Check if still on same page (possible error)
        const errorSelectors = [
          '.error-message',
          '.alert-error',
          '.field-error',
          'text/Error',
          'text/Required'
        ];

        for (const errorSel of errorSelectors) {
          const element = await this.page.$(errorSel);
          if (element) {
            const errorText = await element.evaluate(el => el.textContent);
            logger.error(`Form submission error: ${errorText}`);
            return { success: false, error: errorText };
          }
        }

        return { success: true, message: 'Form likely submitted' };
      }

      return { success: false, error: 'Submit button not found' };
    } catch (error) {
      logger.error('Error submitting form:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate cover letter from template
   */
  generateCoverLetter(jobData) {
    if (this.profile.coverLetter) {
      return this.profile.coverLetter
        .replace(/{{position}}/g, jobData.position || jobData.title || 'the position')
        .replace(/{{vessel}}/g, jobData.vessel?.name || 'your vessel')
        .replace(/{{company}}/g, jobData.companyName || 'your company')
        .replace(/{{name}}/g, `${this.profile.firstName} ${this.profile.lastName}`);
    }

    // Default template
    return `Dear Hiring Manager,

I am writing to express my interest in the ${jobData.position || jobData.title || 'position'} role${jobData.vessel?.name ? ` on ${jobData.vessel.name}` : ''}.

With ${this.profile.yearsExperience || 'several'} years of experience in the yachting industry${this.profile.currentPosition ? ` as a ${this.profile.currentPosition}` : ''}, I am confident in my ability to contribute effectively to your team.

${this.profile.certifications.length > 0 ? `I hold the following certifications: ${this.profile.certifications.join(', ')}.` : ''}

I am available ${this.profile.availableFrom || 'immediately'} and would welcome the opportunity to discuss how I can add value to your crew.

Thank you for considering my application.

Best regards,
${this.profile.firstName} ${this.profile.lastName}`;
  }

  /**
   * Format experience for forms
   */
  formatExperience() {
    const lines = [
      `Current Position: ${this.profile.currentPosition}`,
      `Years of Experience: ${this.profile.yearsExperience}`,
      ''
    ];

    if (this.profile.certifications.length > 0) {
      lines.push('Certifications:');
      this.profile.certifications.forEach(cert => lines.push(`- ${cert}`));
      lines.push('');
    }

    if (this.profile.languages.length > 0) {
      lines.push('Languages:');
      this.profile.languages.forEach(lang => lines.push(`- ${lang}`));
    }

    return lines.join('\n');
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(filename) {
    try {
      const path = `./data/screenshots/${filename}`;
      await this.page.screenshot({ path, fullPage: true });
      logger.info(`Screenshot saved: ${path}`);
    } catch (error) {
      logger.error('Failed to take screenshot:', error);
    }
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info('Form Auto-Filler closed');
    }
  }
}

/**
 * Batch application processor
 */
export class BatchApplicationProcessor {
  constructor(profile, options = {}) {
    this.formFiller = new FormAutoFiller(profile, options);
    this.results = [];
  }

  /**
   * Process multiple job applications
   */
  async processJobs(jobs, customMessage = '') {
    logger.info(`Processing ${jobs.length} job applications...`);

    await this.formFiller.init();

    for (const [index, job] of jobs.entries()) {
      logger.info(`Processing application ${index + 1}/${jobs.length}: ${job.title}`);

      try {
        const result = await this.formFiller.applyToJob(job.url, job, customMessage);
        this.results.push({
          jobId: job.id,
          jobTitle: job.title,
          url: job.url,
          ...result,
          timestamp: new Date().toISOString()
        });

        // Delay between applications
        await this.formFiller.rateLimiter.delay(5000);

      } catch (error) {
        logger.error(`Failed to apply for ${job.title}:`, error);
        this.results.push({
          jobId: job.id,
          jobTitle: job.title,
          url: job.url,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    await this.formFiller.close();
    return this.results;
  }

  /**
   * Get results summary
   */
  getSummary() {
    const successful = this.results.filter(r => r.success).length;
    return {
      total: this.results.length,
      successful,
      failed: this.results.length - successful,
      results: this.results
    };
  }
}

export default FormAutoFiller;