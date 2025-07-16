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
    /** 主标语 */
    tagline: string;
    /** 描述 */
    description: string;
    /** 自检按钮 */
    selfCheckButton: string;
    /** 快速放松按钮 */
    quickRelaxButton: string;
  };
  /** 核心功能区域 */
  features: {
    /** 标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 自检模块 */
    selfCheck: {
      title: string;
      description: string;
      button: string;
    };
    /** 日常练习模块 */
    dailyPractice: {
      title: string;
      description: string;
      button: string;
    };
    /** 快速缓解模块 */
    quickRelief: {
      title: string;
      description: string;
      button: string;
    };
    /** 疗愈图书馆模块 */
    healingLibrary: {
      title: string;
      description: string;
      button: string;
    };
    /** 心理百科模块 */
    psychologyWiki: {
      title: string;
      description: string;
      button: string;
    };
    /** 支持热线模块 */
    supportHotline: {
      title: string;
      description: string;
      button: string;
    };
  };
  /** 用户声音区域 */
  userVoices: {
    /** 标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 用户感言 */
    testimonials: {
      text: string;
      author: string;
    }[];
    /** 同感按钮 */
    feelSameButton: string;
  };
  /** 行动号召区域 */
  cta: {
    /** 主标题 */
    title: string;
    /** 描述 */
    description: string;
    /** 投稿按钮 */
    submitStoryButton: string;
    /** 正念练习按钮 */
    mindfulnessButton: string;
  };
}
