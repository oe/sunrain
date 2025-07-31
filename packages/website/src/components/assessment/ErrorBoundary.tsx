import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  t?: (key: string, params?: Record<string, any>) => string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认翻译函数
      const defaultT = (key: string) => {
        const translations: Record<string, string> = {
          'client.errors.boundary.title': '应用程序错误',
          'client.errors.boundary.message': '抱歉，应用程序遇到了一个错误。',
          'client.errors.boundary.details': '错误详情',
          'client.errors.boundary.retry': '重试',
          'client.errors.boundary.goHome': '返回首页'
        };
        return translations[key] || key;
      };

      const t = this.props.t || defaultT;
      return (
        <div className="max-w-2xl mx-auto text-center py-12">
          <svg className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('client.errors.boundary.title')}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('client.errors.boundary.message')}
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium text-gray-900 dark:text-white mb-2">
                {t('client.errors.boundary.details')}
              </summary>
              <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="space-x-4">
            <button
              onClick={this.handleRetry}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('client.errors.boundary.retry')}
            </button>

            <button
              onClick={() => window.location.href = '/assessment/'}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('client.errors.boundary.goHome')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
