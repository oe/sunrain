import type {
  PracticeType,
  PracticeSession,
  PracticeSettings,
  PracticeStatus,
  MoodLevel,
  PracticeRecord
} from '../../types/practice';
import { practiceContentManager } from './PracticeContentManager';
import { audioManager } from './AudioManager';
import { practiceDataManager } from './PracticeDataManager';

/**
 * Manages practice sessions including start, pause, resume, and completion
 * Handles session state, progress tracking, and user feedback collection
 */
export class PracticeSessionManager {
  private currentSession: PracticeSession | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;
  private stepTimer: NodeJS.Timeout | null = null;
  private sessionStartTime: number = 0;
  private totalPauseTime: number = 0;
  private lastPauseStart: number = 0;

  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Listen for audio events
    this.addEventListener('step_completed', this.handleStepCompleted.bind(this));
    this.addEventListener('session_paused', this.handleSessionPaused.bind(this));
    this.addEventListener('session_resumed', this.handleSessionResumed.bind(this));
  }

  /**
   * Start a new practice session
   */
  async startSession(
    practiceTypeId: string,
    settings: PracticeSettings = {},
    initialMood?: {
      mood?: MoodLevel;
      energy?: MoodLevel;
      stress?: MoodLevel;
    }
  ): Promise<PracticeSession> {
    // End current session if exists
    if (this.currentSession) {
      await this.endSession();
    }

    // Get practice type
    const practiceType = await practiceContentManager.getPracticeById(practiceTypeId);
    if (!practiceType) {
      throw new Error(`Practice type not found: ${practiceTypeId}`);
    }

    // Create new session
    const session: PracticeSession = {
      id: this.generateSessionId(),
      practiceTypeId,
      startTime: new Date(),
      duration: settings.duration || practiceType.defaultDuration,
      status: 'active',
      currentStepIndex: 0,
      completedSteps: [],
      pauseDuration: 0,
      settings: {
        backgroundMusic: { enabled: true, volume: 0.3, ...settings.backgroundMusic },
        voiceGuidance: { enabled: true, volume: 0.8, speed: 1.0, ...settings.voiceGuidance },
        visualCues: { enabled: true, type: 'standard', ...settings.visualCues },
        notifications: { reminders: true, encouragement: true, milestones: true, ...settings.notifications },
        accessibility: {
          highContrast: false,
          largeText: false,
          reducedMotion: false,
          screenReader: false,
          ...settings.accessibility
        }
      },
      moodBefore: initialMood?.mood,
      energyBefore: initialMood?.energy,
      stressBefore: initialMood?.stress,
      interactionEvents: [],
      completionPercentage: 0
    };

    this.currentSession = session;
    this.sessionStartTime = Date.now();

    // Update audio settings
    audioManager.updateSettings(session.settings);

    // Start background music if enabled
    if (session.settings.backgroundMusic?.enabled && practiceType.backgroundMusicUrl) {
      try {
        await audioManager.playBackgroundMusic({
          id: 'background',
          name: 'Background Music',
          url: practiceType.backgroundMusicUrl,
          duration: session.duration * 60,
          category: 'background',
          volume: session.settings.backgroundMusic.volume || 0.3,
          loop: true
        });
      } catch (error) {
        console.warn('Failed to start background music:', error);
      }
    }

    // Start the first step
    await this.startCurrentStep();

    // Emit session started event
    this.emitEvent('session_started', session);

    return session;
  }

  /**
   * Pause the current session
   */
  async pauseSession(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'active') {
      throw new Error('No active session to pause');
    }

    this.currentSession.status = 'paused';
    this.currentSession.pausedAt = new Date();
    this.lastPauseStart = Date.now();

    // Pause audio
    await audioManager.pause();

    // Clear timers
    this.clearTimers();

    // Record interaction
    this.recordInteraction('pause');

    // Emit event
    this.emitEvent('session_paused', this.currentSession);
  }

  /**
   * Resume the current session
   */
  async resumeSession(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'paused') {
      throw new Error('No paused session to resume');
    }

    // Update pause duration
    if (this.lastPauseStart > 0) {
      this.totalPauseTime += Date.now() - this.lastPauseStart;
      this.currentSession.pauseDuration = Math.floor(this.totalPauseTime / 1000);
    }

    this.currentSession.status = 'active';
    this.currentSession.pausedAt = undefined;

    // Resume audio
    await audioManager.resume();

    // Continue with current step
    await this.startCurrentStep();

    // Record interaction
    this.recordInteraction('resume');

    // Emit event
    this.emitEvent('session_resumed', this.currentSession);
  }

  /**
   * Skip to next step
   */
  async skipStep(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'active') {
      throw new Error('No active session');
    }

    // Record interaction
    this.recordInteraction('skip_step', { stepIndex: this.currentSession.currentStepIndex });

    // Move to next step
    await this.moveToNextStep();
  }

  /**
   * Repeat current step
   */
  async repeatStep(): Promise<void> {
    if (!this.currentSession || this.currentSession.status !== 'active') {
      throw new Error('No active session');
    }

    // Record interaction
    this.recordInteraction('repeat_step', { stepIndex: this.currentSession.currentStepIndex });

    // Restart current step
    await this.startCurrentStep();
  }

  /**
   * Complete the current session
   */
  async completeSession(feedback?: {
    moodAfter?: MoodLevel;
    energyAfter?: MoodLevel;
    stressAfter?: MoodLevel;
    rating?: number;
    feedback?: string;
    tags?: string[];
  }): Promise<PracticeRecord> {
    if (!this.currentSession) {
      throw new Error('No active session to complete');
    }

    // Update session with completion data
    this.currentSession.endTime = new Date();
    this.currentSession.status = 'completed';
    this.currentSession.completionPercentage = 100;

    if (feedback) {
      this.currentSession.moodAfter = feedback.moodAfter;
      this.currentSession.energyAfter = feedback.energyAfter;
      this.currentSession.stressAfter = feedback.stressAfter;
      this.currentSession.rating = feedback.rating;
      this.currentSession.feedback = feedback.feedback;
      this.currentSession.tags = feedback.tags;
    }

    // Calculate actual duration
    const actualDuration = (Date.now() - this.sessionStartTime - this.totalPauseTime) / (1000 * 60);
    this.currentSession.actualDuration = actualDuration;

    // Stop all audio
    audioManager.stopAll();

    // Clear timers
    this.clearTimers();

    // Create practice record
    const record = this.createPracticeRecord(this.currentSession);

    // Save to storage (will be implemented in task 3.3)
    await this.savePracticeRecord(record);

    // Emit completion event
    this.emitEvent('session_completed', { session: this.currentSession, record });

    // Clear current session
    const completedSession = this.currentSession;
    this.currentSession = null;

    return record;
  }

  /**
   * End session without completion (abandon)
   */
  async endSession(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.status = 'abandoned';
    this.currentSession.endTime = new Date();

    // Stop all audio
    audioManager.stopAll();

    // Clear timers
    this.clearTimers();

    // Emit event
    this.emitEvent('session_ended', this.currentSession);

    // Clear current session
    this.currentSession = null;
  }

  /**
   * Get current session
   */
  getCurrentSession(): PracticeSession | null {
    return this.currentSession;
  }

  /**
   * Get session progress
   */
  getSessionProgress(): {
    currentStep: number;
    totalSteps: number;
    completionPercentage: number;
    timeElapsed: number;
    timeRemaining: number;
  } | null {
    if (!this.currentSession) {
      return null;
    }

    const practiceType = practiceContentManager.getPracticeById(this.currentSession.practiceTypeId);
    const totalSteps = practiceType ? (practiceType as any).steps?.length || 1 : 1;
    const timeElapsed = (Date.now() - this.sessionStartTime - this.totalPauseTime) / (1000 * 60);
    const timeRemaining = Math.max(0, this.currentSession.duration - timeElapsed);

    return {
      currentStep: this.currentSession.currentStepIndex + 1,
      totalSteps,
      completionPercentage: this.currentSession.completionPercentage,
      timeElapsed,
      timeRemaining
    };
  }

  /**
   * Update session settings
   */
  async updateSessionSettings(settings: Partial<PracticeSettings>): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    // Update session settings
    this.currentSession.settings = { ...this.currentSession.settings, ...settings };

    // Update audio manager settings
    audioManager.updateSettings(this.currentSession.settings);

    // Record interaction
    this.recordInteraction('adjust_settings', settings);

    // Emit event
    this.emitEvent('settings_updated', this.currentSession.settings);
  }

  /**
   * Start the current step
   */
  private async startCurrentStep(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    const practiceType = await practiceContentManager.getPracticeById(this.currentSession.practiceTypeId);
    if (!practiceType || !practiceType.steps) {
      return;
    }

    const currentStep = practiceType.steps[this.currentSession.currentStepIndex];
    if (!currentStep) {
      // No more steps, complete session
      await this.completeSession();
      return;
    }

    // Play step audio if available and voice guidance is enabled
    if (currentStep.audioUrl && this.currentSession.settings.voiceGuidance?.enabled) {
      try {
        await audioManager.playVoiceGuidance({
          id: currentStep.id,
          name: currentStep.title,
          url: currentStep.audioUrl,
          duration: currentStep.duration,
          category: 'guidance',
          volume: this.currentSession.settings.voiceGuidance.volume || 0.8,
          loop: false,
          fadeIn: currentStep.transitions?.fadeIn,
          fadeOut: currentStep.transitions?.fadeOut
        });
      } catch (error) {
        console.warn('Failed to play step audio:', error);
      }
    }

    // Set timer for step completion
    if (currentStep.duration > 0) {
      this.stepTimer = setTimeout(() => {
        this.handleStepCompleted();
      }, currentStep.duration * 1000);
    }

    // Emit step started event
    this.emitEvent('step_started', { step: currentStep, session: this.currentSession });
  }

  /**
   * Move to next step
   */
  private async moveToNextStep(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    const practiceType = await practiceContentManager.getPracticeById(this.currentSession.practiceTypeId);
    if (!practiceType || !practiceType.steps) {
      return;
    }

    // Mark current step as completed
    const currentStep = practiceType.steps[this.currentSession.currentStepIndex];
    if (currentStep && !this.currentSession.completedSteps.includes(currentStep.id)) {
      this.currentSession.completedSteps.push(currentStep.id);
    }

    // Update completion percentage
    this.currentSession.completionPercentage = Math.round(
      (this.currentSession.completedSteps.length / practiceType.steps.length) * 100
    );

    // Move to next step
    this.currentSession.currentStepIndex++;

    // Clear current step timer
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }

    // Start next step or complete session
    if (this.currentSession.currentStepIndex >= practiceType.steps.length) {
      await this.completeSession();
    } else {
      await this.startCurrentStep();
    }
  }

  /**
   * Handle step completion
   */
  private async handleStepCompleted(): Promise<void> {
    await this.moveToNextStep();
  }

  /**
   * Handle session paused
   */
  private handleSessionPaused(): void {
    // Additional pause handling if needed
  }

  /**
   * Handle session resumed
   */
  private handleSessionResumed(): void {
    // Additional resume handling if needed
  }

  /**
   * Record user interaction
   */
  private recordInteraction(type: string, data?: any): void {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.interactionEvents.push({
      timestamp: new Date(),
      type: type as any,
      data
    });
  }

  /**
   * Create practice record from session
   */
  private createPracticeRecord(session: PracticeSession): PracticeRecord {
    const now = new Date();
    const timeOfDay = this.getTimeOfDay(now);

    return {
      id: this.generateRecordId(),
      sessionId: session.id,
      practiceTypeId: session.practiceTypeId,
      completedAt: now,
      duration: session.actualDuration || session.duration,
      completionPercentage: session.completionPercentage,
      moodImprovement: this.calculateMoodImprovement(session),
      energyChange: this.calculateEnergyChange(session),
      stressReduction: this.calculateStressReduction(session),
      rating: session.rating,
      feedback: session.feedback,
      timeOfDay,
      achievementsUnlocked: [] // Will be populated by achievement system
    };
  }

  /**
   * Calculate mood improvement
   */
  private calculateMoodImprovement(session: PracticeSession): number | undefined {
    if (session.moodBefore && session.moodAfter) {
      return session.moodAfter - session.moodBefore;
    }
    return undefined;
  }

  /**
   * Calculate energy change
   */
  private calculateEnergyChange(session: PracticeSession): number | undefined {
    if (session.energyBefore && session.energyAfter) {
      return session.energyAfter - session.energyBefore;
    }
    return undefined;
  }

  /**
   * Calculate stress reduction
   */
  private calculateStressReduction(session: PracticeSession): number | undefined {
    if (session.stressBefore && session.stressAfter) {
      return session.stressBefore - session.stressAfter; // Positive value means stress reduced
    }
    return undefined;
  }

  /**
   * Get time of day category
   */
  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Save practice record
   */
  private async savePracticeRecord(record: PracticeRecord): Promise<void> {
    await practiceDataManager.savePracticeRecord(record);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique record ID
   */
  private generateRecordId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Event system methods
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.endSession();
    this.clearTimers();
    this.eventListeners.clear();
  }
}

// Singleton instance
export const practiceSessionManager = new PracticeSessionManager();
