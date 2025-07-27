/**
 * Tests for Amazon Link Validator Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AmazonLinkValidator } from '../amazon-link-validator.js';

describe('AmazonLinkValidator', () => {
  let validator: AmazonLinkValidator;

  beforeEach(() => {
    validator = new AmazonLinkValidator();
  });

  describe('extractAsinFromUrl', () => {
    it('should extract ASIN from standard Amazon URLs', () => {
      const testCases = [
        {
          url: 'https://amazon.com/dp/B08N5WRWNW',
          expected: 'B08N5WRWNW'
        },
        {
          url: 'https://www.amazon.com/gp/product/1234567890',
          expected: '1234567890'
        },
        {
          url: 'https://amazon.co.uk/product/B08N5WRWNW?ref=sr_1_1',
          expected: 'B08N5WRWNW'
        },
        {
          url: 'https://amazon.com/some-book-title/dp/1234567890/ref=sr_1_1',
          expected: '1234567890'
        }
      ];

      testCases.forEach(({ url, expected }) => {
        expect(validator.extractAsinFromUrl(url)).toBe(expected);
      });
    });

    it('should extract ASIN from query parameters', () => {
      const url = 'https://amazon.com/s?asin=B08N5WRWNW&keywords=test';
      expect(validator.extractAsinFromUrl(url)).toBe('B08N5WRWNW');
    });

    it('should extract ASIN from Kindle URLs', () => {
      const url = 'https://amazon.com/kindle/dp/B08N5WRWNW';
      expect(validator.extractAsinFromUrl(url)).toBe('B08N5WRWNW');
    });

    it('should return null for URLs without ASIN', () => {
      const invalidUrls = [
        'https://amazon.com',
        'https://google.com',
        'https://amazon.com/search?keywords=test',
        'invalid-url'
      ];

      invalidUrls.forEach(url => {
        expect(validator.extractAsinFromUrl(url)).toBeNull();
      });
    });
  });

  describe('extractIsbnFromText', () => {
    it('should extract ISBN-13 from text', () => {
      const testCases = [
        'ISBN-13: 978-0-123456-78-9',
        'ISBN: 9780123456789',
        '9780123456789',
        'The book ISBN is 978-0-123456-78-9 and it is great'
      ];

      testCases.forEach(text => {
        const result = validator.extractIsbnFromText(text);
        expect(result).toBe('9780123456789');
      });
    });

    it('should extract ISBN-10 from text', () => {
      const testCases = [
        'ISBN-10: 0-123456-78-X',
        'ISBN: 012345678X',
        '012345678X',
        'The book ISBN is 0-123456-78-X and it is great'
      ];

      testCases.forEach(text => {
        const result = validator.extractIsbnFromText(text);
        expect(result).toBe('012345678X');
      });
    });

    it('should return null for text without valid ISBN', () => {
      const invalidTexts = [
        'No ISBN here',
        '123456789', // too short
        '12345678901234', // too long
        'ISBN: invalid'
      ];

      invalidTexts.forEach(text => {
        expect(validator.extractIsbnFromText(text)).toBeNull();
      });
    });
  });

  describe('validateIsbn', () => {
    it('should validate correct ISBN-10', () => {
      const validIsbn10s = [
        '0306406152',
        '0-306-40615-2',
        '030640615X',
        '0-306-40615-X'
      ];

      validIsbn10s.forEach(isbn => {
        expect(validator.validateIsbn(isbn)).toBe(true);
      });
    });

    it('should validate correct ISBN-13', () => {
      const validIsbn13s = [
        '9780306406157',
        '978-0-306-40615-7',
        '9783161484100',
        '978-3-16-148410-0'
      ];

      validIsbn13s.forEach(isbn => {
        expect(validator.validateIsbn(isbn)).toBe(true);
      });
    });

    it('should reject invalid ISBNs', () => {
      const invalidIsbns = [
        '1234567890', // wrong check digit
        '123456789X', // wrong check digit
        '9780306406158', // wrong check digit
        '12345', // too short
        '123456789012345', // too long
        'abcdefghij', // non-numeric
        ''
      ];

      invalidIsbns.forEach(isbn => {
        expect(validator.validateIsbn(isbn)).toBe(false);
      });
    });
  });

  describe('isAmazonUrl', () => {
    it('should identify Amazon URLs correctly', () => {
      const amazonUrls = [
        'https://amazon.com/dp/B08N5WRWNW',
        'https://www.amazon.co.uk/product/123',
        'https://amazon.de/gp/product/456',
        'https://amzn.to/3abc123',
        'https://a.co/d/abc123'
      ];

      amazonUrls.forEach(url => {
        expect(validator.isAmazonUrl(url)).toBe(true);
      });
    });

    it('should reject non-Amazon URLs', () => {
      const nonAmazonUrls = [
        'https://google.com',
        'https://goodreads.com/book/123',
        'https://barnes-noble.com/product/123',
        'https://example.com'
      ];

      nonAmazonUrls.forEach(url => {
        expect(validator.isAmazonUrl(url)).toBe(false);
      });
    });
  });

  describe('normalizeAmazonUrl', () => {
    it('should normalize Amazon URLs to clean format', () => {
      const testCases = [
        {
          input: 'https://amazon.com/some-long-title/dp/B08N5WRWNW/ref=sr_1_1?keywords=test&tag=affiliate',
          expected: 'https://amazon.com/dp/B08N5WRWNW'
        },
        {
          input: 'https://www.amazon.co.uk/gp/product/1234567890?ref=nav_signin',
          expected: 'https://www.amazon.co.uk/dp/1234567890'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(validator.normalizeAmazonUrl(input)).toBe(expected);
      });
    });

    it('should return original URL if ASIN cannot be extracted', () => {
      const url = 'https://amazon.com/search?keywords=test';
      expect(validator.normalizeAmazonUrl(url)).toBe(url);
    });
  });

  describe('attemptUrlRepair', () => {
    it('should repair URLs with extractable ASIN', () => {
      const brokenUrl = 'https://amazon.com/broken-link/dp/B08N5WRWNW/broken-ref';
      const result = validator.attemptUrlRepair(brokenUrl);
      expect(result).toBe('https://amazon.com/dp/B08N5WRWNW');
    });

    it('should return undefined for unrepairable URLs', () => {
      const brokenUrl = 'https://amazon.com/completely-broken-url';
      const result = validator.attemptUrlRepair(brokenUrl);
      expect(result).toBeUndefined();
    });
  });
});
