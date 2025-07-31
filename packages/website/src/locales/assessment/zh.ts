/**
 * 评测系统中文翻译内容
 */
import type { IAssessmentTranslations } from "./types";

export const assessmentZh: IAssessmentTranslations = {
  pageTitle: "心理健康评测",

  list: {
    title: "心理健康评测",
    subtitle:
      "通过科学的心理评测工具，了解您的心理健康状态，获得个性化的建议和资源推荐",
    categories: {
      mental_health: "心理健康评测",
      personality: "性格特质评测",
      stress: "压力评估",
      mood: "情绪状态评测",
    },
    categoryDescriptions: {
      mental_health: "专业的心理健康筛查工具，帮助识别潜在的心理健康问题",
      personality: "了解您的性格特点和行为模式",
      stress: "评估您的压力水平和应对能力",
      mood: "监测您的情绪状态和变化趋势",
    },
    startButton: "开始评测",
    minutes: "分钟",
    questions: "题",
    activeSessions: {
      title: "您有 {count} 个未完成的评测",
      message: "点击继续完成评测",
      continueLink: "点击继续完成评测",
      lastActivity: "最后活动",
      progress: "进度",
    },
    quickActions: {
      title: "快速操作",
      history: {
        title: "评测历史",
        description: "查看历史评测结果",
      },
      trends: {
        title: "趋势分析",
        description: "查看心理健康趋势",
      },
      continue: {
        title: "继续评测",
        description: "完成未完成的评测",
      },
    },
    disclaimer: {
      title: "重要提醒",
      message:
        "这些评测工具仅用于筛查和自我了解，不能替代专业的心理健康诊断。如果您感到困扰或需要帮助，请咨询专业的心理健康专家。",
    },
  },

  execution: {
    loading: "正在加载评测...",
    pause: "暂停",
    save: "保存进度",
    next: "下一题",
    previous: "上一题",
    complete: "完成评测",
    timeSpent: "用时",
    required: "* 必答",
    questionNumber: "第",
    totalQuestions: "题",
    completion: {
      title: "评测完成！",
      message: "正在分析您的结果...",
    },
    pauseModal: {
      title: "暂停评测",
      message: "您的进度已自动保存。您可以稍后继续完成评测。",
      continue: "继续评测",
      exit: "退出",
    },
    errors: {
      required: "请回答此问题后再继续。",
      submitFailed: "提交答案失败，请重试。",
      loadFailed: "加载评测失败，请刷新页面重试。",
    },
  },

  results: {
    loading: "正在加载评测结果...",
    completedAt: "完成时间",
    timeSpent: "用时",
    overallAssessment: "总体评估",
    detailedInterpretation: "详细解释",
    scoreDistribution: "分数分布",
    riskAssessment: "风险评估",
    personalizedRecommendations: "个性化建议",
    recommendedResources: "推荐资源",
    nextSteps: {
      title: "下一步行动",
      moreAssessments: {
        title: "更多评测",
        description: "探索其他评测工具",
      },
      startPractice: {
        title: "开始练习",
        description: "尝试相关的心理练习",
      },
      browseResources: {
        title: "浏览资源",
        description: "查看疗愈资源库",
      },
    },
    actions: {
      share: "分享结果",
      savePdf: "保存为PDF",
      viewHistory: "查看历史",
    },
    riskLevels: {
      high: {
        title: "需要关注",
        message:
          "您的评测结果显示可能需要专业帮助。建议咨询心理健康专家或拨打心理援助热线。",
      },
      medium: {
        title: "建议关注",
        message:
          "您的评测结果显示有一些需要关注的方面。建议采取一些自我护理措施或考虑寻求支持。",
      },
      low: {
        title: "状态良好",
        message: "您的评测结果在正常范围内。继续保持健康的生活习惯。",
      },
    },
    disclaimer: {
      title: "重要提醒",
      message:
        "此评测结果仅供参考，不能替代专业的心理健康诊断。如果您感到困扰或需要帮助，请咨询专业的心理健康专家。",
    },
  },

  history: {
    title: "评测历史",
    subtitle: "查看您的历史评测记录和趋势分析",
    statistics: {
      total: "总评测次数",
      completed: "已完成",
      averageTime: "平均用时",
      lastAssessment: "最近评测",
    },
    filters: {
      assessmentType: "评测类型",
      timeRange: "时间范围",
      riskLevel: "风险等级",
      allTypes: "全部类型",
      allTimes: "全部时间",
      allLevels: "全部等级",
      last7Days: "最近7天",
      last30Days: "最近30天",
      last3Months: "最近3个月",
      lastYear: "最近一年",
      clearFilters: "清除筛选",
    },
    list: {
      title: "评测记录",
      viewDetails: "查看详情",
      share: "分享",
      delete: "删除",
      dimensions: "个维度",
      today: "今天",
      daysAgo: "天前",
    },
    empty: {
      title: "暂无评测记录",
      message: "您还没有完成任何评测",
      startFirst: "开始第一个评测",
    },
    pagination: {
      showing: "显示",
      to: "到",
      of: "条，共",
      records: "条记录",
      previous: "上一页",
      next: "下一页",
    },
    actions: {
      export: "导出数据",
      newAssessment: "新建评测",
    },
  },

  continue: {
    title: "继续评测",
    subtitle: "完成您未完成的心理健康评测",
    loading: "正在加载未完成的评测...",
    noSessions: {
      title: "没有未完成的评测",
      message: "您目前没有需要继续的评测",
      startNew: "开始新评测",
    },
    session: {
      startedAt: "开始时间",
      timeSpent: "已用时",
      progress: "进度",
      answered: "已回答",
      estimatedRemaining: "预计剩余",
      continueButton: "继续评测",
      status: {
        active: "进行中",
        paused: "已暂停",
      },
    },
    actions: {
      startNew: "开始新评测",
      clearAll: "清除所有未完成评测",
    },
    confirmations: {
      deleteSession: "确定要删除这个未完成的评测吗？所有进度将丢失。",
      clearAll: "确定要清除所有未完成的评测吗？所有进度将丢失。",
    },
  },

  trends: {
    title: "趋势分析",
    subtitle: "分析您的心理健康变化趋势和发展模式",
    loading: "正在加载趋势数据...",
    timeRange: {
      title: "时间范围",
      last30Days: "最近30天",
      last3Months: "最近3个月",
      lastYear: "最近一年",
      allTime: "全部时间",
    },
    charts: {
      overallTrend: "整体趋势",
      frequency: "评测频率",
      riskTrend: "风险等级变化",
      categoryPerformance: "各维度表现",
    },
    insights: {
      title: "趋势洞察",
      positive: "积极趋势",
      warning: "需要关注",
      info: "保持稳定",
    },
    statistics: {
      improvementTrend: "改善趋势",
      stableDimensions: "稳定维度",
      attentionNeeded: "需要关注",
    },
    noData: {
      title: "暂无趋势数据",
      message: "您需要完成至少2次评测才能查看趋势分析",
      startAssessment: "开始评测",
    },
    actions: {
      exportReport: "导出趋势报告",
      newAssessment: "进行新评测",
    },
  },

  // 客户端组件专用翻译
  client: {
    loading: {
      assessment: "正在加载评测...",
      translations: "正在加载语言包...",
      question: "正在加载问题...",
    },
    errors: {
      title: "出现错误",
      sessionStartFailed: "无法启动评测会话",
      initializationFailed: "初始化失败",
      submitFailed: "提交答案失败，请重试",
      analysisFailed: "分析结果失败",
      noData: "评测数据加载失败",
      invalidScale: "请选择 {min} 到 {max} 之间的值",
      textTooLong: "文本长度不能超过1000个字符",
      unsupportedQuestionType: "不支持的问题类型: {type}",
    },
    actions: {
      retry: "重试",
      previous: "上一题",
      next: "下一题",
      complete: "完成评测",
      save: "保存进度",
      saved: "已保存",
    },
    progress: {
      text: "{current} / {total}",
    },
    question: {
      number: "第 {current} 题 / 共 {total} 题",
      required: "* 必答",
      selectedCount: "已选择 {count} 项",
      selectedValue: "当前选择: {value}",
      textPlaceholder: "请在此输入您的回答...",
      characterCount: "已输入 {count} 个字符",
      textEntered: "回答已输入",
      answered: "已回答",
    },
  },

  common: {
    title: "心理健康评测",
    loading: "加载中...",
    error: "错误",
    success: "成功",
    refresh: "刷新",
    cancel: "取消",
    confirm: "确认",
    delete: "删除",
    save: "保存",
    share: "分享",
    export: "导出",
    riskLevels: {
      low: "低风险",
      medium: "中风险",
      high: "高风险",
    },
    timeUnits: {
      seconds: "秒",
      minutes: "分钟",
      hours: "小时",
      days: "天",
    },
  },
};

export default assessmentZh;
