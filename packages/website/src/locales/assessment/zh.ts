/**
 * 评测系统中文翻译内容
 */
import type { IAssessmentTranslations } from './types';

export const assessmentZh: IAssessmentTranslations = {
  pageTitle: '心理健康评测',

  list: {
    title: '心理健康评测',
    subtitle: '通过科学的评测工具了解您的心理健康状况，获得个性化建议和资源',
    categories: {
      mental_health: '心理健康评测',
      personality: '性格评测',
      stress: '压力评测',
      mood: '情绪评测'
    },
    categoryDescriptions: {
      mental_health: '专业的心理健康筛查工具，帮助识别潜在的心理健康问题',
      personality: '了解您的性格特征和行为模式',
      stress: '评估您的压力水平和应对能力',
      mood: '监测您的情绪状态和趋势'
    },
    startButton: '开始评测',
    infoButton: '了解更多',
    minutes: '分钟',
    questions: '题目',
    activeSessions: {
      title: '您有 {count} 个未完成的评测',
      message: '点击继续您的评测',
      continueLink: '继续评测',
      lastActivity: '最后活动',
      progress: '进度',
    },
    quickActions: {
      title: '快速操作',
      history: {
        title: '评测历史',
        description: '查看历史评测结果'
      },
      trends: {
        title: '趋势分析',
        description: '查看心理健康趋势'
      },
      continue: {
        title: '继续评测',
        description: '完成未完成的评测'
      }
    },
    existingSession: {
      title: '未完成的评测',
      message: '您有一个未完成的评测。您可以继续之前的进度，或者重新开始。',
      progress: '进度',
      lastActivity: '最后活动',
      questionsAnswered: '已回答',
      continue: '继续评测',
      restart: '重新开始',
      restartWarning: '重新开始将删除您之前的所有答案。',
    },
    disclaimer: {
      title: '免责声明',
      message: '本评测仅供参考，不能替代专业医疗建议。如有心理健康问题，请咨询专业医生。'
    }
  },

  execution: {
    title: '评测进行中',
    subtitle: '请诚实回答以下问题，以获得准确的结果',
    progress: '进度',
    questionNumber: '第 {number} 题',
    timeSpent: '已用时',
    estimatedRemaining: '预计剩余时间',
    pause: '暂停',
    continue: '继续',
    previous: '上一题',
    next: '下一题',
    submit: '提交',
    submitting: '提交中...',
    pauseModal: {
      title: '评测已暂停',
      message: '您的进度已保存，您可以随时继续评测。',
      continue: '继续评测',
      exit: '退出评测'
    },
    validation: {
      required: '此题为必答题',
      invalid: '请选择有效答案',
      tooShort: '答案太短',
      tooLong: '答案太长'
    },
    errors: {
      title: '评测错误',
      initializationFailed: '评测初始化失败',
      sessionStartFailed: '评测会话启动失败',
      noData: '没有评测数据',
      validationFailed: '验证失败',
      unsupportedQuestionType: '不支持的问题类型',
      cannotContinue: '无法继续评测',
      continueFailed: '继续评测失败',
      deleteFailed: '删除失败',
      clearFailed: '清除失败',
      loadFailed: '加载失败',
      loadFailedMessage: '无法加载评测数据，请刷新页面重试',
      boundary: {
        title: '评测系统错误',
        message: '评测过程中发生了错误',
        details: '错误详情',
        retry: '重试',
        goHome: '返回首页'
      }
    },
    success: {
      title: '评测完成',
      message: '感谢您完成评测，正在生成结果...',
      generating: '正在生成结果...',
      completed: '评测已完成'
    }
  },

  results: {
    title: '评测结果',
    subtitle: '基于您的回答生成的个性化结果和建议',
    loading: '正在生成结果...',
    generating: '正在分析您的回答...',
    completed: '结果已生成',
    overall: {
      title: '总体评估',
      score: '总分',
      level: '风险等级',
      description: '评估描述'
    },
    dimensions: {
      title: '各维度分析',
      depression: '抑郁倾向',
      anxiety: '焦虑倾向',
      stress: '压力水平',
      mood: '情绪状态'
    },
    recommendations: {
      title: '个性化建议',
      immediate: '即时建议',
      longTerm: '长期建议',
      resources: '相关资源'
    },
    nextSteps: {
      title: '后续步骤',
      moreAssessments: {
        title: '更多评测',
        description: '尝试其他心理健康评测'
      },
      startPractice: {
        title: '开始练习',
        description: '开始心理健康练习'
      },
      viewResources: {
        title: '查看资源',
        description: '浏览心理健康资源'
      }
    },
    actions: {
      share: '分享结果',
      export: '导出报告',
      newAssessment: '新评测',
      viewHistory: '查看历史'
    },
    riskLevels: {
      low: '低风险',
      medium: '中等风险',
      high: '高风险'
    },
    noData: {
      title: '无结果数据',
      message: '无法生成评测结果，请重试',
      retry: '重试'
    }
  },

  history: {
    title: '评测历史',
    subtitle: '查看您的历史评测记录和趋势',
    loading: '加载历史记录...',
    noData: {
      title: '暂无评测记录',
      message: '您还没有完成任何评测',
      startFirst: '开始第一个评测'
    },
    statistics: {
      total: '总评测数',
      completed: '已完成',
      averageTime: '平均用时',
      lastAssessment: '最近评测'
    },
    filters: {
      assessmentType: '评测类型',
      timeRange: '时间范围',
      riskLevel: '风险等级',
      allTypes: '所有类型',
      allTimes: '所有时间',
      allLevels: '所有等级',
      last7Days: '最近7天',
      last30Days: '最近30天',
      last3Months: '最近3个月',
      lastYear: '最近一年',
      clearFilters: '清除筛选'
    },
    list: {
      title: '评测记录',
      viewDetails: '查看详情',
      share: '分享',
      delete: '删除',
      dimensions: '维度',
      today: '今天',
      daysAgo: '{days}天前'
    },
    empty: {
      title: '暂无记录',
      message: '您还没有任何评测记录',
      startFirst: '开始第一个评测'
    },
    pagination: {
      showing: '显示',
      to: '到',
      of: '共',
      records: '条记录',
      previous: '上一页',
      next: '下一页'
    },
    actions: {
      export: '导出',
      newAssessment: '新评测'
    }
  },

  continue: {
    title: '继续评测',
    subtitle: '完成您未完成的心理健康评测',
    loading: '加载未完成的评测...',
    noSessions: {
      title: '无未完成评测',
      message: '您目前没有需要继续的评测',
      startNew: '开始新评测'
    },
    session: {
      startedAt: '开始时间',
      timeSpent: '已用时',
      progress: '进度',
      answered: '已回答',
      estimatedRemaining: '预计剩余',
      continueButton: '继续评测',
      status: {
        active: '进行中',
        paused: '已暂停'
      }
    },
    actions: {
      startNew: '开始新评测',
      clearAll: '清除所有未完成评测'
    },
    confirmations: {
      deleteSession: '确定要删除这个未完成的评测吗？所有进度将丢失。',
      clearAll: '确定要清除所有未完成的评测吗？所有进度将丢失。'
    }
  },

  trends: {
    title: '趋势分析',
    subtitle: '分析您的心理健康趋势和发展模式',
    loading: '加载趋势数据...',
    timeRange: {
      title: '时间范围',
      last30Days: '最近30天',
      last3Months: '最近3个月',
      lastYear: '最近一年',
      allTime: '全部时间'
    },
    charts: {
      overallTrend: '总体趋势',
      frequency: '评测频率',
      riskTrend: '风险等级变化',
      categoryPerformance: '分类表现'
    },
    insights: {
      title: '趋势洞察',
      positive: '积极趋势',
      warning: '需要关注',
      info: '稳定'
    },
    statistics: {
      improvementTrend: '改善趋势',
      stableDimensions: '稳定维度',
      attentionNeeded: '需要关注'
    },
    noData: {
      title: '无趋势数据',
      message: '您需要完成至少2次评测才能查看趋势分析',
      startAssessment: '开始评测'
    },
    actions: {
      exportReport: '导出趋势报告',
      newAssessment: '新评测'
    }
  },

  common: {
    title: '心理健康评测',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    refresh: '刷新',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    save: '保存',
    share: '分享',
    export: '导出',
    riskLevels: {
      low: '低风险',
      medium: '中等风险',
      high: '高风险'
    },
    timeUnits: {
      seconds: '秒',
      minutes: '分钟',
      hours: '小时',
      days: '天'
    }
  },

  priority: {
    high: '高',
    medium: '中',
    low: '低'
  },

  time: {
    varies: '变化',
    minutesSeconds: '{minutes}分{seconds}秒'
  },

  actions: {
    viewDetails: '查看详情'
  },

  /** 问卷信息模态框 */
  questionnaireInfo: {
    description: '描述',
    purpose: '目的',
    whatToExpect: '评测流程',
    professionalBackground: '专业背景',
    tags: '标签',
    questions: '题目',
    minutes: '分钟',
    timeEstimate: {
      lessThanMinute: '不到1分钟',
      oneMinute: '1分钟',
      minutes: '{minutes}分钟',
    },
    difficulty: {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级',
    },
    steps: {
      step1: '诚实回答{count}道题目（大约需要{time}分钟）',
      step2: '您的回答将使用经过验证的评分方法进行分析',
      step3: '获得个性化的结果和建议',
    },
    validated: '临床验证评测',
    mentalHealthAssessment: '心理健康评测',
    purposeDescription: '此评测有助于识别症状并提供见解，可以指导您了解自己的心理健康状况。',
    validatedDescription: '此评测使用经过科学验证的方法和评分系统。',
    privacy: {
      title: '隐私与数据安全',
      message: '您的回答存储在您的设备本地，不会与第三方共享。',
    },
    startAssessment: '开始评测',
    starting: '正在启动...',
  }
};

export default assessmentZh;