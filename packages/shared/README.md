# @sunrain/shared

Shared TypeScript types, utilities, and configurations used across the Sunrain monorepo.

## Overview

This package provides common functionality shared between other packages in the monorepo:

- **Type Definitions** - Shared TypeScript interfaces and types
- **Utility Functions** - Common helper functions
- **Configuration Interfaces** - Shared configuration types
- **Constants** - Cross-package constants and enums

## Installation

This package is automatically installed as a workspace dependency. From other packages:

```json
{
  "dependencies": {
    "@sunrain/shared": "workspace:*"
  }
}
```

## Usage

### Importing Types

```typescript
import { ContentItem, ResourceType, Language } from '@sunrain/shared';

// Use shared types
const book: ContentItem = {
  id: '1',
  title: 'Mental Health Guide',
  type: ResourceType.BOOK,
  language: Language.EN
};
```

### Importing Utilities

```typescript
import { formatDate, validateUrl, slugify } from '@sunrain/shared';

// Use utility functions
const formattedDate = formatDate(new Date());
const isValid = validateUrl('https://example.com');
const slug = slugify('My Article Title');
```

### Importing Constants

```typescript
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@sunrain/shared';

// Use shared constants
const languages = SUPPORTED_LANGUAGES;
const defaultLang = DEFAULT_LANGUAGE;
```

## Available Scripts

- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm dev` - Start development mode with file watching
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean build outputs

## Project Structure

```
packages/shared/
├── src/
│   ├── content.ts         # Content-related types and utilities
│   ├── i18n.ts           # Internationalization types
│   ├── index.ts          # Main exports
│   └── types.ts          # Core type definitions
├── dist/                 # Compiled JavaScript
├── package.json          # Package configuration
└── tsconfig.json         # TypeScript configuration
```

## API Reference

### Types (`types.ts`)

#### Core Types

```typescript
// Resource types
enum ResourceType {
  BOOK = 'book',
  MOVIE = 'movie',
  MUSIC = 'music',
  GUIDE = 'guide'
}

// Language codes
enum Language {
  EN = 'en',
  ZH = 'zh',
  ES = 'es',
  AR = 'ar',
  HI = 'hi',
  JA = 'ja',
  KO = 'ko'
}

// Base content item interface
interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  language: Language;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Configuration Types

```typescript
// Fetcher configuration
interface FetcherConfig {
  apiKey?: string;
  apiUrl: string;
  timeout: number;
  retries: number;
}

// Build configuration
interface BuildConfig {
  outputDir: string;
  minify: boolean;
  sourceMaps: boolean;
}
```

### Content Utilities (`content.ts`)

#### Content Processing

```typescript
// Validate content item
function validateContentItem(item: ContentItem): boolean

// Format content for display
function formatContentItem(item: ContentItem): FormattedContent

// Filter content by criteria
function filterContent(
  items: ContentItem[], 
  criteria: FilterCriteria
): ContentItem[]

// Sort content by various fields
function sortContent(
  items: ContentItem[], 
  sortBy: SortField, 
  order: SortOrder
): ContentItem[]
```

#### Content Transformation

```typescript
// Convert content to different formats
function toJSON(items: ContentItem[]): string
function fromJSON(json: string): ContentItem[]

// Generate content slugs
function generateSlug(title: string): string

// Extract content metadata
function extractMetadata(item: ContentItem): ContentMetadata
```

### i18n Utilities (`i18n.ts`)

#### Language Support

```typescript
// Supported languages constant
const SUPPORTED_LANGUAGES: Language[]

// Default language
const DEFAULT_LANGUAGE: Language

// Language display names
const LANGUAGE_NAMES: Record<Language, string>
```

#### Translation Utilities

```typescript
// Get language from locale string
function getLanguageFromLocale(locale: string): Language

// Validate language code
function isValidLanguage(lang: string): boolean

// Get language direction (LTR/RTL)
function getLanguageDirection(lang: Language): 'ltr' | 'rtl'

// Format locale string
function formatLocale(lang: Language, region?: string): string
```

#### Translation Key Management

```typescript
// Extract translation keys from content
function extractTranslationKeys(content: string): string[]

// Validate translation key format
function validateTranslationKey(key: string): boolean

// Generate translation key from content
function generateTranslationKey(content: string): string
```

### Utility Functions

#### String Utilities

```typescript
// Create URL-friendly slugs
function slugify(text: string): string

// Capitalize first letter
function capitalize(text: string): string

// Truncate text with ellipsis
function truncate(text: string, length: number): string

// Remove HTML tags
function stripHtml(html: string): string
```

