/**
 * 资源页翻译内容接口类型定义
 */
export interface IResourcesTranslations {
  /** 页面主要信息 */
  page: {
    /** 页面标题 */
    title: string;
    /** 页面副标题 */
    subtitle: string;
    /** 页面描述 */
    description: string;
  };
  /** 资源分类 */
  categories: {
    /** 音乐 */
    music: string;
    /** 电影 */
    movies: string;
    /** 书籍 */
    books: string;
    /** 全部 */
    all: string;
  };
  /** 各分类详细信息 */
  sections: {
    /** 音乐部分 */
    music: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 电影部分 */
    movies: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 书籍部分 */
    books: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
  };
  /** 筛选相关 */
  filters: {
    /** 筛选标题 */
    title: string;
    /** 搜索占位符 */
    searchPlaceholder: string;
    /** 按类别筛选 */
    filterByCategory: string;
    /** 清除筛选 */
    clearFilters: string;
  };
  /** 资源详情 */
  details: {
    /** 作者 */
    author: string;
    /** 导演 */
    director: string;
    /** 艺术家 */
    artist: string;
    /** 年份 */
    year: string;
    /** 查看详情 */
    viewDetails: string;
    /** 关闭 */
    close: string;
  };
  /** 行动号召 */
  cta: {
    /** 标题 */
    title: string;
    /** 描述 */
    description: string;
    /** 按钮文字 */
    button: string;
  };
  /** 操作链接 */
  links: {
    /** Spotify */
    spotify: string;
    /** YouTube */
    youtube: string;
    /** 观看 */
    watch: string;
    /** 预告片 */
    trailer: string;
    /** Amazon */
    amazon: string;
    /** Goodreads */
    goodreads: string;
  };
  /** 危机热线页面 */
  crisis: {
    /** 页面标题 */
    title: string;
    /** 页面副标题 */
    subtitle: string;
    /** 页面描述 */
    description: string;
    /** 紧急提示 */
    emergency: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 筛选 */
    filters: {
      /** 搜索占位符 */
      searchPlaceholder: string;
      /** 选择国家/地区 */
      selectRegion: string;
      /** 全部 */
      allRegions: string;
    };
    /** 热线信息 */
    hotline: {
      /** 电话 */
      phone: string;
      /** 网站 */
      website: string;
      /** 可用时间 */
      available: string;
      /** 支持语言 */
      languages: string;
      /** 拨打 */
      call: string;
      /** 访问网站 */
      visitWebsite: string;
      /** 24/7 */
      available247: string;
    };
    /** 无结果 */
    noResults: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 免责声明 */
    disclaimer: string;
    /** 鼓励语句 */
    encouragement: {
      /** 标题 */
      title: string;
      /** 描述 */
      message: string;
    };
  };
}
