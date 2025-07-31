import { memo } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  t?: (key: string, params?: Record<string, any>) => string;
}

export default memo(function LoadingSpinner({
  message,
  size = 'medium',
  t
}: LoadingSpinnerProps) {
  // 默认翻译函数
  const defaultT = (key: string) => {
    const translations: Record<string, string> = {
      'client.loading.default': '正在加载...',
      'client.loading.assessment': '正在加载评测...'
    };
    return translations[key] || key;
  };
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const containerClasses = {
    small: 'py-4',
    medium: 'py-8',
    large: 'py-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600 dark:text-gray-300 text-center">
        {message || (t || defaultT)('client.loading.default')}
      </p>
    </div>
  );
});
