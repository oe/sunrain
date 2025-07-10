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
    copyright: '© 2025 SunRain. All rights reserved.',
    mission: 'Spreading hope and healing through accessible mental health resources.',
  },
  language: {
    current: 'Language',
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
