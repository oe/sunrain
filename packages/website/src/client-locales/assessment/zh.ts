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
  },
};

export default assessmentZh;
