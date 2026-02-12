/**
 * Browser utilities for scraper
 */

/**
 * Wait for element with retry
 */
export async function waitForElement(page, selector, options = {}) {
  const { timeout = 5000, retries = 3 } = options;
  
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (e) {
      if (i === retries - 1) throw e;
      await page.waitForTimeout(1000);
    }
  }
  return false;
}

/**
 * Safe click with retry
 */
export async function safeClick(page, selector, options = {}) {
  const { timeout = 5000, retries = 3 } = options;
  
  for (let i = 0; i < retries; i++) {
    try {
      await page.click(selector, { timeout });
      return true;
    } catch (e) {
      if (i === retries - 1) throw e;
      await page.waitForTimeout(1000);
    }
  }
  return false;
}

/**
 * Scroll to bottom of page
 */
export async function scrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * Get inner text of element
 */
export async function getInnerText(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return null;
    return await element.evaluate(el => el.innerText.trim());
  } catch {
    return null;
  }
}

/**
 * Extract all links from page
 */
export async function extractLinks(page, selector = 'a') {
  return await page.evaluate((sel) => {
    return Array.from(document.querySelectorAll(sel)).map(a => ({
      href: a.href,
      text: a.innerText.trim(),
      title: a.title
    }));
  }, selector);
}

/**
 * Block unnecessary resources
 */
export async function blockResources(page, resourceTypes = ['image', 'stylesheet', 'font']) {
  await page.setRequestInterception(true);
  
  page.on('request', (req) => {
    if (resourceTypes.includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
}

/**
 * Random delay between min and max ms
 */
export function randomDelay(min = 1000, max = 3000) {
  return new Promise(resolve => 
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

/**
 * Retry function with exponential backoff
 */
export async function retry(fn, options = {}) {
  const { retries = 3, delay = 1000, backoff = 2 } = options;
  
  let lastError;
  let currentDelay = delay;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoff;
      }
    }
  }
  
  throw lastError;
}