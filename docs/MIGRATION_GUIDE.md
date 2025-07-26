# Monorepo Migration Guide

This guide explains the migration from a single-repository structure to a monorepo architecture using pnpm workspaces and Turbo build orchestration.

## Overview

The Sunrain project has been restructured from a single repository to a monorepo with three main packages:

- **`@sunrain/website`** - Main Astro website (previously root content)
- **`@sunrain/content-fetcher`** - Content management CLI tools (previously `scripts/`)
- **`@sunrain/shared`** - Shared utilities and types (new package)

## What Changed

### Directory Structure

**Before (Single Repo):**
```
sunrain/
├── src/                    # Website source code
├── public/                 # Static assets
├── scripts/               # Content fetcher scripts
├── docs/                  # Documentation
├── package.json           # Single package.json
├── astro.config.mjs       # Astro configuration
└── README.md              # Basic README
```

**After (Monorepo):**
```
sunrain/
├── packages/
│   ├── website/           # Main Astro website
│   │   ├── src/          # Website source (moved from root)
│   │   ├── public/       # Static assets (moved from root)
│   │   ├── astro.config.mjs
│   │   └── package.json
│   ├── content-fetcher/   # Content management
│   │   ├── src/          # CLI tools (moved from scripts/)
│   │   └── package.json
│   └── shared/            # Shared utilities
│       ├── src/
│       └── package.json
├── docs/                  # Documentation (updated)
├── package.json           # Root workspace configuration
├── pnpm-workspace.yaml    # Workspace configuration
├── turbo.json             # Build orchestration
└── README.md              # Comprehensive documentation
```

### File Migrations

| Old Location | New Location | Notes |
|--------------|--------------|-------|
| `src/` | `packages/website/src/` | Website source code |
| `public/` | `packages/website/public/` | Static assets |
| `scripts/` | `packages/content-fetcher/src/` | Content management tools |
| `astro.config.mjs` | `packages/website/astro.config.mjs` | Astro configuration |
| `tsconfig.json` | `packages/*/tsconfig.json` | Per-package TypeScript config |
| Root `package.json` | `package.json` + `packages/*/package.json` | Split into workspace + packages |

### Dependency Management

**Before:**
- Single `package.json` with all dependencies
- Direct version specifications
- Potential version conflicts

**After:**
- Root `package.json` with pnpm catalog
- Package-specific `package.json` files
- Catalog references for shared dependencies
- Workspace protocol for internal dependencies

### Build System

**Before:**
- Single build process
- No caching
- Sequential execution

**After:**
- Turbo build orchestration
- Intelligent caching (10x-78x performance improvement)
- Parallel execution
- Dependency-aware builds

## Migration Impact

### For Contributors

#### Development Workflow Changes

**Before:**
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build project
npm run build
```

**After:**
```bash
# Install dependencies
pnpm install

# Start all packages
pnpm dev

# Start specific package
pnpm dev:website

# Build all packages
pnpm build

# Build specific package
pnpm build:website
```

#### Working with Packages

**Individual Package Development:**
```bash
# Work on website
cd packages/website
pnpm dev

# Work on content fetcher
cd packages/content-fetcher
pnpm build

# Work on shared utilities
cd packages/shared
pnpm dev
```

**Root-Level Commands (Recommended):**
```bash
# Use Turbo for orchestration
pnpm dev                    # All packages
pnpm dev:website           # Website only
pnpm build                 # All packages
pnpm build:website         # Website only
```

#### Import Path Changes

**Before:**
```typescript
// Relative imports within project
import { someUtil } from '../utils/helper';
import { ContentItem } from '../types';
```

**After:**
```typescript
// Package imports for shared code
import { ContentItem, someUtil } from '@sunrain/shared';

// Relative imports within same package
import { LocalComponent } from './components/LocalComponent';
```

#### Adding Dependencies

**Before:**
```bash
npm install new-package
```

**After:**
```bash
# Add to catalog (preferred)
# Edit root package.json catalog section
{
  "pnpm": {
    "catalog": {
      "new-package": "^1.0.0"
    }
  }
}

# Use in package
{
  "dependencies": {
    "new-package": "catalog:"
  }
}

