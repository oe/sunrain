import type { Language } from '@/lib/i18n';
import type { IconName } from '@/components/Icon';
import copy from './resource-copy.json';

export interface ResourceLink {
  id: keyof typeof copy.en.titles;
  title: string;
  url: string;
  source: string;
  language: string;
  audience?: string;
}
export interface ResourceCategory {
  id: string;
  icon: IconName;
  links: ResourceLink[];
}
const categories = [
  { id: 'anxiety', icon: 'Wind' }, { id: 'depression', icon: 'CloudRain' },
  { id: 'sleep', icon: 'CloudSun' }, { id: 'mindfulness', icon: 'BookOpen' },
] as const;

type Definition = Pick<ResourceLink, 'id' | 'url' | 'source'> & { adult?: boolean };
const definitions: Record<string, Definition[]> = {
  anxiety: [
    { id: 'adaa', url: 'https://adaa.org/understanding-anxiety', source: 'Anxiety & Depression Association of America' },
    { id: 'nimhAnxiety', url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders', source: 'National Institute of Mental Health' },
    { id: 'helpguide', url: 'https://www.helpguide.org/mental-health/anxiety/anxiety-disorders-and-anxiety-attacks', source: 'HelpGuide.org' },
  ],
  depression: [
    { id: 'nimhDepression', url: 'https://www.nimh.nih.gov/health/topics/depression', source: 'National Institute of Mental Health' },
    { id: 'nhsDepression', url: 'https://www.nhs.uk/mental-health/conditions/depression-in-adults/', source: 'NHS', adult: true },
    { id: 'apa', url: 'https://www.psychiatry.org/patients-families/depression/what-is-depression', source: 'American Psychiatric Association' },
  ],
  sleep: [
    { id: 'sleepFoundation', url: 'https://www.sleepfoundation.org/sleep-hygiene', source: 'Sleep Foundation' },
    { id: 'cdc', url: 'https://www.cdc.gov/sleep/about/', source: 'CDC' },
  ],
  mindfulness: [
    { id: 'mindful', url: 'https://www.mindful.org/meditation/mindfulness-getting-started/', source: 'Mindful.org' },
    { id: 'ucla', url: 'https://www.uclahealth.org/uclamindful/guided-meditations', source: 'UCLA Health' },
  ],
};

// Case-sensitive IDs read on the official page. Script preferences share the
// Mandarin audio section, rather than implying a country or care eligibility.
const audioSections: Record<Language, string> = {
  en: 'english', 'zh-hans': 'Mandarin', 'zh-hant': 'Mandarin', es: 'spanish',
  ja: 'japanese', ko: 'korean', hi: 'Hindi', ar: 'Arabic',
};
export function getResources(lang: Language): ResourceCategory[] {
  const local = copy[lang];
  if (!local) throw new Error(`Missing resource locale: ${lang}`);
  return categories.map(category => ({
    ...category,
    links: definitions[category.id].map(link => ({
      id: link.id, title: local.titles[link.id], source: link.source,
      url: link.id === 'ucla' ? `${link.url}#${audioSections[lang]}` : link.url,
      language: link.id === 'ucla' ? local.audio : local.english,
      audience: link.adult ? local.adult : undefined,
    })),
  }));
}
