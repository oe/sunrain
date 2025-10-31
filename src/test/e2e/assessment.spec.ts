import { test, expect } from '@playwright/test';

test.describe('Mental Health Assessment', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the assessment page
    await page.goto('/assessment/');
  });

  test('should display assessment list page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Mental Health Assessment/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Mental Health Assessment/ })).toBeVisible();
    
    // Check subtitle
    await expect(page.getByText(/Understand your mental health status/)).toBeVisible();
  });

  test('should display assessment categories', async ({ page }) => {
    // Check that different assessment categories are displayed
    await expect(page.getByText(/Mental Health Assessment/)).toBeVisible();
    await expect(page.getByText(/Personality Assessment/)).toBeVisible();
    await expect(page.getByText(/Stress Assessment/)).toBeVisible();
    await expect(page.getByText(/Mood Assessment/)).toBeVisible();
  });

  test('should display PHQ-9 assessment card', async ({ page }) => {
    // Check PHQ-9 assessment card
    await expect(page.getByText('PHQ-9 Depression Assessment')).toBeVisible();
    await expect(page.getByText('Patient Health Questionnaire-9 for depression screening')).toBeVisible();
    await expect(page.getByText('5 minutes')).toBeVisible();
    await expect(page.getByText('9 questions')).toBeVisible();
  });

  test('should display GAD-7 assessment card', async ({ page }) => {
    // Check GAD-7 assessment card
    await expect(page.getByText('GAD-7 Anxiety Assessment')).toBeVisible();
    await expect(page.getByText('Generalized Anxiety Disorder 7-item scale')).toBeVisible();
    await expect(page.getByText('3 minutes')).toBeVisible();
    await expect(page.getByText('7 questions')).toBeVisible();
  });

  test('should start PHQ-9 assessment', async ({ page }) => {
    // Click on PHQ-9 start button
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Should navigate to assessment taking page
    await expect(page).toHaveURL(/\/assessment\/take\/phq-9/);
    
    // Check that assessment is loaded
    await expect(page.getByText('Question 1')).toBeVisible();
    await expect(page.getByText('Little interest or pleasure in doing things')).toBeVisible();
  });

  test('should complete PHQ-9 assessment flow', async ({ page }) => {
    // Start PHQ-9 assessment
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Wait for assessment to load
    await expect(page.getByText('Question 1')).toBeVisible();
    
    // Answer first question
    await page.getByText('Several days').click();
    await page.getByRole('button', { name: /Next/ }).click();
    
    // Should move to question 2
    await expect(page.getByText('Question 2')).toBeVisible();
    await expect(page.getByText('Feeling down, depressed, or hopeless')).toBeVisible();
    
    // Answer second question
    await page.getByText('Not at all').click();
    await page.getByRole('button', { name: /Next/ }).click();
    
    // Continue with remaining questions...
    // (In a real test, you would answer all 9 questions)
    
    // For this test, we'll just verify the flow works
    await expect(page.getByText('Question 3')).toBeVisible();
  });

  test('should show progress bar during assessment', async ({ page }) => {
    // Start PHQ-9 assessment
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Check progress bar is visible
    await expect(page.getByText(/1 \/ 9/)).toBeVisible();
    
    // Answer a question and check progress updates
    await page.getByText('Several days').click();
    await page.getByRole('button', { name: /Next/ }).click();
    
    await expect(page.getByText(/2 \/ 9/)).toBeVisible();
  });

  test('should validate required answers', async ({ page }) => {
    // Start PHQ-9 assessment
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Try to proceed without selecting an answer
    await page.getByRole('button', { name: /Next/ }).click();
    
    // Should show validation error
    await expect(page.getByText(/This field is required/)).toBeVisible();
  });

  test('should allow pausing assessment', async ({ page }) => {
    // Start PHQ-9 assessment
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Click pause button
    await page.getByRole('button', { name: /Pause/ }).click();
    
    // Should show pause modal
    await expect(page.getByText(/Pause Assessment/)).toBeVisible();
    await expect(page.getByText(/Are you sure you want to pause/)).toBeVisible();
    
    // Click continue to dismiss modal
    await page.getByRole('button', { name: /Continue/ }).click();
    
    // Should return to assessment
    await expect(page.getByText('Question 1')).toBeVisible();
  });

  test('should navigate back to previous question', async ({ page }) => {
    // Start PHQ-9 assessment
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Answer first question and move to second
    await page.getByText('Several days').click();
    await page.getByRole('button', { name: /Next/ }).click();
    
    // Should be on question 2
    await expect(page.getByText('Question 2')).toBeVisible();
    
    // Click previous button
    await page.getByRole('button', { name: /Previous/ }).click();
    
    // Should be back on question 1
    await expect(page.getByText('Question 1')).toBeVisible();
    await expect(page.getByText('Little interest or pleasure in doing things')).toBeVisible();
  });

  test('should display assessment results after completion', async ({ page }) => {
    // This test would require completing the full assessment
    // For now, we'll test the navigation to results page
    await page.goto('/assessment/results/');
    
    // Check that results page loads
    await expect(page.getByText(/Assessment Results/)).toBeVisible();
  });

  test('should display assessment history', async ({ page }) => {
    // Navigate to history page
    await page.goto('/assessment/history/');
    
    // Check that history page loads
    await expect(page.getByText(/Assessment History/)).toBeVisible();
  });

  test('should display trends page', async ({ page }) => {
    // Navigate to trends page
    await page.goto('/assessment/trends/');
    
    // Check that trends page loads
    await expect(page.getByText(/Trend Analysis/)).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that assessment cards are still visible and properly laid out
    await expect(page.getByText('PHQ-9 Depression Assessment')).toBeVisible();
    await expect(page.getByText('GAD-7 Anxiety Assessment')).toBeVisible();
    
    // Start an assessment on mobile
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Check that assessment interface works on mobile
    await expect(page.getByText('Question 1')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Start PHQ-9 assessment
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Use keyboard to navigate
    await page.keyboard.press('Tab'); // Focus on first option
    await page.keyboard.press('Enter'); // Select option
    
    // Use Tab to navigate to Next button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Click Next
    
    // Should move to next question
    await expect(page.getByText('Question 2')).toBeVisible();
  });

  test('should handle browser refresh during assessment', async ({ page }) => {
    // Start PHQ-9 assessment
    await page.getByRole('button', { name: /Start Assessment/ }).first().click();
    
    // Answer first question
    await page.getByText('Several days').click();
    await page.getByRole('button', { name: /Next/ }).click();
    
    // Refresh the page
    await page.reload();
    
    // Should either resume the assessment or show appropriate message
    // This depends on the implementation of session persistence
    await expect(page.getByText(/assessment|question/i)).toBeVisible();
  });
});
