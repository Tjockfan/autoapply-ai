import axios from 'axios';
import logger from './logger.js';

/**
 * Proxy Rotator for IP rotation
 * Manages a pool of proxies and rotates between them
 */
export class ProxyRotator {
  constructor(options = {}) {
    this.proxies = options.proxies || [];
    this.currentIndex = 0;
    this.rotationInterval = options.rotationInterval || 5;
    this.requestCount = 0;
    this.failedProxies = new Set();
    this.proxyHealth = new Map();
  }

  /**
   * Add proxies to the pool
   */
  addProxies(proxyList) {
    this.proxies.push(...proxyList);
    logger.info(`Added ${proxyList.length} proxies to pool. Total: ${this.proxies.length}`);
  }

  /**
   * Get the next proxy in rotation
   */
  getNextProxy() {
    if (this.proxies.length === 0) {
      return null;
    }

    // Skip failed proxies
    let attempts = 0;
    while (attempts < this.proxies.length) {
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
      
      if (!this.failedProxies.has(proxy)) {
        this.requestCount++;
        return proxy;
      }
      attempts++;
    }

    logger.warn('All proxies marked as failed, resetting failed list');
    this.failedProxies.clear();
    return this.proxies[0];
  }

  /**
   * Get proxy for Puppeteer
   */
  getPuppeteerProxy() {
    const proxy = this.getNextProxy();
    if (!proxy) return null;

    // Parse proxy URL
    try {
      const url = new URL(proxy);
      return {
        server: `${url.protocol}//${url.host}`,
        username: url.username || undefined,
        password: url.password || undefined
      };
    } catch (error) {
      logger.error(`Invalid proxy URL: ${proxy}`);
      return { server: proxy };
    }
  }

  /**
   * Get proxy for axios
   */
  getAxiosProxy() {
    const proxy = this.getNextProxy();
    if (!proxy) return null;

    try {
      const url = new URL(proxy);
      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
        auth: url.username ? {
          username: url.username,
          password: url.password
        } : undefined
      };
    } catch (error) {
      logger.error(`Invalid proxy URL: ${proxy}`);
      return null;
    }
  }

  /**
   * Mark a proxy as failed
   */
  markFailed(proxy) {
    this.failedProxies.add(proxy);
    logger.warn(`Proxy marked as failed: ${proxy}`);
  }

  /**
   * Test a proxy
   */
  async testProxy(proxy, testUrl = 'https://httpbin.org/ip') {
    try {
      const proxyUrl = new URL(proxy);
      const axiosProxy = {
        protocol: proxyUrl.protocol.replace(':', ''),
        host: proxyUrl.hostname,
        port: parseInt(proxyUrl.port) || 80,
        auth: proxyUrl.username ? {
          username: proxyUrl.username,
          password: proxyUrl.password
        } : undefined
      };

      const response = await axios.get(testUrl, {
        proxy: axiosProxy,
        timeout: 10000
      });

      this.proxyHealth.set(proxy, {
        lastTested: Date.now(),
        working: true,
        responseTime: response.duration,
        ip: response.data?.origin
      });

      return true;
    } catch (error) {
      this.proxyHealth.set(proxy, {
        lastTested: Date.now(),
        working: false,
        error: error.message
      });
      this.markFailed(proxy);
      return false;
    }
  }

  /**
   * Test all proxies
   */
  async testAllProxies(testUrl) {
    logger.info('Testing all proxies...');
    const results = await Promise.all(
      this.proxies.map(proxy => this.testProxy(proxy, testUrl))
    );
    
    const working = results.filter(r => r).length;
    logger.info(`Proxy test complete: ${working}/${this.proxies.length} working`);
    
    return working;
  }

  /**
   * Get health status of all proxies
   */
  getHealthStatus() {
    return {
      total: this.proxies.length,
      failed: this.failedProxies.size,
      healthy: this.proxies.length - this.failedProxies.size,
      health: Object.fromEntries(this.proxyHealth)
    };
  }
}

/**
 * Simple proxy manager without rotation
 */
export class ProxyManager {
  constructor(proxyUrl) {
    this.proxyUrl = proxyUrl;
  }

  getPuppeteerArgs() {
    if (!this.proxyUrl) return [];
    return [`--proxy-server=${this.proxyUrl}`];
  }

  getAxiosProxy() {
    if (!this.proxyUrl) return null;
    
    try {
      const url = new URL(this.proxyUrl);
      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: parseInt(url.port) || 80,
        auth: url.username ? {
          username: url.username,
          password: url.password
        } : undefined
      };
    } catch (error) {
      return null;
    }
  }
}

export default ProxyRotator;