import { memo } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  percentage: number;
  assessmentName?: string;
  timeSpent?: number;
  onPause?: () => void;
  showPauseButton?: boolean;
  isPaused?: boolean;
  isCompleted?: boolean;
  t: (key: string, params?: Record<string, any>) => string;
}

export default memo(function ProgressBar({
  current,
  total,
  percentage,
  assessmentName,
  timeSpent,
  onPause,
  showPauseButton = true,
  t
}: ProgressBarProps) {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-8">
      {/* Header with title and controls */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {assessmentName || t('assessment.title')}
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('progress.text', {
              current: current + 1,
              total: total
            })}
          </span>
          {showPauseButton && onPause && (
            <button
              onClick={onPause}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title={t('execution.pause')}
            >
              <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t('execution.pause')}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        >
          <div className="h-full bg-white bg-opacity-20 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Progress details */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('execution.questionNumber', { number: current + 1 })}
          </span>
          {timeSpent !== undefined && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {t('execution.timeSpent')}: {formatTime(timeSpent)}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            {percentage.toFixed(0)}% {t('execution.complete')}
          </span>
        </div>
      </div>

      {/* Progress milestones */}
      <div className="flex justify-between mt-2">
        {[25, 50, 75, 100].map((milestone) => (
          <div
            key={milestone}
            className={`flex flex-col items-center ${
              percentage >= milestone
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                percentage >= milestone
                  ? 'bg-blue-600 dark:bg-blue-400'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
            <span className="text-xs mt-1">{milestone}%</span>
          </div>
        ))}
      </div>
    </div>
  );
});