#### Date Utilities

```typescript
// Format date for display
function formatDate(date: Date, locale?: string): string

// Parse date from various formats
function parseDate(dateString: string): Date

// Get relative time (e.g., "2 hours ago")
function getRelativeTime(date: Date): string

// Check if date is valid
function isValidDate(date: Date): boolean
```

#### URL Utilities

```typescript
// Validate URL format
function validateUrl(url: string): boolean

// Extract domain from URL
function getDomain(url: string): string

// Build URL with query parameters
function buildUrl(base: string, params: Record<string, string>): string

// Check if URL is external
function isExternalUrl(url: string): boolean
```

#### Validation Utilities

```typescript
// Validate email format
function validateEmail(email: string): boolean

// Validate required fields
function validateRequired(value: any): boolean

// Validate string length
function validateLength(text: string, min: number, max: number): boolean

// Validate array not empty
function validateArrayNotEmpty<T>(array: T[]): boolean
```

## Constants

### Language Constants

```typescript
// All supported languages
export const SUPPORTED_LANGUAGES = [
  Language.EN,
  Language.ZH,
  Language.ES,
  Language.AR,
  Language.HI,
  Language.JA,
  Language.KO
];

// Default language
export const DEFAULT_LANGUAGE = Language.EN;

// Language display names
export const LANGUAGE_NAMES = {
  [Language.EN]: 'English',
  [Language.ZH]: '中文',
  [Language.ES]: 'Español',
  [Language.AR]: 'العربية',
  [Language.HI]: 'हिन्दी',
  [Language.JA]: '日本語',
  [Language.KO]: '한국어'
};
```

### Content Constants

```typescript
// Maximum content lengths
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_TAGS = 10;

// Content validation rules
export const VALIDATION_RULES = {
  title: { required: true, maxLength: MAX_TITLE_LENGTH },
  description: { required: false, maxLength: MAX_DESCRIPTION_LENGTH },
  tags: { required: false, maxItems: MAX_TAGS }
};
```

### API Constants

```typescript
// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
} as const;

// Request timeouts
export const TIMEOUTS = {
  DEFAULT: 5000,
  LONG: 30000,
  SHORT: 1000
} as const;
```

## Development

### Building

```bash
# Compile TypeScript
pnpm build

# Watch mode for development
pnpm dev
```

### Type Checking

```bash
# Run TypeScript compiler
pnpm type-check
```

### Adding New Exports

1. Add functionality to appropriate source file
2. Export from `src/index.ts`
3. Update this README with API documentation
4. Build and test in consuming packages

Example:
```typescript
// src/new-utility.ts
export function newUtility(input: string): string {
  return input.toUpperCase();
}

// src/index.ts
export { newUtility } from './new-utility.js';
```

## TypeScript Configuration

The package uses strict TypeScript configuration:

- **Target**: ES2022
- **Module**: ESNext
- **Strict mode**: Enabled
- **Declaration files**: Generated for type exports
- **Source maps**: Enabled for debugging

## Dependencies

### Core Dependencies
- `typescript` - Type checking and compilation

### Development Dependencies
- `@types/node` - Node.js type definitions

## Usage in Other Packages

### Website Package

```typescript
// In website components
import { ContentItem, formatDate } from '@sunrain/shared';

const BookCard = ({ book }: { book: ContentItem }) => {
  return (
    <div>
      <h3>{book.title}</h3>
      <p>Published: {formatDate(book.createdAt)}</p>
    </div>
  );
};
```

### Content Fetcher Package

```typescript
// In fetcher implementations
import { ContentItem, ResourceType, validateContentItem } from '@sunrain/shared';

export class BooksFetcher {
  async fetch(): Promise<ContentItem[]> {
    const books = await this.fetchFromAPI();
    return books.filter(validateContentItem);
  }
}
```

## Contributing

When contributing to the shared package:

1. **Maintain backward compatibility** - Don't break existing APIs
2. **Add comprehensive types** - All exports should be fully typed
3. **Include JSDoc comments** - Document all public APIs
4. **Update README** - Document new exports and changes
5. **Test in consuming packages** - Verify changes work across the monorepo

## Versioning

This package uses workspace versioning and is not published to npm. Version changes should be coordinated across the entire monorepo.

## Related Packages

- `@sunrain/website` - Main website using shared types
- `@sunrain/content-fetcher` - Content management using shared utilities
