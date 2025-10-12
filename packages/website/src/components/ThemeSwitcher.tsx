import { useState, useRef, useEffect } from 'react';
import { Monitor, Sun, Moon, Check } from 'lucide-react';

interface Props {
  currentTheme?: string;
}

const themeOptions = [
  { key: 'system', label: 'System default', icon: Monitor },
  { key: 'light', label: 'Light mode', icon: Sun },
  { key: 'dark', label: 'Dark mode', icon: Moon },
];

export default function ThemeSwitcher({ currentTheme = 'system' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(currentTheme);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Apply theme to document
  const applyTheme = (selectedTheme: string) => {
    const html = document.documentElement;

    // Remove existing theme classes
    html.classList.remove('dark');
    html.removeAttribute('data-theme');

    if (selectedTheme === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else if (selectedTheme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else { // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
      } else {
        html.setAttribute('data-theme', 'light');
      }
    }

    localStorage.setItem('theme', selectedTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const getCurrentIcon = () => {
    const option = themeOptions.find(opt => opt.key === theme);
    return option ? option.icon : Monitor;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="text-sm font-medium" aria-hidden="true">
          {theme === 'system' ? 'SYS' : theme === 'light' ? 'LGT' : 'DRK'}
        </span>
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
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg theme-dropdown z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-100">
          {themeOptions.map(({ key, label, icon: Icon }, index) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextIndex = (index + 1) % themeOptions.length;
                  const nextButton = e.currentTarget.parentElement?.children[nextIndex] as HTMLButtonElement;
                  nextButton?.focus();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prevIndex = (index - 1 + themeOptions.length) % themeOptions.length;
                  const prevButton = e.currentTarget.parentElement?.children[prevIndex] as HTMLButtonElement;
                  prevButton?.focus();
                }
              }}
              className={`flex items-center space-x-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none transition-colors duration-150 ${key === theme
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-200'
                }`}
              role="option"
              aria-selected={key === theme}
              autoFocus={index === 0 && isOpen}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {key === theme && <Check className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}