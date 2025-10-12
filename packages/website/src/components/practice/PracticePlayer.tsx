import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Settings } from 'lucide-react';
import type { PracticeType, PracticeSession } from '@/types/practice';

interface PracticePlayerProps {
  practiceId: string;
}

export default function PracticePlayer({ practiceId }: PracticePlayerProps) {
  const [practice, setPractice] = useState<PracticeType | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<number | null>(null);

  // Load practice data
  useEffect(() => {
    loadPractice();
  }, [practiceId]);

  const loadPractice = async () => {
    try {
      // TODO: Load from PracticeSystem
      // const practiceData = await practiceSystem.content.getPractice(practiceId);
      // setPractice(practiceData);
      
      // For now, use mock data based on practiceId
      const mockPractices: Record<string, PracticeType> = {
        'mindful-breathing-basic': {
          id: 'mindful-breathing-basic',
          name: 'Basic Mindful Breathing',
          description: 'A simple breathing exercise to help you focus and relax.',
          category: 'breathing',
          difficulty: 'beginner',
          defaultDuration: 5,
          minDuration: 3,
          maxDuration: 15,
          steps: [
            {
              id: 'step-1',
              title: 'Get Comfortable',
              description: 'Find a comfortable seated position',
              duration: 30,
              instruction: 'Sit comfortably with your back straight and feet flat on the floor.',
            },
            {
              id: 'step-2',
              title: 'Natural Breathing',
              description: 'Notice your natural breath',
              duration: 60,
              instruction: 'Simply notice your breath as it flows in and out naturally.',
            },
          ],
          instructions: ['Find a quiet space', 'Sit comfortably'],
          benefits: ['Reduces stress', 'Improves focus'],
          tips: ['Start with shorter sessions'],
          tags: ['breathing', 'mindfulness'],
          targetAudience: ['beginners'],
          therapeuticBenefits: ['stress reduction'],
          language: 'en',
          customizable: {
            duration: true,
            backgroundMusic: true,
            voiceGuidance: true,
            visualCues: true,
          },
          averageRating: 4.7,
          completionRate: 0.89,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'body-scan-meditation': {
          id: 'body-scan-meditation',
          name: 'Progressive Body Scan',
          description: 'A guided meditation that helps you relax by systematically focusing on different parts of your body.',
          category: 'meditation',
          difficulty: 'beginner',
          defaultDuration: 15,
          minDuration: 10,
          maxDuration: 30,
          steps: [
            {
              id: 'step-1',
              title: 'Preparation',
              description: 'Get into a comfortable lying position',
              duration: 60,
              instruction: 'Lie down comfortably on your back.',
            },
            {
              id: 'step-2',
              title: 'Starting with Feet',
              description: 'Focus on your feet and toes',
              duration: 120,
              instruction: 'Bring your attention to your feet.',
            },
            {
              id: 'step-3',
              title: 'Moving Up',
              description: 'Slowly scan up through your body',
              duration: 300,
              instruction: 'Gradually move your attention up through your legs, torso, arms, and head.',
            },
          ],
          instructions: ['Lie down comfortably', 'Close your eyes'],
          benefits: ['Deep relaxation', 'Better sleep'],
          tips: ['Use a blanket if cold'],
          tags: ['meditation', 'body scan', 'relaxation', 'sleep'],
          targetAudience: ['beginners'],
          therapeuticBenefits: ['stress relief', 'better sleep'],
          language: 'en',
          customizable: {
            duration: true,
            backgroundMusic: true,
            voiceGuidance: true,
            visualCues: true,
          },
          averageRating: 4.5,
          completionRate: 0.82,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        'loving-kindness-meditation': {
          id: 'loving-kindness-meditation',
          name: 'Loving-Kindness Meditation',
          description: 'A heart-opening practice that cultivates compassion and love for yourself and others.',
          category: 'meditation',
          difficulty: 'intermediate',
          defaultDuration: 20,
          minDuration: 15,
          maxDuration: 45,
          steps: [
            {
              id: 'step-1',
              title: 'Centering',
              description: 'Center yourself with breath',
              duration: 120,
              instruction: 'Sit comfortably and take a few deep breaths.',
            },
            {
              id: 'step-2',
              title: 'Self-Compassion',
              description: 'Send loving-kindness to yourself',
              duration: 300,
              instruction: 'Repeat silently: "May I be happy. May I be healthy."',
            },
            {
              id: 'step-3',
              title: 'Extending to Others',
              description: 'Extend loving-kindness to others',
              duration: 300,
              instruction: 'Think of someone you care about and send them loving-kindness.',
            },
          ],
          instructions: ['Sit comfortably', 'Place hand on heart'],
          benefits: ['Increases self-compassion', 'Improves relationships'],
          tips: ['Start with easier people'],
          tags: ['meditation', 'compassion', 'loving-kindness', 'heart'],
          targetAudience: ['intermediate practitioners'],
          therapeuticBenefits: ['emotional healing'],
          language: 'en',
          customizable: {
            duration: true,
            backgroundMusic: true,
            voiceGuidance: true,
            visualCues: true,
          },
          averageRating: 4.6,
          completionRate: 0.75,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const mockPractice = mockPractices[practiceId] || mockPractices['mindful-breathing-basic'];
      
      setPractice(mockPractice);
      setTimeRemaining(mockPractice.defaultDuration * 60);
    } catch (error) {
      console.error('Failed to load practice:', error);
    }
  };

  const startPractice = () => {
    if (!practice) return;
    
    setIsPlaying(true);
    setIsPaused(false);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          completePractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pausePractice = () => {
    setIsPlaying(false);
    setIsPaused(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resumePractice = () => {
    setIsPlaying(true);
    setIsPaused(false);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          completePractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completePractice = () => {
    setIsPlaying(false);
    setIsPaused(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // TODO: Save practice record
    console.log('Practice completed!');
  };

  const nextStep = () => {
    if (!practice) return;
    
    if (currentStepIndex < practice.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
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
    if (!practice) return 0;
    const totalTime = practice.defaultDuration * 60;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  if (!practice) {
    return (
      <div className="text-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Loading practice...
        </p>
      </div>
    );
  }

  const currentStep = practice.steps[currentStepIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {practice.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {practice.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>Progress</span>
          <span>{formatTime(timeRemaining)}</span>
        </div>
        <progress
          className="progress progress-primary w-full"
          value={getProgressPercentage()}
          max="100"
        ></progress>
      </div>

      {/* Current Step */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body text-center">
          <h2 className="card-title justify-center text-xl mb-4">
            {currentStep.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {currentStep.instruction}
          </p>
          
          {/* Step Navigation */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              className="btn btn-outline btn-sm"
              onClick={previousStep}
              disabled={currentStepIndex === 0}
            >
              <SkipBack className="w-4 h-4" />
              Previous
            </button>
            
            <span className="flex items-center text-sm text-gray-500">
              {currentStepIndex + 1} of {practice.steps.length}
            </span>
            
            <button
              className="btn btn-outline btn-sm"
              onClick={nextStep}
              disabled={currentStepIndex === practice.steps.length - 1}
            >
              Next
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Play/Pause Button */}
            {!isPlaying ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={startPractice}
              >
                <Play className="w-6 h-6" />
                Start Practice
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-lg"
                onClick={isPaused ? resumePractice : pausePractice}
              >
                {isPaused ? (
                  <>
                    <Play className="w-6 h-6" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-6 h-6" />
                    Pause
                  </>
                )}
              </button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="range range-primary range-sm w-20"
              />
            </div>

            {/* Settings */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">Practice Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Background Music</span>
                  </label>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
