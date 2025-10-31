import { memo } from 'react';
import { ChevronLeft, Save, ChevronRight } from 'lucide-react';
import type { NavigationControlsProps } from '@/types/assessment';

export default memo(function NavigationControls({
  canGoBack,
  canGoNext,
  isLastQuestion,
  isSubmitting,
  onPrevious,
  onNext,
  onSave,
  showSaveButton = true,
  t
}: NavigationControlsProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!canGoBack || isSubmitting}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {t('execution.navigation.previous')}
      </button>

      {/* Save Button */}
      {showSaveButton && (
        <button
          onClick={onSave}
          disabled={isSubmitting}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Save className="w-4 h-4 mr-1" />
          {t('execution.navigation.save')}
        </button>
      )}

      {/* Next/Submit Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext || isSubmitting}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {t('execution.navigation.submitting')}
          </>
        ) : (
          <>
            {isLastQuestion ? t('execution.navigation.submit') : t('execution.navigation.next')}
            {!isLastQuestion && (
              <ChevronRight className="w-4 h-4 ml-1" />
            )}
          </>
        )}
      </button>
    </div>
  );
});
