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
        <h1 className="text-2xl font-bold">
          {assessmentName || t('assessment.title')}
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm opacity-70">
            {t('progress.text', {
              current: current + 1,
              total: total
            })}
          </span>
          {showPauseButton && onPause && (
            <button
              onClick={onPause}
              className="btn btn-ghost btn-sm"
              title={t('execution.pause')}
            >
              <Pause className="w-4 h-4" />
              {t('execution.pause')}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <progress
        className="progress progress-primary w-full mb-2"
        value={Math.max(0, Math.min(100, percentage))}
        max="100"
      ></progress>

      {/* Progress details */}
      <div className="flex justify-between items-center text-xs opacity-60">
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
          <span className="text-primary font-medium">
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
                ? 'text-primary'
                : 'opacity-40'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              percentage >= milestone ? 'bg-primary' : 'bg-base-300'
            }`} />
            <span className="text-xs mt-1">{milestone}%</span>
          </div>
        )), [percentage])}
      </div>
    </div>
  );
});
