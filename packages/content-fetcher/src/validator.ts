import { ResourceItem, ContentFetcherConfig } from '@sunrain/shared';
import { ValidationError } from './errors.js';
import { logger } from './logger.js';

export class ContentValidator {
  constructor(private config: ContentFetcherConfig) {}

  validateContent(content: ResourceItem): boolean {
    try {
      this.validateRequiredFields(content);
      this.validateDescriptionLength(content);
      this.validateMentalHealthRelevance(content);
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn(`Content validation failed: ${error.message}`, {
          field: error.field,
          value: error.value,
          contentId: content.id
        });
      }
      return false;
    }
  }

  private validateRequiredFields(content: ResourceItem): void {
    for (const field of this.config.contentValidation.requiredFields) {
      if (!content[field as keyof ResourceItem] || 
          String(content[field as keyof ResourceItem]).trim() === '') {
        throw new ValidationError(
          `Required field '${field}' is missing or empty`,
          field,
          content[field as keyof ResourceItem]
        );
      }
    }
  }

  private validateDescriptionLength(content: ResourceItem): void {
    const minLength = this.config.contentValidation.minDescriptionLength;
    if (content.description.length < minLength) {
      throw new ValidationError(
        `Description too short (${content.description.length} < ${minLength})`,
        'description',
        content.description
      );
    }
  }

  private validateMentalHealthRelevance(content: ResourceItem): boolean {
    const keywords = this.config.contentValidation.mentalHealthKeywords;
    const searchText = `${content.title} ${content.description}`.toLowerCase();
    
    const hasRelevantKeyword = keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    );

    if (!hasRelevantKeyword) {
      throw new ValidationError(
        'Content does not appear to be mental health related',
        'mentalHealthRelevance',
        { title: content.title, description: content.description.substring(0, 100) }
      );
    }

    return true;
  }

  validateBatch(contents: ResourceItem[]): ResourceItem[] {
    const validContents: ResourceItem[] = [];
    let validCount = 0;
    let invalidCount = 0;

    for (const content of contents) {
      if (this.validateContent(content)) {
        validContents.push(content);
        validCount++;
      } else {
        invalidCount++;
      }
    }

    logger.info(`Content validation completed`, {
      total: contents.length,
      valid: validCount,
      invalid: invalidCount
    });

    return validContents;
  }
}