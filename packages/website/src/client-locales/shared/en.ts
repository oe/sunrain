/**
 * Shared 系统英文翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { ISharedCSRTranslations } from "./types";

export const sharedEn: ISharedCSRTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 通用加载 */
      general: "Loading...",
      /** 数据加载 */
      data: "Loading data...",
      /** 翻译加载 */
      translations: "Loading translations...",
    },
    /** 错误信息 */
    errors: {
      /** 通用错误 */
      general: "An error occurred",
      /** 网络错误 */
      network: "Network error",
      /** 加载失败 */
      loadFailed: "Failed to load",
      /** 翻译缺失 */
      translationMissing: "Translation missing",
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: "Retry",
      /** 取消 */
      cancel: "Cancel",
      /** 确认 */
      confirm: "Confirm",
      /** 关闭 */
      close: "Close",
      /** 上一题 */
      previous: "Previous",
      /** 下一题 */
      next: "Next",
      /** 完成 */
      complete: "Complete",
      /** 保存 */
      save: "Save",
      /** 已保存 */
      saved: "Saved",
      /** 暂停 */
      pause: "Pause",
      /** 继续 */
      continue: "Continue",
      /** 退出 */
      exit: "Exit",
      /** 开始新评测 */
      startNew: "Start New",
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 语言切换器 */
    languageSwitcher: {
      /** 当前语言 */
      current: "Current language",
      /** 切换到 */
      switchTo: "Switch to",
      /** 语言选择 */
      selectLanguage: "Select language",
    },
    /** 主题切换器 */
    themeSwitcher: {
      /** 切换主题 */
      toggle: "Toggle theme",
      /** 浅色模式 */
      light: "Light mode",
      /** 深色模式 */
      dark: "Dark mode",
      /** 系统默认 */
      system: "System default",
    },
    /** 移动端菜单 */
    mobileMenu: {
      /** 打开菜单 */
      open: "Open menu",
      /** 关闭菜单 */
      close: "Close menu",
      /** 菜单 */
      menu: "Menu",
    },
  },
};

export default sharedEn;
