/**
 * Translation validation utility
 * Validates that all translation files have the required structure and completeness
 */
import type { Language } from '@sunrain/shared';
import { supportedLangs } from '@sunrain/shared';
import type { IAssessmentTranslations } from '@/locales/assessment/types';
import { getAssessmentTranslations } from '@/locales/assessment';

interface ValidationResult {
  language: Language;
  isValid: boolean;
  missingKeys: string[];
  errors: string[];
}

interface ValidationReport {
  allValid: boolean;
  results: ValidationResult[];
  summary: {
    totalLanguages: number;
    validLanguages: number;
    invalidLanguages: number;
  };
}

/**
 * Recursively get all keys from an object
 */
function getAllKeys(obj: any, prefix: string = ''): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }

  return keys;
}

/**
 * Check if a value exists at the given key path
 */
function hasKey(obj: any, keyPath: string): boolean {
  const keys = keyPath.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || !current.hasOwnProperty(key)) {
      return false;
    }
    current = current[key];
  }

  return current !== null && current !== undefined && current !== '';
}

/**
 * Validate a single language translation
 */
function validateLanguage(language: Language, referenceKeys: string[]): ValidationResult {
  const result: ValidationResult = {
    language,
    isValid: true,
    missingKeys: [],
    errors: []
  };

  try {
    const translations = getAssessmentTranslations(language);

    // Check for missing keys
    for (const key of referenceKeys) {
      if (!hasKey(translations, key)) {
        result.missingKeys.push(key);
        result.isValid = false;
      }
    }

    // Check for basic structure
    const requiredSections = ['pageTitle', 'list', 'execution', 'results', 'history', 'continue', 'trends', 'client', 'common'];
    for (const section of requiredSections) {
      if (!translations[section as keyof IAssessmentTranslations]) {
        result.errors.push(`Missing required section: ${section}`);
        result.isValid = false;
      }
    }

    // Check client section specifically
    if (translations.client) {
      const clientRequiredSections = ['loading', 'errors', 'actions', 'progress', 'question'];
      for (const section of clientRequiredSections) {
        if (!translations.client[section as keyof typeof translations.client]) {
          result.errors.push(`Missing required client section: ${section}`);
          result.isValid = false;
        }
      }
    }

  } catch (error) {
    result.errors.push(`Failed to load translations: ${error}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Validate all translation files
 */
export function validateAllTranslations(): ValidationReport {
  // Use English as the reference for completeness
  const referenceTranslations = getAssessmentTranslations('en');
  const referenceKeys = getAllKeys(referenceTranslations);

  const results: ValidationResult[] = [];

  for (const language of supportedLangs) {
    const result = validateLanguage(language, referenceKeys);
    results.push(result);
  }

  const validLanguages = results.filter(r => r.isValid).length;
  const invalidLanguages = results.length - validLanguages;

  return {
    allValid: invalidLanguages === 0,
    results,
    summary: {
      totalLanguages: results.length,
      validLanguages,
      invalidLanguages
    }
  };
}

/**
 * Print validation report to console
 */
export function printValidationReport(report: ValidationReport): void {
  console.log('\n=== Translation Validation Report ===');
  console.log(`Total Languages: ${report.summary.totalLanguages}`);
  console.log(`Valid Languages: ${report.summary.validLanguages}`);
  console.log(`Invalid Languages: ${report.summary.invalidLanguages}`);
  console.log(`Overall Status: ${report.allValid ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n=== Detailed Results ===');
  for (const result of report.results) {
    const status = result.isValid ? '✅' : '❌';
    console.log(`${status} ${result.language.toUpperCase()}`);

    if (result.errors.length > 0) {
      console.log('  Errors:');
      result.errors.forEach(error => console.log(`    - ${error}`));
    }

    if (result.missingKeys.length > 0) {
      console.log('  Missing Keys:');
      result.missingKeys.slice(0, 5).forEach(key => console.log(`    - ${key}`));
      if (result.missingKeys.length > 5) {
        console.log(`    ... and ${result.missingKeys.length - 5} more`);
      }
    }
  }
}

/**
 * Get missing keys for a specific language
 */
export function getMissingKeys(language: Language): string[] {
  const referenceTranslations = getAssessmentTranslations('en');
  const referenceKeys = getAllKeys(referenceTranslations);
  const result = validateLanguage(language, referenceKeys);
  return result.missingKeys;
}

/**
 * Check if client-side import works for all languages
 */
export async function validateClientSideImports(): Promise<boolean> {
  try {
    for (const language of supportedLangs) {
      // Try to dynamically import each language file
      const module = await import(`@/locales/assessment/${language}`);

      if (!module.default && !module[`assessment${language.charAt(0).toUpperCase() + language.slice(1)}`]) {
        console.error(`❌ ${language}: No default export or named export found`);
        return false;
      }
    }

    console.log('✅ All language files can be imported client-side');
    return true;
  } catch (error) {
    console.error('❌ Client-side import validation failed:', error);
    return false;
  }
}
