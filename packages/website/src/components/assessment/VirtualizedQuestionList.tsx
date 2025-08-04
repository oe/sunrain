import { memo } from 'react';
import { useVirtualList } from '@/utils/RenderOptimizer';
import type { Question } from '@/types/assessment';

interface VirtualizedQuestionListProps {
  questions: Question[];
  currentIndex: number;
  onQuestionSelect: (index: number) => void;
  containerHeight: number;
  itemHeight?: number;
  t: (key: string, params?: Record<string, any>) => string;
}

export default memo(function VirtualizedQuestionList({
  questions,
  currentIndex,
  onQuestionSelect,
  containerHeight,
  itemHeight = 60,
  t
}: VirtualizedQuestionListProps) {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  } = useVirtualList({
    items: questions,
    itemHeight,
    containerHeight
  });

  const getQuestionStatus = (index: number) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'current':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3.586l2.707 2.707a1 1 0 01-1.414 1.414L11 13.414V7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('questionList.title')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('questionList.progress', {
            current: currentIndex + 1,
            total: questions.length
          })}
        </p>
      </div>

      <div
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map(({ item: question, index }) => {
              const status = getQuestionStatus(index);
              const statusColor = getStatusColor(status);

              return (
                <div
                  key={question.id}
                  className={`
                    flex items-center p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer
                    hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                    ${index === currentIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                  style={{ height: itemHeight }}
                  onClick={() => onQuestionSelect(index)}
                >
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border mr-3
                    ${statusColor}
                  `}>
                    {getStatusIcon(status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('questionList.questionNumber', { number: index + 1 })}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {question.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {question.text}
                    </p>
                  </div>

                  {question.required && (
                    <span className="text-red-500 text-xs ml-2">*</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {t('questionList.completed')}: {currentIndex}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            {t('questionList.remaining')}: {questions.length - currentIndex}
          </span>
        </div>

        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
});
