/**
 * Assessment 系统中文翻译内容 (CSR)
 * 只包含实际使用的翻译键，去掉不必要的client前缀
 */
import type { IAssessmentTranslations } from './types';

export const assessmentZh: IAssessmentTranslations = {
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

  assessment: {
    title: '心理健康评测',
  },

  progress: {
    text: '{current} / {total}',
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

  validation: {
    checking: '正在验证...',
  },

  execution: {
    errors: {
      submitFailed: '提交失败',
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
      submit: '提交',
      save: '保存',
      submitting: '提交中...',
    },
    pause: '暂停',
    questionNumber: '问题 {number}',
    timeSpent: '用时',
    complete: '完成',
  },
};

export default assessmentZh;
