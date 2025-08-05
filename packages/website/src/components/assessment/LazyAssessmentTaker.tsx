import React, { Suspense, lazy } from 'react';
import type { AssessmentTakerProps } from './AssessmentTaker';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

// 懒加载AssessmentTaker组件
const AssessmentTaker = lazy(() => import('./AssessmentTaker'));

// 加载状态组件
const AssessmentLoadingFallback: React.FC = () => (
  <div className="max-w-4xl mx-auto">
    <div className="animate-pulse">
      {/* 进度条骨架 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
        </div>
      </div>

      {/* 问题卡片骨架 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>

        {/* 选项骨架 */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 导航按钮骨架 */}
      <div className="flex items-center justify-between">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="flex space-x-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-10 bg-blue-200 dark:bg-blue-700 rounded w-20"></div>
        </div>
      </div>
    </div>

    {/* 加载提示 */}
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <LoadingSpinner size="small" />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          正在加载评测组件...
        </span>
      </div>
    </div>
  </div>
);


// 懒加载包装组件
const LazyAssessmentTaker: React.FC<AssessmentTakerProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={<div className="text-center py-8">
        <p className="text-red-600 mb-4">加载评测组件时出现错误</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          重新加载
        </button>
      </div>}
      onError={(error, errorInfo) => {
        console.error('AssessmentTaker lazy loading failed:', error, errorInfo);

        // 可以在这里添加错误报告逻辑
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'exception', {
            description: `AssessmentTaker lazy loading failed: ${error.message}`,
            fatal: false
          });
        }
      }}
    >
      <Suspense fallback={<AssessmentLoadingFallback />}>
        <AssessmentTaker {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyAssessmentTaker;
