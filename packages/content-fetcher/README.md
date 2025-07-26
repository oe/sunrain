# @sunrain/content-fetcher

CLI tools and utilities for fetching, processing, and managing content for the Sunrain platform.

## Overview

This package provides comprehensive content management capabilities:

- **Content Fetching** - Automated retrieval from external APIs
- **Data Processing** - Content validation and transformation
- **Translation Management** - i18n synchronization and validation
- **CLI Interface** - Command-line tools for content operations
- **Validation** - Content quality assurance

## Installation

From the root directory:
```bash
pnpm install
```

## Usage

### Content Fetching

Fetch content from external sources:

```bash
# Fetch all content types
pnpm fetch:all

# Fetch specific content types
pnpm fetch:books
pnpm fetch:movies  
pnpm fetch:music
```

### Translation Management

Manage internationalization:

```bash
# Sync translation files
pnpm i18n:sync

# Detect missing translations
pnpm i18n:detect

# Generate translation report
pnpm i18n:report

# Clean up unused translations
pnpm i18n:cleanup
```

### Content Validation

Validate content integrity:

```bash
# Run content validation tests
pnpm test:validator
```

## Available Scripts

- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm dev` - Start development mode with file watching
- `pnpm clean` - Clean build outputs
- `pnpm fetch:all` - Fetch all content types
- `pnpm fetch:books` - Fetch books content
- `pnpm fetch:movies` - Fetch movies content
- `pnpm fetch:music` - Fetch music content
- `pnpm i18n:sync` - Synchronize translation files
- `pnpm i18n:detect` - Detect missing translations
- `pnpm i18n:report` - Generate translation report
- `pnpm i18n:cleanup` - Clean unused translations
- `pnpm test:validator` - Run validation tests

## Project Structure

```
packages/content-fetcher/
├── src/
│   ├── fetchers/           # Content fetcher implementations
│   │   ├── books-fetcher.ts
│   │   ├── movies-fetcher.ts
│   │   └── music-fetcher.ts
│   ├── i18n/              # Translation management
│   │   ├── sync-manager.ts
│   │   └── translator.ts
│   ├── utils/             # Utility functions
│   │   └── url-generator.ts
│   ├── base-fetcher.ts    # Base fetcher class
│   ├── cli.ts             # Main CLI interface
│   ├── config.ts          # Configuration management
│   ├── errors.ts          # Error definitions
│   ├── i18n-cli.ts        # i18n CLI commands
│   ├── index.ts           # Package exports
│   ├── logger.ts          # Logging utilities
│   ├── types.ts           # Type definitions
│   ├── unified-fetcher.ts # Unified fetching interface
│   └── validator.ts       # Content validation
├── dist/                  # Compiled JavaScript
├── .env.example          # Environment variables template
├── package.json          # Package configuration
└── tsconfig.json         # TypeScript configuration
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API Keys (if required)
BOOKS_API_KEY=your_books_api_key
MOVIES_API_KEY=your_movies_api_key
MUSIC_API_KEY=your_music_api_key

# API Endpoints
BOOKS_API_URL=https://api.example.com/books
MOVIES_API_URL=https://api.example.com/movies
MUSIC_API_URL=https://api.example.com/music

# Output Configuration
OUTPUT_DIR=../website/src/content/resources
LOCALES_DIR=../website/src/locales

# Logging
LOG_LEVEL=info
```

### TypeScript Configuration

The package uses strict TypeScript configuration with:
- ES2022 target
- Node.js module resolution
- Strict type checking
- Path aliases for clean imports

## Content Fetchers

### Books Fetcher

Fetches book recommendations from external APIs:
- Filters by mental health topics
- Validates book metadata
- Formats for website consumption
- Supports multiple languages

### Movies Fetcher

Retrieves movie recommendations:
- Curates mental health-related content
- Includes ratings and descriptions
- Processes poster images
- Handles multiple languages

### Music Fetcher

Manages music recommendations:
- Fetches calming/therapeutic music
- Organizes by mood/category
- Includes streaming links
- Supports playlist generation

## Translation Management

### Sync Manager

Synchronizes translation files across languages:
- Detects new translation keys
- Updates existing translations
- Maintains translation consistency
- Generates missing key reports

### Translator

Handles translation operations:
- Key extraction from content
- Translation validation
- Format consistency checking
- Automated translation suggestions

## Validation

### Content Validator

Ensures content quality:
- Schema validation
- Required field checking
- Data format verification
- Cross-reference validation

### Validation Rules

- All content must have required fields
- URLs must be valid and accessible
- Images must meet size/format requirements
- Translations must be complete

## CLI Commands

### Main CLI (`cli.ts`)

```bash
# Fetch specific content type
node dist/cli.js --type books
node dist/cli.js --type movies
node dist/cli.js --type music
node dist/cli.js --type all

# With additional options
node dist/cli.js --type books --limit 50 --lang en
```

### i18n CLI (`i18n-cli.ts`)

```bash
# Sync translations
node dist/i18n-cli.js sync

# Detect missing translations
node dist/i18n-cli.js detect

# Generate report
node dist/i18n-cli.js report

# Cleanup unused keys
node dist/i18n-cli.js cleanup
```

## Development

### Adding New Fetchers

1. Create new fetcher class extending `BaseFetcher`
2. Implement required methods
3. Add to `unified-fetcher.ts`
4. Update CLI commands
5. Add validation rules

Example:
```typescript
import { BaseFetcher } from './base-fetcher.js';

export class NewContentFetcher extends BaseFetcher {
  async fetch(): Promise<ContentItem[]> {
    // Implementation
  }
  
  protected validate(item: ContentItem): boolean {
    // Validation logic
  }
}
```

### Adding Translation Support

1. Update translation key extraction
2. Add new language to supported locales
3. Update sync manager configuration
4. Test translation workflow

### Error Handling

The package uses custom error classes:
- `FetchError` - Content fetching failures
- `ValidationError` - Content validation failures
- `TranslationError` - Translation processing failures
- `ConfigError` - Configuration issues

## Dependencies

### Core Dependencies
- `node-fetch` - HTTP requests
- `dotenv` - Environment configuration
- `@sunrain/shared` - Shared utilities

### Development Dependencies
- `typescript` - Type checking
- `tsx` - TypeScript execution
- `@types/node` - Node.js types

## Testing

### Running Tests

```bash
# Run all validation tests
pnpm test:validator

# Test specific fetchers
node dist/test-books-fetcher.js
node dist/test-movies-fetcher.js
node dist/test-music-fetcher.js
```

### Test Coverage

Tests cover:
- Content fetching functionality
- Data validation
- Translation synchronization
- Error handling
- CLI command execution

## Troubleshooting

### Common Issues

**Fetch failures:**
- Check API keys and endpoints
- Verify network connectivity
- Review rate limiting

**Translation errors:**
- Validate translation file format
- Check key consistency
- Verify language codes

**Validation failures:**
- Review content schema
- Check required fields
- Validate data types

**Build issues:**
```bash
# Clean and rebuild
pnpm clean
pnpm build
```

### Debugging

Enable debug logging:
```bash
LOG_LEVEL=debug pnpm fetch:all
```

## Contributing

When contributing:

1. Follow existing code patterns
2. Add comprehensive error handling
3. Include validation for new content types
4. Update documentation
5. Add tests for new functionality

## Related Packages

- `@sunrain/website` - Main website consuming the content
- `@sunrain/shared` - Shared types and utilities
