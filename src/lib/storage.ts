/**
 * Simple localStorage utilities for assessment results
 * All data stays on user's device
 */

import type { AssessmentResult } from './questionnaire';

// Re-export the type for convenience
export type { AssessmentResult } from './questionnaire';

const STORAGE_KEY = 'sunrain_assessment_results';

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all assessment results
 */
export function getResults(): AssessmentResult[] {
  if (!isStorageAvailable()) return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save a new assessment result
 */
export function saveResult(result: AssessmentResult): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    const results = getResults();
    results.unshift(result); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get results for a specific questionnaire
 */
export function getResultsByQuestionnaire(questionnaireId: string): AssessmentResult[] {
  return getResults().filter(r => r.questionnaireId === questionnaireId);
}

/**
 * Get the most recent result
 */
export function getLatestResult(): AssessmentResult | null {
  const results = getResults();
  return results.length > 0 ? results[0] : null;
}

/**
 * Get a specific result by ID
 */
export function getResultById(id: string): AssessmentResult | null {
  return getResults().find(r => r.id === id) || null;
}

/**
 * Delete a specific result
 */
export function deleteResult(id: string): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    const results = getResults().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all results
 */
export function clearAllResults(): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get result count
 */
export function getResultCount(): number {
  return getResults().length;
}

