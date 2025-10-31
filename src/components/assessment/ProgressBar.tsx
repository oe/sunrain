import { memo, useCallback, useMemo } from 'react';
import { Pause, CheckCircle, Clock } from 'lucide-react';

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
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="mb-8">
      {/* Header with title and controls */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {assessmentName || t('assessment.title')}
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('progress.text', {
              current: current + 1,
              total: total
            })}
          </span>
          {showPauseButton && onPause && (
            <button
              onClick={onPause}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
              title={t('execution.pause')}
            >
              <Pause className="w-4 h-4 mr-1" />
              {t('execution.pause')}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        ></div>
      </div>

      {/* Progress details */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('execution.questionNumber', { number: current + 1 })}
          </span>
          {timeSpent !== undefined && (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
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
        {useMemo(() => [25, 50, 75, 100].map((milestone) => (
          <div
            key={milestone}
            className={`flex flex-col items-center ${
              percentage >= milestone
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-600'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              percentage >= milestone ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <span className="text-xs mt-1">{milestone}%</span>
          </div>
        )), [percentage])}
      </div>
    </div>
  );
});
