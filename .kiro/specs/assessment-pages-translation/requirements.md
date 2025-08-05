# Requirements Document

## Introduction

This feature addresses the hardcoded Chinese text in the assessment history and trends pages. The pages currently have mixed SSG (Static Site Generation) and CSR (Client Side Rendering) content with hardcoded Chinese text that needs to be properly translated and organized. The CSR content should be extracted into dedicated React components using `client:only` rendering.

## Requirements

### Requirement 1

**User Story:** As a user viewing the assessment history page, I want all text to be properly translated based on my language preference, so that I can understand the interface in my preferred language.

#### Acceptance Criteria

1. WHEN a user visits the assessment history page THEN all hardcoded Chinese text SHALL be replaced with proper translation keys
2. WHEN the page loads THEN SSG content SHALL use server-side translations
3. WHEN dynamic content is rendered THEN CSR content SHALL use client-side translations
4. WHEN the language is changed THEN all text SHALL update to reflect the new language

### Requirement 2

**User Story:** As a user viewing the trends analysis page, I want all text to be properly translated based on my language preference, so that I can understand the trend analysis in my preferred language.

#### Acceptance Criteria

1. WHEN a user visits the trends page THEN all hardcoded Chinese text SHALL be replaced with proper translation keys
2. WHEN charts and dynamic content are rendered THEN they SHALL use appropriate translation keys
3. WHEN insights are generated THEN they SHALL use translated text
4. WHEN time ranges and statistics are displayed THEN they SHALL be properly localized

### Requirement 3

**User Story:** As a developer maintaining the codebase, I want CSR content to be separated from SSG content, so that the code is more maintainable and follows proper architecture patterns.

#### Acceptance Criteria

1. WHEN CSR content is identified THEN it SHALL be extracted into dedicated React components
2. WHEN React components are created THEN they SHALL use `client:only` directive for rendering
3. WHEN components are implemented THEN they SHALL use the CSR translation system
4. WHEN components are integrated THEN they SHALL maintain the same functionality as before

### Requirement 4

**User Story:** As a user, I want the translation system to properly distinguish between SSG and CSR content, so that the appropriate translation method is used for each type of content.

#### Acceptance Criteria

1. WHEN SSG content is rendered THEN it SHALL use server-side translation functions
2. WHEN CSR content is rendered THEN it SHALL use client-side translation hooks
3. WHEN translation keys are defined THEN they SHALL be properly organized in the translation files
4. WHEN both translation types are used THEN they SHALL not conflict with each other
