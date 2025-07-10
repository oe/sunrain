/**
 * 首页翻译内容接口类型定义
 */
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
