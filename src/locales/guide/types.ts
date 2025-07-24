/**
 * 指南页翻译内容接口类型定义
 */
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
    /** 精选指南 */
    featured: string;
    /** 所有指南 */
    allGuides: string;
    /** 精选标签 */
    featuredTag: string;
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
  /** 操作相关 */
  actions: {
    /** 阅读更多 */
    readMore: string;
    /** 返回到 */
    backTo: string;
    /** 打印 */
    print: string;
    /** 分享 */
    share: string;
  };
  /** 帮助相关 */
  help: {
    /** 需要更多帮助 */
    needMoreHelp: string;
    /** 帮助描述 */
    helpDescription: string;
    /** 探索资源 */
    exploreResources: string;
    /** 获取紧急帮助 */
    getEmergencyHelp: string;
  };
  /** 空状态 */
  empty: {
    /** 无指南可用 */
    noGuidesAvailable: string;
    /** 空状态描述 */
    emptyDescription: string;
  };
}
