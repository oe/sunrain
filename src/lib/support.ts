import pack from '@/data/support-copy.json';
import type { Language } from './i18n';

export function getSupportCopy(lang: Language) {
  // Deliberately no English fallback for health-related content.
  const copy = pack.locales[lang];
  if (!copy) throw new Error(`Missing support locale: ${lang}`);
  return copy;
}

export const supportSources = {
  youthHelp: { name: 'NHS · Mental health support for children and young people (England, English)', url: 'https://www.nhs.uk/mental-health/children-and-young-adults/mental-health-support/how-to-get-support/where-to-get-support/' },
  teenHelp: { name: 'NIMH · Teen Depression: More Than Just Moodiness (US, English)', url: 'https://www.nimh.nih.gov/health/publications/teen-depression' },
  selfCare: { name: 'NIMH · Caring for Your Mental Health', url: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health' },
  conversation: { name: 'NIMH · Tips for Talking With a Health Care Provider', url: 'https://www.nimh.nih.gov/health/publications/tips-for-talking-with-your-health-care-provider' },
  help: { name: 'NIMH · Help for Mental Illnesses', url: 'https://www.nimh.nih.gov/health/find-help' },
  grounding: { name: 'Royal United Hospitals Bath · Grounding exercises (PDF, English)', url: 'https://www.ruh.nhs.uk/patients/patient_information/PAE129_Mindfulness_and_grounding_exercises.pdf' },
  worries: { name: 'NHS · Tackling your worries (English)', url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/tackling-your-worries/' },
  problemSolving: { name: 'NHS · Problem solving (English)', url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/problem-solving/' },
  bipolar: { name: 'NIMH · Bipolar Disorder', url: 'https://www.nimh.nih.gov/health/publications/bipolar-disorder' },
  who: { name: 'WHO · Doing What Matters in Times of Stress', url: 'https://www.who.int/publications/i/item/9789240003927' },
};
