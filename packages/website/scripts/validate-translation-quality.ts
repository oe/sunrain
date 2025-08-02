#!/usr/bin/env tsx

/**
 * Translation Quality Validation Script
 *
 * This script validates and improves the quality of mental health translations
 * by checking for consistency, cultural appropriateness, and professional terminology.
 */

import fs from 'fs/promises';
import path from 'path';
import { mentalHealthTerminology, culturalAdaptationNotes, type TerminologyDictionary } from './terminology-dictionary.js';

interface TranslationIssue {
  type: 'terminology' | 'consistency' | 'cultural' | 'length' | 'formatting';
  severity: 'error' | 'warning' | 'info';
  file: string;
  key: string;
  language: string;
  current: string;
  suggested?: string;
  reason: string;
}

interface QualityReport {
  summary: {
    totalFiles: number;
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  issues: TranslationIssue[];
  improvements: {
    terminology: number;
    consistency: number;
    cultural: number;
    formatting: number;
  };
  generatedAt: string;
}

/**
 * Load translation file and parse its content
 */
async function loadTranslationFile(filePath: string): Promise<any> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Extract the exported object from TypeScript file
    const exportMatch = content.match(/export const \w+:\s*\w+\s*=\s*({[\s\S]*?});/);
    if (!exportMatch) {
      throw new Error('Could not parse translation file structure');
    }

    // This is a simplified parser - in production, you'd want a more robust solution
    const objectStr = exportMatch[1];

