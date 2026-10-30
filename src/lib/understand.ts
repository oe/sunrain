import en from '@/data/understand/en.json';
import zhHans from '@/data/understand/zh-hans.json';
import zhHant from '@/data/understand/zh-hant.json';
import es from '@/data/understand/es.json';
import ja from '@/data/understand/ja.json';
import ko from '@/data/understand/ko.json';
import hi from '@/data/understand/hi.json';
import ar from '@/data/understand/ar.json';
import type { Language } from './i18n';

const copy: Record<Language, typeof en> = { en, 'zh-hans': zhHans, 'zh-hant': zhHant, es, ja, ko, hi, ar };

// Patient education, independent of questionnaire forms, scoring and consent.
export function getUnderstandingCopy(lang: Language) {
  if (!copy[lang]) throw new Error(`Missing understanding content: ${lang}`);
  return copy[lang];
}

export const understandingSources = {
  nimhDepression: { title: 'NIMH · Depression', url: 'https://www.nimh.nih.gov/health/topics/depression' },
  niceDepression: { title: 'NICE NG222 · Depression in adults: treatment and management', url: 'https://www.nice.org.uk/guidance/ng222/chapter/Recommendations' },
  teenDepression: { title: 'NIMH · Teen Depression: More Than Just Moodiness', url: 'https://www.nimh.nih.gov/health/publications/teen-depression' },
  niceAnxiety: { title: 'NICE CG113 · Generalised anxiety disorder and panic disorder in adults', url: 'https://www.nice.org.uk/guidance/cg113/chapter/Recommendations' },
  nhsPanic: { title: 'NHS · Panic disorder', url: 'https://www.nhs.uk/mental-health/conditions/panic-disorder/' },
  nhsChest: { title: 'NHS · Chest pain', url: 'https://www.nhs.uk/symptoms/chest-pain/' },
  nhsWorries: { title: 'NHS · Tackling your worries', url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/tackling-your-worries/' },
  nhsInsomnia: { title: 'NHS · Insomnia', url: 'https://www.nhs.uk/conditions/insomnia/' },
  nimhBipolar: { title: 'NIMH · Bipolar Disorder', url: 'https://www.nimh.nih.gov/health/publications/bipolar-disorder' },
  niceBipolar: { title: 'NICE CG185 · Bipolar disorder: assessment and management', url: 'https://www.nice.org.uk/guidance/cg185/chapter/Recommendations' },
  nimhSelfCare: { title: 'NIMH · Caring for Your Mental Health', url: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health' },
  nimhConversation: { title: 'NIMH · Tips for Talking With a Health Care Provider About Your Mental Health', url: 'https://www.nimh.nih.gov/health/publications/tips-for-talking-with-your-health-care-provider' },
} as const;

export const UNDERSTAND_TOPICS = {
  depression: { activity: '/self-help/one-step/', sources: ['nimhDepression', 'niceDepression', 'teenDepression', 'nimhSelfCare', 'nimhConversation'] },
  anxiety: { activity: '/self-help/worry/', sources: ['niceAnxiety', 'nhsPanic', 'nhsChest', 'nhsWorries', 'nimhConversation'] },
  sleep: { activity: '/self-help/sleep/', sources: ['nhsInsomnia', 'nimhBipolar', 'nimhConversation'] },
  bipolar: { activity: '/self-help/', sources: ['nimhBipolar', 'niceBipolar', 'nimhConversation'] },
} as const;
export type UnderstandingTopic = keyof typeof UNDERSTAND_TOPICS;
export const UNDERSTANDING_CHECKED = '2026-10-29';
export const UNDERSTANDING_PRACTICE_CHECKED = '2026-10-30';
