import React, { Suspense, type ReactNode } from 'react';
import ErrorHandler from './ErrorHandler';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error, errorInfo?: React.ErrorInfo) => void;
}

/**
 * Simple lazy loading wrapper component
 * Replaces LazyAssessmentTaker.tsx and LazyComponents.tsx
 * Uses DaisyUI loading components
 */
export default function LazyWrapper({
  children,
  fallback = (
    <div className="flex justify-center items-center py-8">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  ),
  errorFallback,
  onError
}: LazyWrapperProps) {
  return (
    <ErrorHandler
      fallback={errorFallback}
      onError={onError}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorHandler>
  );
}

// Convenience component for assessment-specific lazy loading
interface LazyAssessmentWrapperProps {
  children: ReactNode;
  loadingMessage?: string;
  t?: (key: string, params?: Record<string, any>) => string;
}

export function LazyAssessmentWrapper({
  children,
  loadingMessage,
  t
}: LazyAssessmentWrapperProps) {
  const defaultMessage = t ? t('loading.component') : 'Loading component...';
  const message = loadingMessage || defaultMessage;

  return (
    <LazyWrapper
      fallback={
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {message}
            </span>
          </div>
        </div>
      }
    >
      {children}
    </LazyWrapper>
  );
}
