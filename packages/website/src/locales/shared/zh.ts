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
    assessment: '心理测评'
  },
  footer: {
    copyright: '© 2025 Sunrain. 保留所有权利.',
    mission: '全球匿名心理支持平台，传播希望和治愈。',
    quickLinks: '快捷链接',
    community: '社区',
    features: '功能',
    about: '关于我们',
    support: '支持',
    privacy: '隐私政策',
    submitStory: '投稿故事',
    github: 'GitHub',
    helpCenter: '帮助中心',
    selfCheck: '心理测评',
    healingResources: '疗愈资源',
    crisisHotline: '危机热线',
    multilingual: '多语言',
    accessibility: '无障碍'
  },
  language: {
    current: '语言',
    switchTo: '切换到'
  },
  theme: {
    toggle: '切换主题',
    light: '浅色模式',
    dark: '深色模式',
    system: '系统默认'
  },
  meta: {
    description:
      '心理健康资源和自助指南，帮助处理焦虑、抑郁、睡眠和情绪健康问题。'
  },
  resources: {
    music: '音乐',
    books: '书籍'
  },
  actions: {
    readMore: '了解更多',
    backTo: '返回',
    comingSoon: '即将推出',
    pageNotFound: '页面未找到'
  }
};

export default sharedZh;
