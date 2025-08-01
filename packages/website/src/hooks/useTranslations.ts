import { useState, useEffect, useCallback, useRef } from 'react';
import type { Language } from '@sunrain/shared';
import { translationCache } from '@/utils/TranslationCache';
import { getCSRTranslationManager } from '@/utils/csr-translation-manager';
import type { CSRTranslations, TranslationLoadState } from '@/client-locales/shared/types';
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

interface UseTranslationsOptions {
  /** 是否使用CSR翻译系统 */
  useCSR?: boolean;
  /** 翻译模式：'ssg' | 'csr' | 'auto' */
  mode?: 'ssg' | 'csr' | 'auto';
  /** 是否启用智能预加载 */
  enablePreload?: boolean;
  /** 错误回退策略 */
  fallbackStrategy?: 'key' | 'empty' | 'default';
}

interface UseTranslationsReturn {
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  language: Language;
  changeLanguage: (lang: Language) => void;
  preloadLanguage: (lang: Language) => Promise<void>;
  getCacheStats: () => any;
  /** CSR翻译系统的加载状态 */
  csrLoadState?: TranslationLoadState;
  /** 当前使用的翻译模式 */
  currentMode: 'ssg' | 'csr';
  /** 重新加载翻译 */
  reloadTranslations: () => Promise<void>;
  /** 清除翻译缓存 */
  clearCache: () => void;
}

