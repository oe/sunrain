/**
 * Simple questionnaire utilities
 * Handles loading, scoring, and localization of questionnaires
 */

import type { Language } from './i18n';
import { DEFAULT_LANGUAGE } from './i18n';

// Types
export interface LocalizedQuestionnaire {
  id: string;
  title: string;
  description: string;
  instruction: string;
  estimatedMinutes: number;
  questionCount: number;
  category: string;
  options: Array<{ value: number; label: string }>;
  questions: Array<{ id: string; text: string }>;
  interpretations: Array<{
    range: [number, number];
    level: string;
    color: string;
    label: string;
    suggestion: string;
  }>;
  maxScore: number;
  disclaimer: string;
}

export interface AssessmentResult {
  id: string;
  questionnaireId: string;
  questionnaireTitle: string;
  answers: number[];
  score: number;
  level: string;
  label: string;
  color: string;
  suggestion: string;
  completedAt: string;
  language: Language;
}

/**
 * Get localized text from multi-language object
 * Handles fallback: zh-hant -> zh-hans -> en -> first available
 */
function getLocalizedText(
  obj: Record<string, string> | undefined,
  lang: Language
): string {
  if (!obj) return '';
  
  // Direct match
  if (obj[lang]) return obj[lang];
  
  // Fallback for Traditional Chinese to Simplified Chinese
  if (lang === 'zh-hant' && obj['zh-hans']) return obj['zh-hans'];
  
  // Fallback to English, then first available
  return obj[DEFAULT_LANGUAGE] || Object.values(obj)[0] || '';
}

/**
 * Transform raw questionnaire data to localized version
 */
export function localizeQuestionnaire(
  data: any,
  lang: Language
): LocalizedQuestionnaire {
  return {
    id: data.id,
    title: getLocalizedText(data.meta?.title, lang),
    description: getLocalizedText(data.meta?.description, lang),
    instruction: getLocalizedText(data.meta?.instruction, lang),
    estimatedMinutes: data.meta?.estimatedMinutes || 5,
    questionCount: data.meta?.questionCount || data.questions?.length || 0,
    category: data.category || 'general',
    options: (data.options || []).map((opt: any) => ({
      value: opt.value,
      label: getLocalizedText(opt.label, lang),
    })),
    questions: (data.questions || []).map((q: any) => ({
      id: q.id,
      text: getLocalizedText(q.text, lang),
    })),
    interpretations: (data.scoring?.interpretations || []).map((i: any) => ({
      range: i.range,
      level: i.level,
      color: i.color,
      label: getLocalizedText(i.label, lang),
      suggestion: getLocalizedText(i.suggestion, lang),
    })),
    maxScore: data.scoring?.maxScore || 27,
    disclaimer: getLocalizedText(data.disclaimer, lang),
  };
}

/**
 * Calculate total score from answers
 */
export function calculateScore(answers: number[]): number {
  return answers.reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Get interpretation based on score
 */
export function getInterpretation(
  score: number,
  interpretations: LocalizedQuestionnaire['interpretations']
) {
  return interpretations.find(
    (i) => score >= i.range[0] && score <= i.range[1]
  ) || interpretations[interpretations.length - 1];
}

/**
 * Generate unique result ID
 */
export function generateResultId(): string {
  return `result_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create assessment result from answers
 */
export function createAssessmentResult(
  questionnaire: LocalizedQuestionnaire,
  answers: number[],
  lang: Language
): AssessmentResult {
  const score = calculateScore(answers);
  const interpretation = getInterpretation(score, questionnaire.interpretations);
  
  return {
    id: generateResultId(),
    questionnaireId: questionnaire.id,
    questionnaireTitle: questionnaire.title,
    answers,
    score,
    level: interpretation?.level || 'unknown',
    label: interpretation?.label || '',
    color: interpretation?.color || '#gray',
    suggestion: interpretation?.suggestion || '',
    completedAt: new Date().toISOString(),
    language: lang,
  };
}

