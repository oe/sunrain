import { useState } from 'react';
import { Languages } from 'lucide-react';
import { languages, type Language } from '@/i18n/config';
import { getRelativeLocaleUrl } from '@/i18n/utils';

interface Props {
  currentLang: Language;
  currentPath: string;
}

export default function LanguageSwitcher({ currentLang, currentPath }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const getLocalizedPath = (locale: Language) => {
    // Remove current language prefix from path
    return getRelativeLocaleUrl(locale, '/');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        aria-label="Change language"
      >
        <Languages />
        <span>{languages[currentLang]}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {Object.entries(languages).map(([code, name]) => (
              <a
                key={code}
                href={getLocalizedPath(code as Language)}
                className={`block px-4 py-2 text-sm transition-colors ${
                  code === currentLang
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {name}
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
