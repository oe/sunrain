/**
 * 关于页翻译内容接口类型定义
 */
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
  /** 团队介绍 */
  team: {
    /** 标题 */
    title: string;
    /** 描述 */
    description: string;
    /** 团队成员 */
    members: {
      /** 开发者 */
      developer: {
        /** 角色 */
        role: string;
        /** 描述 */
        description: string;
      };
      /** 内容策划 */
      curator: {
        /** 角色 */
        role: string;
        /** 描述 */
        description: string;
      };
      /** 社区 */
      community: {
        /** 角色 */
        role: string;
        /** 描述 */
        description: string;
      };
    };
  };
  /** 信任建立 */
  trust: {
    /** 标题 */
    title: string;
    /** 隐私 */
    privacy: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 开源 */
    openSource: {
      /** 标题 */
      title: string;
      /** 描述 */
      description: string;
    };
    /** 无广告 */
    noAds: {
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
    /** 指南按钮 */
    guides: string;
    /** 资源按钮 */
    resources: string;
  };
}
