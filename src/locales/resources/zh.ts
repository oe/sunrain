/**
 * 资源页面中文翻译内容
 */
import type { IResourcesTranslations } from './types';

export const resourcesZh: IResourcesTranslations = {
  page: {
    title: '疗愈资源',
    subtitle: '精选音乐、电影和书籍，促进心理健康',
    description: '发现精心挑选的音乐、电影和书籍，它们可以支持您的心理健康之旅，在困难时期提供安慰。',
  },
  categories: {
    music: '音乐',
    movies: '电影',
    books: '书籍',
    all: '全部',
  },
  sections: {
    music: {
      title: '疗愈音乐',
      description: '旨在平静心灵、减轻压力的舒缓旋律和声音。',
    },
    movies: {
      title: '励志电影',
      description: '激发希望、韧性和积极思维的电影。',
    },
    books: {
      title: '健康书籍',
      description: '为心理健康提供见解、策略和安慰的书籍。',
    },
  },
  filters: {
    title: '筛选资源',
    searchPlaceholder: '搜索资源...',
    filterByCategory: '按类别筛选',
    clearFilters: '清除筛选',
  },
  details: {
    author: '作者',
    director: '导演',
    artist: '艺术家',
    year: '年份',
    viewDetails: '查看详情',
    close: '关闭',
  },
  cta: {
    title: '准备好开始您的疗愈之旅了吗？',
    description: '探索我们全面的自助指南，获取实用的心理健康策略。',
    button: '浏览指南',
  },
  links: {
    spotify: 'Spotify',
    youtube: 'YouTube',
    watch: '观看',
    trailer: '预告片',
    amazon: 'Amazon',
    goodreads: 'Goodreads',
  },
  crisis: {
    title: '危机热线',
    subtitle: '24/7 心理健康支持',
    description: '按国家/地区查找专业的心理健康危机支持热线和资源。这些服务为处于困境中的人们提供免费、保密的支持。',
    emergency: {
      title: '🚨 处于紧急危险中？',
      description: '如果您处于紧急危险中或正在经历危及生命的紧急情况，请立即拨打当地紧急服务电话（例如，美国拨打911，英国拨打999）。',
    },
    filters: {
      searchPlaceholder: '按国家或热线名称搜索...',
      selectRegion: '选择国家/地区',
      allRegions: '所有国家/地区',
    },
    hotline: {
      phone: '电话',
      website: '网站',
      available: '可用时间',
      languages: '支持语言',
      call: '拨打',
      visitWebsite: '访问网站',
      available247: '24/7',
    },
    noResults: {
      title: '未找到热线',
      description: '请尝试调整您的搜索或筛选条件。',
    },
    disclaimer: '此信息仅供参考。我们不认可或保证所列服务的质量。使用前请核实当前的联系信息。',
    encouragement: {
      title: '你并不孤单',
      message: '阳光遇见雨的地方，希望与治愈始终触手可及。寻求帮助是勇敢的表现，而非软弱。',
    },
  },
};

export default resourcesZh;