    // Convert TypeScript object to JSON (simplified approach)
    let jsonStr = objectStr
      .replace(/(\w+):/g, '"$1":')  // Add quotes to keys
      .replace(/'/g, '"')           // Convert single quotes to double quotes
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      // Fallback: try to evaluate the object (less safe but more flexible)
      console.warn(`JSON parsing failed for ${filePath}, using fallback method`);
      return eval(`(${objectStr})`);
    }
  } catch (error) {
    console.error(`Error loading translation file ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract all text values from nested translation object
 */
function extractTextValues(obj: any, prefix: string = ''): Array<{ key: string; value: string }> {
  const results: Array<{ key: string; value: string }> = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      results.push({ key: fullKey, value });
    } else if (typeof value === 'object' && value !== null) {
      results.push(...extractTextValues(value, fullKey));
    }
  }

  return results;
}

/**
 * Check for terminology consistency issues
 */
function checkTerminologyConsistency(
  textValue: string,
  language: string,
  key: string,
  filePath: string
): TranslationIssue[] {
  const issues: TranslationIssue[] = [];

  for (const [termKey, termEntry] of Object.entries(mentalHealthTerminology)) {
    const correctTerm = termEntry[language as keyof typeof termEntry] as string;
    const englishTerm = termEntry.en;

    if (!correctTerm) continue;

    // Check if the text contains the English term instead of the correct translation
    if (textValue.includes(englishTerm) && !textValue.includes(correctTerm)) {
      issues.push({
        type: 'terminology',
        severity: 'warning',
        file: filePath,
        key,
        language,
        current: textValue,
        suggested: textValue.replace(englishTerm, correctTerm),
        reason: `Should use "${correctTerm}" instead of "${englishTerm}" for better cultural appropriateness`
      });
    }

    // Check for outdated or inappropriate terminology
    const inappropriateTerms = getInappropriateTerms(language);
    for (const inappropriate of inappropriateTerms) {
      if (textValue.toLowerCase().includes(inappropriate.term.toLowerCase())) {
        issues.push({
          type: 'terminology',
          severity: 'error',
          file: filePath,
          key,
          language,
          current: textValue,
          suggested: textValue.replace(inappropriate.term, inappropriate.replacement),
          reason: inappropriate.reason
        });
      }
    }
  }

  return issues;
}

/**
 * Get inappropriate terms for specific languages
 */
function getInappropriateTerms(language: string): Array<{ term: string; replacement: string; reason: string }> {
  const terms: Record<string, Array<{ term: string; replacement: string; reason: string }>> = {
    zh: [
      {
        term: '精神病',
        replacement: '心理健康问题',
        reason: '避免污名化，使用更中性的表达'
      },
      {
        term: '神经病',
        replacement: '心理困扰',
        reason: '避免贬义词汇，使用专业术语'
      }
    ],
    ja: [
      {
        term: '精神病',
        replacement: 'メンタルヘルスの問題',
        reason: '避免污名化，使用更温和的表达'
      }
    ],
    ko: [
      {
        term: '정신병',
        replacement: '정신건강 문제',
        reason: '避免污名化，使用更专业的表达'
      }
    ],
    hi: [
      {
        term: 'पागल',
        replacement: 'मानसिक स्वास्थ्य समस्या',
        reason: '避免贬义词汇，使用专业术语'
      }
    ],
    ar: [
      {
        term: 'مجنون',
        replacement: 'مشكلة في الصحة النفسية',
        reason: '避免贬义词汇，使用专业术语'
      }
    ],
    es: [
      {
        term: 'loco',
        replacement: 'problema de salud mental',
        reason: '避免贬义词汇，使用专业术语'
      }
    ]
  };

  return terms[language] || [];
}

/**
 * Check for cultural appropriateness issues
 */
function checkCulturalAppropriateness(
  textValue: string,
  language: string,
  key: string,
  filePath: string
): TranslationIssue[] {
  const issues: TranslationIssue[] = [];

  // Check for cultural sensitivity based on language
  const culturalChecks = getCulturalChecks(language);

  for (const check of culturalChecks) {
    if (check.pattern.test(textValue)) {
      issues.push({
        type: 'cultural',
        severity: check.severity,
        file: filePath,
        key,
        language,
        current: textValue,
        suggested: check.suggestion,
        reason: check.reason
      });
    }
  }

  return issues;
}

/**
 * Get cultural checks for specific languages
 */
function getCulturalChecks(language: string): Array<{
  pattern: RegExp;
  severity: 'error' | 'warning' | 'info';
  suggestion: string;
  reason: string;
}> {
  const checks: Record<string, Array<{
    pattern: RegExp;
    severity: 'error' | 'warning' | 'info';
    suggestion: string;
    reason: string;
  }>> = {
    zh: [
      {
        pattern: /个人主义/i,
        severity: 'warning',
        suggestion: '考虑使用更符合集体主义文化的表达',
        reason: '中文文化更重视集体和家庭，个人主义概念可能不太适合'
      }
    ],
    ja: [
      {
        pattern: /直接的/i,
        severity: 'info',
        suggestion: '考虑使用更委婉的表达方式',
        reason: '日本文化偏好间接和委婉的沟通方式'
      }
    ],
    ar: [
      {
        pattern: /个人选择/i,
        severity: 'warning',
        suggestion: '考虑家庭和社区的影响',
        reason: '阿拉伯文化中家庭和社区决策很重要'
      }
    ]
  };

  return checks[language] || [];
}

/**
 * Check for text length and formatting issues
 */
function checkFormattingIssues(
  textValue: string,
  language: string,
  key: string,
  filePath: string
): TranslationIssue[] {
  const issues: TranslationIssue[] = [];

  // Check for excessive length differences
  const englishLength = getEnglishTranslation(key)?.length || 0;
  const currentLength = textValue.length;
  const lengthRatio = currentLength / englishLength;

  if (lengthRatio > 2.5) {
    issues.push({
      type: 'length',
      severity: 'warning',
      file: filePath,
      key,
      language,
      current: textValue,
      reason: `Translation is ${Math.round(lengthRatio * 100)}% longer than English, may cause UI issues`
    });
  }

  // Check for formatting consistency
  if (textValue.includes('  ')) {
    issues.push({
      type: 'formatting',
      severity: 'info',
      file: filePath,
      key,
      language,
      current: textValue,
      suggested: textValue.replace(/\s+/g, ' '),
      reason: 'Contains multiple consecutive spaces'
    });
  }

  // Check for proper punctuation
  if (language === 'zh' && textValue.match(/[。！？]$/)) {
    // Chinese should end with Chinese punctuation
  } else if (language === 'ja' && textValue.match(/[。！？]$/)) {
    // Japanese should end with Japanese punctuation
  } else if (['es', 'ar', 'hi', 'ko'].includes(language) && !textValue.match(/[.!?]$/)) {
    if (textValue.length > 10 && key.includes('message')) {
      issues.push({
        type: 'formatting',
        severity: 'info',
        file: filePath,
        key,
        language,
        current: textValue,
        reason: 'Long message text should end with proper punctuation'
      });
    }
  }

  return issues;
}

/**
 * Get English translation for comparison (simplified)
 */
function getEnglishTranslation(key: string): string | null {
  // This would need to be implemented to load the English translation
  // For now, return null
  return null;
}

/**
 * Validate translation quality for a single file
 */
async function validateTranslationFile(filePath: string, language: string): Promise<TranslationIssue[]> {
  const issues: TranslationIssue[] = [];

  const translationData = await loadTranslationFile(filePath);
  if (!translationData) {
    return issues;
  }

  const textValues = extractTextValues(translationData);

  for (const { key, value } of textValues) {
    // Check terminology consistency
    issues.push(...checkTerminologyConsistency(value, language, key, filePath));

    // Check cultural appropriateness
    issues.push(...checkCulturalAppropriateness(value, language, key, filePath));

    // Check formatting issues
    issues.push(...checkFormattingIssues(value, language, key, filePath));
  }

  return issues;
}

/**
 * Generate quality improvement suggestions
 */
function generateImprovementSuggestions(issues: TranslationIssue[]): string[] {
  const suggestions: string[] = [];

  const terminologyIssues = issues.filter(i => i.type === 'terminology').length;
  const culturalIssues = issues.filter(i => i.type === 'cultural').length;
  const formattingIssues = issues.filter(i => i.type === 'formatting').length;

  if (terminologyIssues > 0) {
    suggestions.push(`Found ${terminologyIssues} terminology issues. Consider using the standardized mental health terminology dictionary.`);
  }

  if (culturalIssues > 0) {
    suggestions.push(`Found ${culturalIssues} cultural appropriateness issues. Review cultural adaptation guidelines for each language.`);
  }

  if (formattingIssues > 0) {
    suggestions.push(`Found ${formattingIssues} formatting issues. Ensure consistent punctuation and spacing.`);
  }

  return suggestions;
}

/**
 * Main validation function
 */
export async function validateTranslationQuality(): Promise<QualityReport> {
  console.log('🔍 Starting translation quality validation...');

  const issues: TranslationIssue[] = [];
  const translationDirs = [
    'packages/website/src/locales',
    'packages/website/src/client-locales'
  ];

  const languages = ['zh', 'es', 'ja', 'ko', 'hi', 'ar'];
  const modules = ['assessment', 'shared', 'home', 'guide', 'resources'];
  let totalFiles = 0;

  for (const dir of translationDirs) {
    for (const module of modules) {
      for (const lang of languages) {
        const filePath = path.join(process.cwd(), dir, module, `${lang}.ts`);

        try {
          await fs.access(filePath);
          totalFiles++;
          console.log(`Validating ${filePath}...`);

          const fileIssues = await validateTranslationFile(filePath, lang);
          issues.push(...fileIssues);
        } catch (error) {
          // File doesn't exist, skip
          continue;
        }
      }
    }
  }

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  const report: QualityReport = {
    summary: {
      totalFiles,
      totalIssues: issues.length,
      errorCount,
      warningCount,
      infoCount
    },
    issues,
    improvements: {
      terminology: issues.filter(i => i.type === 'terminology').length,
      consistency: issues.filter(i => i.type === 'consistency').length,
      cultural: issues.filter(i => i.type === 'cultural').length,
      formatting: issues.filter(i => i.type === 'formatting').length
    },
    generatedAt: new Date().toISOString()
  };

  // Save report
  const reportPath = path.join(process.cwd(), 'packages/website/reports/translation-quality-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  // Display summary
  console.log('\n📊 Translation Quality Report');
  console.log('================================');
  console.log(`Files validated: ${totalFiles}`);
  console.log(`Total issues: ${issues.length}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Warnings: ${warningCount}`);
  console.log(`  Info: ${infoCount}`);

  if (issues.length > 0) {
    console.log('\n🔧 Improvement Areas:');
    console.log(`  Terminology: ${report.improvements.terminology} issues`);
    console.log(`  Cultural: ${report.improvements.cultural} issues`);
    console.log(`  Formatting: ${report.improvements.formatting} issues`);

    console.log('\n💡 Suggestions:');
    const suggestions = generateImprovementSuggestions(issues);
    suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
  }

  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return report;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateTranslationQuality().catch(console.error);
}