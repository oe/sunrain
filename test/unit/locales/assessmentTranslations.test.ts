import { describe, it, expect } from 'vitest';
import { getAssessmentTranslations, assessmentTranslations } from '@/locales/assessment';

describe('Assessment translations', () => {
  it('provides translation objects for languages', () => {
    const langs = Object.keys(assessmentTranslations);
    expect(langs.length).toBeGreaterThan(0);
    langs.forEach(l => {
      const t = getAssessmentTranslations(l as any);
      expect(t).toHaveProperty('common');
      expect(t).toHaveProperty('execution');
    });
  });

  it('falls back to English for unsupported language', () => {
    const en = getAssessmentTranslations('en' as any);
    const fallback = getAssessmentTranslations('xx' as any);
    expect(fallback.common.title).toBe(en.common.title);
  });
});
