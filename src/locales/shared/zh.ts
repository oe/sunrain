/**
 * 中文公共翻译内容
 * 包含导航、页脚、通用按钮等共享文案
 */
import type { ISharedTranslations } from './types';

export const sharedZh: ISharedTranslations = {
  nav: {
    home: '首页',
    guide: '自助手册',
    resources: '疗愈资源',
    about: '关于我们',
  },
  footer: {
    copyright: '© 2025 晴雨. 保留所有权利.',
    mission: '通过易于获取的心理健康资源传播希望和治愈.',
  },
  language: {
    current: '语言',
  },
  meta: {
    description: '心理健康资源和自助指南，帮助处理焦虑、抑郁、睡眠和情绪健康问题。',
  },
  resources: {
    music: '音乐',
    books: '书籍',
  },
  actions: {
    readMore: '了解更多',
    backTo: '返回',
    comingSoon: '即将推出',
    pageNotFound: '页面未找到',
  },
};

export default sharedZh;
