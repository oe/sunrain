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
    cannotContinue: string;
    continueFailed: string;
    deleteFailed: string;
    clearFailed: string;
    loadFailed: string;
    loadFailedMessage: string;
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
    withWarnings: string;
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

  /** 历史记录 */
  history: {
    stats: {
      total: string;
      averageTime: string;
      lastAssessment: string;
    };
    list: {
      dimensions: string;
      viewDetails: string;
      share: string;
      delete: string;
    };
    filters: {
      type: string;
      timeRange: string;
      riskLevel: string;
    };
  };

  /** 状态 */
  status: {
    active: string;
    paused: string;
  };

  /** 标签 */
  labels: {
    unknownAssessment: string;
    startTime: string;
    timeSpent: string;
    answered: string;
    questions: string;
    estimatedRemaining: string;
  };

  /** 时间 */
  time: {
    minutes: string;
    varies: string;
    minutesSeconds: string;
  };

  /** 消息 */
  messages: {
    deleted: string;
    clearedCount: string;
    noActiveSessions: string;
    noActiveSessionsMessage: string;
  };

  /** 操作按钮 */
  actions: {
    retry: string;
    goBack: string;
    refresh: string;
    startNew: string;
    continue: string;
    viewDetails: string;
  };

  /** 问卷信息模态框 */
  questionnaireInfo: {
    description: string;
    purpose: string;
    whatToExpect: string;
    professionalBackground: string;
    tags: string;
    questions: string;
    minutes: string;
    timeEstimate: {
      lessThanMinute: string;
      oneMinute: string;
      minutes: string;
    };
    difficulty: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
    steps: {
      step1: string;
      step2: string;
      step3: string;
    };
    validated: string;
    mentalHealthAssessment: string;
    purposeDescription: string;
    validatedDescription: string;
    privacy: {
      title: string;
      message: string;
    };
    startAssessment: string;
    starting: string;
  };

  /** 问卷卡片 */
  questionnaireCard: {
    featured: string;
    minutes: string;
    questions: string;
    difficulty: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
    validated: string;
    viewHistory: string;
    startAssessment: string;
  };

  /** 现有会话对话框 */
  existingSession: {
    title: string;
    progress: string;
    lastActivity: string;
    questionsAnswered: string;
    message: string;
    continue: string;
    restart: string;
    restartWarning: string;
  };

  /** 通用文本 */
  common: {
    loading: string;
    cancel: string;
    close: string;
    save: string;
    delete: string;
    edit: string;
    confirm: string;
    yes: string;
    no: string;
    error: string;
    showing: string;
    to: string;
    of: string;
    results: string;
    riskLevels: {
      high: string;
      medium: string;
      low: string;
    };
    timeUnits: {
      minutes: string;
      seconds: string;
    };
  };

  /** 优先级 */
  priority: {
    high: string;
    medium: string;
    low: string;
  };

  /** 建议内容 */
  recommendations: {
    riskBased: {
      high: string[];
      medium: string[];
      low: string[];
    };
    general: string[];
    patterns: {
      stable: string;
      variable: string;
      extreme: string;
      highAverage: string;
      mediumAverage: string;
    };
  };

  /** 趋势分析 */
  trends: {
    title: string;
    subtitle: string;
    loading: string;
    timeRange: {
      title: string;
      last30Days: string;
      last3Months: string;
      lastYear: string;
      allTime: string;
    };
    charts: {
      overallTrend: string;
      frequency: string;
      riskTrend: string;
      categoryPerformance: string;
    };
    insights: {
      title: string;
      positive: string;
      warning: string;
      info: string;
    };
    statistics: {
      improvementTrend: string;
      stableDimensions: string;
      attentionNeeded: string;
    };
    noData: {
      title: string;
      message: string;
      startAssessment: string;
    };
    actions: {
      exportReport: string;
      newAssessment: string;
    };
  };

  /** 分数名称 */
  scores: {
    total_score: string;
    depression: string;
    anxiety: string;
    stress: string;
    phq9_total: string;
    gad7_total: string;
    stress_total: string;
  };
}
