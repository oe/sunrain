/**
 * Shared 系统阿拉伯语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { ISharedCSRTranslations } from "./types";

export const sharedAr: ISharedCSRTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 通用加载 */
      general: "جاري التحميل...",
      /** 数据加载 */
      data: "جاري تحميل البيانات...",
      /** 翻译加载 */
      translations: "جاري تحميل الترجمات...",
    },
    /** 错误信息 */
    errors: {
      /** 通用错误 */
      general: "حدث خطأ",
      /** 网络错误 */
      network: "خطأ في الشبكة",
      /** 加载失败 */
      loadFailed: "فشل في التحميل",
      /** 翻译缺失 */
      translationMissing: "ترجمة مفقودة",
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: "إعادة المحاولة",
      /** 取消 */
      cancel: "إلغاء",
      /** 确认 */
      confirm: "تأكيد",
      /** 关闭 */
      close: "إغلاق",
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 语言切换器 */
    languageSwitcher: {
      /** 当前语言 */
      current: "اللغة الحالية",
      /** 切换到 */
      switchTo: "التبديل إلى",
      /** 语言选择 */
      selectLanguage: "اختيار اللغة",
    },
    /** 主题切换器 */
    themeSwitcher: {
      /** 切换主题 */
      toggle: "تبديل المظهر",
      /** 浅色模式 */
      light: "الوضع الفاتح",
      /** 深色模式 */
      dark: "الوضع الداكن",
      /** 系统默认 */
      system: "افتراضي النظام",
    },
    /** 移动端菜单 */
    mobileMenu: {
      /** 打开菜单 */
      open: "فتح القائمة",
      /** 关闭菜单 */
      close: "إغلاق القائمة",
      /** 菜单 */
      menu: "القائمة",
    },
  },
};

export default sharedAr;
