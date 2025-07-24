/**
 * 指南页面中文翻译内容
 */
import type { IGuideTranslations } from './types';

export const guideZh: IGuideTranslations = {
  page: {
    title: '心理健康自助手册',
    subtitle: '焦虑、睡眠和情绪管理的实用资源',
    description: '探索我们全面的心理健康指南集合，涵盖焦虑、抑郁、睡眠问题和情绪调节。',
  },
  list: {
    viewAll: '查看全部指南',
    noGuides: '暂时没有可用的指南。',
    loading: '正在加载指南...',
    featured: '精选指南',
    allGuides: '所有指南',
    featuredTag: '精选',
  },
  detail: {
    publishedOn: '发布于',
    updatedOn: '更新于',
    author: '作者',
    tags: '标签',
    tableOfContents: '目录',
    shareGuide: '分享这篇指南',
  },
  navigation: {
    previous: '上一篇',
    next: '下一篇',
    backToGuides: '返回指南列表',
  },
  actions: {
    readMore: '阅读更多',
    backTo: '返回到',
    print: '打印',
    share: '分享',
  },
  help: {
    needMoreHelp: '需要更多帮助？',
    helpDescription: '如果您正在经历心理健康危机或需要即时支持，请不要犹豫寻求专业帮助。',
    exploreResources: '探索资源',
    getEmergencyHelp: '获取紧急帮助',
  },
  empty: {
    noGuidesAvailable: '暂无指南',
    emptyDescription: '请稍后查看新的心理健康指南和资源。',
  },
};

export default guideZh;
