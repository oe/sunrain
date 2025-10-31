import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';

interface PracticeControlsProps {
  defaultDuration: number;
  minDuration: number;
  maxDuration: number;
  translations: {
    start: string;
    pause: string;
    resume: string;
    reset: string;
    mute: string;
    unmute: string;
    settings: string;
    duration: string;
    completed: string;
    practiceSettings: string;
    minutes: string;
    durationChangeTitle: string;
    durationChangeMessage: string;
    durationChangeCancel: string;
    durationChangeConfirm: string;
  };
}

export default function PracticeControls({ 
  defaultDuration, 
  minDuration, 
  maxDuration, 
  translations 
}: PracticeControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(defaultDuration);
  const [timeRemaining, setTimeRemaining] = useState(defaultDuration * 60);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [tempDuration, setTempDuration] = useState(defaultDuration);
  const [lastConfirmedDuration, setLastConfirmedDuration] = useState(defaultDuration);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const updateTimer = useCallback(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    const remaining = Math.max(0, (currentDuration * 60) - elapsed);
    
    setTimeRemaining(remaining);
    
    if (remaining <= 0) {
      setIsPlaying(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [currentDuration]);

  const startPractice = () => {
    // 先停止任何现有的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 记录开始时间
    startTimeRef.current = Date.now();
    
    // 设置状态
    setIsPlaying(true);
    setIsPaused(false);
    setTimeRemaining(currentDuration * 60);
    
    // 启动定时器
    timerRef.current = setInterval(updateTimer, 500);
  };

  const pausePractice = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // 记录暂停时间
    pausedTimeRef.current = Date.now();
    setIsPaused(true);
  };

  const resumePractice = () => {
    // 调整开始时间，减去暂停的时间
    const pauseDuration = Date.now() - pausedTimeRef.current;
    startTimeRef.current += pauseDuration;
    
    // 重新开始定时器
    timerRef.current = setInterval(updateTimer, 500);
    setIsPaused(false);
  };

  const resetPractice = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setTimeRemaining(currentDuration * 60);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleDurationChange = (newDuration: number) => {
    if (isPlaying && !isPaused) {
      // 正在倒计时：显示确认模态框
      setTempDuration(newDuration);
      setShowDurationModal(true);
    } else {
      // 停止或暂停状态：直接更新
      setCurrentDuration(newDuration);
      setLastConfirmedDuration(newDuration);
    }
  };

  const confirmDurationChange = () => {
    setCurrentDuration(tempDuration);
    setTimeRemaining(tempDuration * 60);
    setLastConfirmedDuration(tempDuration);
    setShowDurationModal(false);
  };

  const cancelDurationChange = () => {
    setShowDurationModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = currentDuration * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };


  // Initialize component
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // 页面可见性检测 - 防止浏览器标签页冻结影响倒计时
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isPlaying && !isPaused && timerRef.current) {
        // 页面重新可见时，重新计算剩余时间
        updateTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isPaused, updateTimer]);

  // Handle duration changes during practice (for non-playing states)
  useEffect(() => {
    if (!isInitialized) return;

    if (isPaused) {
      // If paused, update remaining time proportionally
      const progressRatio = timeRemaining / (currentDuration * 60);
      setTimeRemaining(Math.floor(currentDuration * 60 * progressRatio));
    } else if (!isPlaying) {
      // If stopped, update timeRemaining to match currentDuration
      setTimeRemaining(currentDuration * 60);
    }
  }, [currentDuration, isInitialized, isPlaying, isPaused]);

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
                {translations.completed}
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
                  {translations.start}
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-lg w-full"
                  onClick={isPaused ? resumePractice : pausePractice}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      {translations.resume}
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      {translations.pause}
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
              {translations.reset}
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
              {translations.settings}
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-4">{translations.practiceSettings}</h4>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">{translations.duration}</span>
                  </label>
                  <input
                    type="range"
                    min={minDuration}
                    max={maxDuration}
                    value={currentDuration}
                    onChange={(e) => setCurrentDuration(parseInt(e.target.value))}
                    onMouseUp={(e) => {
                      const newDuration = parseInt((e.target as HTMLInputElement).value);
                      if (newDuration !== lastConfirmedDuration) {
                        handleDurationChange(newDuration);
                      }
                    }}
                    className="range range-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{minDuration} {translations.minutes}</span>
                    <span className="font-medium text-base-content">{currentDuration} {translations.minutes}</span>
                    <span>{maxDuration} {translations.minutes}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Duration Change Confirmation Modal */}
      {showDurationModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{translations.durationChangeTitle}</h3>
            <p className="mb-4">
              {translations.durationChangeMessage} <strong>{tempDuration} {translations.minutes}</strong>？
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-outline" 
                onClick={cancelDurationChange}
              >
                {translations.durationChangeCancel}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={confirmDurationChange}
              >
                {translations.durationChangeConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
