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
