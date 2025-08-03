import { memo } from 'react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  t?: (key: string, params?: Record<string, any>) => string;
}

export default memo(function ErrorDisplay({
  title,
  message,
  onRetry,
  onGoBack,
  showRetry = false,
  showGoBack = false,
  t
}: ErrorDisplayProps) {
  // 默认翻译函数
  const defaultT = (key: string) => {
    const translations: Record<string, string> = {
      'errors.title': '错误',
      'errors.retry': '重试',
      'errors.goBack': '返回'
    };
    return translations[key] || key;
  };
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <svg className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title || (t || defaultT)('errors.title')}
      </h2>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {message}
      </p>

      <div className="space-x-4">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {(t || defaultT)('errors.retry')}
          </button>
        )}

        {showGoBack && onGoBack && (
          <button
            onClick={onGoBack}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {(t || defaultT)('errors.goBack')}
          </button>
        )}
      </div>
    </div>
  );
});
