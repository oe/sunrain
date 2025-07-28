// Practice system main exports
export { PracticeContentManager, practiceContentManager } from './PracticeContentManager';
export { PracticeSessionManager, practiceSessionManager } from './PracticeSessionManager';
export { PracticeDataManager, practiceDataManager } from './PracticeDataManager';
export { AudioManager, audioManager } from './AudioManager';

// Re-export types
export type {
  PracticeType,
  PracticeSession,
  PracticeRecord,
  PracticeStatistics,
  PracticeSettings,
  Achievement,
  PracticeRecommendation,
  AudioTrack,
  MediaPlaylist,
  PracticeContent,
  PracticeCategory,
  DifficultyLevel,
  PracticeStatus,
  MoodLevel
} from '../../types/practice';

/**
 * Main Practice System Interface
 * Provides a unified API for all practice-related functionality
 */
export class PracticeSystem {
  private static instance: PracticeSystem;

  private constructor() {}

  static getInstance(): PracticeSystem {
    if (!PracticeSystem.instance) {
      PracticeSystem.instance = new PracticeSystem();
    }
    return PracticeSystem.instance;
  }

  // Content Management
  get content() {
    return practiceContentManager;
  }

  // Session Management
  get session() {
    return practiceSessionManager;
  }

  // Data Management
  get data() {
    return practiceDataManager;
  }

  // Audio Management
  get audio() {
    return audioManager;
  }

  /**
   * Initialize the practice system
   */
  async initialize(): Promise<void> {
    try {
      // Preload essential content
      await this.content.getAllPractices();

      // Initialize audio system
      if (!this.audio.isAudioSupported()) {
        console.warn('Audio not supported in this browser');
      }

      console.log('Practice system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize practice system:', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    contentLoaded: boolean;
    audioSupported: boolean;
    activeSession: boolean;
    totalRecords: number;
  } {
    return {
      contentLoaded: true, // Content manager handles loading internally
      audioSupported: this.audio.isAudioSupported(),
      activeSession: !!this.session.getCurrentSession(),
      totalRecords: this.data.getAllRecords().length
    };
  }

  /**
   * Cleanup system resources
   */
  dispose(): void {
    this.session.dispose();
    this.audio.dispose();
  }
}

// Export singleton instance
export const practiceSystem = PracticeSystem.getInstance();
