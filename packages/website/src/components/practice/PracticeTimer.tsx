import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PracticeTimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export default function PracticeTimer({
  duration,
  isActive,
  onComplete,
  onTick
}: PracticeTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused || isCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsCompleted(true);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer) {
        clearInterval(timer as any);
      }
    };
  }, [isActive, isPaused, isCompleted, onComplete]);

  useEffect(() => {
    onTick?.(timeRemaining);
  }, [timeRemaining, onTick]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timeRemaining) / duration) * 100;
  };

  const resetTimer = () => {
    setTimeRemaining(duration);
    setIsCompleted(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-green-500';
    if (isPaused) return 'text-yellow-500';
    if (timeRemaining <= 60) return 'text-red-500';
    return 'text-primary';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed!';
    if (isPaused) return 'Paused';
    if (timeRemaining <= 60) return 'Almost done!';
    return 'In Progress';
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body text-center">
        {/* Timer Display */}
        <div className="mb-6">
          <div className={`text-6xl font-mono font-bold ${getStatusColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {getStatusText()}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <progress
            className="progress progress-primary w-full"
            value={getProgressPercentage()}
            max="100"
          ></progress>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0:00</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isCompleted && (
            <button
              className={`btn ${isPaused ? 'btn-success' : 'btn-warning'}`}
              onClick={togglePause}
              disabled={!isActive}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              )}
            </button>
          )}

          <button
            className="btn btn-outline"
            onClick={resetTimer}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-green-600 dark:text-green-400 font-semibold">
              🎉 Great job! Practice completed.
            </div>
            <div className="text-sm text-green-500 dark:text-green-400 mt-1">
              You've successfully completed your mindfulness practice.
            </div>
          </div>
        )}

        {/* Quick Time Presets */}
        <div className="mt-6">
          <div className="text-sm text-gray-500 mb-2">Quick Start:</div>
          <div className="flex justify-center gap-2">
            {[60, 300, 600, 900].map((seconds) => (
              <button
                key={seconds}
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setTimeRemaining(seconds);
                  setIsCompleted(false);
                  setIsPaused(false);
                }}
                disabled={isActive && !isPaused}
              >
                {formatTime(seconds)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
