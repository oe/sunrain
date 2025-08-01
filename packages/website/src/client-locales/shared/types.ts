/**
 * CSR (Client-Side Rendering) 翻译内容接口类型定义
 *
 * 此文件定义了客户端组件专用的翻译接口，与SSG翻译系统分离
 * 主要用于React组件中的动态翻译内容
 */

import type { Language } from '@sunrain/shared';

/**
 * 基础翻译接口
 */
export interface BaseTranslations {
  [key: string]: string | BaseTranslations;
}

/**
 * CSR翻译系统的核心接口
 */
export interface CSRTranslations extends BaseTranslations {
  /** 客户端特定的翻译内容 */
  client: {
    /** 加载状态相关文案 */
    loading: {
      [key: string]: string;
    };
    /** 错误信息相关文案 */
    errors: {
      [key: string]: string;
    };
    /** 操作按钮相关文案 */
    actions: {
      [key: string]: string;
    };
  };
  /** 交互式组件翻译内容 */
  interactive: {
    [key: string]: string | BaseTranslations;
  };
}

/**
 * 共享CSR翻译接口
 */
export interface ISharedCSRTranslations extends CSRTranslations {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 通用加载 */
      general: string;
      /** 数据加载 */
      data: string;
      /** 翻译加载 */
      translations: string;
    };
    /** 错误信息 */
    errors: {
      /** 通用错误 */
      general: string;
      /** 网络错误 */
      network: string;
      /** 加载失败 */
      loadFailed: string;
      /** 翻译缺失 */
      translationMissing: string;
    };
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: string;
      /** 取消 */
      cancel: string;
      /** 确认 */
      confirm: string;
      /** 关闭 */
      close: string;
    };
  };
  /** 交互式组件 */
  interactive: {
    /** 语言切换器 */
    languageSwitcher: {
      /** 当前语言 */
      current: string;
      /** 切换到 */
      switchTo: string;
      /** 语言选择 */
      selectLanguage: string;
    };
    /** 主题切换器 */
    themeSwitcher: {
      /** 切换主题 */
      toggle: string;
      /** 浅色模式 */
      light: string;
      /** 深色模式 */
      dark: string;
      /** 系统默认 */
      system: string;
    };
    /** 移动端菜单 */
    mobileMenu: {
      /** 打开菜单 */
      open: string;
      /** 关闭菜单 */
      close: string;
      /** 菜单 */
      menu: string;
    };
  };
}

/**
 * 评测系统CSR翻译接口
 */
