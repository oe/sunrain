import { memo } from 'react';

interface NavigationControlsProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  showSaveButton?: boolean;
  t: (key: string, params?: Record<string, any>) => string;
}

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
        className={`
          px-6 py-2 rounded-md font-medium transition-colors
          ${canGoBack && !isSubmitting
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }
        `}
      >
        <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {t('execution.navigation.previous')}
      </button>

      {/* Save Button */}
      {showSaveButton && (
        <button
          onClick={onSave}
          disabled={isSubmitting}
          className={`
            px-4 py-2 rounded-md font-medium transition-colors
            ${!isSubmitting
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
          </svg>
          {t('execution.navigation.save')}
        </button>
      )}

      {/* Next/Submit Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext || isSubmitting}
        className={`
          px-6 py-2 rounded-md font-medium transition-colors
          ${canGoNext && !isSubmitting
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('execution.navigation.submitting')}
          </>
        ) : (
          <>
            {isLastQuestion ? t('execution.navigation.submit') : t('execution.navigation.next')}
            {!isLastQuestion && (
              <svg className="w-4 h-4 ml-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </>
        )}
      </button>
    </div>
  );
});
