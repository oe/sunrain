/**
 * Environment detection utilities
 * Provides consistent client/server environment detection across the application
 */

/**
 * Check if code is running in a client-side environment
 */
export function isClientSide(): boolean {
  return typeof window !== 'undefined' &&
         typeof document !== 'undefined' &&
         typeof localStorage !== 'undefined';
}

/**
 * Check if code is running in a server-side environment
 */
export function isServerSide(): boolean {
  return !isClientSide();
}

/**
 * Safely access localStorage with fallback
 */
export function safeLocalStorage(): Storage | null {
  if (isClientSide()) {
    try {
      return localStorage;
    } catch (error) {
      console.warn('localStorage access failed:', error);
      return null;
    }
  }
  return null;
}

/**
 * Safely access sessionStorage with fallback
 */
export function safeSessionStorage(): Storage | null {
  if (isClientSide() && typeof sessionStorage !== 'undefined') {
    try {
      return sessionStorage;
    } catch (error) {
      console.warn('sessionStorage access failed:', error);
      return null;
    }
  }
  return null;
}

/**
 * Safely access navigator with fallback
 */
export function safeNavigator(): Navigator | null {
  if (isClientSide() && typeof navigator !== 'undefined') {
    return navigator;
  }
  return null;
}

/**
 * Execute code only on client side
 */
export function clientOnly<T>(fn: () => T, fallback?: T): T | undefined {
  if (isClientSide()) {
    try {
      return fn();
    } catch (error) {
      console.error('Client-only function failed:', error);
      return fallback;
    }
  }
  return fallback;
}

/**
 * Execute code only on server side
 */
export function serverOnly<T>(fn: () => T, fallback?: T): T | undefined {
  if (isServerSide()) {
    try {
      return fn();
    } catch (error) {
      console.error('Server-only function failed:', error);
      return fallback;
    }
  }
  return fallback;
}

/**
 * Get user preferred languages safely
 */
export function getUserPreferredLanguages(): string[] {
  const languages: string[] = [];

  if (!isClientSide()) {
    return ['en']; // Default for server-side
  }

  // From localStorage
  const storage = safeLocalStorage();
  if (storage) {
    const userLang = storage.getItem('user_language');
    if (userLang) {
      languages.push(userLang);
    }
  }

  // From navigator
  const nav = safeNavigator();
  if (nav) {
    if (nav.language) {
      const browserLang = nav.language.split('-')[0];
      if (!languages.includes(browserLang)) {
        languages.push(browserLang);
      }
    }

    if (nav.languages) {
      nav.languages.forEach(lang => {
        const langCode = lang.split('-')[0];
        if (!languages.includes(langCode)) {
          languages.push(langCode);
        }
      });
    }
  }

  // Ensure default language
  if (!languages.includes('en')) {
    languages.push('en');
  }

  return languages;
}
