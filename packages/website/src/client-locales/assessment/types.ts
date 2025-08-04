/**
 * Assessment 系统CSR翻译类型定义
 * 匹配实际使用的翻译键结构，包含client前缀
 */

export interface IAssessmentTranslations {
  /** 客户端特定翻译内容 */
  /** 评测相关 */
  assessment: {
    title: string;
  };

  /** 加载状态 */
  loading: {
    default: string;
    assessment: string;
  };

  /** 错误信息 */
  errors: {
    title: string;
    initializationFailed: string;
    sessionStartFailed: string;
    noData: string;
    validationFailed: string;
    unsupportedQuestionType: string;
    boundary: {
      title: string;
      message: string;
      details: string;
      retry: string;
      goHome: string;
    };
  };

  /** 问题相关 */
  question: {
    number: string;
    required: string;
    selectedCount: string;
    selectedValue: string;
    textPlaceholder: string;
    characterCount: string;
    textEntered: string;
    answered: string;
  };

  /** 问题列表 */
  questionList: {
    title: string;
    progress: string;
    questionNumber: string;
    completed: string;
    remaining: string;
  };

  /** 继续评测页面 */
  continue: {
    loading: string;
  };

  /** 评测列表页面 */
  list: {
    activeSessions: {
      title: string;
      continueLink: string;
      lastActivity: string;
      progress: string;
    };
  };

  /** 进度相关 */
  progress: {
    text: string;
  };

  /** 验证相关 */
  validation: {
    checking: string;
  };

  /** 执行相关 */
  execution: {
    errors: {
      submitFailed: string;
      required: string;
    };
    completion: {
      title: string;
      message: string;
    };
    pauseModal: {
      title: string;
      message: string;
      continue: string;
      exit: string;
    };
    navigation: {
      previous: string;
      next: string;
      submit: string;
      save: string;
      submitting: string;
    };
    pause: string;
    questionNumber: string;
    timeSpent: string;
    complete: string;
  };

  /** 结果页面 */
  results: {
    loading: string;
    completedAt: string;
    timeSpent: string;
    overallAssessment: string;
    detailedInterpretation: string;
    scoreDistribution: string;
    riskAssessment: string;
    personalizedRecommendations: string;
    recommendedResources: string;
    nextSteps: {
      title: string;
      moreAssessments: {
        title: string;
        description: string;
      };
      startPractice: {
        title: string;
        description: string;
      };
      browseResources: {
        title: string;
        description: string;
      };
    };
    actions: {
      share: string;
      savePdf: string;
      viewHistory: string;
      backToAssessments: string;
    };
    riskLevels: {
      high: {
        title: string;
        message: string;
      };
      medium: {
        title: string;
        message: string;
      };
      low: {
        title: string;
        message: string;
      };
    };
    disclaimer: {
      title: string;
      message: string;
    };
    quickActions: string;
    noResultFound: string;
    noResultData: string;
  };

  /** 操作按钮 */
  actions: {
    retry: string;
    goBack: string;
  };
}
