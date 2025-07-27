/**
 * URL生成器工具 - 用于生成带有联盟标签的链接
 */

import { AmazonLinkValidator, AmazonLinkValidationResult } from '../services/amazon-link-validator.js';
import { logger } from '../logger.js';

export interface MonetizationConfig {
  amazon?: {
    affiliateTag: string | { [region: string]: string };
    regions: {
      [key: string]: string;
    };
    apiKey?: string;
    apiSecret?: string;
  };
  spotify?: {
    partnerCode: string;
  };
  appleMusic?: {
    affiliateToken: string;
  };
}

export class URLGenerator {
  private amazonValidator: AmazonLinkValidator;

  constructor(private config: MonetizationConfig) {
    this.amazonValidator = new AmazonLinkValidator(
      this.config.amazon?.apiKey,
      this.config.amazon?.apiSecret
    );
  }

  /**
   * 生成Amazon联盟链接
   */
  generateAmazonUrl(isbn: string, region: string = 'us'): string {
    // Validate and normalize the ISBN/ASIN first
    const normalizedId = this.amazonValidator.validateIsbn(isbn) ? isbn : isbn;

    if (!this.config.amazon) {
      return this.generateFallbackAmazonUrl(normalizedId, region);
    }

    const domain = this.config.amazon.regions[region] || this.config.amazon.regions.us || 'amazon.com';
    const affiliateTag = this.getRegionSpecificAffiliateTag(region);

    if (!affiliateTag) {
      // 如果没有联盟标签，返回普通链接
      logger.debug('No affiliate tag configured, generating non-affiliate URL', { region });
      return `https://${domain}/dp/${normalizedId}`;
    }

    // 生成带联盟标签的链接
    const affiliateUrl = `https://${domain}/dp/${normalizedId}?tag=${affiliateTag}`;

    // Validate affiliate tag format for the region
    if (!this.validateAffiliateTagFormat(affiliateTag, region)) {
      logger.warn('Invalid affiliate tag format for region, falling back to non-affiliate URL', {
        affiliateTag,
        region
      });
      return `https://${domain}/dp/${normalizedId}`;
    }

    return affiliateUrl;
  }

  /**
   * 生成Amazon联盟链接 (别名方法，用于向后兼容)
   * Enhanced with region-specific affiliate tag handling and validation
   */
  generateAmazonUrlFromISBN(isbn: string, region: string = 'us'): string {
    try {
      // Validate ISBN first
      if (!this.amazonValidator.validateIsbn(isbn)) {
        logger.warn('Invalid ISBN provided for Amazon URL generation', { isbn });
        // Still generate URL but log the warning
      }

      const url = this.generateAmazonUrl(isbn, region);

      // Validate the generated affiliate link if possible
      if (this.config.amazon?.affiliateTag && url.includes('tag=')) {
        logger.debug('Generated Amazon affiliate URL', { isbn, region, url });
      }

      return url;
    } catch (error) {
      logger.error('Failed to generate Amazon URL from ISBN', { isbn, region, error: error.message });
      // Fallback to basic URL without affiliate tag
      return this.generateFallbackAmazonUrl(isbn, region);
    }
  }

  /**
   * 生成Spotify链接（如果有合作伙伴代码）
   */
  generateSpotifyUrl(spotifyId: string, type: 'playlist' | 'album' | 'track' = 'playlist'): string {
    const baseUrl = `https://open.spotify.com/${type}/${spotifyId}`;

    if (this.config.spotify?.partnerCode) {
      return `${baseUrl}?si=${this.config.spotify.partnerCode}`;
    }

    return baseUrl;
  }

  /**
   * 生成Apple Music联盟链接
   */
  generateAppleMusicUrl(appleMusicId: string, type: 'playlist' | 'album' | 'song' = 'playlist'): string {
    const baseUrl = `https://music.apple.com/us/${type}/${appleMusicId}`;

    if (this.config.appleMusic?.affiliateToken) {
      return `${baseUrl}?at=${this.config.appleMusic.affiliateToken}`;
    }

    return baseUrl;
  }