export interface IAssessmentCSRTranslations extends CSRTranslations {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 评测加载 */
      assessment: string;
      /** 翻译加载 */
      translations: string;
      /** 问题加载 */
      question: string;
      /** 结果分析 */
      analysis: string;
      /** 历史记录 */
      history: string;
    };
    /** 错误信息 */
    errors: {
      /** 错误标题 */
      title: string;
      /** 会话启动失败 */
      sessionStartFailed: string;
      /** 初始化失败 */
      initializationFailed: string;
      /** 提交失败 */
      submitFailed: string;
      /** 分析失败 */
      analysisFailed: string;
      /** 无数据 */
      noData: string;
      /** 无效量表 */
      invalidScale: string;
      /** 文本过长 */
      textTooLong: string;
      /** 不支持的问题类型 */
      unsupportedQuestionType: string;
      /** 网络错误 */
      networkError: string;
      /** 超时错误 */
      timeoutError: string;
    };
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: string;
      /** 上一题 */
      previous: string;
      /** 下一题 */
      next: string;
      /** 完成 */
      complete: string;
      /** 保存 */
      save: string;
      /** 已保存 */
      saved: string;
      /** 暂停 */
      pause: string;
      /** 继续 */
      continue: string;
      /** 退出 */
      exit: string;
      /** 开始新评测 */
      startNew: string;
    };
  };
  /** 交互式组件 */
  interactive: {
    /** 进度显示 */
    progress: {
      /** 进度文本 */
      text: string;
      /** 完成百分比 */
      percentage: string;
      /** 剩余时间 */
      timeRemaining: string;
    };
    /** 问题显示 */
    question: {
      /** 问题编号 */
      number: string;
      /** 必答标记 */
      required: string;
      /** 已选择数量 */
      selectedCount: string;
      /** 已选择值 */
      selectedValue: string;
      /** 文本输入占位符 */
      textPlaceholder: string;
      /** 字符计数 */
      characterCount: string;
      /** 已输入文本 */
      textEntered: string;
      /** 已回答 */
      answered: string;
      /** 跳过 */
      skip: string;
    };
    /** 导航控制 */
    navigation: {
      /** 上一题 */
      previous: string;
      /** 下一题 */
      next: string;
      /** 跳转到 */
      goTo: string;
      /** 问题列表 */
      questionList: string;
    };
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: string;
        /** 暂停 */
        paused: string;
        /** 已完成 */
        completed: string;
      };
      /** 自动保存 */
      autoSave: {
        /** 保存中 */
        saving: string;
        /** 已保存 */
        saved: string;
        /** 保存失败 */
        failed: string;
      };
    };
    /** 结果显示 */
    results: {
      /** 分享选项 */
      share: {
        /** 分享结果 */
        title: string;
        /** 复制链接 */
        copyLink: string;
        /** 已复制 */
        copied: string;
        /** 下载PDF */
        downloadPdf: string;
      };
      /** 图表交互 */
      charts: {
        /** 显示详情 */
        showDetails: string;
        /** 隐藏详情 */
        hideDetails: string;
        /** 切换视图 */
        toggleView: string;
      };
    };
    /** 历史记录 */
    history: {
      /** 筛选器 */
      filters: {
        /** 应用筛选 */
        apply: string;
        /** 清除筛选 */
        clear: string;
        /** 筛选选项 */
        options: string;
      };
      /** 排序 */
      sorting: {
        /** 按日期排序 */
        byDate: string;
        /** 按类型排序 */
        byType: string;
        /** 按分数排序 */
        byScore: string;
        /** 升序 */
        ascending: string;
        /** 降序 */
        descending: string;
      };
    };
  };
}

/**
 * CSR翻译管理器配置接口
 */
export interface CSRTranslationConfig {
  /** 支持的语言 */
  supportedLanguages: Language[];
  /** 默认语言 */
  defaultLanguage: Language;
  /** 翻译文件路径 */
  translationPath: string;
  /** 缓存配置 */
  cache: {
    /** 是否启用缓存 */
    enabled: boolean;
    /** 缓存过期时间（毫秒） */
    ttl: number;
    /** 最大缓存条目数 */
    maxEntries: number;
  };
  /** 预加载配置 */
  preload: {
    /** 是否启用预加载 */
    enabled: boolean;
    /** 预加载的命名空间 */
    namespaces: string[];
    /** 预加载的语言 */
    languages: Language[];
  };
}

/**
 * 翻译加载状态
 */
export interface TranslationLoadState {
  /** 是否正在加载 */
  loading: boolean;
  /** 是否已加载 */
  loaded: boolean;
  /** 错误信息 */
  error?: string;
  /** 加载进度 */
  progress?: number;
}

/**
 * 翻译上下文接口
 */
export interface TranslationContext {
  /** 当前语言 */
  language: Language;
  /** 当前命名空间 */
  namespace: string;
  /** 翻译内容 */
  translations: CSRTranslations;
  /** 加载状态 */
  loadState: TranslationLoadState;
  /** 切换语言函数 */
  switchLanguage: (language: Language) => Promise<void>;
  /** 格式化消息函数 */
  formatMessage: (key: string, params?: Record<string, any>) => string;
}

/**
 * 翻译键路径类型
 */
export type TranslationKeyPath<T> = T extends string
  ? never
  : T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends string
          ? K
          : T[K] extends object
          ? `${K}.${TranslationKeyPath<T[K]>}`
          : never
        : never;
    }[keyof T]
  : never;

/**
 * 获取翻译值的类型
 */
export type TranslationValue<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends `${infer P}.${infer S}`
  ? P extends keyof T
    ? TranslationValue<T[P], S>
    : never
  : never;
