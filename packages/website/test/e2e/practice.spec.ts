import { test, expect } from '@playwright/test';

test.describe('Practice Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the practice page
    await page.goto('/practice/');
  });

  test('should load practice list page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Mindfulness Practices/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Mindfulness Practices/i })).toBeVisible();
    
    // Check description
    await expect(page.getByText(/Guided mindfulness exercises for mental well-being/)).toBeVisible();
  });

  test('should display practice cards', async ({ page }) => {
    // Wait for practice cards to load
    await page.waitForSelector('[data-testid="practice-card"]', { timeout: 10000 });
    
    // Check that practice cards are visible
    const practiceCards = page.locator('[data-testid="practice-card"]');
    await expect(practiceCards).toHaveCount(3); // Based on mock data
    
    // Check first practice card content
    await expect(practiceCards.first()).toContainText('Basic Mindful Breathing');
    await expect(practiceCards.first()).toContainText('A simple breathing exercise');
  });

  test('should navigate to individual practice page', async ({ page }) => {
    // Click on first practice card
    const firstCard = page.locator('[data-testid="practice-card"]').first();
    await firstCard.click();
    
    // Should navigate to practice detail page
    await expect(page).toHaveURL(/\/practice\/basic-breathing/);
    
    // Check practice player is loaded
    await expect(page.locator('[data-testid="practice-player"]')).toBeVisible();
  });

  test('should filter practices by search', async ({ page }) => {
    // Type in search box
    const searchInput = page.getByPlaceholderText('Search practices...');
    await searchInput.fill('breathing');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check that only breathing practices are shown
    const practiceCards = page.locator('[data-testid="practice-card"]');
    await expect(practiceCards).toHaveCount(1);
    await expect(practiceCards.first()).toContainText('breathing');
  });

  test('should filter practices by category', async ({ page }) => {
    // Click filters button
    await page.getByText('Filters').click();
    
    // Click on meditation category
    await page.getByText('Meditation').click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check that only meditation practices are shown
    const practiceCards = page.locator('[data-testid="practice-card"]');
    await expect(practiceCards).toHaveCount(1);
    await expect(practiceCards.first()).toContainText('Loving-Kindness');
  });

  test('should filter practices by difficulty', async ({ page }) => {
    // Click filters button
    await page.getByText('Filters').click();
    
    // Click on beginner difficulty
    await page.getByText('Beginner').click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check that only beginner practices are shown
    const practiceCards = page.locator('[data-testid="practice-card"]');
    await expect(practiceCards).toHaveCount(2); // Basic breathing and body scan
  });

  test('should clear filters', async ({ page }) => {
    // Apply a filter first
    await page.getByText('Filters').click();
    await page.getByText('Meditation').click();
    
    // Verify filter is applied
    let practiceCards = page.locator('[data-testid="practice-card"]');
    await expect(practiceCards).toHaveCount(1);
    
    // Clear filters
    await page.getByText('Clear all').click();
    
    // Verify all practices are shown again
    practiceCards = page.locator('[data-testid="practice-card"]');
    await expect(practiceCards).toHaveCount(3);
  });

  test('should navigate to practice history', async ({ page }) => {
    // Click on history link
    await page.getByText('View History').click();
    
    // Should navigate to history page
    await expect(page).toHaveURL(/\/practice\/history/);
    
    // Check history page content
    await expect(page.getByRole('heading', { name: /Practice History/i })).toBeVisible();
  });

  test('should handle practice player functionality', async ({ page }) => {
    // Navigate to a practice page
    await page.locator('[data-testid="practice-card"]').first().click();
    
    // Wait for practice player to load
    await page.waitForSelector('[data-testid="practice-player"]');
    
    // Check that practice player elements are visible
    await expect(page.locator('[data-testid="practice-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="practice-description"]')).toBeVisible();
    
    // Check that play button is visible
    await expect(page.locator('[data-testid="play-button"]')).toBeVisible();
  });

  test('should handle breathing circle animation', async ({ page }) => {
    // Navigate to a breathing practice
    await page.locator('[data-testid="practice-card"]').first().click();
    
    // Start the practice
    await page.locator('[data-testid="play-button"]').click();
    
    // Check that breathing circle is visible and animating
    const breathingCircle = page.locator('[data-testid="breathing-circle"]');
    await expect(breathingCircle).toBeVisible();
    
    // Wait for animation to start
    await page.waitForTimeout(1000);
    
    // Check that phase text changes
    await expect(page.locator('[data-testid="breathing-phase"]')).toBeVisible();
  });

  test('should handle timer functionality', async ({ page }) => {
    // Navigate to a practice page
    await page.locator('[data-testid="practice-card"]').first().click();
    
    // Start the practice
    await page.locator('[data-testid="play-button"]').click();
    
    // Check that timer is visible
    const timer = page.locator('[data-testid="practice-timer"]');
    await expect(timer).toBeVisible();
    
    // Check timer shows correct duration
    await expect(timer).toContainText('5:00');
  });

  test('should handle back navigation', async ({ page }) => {
    // Navigate to a practice page
    await page.locator('[data-testid="practice-card"]').first().click();
    
    // Click back button
    await page.getByText('← Back to List').click();
    
    // Should return to practice list
    await expect(page).toHaveURL(/\/practice\/$/);
    await expect(page.getByRole('heading', { name: /Mindfulness Practices/i })).toBeVisible();
  });

  test('should handle quick start functionality', async ({ page }) => {
    // Click quick start button
    await page.getByText('Quick Start').click();
    
    // Should navigate to first practice
    await expect(page).toHaveURL(/\/practice\/basic-breathing/);
    
    // Check that practice player is loaded
    await expect(page.locator('[data-testid="practice-player"]')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that practice cards stack vertically
    const practiceCards = page.locator('[data-testid="practice-card"]');
    await expect(practiceCards).toHaveCount(3);
    
    // Check that filters are still accessible
    await page.getByText('Filters').click();
    await expect(page.getByText('Category')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to non-existent practice
    await page.goto('/practice/non-existent-practice');
    
    // Should redirect to practice list or show error
    await expect(page).toHaveURL(/\/practice\//);
  });

  test('should handle language switching', async ({ page }) => {
    // Switch to Chinese
    await page.goto('/zh/practice/');
    
    // Check Chinese content
    await expect(page.getByRole('heading', { name: /正念练习/i })).toBeVisible();
    
    // Switch to Spanish
    await page.goto('/es/practice/');
    
    // Check Spanish content
    await expect(page.getByRole('heading', { name: /Prácticas de Mindfulness/i })).toBeVisible();
  });
});