  /**
   * 从现有Amazon URL中提取ASIN/ISBN
   */
  extractAsinFromAmazonUrl(url: string): string | null {
    return this.amazonValidator.extractAsinFromUrl(url);
  }

  /**
   * 修复现有的Amazon链接，添加联盟标签
   */
  fixAmazonUrl(originalUrl: string, region: string = 'us'): string {
    const asin = this.extractAsinFromAmazonUrl(originalUrl);
    if (asin) {
      return this.generateAmazonUrl(asin, region);
    }

    // 如果无法提取ASIN，尝试在原URL上添加联盟标签
    if (this.config.amazon?.affiliateTag && !originalUrl.includes('tag=')) {
      const separator = originalUrl.includes('?') ? '&' : '?';
      return `${originalUrl}${separator}tag=${this.config.amazon.affiliateTag}`;
    }

    return originalUrl;
  }

  /**
   * 验证Amazon URL是否有效
   */
  async validateAmazonUrl(url: string): Promise<AmazonLinkValidationResult> {
    return await this.amazonValidator.validateUrl(url);
  }

  /**
   * 批量验证Amazon URLs
   */
  async batchValidateAmazonUrls(urls: string[]): Promise<AmazonLinkValidationResult[]> {
    return await this.amazonValidator.batchValidate(urls);
  }

  /**
   * 尝试修复损坏的Amazon URL
   */
  async repairAmazonUrl(brokenUrl: string, region: string = 'us'): Promise<string> {
    try {
      // First try to validate the current URL
      const validationResult = await this.validateAmazonUrl(brokenUrl);

      if (validationResult.isValid) {
        // URL is valid, just add affiliate tag if missing
        return this.fixAmazonUrl(brokenUrl, region);
      }

      // If URL is broken, try to repair it
      const repairedUrl = this.amazonValidator.attemptUrlRepair(brokenUrl);
      if (repairedUrl) {
        // Add affiliate tag to the repaired URL
        return this.fixAmazonUrl(repairedUrl, region);
      }

      // If repair failed, return the original URL
      logger.warn('Failed to repair Amazon URL', { brokenUrl });
      return brokenUrl;
    } catch (error) {
      logger.error('Error repairing Amazon URL', { brokenUrl, error: error.message });
      return brokenUrl;
    }
  }

  /**
   * 检查URL是否为Amazon URL
   */
  isAmazonUrl(url: string): boolean {
    return this.amazonValidator.isAmazonUrl(url);
  }

  /**
   * 标准化Amazon URL（移除跟踪参数等）
   */
  normalizeAmazonUrl(url: string): string {
    return this.amazonValidator.normalizeAmazonUrl(url);
  }

  /**
   * Get region-specific affiliate tag
   * Supports different affiliate tags for different regions
   */
  private getRegionSpecificAffiliateTag(region: string): string | undefined {
    if (!this.config.amazon?.affiliateTag) {
      return undefined;
    }

    // If the affiliate tag is an object with region-specific tags
    if (typeof this.config.amazon.affiliateTag === 'object') {
      return this.config.amazon.affiliateTag[region] || this.config.amazon.affiliateTag['us'];
    }

    // If it's a single string, use it for all regions
    return this.config.amazon.affiliateTag;
  }

  /**
   * Validate affiliate tag format for specific region
   * Different Amazon regions have different affiliate tag formats
   */
  private validateAffiliateTagFormat(affiliateTag: string, region: string): boolean {
    if (!affiliateTag) return false;

    const regionFormats = {
      us: /^[a-zA-Z0-9\-]{1,20}$/,        // US: alphanumeric and hyphens, max 20 chars
      uk: /^[a-zA-Z0-9\-]{1,20}$/,        // UK: similar to US
      de: /^[a-zA-Z0-9\-]{1,20}$/,        // DE: similar to US
      jp: /^[a-zA-Z0-9\-]{1,20}$/,        // JP: similar to US
      ca: /^[a-zA-Z0-9\-]{1,20}$/,        // CA: similar to US
      fr: /^[a-zA-Z0-9\-]{1,20}$/,        // FR: similar to US
      it: /^[a-zA-Z0-9\-]{1,20}$/,        // IT: similar to US
      es: /^[a-zA-Z0-9\-]{1,20}$/         // ES: similar to US
    };

    const format = regionFormats[region] || regionFormats.us;
    return format.test(affiliateTag);
  }

