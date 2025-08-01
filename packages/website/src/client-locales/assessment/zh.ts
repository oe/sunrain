/**
 * Assessment 系统中文翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { IAssessmentTranslations } from './types';

export const assessmentZh: IAssessmentTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 评测加载 */
      assessment: '正在加载评测...',
      /** 翻译加载 */
      translations: '正在加载语言包...',
      /** 问题加载 */
      question: '正在加载问题...',
      /** 结果分析 */
      analysis: '正在分析结果...',
      /** 历史记录 */
      history: '正在加载历史记录...',
    },
    /** 错误信息 */
    errors: {
      /** 错误标题 */
      title: '出现错误',
      /** 会话启动失败 */
      sessionStartFailed: '无法启动评测会话',
      /** 初始化失败 */
      initializationFailed: '初始化失败',
      /** 提交失败 */
      submitFailed: '提交答案失败，请重试',
      /** 分析失败 */
      analysisFailed: '分析结果失败',
      /** 无数据 */
      noData: '评测数据加载失败',
      /** 无效量表 */
      invalidScale: '请选择 {min} 到 {max} 之间的值',
      /** 文本过长 */
      textTooLong: '文本长度不能超过1000个字符',
      /** 不支持的问题类型 */
      unsupportedQuestionType: '不支持的问题类型: {type}',
      /** 网络错误 */
      networkError: '网络连接错误，请检查您的网络连接',
      /** 超时错误 */
      timeoutError: '请求超时，请重试',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: '重试',
      /** 上一题 */
      previous: '上一题',
      /** 下一题 */
      next: '下一题',
      /** 完成 */
      complete: '完成评测',
      /** 保存 */
      save: '保存进度',
      /** 已保存 */
      saved: '已保存',
      /** 暂停 */
      pause: '暂停',
      /** 继续 */
      continue: '继续',
      /** 退出 */
      exit: '退出',
      /** 开始新评测 */
      startNew: '开始新评测',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: '活跃',
        /** 暂停 */
        paused: '已暂停',
        /** 已完成 */
        completed: '已完成',
        /** 已过期 */
        expired: '已过期',
      },
      /** 自动保存状态 */
      autoSave: {
        /** 保存中 */
        saving: '保存中...',
        /** 已保存 */
        saved: '自动保存',
        /** 保存失败 */
        failed: '保存失败',
        /** 最后保存时间 */
        lastSaved: '最后保存: {time}',
      },
      /** 会话警告 */
      warnings: {
        /** 会话即将过期 */
        expiring: '会话将在 {minutes} 分钟后过期',
        /** 网络连接不稳定 */
        unstableConnection: '检测到网络连接不稳定',
        /** 数据同步失败 */
        syncFailed: '与服务器同步数据失败',
      },
    },
    /** 问题验证 */
    validation: {
      /** 必填字段 */
      required: '此字段为必填项',
      /** 选择数量不足 */
      minSelections: '请至少选择 {min} 个选项',
      /** 选择数量过多 */
      maxSelections: '最多只能选择 {max} 个选项',
      /** 文本长度不足 */
      minLength: '请至少输入 {min} 个字符',
      /** 文本长度过长 */
      maxLength: '文本长度不能超过 {max} 个字符',
      /** 数值范围错误 */
      outOfRange: '数值必须在 {min} 到 {max} 之间',
    },
    /** 键盘快捷键 */
    shortcuts: {
      /** 下一题 */
      next: '按 Enter 键进入下一题',
      /** 上一题 */
      previous: '按 Shift+Enter 键返回上一题',
      /** 保存 */
      save: '按 Ctrl+S 键保存',
      /** 暂停 */
      pause: '按 Esc 键暂停',
      /** 帮助 */
      help: '按 F1 键获取帮助',
    },
  },
  /** 评测执行相关翻译 */
  execution: {
    /** 加载状态 */
    loading: '正在加载评测...',
    /** 暂停 */
    pause: '暂停',
    /** 保存进度 */
    save: '保存进度',
    /** 下一题 */
    next: '下一题',
    /** 上一题 */
    previous: '上一题',
    /** 完成评测 */
    complete: '完成评测',
    /** 用时 */
    timeSpent: '用时',
    /** 必答 */
    required: '* 必答',
    /** 问题编号 */
    questionNumber: '第',
    /** 总题数 */
    totalQuestions: '题',
    /** 完成状态 */
    completion: {
      /** 标题 */
      title: '评测完成！',
      /** 消息 */
      message: '正在分析您的结果...',
    },
    /** 暂停模态框 */
    pauseModal: {
      /** 标题 */
      title: '暂停评测',
      /** 消息 */
      message: '您的进度已自动保存。您可以稍后继续完成评测。',
      /** 继续 */
      continue: '继续评测',
      /** 退出 */
      exit: '退出',
    },
    /** 错误信息 */
    errors: {
      /** 必填项 */
      required: '请回答此问题后再继续。',
      /** 提交失败 */
      submitFailed: '提交答案失败，请重试。',
      /** 加载失败 */
      loadFailed: '加载评测失败，请刷新页面重试。',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 进度显示 */
    progress: {
      /** 进度文本 */
      text: '第 {current} 题 / 共 {total} 题',
      /** 完成百分比 */
      percentage: '已完成 {percentage}%',
      /** 剩余时间 */
      timeRemaining: '预计剩余时间: {time}',
    },
    /** 问题显示 */
    question: {
      /** 问题编号 */
      number: '第 {current} 题 / 共 {total} 题',
      /** 必答标记 */
      required: '* 必答',
      /** 已选择数量 */
      selectedCount: '已选择 {count} 项',
      /** 已选择值 */
      selectedValue: '当前选择: {value}',
      /** 文本输入占位符 */
      textPlaceholder: '请在此输入您的回答...',
      /** 字符计数 */
      characterCount: '已输入 {count} 个字符',
      /** 已输入文本 */
      textEntered: '回答已输入',
      /** 已回答 */
      answered: '已回答',
      /** 跳过 */
      skip: '跳过此题',
    },
    /** 导航控制 */
    navigation: {
      /** 上一题 */
      previous: '上一题',
      /** 下一题 */
      next: '下一题',
      /** 跳转到 */
      goTo: '跳转到第 {number} 题',
      /** 问题列表 */
      questionList: '题目列表',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: '进行中',
        /** 暂停 */
        paused: '已暂停',
        /** 已完成 */
        completed: '已完成',
      },
      /** 自动保存 */
      autoSave: {
        /** 保存中 */
        saving: '保存中...',
        /** 已保存 */
        saved: '已保存',
        /** 保存失败 */
        failed: '保存失败',
      },
    },
    /** 结果显示 */
    results: {
      /** 分享选项 */
      share: {
        /** 分享结果 */
        title: '分享结果',
        /** 复制链接 */
        copyLink: '复制链接',
        /** 已复制 */
        copied: '已复制到剪贴板',
        /** 下载PDF */
        downloadPdf: '下载PDF',
      },
      /** 图表交互 */
      charts: {
        /** 显示详情 */
        showDetails: '显示详情',
        /** 隐藏详情 */
        hideDetails: '隐藏详情',
        /** 切换视图 */
        toggleView: '切换视图',
      },
    },
    /** 历史记录 */
    history: {
      /** 筛选器 */
      filters: {
        /** 应用筛选 */
        apply: '应用筛选',
        /** 清除筛选 */
        clear: '清除筛选',
        /** 筛选选项 */
        options: '筛选选项',
      },
      /** 排序 */
      sorting: {
        /** 按日期排序 */
        byDate: '按日期排序',
        /** 按类型排序 */
        byType: '按类型排序',
        /** 按分数排序 */
        byScore: '按分数排序',
        /** 升序 */
        ascending: '升序',
        /** 降序 */
        descending: '降序',
      },
    },
    /** 问题类型特定交互 */
    questionTypes: {
      /** 单选题 */
      singleChoice: {
        /** 选择提示 */
        selectHint: '选择一个选项',
        /** 已选择 */
        selected: '已选择',
      },
      /** 多选题 */
      multipleChoice: {
        /** 选择提示 */
        selectHint: '选择一个或多个选项',
        /** 最少选择 */
        minSelect: '至少选择 {min} 个选项',
        /** 最多选择 */
        maxSelect: '最多选择 {max} 个选项',
      },
      /** 量表题 */
      scale: {
        /** 拖拽提示 */
        dragHint: '拖拽选择数值',
        /** 点击提示 */
        clickHint: '点击选择数值',
        /** 当前值 */
        currentValue: '当前值: {value}',
      },
      /** 文本题 */
      text: {
        /** 输入提示 */
        inputHint: '输入您的回答',
        /** 字数统计 */
        wordCount: '{count} 字',
        /** 建议长度 */
        suggestedLength: '建议长度: {min}-{max} 字',
      },
    },
    /** 辅助功能 */
    accessibility: {
      /** 屏幕阅读器提示 */
      screenReader: {
        /** 问题导航 */
        questionNavigation: '使用方向键在问题间导航',
        /** 进度信息 */
        progressInfo: '第 {current} 题，共 {total} 题，已完成 {percentage}%',
        /** 选项描述 */
        optionDescription: '选项 {index}: {text}',
        /** 错误信息 */
        errorAnnouncement: '错误: {message}',
      },
      /** 键盘导航 */
      keyboard: {
        /** 导航提示 */
        navigationHint: '使用 Tab 键导航，Enter 键选择',
        /** 选择提示 */
        selectionHint: '使用空格键选择/取消选择选项',
        /** 提交提示 */
        submitHint: '按 Enter 键提交答案',
      },
    },
  },
};

export default assessmentZh;
