# Implementation Plan

- [x] 1. Create monorepo infrastructure
  - Create root workspace configuration files
  - Set up pnpm workspace with catalog feature
  - Configure Turbo for build orchestration
  - Create package directory structure
  - _Requirements: 2.1, 2.2, 3.1_

- [x] 2. Set up shared package foundation
  - [x] 2.1 Create shared package structure
    - Create packages/shared directory with package.json
    - Set up TypeScript configuration for shared utilities
    - Create index.ts with common type exports
    - Configure build scripts for shared package
    - _Requirements: 1.1, 1.4_
  
  - [x] 2.2 Migrate common types and utilities
    - Extract shared types from existing codebase
    - Move common utility functions to shared package
    - Create shared configuration interfaces
    - Update import paths to use shared package
    - _Requirements: 1.1, 1.4_

- [x] 3. Migrate website package
  - [x] 3.1 Create website package structure
    - Create packages/website directory with package.json
    - Configure package as private with proper metadata
    - Set up dependencies using catalog references
    - Create build and development scripts
    - _Requirements: 1.1, 2.3, 6.1_
  
  - [x] 3.2 Move website source code
    - Move src/ directory to packages/website/src/
    - Move public/ directory to packages/website/public/
    - Move astro.config.mjs to packages/website/
    - Update all internal import paths
    - _Requirements: 4.1, 4.2_
  
  - [x] 3.3 Update website configuration files
    - Move and update tsconfig.json for website package
    - Update Astro configuration for new structure
    - Configure path aliases for new package structure
    - Update any build-related configurations
    - _Requirements: 4.1, 4.3_

- [x] 4. Migrate content-fetcher package
  - [x] 4.1 Create content-fetcher package structure
    - Create packages/content-fetcher directory with package.json
    - Configure package as private with proper metadata
    - Set up dependencies using catalog references
    - Create build and CLI scripts
    - _Requirements: 1.1, 2.3, 6.1_
  
  - [x] 4.2 Move content-fetcher source code
    - Move scripts/content-fetcher/ to packages/content-fetcher/src/
    - Update all internal import paths and file references
    - Move environment configuration files
    - Update CLI entry points and script paths
    - _Requirements: 4.1, 4.2_
  
  - [x] 4.3 Update content-fetcher configuration
    - Move and update TypeScript configuration
    - Update output paths for generated content files
    - Configure proper module resolution
    - Update any build-related configurations
    - _Requirements: 4.1, 4.3_

- [x] 5. Configure pnpm catalog and workspace
  - [x] 5.1 Set up pnpm catalog in root package.json
    - Define catalog entries for all shared dependencies
    - Include TypeScript, React, Astro, and utility libraries
    - Set up version management for catalog dependencies
    - Configure catalog for development dependencies
    - _Requirements: 2.1, 2.2_
  
  - [x] 5.2 Update package dependencies to use catalog
    - Replace direct version references with catalog: references
    - Update all package.json files to use catalog entries
    - Configure workspace dependencies with workspace: protocol
    - Verify dependency resolution works correctly
    - _Requirements: 2.2, 2.3_
  
  - [x] 5.3 Create pnpm-workspace.yaml configuration
    - Define workspace package patterns
    - Configure workspace-specific settings
    - Set up proper package discovery
    - Test workspace dependency resolution
    - _Requirements: 2.1, 2.4_

- [-] 6. Configure Turbo build orchestration
  - [x] 6.1 Create turbo.json configuration
    - Define build pipeline for all package types
    - Configure dependency relationships between packages
    - Set up caching strategies for different task types
    - Configure output directories for caching
    - _Requirements: 3.1, 3.2_
  
  - [x] 6.2 Set up Turbo build scripts
    - Create root-level scripts that use Turbo
    - Configure parallel execution for independent packages
    - Set up development mode with proper watching
    - Create production build pipeline
    - _Requirements: 3.1, 3.3_
  
  - [x] 6.3 Configure Turbo caching and optimization
    - Set up remote caching configuration (if needed)
    - Configure cache invalidation strategies
    - Optimize build dependencies and parallelization
    - Test caching effectiveness and build performance
    - _Requirements: 3.2, 3.4_

