import { lazy } from 'react';

// 懒加载的评测相关组件
export const LazyAssessmentTaker = lazy(() => import('./AssessmentTaker'));
export const LazyQuestionCard = lazy(() => import('./QuestionCard'));
export const LazyResultsDisplay = lazy(() => import('./ResultsDisplay'));
export const LazyContinueAssessmentPage = lazy(() => import('./ContinueAssessmentPage'));

// Re-export the unified LazyWrapper
export { default as LazyWrapper, LazyAssessmentWrapper } from './LazyWrapper';

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
        LazyContinueAssessmentPage;
      });
    } else {
      // 回退到setTimeout
      setTimeout(() => {
        LazyResultsDisplay;
        LazyContinueAssessmentPage;
      }, 1000);
    }
  }
};
