/**
 * Guide content schema interface
 */
export interface GuideContent {
  title: string;
  description: string;
  author?: string;
  publishDate: Date;
  updateDate?: Date;
  tags?: string[];
  featured?: boolean;
}

/**
 * Content collection types
 */
export type ContentCollectionType = 'guide' | 'resources';

/**
 * Base content item interface
 */
export interface BaseContentItem {
  id: string;
  title: string;
  description: string;
}