# Or add directly to specific package
cd packages/website
pnpm add new-package
```

### For Users

#### No Breaking Changes

- All website functionality remains identical
- Same URLs and navigation
- Same content and features
- Same deployment process

#### Performance Improvements

- Faster build times with Turbo caching
- Better development experience
- More efficient CI/CD pipelines

## Common Migration Issues

### Import Resolution Errors

**Problem:** TypeScript can't resolve imports after migration

**Solution:**
```bash
# Ensure all packages are built
pnpm build

# Clear TypeScript cache
rm -rf packages/*/tsconfig.tsbuildinfo

# Restart TypeScript server in IDE
```

### Build Failures

**Problem:** Packages fail to build after migration

**Solution:**
```bash
# Clean all build outputs
pnpm clean:all

# Reinstall dependencies
pnpm install

# Build in dependency order
pnpm build
```

### Package Resolution Issues

**Problem:** Workspace dependencies not resolving

**Solution:**
```bash
# Check workspace configuration
cat pnpm-workspace.yaml

# Verify package names in package.json files
# Ensure workspace: protocol is used for internal deps

# Clear pnpm cache
pnpm store prune
pnpm install
```

### Turbo Cache Issues

**Problem:** Stale cache causing build problems

**Solution:**
```bash
# Clear Turbo cache
pnpm clean

# Force rebuild without cache
turbo run build --force

# Check cache configuration
cat turbo.json
```

## Best Practices for Contributors

### 1. Use Root-Level Scripts

Always use root-level scripts for consistency:
```bash
# Good
pnpm dev:website
pnpm build:content-fetcher

# Avoid (unless working on specific package)
cd packages/website && pnpm dev
```

### 2. Respect Package Boundaries

- Keep website-specific code in `@sunrain/website`
- Keep content management in `@sunrain/content-fetcher`
- Put shared code in `@sunrain/shared`

### 3. Use Catalog Dependencies

Prefer catalog entries for shared dependencies:
```json
{
  "dependencies": {
    "react": "catalog:",           // Good
    "react": "^19.1.0"            // Avoid
  }
}
```

### 4. Update Documentation

When making changes:
- Update package-specific README files
- Update root documentation if needed
- Document any new scripts or workflows

### 5. Test Across Packages

Before submitting changes:
```bash
# Build all packages
pnpm build

# Run type checking
pnpm type-check

# Test specific functionality
pnpm test:validator
```

## Rollback Procedure

If issues arise, the migration can be rolled back:

1. **Backup Current State:**
   ```bash
   git branch backup-monorepo
   ```

2. **Revert to Pre-Migration:**
   ```bash
   git checkout pre-monorepo-tag
   ```

3. **Restore Single Repo Structure:**
   - Move `packages/website/src/` back to `src/`
   - Move `packages/website/public/` back to `public/`
   - Restore root `package.json`
   - Remove workspace configuration

## Getting Help

### Resources

1. **Package Documentation:** Check `packages/*/README.md`
2. **Root Documentation:** See updated `README.md`
3. **Turbo Documentation:** Review `docs/turbo-caching.md`
4. **Migration Issues:** Create GitHub issue with "migration" label

### Common Commands Reference

```bash
# Development
pnpm dev                    # All packages
pnpm dev:website           # Website only
pnpm dev:content-fetcher   # Content fetcher only

# Building
pnpm build                 # All packages
pnpm build:prod            # Clean + build all

# Content Management
pnpm fetch:all             # Fetch all content
pnpm i18n:sync             # Sync translations

# Maintenance
pnpm clean                 # Clean build outputs
pnpm clean:all             # Clean everything + caches
pnpm type-check            # Type checking
```

### Troubleshooting Checklist

- [ ] All packages built successfully (`pnpm build`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] TypeScript cache cleared
- [ ] IDE TypeScript server restarted
- [ ] Turbo cache cleared if needed (`pnpm clean`)
- [ ] Package names and versions correct
- [ ] Workspace dependencies use `workspace:*` protocol

## Migration Benefits

### For Development

- **Faster Builds**: 10x-78x improvement with Turbo caching
- **Better Organization**: Clear separation of concerns
- **Type Safety**: Shared types across packages
- **Dependency Management**: Consistent versions with catalog
- **Parallel Development**: Work on packages independently

### For Maintenance

- **Modular Architecture**: Easier to maintain and extend
- **Build Optimization**: Intelligent caching and parallelization
- **Documentation**: Comprehensive package-specific docs
- **Testing**: Package-specific testing strategies
- **Deployment**: Optimized build pipelines

The migration to monorepo architecture provides a solid foundation for future development while maintaining all existing functionality.
