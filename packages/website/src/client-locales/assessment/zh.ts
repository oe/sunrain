/**
 * Assessment 系统中文翻译内容 (CSR)
 * 包含实际使用的翻译键，匹配组件中的client前缀结构
 */
import type { IAssessmentTranslations } from './types';

export const assessmentZh: IAssessmentTranslations = {
  assessment: {
    title: '心理健康评测',
  },

  loading: {
    default: '加载中...',
    assessment: '正在加载评测...',
  },

  errors: {
    title: '错误',
    initializationFailed: '初始化失败',
    sessionStartFailed: '无法启动评测会话',
    noData: '评测数据加载失败',
    validationFailed: '验证失败',
    unsupportedQuestionType: '不支持的问题类型：{type}',
    cannotContinue: '无法继续会话',
    continueFailed: '继续会话失败',
    deleteFailed: '删除会话失败',
    clearFailed: '清除会话失败',
    loadFailed: '加载失败',
    loadFailedMessage: '无法加载评测数据，请重试。',
    boundary: {
      title: '应用程序错误',
      message: '抱歉，应用程序遇到了一个错误。',
      details: '错误详情',
      retry: '重试',
      goHome: '返回首页',
    },
  },

  question: {
    number: '问题 {number}',
    required: '必填',
    selectedCount: '已选择 {count} 项',
    selectedValue: '已选择：{value}',
    textPlaceholder: '请输入您的答案...',
    characterCount: '{count} 个字符',
    textEntered: '已输入文本',
    answered: '已回答',
  },

  questionList: {
    title: '问题列表',
    progress: '进度：{current}/{total}',
    questionNumber: '问题 {number}',
    completed: '已完成',
    remaining: '剩余',
  },

  continue: {
    loading: '正在加载未完成的评测...',
  },

  list: {
    activeSessions: {
      title: '您有 {count} 个未完成的评测',
      continueLink: '点击继续完成评测',
      lastActivity: '最后活动',
      progress: '进度',
    },
  },

  progress: {
    text: '{current} / {total}',
  },

  validation: {
    checking: '正在验证...',
    withWarnings: '有警告',
  },

  execution: {
    errors: {
      submitFailed: '保存失败，请重试',
      required: '此项为必填项',
    },
    completion: {
      title: '评测完成',
      message: '正在生成结果...',
    },
    pauseModal: {
      title: '暂停评测',
      message: '您确定要暂停评测吗？',
      continue: '继续',
      exit: '退出',
    },
    navigation: {
      previous: '上一题',
      next: '下一题',
      submit: '完成评测',
      save: '保存进度',
      submitting: '正在完成...',
    },
    pause: '暂停',
    questionNumber: '问题 {number}',
    timeSpent: '用时',
    complete: '完成',
  },

  results: {
    loading: '正在加载评测结果...',
    completedAt: '完成时间',
    timeSpent: '用时',
    overallAssessment: '总体评估',
    detailedInterpretation: '详细解释',
    scoreDistribution: '分数分布',
    riskAssessment: '风险评估',
    personalizedRecommendations: '个性化建议',
    recommendedResources: '推荐资源',
    nextSteps: {
      title: '下一步行动',
      moreAssessments: {
        title: '更多评测',
        description: '探索其他评测工具'
      },
      startPractice: {
        title: '开始练习',
        description: '尝试相关的心理练习'
      },
      browseResources: {
        title: '浏览资源',
        description: '查看疗愈资源库'
      }
    },
    actions: {
      share: '分享结果',
      savePdf: '保存为PDF',
      viewHistory: '查看历史',
      backToAssessments: '返回评测首页'
    },
    riskLevels: {
      high: {
        title: '需要关注',
        message: '您的评测结果显示可能需要专业帮助。建议咨询心理健康专家或拨打心理援助热线。'
      },
      medium: {
        title: '建议关注',
        message: '您的评测结果显示有一些需要关注的方面。建议采取一些自我护理措施或考虑寻求支持。'
      },
      low: {
        title: '状态良好',
        message: '您的评测结果在正常范围内。继续保持健康的生活习惯。'
      }
    },
    disclaimer: {
      title: '重要提醒',
      message: '此评测结果仅供参考，不能替代专业的心理健康诊断。如果您感到困扰或需要帮助，请咨询专业的心理健康专家。'
    },
    quickActions: '快速操作',
    noResultFound: '未找到评测结果',
    noResultData: '没有找到评测数据'
  },

  actions: {
    retry: '重试',
    goBack: '返回',
    refresh: '刷新',
    startNew: '开始新评测',
    continue: '继续',
    viewDetails: '查看详情',
  },

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
  },

  questionnaireCard: {
    featured: '推荐',
    minutes: '分钟',
    questions: '题目',
    difficulty: {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级',
    },
    validated: '已验证',
    viewHistory: '查看历史',
    startAssessment: '开始评测',
  },

  existingSession: {
    title: '未完成的评测',
    progress: '进度',
    lastActivity: '最后活动',
    questionsAnswered: '已回答',
    message: '您有一个未完成的评测。您可以继续之前的进度，或者重新开始。',
    continue: '继续评测',
    restart: '重新开始',
    restartWarning: '重新开始将删除您之前的所有答案。',
  },

  history: {
    stats: {
      total: '总评测数',
      averageTime: '平均用时',
      lastAssessment: '最近评测',
    },
    list: {
      dimensions: '维度',
      viewDetails: '查看详情',
      share: '分享',
      delete: '删除',
    },
    filters: {
      type: '评测类型',
      timeRange: '时间范围',
      riskLevel: '风险等级',
    },
  },

  status: {
    active: '进行中',
    paused: '已暂停',
  },

  labels: {
    unknownAssessment: '未知评测',
    startTime: '开始时间',
    timeSpent: '用时',
    answered: '已回答',
    questions: '题目',
    estimatedRemaining: '预计剩余',
  },

  time: {
    minutes: '分钟',
    varies: '变化',
    minutesSeconds: '{minutes}分{seconds}秒',
  },

  messages: {
    deleted: '会话删除成功',
    clearedCount: '已清除 {count} 个会话',
    noActiveSessions: '全部完成！',
    noActiveSessionsMessage: '您没有未完成的评测。开始新的评测，继续您的心理健康之旅。',
  },

  common: {
    loading: '加载中...',
    cancel: '取消',
    close: '关闭',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    confirm: '确认',
    yes: '是',
    no: '否',
    error: '错误',
    showing: '显示',
    to: '到',
    of: '共',
    results: '结果',
    riskLevels: {
      high: '高风险',
      medium: '中风险',
      low: '低风险',
    },
    timeUnits: {
      minutes: '分钟',
      seconds: '秒',
    },
  },

  priority: {
    high: '高',
    medium: '中',
    low: '低',
  },

  recommendations: {
    riskBased: {
      high: [
        '🚨 建议立即寻求专业心理健康支持',
        '📞 联系心理健康专业人士或危机热线',
        '🏥 考虑预约心理健康专家进行详细评估',
        '👥 告知家人或朋友你的情况，寻求支持'
      ],
      medium: [
        '👨‍⚕️ 建议预约心理健康专业人士咨询',
        '🧘‍♀️ 学习并实践压力管理技巧',
        '📚 阅读心理健康相关书籍和资源',
        '🏃‍♂️ 保持规律的体育锻炼'
      ],
      low: [
        '📊 继续监测你的心理健康状况',
        '🌱 保持健康的生活方式习惯',
        '💪 培养积极的应对策略',
        '🎯 设定可实现的目标和期望'
      ]
    },
    general: [
      '💤 确保充足的睡眠（7-9小时）',
      '🥗 保持均衡的饮食',
      '🚫 避免过度使用酒精和药物',
      '🤝 与朋友和家人保持联系'
    ],
    patterns: {
      stable: '📈 你的分数相对稳定，继续保持当前状态',
      variable: '📊 你的分数变化较大，建议定期重新评估',
      extreme: '⚠️ 某些方面需要特别关注，建议寻求专业帮助',
      highAverage: '🔍 建议进行更详细的心理健康评估',
      mediumAverage: '👀 建议定期监测心理健康状况'
    }
  },

  trends: {
    title: '趋势分析',
    subtitle: '分析你的心理健康趋势和发展模式',
    loading: '正在加载趋势数据...',
    timeRange: {
      title: '时间范围',
      last30Days: '最近30天',
      last3Months: '最近3个月',
      lastYear: '最近一年',
      allTime: '全部时间'
    },
    charts: {
      overallTrend: '整体趋势',
      frequency: '评估频率',
      riskTrend: '风险水平变化',
      categoryPerformance: '类别表现'
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
      message: '你需要完成至少2次评估才能查看趋势分析',
      startAssessment: '开始评估'
    },
    actions: {
      exportReport: '导出趋势报告',
      newAssessment: '新评估'
    }
  },

  scores: {
    total_score: '总分',
    depression: '抑郁分数',
    anxiety: '焦虑分数',
    stress: '压力分数',
    phq9_total: 'PHQ-9总分',
    gad7_total: 'GAD-7总分',
    stress_total: '压力量表总分'
  },
};

export default assessmentZh;