export function useTranslations(
  namespace: string = 'assessment',
  options: UseTranslationsOptions = {}
): UseTranslationsReturn {
  const {
    useCSR = false,
    mode = 'auto',
    enablePreload = true,
    fallbackStrategy = 'key'
  } = options;

  const [language, setLanguage] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [csrTranslations, setCsrTranslations] = useState<CSRTranslations | null>(null);
  const [csrLoadState, setCsrLoadState] = useState<TranslationLoadState>({ loading: false, loaded: false });
  const [currentMode, setCurrentMode] = useState<'ssg' | 'csr'>('ssg');
  const loadingRef = useRef<Set<string>>(new Set());
  const csrManager = useRef(getCSRTranslationManager());
  // 初始化语言设置和翻译模式
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
      csrManager.current.setCurrentLanguage(currentLang);

      // 确定翻译模式
      const translationMode = determineTranslationMode();
      console.log(`Translation mode determined: ${translationMode} for namespace: ${namespace}`);
      setCurrentMode(translationMode);

      await loadTranslations(namespace, currentLang, translationMode);
    };

    initializeLanguage();
  }, [namespace]);

  // 当语言或命名空间变化时加载翻译
  useEffect(() => {
    loadTranslations(namespace, language, currentMode);
  }, [namespace, language, currentMode]);

  /**
   * 确定翻译模式
   */
  const determineTranslationMode = useCallback((): 'ssg' | 'csr' => {
    // 如果明确指定了模式，直接使用
    if (mode === 'ssg' || mode === 'csr') {
      return mode;
    }

    // 自动模式：根据useCSR选项和命名空间决定
    if (useCSR || mode === 'auto') {
      // 只在客户端使用CSR翻译
      if (isClientSide()) {
        // 检查是否有CSR翻译文件可用
        const hasCSRSupport = ['assessment', 'shared'].includes(namespace);
        return hasCSRSupport ? 'csr' : 'ssg';
      }
    }

    return 'ssg';
  }, [mode, useCSR, namespace]);

  /**
   * 加载翻译文件
   */
  const loadTranslations = useCallback(async (ns: string, lang: Language, translationMode?: 'ssg' | 'csr') => {
    const targetMode = translationMode || currentMode;
    const loadKey = `${ns}:${lang}:${targetMode}`;

    // 避免重复加载
    if (loadingRef.current.has(loadKey)) {
      return;
    }

    loadingRef.current.add(loadKey);
    setIsLoading(true);

    try {
      if (targetMode === 'csr') {
        // 使用CSR翻译管理器
        setCsrLoadState(csrManager.current.getLoadState(ns, lang));

        const csrTranslationsData = await csrManager.current.loadTranslations(ns, lang);
        setCsrTranslations(csrTranslationsData);
        setCsrLoadState(csrManager.current.getLoadState(ns, lang));

        // 将CSR翻译扁平化以兼容现有的t函数
        const flattenedTranslations = flattenTranslations(csrTranslationsData);
        setTranslations(prev => ({
          ...prev,
          ...flattenedTranslations
        }));
      } else {
        // 使用SSG翻译缓存
        const cachedTranslations = await translationCache.getTranslations(ns, lang);

        if (cachedTranslations) {
          setTranslations(prev => ({
            ...prev,
            ...cachedTranslations
          }));
        } else {
          console.warn(`Failed to load SSG translations for ${ns}:${lang}`);
        }
      }
    } catch (error) {
      console.error(`Error loading translations for ${ns}:${lang} (${targetMode}):`, error);

      // 错误回退：尝试另一种模式
      if (targetMode === 'csr') {
        console.log('Falling back to SSG translations');
        try {
          // 清除CSR状态
          setCsrTranslations(null);
          setCsrLoadState({ loading: false, loaded: false, error: error instanceof Error ? error.message : 'Unknown error' });

          // 尝试加载SSG翻译
          const cachedTranslations = await translationCache.getTranslations(ns, lang);
          if (cachedTranslations) {
            setTranslations(prev => ({
              ...prev,
              ...cachedTranslations
            }));
            setCurrentMode('ssg');
            console.log('Successfully loaded SSG translations as fallback');
          } else {
            console.error('Failed to load SSG translations as fallback');
            // 使用回退翻译
            setTranslations(fallbackTranslations);
          }
        } catch (fallbackError) {
          console.error('Fallback to SSG also failed:', fallbackError);
          // 使用回退翻译
          setTranslations(fallbackTranslations);
        }
      }
    } finally {
      setIsLoading(false);
      loadingRef.current.delete(loadKey);
    }
  }, [currentMode]);

  /**
   * 扁平化CSR翻译对象
   */
  const flattenTranslations = useCallback((obj: any, prefix = ''): Record<string, string> => {
    const flattened: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        flattened[newKey] = value;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(flattened, flattenTranslations(value, newKey));
      }
    }

    return flattened;
  }, []);

  /**
   * 翻译函数
   */
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    let value: string | undefined;

    // 优先从当前翻译模式获取
    if (currentMode === 'csr' && csrTranslations) {
      // 尝试从CSR翻译中获取
      value = csrManager.current.getNestedValue(csrTranslations, key);

      // 如果CSR翻译中没有，尝试从扁平化的翻译中获取
      if (!value) {
        value = translations[key];
      }
    } else {
      // 从SSG翻译中获取，或者当CSR翻译不可用时的回退
      value = translations[key];
    }

    // 如果没有找到，尝试从回退翻译中获取
    if (!value) {
      value = fallbackTranslations[key as keyof typeof fallbackTranslations];
    }

    // 如果仍然没有找到，根据回退策略处理
    if (!value) {
      // 只在开发环境显示详细的调试信息
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation missing for key: ${key} in ${namespace}:${language} (${currentMode})`);
        console.log('Available translations:', Object.keys(translations));
        console.log('CSR translations loaded:', !!csrTranslations);
      }

      switch (fallbackStrategy) {
        case 'empty':
          value = '';
          break;
        case 'default':
          value = 'Translation missing';
          break;
        case 'key':
        default:
          value = key;
          break;
      }
    }

    // 参数替换
    if (params && typeof value === 'string') {
      value = csrManager.current.formatMessage(value, params);
    }

    return value;
  }, [translations, csrTranslations, namespace, language, currentMode, fallbackStrategy]);

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

    // 预加载新语言的翻译
    await loadTranslations(namespace, newLang, currentMode);
  }, [language, namespace, currentMode, loadTranslations]);

  /**
   * 预加载指定语言的翻译
   */
  const preloadLanguage = useCallback(async (lang: Language) => {
    await loadTranslations(namespace, lang, currentMode);
  }, [namespace, currentMode, loadTranslations]);

  /**
   * 获取缓存统计信息
   */
  const getCacheStats = useCallback(() => {
    const ssgStats = translationCache.getCacheStats();
    const csrStats = csrManager.current.getCacheStats();

    return {
      ssg: ssgStats,
      csr: csrStats,
      currentMode
    };
  }, [currentMode]);

  /**
   * 重新加载翻译
   */
  const reloadTranslations = useCallback(async () => {
    // 清除当前缓存
    if (currentMode === 'csr') {
      csrManager.current.clearCache(namespace, language);
    } else {
      translationCache.clearLanguageCache(language);
    }

    // 重新加载
    await loadTranslations(namespace, language, currentMode);
  }, [namespace, language, currentMode, loadTranslations]);

  /**
   * 清除翻译缓存
   */
  const clearCache = useCallback(() => {
    if (currentMode === 'csr') {
      csrManager.current.clearCache();
    } else {
      translationCache.clearLanguageCache(language);
    }

    setTranslations({});
    setCsrTranslations(null);
    setCsrLoadState({ loading: false, loaded: false });
  }, [currentMode, language]);

  // 智能预加载
  useEffect(() => {
    if (!isClientSide() || !enablePreload) {
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

        if (currentMode === 'csr') {
          // 使用CSR翻译管理器预加载
          await csrManager.current.preloadTranslations(
            commonNamespaces.filter(ns => ['assessment', 'shared'].includes(ns)),
            userLanguages.slice(0, 2)
          );
        } else {
          // 使用SSG翻译缓存预加载
          await translationCache.preloadTranslations(
            commonNamespaces,
            userLanguages.slice(0, 2)
          );
        }
      } catch (error) {
        console.warn('Smart preload failed:', error);
      }
    };

    // 延迟执行预加载，避免阻塞初始渲染
    const timer = setTimeout(performSmartPreload, 1000);
    return () => clearTimeout(timer);
  }, [currentMode, enablePreload]);

  return {
    t,
    isLoading,
    language,
    changeLanguage,
    preloadLanguage,
    getCacheStats,
    csrLoadState,
    currentMode,
    reloadTranslations,
    clearCache
  };
}

/**
 * 专门用于CSR翻译的便捷Hook
 */
export function useCSRTranslations(
  namespace: string = 'assessment',
  options: Omit<UseTranslationsOptions, 'useCSR' | 'mode'> = {}
): UseTranslationsReturn {
  return useTranslations(namespace, {
    ...options,
    useCSR: true,
    mode: 'csr'
  });
}

/**
 * 专门用于SSG翻译的便捷Hook
 */
export function useSSGTranslations(
  namespace: string = 'assessment',
  options: Omit<UseTranslationsOptions, 'useCSR' | 'mode'> = {}
): UseTranslationsReturn {
  return useTranslations(namespace, {
    ...options,
    useCSR: false,
    mode: 'ssg'
  });
}

/**
 * 自动选择翻译模式的Hook
 */
export function useAutoTranslations(
  namespace: string = 'assessment',
  options: Omit<UseTranslationsOptions, 'mode'> = {}
): UseTranslationsReturn {
  return useTranslations(namespace, {
    ...options,
    mode: 'auto'
  });
}
