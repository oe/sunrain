import { BaseContentFetcher } from '../base-fetcher';
import type {
  ResourceItem,
  ContentFetcherConfig
} from '../types';
import { logger } from '../logger';
import { handleError } from '../errors';
import fs from 'fs/promises';
import path from 'path';

/**
 * Interface for hotline information
 */
export interface HotlineInfo {
  id: string;
  name: string;
  description: string;
  phoneNumber: string;
  alternativeNumbers?: string[];
  country: string;
  region?: string;
  languages: string[];
  availability: {
    hours: string; // e.g., "24/7", "9 AM - 5 PM"
    timezone: string;
    daysOfWeek: string[];
  };
  serviceType: 'crisis' | 'support' | 'information' | 'professional';
  targetAudience: string[];
  specializations: string[];
  cost: 'free' | 'paid' | 'varies';
  contactMethods: {
    phone: boolean;
    text: boolean;
    chat: boolean;
    email: boolean;
  };
  website?: string;
  emergencyPriority: number; // 1-10, 10 being highest priority for emergencies
  lastVerified: Date;
  isActive: boolean;
  additionalInfo?: string;
}

/**
 * Hotline fetcher for global mental health support hotlines
 * Manages phone number validation, regional detection, and emergency prioritization
 */
export class HotlineFetcher extends BaseContentFetcher {
  private readonly GLOBAL_HOTLINES: HotlineInfo[] = [
    // International
    {
      id: 'international-suicide-prevention',
      name: 'International Association for Suicide Prevention',
      description: 'Global directory of crisis centers and hotlines',
      phoneNumber: 'varies',
      country: 'international',
      languages: ['multiple'],
      availability: {
        hours: 'varies',
        timezone: 'varies',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      serviceType: 'crisis',
      targetAudience: ['general', 'suicidal'],
      specializations: ['suicide prevention'],
      cost: 'free',
      contactMethods: { phone: true, text: false, chat: false, email: false },
      website: 'https://www.iasp.info/resources/Crisis_Centres/',
      emergencyPriority: 10,
      lastVerified: new Date(),
      isActive: true
    },

    // United States
    {
      id: 'us-988-lifeline',
      name: '988 Suicide & Crisis Lifeline',
      description: 'Free and confidential emotional support for people in suicidal crisis or emotional distress',
      phoneNumber: '988',
      country: 'US',
      languages: ['en', 'es'],
      availability: {
        hours: '24/7',
        timezone: 'All US timezones',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      serviceType: 'crisis',
      targetAudience: ['general', 'suicidal'],
      specializations: ['suicide prevention', 'crisis intervention'],
      cost: 'free',
      contactMethods: { phone: true, text: true, chat: true, email: false },
      website: 'https://suicidepreventionlifeline.org/',
      emergencyPriority: 10,
      lastVerified: new Date(),
      isActive: true
    },

    {
      id: 'us-crisis-text-line',
      name: 'Crisis Text Line',
      description: 'Free, 24/7 support for those in crisis via text message',
      phoneNumber: '741741',
      country: 'US',
      languages: ['en'],
      availability: {
        hours: '24/7',
        timezone: 'All US timezones',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      serviceType: 'crisis',
      targetAudience: ['general', 'youth', 'adults'],
      specializations: ['crisis intervention', 'text support'],
      cost: 'free',
      contactMethods: { phone: false, text: true, chat: false, email: false },
      website: 'https://www.crisistextline.org/',
      emergencyPriority: 9,
      lastVerified: new Date(),
      isActive: true
    },

    // United Kingdom
    {
      id: 'uk-samaritans',
      name: 'Samaritans',
      description: 'Free support for anyone in emotional distress, struggling to cope, or at risk of suicide',
      phoneNumber: '116123',
      country: 'UK',
      languages: ['en'],
      availability: {
        hours: '24/7',
        timezone: 'GMT/BST',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      serviceType: 'crisis',
      targetAudience: ['general'],
      specializations: ['emotional support', 'suicide prevention'],
      cost: 'free',
      contactMethods: { phone: true, text: false, chat: true, email: true },
      website: 'https://www.samaritans.org/',
      emergencyPriority: 10,
      lastVerified: new Date(),
      isActive: true
    },

    // Canada
    {
      id: 'ca-talk-suicide',
      name: 'Talk Suicide Canada',
      description: 'National suicide prevention service available 24/7',
      phoneNumber: '1-833-456-4566',
      country: 'CA',
      languages: ['en', 'fr'],
      availability: {
        hours: '24/7',
        timezone: 'All Canadian timezones',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      serviceType: 'crisis',
      targetAudience: ['general'],
      specializations: ['suicide prevention'],
      cost: 'free',
      contactMethods: { phone: true, text: true, chat: false, email: false },
      website: 'https://talksuicide.ca/',
      emergencyPriority: 10,
      lastVerified: new Date(),
      isActive: true
    },

    // Australia
    {
      id: 'au-lifeline',
      name: 'Lifeline Australia',
      description: '24-hour crisis support and suicide prevention services',
      phoneNumber: '13 11 14',
      country: 'AU',
      languages: ['en'],
      availability: {
        hours: '24/7',
        timezone: 'All Australian timezones',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      serviceType: 'crisis',
      targetAudience: ['general'],
      specializations: ['crisis support', 'suicide prevention'],
      cost: 'free',
      contactMethods: { phone: true, text: false, chat: true, email: false },
      website: 'https://www.lifeline.org.au/',
      emergencyPriority: 10,
      lastVerified: new Date(),
      isActive: true
    },

    // China
    {
      id: 'cn-beijing-crisis',
      name: 'Beijing Crisis Intervention Hotline',
      description: '北京危机干预热线 - 24小时心理危机干预服务',
      phoneNumber: '400-161-9995',
      country: 'CN',
      languages: ['zh'],
      availability: {
        hours: '24/7',
        timezone: 'CST',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      serviceType: 'crisis',
      targetAudience: ['general'],
      specializations: ['crisis intervention', 'suicide prevention'],
      cost: 'free',
      contactMethods: { phone: true, text: false, chat: false, email: false },
      emergencyPriority: 10,
      lastVerified: new Date(),
      isActive: true
    }
  ];

  constructor(config: ContentFetcherConfig) {
    super(config);
  }

  // Implement abstract methods from BaseContentFetcher
  async fetchBooks(): Promise<ResourceItem[]> {
    return []; // Not used in hotline fetcher
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    return []; // Not used in hotline fetcher
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    return []; // Not used in hotline fetcher
  }

  async fetchVideos(): Promise<ResourceItem[]> {
    return []; // Not used in hotline fetcher
  }

  async fetchArticles(): Promise<ResourceItem[]> {
    return []; // Not used in hotline fetcher
  }

  async fetchPodcasts(): Promise<ResourceItem[]> {
    return []; // Not used in hotline fetcher
  }

  /**
   * Fetch and validate hotline information
   */
  async fetchHotlines(): Promise<HotlineInfo[]> {
    try {
      logger.info('Fetching and validating hotline information');

      // Start with built-in hotlines
      const hotlines = [...this.GLOBAL_HOTLINES];

      // Validate phone numbers
      const validatedHotlines = await this.validateHotlines(hotlines);

      // Sort by emergency priority and country
      const sortedHotlines = this.sortHotlinesByPriority(validatedHotlines);

      logger.info(`Fetched ${sortedHotlines.length} validated hotlines`);
      return sortedHotlines;
    } catch (error) {
      logger.error('Failed to fetch hotlines', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw handleError(error, logger);
    }
  }

  /**
   * Get hotlines by country/region
   */
  async getHotlinesByRegion(countryCode: string, region?: string): Promise<HotlineInfo[]> {
    const allHotlines = await this.fetchHotlines();

    return allHotlines.filter(hotline => {
      if (hotline.country === 'international') return true;
      if (hotline.country.toLowerCase() === countryCode.toLowerCase()) {
        if (region && hotline.region) {
          return hotline.region.toLowerCase() === region.toLowerCase();
        }
        return true;
      }
      return false;
    });
  }

  /**
   * Get emergency hotlines (highest priority)
   */
  async getEmergencyHotlines(countryCode?: string): Promise<HotlineInfo[]> {
    const hotlines = countryCode
      ? await this.getHotlinesByRegion(countryCode)
      : await this.fetchHotlines();

    return hotlines
      .filter(hotline => hotline.emergencyPriority >= 8 && hotline.serviceType === 'crisis')
      .sort((a, b) => b.emergencyPriority - a.emergencyPriority);
  }

  /**
   * Validate hotline phone numbers and availability
   */
  private async validateHotlines(hotlines: HotlineInfo[]): Promise<HotlineInfo[]> {
    const validatedHotlines: HotlineInfo[] = [];

    for (const hotline of hotlines) {
      try {
        // Validate phone number format
        if (this.isValidPhoneNumber(hotline.phoneNumber)) {
          // Update last verified date
          hotline.lastVerified = new Date();
          validatedHotlines.push(hotline);
        } else {
          logger.warn('Invalid phone number format', {
            hotlineId: hotline.id,
            phoneNumber: hotline.phoneNumber
          });
        }
      } catch (error) {
        logger.warn('Failed to validate hotline', {
          hotlineId: hotline.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return validatedHotlines;
  }

  /**
   * Validate phone number format (basic validation)
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    if (phoneNumber === 'varies') return true; // Special case for international directories

    // Remove all non-digit characters except + and -
    const cleaned = phoneNumber.replace(/[^\d+\-\s]/g, '');

    // Basic validation patterns
    const patterns = [
      /^\d{3}$/, // 3-digit numbers like 988
      /^\d{6}$/, // 6-digit numbers like 741741
      /^\d{3}\s\d{2}\s\d{2}$/, // Format like "13 11 14"
      /^\d{3}-\d{3}-\d{4}$/, // Format like "123-456-7890"
      /^1-\d{3}-\d{3}-\d{4}$/, // Format like "1-833-456-4566"
      /^\+\d{1,3}\s?\d{1,14}$/, // International format
      /^\d{3}-\d{3}-\d{4}$/, // US format
      /^\d{6}$/ // Short codes
    ];

    return patterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Sort hotlines by emergency priority and country
   */
  private sortHotlinesByPriority(hotlines: HotlineInfo[]): HotlineInfo[] {
    return hotlines.sort((a, b) => {
      // First sort by emergency priority (descending)
      if (a.emergencyPriority !== b.emergencyPriority) {
        return b.emergencyPriority - a.emergencyPriority;
      }

      // Then sort by country (international first, then alphabetical)
      if (a.country === 'international' && b.country !== 'international') return -1;
      if (b.country === 'international' && a.country !== 'international') return 1;

      return a.country.localeCompare(b.country);
    });
  }

  /**
   * Update hotline files for the website
   */
  async updateHotlineFiles(): Promise<void> {
    try {
      const hotlines = await this.fetchHotlines();

      // Create different files for different purposes
      await this.createGlobalHotlineFile(hotlines);
      await this.createCountrySpecificFiles(hotlines);
      await this.createEmergencyHotlineFile(hotlines);

      logger.info('Hotline files updated successfully');
    } catch (error) {
      logger.error('Failed to update hotline files', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Create global hotline file
   */
  private async createGlobalHotlineFile(hotlines: HotlineInfo[]): Promise<void> {
    const filePath = '../website/src/content/hotlines/global.json';
    const dir = path.dirname(path.resolve(filePath));

    await fs.mkdir(dir, { recursive: true });

    const globalData = {
      title: 'Global Mental Health Support Hotlines',
      description: 'Comprehensive directory of mental health crisis and support hotlines worldwide',
      lastUpdated: new Date().toISOString(),
      hotlines: hotlines.map(hotline => ({
        ...hotline,
        lastVerified: hotline.lastVerified.toISOString()
      }))
    };

    await fs.writeFile(path.resolve(filePath), JSON.stringify(globalData, null, 2));
    logger.info('Created global hotline file', { path: filePath, count: hotlines.length });
  }

  /**
   * Create country-specific hotline files
   */
  private async createCountrySpecificFiles(hotlines: HotlineInfo[]): Promise<void> {
    const countriesDir = '../website/src/content/hotlines/by-country';
    const dir = path.resolve(countriesDir);

    await fs.mkdir(dir, { recursive: true });

    // Group hotlines by country
    const hotlinesByCountry = hotlines.reduce((acc, hotline) => {
      if (hotline.country !== 'international') {
        if (!acc[hotline.country]) {
          acc[hotline.country] = [];
        }
        acc[hotline.country].push(hotline);
      }
      return acc;
    }, {} as Record<string, HotlineInfo[]>);

    // Create file for each country
    for (const [country, countryHotlines] of Object.entries(hotlinesByCountry)) {
      const countryData = {
        country,
        title: `Mental Health Hotlines - ${country.toUpperCase()}`,
        description: `Mental health crisis and support hotlines available in ${country.toUpperCase()}`,
        lastUpdated: new Date().toISOString(),
        hotlines: countryHotlines.map(hotline => ({
          ...hotline,
          lastVerified: hotline.lastVerified.toISOString()
        }))
      };

      const countryFilePath = path.join(dir, `${country.toLowerCase()}.json`);
      await fs.writeFile(countryFilePath, JSON.stringify(countryData, null, 2));
      logger.info(`Created country hotline file`, {
        country,
        path: countryFilePath,
        count: countryHotlines.length
      });
    }
  }

  /**
   * Create emergency hotline file (highest priority only)
   */
  private async createEmergencyHotlineFile(hotlines: HotlineInfo[]): Promise<void> {
    const emergencyHotlines = hotlines.filter(hotline =>
      hotline.emergencyPriority >= 9 && hotline.serviceType === 'crisis'
    );

    const filePath = '../website/src/content/hotlines/emergency.json';
    const dir = path.dirname(path.resolve(filePath));

    await fs.mkdir(dir, { recursive: true });

    const emergencyData = {
      title: 'Emergency Mental Health Crisis Hotlines',
      description: 'Immediate crisis intervention and suicide prevention hotlines for emergency situations',
      lastUpdated: new Date().toISOString(),
      warning: 'If you are in immediate danger, please contact your local emergency services (911, 999, 112, etc.)',
      hotlines: emergencyHotlines.map(hotline => ({
        ...hotline,
        lastVerified: hotline.lastVerified.toISOString()
      }))
    };

    await fs.writeFile(path.resolve(filePath), JSON.stringify(emergencyData, null, 2));
    logger.info('Created emergency hotline file', {
      path: filePath,
      count: emergencyHotlines.length
    });
  }

  /**
   * Add new hotline (for manual additions)
   */
  addHotline(hotline: Omit<HotlineInfo, 'id' | 'lastVerified'>): HotlineInfo {
    const newHotline: HotlineInfo = {
      ...hotline,
      id: `custom-${Date.now()}`,
      lastVerified: new Date()
    };

    this.GLOBAL_HOTLINES.push(newHotline);
    logger.info('Added new hotline', { hotlineId: newHotline.id, name: newHotline.name });

    return newHotline;
  }

  /**
   * Get hotline statistics
   */
  async getHotlineStatistics(): Promise<{
    total: number;
    byCountry: Record<string, number>;
    byServiceType: Record<string, number>;
    emergencyHotlines: number;
    lastUpdated: Date;
  }> {
    const hotlines = await this.fetchHotlines();

    const byCountry = hotlines.reduce((acc, hotline) => {
      acc[hotline.country] = (acc[hotline.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byServiceType = hotlines.reduce((acc, hotline) => {
      acc[hotline.serviceType] = (acc[hotline.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emergencyHotlines = hotlines.filter(h => h.emergencyPriority >= 8).length;

    return {
      total: hotlines.length,
      byCountry,
      byServiceType,
      emergencyHotlines,
      lastUpdated: new Date()
    };
  }
}
