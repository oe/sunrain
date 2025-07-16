import { useState } from 'react';
import { languages, type Language } from '@/i18n/config';
import { getRelativeLocaleUrl } from '@/i18n/utils';

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

export default function LanguageSwitcher({ currentLang, currentPath }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const getLocalizedPath = (locale: Language) => {
    // Remove current language prefix from path
    const path = currentPath.replace(`/${currentLang}`, '');
    return getRelativeLocaleUrl(locale, path);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-1"
        aria-label="Change language"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-sm font-medium">{currentLang.toUpperCase()}</span>
        <svg
          className={`w-3 h-3 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="py-1">
            {Object.entries(languages).map(([code, name]) => (
              <a
                key={code}
                href={getLocalizedPath(code as Language)}
                className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                  code === currentLang
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-base">{languageEmojis[code as Language]}</span>
                <span>{name}</span>
                {code === currentLang && (
                  <span className="ml-auto text-xs text-blue-500">✓</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