- [ ] 7. Update root configuration and scripts
  - [x] 7.1 Create new root package.json
    - Set up workspace configuration in root package.json
    - Define root-level scripts that orchestrate package builds
    - Configure package manager and Node.js version requirements
    - Set up proper metadata and private flag
    - _Requirements: 1.2, 2.1, 6.1_
  
  - [x] 7.2 Update root configuration files
    - Update .gitignore for new package structure
    - Update any IDE configuration files
    - Create or update .nvmrc or package.json engines
    - Configure any linting or formatting tools for monorepo
    - _Requirements: 4.4, 5.1_

- [ ] 8. Fix cross-package imports and references
  - [x] 8.1 Update import paths in website package
    - Replace relative imports with package imports where appropriate
    - Update imports to use @sunrain/shared package
    - Fix any broken imports after file moves
    - Test all import resolutions work correctly
    - _Requirements: 1.4, 4.1_
  
  - [x] 8.2 Update import paths in content-fetcher package
    - Update imports to use @sunrain/shared package
    - Fix relative imports for moved files
    - Update any file path references in configuration
    - Test all CLI commands work with new paths
    - _Requirements: 1.4, 4.1_
  
  - [x] 8.3 Configure proper module resolution
    - Set up TypeScript path mapping for all packages
    - Configure Node.js module resolution for workspace packages
    - Test import resolution in both development and build modes
    - Verify all cross-package dependencies work correctly
    - _Requirements: 1.4, 4.3_

- [ ] 9. Test and validate functionality
  - [x] 9.1 Test website package functionality
    - Verify development server starts correctly
    - Test all website pages render properly
    - Verify build process produces correct output
    - Test all existing website features work
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 9.2 Test content-fetcher package functionality
    - Verify all CLI commands execute correctly
    - Test content fetching produces same output as before
    - Verify all scripts and utilities work properly
    - Test build process and TypeScript compilation
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 9.3 Test cross-package integration
    - Verify shared package is properly consumed
    - Test workspace dependency resolution
    - Verify Turbo build orchestration works
    - Test parallel builds and caching
    - _Requirements: 1.4, 3.1, 3.2_

- [ ] 10. Update documentation
  - [x] 10.1 Update root README.md
    - Document new monorepo structure and organization
    - Add setup instructions for monorepo development
    - Document available scripts and build commands
    - Add troubleshooting section for common issues
    - _Requirements: 5.1, 5.2_
  
  - [x] 10.2 Create package-specific documentation
    - Create README files for each package
    - Document package-specific development workflows
    - Add API documentation for shared package
    - Document any package-specific configuration
    - _Requirements: 5.1, 5.3_
  
  - [x] 10.3 Update existing documentation
    - Update docs/ directory content for new structure
    - Fix any references to old file paths
    - Update development workflow documentation
    - Add migration guide for contributors
    - _Requirements: 5.1, 5.4_

- [ ] 11. Clean up and finalize
  - [x] 11.1 Remove obsolete files and directories
    - Remove old scripts/ directory after migration
    - Clean up old configuration files
    - Remove any temporary migration files
    - Update .gitignore to reflect new structure
    - _Requirements: 4.4, 6.3_
  
  - [x] 11.2 Final validation and testing
    - Run complete test suite on restructured codebase
    - Verify all functionality works identically to before
    - Test complete development workflow from scratch
    - Validate build performance and caching
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 11.3 Create migration completion checklist
    - Document what was changed and what remains the same
    - Create rollback procedure documentation
    - Add performance comparison metrics
    - Document any breaking changes (should be none)
    - _Requirements: 5.1, 5.4_
