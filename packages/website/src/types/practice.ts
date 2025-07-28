// Practice system type definitions

export type PracticeCategory = 'mindfulness' | 'breathing' | 'meditation' | 'relaxation' | 'movement' | 'visualization';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type PracticeStatus = 'not_started' | 'active' | 'paused' | 'completed' | 'abandoned';
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface PracticeStep {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  instruction: string;
  audioUrl?: string;
  visualCue?: {
    type: 'breathing_circle' | 'progress_bar' | 'timer' | 'image';
    config: any;
  };
  transitions?: {
    fadeIn?: number;
    fadeOut?: number;
    pause?: number;
  };
}

export interface PracticeType {
  id: string;
  name: string;
  description: string;
  category: PracticeCategory;
  difficulty: DifficultyLevel;

  // Duration and structure
  defaultDuration: number; // in minutes
  minDuration: number;
  maxDuration: number;
  steps: PracticeStep[];

  // Media and guidance
  introAudioUrl?: string;
  outroAudioUrl?: string;
  backgroundMusicUrl?: string;
  thumbnailUrl?: string;

  // Content
  instructions: string[];
  benefits: string[];
  prerequisites?: string[];
  tips: string[];

  // Metadata
  tags: string[];
  targetAudience: string[];
  therapeuticBenefits: string[];
  contraindications?: string[];

  // Localization
  language: string;
  translations?: Record<string, {
    name: string;
    description: string;
    instructions: string[];
    benefits: string[];
    tips: string[];
    steps: {
      title: string;
      description: string;
      instruction: string;
    }[];
  }>;

  // Settings
  customizable: {
    duration: boolean;
    backgroundMusic: boolean;
    voiceGuidance: boolean;
    visualCues: boolean;
  };

  // Statistics
  averageRating?: number;
  completionRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeSettings {
  duration?: number; // custom duration in minutes
  backgroundMusic?: {
    enabled: boolean;
    url?: string;
    volume: number;
  };
  voiceGuidance?: {
    enabled: boolean;
    volume: number;
    speed: number; // 0.5 to 2.0
  };
  visualCues?: {
    enabled: boolean;
    type: 'minimal' | 'standard' | 'enhanced';
  };
  notifications?: {
    reminders: boolean;
    encouragement: boolean;
    milestones: boolean;
  };
  accessibility?: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
}

export interface PracticeSession {
  id: string;
  practiceTypeId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // planned duration in minutes
  actualDuration?: number; // actual time spent in minutes
  status: PracticeStatus;

  // Progress tracking
  currentStepIndex: number;
  completedSteps: string[];
  pausedAt?: Date;
  pauseDuration: number; // total pause time in seconds

  // Settings used
  settings: PracticeSettings;

  // User state
  moodBefore?: MoodLevel;
  moodAfter?: MoodLevel;
  energyBefore?: MoodLevel;
  energyAfter?: MoodLevel;
  stressBefore?: MoodLevel;
  stressAfter?: MoodLevel;

  // Session data
  heartRateData?: number[]; // if available from device
  interactionEvents: {
    timestamp: Date;
    type: 'pause' | 'resume' | 'skip_step' | 'repeat_step' | 'adjust_volume';
    data?: any;
  }[];

  // Completion data
  completionPercentage: number;
  rating?: number; // 1-5 stars
  feedback?: string;
  tags?: string[]; // user-added tags
}

export interface PracticeRecord {
  id: string;
  sessionId: string;
  practiceTypeId: string;
  completedAt: Date;
  duration: number; // actual duration in minutes
  completionPercentage: number;

  // Effectiveness metrics
  moodImprovement?: number; // -4 to +4
  energyChange?: number;
  stressReduction?: number;

  // User feedback
  rating?: number;
  feedback?: string;
  wouldRecommend?: boolean;

  // Context
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  location?: 'home' | 'work' | 'outdoor' | 'other';
  circumstances?: string[];

  // Achievements unlocked
  achievementsUnlocked: string[];
}

export interface PracticeStatistics {
  totalSessions: number;
  totalMinutes: number;
  averageSessionDuration: number;
  completionRate: number;
  averageRating: number;

  // Streaks and consistency
  currentStreak: number;
  longestStreak: number;
  practiceFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };

  // Category breakdown
  categoryStats: Record<PracticeCategory, {
    sessions: number;
    minutes: number;
    averageRating: number;
    favoriteType?: string;
  }>;

  // Effectiveness
  averageMoodImprovement: number;
  averageStressReduction: number;
  averageEnergyChange: number;

  // Time patterns
  preferredTimeOfDay: string;
  mostProductiveDays: string[];

  // Progress over time
  monthlyProgress: {
    month: string;
    sessions: number;
    minutes: number;
    averageRating: number;
    moodImprovement: number;
  }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'duration' | 'variety' | 'improvement' | 'milestone';

  // Unlock criteria
  criteria: {
    type: 'sessions_count' | 'total_minutes' | 'streak_days' | 'category_variety' | 'rating_average' | 'mood_improvement';
    threshold: number;
    timeframe?: 'all_time' | 'monthly' | 'weekly';
  };

  // Reward
  points: number;
  badge?: string;
  unlockMessage: string;

  // Metadata
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number; // 0-100 percentage towards unlocking
}

export interface PracticeRecommendation {
  practiceTypeId: string;
  reason: string;
  relevanceScore: number;
  basedOn: 'mood' | 'time_of_day' | 'history' | 'assessment_result' | 'streak_maintenance';
  customizations?: Partial<PracticeSettings>;
}

// Audio and media interfaces
export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  category: 'guidance' | 'background' | 'nature' | 'ambient';
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
  loop: boolean;
}

export interface MediaPlaylist {
  id: string;
  name: string;
  tracks: AudioTrack[];
  crossfade: boolean;
  shuffle: boolean;
}

// Practice content management
export interface PracticeContent {
  practices: PracticeType[];
  audioTracks: AudioTrack[];
  playlists: MediaPlaylist[];
  achievements: Achievement[];
  lastUpdated: Date;
  version: string;
}
