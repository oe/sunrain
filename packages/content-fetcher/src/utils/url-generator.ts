/**
 * URL生成器工具 - 用于生成带有联盟标签的链接
 */

export interface MonetizationConfig {
  amazon?: {
    affiliateTag: string;
    regions: {
      [key: string]: string;
    };
  };
  spotify?: {
    partnerCode: string;
  };
  appleMusic?: {
    affiliateToken: string;
  };
}

export class URLGenerator {
  constructor(private config: MonetizationConfig) {}

  /**
   * 生成Amazon联盟链接
   */
  generateAmazonUrl(isbn: string, region: string = 'us'): string {
    if (!this.config.amazon) {
      return `https://amazon.com/dp/${isbn}`;
    }
    
    const domain = this.config.amazon.regions[region] || this.config.amazon.regions.us || 'amazon.com';
    const affiliateTag = this.config.amazon.affiliateTag;
    
    if (!affiliateTag) {
      // 如果没有联盟标签，返回普通链接
      return `https://${domain}/dp/${isbn}`;
    }
    
    // 生成带联盟标签的链接
    return `https://${domain}/dp/${isbn}?tag=${affiliateTag}`;
  }

  /**
   * 生成Amazon联盟链接 (别名方法，用于向后兼容)
   */
  generateAmazonUrlFromISBN(isbn: string, region: string = 'us'): string {
    return this.generateAmazonUrl(isbn, region);
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
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i,
      /asin=([A-Z0-9]{10})/i
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
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
    // 移除连字符和空格
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    // 检查ISBN-10或ISBN-13格式
    return /^(\d{9}[\dX]|\d{13})$/.test(cleanISBN);
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
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  return /^(\d{9}[\dX]|\d{13})$/.test(cleanISBN);
}

/**
 * 标准化ISBN格式的独立函数
 */
export function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '');
}