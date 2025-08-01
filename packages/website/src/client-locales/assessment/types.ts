/**
 * Assessment CSR 翻译类型定义
 *
 * 此文件定义了评测系统客户端组件专用的翻译接口
 */

import type { IAssessmentCSRTranslations } from '../shared/types';

// 重新导出共享的CSR翻译接口
export type { IAssessmentCSRTranslations } from '../shared/types';

/**
 * 评测系统特定的CSR翻译接口
 * 继承自基础CSR翻译接口，添加评测系统特有的翻译内容
 */
export interface IAssessmentTranslations extends IAssessmentCSRTranslations {
  /** 评测系统特有的客户端翻译内容 */
  client: IAssessmentCSRTranslations['client'] & {
    /** 评测会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: string;
        /** 暂停 */
        paused: string;
        /** 已完成 */
        completed: string;
        /** 已过期 */
        expired: string;
      };
      /** 自动保存状态 */
      autoSave: {
        /** 保存中 */
        saving: string;
        /** 已保存 */
        saved: string;
        /** 保存失败 */
        failed: string;
        /** 最后保存时间 */
        lastSaved: string;
      };
      /** 会话警告 */
      warnings: {
        /** 会话即将过期 */
        expiring: string;
        /** 网络连接不稳定 */
        unstableConnection: string;
        /** 数据同步失败 */
        syncFailed: string;
      };
    };
    /** 问题验证 */
    validation: {
      /** 必填字段 */
      required: string;
      /** 选择数量不足 */
      minSelections: string;
      /** 选择数量过多 */
      maxSelections: string;
      /** 文本长度不足 */
      minLength: string;
      /** 文本长度过长 */
      maxLength: string;
      /** 数值范围错误 */
      outOfRange: string;
    };
    /** 键盘快捷键 */
    shortcuts: {
      /** 下一题 */
      next: string;
      /** 上一题 */
      previous: string;
      /** 保存 */
      save: string;
      /** 暂停 */
      pause: string;
      /** 帮助 */
      help: string;
    };
  };

  /** 评测执行相关翻译 */
  execution: {
    /** 加载状态 */
    loading: string;
    /** 暂停 */
    pause: string;
    /** 保存进度 */
    save: string;
    /** 下一题 */
    next: string;
    /** 上一题 */
    previous: string;
    /** 完成评测 */
    complete: string;
    /** 用时 */
    timeSpent: string;
    /** 必答 */
    required: string;
    /** 问题编号 */
    questionNumber: string;
    /** 总题数 */
    totalQuestions: string;
    /** 完成状态 */
    completion: {
      /** 标题 */
      title: string;
      /** 消息 */
      message: string;
    };
    /** 暂停模态框 */
    pauseModal: {
      /** 标题 */
      title: string;
      /** 消息 */
      message: string;
      /** 继续 */
      continue: string;
      /** 退出 */
      exit: string;
    };
    /** 错误信息 */
    errors: {
      /** 必填项 */
      required: string;
      /** 提交失败 */
      submitFailed: string;
      /** 加载失败 */
      loadFailed: string;
    };
  };

  /** 交互式组件特有内容 */
  interactive: IAssessmentCSRTranslations['interactive'] & {
    /** 问题类型特定交互 */
    questionTypes: {
      /** 单选题 */
      singleChoice: {
        /** 选择提示 */
        selectHint: string;
        /** 已选择 */
        selected: string;
      };
      /** 多选题 */
      multipleChoice: {
        /** 选择提示 */
        selectHint: string;
        /** 最少选择 */
        minSelect: string;
        /** 最多选择 */
        maxSelect: string;
      };
      /** 量表题 */
      scale: {
        /** 拖拽提示 */
        dragHint: string;
        /** 点击提示 */
        clickHint: string;
        /** 当前值 */
        currentValue: string;
      };
      /** 文本题 */
      text: {
        /** 输入提示 */
        inputHint: string;
        /** 字数统计 */
        wordCount: string;
        /** 建议长度 */
        suggestedLength: string;
      };
    };
    /** 辅助功能 */
    accessibility: {
      /** 屏幕阅读器提示 */
      screenReader: {
        /** 问题导航 */
        questionNavigation: string;
        /** 进度信息 */
        progressInfo: string;
        /** 选项描述 */
        optionDescription: string;
        /** 错误信息 */
        errorAnnouncement: string;
      };
      /** 键盘导航 */
      keyboard: {
        /** 导航提示 */
        navigationHint: string;
        /** 选择提示 */
        selectionHint: string;
        /** 提交提示 */
        submitHint: string;
      };
    };
  };
}
