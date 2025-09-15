/**
 * 独立的CSR翻译Hook
 * 完全独立于SSG翻译系统，只用于客户端渲染的组件
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Language } from '@sunrain/shared';
import { getCSRTranslationManager } from '@/utils/csr-translation-manager';
import type { CSRTranslations } from '@/client-locales/shared/types';
import { isClientSide } from '@/utils/environment';

declare global {
  interface Window {
    __ASTRO_LANGUAGE__?: Language;
  }
}

interface UseCSRTranslationsReturn {
  t: (key: string, params?: Record<string, any>) => string | string[];
  tString: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
}

export function useCSRTranslations(
  namespace: string,
  language: Language
): UseCSRTranslationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<CSRTranslations | null>(null);

  const loadingRef = useRef<Set<string>>(new Set());
  const csrManager = useRef(getCSRTranslationManager());

  // 当语言或命名空间变化时加载翻译
  useEffect(() => {
    // 严格检查客户端环境，避免在SSG构建时执行
    if (isClientSide() && typeof window !== 'undefined') {
      loadTranslations(namespace, language);
    }
  }, [namespace, language]);

  /**
   * 加载CSR翻译
   */
  const loadTranslations = useCallback(async (ns: string, lang: Language) => {
    // 严格检查客户端环境
    if (typeof window === 'undefined') {
      // 在SSG环境中静默返回，不输出警告
      return;
    }

    const loadKey = `${ns}:${lang}`;

    // 避免重复加载
    if (loadingRef.current.has(loadKey)) {
      return;
    }

    loadingRef.current.add(loadKey);
    setIsLoading(true);

    try {
      const csrTranslationsData = await csrManager.current.loadTranslations(ns, lang);
      setTranslations(csrTranslationsData);
    } catch (error) {
      console.error(`Failed to load CSR translations for ${ns}:${lang}:`, error);
    } finally {
      setIsLoading(false);
      loadingRef.current.delete(loadKey);
    }
  }, []);

  /**
   * CSR翻译函数
   */
  const t = useCallback((key: string, params?: Record<string, any>): string | string[] => {
    // 严格检查客户端环境
    if (typeof window === 'undefined') {
      // 在SSG环境中静默返回，不输出警告
      return key;
    }

    if (!translations) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`CSR translations not loaded for key: ${key} in ${namespace}:${language}`);
      }
      return key;
    }

    const value = csrManager.current.getNestedValue(translations, key);

    if (!value) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`CSR translation missing for key: ${key} in ${namespace}:${language}`);
      }
      return key;
    }

    // 如果值是数组，直接返回
    if (Array.isArray(value)) {
      return value;
    }

    // 参数替换
    if (params && typeof value === 'string') {
      return csrManager.current.formatMessage(value, params);
    }

    return value;
  }, [translations, namespace, language]);

  // 创建一个只返回字符串的翻译函数
  const tString = useCallback((key: string, params?: Record<string, any>): string => {
    const result = t(key, params);
    return Array.isArray(result) ? result.join(', ') : result;
  }, [t]);

  return {
    t,
    tString,
    isLoading
  };
}

/**
 * 获取全局语言设置
 */
function getGlobalLanguage(): Language {
  if (typeof window !== 'undefined' && window.__ASTRO_LANGUAGE__) {
    return window.__ASTRO_LANGUAGE__;
  }
  return 'en'; // 默认英文，避免在SSG环境中默认使用中文
}

/**
 * 专门用于assessment命名空间的CSR翻译Hook
 * 自动从全局变量获取语言，无需传递参数
 */
export function useAssessmentTranslations(language?: Language) {
  const currentLanguage = language || getGlobalLanguage();
  return useCSRTranslations('assessment', currentLanguage);
}

/**
 * 专门用于shared命名空间的CSR翻译Hook
 */
export function useSharedTranslations(language: Language) {
  return useCSRTranslations('shared', language);
}
