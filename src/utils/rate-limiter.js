import logger from './logger.js';

/**
 * Token Bucket Rate Limiter
 * Controls request rate to prevent being blocked
 */
export class RateLimiter {
  constructor(options = {}) {
    this.requestsPerMinute = options.requestsPerMinute || 10;
    this.burstSize = options.burstSize || 3;
    this.cooldownPeriod = options.cooldownPeriod || 60000;
    
    this.tokens = this.burstSize;
    this.lastRefill = Date.now();
    this.queue = [];
    this.processing = false;
    
    // Calculate refill rate (tokens per ms)
    this.refillRate = this.requestsPerMinute / 60000;
  }

  /**
   * Refill tokens based on time elapsed
   */
  refillTokens() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.burstSize, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Wait for a token to become available
   */
  async acquireToken() {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  /**
   * Process the queue of waiting requests
   */
  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      this.refillTokens();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        const resolve = this.queue.shift();
        resolve();
      } else {
        // Calculate wait time for next token
        const waitTime = Math.ceil((1 - this.tokens) / this.refillRate);
        logger.debug(`Rate limit: waiting ${waitTime}ms for next token`);
        await this.delay(waitTime);
      }
    }

    this.processing = false;
  }

  /**
   * Execute a function with rate limiting
   */
  async execute(fn, ...args) {
    await this.acquireToken();
    try {
      return await fn(...args);
    } catch (error) {
      logger.error('Rate limited function error:', error);
      throw error;
    }
  }

  /**
   * Add delay between requests
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current status
   */
  getStatus() {
    this.refillTokens();
    return {
      tokens: this.tokens,
      queueLength: this.queue.length,
      requestsPerMinute: this.requestsPerMinute
    };
  }
}

/**
 * Simple delay-based rate limiter
 */
export class DelayRateLimiter {
  constructor(delayMs = 2000) {
    this.delayMs = delayMs;
    this.lastRequest = 0;
  }

  async wait() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    
    if (elapsed < this.delayMs) {
      const waitTime = this.delayMs - elapsed;
      logger.debug(`Delay rate limit: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
  }
}

/**
 * Domain-specific rate limiter
 */
export class DomainRateLimiter {
  constructor(defaultConfig = {}) {
    this.limiters = new Map();
    this.defaultConfig = defaultConfig;
  }

  getLimiter(domain) {
    if (!this.limiters.has(domain)) {
      this.limiters.set(domain, new RateLimiter(this.defaultConfig));
    }
    return this.limiters.get(domain);
  }

  async executeForDomain(domain, fn, ...args) {
    const limiter = this.getLimiter(domain);
    return limiter.execute(fn, ...args);
  }
}

export default RateLimiter;