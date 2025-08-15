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
        className="btn btn-outline"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('execution.navigation.previous')}
      </button>

      {/* Save Button */}
      {showSaveButton && (
        <button
          onClick={onSave}
          disabled={isSubmitting}
          className="btn btn-ghost btn-sm"
        >
          <Save className="w-4 h-4" />
          {t('execution.navigation.save')}
        </button>
      )}

      {/* Next/Submit Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext || isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            {t('execution.navigation.submitting')}
          </>
        ) : (
          <>
            {isLastQuestion ? t('execution.navigation.submit') : t('execution.navigation.next')}
            {!isLastQuestion && (
              <ChevronRight className="w-4 h-4" />
            )}
          </>
        )}
      </button>
    </div>
  );
});
