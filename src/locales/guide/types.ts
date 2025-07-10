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
