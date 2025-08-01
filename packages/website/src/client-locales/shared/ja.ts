/**
 * Shared 系统日语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { ISharedCSRTranslations } from './types';

export const sharedJa: ISharedCSRTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 通用加载 */
      general: '読み込み中...',
      /** 数据加载 */
      data: 'データを読み込み中...',
      /** 翻译加载 */
      translations: '翻訳を読み込み中...',
    },
    /** 错误信息 */
    errors: {
      /** 通用错误 */
      general: 'エラーが発生しました',
      /** 网络错误 */
      network: 'ネットワークエラー',
      /** 加载失败 */
      loadFailed: '読み込みに失敗しました',
      /** 翻译缺失 */
      translationMissing: '翻訳が見つかりません',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: '再試行',
      /** 取消 */
      cancel: 'キャンセル',
      /** 确认 */
      confirm: '確認',
      /** 关闭 */
      close: '閉じる',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 语言切换器 */
    languageSwitcher: {
      /** 当前语言 */
      current: '現在の言語',
      /** 切换到 */
      switchTo: '切り替え先',
      /** 语言选择 */
      selectLanguage: '言語を選択',
    },
    /** 主题切换器 */
    themeSwitcher: {
      /** 切换主题 */
      toggle: 'テーマを切り替え',
      /** 浅色模式 */
      light: 'ライトモード',
      /** 深色模式 */
      dark: 'ダークモード',
      /** 系统默认 */
      system: 'システムデフォルト',
    },
    /** 移动端菜单 */
    mobileMenu: {
      /** 打开菜单 */
      open: 'メニューを開く',
      /** 关闭菜单 */
      close: 'メニューを閉じる',
      /** 菜单 */
      menu: 'メニュー',
    },
  },
};

export default sharedJa;
