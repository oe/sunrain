/**
 * 共享翻译内容接口类型定义
 *
 * @format
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
    /** 心理测评 */
    assessment: string;
  };
  /** 页脚相关文案 */
  footer: {
    /** 版权信息 */
    copyright: string;
    /** 网站使命 */
    mission: string;
    /** 快捷链接 */
    quickLinks: string;
    /** 社区 */
    community: string;
    /** 功能 */
    features: string;
    /** 关于我们 */
    about: string;
    /** 支持 */
    support: string;
    /** 隐私政策 */
    privacy: string;
    /** 投稿故事 */
    submitStory: string;
    /** GitHub */
    github: string;
    /** 帮助中心 */
    helpCenter: string;
    /** 心理测评 */
    selfCheck: string;
    /** 疗愈资源 */
    healingResources: string;
    /** 危机热线 */
    crisisHotline: string;
    /** 多语言 */
    multilingual: string;
    /** 无障碍 */
    accessibility: string;
  };
  /** 语言切换相关 */
  language: {
    /** 当前语言 */
    current: string;
    /** 切换到 */
    switchTo: string;
  };
  /** 主题切换相关 */
  theme: {
    /** 切换主题 */
    toggle: string;
    /** 浅色模式 */
    light: string;
    /** 深色模式 */
    dark: string;
    /** 系统默认 */
    system: string;
  };
  resources: {
    /** 音乐资源 */
    music: string;
    /** 书籍资源 */
    books: string;
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
