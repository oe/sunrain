/**
 * Shared 系统中文翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { ISharedCSRTranslations } from './types';

export const sharedZh: ISharedCSRTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 通用加载 */
      general: '加载中...',
      /** 数据加载 */
      data: '正在加载数据...',
      /** 翻译加载 */
      translations: '正在加载翻译...',
    },
    /** 错误信息 */
    errors: {
      /** 通用错误 */
      general: '发生错误',
      /** 网络错误 */
      network: '网络错误',
      /** 加载失败 */
      loadFailed: '加载失败',
      /** 翻译缺失 */
      translationMissing: '翻译缺失',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: '重试',
      /** 取消 */
      cancel: '取消',
      /** 确认 */
      confirm: '确认',
      /** 关闭 */
      close: '关闭',
      /** 上一题 */
      previous: '上一题',
      /** 下一题 */
      next: '下一题',
      /** 完成 */
      complete: '完成',
      /** 保存 */
      save: '保存',
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
  },
  /** 交互式组件 */
  interactive: {
    /** 语言切换器 */
    languageSwitcher: {
      /** 当前语言 */
      current: '当前语言',
      /** 切换到 */
      switchTo: '切换到',
      /** 语言选择 */
      selectLanguage: '选择语言',
    },
    /** 主题切换器 */
    themeSwitcher: {
      /** 切换主题 */
      toggle: '切换主题',
      /** 浅色模式 */
      light: '浅色模式',
      /** 深色模式 */
      dark: '深色模式',
      /** 系统默认 */
      system: '系统默认',
    },
    /** 移动端菜单 */
    mobileMenu: {
      /** 打开菜单 */
      open: '打开菜单',
      /** 关闭菜单 */
      close: '关闭菜单',
      /** 菜单 */
      menu: '菜单',
    },
  },
};

export default sharedZh;
