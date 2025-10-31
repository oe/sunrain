import { useState, useEffect, useRef } from 'react';

interface BreathingCircleProps {
  inhaleDuration?: number;
  exhaleDuration?: number;
  isActive?: boolean;
  onComplete?: () => void;
}

export default function BreathingCircle({
  inhaleDuration = 4,
  exhaleDuration = 6,
  isActive = false,
  onComplete
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<'inhale' | 'exhale' | 'hold'>('inhale');
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setPhase('inhale');
      setProgress(0);
      setCycleCount(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    startBreathingCycle();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, inhaleDuration, exhaleDuration]);

  const startBreathingCycle = () => {
    startTimeRef.current = Date.now();
    setPhase('inhale');
    setProgress(0);
    animateBreathing();
  };

  const animateBreathing = () => {
    if (!isActive) return;

    const now = Date.now();
    const elapsed = (now - (startTimeRef.current || 0)) / 1000;
    const totalCycleTime = inhaleDuration + exhaleDuration;
    const cycleProgress = (elapsed % totalCycleTime) / totalCycleTime;

    if (cycleProgress < inhaleDuration / totalCycleTime) {
      // Inhale phase
      setPhase('inhale');
      const inhaleProgress = cycleProgress / (inhaleDuration / totalCycleTime);
      setProgress(inhaleProgress);
    } else {
      // Exhale phase
      setPhase('exhale');
      const exhaleProgress = (cycleProgress - inhaleDuration / totalCycleTime) / 
                           (exhaleDuration / totalCycleTime);
      setProgress(exhaleProgress);
    }

    // Update cycle count
    const completedCycles = Math.floor(elapsed / totalCycleTime);
    setCycleCount(completedCycles);

    animationRef.current = requestAnimationFrame(animateBreathing);
  };

  const getCircleSize = () => {
    if (phase === 'inhale') {
      return 100 + (progress * 100); // Scale from 100% to 200%
    } else {
      return 200 - (progress * 100); // Scale from 200% to 100%
    }
  };

  const getCircleColor = () => {
    if (phase === 'inhale') {
      return 'rgb(59, 130, 246)'; // Blue for inhale
    } else {
      return 'rgb(34, 197, 94)'; // Green for exhale
    }
  };

  const getInstructionText = () => {
    if (phase === 'inhale') {
      return 'Breathe In';
    } else {
      return 'Breathe Out';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Breathing Circle */}
      <div className="relative mb-8">
        <div
          className="rounded-full border-4 transition-all duration-300 ease-in-out"
          style={{
            width: `${getCircleSize()}px`,
            height: `${getCircleSize()}px`,
            borderColor: getCircleColor(),
            backgroundColor: `${getCircleColor()}20`,
          }}
        >
          {/* Inner circle with instruction */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {getInstructionText()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Cycle {cycleCount + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Breathing Exercise
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Follow the circle as it expands and contracts. Breathe in as it grows, 
          and breathe out as it shrinks.
        </p>
        
        <div className="flex justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Inhale ({inhaleDuration}s)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Exhale ({exhaleDuration}s)</span>
          </div>
        </div>
      </div>

      {/* Cycle Counter */}
      {cycleCount > 0 && (
        <div className="mt-6 text-center">
          <div className="badge badge-primary badge-lg">
            {cycleCount} cycle{cycleCount !== 1 ? 's' : ''} completed
          </div>
        </div>
      )}
    </div>
  );
}
