import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import type { ErrorDisplayProps, ErrorHandlerProps } from '@/types/assessment';

interface ErrorHandlerState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Unified error handling component
 * Replaces ErrorBoundary.tsx and ErrorDisplay.tsx
 * Uses DaisyUI components and Lucide React icons
 */
export default class ErrorHandler extends Component<ErrorHandlerProps, ErrorHandlerState> {
  constructor(props: ErrorHandlerProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorHandlerState> {
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
      console.error('ErrorHandler caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoBack = () => {
    if (this.props.onGoBack) {
      this.props.onGoBack();
    } else {
      window.location.href = '/assessment/';
    }
  };

  private getTranslation(key: string): string {
    if (this.props.t) {
      return this.props.t(key);
    }

    // Fallback translations for when no translation function is provided
    const fallbackTranslations: Record<string, string> = {
      'errors.boundary.title': 'Application Error',
      'errors.boundary.message': 'Sorry, the application encountered an error.',
      'errors.boundary.details': 'Error Details',
      'actions.retry': 'Retry',
      'actions.goHome': 'Go Home'
    };

    return fallbackTranslations[key] || key;
  }

  render() {
    // If there's a prop error or component caught an error
    const hasError = this.state.hasError || this.props.error;
    const error = this.props.error || this.state.error;
    const errorInfo = this.state.errorInfo;

    if (hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const title = this.props.title || this.getTranslation('errors.boundary.title');
      const message = this.props.message || this.getTranslation('errors.boundary.message');
      const showRetry = this.props.showRetry !== false; // Default to true
      const showGoBack = this.props.showGoBack !== false; // Default to true

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          {/* Error Icon using DaisyUI and Lucide React */}
          <div className="alert alert-error max-w-2xl mb-6">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <div className="text-sm opacity-75">{message}</div>
            </div>
          </div>

          {/* Error Details in Development */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="collapse collapse-arrow bg-base-200 max-w-2xl mb-6">
              <input type="checkbox" />
              <div className="collapse-title text-sm font-medium">
                {this.getTranslation('errors.boundary.details')}
              </div>
              <div className="collapse-content">
                <pre className="text-xs text-error whitespace-pre-wrap overflow-auto max-h-40">
                  {error.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </div>
            </div>
          )}

          {/* Action Buttons using DaisyUI */}
          <div className="flex gap-4">
            {showRetry && (
              <button
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.getTranslation('actions.retry')}
              </button>
            )}

            {showGoBack && (
              <button
                onClick={this.handleGoBack}
                className="btn btn-outline"
              >
                <Home className="w-4 h-4 mr-2" />
                {this.getTranslation('actions.goHome')}
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


export function ErrorDisplay(props: ErrorDisplayProps) {
  const errorMessage = typeof props.error === 'string' ? props.error : props.error.message;

  return (
    <ErrorHandler
      error={typeof props.error === 'string' ? new Error(props.error) : props.error}
      title={props.title}
      message={errorMessage}
      onRetry={props.onRetry}
      onGoBack={props.onGoBack}
      showRetry={props.showRetry}
      showGoBack={props.showGoBack}
      language={props.language}
      t={props.t}
    />
  );
}
