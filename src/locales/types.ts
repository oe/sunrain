/**
 * 多语言翻译接口类型定义
 */

/** 共享翻译内容接口 */
export interface ISharedTranslations {
  /** 导航相关文案 */
  nav: {
    /** 首页 */
    home: string;
    /** 自助手册 */
    guide: string;
    /** 疗愈资源 */
    resources: string;
    /** 关于我们 */
    about: string;
  };
  /** 页脚相关文案 */
  footer: {
    /** 版权信息 */
    copyright: string;
    /** 网站使命 */
    mission: string;
  };
  /** 语言切换相关 */
  language: {
    /** 当前语言 */
    current: string;
  };
  /** 通用元数据 */
  meta: {
    /** 网站描述 */
    description: string;
  };
  /** 通用操作 */
  actions: {
    /** 阅读更多 */
    readMore: string;
    /** 返回到 */
    backTo: string;
    /** 即将推出 */
    comingSoon: string;
    /** 页面未找到 */
    pageNotFound: string;
  };
}

/** 首页翻译内容接口 */
export interface IHomeTranslations {
  /** 主要展示区域 */
  hero: {
    /** 主标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 行动号召按钮 */
    cta: string;
  };
  /** 指南介绍区域 */
  guide: {
    /** 标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
  };
  /** 资源介绍区域 */
  resources: {
    /** 标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 资源分类 */
    music: string;
    movies: string;
    books: string;
  };
  /** 行动按钮 */
  buttons: {
    /** 查看全部指南 */
    viewAllGuides: string;
    /** 查看全部资源 */
    viewAllResources: string;
  };
  /** 行动号召区域 */
  cta: {
    /** 主标题 */
    title: string;
    /** 描述 */
    description: string;
    /** 指南按钮 */
    guideButton: string;
    /** 资源按钮 */
    resourceButton: string;
  };
}

/** 指南页翻译内容接口 */
export interface IGuideTranslations {
  /** 页面基本信息 */
  page: {
    /** 页面标题 */
    title: string;
    /** 页面副标题 */
    subtitle: string;
    /** 页面描述 */
    description: string;
  };
  /** 指南列表相关 */
  list: {
    /** 查看全部按钮 */
    viewAll: string;
    /** 无指南提示 */
    noGuides: string;
    /** 加载中 */
    loading: string;
  };
  /** 指南详情相关 */
  detail: {
    /** 发布于 */
    publishedOn: string;
    /** 更新于 */
    updatedOn: string;
    /** 作者 */
    author: string;
    /** 标签 */
    tags: string;
    /** 目录 */
    tableOfContents: string;
    /** 分享这篇指南 */
    shareGuide: string;
  };
  /** 导航相关 */
  navigation: {
    /** 上一篇 */
    previous: string;
    /** 下一篇 */
    next: string;
    /** 返回指南列表 */
    backToGuides: string;
  };
}

/** 资源页翻译内容接口 */
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
}

/** 关于页翻译内容接口 */
export interface IAboutTranslations {
  /** 页面基本信息 */
  page: {
    /** 页面标题 */
    title: string;
    /** 页面副标题 */
    subtitle: string;
    /** 页面描述 */
    description: string;
  };
  /** 我们的使命 */
  mission: {
    /** 标题 */
    title: string;
    /** 描述 */
    description: string;
  };
  /** 我们的价值观 */
  values: {
    /** 可获得的 */
    accessible: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 富有同情心的 */
    compassionate: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 基于证据的 */
    evidenceBased: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
  };
  /** 我们的方法 */
  approach: {
    /** 标题 */
    title: string;
    /** 第一段 */
    paragraph1: string;
    /** 第二段 */
    paragraph2: string;
    /** 第三段 */
    paragraph3: string;
  };
  /** 我们提供什么 */
  offers: {
    /** 标题 */
    title: string;
    /** 自助指南 */
    guides: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 疗愈资源 */
    resources: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 多语言支持 */
    multilingual: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 支持性社区 */
    community: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
  };
  /** 免责声明 */
  disclaimer: {
    /** 标题 */
    title: string;
    /** 描述 */
    description: string;
  };
  /** 行动号召 */
  cta: {
    /** 标题 */
    title: string;
    /** 描述 */
    description: string;
    /** 指南按钮 */
    guides: string;
    /** 资源按钮 */
    resources: string;
  };
}

/** 页面类型枚举 */
export type PageType = 'home' | 'guide' | 'resources' | 'about';

/** 所有翻译内容的联合类型 */
export type AllTranslations = ISharedTranslations & IHomeTranslations & IGuideTranslations & IResourcesTranslations & IAboutTranslations;
