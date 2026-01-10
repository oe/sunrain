import type { Language } from '@/lib/i18n';
import type { IconName } from '@/components/Icon';

export interface ResourceLink {
  title: string;
  url: string;
  source: string;
}

export interface ResourceCategory {
  id: string;
  icon: IconName;
  links: ResourceLink[];
}

const commonCategories = [
  { id: 'anxiety', icon: 'Wind' as IconName },
  { id: 'depression', icon: 'CloudRain' as IconName },
  { id: 'sleep', icon: 'CloudSun' as IconName },
  { id: 'mindfulness', icon: 'BookOpen' as IconName },
];

const enLinks: Record<string, ResourceLink[]> = {
  anxiety: [
    { title: 'ADAA: Understanding Anxiety', url: 'https://adaa.org/understanding-anxiety', source: 'Anxiety & Depression Association of America' },
    { title: 'NIMH: Anxiety Disorders', url: 'https://www.nimh.nih.gov/health/topics/anxiety', source: 'National Institute of Mental Health' },
    { title: 'HelpGuide: Anxiety', url: 'https://www.helpguide.org/articles/anxiety/anxiety-disorders-and-anxiety-attacks.htm', source: 'HelpGuide.org' }
  ],
  depression: [
    { title: 'NIMH: Depression', url: 'https://www.nimh.nih.gov/health/topics/depression', source: 'National Institute of Mental Health' },
    { title: 'NHS: Clinical Depression', url: 'https://www.nhs.uk/mental-health/conditions/clinical-depression', source: 'NHS UK' },
    { title: 'APA: What is Depression?', url: 'https://www.psychiatry.org/patients-families/depression/what-is-depression', source: 'American Psychiatric Association' }
  ],
  sleep: [
    { title: 'Sleep Hygiene Tips', url: 'https://www.sleepfoundation.org/sleep-hygiene', source: 'Sleep Foundation' },
    { title: 'Healthy Sleep Habits', url: 'https://www.cdc.gov/sleep/about_sleep/sleep_hygiene.html', source: 'CDC' }
  ],
  mindfulness: [
    { title: 'Getting Started with Mindfulness', url: 'https://www.mindful.org/meditation/mindfulness-getting-started/', source: 'Mindful.org' },
    { title: 'Free Mindfulness Exercises', url: 'https://www.uclahealth.org/marc/mindful-meditations', source: 'UCLA Health' }
  ]
};


// For now, reuse EN for others but allow structure for future expansion
const defaultLinks = enLinks;

const resources: Record<Language, ResourceCategory[]> = {
  en: commonCategories.map(c => ({ ...c, links: enLinks[c.id] || [] })),
  'zh-hans': commonCategories.map(c => ({ ...c, links: defaultLinks[c.id] || [] })),
  'zh-hant': commonCategories.map(c => ({ ...c, links: defaultLinks[c.id] || [] })), // Pending specific TW resources
  es: commonCategories.map(c => ({ ...c, links: defaultLinks[c.id] || [] })),
  ja: commonCategories.map(c => ({ ...c, links: defaultLinks[c.id] || [] })),
  ko: commonCategories.map(c => ({ ...c, links: defaultLinks[c.id] || [] })),
  hi: commonCategories.map(c => ({ ...c, links: defaultLinks[c.id] || [] })),
  ar: commonCategories.map(c => ({ ...c, links: defaultLinks[c.id] || [] })),
};

export function getResources(lang: Language): ResourceCategory[] {
  return resources[lang] || resources['en'];
}
