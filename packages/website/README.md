# @sunrain/website

The main Astro-based website for the Sunrain mental health resources platform.

## Overview

This package contains the primary website built with Astro, featuring:

- **Static Site Generation** - Fast, SEO-friendly pages
- **Multilingual Support** - Content in 7 languages
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Interactive Components** - React components for dynamic features
- **Content Collections** - Organized guides and resources

## Development

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm (managed from root)

### Getting Started

From the root directory:
```bash
# Start development server
pnpm dev:website

# Or from this package directory
cd packages/website
pnpm dev
```

### Available Scripts

- `pnpm dev` - Start development server with hot reloading
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean build outputs

## Project Structure

```
packages/website/
├── src/
│   ├── components/          # React components
│   ├── content/            # Content collections
│   │   ├── guide/          # Guide content (markdown)
│   │   └── resources/      # Resource data (JSON)
│   ├── i18n/              # Internationalization config
│   ├── layouts/           # Astro layouts
│   ├── locales/           # Translation files
│   ├── pages/             # Astro pages (routes)
│   └── styles/            # Global styles
├── public/                # Static assets
├── astro.config.mjs      # Astro configuration
├── tailwind.config.mjs   # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Features

### Internationalization

The website supports multiple languages:
- English (en) - Default
- Chinese (zh)
- Spanish (es)
- Arabic (ar)
- Hindi (hi)
- Japanese (ja)
- Korean (ko)

Language switching is handled by the `LanguageSwitcher` component.

### Content Management

Content is organized into collections:

- **Guides** (`src/content/guide/`) - Mental health guides in markdown
- **Resources** (`src/content/resources/`) - Curated books, movies, music in JSON

### Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Theme switching support
- **Typography** - Optimized reading experience

### Components

Key React components:
- `Header.astro` - Site navigation
- `Footer.astro` - Site footer
- `LanguageSwitcher.tsx` - Language selection
- `ThemeSwitcher.tsx` - Dark/light mode toggle
- `MobileMenuButton.tsx` - Mobile navigation

## Configuration

### Astro Configuration

Key settings in `astro.config.mjs`:
- Output mode: Static site generation
- Integrations: React, Tailwind CSS
- i18n routing configuration

### TypeScript

TypeScript configuration includes:
- Strict mode enabled
- Path aliases for clean imports
- Astro-specific type definitions

### Tailwind CSS

Custom Tailwind configuration:
- Extended color palette
- Custom typography settings
- Responsive breakpoints

## Content Guidelines

### Adding Guides

1. Create markdown file in `src/content/guide/[lang]/`
2. Include frontmatter with title, description, date
3. Use consistent heading structure
4. Add to all supported languages

### Adding Resources

1. Update JSON files in `src/content/resources/`
2. Follow existing data structure
3. Include all required fields
4. Validate with content-fetcher tools

## Deployment

The website is built as a static site and can be deployed to any static hosting service:

```bash
# Build for production
pnpm build

# Output will be in dist/ directory
```

## Dependencies

### Core Dependencies
- `astro` - Static site generator
- `react` & `react-dom` - UI components
- `@astrojs/react` - React integration
- `@astrojs/tailwind` - Tailwind integration

### Shared Dependencies
- `@sunrain/shared` - Shared types and utilities

### Development Dependencies
- `typescript` - Type checking
- `tailwindcss` - Styling
- Various Astro and React type definitions

## Troubleshooting

### Common Issues

**Build failures:**
```bash
# Clean and rebuild
pnpm clean
pnpm build
```

**TypeScript errors:**
- Check import paths
- Verify shared package is built
- Restart TypeScript server

**Styling issues:**
- Check Tailwind configuration
- Verify CSS imports
- Clear browser cache

**i18n issues:**
- Verify translation files exist
- Check language routing configuration
- Validate content structure

### Performance

- Use Astro's static generation for optimal performance
- Optimize images in public/ directory
- Minimize JavaScript bundle size
- Leverage browser caching

## Contributing

When contributing to the website:

1. Follow existing code style
2. Add TypeScript types for new components
3. Test in multiple languages
4. Ensure responsive design
5. Update documentation as needed

## Related Packages

- `@sunrain/content-fetcher` - Content management tools
- `@sunrain/shared` - Shared utilities and types
