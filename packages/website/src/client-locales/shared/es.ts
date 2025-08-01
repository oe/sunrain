/**
 * Shared 系统西班牙语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { ISharedCSRTranslations } from './types';

export const sharedEs: ISharedCSRTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 通用加载 */
      general: 'Cargando...',
      /** 数据加载 */
      data: 'Cargando datos...',
      /** 翻译加载 */
      translations: 'Cargando traducciones...',
    },
    /** 错误信息 */
    errors: {
      /** 通用错误 */
      general: 'Ocurrió un error',
      /** 网络错误 */
      network: 'Error de red',
      /** 加载失败 */
      loadFailed: 'Error al cargar',
      /** 翻译缺失 */
      translationMissing: 'Traducción faltante',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: 'Reintentar',
      /** 取消 */
      cancel: 'Cancelar',
      /** 确认 */
      confirm: 'Confirmar',
      /** 关闭 */
      close: 'Cerrar',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 语言切换器 */
    languageSwitcher: {
      /** 当前语言 */
      current: 'Idioma actual',
      /** 切换到 */
      switchTo: 'Cambiar a',
      /** 语言选择 */
      selectLanguage: 'Seleccionar idioma',
    },
    /** 主题切换器 */
    themeSwitcher: {
      /** 切换主题 */
      toggle: 'Cambiar tema',
      /** 浅色模式 */
      light: 'Modo claro',
      /** 深色模式 */
      dark: 'Modo oscuro',
      /** 系统默认 */
      system: 'Predeterminado del sistema',
    },
    /** 移动端菜单 */
    mobileMenu: {
      /** 打开菜单 */
      open: 'Abrir menú',
      /** 关闭菜单 */
      close: 'Cerrar menú',
      /** 菜单 */
      menu: 'Menú',
    },
  },
};

export default sharedEs;
