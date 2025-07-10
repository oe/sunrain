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
};

export default guideZh;
