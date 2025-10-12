import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';
import type { PracticeType } from '@/types/practice';

interface PracticeControlsProps {
  practice: PracticeType;
}

export default function PracticeControls({ practice }: PracticeControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(practice.defaultDuration * 60);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const timerRef = useRef<number | null>(null);

  const startPractice = () => {
    setIsPlaying(true);
    setIsPaused(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsPaused(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pausePractice = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resumePractice = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsPaused(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetPractice = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeRemaining(practice.defaultDuration * 60);
    setCurrentStepIndex(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = practice.defaultDuration * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const currentStep = practice.steps[currentStepIndex];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="text-6xl font-bold text-primary mb-4">
            {formatTime(timeRemaining)}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          {/* Completion Message */}
          {timeRemaining === 0 && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-semibold">
                🎉 Great job! Practice completed.
              </div>
              <div className="text-sm text-green-500 dark:text-green-400 mt-1">
                You've successfully completed your mindfulness practice.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col gap-3 mb-4">
            {/* Play/Pause Button */}
            <div className="w-full">
              {!isPlaying ? (
                <button
                  className="btn btn-primary btn-lg w-full"
                  onClick={startPractice}
                >
                  <Play className="w-5 h-5" />
                  Start Practice
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-lg w-full"
                  onClick={isPaused ? resumePractice : pausePractice}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Reset Button */}
            <button
              className="btn btn-outline w-full"
              onClick={resetPractice}
            >
              Reset
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="range range-primary range-sm flex-1"
              />
            </div>

            {/* Settings */}
            <button
              className="btn btn-ghost btn-sm w-full"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-4">Practice Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Duration (minutes)</span>
                  </label>
                  <input
                    type="range"
                    min={practice.minDuration}
                    max={practice.maxDuration}
                    value={practice.defaultDuration}
                    className="range range-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{practice.minDuration} min</span>
                    <span>{practice.maxDuration} min</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
