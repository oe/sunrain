/**
 * 评测系统翻译内容接口类型定义
 */
export interface IAssessmentTranslations {
  /** 页面标题 */
  pageTitle: string;

  /** 评测列表页面 */
  list: {
    /** 主标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 分类标题 */
    categories: {
      mental_health: string;
      personality: string;
      stress: string;
      mood: string;
    };
    /** 分类描述 */
    categoryDescriptions: {
      mental_health: string;
      personality: string;
      stress: string;
      mood: string;
    };
    /** 开始按钮 */
    startButton: string;
    /** 时间单位 */
    minutes: string;
    /** 题目单位 */
    questions: string;
    /** 活跃会话提醒 */
    activeSessions: {
      title: string;
      message: string;
      continueLink: string;
      lastActivity: string;
      progress: string;
    };
    /** 快速操作 */
    quickActions: {
      title: string;
      history: {
        title: string;
        description: string;
      };
      trends: {
        title: string;
        description: string;
      };
      continue: {
        title: string;
        description: string;
      };
    };
    /** 现有会话对话框 */
    existingSession: {
      title: string;
      message: string;
      progress: string;
      lastActivity: string;
      questionsAnswered: string;
      continue: string;
      restart: string;
      restartWarning: string;
    };
    /** 免责声明 */
    disclaimer: {
      title: string;
      message: string;
    };
  };

  /** 评测执行页面 */
  execution: {
    /** 加载状态 */
    loading: string;
    /** 暂停按钮 */
    pause: string;
    /** 保存按钮 */
    save: string;
    /** 下一题按钮 */
    next: string;
    /** 上一题按钮 */
    previous: string;
    /** 完成按钮 */
    complete: string;
    /** 用时显示 */
    timeSpent: string;
    /** 必答标记 */
    required: string;
    /** 题目编号 */
    questionNumber: string;
    /** 总题数 */
    totalQuestions: string;
    /** 完成状态 */
    completion: {
      title: string;
      message: string;
    };
    /** 暂停弹窗 */
    pauseModal: {
      title: string;
      message: string;
      continue: string;
      exit: string;
    };
    /** 错误信息 */
    errors: {
      required: string;
      submitFailed: string;
      loadFailed: string;
    };
  };

  /** 评测结果页面 */
  results: {
    /** 加载状态 */
    loading: string;
    /** 完成时间 */
    completedAt: string;
    /** 用时 */
    timeSpent: string;
    /** 总体评估 */
    overallAssessment: string;
    /** 详细解释 */
    detailedInterpretation: string;
    /** 分数分布 */
    scoreDistribution: string;
    /** 风险评估 */
    riskAssessment: string;
    /** 个性化建议 */
    personalizedRecommendations: string;
    /** 推荐资源 */
    recommendedResources: string;
    /** 下一步行动 */
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
    /** 操作按钮 */
    actions: {
      share: string;
      savePdf: string;
      viewHistory: string;
    };
    /** 风险等级 */
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
    /** 免责声明 */
    disclaimer: {
      title: string;
      message: string;
    };
  };

  /** 历史记录页面 */
  history: {
    /** 标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 统计数据 */
    statistics: {
      total: string;
      completed: string;
      averageTime: string;
      lastAssessment: string;
    };
    /** 筛选器 */
    filters: {
      assessmentType: string;
      timeRange: string;
      riskLevel: string;
      allTypes: string;
      allTimes: string;
      allLevels: string;
      last7Days: string;
      last30Days: string;
      last3Months: string;
      lastYear: string;
      clearFilters: string;
    };
    /** 记录列表 */
    list: {
      title: string;
      viewDetails: string;
      share: string;
      delete: string;
      dimensions: string;
      today: string;
      daysAgo: string;
    };
    /** 空状态 */
    empty: {
      title: string;
      message: string;
      startFirst: string;
    };
    /** 分页 */
    pagination: {
      showing: string;
      to: string;
      of: string;
      records: string;
      previous: string;
      next: string;
    };
    /** 操作按钮 */
    actions: {
      export: string;
      newAssessment: string;
    };
  };

  /** 继续评测页面 */
  continue: {
    /** 标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 加载状态 */
    loading: string;
    /** 无会话状态 */
    noSessions: {
      title: string;
      message: string;
      startNew: string;
    };
    /** 会话信息 */
    session: {
      startedAt: string;
      timeSpent: string;
      progress: string;
      answered: string;
      estimatedRemaining: string;
      continueButton: string;
      status: {
        active: string;
        paused: string;
      };
    };
    /** 操作按钮 */
    actions: {
      startNew: string;
      clearAll: string;
    };
    /** 确认对话框 */
    confirmations: {
      deleteSession: string;
      clearAll: string;
    };
  };

  /** 趋势分析页面 */
  trends: {
    /** 标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 加载状态 */
    loading: string;
    /** 时间范围 */
    timeRange: {
      title: string;
      last30Days: string;
      last3Months: string;
      lastYear: string;
      allTime: string;
    };
    /** 图表标题 */
    charts: {
      overallTrend: string;
      frequency: string;
      riskTrend: string;
      categoryPerformance: string;
    };
    /** 洞察分析 */
    insights: {
      title: string;
      positive: string;
      warning: string;
      info: string;
    };
    /** 统计数据 */
    statistics: {
      improvementTrend: string;
      stableDimensions: string;
      attentionNeeded: string;
    };
    /** 无数据状态 */
    noData: {
      title: string;
      message: string;
      startAssessment: string;
    };
    /** 操作按钮 */
    actions: {
      exportReport: string;
      newAssessment: string;
    };
  };

  /** 通用术语 */
  common: {
    title: string;
    loading: string;
    error: string;
    success: string;
    refresh: string;
    cancel: string;
    confirm: string;
    delete: string;
    save: string;
    share: string;
    export: string;
    /** 风险等级 */
    riskLevels: {
      low: string;
      medium: string;
      high: string;
    };
    /** 时间单位 */
    timeUnits: {
      seconds: string;
      minutes: string;
      hours: string;
      days: string;
    };
  };
}
