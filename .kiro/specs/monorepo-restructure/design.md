# Monorepo Restructure Design Document

## Overview

This design outlines the transformation of the current single-repository project into a well-organized monorepo using pnpm workspaces, catalog feature for dependency management, and Turbo for build orchestration. The restructure will maintain all existing functionality while improving code organization, dependency management, and build efficiency.

## Architecture

### Monorepo Structure

```
sunrain/
├── packages/
│   ├── website/                 # Main Astro website (current root content)
│   ├── content-fetcher/         # Content fetching scripts and utilities
│   └── shared/                  # Shared utilities and types
├── apps/                        # Future applications (if needed)
├── docs/                        # Documentation (moved from root)
├── tools/                       # Build tools and configurations
├── package.json                 # Root package.json with workspace config
├── pnpm-workspace.yaml         # pnpm workspace configuration
├── turbo.json                  # Turbo configuration
└── README.md                   # Updated root README
```

### Package Organization

#### 1. `packages/website`
- Contains the main Astro website code
- Includes all current `src/`, `public/`, and Astro configuration
- Maintains all existing functionality and build processes
- Dependencies: React, Astro, Tailwind, etc.

#### 2. `packages/content-fetcher`
- Contains all content fetching logic from `scripts/`
- Includes fetchers, utilities, and CLI tools
- Maintains existing script functionality
- Dependencies: node-fetch, dotenv, etc.

#### 3. `packages/shared`
- Contains shared types, utilities, and configurations
- Provides common interfaces between packages
- Includes shared TypeScript configurations
- Dependencies: TypeScript, shared utility libraries

## Components and Interfaces

### pnpm Catalog Configuration

The catalog will be defined in the root `package.json`:

```json
{
  "pnpm": {
    "catalog": {
      "typescript": "^5.8.3",
      "@types/node": "^20.10.0",
      "astro": "^5.11.0",
      "react": "^19.1.0",
      "react-dom": "^19.1.0",
      "tailwindcss": "^4.1.11",
      "node-fetch": "^3.3.2",
      "dotenv": "^16.3.1"
    }
  }
}
```

### Workspace Configuration

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Turbo Configuration

`turbo.json`:
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".astro/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^type-check"]
    }
  }
}
```

### Package Interfaces

#### Website Package Interface
```typescript
// packages/website/package.json
{
  "name": "@sunrain/website",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "catalog:",
    "react": "catalog:",
    "@sunrain/shared": "workspace:*"
  }
}
```

#### Content Fetcher Package Interface
```typescript
// packages/content-fetcher/package.json
{
  "name": "@sunrain/content-fetcher",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "fetch:all": "tsx src/cli.ts --type all"
  },
  "dependencies": {
    "node-fetch": "catalog:",
    "dotenv": "catalog:",
    "@sunrain/shared": "workspace:*"
  }
}
```

#### Shared Package Interface
```typescript
// packages/shared/package.json
{
  "name": "@sunrain/shared",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "typescript": "catalog:"
  }
}
```

## Data Models

### Workspace Configuration Model
```typescript
interface WorkspaceConfig {
  packages: string[];
  catalog: Record<string, string>;
  turboConfig: TurboConfig;
}

interface TurboConfig {
  pipeline: Record<string, PipelineConfig>;
}

interface PipelineConfig {
  dependsOn?: string[];
  outputs?: string[];
  cache?: boolean;
  persistent?: boolean;
}
```

### Package Migration Model
```typescript
interface PackageMigration {
  source: string;
  destination: string;
  files: string[];
  dependencies: string[];
  scripts: Record<string, string>;
}
```

## Error Handling

### Migration Error Handling
- **File conflicts**: Detect and resolve file path conflicts during migration
- **Dependency resolution**: Handle version conflicts in catalog dependencies
- **Build failures**: Ensure all packages build successfully after migration
- **Script execution**: Verify all existing scripts work in new structure

### Rollback Strategy
- Maintain backup of original structure
- Provide rollback scripts if migration fails
- Validate functionality at each migration step
- Document recovery procedures

## Testing Strategy

### Pre-Migration Validation
1. **Functionality baseline**: Document all current functionality
2. **Build verification**: Ensure all current builds work
3. **Script testing**: Verify all npm scripts execute correctly
4. **Dependency audit**: Check for unused or conflicting dependencies

### Post-Migration Validation
1. **Package builds**: Verify each package builds independently
2. **Cross-package dependencies**: Test workspace dependencies work correctly
3. **Script compatibility**: Ensure all scripts work from root and package level
4. **Turbo integration**: Verify Turbo caching and parallelization work
5. **Development workflow**: Test complete development workflow

### Continuous Validation
1. **Build pipeline**: Set up CI to test all packages
2. **Dependency updates**: Automate catalog dependency updates
3. **Performance monitoring**: Track build times and cache effectiveness
4. **Integration testing**: Regular testing of package interactions

## Migration Strategy

### Phase 1: Setup Infrastructure
1. Create monorepo structure
2. Configure pnpm workspace
3. Set up Turbo configuration
4. Create package.json templates

### Phase 2: Package Migration
1. Migrate website package (main Astro app)
2. Migrate content-fetcher package
3. Create shared package with common utilities
4. Update all import paths and references

### Phase 3: Dependency Management
1. Set up pnpm catalog
2. Migrate dependencies to catalog references
3. Resolve version conflicts
4. Optimize dependency tree

### Phase 4: Build Integration
1. Configure Turbo pipelines
2. Set up cross-package build dependencies
3. Optimize caching strategies
4. Test parallel build execution

### Phase 5: Documentation and Cleanup
1. Update all documentation
2. Create development workflow guides
3. Clean up obsolete files
4. Verify complete functionality

## Performance Considerations

### Build Performance
- **Turbo caching**: Leverage Turbo's intelligent caching
- **Parallel builds**: Execute independent package builds in parallel
- **Incremental builds**: Only rebuild changed packages
- **Dependency optimization**: Reduce duplicate dependencies

### Development Experience
- **Hot reloading**: Maintain fast development server startup
- **Type checking**: Optimize TypeScript compilation across packages
- **Script execution**: Provide convenient root-level scripts
- **IDE integration**: Ensure good IDE support for monorepo structure

## Security Considerations

### Package Privacy
- All packages marked as private to prevent accidental publishing
- No npm registry configurations in package.json files
- Workspace dependencies use `workspace:*` protocol

### Dependency Management
- Centralized dependency management through catalog
- Regular security audits of all dependencies
- Consistent versions across all packages
- Minimal external dependencies

## Compatibility Requirements

### Existing Functionality
- All website pages must work identically
- All content fetcher scripts must produce same output
- All build commands must work as before
- All development workflows must remain functional

### Tool Compatibility
- Maintain compatibility with existing IDE configurations
- Preserve Git workflow and history
- Keep existing CI/CD pipeline compatibility
- Maintain deployment process compatibility