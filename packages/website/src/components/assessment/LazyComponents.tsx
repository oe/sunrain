import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

// 懒加载的评测相关组件
export const LazyAssessmentTaker = lazy(() => import('./AssessmentTaker'));
export const LazyQuestionCard = lazy(() => import('./QuestionCard'));
export const LazyResultsDisplay = lazy(() => import('./ResultsDisplay'));
export const LazyContinueAssessmentWidget = lazy(() => import('./ContinueAssessmentWidget'));

// 通用的懒加载包装器
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <LoadingSpinner />,
  errorFallback,
  onError
}) => {
  return (
    <ErrorBoundary fallback={errorFallback ? React.createElement(errorFallback, { error: new Error('Component loading failed'), retry: () => window.location.reload() }) : undefined} onError={onError}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// 预加载函数
export const preloadAssessmentComponents = () => {
  // 预加载核心评测组件
  LazyAssessmentTaker;
  LazyQuestionCard;

  // 可以根据需要预加载其他组件
  if (typeof window !== 'undefined') {
    // 在空闲时间预加载
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        LazyResultsDisplay;
        LazyContinueAssessmentWidget;
      });
    } else {
      // 回退到setTimeout
      setTimeout(() => {
        LazyResultsDisplay;
        LazyContinueAssessmentWidget;
      }, 1000);
    }
  }
};
