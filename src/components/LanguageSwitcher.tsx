import { useState, useRef, useEffect } from 'react';
import { getRelativeLocaleUrl, languages, type Language } from '@/shared';

interface Props {
  currentLang: Language;
  currentPath: string;
}

const languageEmojis: Record<Language, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  es: '🇪🇸',
  ja: '🇯🇵',
  ko: '🇰🇷',
  hi: '🇮🇳',
  ar: '🇸🇦'
};

const languageNames: Record<Language, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  ar: 'العربية'
};

export default function LanguageSwitcher({ currentLang, currentPath }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const languageKeys = Object.keys(languages) as Language[];

  const getLocalizedPath = (locale: Language) => {
    // Remove current language prefix from path
    const path = currentPath.replace(`/${currentLang}`, '');
    return getRelativeLocaleUrl(locale, path);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev + 1) % languageKeys.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev - 1 + languageKeys.length) % languageKeys.length);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          const selectedLang = languageKeys[focusedIndex];
          window.location.href = getLocalizedPath(selectedLang);
        }
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setFocusedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label={`Change language. Current language: ${languageNames[currentLang]}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={`Current language: ${languageNames[currentLang]}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-sm font-medium" aria-hidden="true">{currentLang.toUpperCase()}</span>
        <svg
          className={`w-3 h-3 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          role="listbox"
          aria-label="Language options"
          aria-activedescendant={focusedIndex >= 0 ? `lang-option-${languageKeys[focusedIndex]}` : undefined}
        >
          <div className="py-1">
            {languageKeys.map((code, index) => (
              <a
                key={code}
                id={`lang-option-${code}`}
                href={getLocalizedPath(code)}
                className={`flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-150 focus:outline-none ${
                  code === currentLang
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : index === focusedIndex
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => {
                  setIsOpen(false);
                  setFocusedIndex(-1);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                role="option"
                aria-selected={code === currentLang}
                aria-label={`Switch to ${languageNames[code]}`}
              >
                <span className="text-base" aria-hidden="true">{languageEmojis[code]}</span>
                <span className="flex-1">{languageNames[code]}</span>
                {code === currentLang && (
                  <svg
                    className="w-4 h-4 text-blue-500 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Current language"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
