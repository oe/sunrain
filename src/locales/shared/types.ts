/**
 * 共享翻译内容接口类型定义
 */
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
  resources: {
    /** 音乐资源 */
    music: string;
    /** 书籍资源 */
    books: string;
  },
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
