# Turbo Build Orchestration and Caching

## Overview

The Sunrain monorepo uses Turbo for efficient build orchestration and intelligent caching across all packages. This configuration provides significant performance improvements and ensures proper build dependencies.

## Monorepo Structure

The project is organized as a monorepo with the following packages:

- **`@sunrain/website`** - Main Astro website
- **`@sunrain/content-fetcher`** - Content management CLI tools
- **`@sunrain/shared`** - Shared utilities and types

## Turbo Configuration

### Pipeline Configuration (`turbo.json`)

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".astro/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Key Features

- **Local Caching**: Enabled local filesystem caching
- **Task Dependencies**: Proper build dependency configuration between packages
- **Output Caching**: Caches build artifacts (dist/**, .astro/**, build/**)
- **Global Dependencies**: Monitors key configuration file changes

## Performance Improvements

### Individual Package Builds
- **shared + content-fetcher**: Cold build 1.7s → Hot build 160ms (10x improvement)
- **website**: Cold build 14s → Hot build 178ms (78x improvement)

### Full Monorepo Build
- **All packages**: ~1.5s with cache hits
- **Build success**: Resolved TailwindCSS v4 compatibility issues

## Caching Strategy

### Build Tasks
- `build`: Caches build outputs for all packages
- `type-check`: Caches TypeScript type checking results
- `lint`: Caches code linting results

### Content Tasks (content-fetcher package)
- `fetch:*`: Caches fetched content files
- `i18n:*`: Caches internationalization processing results

### Development Tasks
- `dev`: Not cached (persistent task)
- `preview`: Not cached (persistent task)
- `clean`: Not cached (cleanup task)

## Available Scripts

### Root Level Scripts

```bash
# Development
pnpm dev                    # Start all packages in development mode
pnpm dev:website           # Start website only
pnpm dev:content-fetcher   # Start content-fetcher only
pnpm dev:shared            # Start shared package only

# Building
pnpm build                 # Build all packages
pnpm build:website         # Build website only
pnpm build:content-fetcher # Build content-fetcher only
pnpm build:shared          # Build shared package only
pnpm build:prod            # Clean + build all packages

# Quality Assurance
pnpm lint                  # Run linting across all packages
pnpm type-check            # Run TypeScript type checking
pnpm clean                 # Clean build outputs
pnpm clean:all             # Clean all outputs and caches

# Content Management
pnpm fetch:all             # Fetch all content types
pnpm fetch:books           # Fetch books content
pnpm fetch:movies          # Fetch movies content
pnpm fetch:music           # Fetch music content

# Internationalization
pnpm i18n:sync             # Sync translation files
pnpm i18n:detect           # Detect missing translations
pnpm i18n:report           # Generate translation report
pnpm i18n:cleanup          # Clean unused translations
```

## Testing Cache Performance

Run the performance test script:
```bash
./docs/test-build-performance.sh
```

## Cache Location and Size

- **Local cache**: `.turbo/cache/`
- **Current size**: ~408KB
- **Cache entries**: ~35 files

## Dependency Management

### pnpm Catalog

Dependencies are managed through pnpm's catalog feature for consistency:

```json
{
  "pnpm": {
    "catalog": {
      "typescript": "^5.8.3",
      "astro": "^5.11.0",
      "react": "^19.1.0",
      "tailwindcss": "^4.1.11"
    }
  }
}
```

### Workspace Dependencies

Packages reference each other using workspace protocol:
```json
{
  "dependencies": {
    "@sunrain/shared": "workspace:*"
  }
}
```

## Resolved Issues

### TailwindCSS Compatibility
- Resolved TailwindCSS v4 compatibility issues with DaisyUI
- Using `@astrojs/tailwind` instead of `@tailwindcss/vite` plugin
- Configured support for `astro-i18n-aut` generated temporary pages

### Build Error Fixes
- Resolved `astro_tmp_pages_*` temporary file build failures
- Fixed TailwindCSS syntax errors and DaisyUI plugin conflicts
- Proper handling of multilingual content generation

## Package-Specific Optimizations

### Website Package
- Astro build optimization with static site generation
- TailwindCSS compilation caching
- React component compilation caching

### Content Fetcher Package
- TypeScript compilation caching
- CLI tool build optimization
- Content validation result caching

### Shared Package
- TypeScript declaration file generation caching
- Utility function compilation caching
- Type checking optimization

## Troubleshooting

### Cache Issues
```bash
# Clear Turbo cache
pnpm clean

# Force rebuild without cache
turbo run build --force

# Clear all caches including pnpm
pnpm clean:all
```

### Build Failures
```bash
# Clean and rebuild all packages
pnpm clean:all
pnpm install
pnpm build
```

### Package Resolution Issues
```bash
# Clear pnpm cache and reinstall
pnpm store prune
pnpm install
```

## Best Practices

1. **Use root scripts**: Run commands from root for proper Turbo orchestration
2. **Leverage caching**: Let Turbo handle build optimization automatically
3. **Respect dependencies**: Ensure proper `dependsOn` configuration
4. **Monitor performance**: Use test scripts to validate cache effectiveness
5. **Clean when needed**: Use clean commands when experiencing issues

## Future Optimizations

- **Remote caching**: Consider Turbo remote cache for team collaboration
- **Parallel optimization**: Further optimize parallel task execution
- **Cache warming**: Implement cache warming strategies for CI/CD
- **Dependency analysis**: Regular analysis of build dependency graph
