/**
 * 独立的CSR翻译Hook
 * 完全独立于SSG翻译系统，只用于客户端渲染的组件
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Language } from '@sunrain/shared';
import { getCSRTranslationManager } from '@/utils/csr-translation-manager';
import type { CSRTranslations, TranslationLoadState } from '@/client-locales/shared/types';
import { isClientSide, safeLocalStorage, safeNavigator } from '@/utils/environment';

interface UseCSRTranslationsOptions {
  /** 是否启用预加载 */
  enablePreload?: boolean;
}

interface UseCSRTranslationsReturn {
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  language: Language;
  changeLanguage: (lang: Language) => void;
  preloadLanguage: (lang: Language) => Promise<void>;
  loadState: TranslationLoadState;
  reloadTranslations: () => Promise<void>;
  clearCache: () => void;
}

export function useCSRTranslations(
  namespace: string = 'assessment',
  options: UseCSRTranslationsOptions = {}
): UseCSRTranslationsReturn {
  const { enablePreload = true } = options;

  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<CSRTranslations | null>(null);
  const [loadState, setLoadState] = useState<TranslationLoadState>({ loading: false, loaded: false });

  const loadingRef = useRef<Set<string>>(new Set());
  const csrManager = useRef(getCSRTranslationManager());

  // 初始化语言设置
  useEffect(() => {
    if (!isClientSide()) {
      return;
    }

    const initializeLanguage = async () => {
      const storage = safeLocalStorage();
      const nav = safeNavigator();

      const storedLang = storage?.getItem('preferred-language') as Language;
      const browserLang = nav?.language.split('-')[0] as Language;
      const currentLang = storedLang || browserLang || 'en';

      setLanguage(currentLang);
      csrManager.current.setCurrentLanguage(currentLang);

      await loadTranslations(namespace, currentLang);
    };

    initializeLanguage();
  }, [namespace]);

  // 当语言或命名空间变化时加载翻译
  useEffect(() => {
    if (isClientSide()) {
      loadTranslations(namespace, language);
    }
  }, [namespace, language]);

  /**
   * 加载CSR翻译
   */
  const loadTranslations = useCallback(async (ns: string, lang: Language) => {
    const loadKey = `${ns}:${lang}`;

    // 避免重复加载
    if (loadingRef.current.has(loadKey)) {
      return;
    }

    loadingRef.current.add(loadKey);
    setIsLoading(true);
    setLoadState({ loading: true, loaded: false });

    try {
      const csrTranslationsData = await csrManager.current.loadTranslations(ns, lang);
      setTranslations(csrTranslationsData);
      setLoadState({ loading: false, loaded: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLoadState({
        loading: false,
        loaded: false,
        error: errorMessage
      });
      console.error(`Failed to load CSR translations for ${ns}:${lang}:`, error);
    } finally {
      setIsLoading(false);
      loadingRef.current.delete(loadKey);
    }
  }, []);

  /**
   * CSR翻译函数
   */
  const t = useCallback((key: string, params?: Record<string, any>): string => {
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

    // 参数替换
    if (params && typeof value === 'string') {
      return csrManager.current.formatMessage(value, params);
    }

    return value;
  }, [translations, namespace, language]);

  /**
   * 切换语言
   */
  const changeLanguage = useCallback(async (newLang: Language) => {
    if (newLang === language || !isClientSide()) return;

    setLanguage(newLang);
    csrManager.current.setCurrentLanguage(newLang);

    const storage = safeLocalStorage();
    if (storage) {
      storage.setItem('preferred-language', newLang);
    }

    await loadTranslations(namespace, newLang);
  }, [language, namespace, loadTranslations]);

  /**
   * 预加载指定语言的翻译
   */
  const preloadLanguage = useCallback(async (lang: Language) => {
    await loadTranslations(namespace, lang);
  }, [namespace, loadTranslations]);

  /**
   * 重新加载翻译
   */
  const reloadTranslations = useCallback(async () => {
    csrManager.current.clearCache(namespace, language);
    await loadTranslations(namespace, language);
  }, [namespace, language, loadTranslations]);

  /**
   * 清除翻译缓存
   */
  const clearCache = useCallback(() => {
    csrManager.current.clearCache();
    setTranslations(null);
    setLoadState({ loading: false, loaded: false });
  }, []);

  // 智能预加载 - 只预加载当前语言，避免不必要的预加载日志
  useEffect(() => {
    if (!isClientSide() || !enablePreload) {
      return;
    }

    const performPreload = async () => {
      try {
        // 只预加载当前语言，避免显示其他语言的预加载信息
        const csrNamespaces = ['assessment', 'shared'];

        await csrManager.current.preloadTranslations(
          csrNamespaces,
          [language] // 只预加载当前语言
        );
      } catch (error) {
        console.warn('CSR preload failed:', error);
      }
    };

    // 延迟执行预加载
    const timer = setTimeout(performPreload, 1000);
    return () => clearTimeout(timer);
  }, [language, enablePreload]);

  return {
    t,
    isLoading,
    language,
    changeLanguage,
    preloadLanguage,
    loadState,
    reloadTranslations,
    clearCache
  };
}

/**
 * 专门用于assessment命名空间的CSR翻译Hook
 */
export function useAssessmentTranslations(options?: UseCSRTranslationsOptions) {
  return useCSRTranslations('assessment', options);
}

/**
 * 专门用于shared命名空间的CSR翻译Hook
 */
export function useSharedTranslations(options?: UseCSRTranslationsOptions) {
  return useCSRTranslations('shared', options);
}
