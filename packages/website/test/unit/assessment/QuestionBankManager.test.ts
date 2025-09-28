import { describe, it, expect, beforeEach } from 'vitest';
import { QuestionBankManager } from '@/lib/assessment/QuestionBankManager';

describe('QuestionBankManager (restored comprehensive tests)', () => {
  let manager: QuestionBankManager;

  beforeEach(() => {
    manager = new QuestionBankManager();
  });

  it('returns all assessment types with required structure', () => {
    const types = manager.getAssessmentTypes();
    expect(Array.isArray(types)).toBe(true);
    expect(types.length).toBeGreaterThan(0);

    for (const t of types) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(Array.isArray(t.questions)).toBe(true);
      expect(t.questions.length).toBeGreaterThan(0);
    }
  });

  it('gets assessment type by id', () => {
    const type = manager.getAssessmentType('phq-9');
    expect(type).toBeDefined();
    expect(type?.id).toBe('phq-9');
  });

  it('returns undefined for unknown assessment type', () => {
    const type = manager.getAssessmentType('unknown');
    expect(type).toBeUndefined();
  });

  it('provides localized content for known language', () => {
    const localized = manager.getLocalizedAssessmentType('phq-9', 'en');
    expect(localized).toBeDefined();
    expect(localized?.name).toBeTruthy();
    expect(localized?.questions[0].text).toBeTruthy();
  });

  it('falls back gracefully for unsupported locale', () => {
    const localized = manager.getLocalizedAssessmentType('phq-9', 'xx');
    // Should still get an assessment in default language
    expect(localized).toBeDefined();
    expect(localized?.id).toBe('phq-9');
  });

  it('aggregates all questions across assessments (via assessment types)', () => {
    const types = manager.getAssessmentTypes();
    const questions = types.flatMap(t => t.questions);
    expect(questions.length).toBeGreaterThan(5);
    const ids = new Set(questions.map(q => q.id));
    expect(ids.size).toBe(questions.length); // uniqueness
  });

  it('includes options and required flags for at least one single choice question', () => {
    const types = manager.getAssessmentTypes();
    const allQuestions = types.flatMap(t => t.questions);
    const singleChoice = allQuestions.find(q => q.type === 'single_choice');
    expect(singleChoice).toBeDefined();
    if (singleChoice) {
      expect(Array.isArray(singleChoice.options)).toBe(true);
      expect(singleChoice.options!.length).toBeGreaterThan(0);
      expect(typeof singleChoice.required).toBe('boolean');
    }
  });

  it('returns localized versions with culturally appropriate fields when available', () => {
    const zhLocalized = manager.getLocalizedAssessmentType('phq-9', 'zh');
    expect(zhLocalized).toBeDefined();
    const enLocalized = manager.getLocalizedAssessmentType('phq-9', 'en');
    if (zhLocalized && enLocalized) {
      expect(zhLocalized.name).toBeTruthy();
      expect(enLocalized.name).toBeTruthy();
    }
  });

  it('ensures deterministic order of questions within an assessment', () => {
    const type1 = manager.getAssessmentType('phq-9');
    const type2 = manager.getAssessmentType('phq-9');
    expect(type1 && type2).toBeTruthy();
    if (type1 && type2) {
      const ids1 = type1.questions.map(q => q.id);
      const ids2 = type2.questions.map(q => q.id);
      expect(ids1).toEqual(ids2);
    }
  });

  it('question localization does not mutate original question objects', () => {
    const base = manager.getAssessmentType('phq-9');
    const localizedZh = manager.getLocalizedAssessmentType('phq-9', 'zh');
    expect(base && localizedZh).toBeTruthy();
    if (base && localizedZh) {
      // Ensure a translated question differs in text but original remains
      const idx = base.questions.findIndex(q => q.id === 'phq9-1');
      expect(idx).toBeGreaterThanOrEqual(0);
      if (idx >= 0) {
        const baseQ = base.questions[idx];
        const zhQ = localizedZh.questions[idx];
        if (baseQ.text !== zhQ.text) {
          // original English text should still be intact
          expect(baseQ.text).toBe('Little interest or pleasure in doing things');
        }
      }
    }
  });
});
