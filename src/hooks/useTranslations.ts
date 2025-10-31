import { useState, useEffect, useCallback, useRef } from "react";
import type { Language } from "@/shared";
// 移除SSG翻译缓存的导入，CSR应该只使用CSR翻译管理器
import { getCSRTranslationManager } from "@/utils/csr-translation-manager";
import type {
  CSRTranslations,
  TranslationLoadState,
} from "@/client-locales/shared/types";
import {
  isClientSide,
  safeLocalStorage,
  safeNavigator,
} from "@/utils/environment";

// No fallback translations - all translations should be properly loaded

interface UseTranslationsOptions {
  /** 是否使用CSR翻译系统 */
  useCSR?: boolean;
  /** 翻译模式：'ssg' | 'csr' | 'auto' */
  mode?: "ssg" | "csr" | "auto";
  /** 是否启用智能预加载 */
  enablePreload?: boolean;
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
  currentMode: "ssg" | "csr";
  /** 重新加载翻译 */
  reloadTranslations: () => Promise<void>;
  /** 清除翻译缓存 */
  clearCache: () => void;
}

export function useTranslations(
  namespace: string = "assessment",
  options: UseTranslationsOptions = {}
): UseTranslationsReturn {
  const { useCSR = false, mode = "auto", enablePreload = true } = options;

  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [csrTranslations, setCsrTranslations] =
    useState<CSRTranslations | null>(null);
  const [csrLoadState, setCsrLoadState] = useState<TranslationLoadState>({
    loading: false,
    loaded: false,
  });
  const [currentMode, setCurrentMode] = useState<"ssg" | "csr">("ssg");
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

      const storedLang = storage?.getItem("preferred-language") as Language;
      const browserLang = nav?.language.split("-")[0] as Language;
      const currentLang = storedLang || browserLang || "en";

      setLanguage(currentLang);
      csrManager.current.setCurrentLanguage(currentLang);

      // 确定翻译模式
      const translationMode = determineTranslationMode();
      console.log(
        `Translation mode determined: ${translationMode} for namespace: ${namespace}`
      );
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
  const determineTranslationMode = useCallback((): "ssg" | "csr" => {
    // 如果明确指定了模式，直接使用（不管是否在客户端）
    if (mode === "ssg" || mode === "csr") {
      return mode;
    }

    // 自动模式：根据useCSR选项和命名空间决定
    if (useCSR || mode === "auto") {
      // 只在客户端使用CSR翻译
      if (isClientSide()) {
        // 检查是否有CSR翻译文件可用
        const hasCSRSupport = ["assessment", "shared"].includes(namespace);
        return hasCSRSupport ? "csr" : "ssg";
      }
    }

    return "ssg";
  }, [mode, useCSR, namespace]);

  /**
   * 加载翻译文件
   */
  const loadTranslations = useCallback(
    async (ns: string, lang: Language, translationMode?: "ssg" | "csr") => {
      const targetMode = translationMode || currentMode;
      const loadKey = `${ns}:${lang}:${targetMode}`;

      // 避免重复加载
      if (loadingRef.current.has(loadKey)) {
        return;
      }

      loadingRef.current.add(loadKey);
      setIsLoading(true);

      try {
        if (targetMode === "csr") {
          // 使用CSR翻译管理器
          setCsrLoadState(csrManager.current.getLoadState(ns, lang));

          const csrTranslationsData = await csrManager.current.loadTranslations(
            ns,
            lang
          );
          setCsrTranslations(csrTranslationsData);
          setCsrLoadState(csrManager.current.getLoadState(ns, lang));

          // 将CSR翻译扁平化以兼容现有的t函数
          const flattenedTranslations =
            flattenTranslations(csrTranslationsData);
          setTranslations((prev) => ({
            ...prev,
            ...flattenedTranslations,
          }));
        } else {
          // SSG模式不应该在客户端加载翻译
          console.warn(`SSG translations should not be loaded in client-side. Use CSR mode instead for ${ns}:${lang}`);
        }
      } catch (error) {
        console.error(
          `Error loading translations for ${ns}:${lang} (${targetMode}):`,
          error
        );

        // 翻译加载失败，记录错误但不使用fallback
        if (targetMode === "csr") {
          setCsrTranslations(null);
          setCsrLoadState({
            loading: false,
            loaded: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } finally {
        setIsLoading(false);
        loadingRef.current.delete(loadKey);
      }
    },
    [currentMode]
  );

  /**
   * 扁平化CSR翻译对象
   */
  const flattenTranslations = useCallback(
    (obj: any, prefix = ""): Record<string, string> => {
      const flattened: Record<string, string> = {};

      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "string") {
          flattened[newKey] = value;
        } else if (typeof value === "object" && value !== null) {
          Object.assign(flattened, flattenTranslations(value, newKey));
        }
      }

      return flattened;
    },
    []
  );

  /**
   * 翻译函数
   */
  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      let value: string | string[] | undefined;

      // 优先从当前翻译模式获取
      if (currentMode === "csr" && csrTranslations) {
        // 从CSR翻译中获取
        value = csrManager.current.getNestedValue(csrTranslations, key);

        // 如果CSR翻译中没有，尝试从扁平化的翻译中获取
        if (!value) {
          value = translations[key];
        }
      } else {
        // 从SSG翻译中获取
        value = translations[key];
      }

      // 处理数组类型的翻译值
      if (Array.isArray(value)) {
        value = value.join(', ');
      }

      // 如果没有找到翻译，在开发环境显示警告
      if (!value) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Translation missing for key: ${key} in ${namespace}:${language} (${currentMode})`
          );
        }
        // 直接返回键名，不使用任何fallback
        value = key;
      }

      // 参数替换
      if (params && typeof value === "string") {
        value = csrManager.current.formatMessage(value, params);
      }

      return value;
    },
    [translations, csrTranslations, namespace, language, currentMode]
  );

  /**
   * 切换语言
   */
  const changeLanguage = useCallback(
    async (newLang: Language) => {
      if (newLang === language || !isClientSide()) return;

      setLanguage(newLang);
      csrManager.current.setCurrentLanguage(newLang);

      const storage = safeLocalStorage();
      if (storage) {
        storage.setItem("preferred-language", newLang);
      }

      // 预加载新语言的翻译
      await loadTranslations(namespace, newLang, currentMode);
    },
    [language, namespace, currentMode, loadTranslations]
  );

  /**
   * 预加载指定语言的翻译
   */
  const preloadLanguage = useCallback(
    async (lang: Language) => {
      await loadTranslations(namespace, lang, currentMode);
    },
    [namespace, currentMode, loadTranslations]
  );

  /**
   * 获取缓存统计信息
   */
  const getCacheStats = useCallback(() => {
    const csrStats = csrManager.current.getCacheStats();

    return {
      csr: csrStats,
      currentMode,
    };
  }, [currentMode]);

  /**
   * 重新加载翻译
   */
  const reloadTranslations = useCallback(async () => {
    // 清除当前缓存
    if (currentMode === "csr") {
      csrManager.current.clearCache(namespace, language);
    }
    // SSG翻译不需要在客户端重新加载

    // 重新加载
    await loadTranslations(namespace, language, currentMode);
  }, [namespace, language, currentMode, loadTranslations]);

  /**
   * 清除翻译缓存
   */
  const clearCache = useCallback(() => {
    if (currentMode === "csr") {
      csrManager.current.clearCache();
    }
    // SSG翻译不需要在客户端清除缓存

    setTranslations({});
    setCsrTranslations(null);
    setCsrLoadState({ loading: false, loaded: false });
  }, [currentMode]);

  // 智能预加载 - 只在CSR模式下进行，完全避免SSG日志
  useEffect(() => {
    if (!isClientSide() || !enablePreload || currentMode !== "csr") {
      return;
    }

    const performCSRPreload = async () => {
      try {
        const storage = safeLocalStorage();
        const nav = safeNavigator();

        const userLanguages = [
          storage?.getItem("preferred-language"),
          nav?.language.split("-")[0],
          "en",
        ].filter(
          (lang, index, arr) => lang && arr.indexOf(lang) === index
        ) as Language[];

        // 只预加载CSR支持的命名空间
        const csrNamespaces = ["assessment", "shared"];

        await csrManager.current.preloadTranslations(
          csrNamespaces,
          userLanguages.slice(0, 2)
        );
      } catch (error) {
        console.warn("CSR preload failed:", error);
      }
    };

    // 延迟执行预加载，避免阻塞初始渲染
    const timer = setTimeout(performCSRPreload, 1000);
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
    clearCache,
  };
}

/**
 * 专门用于CSR翻译的便捷Hook
 */
export function useCSRTranslations(
  namespace: string = "assessment",
  options: Omit<UseTranslationsOptions, "useCSR" | "mode"> = {}
): UseTranslationsReturn {
  return useTranslations(namespace, {
    ...options,
    useCSR: true,
    mode: "csr",
  });
}

/**
 * 专门用于SSG翻译的便捷Hook
 */
export function useSSGTranslations(
  namespace: string = "assessment",
  options: Omit<UseTranslationsOptions, "useCSR" | "mode"> = {}
): UseTranslationsReturn {
  return useTranslations(namespace, {
    ...options,
    useCSR: false,
    mode: "ssg",
  });
}

/**
 * 自动选择翻译模式的Hook
 */
export function useAutoTranslations(
  namespace: string = "assessment",
  options: Omit<UseTranslationsOptions, "mode"> = {}
): UseTranslationsReturn {
  return useTranslations(namespace, {
    ...options,
    mode: "auto",
  });
}
