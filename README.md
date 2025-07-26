# Sunrain - Mental Health Resources Platform

A comprehensive mental health resources platform built as a monorepo, providing curated books, movies, music, and guides to support mental wellbeing.

## 🏗️ Monorepo Structure

This project is organized as a monorepo using pnpm workspaces and Turbo for efficient build orchestration:

```
sunrain/
├── packages/
│   ├── website/                 # Main Astro website
│   ├── content-fetcher/         # Content fetching scripts and utilities
│   └── shared/                  # Shared utilities and types
├── docs/                        # Documentation
├── package.json                 # Root workspace configuration
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── turbo.json                  # Turbo build orchestration
```

### Packages

- **`@sunrain/website`** - The main Astro-based website with multilingual support
- **`@sunrain/content-fetcher`** - CLI tools and scripts for fetching and managing content
- **`@sunrain/shared`** - Shared TypeScript types, utilities, and configurations

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/sunrain/sunrain.git
cd sunrain

# Install dependencies
pnpm install
```

### Development

```bash
# Start all packages in development mode
pnpm dev

# Start specific packages
pnpm dev:website          # Website only
pnpm dev:content-fetcher  # Content fetcher only
pnpm dev:shared          # Shared package only
```

### Building

```bash
# Build all packages
pnpm build

# Build specific packages
pnpm build:website
pnpm build:content-fetcher
pnpm build:shared

# Production build (clean + build)
pnpm build:prod
```

## 📦 Package Scripts

### Website Development
- `pnpm dev:website` - Start website development server
- `pnpm build:website` - Build website for production
- `pnpm preview:website` - Preview built website

### Content Management
- `pnpm fetch:all` - Fetch all content (books, movies, music)
- `pnpm fetch:books` - Fetch books content only
- `pnpm fetch:movies` - Fetch movies content only
- `pnpm fetch:music` - Fetch music content only

### Internationalization
- `pnpm i18n:sync` - Sync translation files
- `pnpm i18n:detect` - Detect missing translations
- `pnpm i18n:report` - Generate translation report
- `pnpm i18n:cleanup` - Clean up unused translations

### Quality Assurance
- `pnpm lint` - Run linting across all packages
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test:validator` - Run content validation tests

### Utilities
- `pnpm clean` - Clean build outputs
- `pnpm clean:all` - Clean all build outputs and caches

## 🛠️ Development Workflow

### Adding New Dependencies

Dependencies are managed through pnpm's catalog feature for consistency:

1. Add to catalog in root `package.json`:
```json
{
  "pnpm": {
    "catalog": {
      "new-dependency": "^1.0.0"
    }
  }
}
```

2. Use in package:
```json
{
  "dependencies": {
    "new-dependency": "catalog:"
  }
}
```

### Working with Packages

Each package can be developed independently:

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

### Cross-Package Dependencies

Packages can depend on each other using workspace protocol:

```json
{
  "dependencies": {
    "@sunrain/shared": "workspace:*"
  }
}
```

## 🏃‍♂️ Performance & Caching

This monorepo uses Turbo for intelligent build caching and parallelization:

- **Incremental builds** - Only rebuild what changed
- **Parallel execution** - Run independent tasks simultaneously  
- **Smart caching** - Cache build outputs and skip unnecessary work
- **Dependency awareness** - Respect build order dependencies

## 🌍 Internationalization

The platform supports multiple languages:

- English (en)
- Chinese (zh)
- Spanish (es)
- Arabic (ar)
- Hindi (hi)
- Japanese (ja)
- Korean (ko)

Translation management is handled through the content-fetcher package.

## 📁 Project Structure Details

### Website Package (`packages/website`)
- Astro-based static site generator
- React components for interactive elements
- Tailwind CSS for styling
- Multilingual content support
- Responsive design

### Content Fetcher Package (`packages/content-fetcher`)
- CLI tools for content management
- API integrations for external content
- Content validation and processing
- Translation synchronization
- Data transformation utilities

### Shared Package (`packages/shared`)
- Common TypeScript types
- Shared utility functions
- Configuration interfaces
- Cross-package constants

## 🔧 Troubleshooting

### Common Issues

**Build failures after dependency changes:**
```bash
pnpm clean:all
pnpm install
pnpm build
```

**TypeScript errors in IDE:**
- Restart TypeScript server
- Check workspace configuration
- Verify package dependencies

**Turbo cache issues:**
```bash
pnpm clean
# or force rebuild
turbo run build --force
```

**Package resolution issues:**
```bash
# Clear pnpm cache
pnpm store prune
pnpm install
```

### Getting Help

1. Check package-specific README files
2. Review the docs/ directory
3. Check existing issues in the repository
4. Create a new issue with detailed information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in the appropriate package
4. Run tests and linting
5. Submit a pull request

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Use conventional commit messages
- Ensure all packages build successfully

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with modern web technologies:
- [Astro](https://astro.build/) - Static site generator
- [React](https://react.dev/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [pnpm](https://pnpm.io/) - Package management
- [Turbo](https://turbo.build/) - Build orchestration