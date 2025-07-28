import { useState, useEffect } from 'react';
import { getAssessmentTranslations } from '@/locales/assessment';
import type { Language } from '@sunrain/shared';

export function useTranslations(namespace: string = 'assessment') {
  const [language, setLanguage] = useState<Language>('zh');
  const [translations, setTranslations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeLanguage();
  }, [namespace]);

  const initializeLanguage = async () => {
    try {
      setIsLoading(true);

      // 从URL或localStorage获取语言设置
      const urlLang = getLanguageFromURL();
      const storedLang = localStorage.getItem('preferred-language') as Language;
      const browserLang = navigator.language.split('-')[0] as Language;

      const currentLang = urlLang || storedLang || browserLang || 'zh';
      setLanguage(currentLang);

      // 加载翻译文件
      await loadTranslations(currentLang, namespace);
    } catch (error) {
      console.error('Failed to initialize language:', error);
      // 回退到默认语言
      await loadTranslations('zh', namespace);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTranslations = async (lang: Language, ns: string) => {
    try {
      let translations;

      switch (ns) {
        case 'assessment':
          translations = getAssessmentTranslations(lang);
          break;
        default:
          translations = {};
      }

      setTranslations(translations);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:${ns}`, error);
      // 回退到默认语言
      if (lang !== 'zh') {
        await loadTranslations('zh', ns);
      }
    }
  };

  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return key;
    }

    // 参数替换
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  const changeLanguage = async (newLang: Language) => {
    try {
      setIsLoading(true);
      setLanguage(newLang);
      localStorage.setItem('preferred-language', newLang);
      await loadTranslations(newLang, namespace);

      // 更新URL（如果需要）
      updateURLLanguage(newLang);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    language,
    t,
    changeLanguage,
    isLoading
  };
}

function getLanguageFromURL(): Language | null {
  if (typeof window === 'undefined') return null;

  const path = window.location.pathname;
  const langMatch = path.match(/^\/([a-z]{2})\//);
  return langMatch ? langMatch[1] as Language : null;
}

function updateURLLanguage(lang: Language) {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  const newPath = currentPath.replace(/^\/[a-z]{2}\//, `/${lang}/`);

  if (newPath !== currentPath) {
    window.history.replaceState({}, '', newPath);
  }
}
