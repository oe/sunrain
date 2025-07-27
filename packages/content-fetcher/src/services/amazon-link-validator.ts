/**
 * Amazon Link Validator Service
 * Handles ASIN/ISBN extraction, URL validation, and link repair
 */

import fetch from 'node-fetch';
import { logger } from '../logger.js';

export interface AmazonLinkValidationResult {
  url: string;
  isValid: boolean;
  statusCode?: number;
  error?: string;
  suggestedFix?: string;
  asin?: string;
  title?: string;
}

export interface AmazonProductInfo {
  asin: string;
  title: string;
  url: string;
  isAvailable: boolean;
}

export class AmazonLinkValidator {
  private readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests

  constructor(
    private readonly amazonApiKey?: string,
    private readonly amazonApiSecret?: string
  ) {}

  /**
   * Extract ASIN/ISBN from various Amazon URL formats
   */
  extractAsinFromUrl(url: string): string | null {
    const patterns = [
      // Standard product URLs
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i,
      // Query parameter formats
      /asin=([A-Z0-9]{10})/i,
      /\/([A-Z0-9]{10})(?:\/|$|\?)/i,
      // Kindle URLs
      /\/kindle\/dp\/([A-Z0-9]{10})/i,
      // Short URLs
      /amzn\.to\/([A-Z0-9]{10})/i,
      // International formats
      /\/([B][A-Z0-9]{9})/i, // Amazon ASINs typically start with B
      /\/([0-9]{9}[0-9X])/i, // ISBN-10 format
      /\/([0-9]{13})/i // ISBN-13 format
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract ISBN from text or URL
   */
  extractIsbnFromText(text: string): string | null {
    const patterns = [
      // ISBN-13 format: 978-0-306-40615-7 (flexible grouping)
      /(?:ISBN[-\s]?13:?\s*)?([0-9]{3}[-\s]?[0-9][-\s]?[0-9]{3}[-\s]?[0-9]{5}[-\s]?[0-9])/i,
      // ISBN-10 format: 0-306-40615-2 (flexible grouping)
      /(?:ISBN[-\s]?10:?\s*)?([0-9][-\s]?[0-9]{3}[-\s]?[0-9]{5}[-\s]?[0-9X])/i,
      // More flexible ISBN-13 patterns
      /(?:ISBN:?\s*)?([0-9]{3}[-\s]?[0-9][-\s]?[0-9]{3}[-\s]?[0-9]{5}[-\s]?[0-9])/i,
      /(?:ISBN:?\s*)?([0-9]{3}[-\s]?[0-9]{1,2}[-\s]?[0-9]{2,6}[-\s]?[0-9]{4,6}[-\s]?[0-9])/i,
      // More flexible ISBN-10 patterns
      /(?:ISBN:?\s*)?([0-9][-\s]?[0-9]{3}[-\s]?[0-9]{5}[-\s]?[0-9X])/i,
      /(?:ISBN:?\s*)?([0-9]{1,2}[-\s]?[0-9]{3,4}[-\s]?[0-9]{4,6}[-\s]?[0-9X])/i,
      // Simple number patterns (13 digits)
      /([0-9]{13})/,
      // Simple number patterns (10 digits with possible X)
      /([0-9]{9}[0-9X])/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const isbn = match[1].replace(/[-\s]/g, '');
        if (this.validateIsbn(isbn)) {
          return isbn;
        }
      }
    }

    return null;
  }

  /**
   * Validate ISBN format (ISBN-10 or ISBN-13)
   */
  validateIsbn(isbn: string): boolean {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');

    if (cleanIsbn.length === 10) {
      return this.validateIsbn10(cleanIsbn);
    } else if (cleanIsbn.length === 13) {
      return this.validateIsbn13(cleanIsbn);
    }

    return false;
  }

  private validateIsbn10(isbn: string): boolean {
    if (!/^[0-9]{9}[0-9X]$/i.test(isbn)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }

    const checkDigit = isbn[9].toUpperCase();
    const calculatedCheck = (11 - (sum % 11)) % 11;

    return (calculatedCheck === 10 && checkDigit === 'X') ||
           (calculatedCheck < 10 && checkDigit === calculatedCheck.toString());
  }

  private validateIsbn13(isbn: string): boolean {
    if (!/^[0-9]{13}$/.test(isbn)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }

    const checkDigit = parseInt(isbn[12]);
    const calculatedCheck = (10 - (sum % 10)) % 10;

    return checkDigit === calculatedCheck;
  }

  /**
   * Validate a single Amazon URL by making an HTTP request
   */
  async validateUrl(url: string): Promise<AmazonLinkValidationResult> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: this.REQUEST_TIMEOUT
      });

      const result: AmazonLinkValidationResult = {
        url,
        isValid: response.ok,
        statusCode: response.status
      };

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`;

        // Try to suggest a fix for common issues
        if (response.status === 404) {
          const asin = this.extractAsinFromUrl(url);
          if (asin) {
            result.asin = asin;
            result.suggestedFix = this.generateCleanAmazonUrl(asin);
          }
        }
      }

      return result;
    } catch (error) {
      logger.warn('Failed to validate Amazon URL', { url, error: error.message });

      return {
        url,
        isValid: false,
        error: error.message,
        suggestedFix: this.attemptUrlRepair(url)
      };
    }
  }

  /**
   * Batch validate multiple URLs with rate limiting
   */
  async batchValidate(urls: string[]): Promise<AmazonLinkValidationResult[]> {
    const results: AmazonLinkValidationResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      logger.info(`Validating Amazon URL ${i + 1}/${urls.length}`, { url });

      try {
        const result = await this.validateUrl(url);
        results.push(result);

        // Rate limiting - wait between requests
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY));
        }
      } catch (error) {
        logger.error('Failed to validate URL in batch', { url, error: error.message });
        results.push({
          url,
          isValid: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Attempt to repair a broken Amazon URL
   */
  attemptUrlRepair(brokenUrl: string): string | undefined {
    const asin = this.extractAsinFromUrl(brokenUrl);
    if (asin) {
      return this.generateCleanAmazonUrl(asin);
    }

    // Try to extract ISBN from the URL or surrounding text
    const isbn = this.extractIsbnFromText(brokenUrl);
    if (isbn) {
      return this.generateCleanAmazonUrl(isbn);
    }

    return undefined;
  }

  /**
   * Generate a clean Amazon URL from ASIN/ISBN
   */
  private generateCleanAmazonUrl(asinOrIsbn: string, region: string = 'us'): string {
    const domains = {
      us: 'amazon.com',
      uk: 'amazon.co.uk',
      de: 'amazon.de',
      jp: 'amazon.co.jp',
      ca: 'amazon.ca',
      fr: 'amazon.fr',
      it: 'amazon.it',
      es: 'amazon.es'
    };

    const domain = domains[region] || domains.us;
    return `https://${domain}/dp/${asinOrIsbn}`;
  }

  /**
   * Check if a URL is an Amazon URL
   */
  isAmazonUrl(url: string): boolean {
    const amazonDomains = [
      'amazon.com',
      'amazon.co.uk',
      'amazon.de',
      'amazon.co.jp',
      'amazon.ca',
      'amazon.fr',
      'amazon.it',
      'amazon.es',
      'amzn.to',
      'a.co'
    ];

    return amazonDomains.some(domain => url.includes(domain));
  }

  /**
   * Extract product information from Amazon page (basic scraping)
   * Note: This is a fallback method when API is not available
   */
  async extractProductInfo(url: string): Promise<AmazonProductInfo | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.USER_AGENT
        },
        timeout: this.REQUEST_TIMEOUT
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const asin = this.extractAsinFromUrl(url);

      if (!asin) {
        return null;
      }

      // Basic title extraction (this is fragile and should be replaced with proper API)
      const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
      const title = titleMatch ? titleMatch[1].replace(/\s*:\s*Amazon\..*$/, '').trim() : 'Unknown Title';

      return {
        asin,
        title,
        url,
        isAvailable: !html.includes('Currently unavailable') && !html.includes('Out of stock')
      };
    } catch (error) {
      logger.warn('Failed to extract product info from Amazon page', { url, error: error.message });
      return null;
    }
  }

  /**
   * Normalize Amazon URL by removing tracking parameters and unnecessary parts
   */
  normalizeAmazonUrl(url: string): string {
    const asin = this.extractAsinFromUrl(url);
    if (!asin) {
      return url;
    }

    // Extract domain from original URL
    const domainMatch = url.match(/https?:\/\/([^\/]+)/);
    const domain = domainMatch ? domainMatch[1] : 'amazon.com';

    return `https://${domain}/dp/${asin}`;
  }
}
