/**
 * 英文公共翻译内容
 * 包含导航、页脚、通用按钮等共享文案
 */
import type { ISharedTranslations } from './types';

export const sharedEn: ISharedTranslations = {
  nav: {
    home: 'Home',
    guide: 'Self-Help Guide',
    resources: 'Resources',
    about: 'About',
  },
  footer: {
    copyright: '© 2025 Sunrain. All rights reserved.',
    mission: 'Global anonymous mental health support platform, spreading hope and healing.',
    quickLinks: 'Quick Links',
    community: 'Community',
    features: 'Features',
    about: 'About Us',
    support: 'Support',
    privacy: 'Privacy Policy',
    submitStory: 'Submit Story',
    github: 'GitHub',
    helpCenter: 'Help Center',
    selfCheck: 'Self-Check',
    healingResources: 'Healing Resources',
    crisisHotline: 'Crisis Hotline',
    multilingual: 'Multilingual',
    accessibility: 'Accessibility',
  },
  language: {
    current: 'Language',
    switchTo: 'Switch to',
  },
  theme: {
    toggle: 'Toggle theme',
    light: 'Light mode',
    dark: 'Dark mode',
    system: 'System default',
  },
  meta: {
    description: 'Mental health resources and self-help guides for anxiety, depression, sleep and emotional well-being.',
  },
  resources: {
    music: 'Music',
    books: 'Books',
  },
  actions: {
    readMore: 'Read More',
    backTo: 'Back to',
    comingSoon: 'Coming Soon',
    pageNotFound: 'Page Not Found',
  },
};

export default sharedEn;
