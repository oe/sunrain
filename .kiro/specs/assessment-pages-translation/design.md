# Design Document

## Overview

This design addresses the translation issues in the assessment history and trends pages by properly separating SSG and CSR content, implementing correct translation patterns, and extracting dynamic content into dedicated React components.

## Architecture

### Translation Architecture
- **SSG Content**: Uses server-side translation functions (`getAssessmentTranslations()`)
- **CSR Content**: Uses client-side translation hooks (`useCSRTranslations()`)
- **Component Separation**: Dynamic content extracted into React components with `client:only`

### File Structure
```
packages/website/src/
├── components/assessment/
│   ├── AssessmentHistoryClient.tsx (new)
│   └── AssessmentTrendsClient.tsx (new)
├── pages/assessment/
│   ├── history.astro (modified)
│   └── trends.astro (modified)
└── locales/assessment/
    ├── en.ts (potentially extended)
    └── zh.ts (potentially extended)
```

## Components and Interfaces

### 1. AssessmentHistoryClient Component
**Purpose**: Handle all client-side dynamic content for the history page
**Rendering**: `client:only="react"`
**Translation**: Uses `useCSRTranslations()` hook

**Props Interface**:
```typescript
interface AssessmentHistoryClientProps {
  initialLang: Language;
}
```

**Responsibilities**:
- Statistics display and updates
- Filtering and search functionality
- Pagination controls
- Result list rendering
- Export functionality
- Delete/share actions

### 2. AssessmentTrendsClient Component
**Purpose**: Handle all client-side dynamic content for the trends page
**Rendering**: `client:only="react"`
**Translation**: Uses `useCSRTranslations()` hook

**Props Interface**:
```typescript
interface AssessmentTrendsClientProps {
  initialLang: Language;
}
```

**Responsibilities**:
- Chart rendering and updates
- Time range selection
- Trend analysis display
- Insights generation
- Statistics calculation
- Export functionality

### 3. Modified Astro Pages
**Purpose**: Provide SSG shell with proper translations
**Translation**: Uses server-side `getAssessmentTranslations()`

**Responsibilities**:
- Page structure and layout
- Static headers and navigation
- SEO metadata
- Initial loading states
- Component integration points

## Data Models

### Translation Key Extensions
The existing translation structure already supports the required keys. Additional keys may be needed for:

```typescript
// Potential additions to IAssessmentTranslations
interface AdditionalTranslations {
  history: {
    // ... existing keys
    messages: {
      loadingHistory: string;
      exportSuccess: string;
      exportFailed: string;
      deleteSuccess: string;
      deleteFailed: string;
      deleteConfirm: string;
    };
  };
  trends: {
    // ... existing keys
    messages: {
      loadingTrends: string;
      exportSuccess: string;
      exportFailed: string;
      noDataAvailable: string;
      analysisComplete: string;
    };
  };
}
```

## Error Handling

### Client Component Error Boundaries
- Each client component wrapped in error boundary
- Graceful fallback to loading/error states
- Error messages properly translated

### Translation Fallbacks
- Default to English if translation key missing
- Fallback to hardcoded text as last resort
- Console warnings for missing translations

### Data Loading Errors
- Proper error states for failed data loads
- Retry mechanisms where appropriate
- User-friendly error messages

## Testing Strategy

### Unit Tests
- Test translation key usage in components
- Test component rendering with different languages
- Test error handling and fallbacks

### Integration Tests
- Test SSG/CSR translation coordination
- Test language switching functionality
- Test component integration with Astro pages

### Visual Regression Tests
- Ensure UI consistency across languages
- Test responsive behavior
- Verify chart and dynamic content rendering

## Implementation Approach

### Phase 1: Extract Client Components
1. Create `AssessmentHistoryClient.tsx`
2. Create `AssessmentTrendsClient.tsx`
3. Move all dynamic JavaScript logic to components
4. Implement proper TypeScript interfaces

### Phase 2: Implement Translation System
1. Replace hardcoded Chinese text with translation keys
2. Implement `useCSRTranslations()` in client components
3. Ensure server-side translations in Astro pages
4. Add missing translation keys if needed

### Phase 3: Integration and Testing
1. Integrate client components into Astro pages
2. Test language switching functionality
3. Verify all text is properly translated
4. Test error handling and edge cases

## Performance Considerations

### Code Splitting
- Client components loaded only when needed
- Lazy loading for heavy chart libraries
- Minimal bundle size for translation utilities

### Caching Strategy
- Translation keys cached on client
- Assessment data cached appropriately
- Efficient re-rendering on language changes

### Memory Management
- Proper cleanup of event listeners
- Efficient chart rendering and updates
- Optimized data structures for large datasets

## Security Considerations

### Data Sanitization
- Proper sanitization of user data in exports
- Safe handling of assessment results
- XSS prevention in dynamic content

### Privacy
- No sensitive data in client-side logs
- Proper handling of assessment data
- Secure export functionality

## Accessibility

### Screen Reader Support
- Proper ARIA labels for dynamic content
- Accessible chart descriptions
- Keyboard navigation support

### Internationalization
- RTL language support consideration
- Proper date/time formatting
- Cultural considerations for risk level descriptions

## Browser Compatibility

### Modern Browser Support
- ES2020+ features usage
- Modern React patterns
- Progressive enhancement approach

### Fallback Strategies
- Graceful degradation for older browsers
- Polyfills where necessary
- Feature detection for advanced functionality
