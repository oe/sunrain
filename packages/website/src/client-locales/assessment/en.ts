/**
 * Assessment 系统英文翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { IAssessmentTranslations } from './types';

export const assessmentEn: IAssessmentTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 评测加载 */
      assessment: 'Loading assessment...',
      /** 翻译加载 */
      translations: 'Loading language pack...',
      /** 问题加载 */
      question: 'Loading question...',
      /** 结果分析 */
      analysis: 'Analyzing results...',
      /** 历史记录 */
      history: 'Loading history...',
    },
    /** 错误信息 */
    errors: {
      /** 错误标题 */
      title: 'Error Occurred',
      /** 会话启动失败 */
      sessionStartFailed: 'Unable to start assessment session',
      /** 初始化失败 */
      initializationFailed: 'Initialization failed',
      /** 提交失败 */
      submitFailed: 'Failed to submit answer, please try again',
      /** 分析失败 */
      analysisFailed: 'Failed to analyze results',
      /** 无数据 */
      noData: 'Assessment data failed to load',
      /** 无效量表 */
      invalidScale: 'Please select a value between {min} and {max}',
      /** 文本过长 */
      textTooLong: 'Text cannot exceed 1000 characters',
      /** 不支持的问题类型 */
      unsupportedQuestionType: 'Unsupported question type: {type}',
      /** 网络错误 */
      networkError: 'Network connection error, please check your internet connection',
      /** 超时错误 */
      timeoutError: 'Request timeout, please try again',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: 'Retry',
      /** 上一题 */
      previous: 'Previous',
      /** 下一题 */
      next: 'Next',
      /** 完成 */
      complete: 'Complete Assessment',
      /** 保存 */
      save: 'Save Progress',
      /** 已保存 */
      saved: 'Saved',
      /** 暂停 */
      pause: 'Pause',
      /** 继续 */
      continue: 'Continue',
      /** 退出 */
      exit: 'Exit',
      /** 开始新评测 */
      startNew: 'Start New Assessment',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: 'Active',
        /** 暂停 */
        paused: 'Paused',
        /** 已完成 */
        completed: 'Completed',
        /** 已过期 */
        expired: 'Expired',
      },
      /** 自动保存状态 */
      autoSave: {
        /** 保存中 */
        saving: 'Saving...',
        /** 已保存 */
        saved: 'Auto-saved',
        /** 保存失败 */
        failed: 'Save failed',
        /** 最后保存时间 */
        lastSaved: 'Last saved: {time}',
      },
      /** 会话警告 */
      warnings: {
        /** 会话即将过期 */
        expiring: 'Session will expire in {minutes} minutes',
        /** 网络连接不稳定 */
        unstableConnection: 'Unstable network connection detected',
        /** 数据同步失败 */
        syncFailed: 'Failed to sync data with server',
      },
    },
    /** 问题验证 */
    validation: {
      /** 必填字段 */
      required: 'This field is required',
      /** 选择数量不足 */
      minSelections: 'Please select at least {min} options',
      /** 选择数量过多 */
      maxSelections: 'Please select no more than {max} options',
      /** 文本长度不足 */
      minLength: 'Please enter at least {min} characters',
      /** 文本长度过长 */
      maxLength: 'Text cannot exceed {max} characters',
      /** 数值范围错误 */
      outOfRange: 'Value must be between {min} and {max}',
    },
    /** 键盘快捷键 */
    shortcuts: {
      /** 下一题 */
      next: 'Press Enter for next question',
      /** 上一题 */
      previous: 'Press Shift+Enter for previous question',
      /** 保存 */
      save: 'Press Ctrl+S to save',
      /** 暂停 */
      pause: 'Press Esc to pause',
      /** 帮助 */
      help: 'Press F1 for help',
    },
  },
  /** Assessment execution related translations */
  execution: {
    /** Loading states */
    loading: 'Loading assessment...',
    /** Pause */
    pause: 'Pause',
    /** Save progress */
    save: 'Save Progress',
    /** Next question */
    next: 'Next',
    /** Previous question */
    previous: 'Previous',
    /** Complete assessment */
    complete: 'Complete Assessment',
    /** Time spent */
    timeSpent: 'Time Spent',
    /** Required */
    required: '* Required',
    /** Question number */
    questionNumber: 'Question',
    /** Total questions */
    totalQuestions: 'questions',
    /** Completion status */
    completion: {
      /** Title */
      title: 'Assessment Complete!',
      /** Message */
      message: 'Analyzing your results...',
    },
    /** Pause modal */
    pauseModal: {
      /** Title */
      title: 'Pause Assessment',
      /** Message */
      message: 'Your progress has been automatically saved. You can continue the assessment later.',
      /** Continue */
      continue: 'Continue Assessment',
      /** Exit */
      exit: 'Exit',
    },
    /** Error messages */
    errors: {
      /** Required field */
      required: 'Please answer this question before continuing.',
      /** Submit failed */
      submitFailed: 'Failed to submit answer, please try again.',
      /** Load failed */
      loadFailed: 'Failed to load assessment, please refresh and try again.',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 进度显示 */
    progress: {
      /** 进度文本 */
      text: '{current} / {total}',
      /** 完成百分比 */
      percentage: '{percentage}% complete',
      /** 剩余时间 */
      timeRemaining: 'Estimated time remaining: {time}',
    },
    /** 问题显示 */
    question: {
      /** 问题编号 */
      number: 'Question {current} of {total}',
      /** 必答标记 */
      required: '* Required',
      /** 已选择数量 */
      selectedCount: '{count} items selected',
      /** 已选择值 */
      selectedValue: 'Current selection: {value}',
      /** 文本输入占位符 */
      textPlaceholder: 'Please enter your answer here...',
      /** 字符计数 */
      characterCount: '{count} characters entered',
      /** 已输入文本 */
      textEntered: 'Answer entered',
      /** 已回答 */
      answered: 'Answered',
      /** 跳过 */
      skip: 'Skip this question',
    },
    /** 导航控制 */
    navigation: {
      /** 上一题 */
      previous: 'Previous Question',
      /** 下一题 */
      next: 'Next Question',
      /** 跳转到 */
      goTo: 'Go to Question {number}',
      /** 问题列表 */
      questionList: 'Question List',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: 'In Progress',
        /** 暂停 */
        paused: 'Paused',
        /** 已完成 */
        completed: 'Completed',
      },
      /** 自动保存 */
      autoSave: {
        /** 保存中 */
        saving: 'Saving...',
        /** 已保存 */
        saved: 'Saved',
        /** 保存失败 */
        failed: 'Save failed',
      },
    },
    /** 结果显示 */
    results: {
      /** 分享选项 */
      share: {
        /** 分享结果 */
        title: 'Share Results',
        /** 复制链接 */
        copyLink: 'Copy Link',
        /** 已复制 */
        copied: 'Copied to clipboard',
        /** 下载PDF */
        downloadPdf: 'Download PDF',
      },
      /** 图表交互 */
      charts: {
        /** 显示详情 */
        showDetails: 'Show Details',
        /** 隐藏详情 */
        hideDetails: 'Hide Details',
        /** 切换视图 */
        toggleView: 'Toggle View',
      },
    },
    /** 历史记录 */
    history: {
      /** 筛选器 */
      filters: {
        /** 应用筛选 */
        apply: 'Apply Filters',
        /** 清除筛选 */
        clear: 'Clear Filters',
        /** 筛选选项 */
        options: 'Filter Options',
      },
      /** 排序 */
      sorting: {
        /** 按日期排序 */
        byDate: 'Sort by Date',
        /** 按类型排序 */
        byType: 'Sort by Type',
        /** 按分数排序 */
        byScore: 'Sort by Score',
        /** 升序 */
        ascending: 'Ascending',
        /** 降序 */
        descending: 'Descending',
      },
    },
    /** 问题类型特定交互 */
    questionTypes: {
      /** 单选题 */
      singleChoice: {
        /** 选择提示 */
        selectHint: 'Select one option',
        /** 已选择 */
        selected: 'Selected',
      },
      /** 多选题 */
      multipleChoice: {
        /** 选择提示 */
        selectHint: 'Select one or more options',
        /** 最少选择 */
        minSelect: 'Select at least {min} options',
        /** 最多选择 */
        maxSelect: 'Select up to {max} options',
      },
      /** 量表题 */
      scale: {
        /** 拖拽提示 */
        dragHint: 'Drag to select value',
        /** 点击提示 */
        clickHint: 'Click to select value',
        /** 当前值 */
        currentValue: 'Current value: {value}',
      },
      /** 文本题 */
      text: {
        /** 输入提示 */
        inputHint: 'Enter your response',
        /** 字数统计 */
        wordCount: '{count} words',
        /** 建议长度 */
        suggestedLength: 'Suggested length: {min}-{max} words',
      },
    },
    /** 辅助功能 */
    accessibility: {
      /** 屏幕阅读器提示 */
      screenReader: {
        /** 问题导航 */
        questionNavigation: 'Use arrow keys to navigate between questions',
        /** 进度信息 */
        progressInfo: 'Question {current} of {total}, {percentage} percent complete',
        /** 选项描述 */
        optionDescription: 'Option {index}: {text}',
        /** 错误信息 */
        errorAnnouncement: 'Error: {message}',
      },
      /** 键盘导航 */
      keyboard: {
        /** 导航提示 */
        navigationHint: 'Use Tab to navigate, Enter to select',
        /** 选择提示 */
        selectionHint: 'Use Space to select/deselect options',
        /** 提交提示 */
        submitHint: 'Press Enter to submit answer',
      },
    },
  },
};

export default assessmentEn;
