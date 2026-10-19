/**
 * Simple questionnaire utilities
 * Handles loading, scoring, and localization of questionnaires
 */

import type { Language } from './i18n';
import { calculateScore, getInterpretation } from './screening.mjs';
export { calculateScore, getInterpretation } from './screening.mjs';

// Types
export interface LocalizedQuestionnaire {
  id: string;
  version: string;
  title: string;
  description: string;
  instruction: string;
  estimatedMinutes: number;
  questionCount: number;
  category: string;
  options: Array<{ value: number; label: string }>;
  questions: Array<{ id: string; text: string }>;
  safetyTriggers: Array<{ questionId: string; minValue: number }>;
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
 * Health questionnaires must use the exact verified locale, with no fallback.
 */
function getLocalizedText(
  obj: Record<string, string> | undefined,
  lang: Language
): string {
  if (typeof obj?.[lang] !== 'string' || !obj[lang].trim()) throw new Error(`Missing questionnaire translation: ${lang}`);
  return obj[lang];
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
    version: data.version,
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
    safetyTriggers: data.safety?.responseTriggers || [],
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

/**
 * Get interpretation based on score
 */

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
  const score = calculateScore(answers, questionnaire.questions.length, questionnaire.options.map(o=>o.value));
  const interpretation = getInterpretation(score, questionnaire.interpretations);
  if (!interpretation) throw new Error('No unambiguous score interpretation');
  
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
