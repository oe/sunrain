/**
 * Shared 系统印地语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { ISharedCSRTranslations } from './types';

export const sharedHi: ISharedCSRTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 通用加载 */
      general: 'लोड हो रहा है...',
      /** 数据加载 */
      data: 'डेटा लोड हो रहा है...',
      /** 翻译加载 */
      translations: 'अनुवाद लोड हो रहा है...',
    },
    /** 错误信息 */
    errors: {
      /** 通用错误 */
      general: 'एक त्रुटि हुई',
      /** 网络错误 */
      network: 'नेटवर्क त्रुटि',
      /** 加载失败 */
      loadFailed: 'लोड करने में विफल',
      /** 翻译缺失 */
      translationMissing: 'अनुवाद गुम',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: 'पुनः प्रयास',
      /** 取消 */
      cancel: 'रद्द करें',
      /** 确认 */
      confirm: 'पुष्टि करें',
      /** 关闭 */
      close: 'बंद करें',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 语言切换器 */
    languageSwitcher: {
      /** 当前语言 */
      current: 'वर्तमान भाषा',
      /** 切换到 */
      switchTo: 'स्विच करें',
      /** 语言选择 */
      selectLanguage: 'भाषा चुनें',
    },
    /** 主题切换器 */
    themeSwitcher: {
      /** 切换主题 */
      toggle: 'थीम बदलें',
      /** 浅色模式 */
      light: 'लाइट मोड',
      /** 深色模式 */
      dark: 'डार्क मोड',
      /** 系统默认 */
      system: 'सिस्टम डिफ़ॉल्ट',
    },
    /** 移动端菜单 */
    mobileMenu: {
      /** 打开菜单 */
      open: 'मेनू खोलें',
      /** 关闭菜单 */
      close: 'मेनू बंद करें',
      /** 菜单 */
      menu: 'मेनू',
    },
  },
};

export default sharedHi;
