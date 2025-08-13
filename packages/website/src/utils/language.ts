/**
 * 简单的语言工具函数
 */

import type { Language } from "@sunrain/shared";

declare global {
  interface Window {
    __ASTRO_LANGUAGE__?: Language;
  }
}

/**
 * 获取当前全局语言
 */
export function getCurrentLanguage(): Language {
  if (typeof window !== "undefined" && window.__ASTRO_LANGUAGE__) {
    return window.__ASTRO_LANGUAGE__;
  }
  return "en"; // 默认英文
}

/**
 * 获取用于日期格式化的 locale
 */
export function getDateLocale(): string {
  const lang = getCurrentLanguage();
  return lang === "zh" ? "zh-CN" : "en-US";
}

/**
 * 检查是否为中文环境
 */
export function isChineseLocale(): boolean {
  return getCurrentLanguage() === "zh";
}
