import { useState, useEffect, useCallback, useRef } from 'react';
import type { Language } from '@sunrain/shared';
import { translationCache } from '@/utils/TranslationCache';
import { isClientSide, safeLocalStorage, safeNavigator } from '@/utils/environment';

// Fallback translations for critical UI elements
const fallbackTranslations = {
  'client.errors.initializationFailed': '初始化失败',
  'client.errors.sessionStartFailed': '无法启动评测会话',
  'client.errors.title': '错误',
  'client.loading.assessment': '正在加载评测...',
  'client.errors.noData': '评测数据加载失败',
  'client.actions.retry': '重试',
  'client.errors.helpText': '如果问题持续存在，请联系技术支持',
  'client.errors.unexpectedError': '发生了意外错误',
  'client.errors.boundaryTitle': '应用程序错误'
};

interface UseTranslationsReturn {
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  language: Language;
  changeLanguage: (lang: Language) => void;
  preloadLanguage: (lang: Language) => Promise<void>;
  getCacheStats: () => any;
}

export function useTranslations(namespace: string = 'assessment'): UseTranslationsReturn {
  const [language, setLanguage] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const loadingRef = useRef<Set<string>>(new Set());
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
      const currentLang = storedLang || browserLang || 'zh';

      setLanguage(currentLang);
      await loadTranslations(namespace, currentLang);
    };

    initializeLanguage();
  }, [namespace]);

  // 当语言或命名空间变化时加载翻译
  useEffect(() => {
    loadTranslations(namespace, language);
  }, [namespace, language]);

  /**
   * 加载翻译文件
   */
  const loadTranslations = useCallback(async (ns: string, lang: Language) => {
    const loadKey = `${ns}:${lang}`;

    // 避免重复加载
    if (loadingRef.current.has(loadKey)) {
      return;
    }

    loadingRef.current.add(loadKey);
    setIsLoading(true);

    try {
      // 从缓存获取翻译
      const cachedTranslations = await translationCache.getTranslations(ns, lang);

      if (cachedTranslations) {
        setTranslations(prev => ({
          ...prev,
          ...cachedTranslations
        }));
      } else {
        console.warn(`Failed to load translations for ${ns}:${lang}`);
      }
    } catch (error) {
      console.error(`Error loading translations for ${ns}:${lang}:`, error);
    } finally {
      setIsLoading(false);
      loadingRef.current.delete(loadKey);
    }
  }, []);

  /**
   * 翻译函数
   */
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    // 首先尝试从缓存的翻译中获取
    let value = translations[key];

    // 如果没有找到，尝试从回退翻译中获取
    if (!value) {
      value = fallbackTranslations[key as keyof typeof fallbackTranslations];
    }

    // 如果仍然没有找到，返回键名
    if (!value) {
      console.warn(`Translation missing for key: ${key} in ${namespace}:${language}`);
      value = key;
    }

    // 参数替换
    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }

    return value;
  }, [translations, namespace, language]);

  /**
   * 切换语言
   */
  const changeLanguage = useCallback(async (newLang: Language) => {
    if (newLang === language || !isClientSide()) return;

    setLanguage(newLang);

    const storage = safeLocalStorage();
    if (storage) {
      storage.setItem('preferred-language', newLang);
    }

    // 预加载新语言的翻译
    await loadTranslations(namespace, newLang);
  }, [language, namespace, loadTranslations]);

  /**
   * 预加载指定语言的翻译
   */
  const preloadLanguage = useCallback(async (lang: Language) => {
    await loadTranslations(namespace, lang);
  }, [namespace, loadTranslations]);

  /**
   * 获取缓存统计信息
   */
  const getCacheStats = useCallback(() => {
    return translationCache.getCacheStats();
  }, []);

  // 智能预加载
  useEffect(() => {
    if (!isClientSide()) {
      return;
    }

    const performSmartPreload = async () => {
      try {
        // 预加载用户可能需要的语言
        const storage = safeLocalStorage();
        const nav = safeNavigator();

        const userLanguages = [
          storage?.getItem('preferred-language'),
          nav?.language.split('-')[0],
          'en' // 总是预加载英语作为回退
        ].filter((lang, index, arr) => lang && arr.indexOf(lang) === index) as Language[];

        // 预加载常用命名空间
        const commonNamespaces = ['shared', 'assessment', 'home'];

        await translationCache.preloadTranslations(
          commonNamespaces,
          userLanguages.slice(0, 2)
        );
      } catch (error) {
        console.warn('Smart preload failed:', error);
      }
    };

    // 延迟执行预加载，避免阻塞初始渲染
    const timer = setTimeout(performSmartPreload, 1000);
    return () => clearTimeout(timer);
  }, []);

  return {
    t,
    isLoading,
    language,
    changeLanguage,
    preloadLanguage,
    getCacheStats
  };
}
