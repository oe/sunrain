import { describe, it, expect } from 'vitest';
import { getAssessmentTranslations, assessmentTranslations } from '..';

describe('Assessment translations', () => {
  it('should provide translations for declared languages', () => {
    const langs = Object.keys(assessmentTranslations);
    expect(langs.length).toBeGreaterThan(0);
    langs.forEach(l => {
      const t = getAssessmentTranslations(l as any);
      expect(t).toHaveProperty('common');
      expect(t).toHaveProperty('execution');
    });
  });

  it('should fallback to English for unsupported language', () => {
    const en = getAssessmentTranslations('en' as any);
    const fallback = getAssessmentTranslations('xx' as any);
    expect(fallback.common.title).toBe(en.common.title);
  });
});
