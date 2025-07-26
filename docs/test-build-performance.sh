#!/bin/bash

# Turbo cache performance test for Sunrain monorepo
echo "🚀 Testing Turbo caching performance..."

# Clean all caches
echo "🧹 Cleaning all caches..."
pnpm clean:all

# Cold build - all packages
echo "❄️ Cold build (all packages)..."
echo "Building shared, content-fetcher, and website packages..."
time pnpm build

# Warm build - should use cache
echo "🔥 Warm build (should use cache)..."
time pnpm build

# Test individual package builds
echo "📦 Testing individual package builds..."

echo "Building shared package..."
time pnpm build:shared

echo "Building content-fetcher package..."
time pnpm build:content-fetcher

echo "Building website package..."
time pnpm build:website

# Show cache stats
echo "📊 Cache statistics:"
if [ -d ".turbo/cache" ]; then
    echo "Cache size: $(du -sh .turbo/cache/ | cut -f1)"
    echo "Cache entries: $(find .turbo/cache -type f | wc -l) files"
else
    echo "No cache directory found"
fi

# Show package sizes
echo "📏 Package build sizes:"
for pkg in shared content-fetcher website; do
    if [ -d "packages/$pkg/dist" ]; then
        echo "$pkg: $(du -sh packages/$pkg/dist | cut -f1)"
    fi
done

echo "✅ Performance test complete!"
echo ""
echo "Expected performance improvements:"
echo "- shared + content-fetcher: Cold ~1.7s → Hot ~160ms (10x)"
echo "- website: Cold ~14s → Hot ~178ms (78x)"
echo "- Full monorepo: ~1.5s with cache hits"