  /**
   * Generate fallback Amazon URL without affiliate tag
   */
  private generateFallbackAmazonUrl(isbn: string, region: string = 'us'): string {
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
    return `https://${domain}/dp/${isbn}`;
  }

  /**
   * Validate affiliate link by making a test request
   */
  async validateAffiliateLink(url: string): Promise<boolean> {
    try {
      const result = await this.validateAmazonUrl(url);
      return result.isValid;
    } catch (error) {
      logger.warn('Failed to validate affiliate link', { url, error: error.message });
      return false;
    }
  }

  /**
   * Generate Amazon URL with affiliate link validation and fallback
   * This method tries to generate an affiliate link and falls back to non-affiliate if it fails
   */
  async generateValidatedAmazonUrl(isbn: string, region: string = 'us'): Promise<string> {
    try {
      // First try to generate affiliate URL
      const affiliateUrl = this.generateAmazonUrl(isbn, region);

      // If it contains affiliate tag, validate it
      if (affiliateUrl.includes('tag=')) {
        const isValid = await this.validateAffiliateLink(affiliateUrl);

        if (isValid) {
          logger.debug('Generated and validated affiliate URL', { isbn, region, url: affiliateUrl });
          return affiliateUrl;
        } else {
          logger.warn('Affiliate URL validation failed, falling back to non-affiliate', {
            isbn,
            region,
            affiliateUrl
          });
          return this.generateFallbackAmazonUrl(isbn, region);
        }
      }

      // If no affiliate tag, return as-is
      return affiliateUrl;
    } catch (error) {
      logger.error('Failed to generate validated Amazon URL', { isbn, region, error: error.message });
      return this.generateFallbackAmazonUrl(isbn, region);
    }
  }

  /**
   * 生成Goodreads链接（无盈利，但提供更好的用户体验）
   */
  generateGoodreadsUrl(title: string, author?: string): string {
    if (author) {
      const searchQuery = encodeURIComponent(`${title} ${author}`);
      return `https://www.goodreads.com/search?q=${searchQuery}`;
    }
    const searchQuery = encodeURIComponent(title);
    return `https://www.goodreads.com/search?q=${searchQuery}`;
  }

  /**
   * 验证ISBN格式
   */
  validateISBN(isbn: string): boolean {
    return this.amazonValidator.validateIsbn(isbn);
  }

  /**
   * 标准化ISBN格式
   */
  normalizeISBN(isbn: string): string {
    return isbn.replace(/[-\s]/g, '');
  }

  /**
   * 生成多平台链接对象
   */
  generateBookLinks(isbn: string, title: string) {
    return {
      amazon: this.generateAmazonUrl(isbn),
      goodreads: this.generateGoodreadsUrl(isbn),
      // 可以添加更多书店链接
      bookDepository: `https://www.bookdepository.com/search?searchTerm=${encodeURIComponent(title)}`,
    };
  }

  /**
   * 生成音乐平台链接
   */
  generateMusicLinks(spotifyId?: string, appleMusicId?: string) {
    const links: any = {};

    if (spotifyId) {
      links.spotify = this.generateSpotifyUrl(spotifyId);
    }

    if (appleMusicId) {
      links.appleMusic = this.generateAppleMusicUrl(appleMusicId);
    }

    return links;
  }
}

/**
 * 默认URL生成器实例
 */
export function createURLGenerator(config: MonetizationConfig): URLGenerator {
  return new URLGenerator(config);
}

/**
 * 验证ISBN格式的独立函数
 */
export function validateISBN(isbn: string): boolean {
  const validator = new AmazonLinkValidator();
  return validator.validateIsbn(isbn);
}

/**
 * 标准化ISBN格式的独立函数
 */
export function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '');
}
