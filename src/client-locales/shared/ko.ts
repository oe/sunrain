/**
 * Shared 系统韩语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { ISharedCSRTranslations } from './types';

export const sharedKo: ISharedCSRTranslations = {
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 通用加载 */
      general: '로딩 중...',
      /** 数据加载 */
      data: '데이터 로딩 중...',
      /** 翻译加载 */
      translations: '번역 로딩 중...',
    },
    /** 错误信息 */
    errors: {
      /** 通用错误 */
      general: '오류가 발생했습니다',
      /** 网络错误 */
      network: '네트워크 오류',
      /** 加载失败 */
      loadFailed: '로딩 실패',
      /** 翻译缺失 */
      translationMissing: '번역 누락',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: '다시 시도',
      /** 取消 */
      cancel: '취소',
      /** 确认 */
      confirm: '확인',
      /** 关闭 */
      close: '닫기',
      /** 上一题 */
      previous: '이전',
      /** 下一题 */
      next: '다음',
      /** 完成 */
      complete: '완료',
      /** 保存 */
      save: '저장',
      /** 已保存 */
      saved: '저장됨',
      /** 暂停 */
      pause: '일시정지',
      /** 继续 */
      continue: '계속',
      /** 退出 */
      exit: '종료',
      /** 开始新评测 */
      startNew: '새로 시작',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 语言切换器 */
    languageSwitcher: {
      /** 当前语言 */
      current: '현재 언어',
      /** 切换到 */
      switchTo: '전환',
      /** 语言选择 */
      selectLanguage: '언어 선택',
    },
    /** 主题切换器 */
    themeSwitcher: {
      /** 切换主题 */
      toggle: '테마 전환',
      /** 浅色模式 */
      light: '라이트 모드',
      /** 深色模式 */
      dark: '다크 모드',
      /** 系统默认 */
      system: '시스템 기본값',
    },
    /** 移动端菜单 */
    mobileMenu: {
      /** 打开菜单 */
      open: '메뉴 열기',
      /** 关闭菜单 */
      close: '메뉴 닫기',
      /** 菜单 */
      menu: '메뉴',
    },
  },
};

export default sharedKo;
