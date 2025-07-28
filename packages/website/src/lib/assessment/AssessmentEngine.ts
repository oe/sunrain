import type {
  AssessmentSession,
  AssessmentAnswer,
  Question,
} from "../../types/assessment";
import { questionBankManager } from "./QuestionBankManager";

/**
 * Assessment Execution Engine
 * Manages assessment sessions, progress tracking, and answer collection
 */
export class AssessmentEngine {
  private sessions: Map<string, AssessmentSession> = new Map();
  private sessionTimers: Map<string, NodeJS.Timeout> = new Map();
  private reminderTimers: Map<string, NodeJS.Timeout> = new Map();
  private autoSaveInterval: number = 30000; // 30 seconds
  private sessionTimeout: number = 1800000; // 30 minutes

  private periodicSaveStarted = false;

  constructor() {
    this.loadSessionsFromStorage();
  }

  /**
   * Initialize periodic save (call this when first using the engine in browser)
   */
  private ensurePeriodicSaveStarted(): void {
    if (!this.periodicSaveStarted && typeof window !== "undefined") {
      this.startPeriodicSave();
      this.periodicSaveStarted = true;
    }
  }

  /**
   * Start a new assessment session
   */
  startAssessment(
    assessmentTypeId: string,
    language: string = "en",
    culturalContext?: string
  ): AssessmentSession | null {
    this.ensurePeriodicSaveStarted();

    const assessmentType =
      questionBankManager.getAssessmentType(assessmentTypeId);
    if (!assessmentType) {
      console.error(`Assessment type ${assessmentTypeId} not found`);
      return null;
    }

    const sessionId = this.generateSessionId();
    const session: AssessmentSession = {
      id: sessionId,
      assessmentTypeId,
      startedAt: new Date(),
      currentQuestionIndex: 0,
      answers: [],
      status: "active",
      language,
      culturalContext,
      timeSpent: 0,
      lastActivityAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    this.startSessionTimer(sessionId);
    this.saveSessionsToStorage();

    return session;
  }

  /**
   * Resume an existing assessment session
   */
  resumeAssessment(sessionId: string): AssessmentSession | null {
    this.ensurePeriodicSaveStarted();

    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return null;
    }

    if (session.status === "completed") {
      console.error(`Session ${sessionId} is already completed`);
      return null;
    }

    session.status = "active";
    session.lastActivityAt = new Date();
    this.startSessionTimer(sessionId);
    this.saveSessionsToStorage();

    return session;
  }

  /**
   * Pause an assessment session
   */
  pauseAssessment(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = "paused";
    session.lastActivityAt = new Date();
    this.stopSessionTimer(sessionId);
    this.saveSessionsToStorage();

    return true;
  }

  /**
   * Get current question for a session
   */
  getCurrentQuestion(sessionId: string): Question | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const assessmentType = questionBankManager.getLocalizedAssessmentType(
      session.assessmentTypeId,
      session.language
    );
    if (!assessmentType) return null;

    const culturallyAdapted =
      questionBankManager.getCulturallyAdaptedAssessmentType(
        session.assessmentTypeId,
        session.culturalContext
      );

    const questions = culturallyAdapted?.questions || assessmentType.questions;

    if (session.currentQuestionIndex >= questions.length) {
      return null;
    }

    return questions[session.currentQuestionIndex];
  }

  /**
   * Submit an answer for the current question
   */
  submitAnswer(
    sessionId: string,
    answer: any
  ): { success: boolean; nextQuestion?: Question; completed?: boolean } {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") {
      return { success: false };
    }

    const currentQuestion = this.getCurrentQuestion(sessionId);
    if (!currentQuestion) {
      return { success: false };
    }

    // Validate answer
    const validation = this.validateAnswer(currentQuestion, answer);
    if (!validation.valid) {
      return { success: false };
    }

    // Store the answer
    const assessmentAnswer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      value: answer,
      answeredAt: new Date(),
    };

    // Remove any existing answer for this question (in case of revision)
    session.answers = session.answers.filter(
      (a) => a.questionId !== currentQuestion.id
    );
    session.answers.push(assessmentAnswer);

    // Move to next question
    session.currentQuestionIndex++;
    session.lastActivityAt = new Date();

    const assessmentType = questionBankManager.getAssessmentType(
      session.assessmentTypeId
    );
    if (!assessmentType) {
      return { success: false };
    }

    // Check if assessment is completed
    if (session.currentQuestionIndex >= assessmentType.questions.length) {
      session.status = "completed";
      this.stopSessionTimer(sessionId);
      this.saveSessionsToStorage();
      return { success: true, completed: true };
    }

    // Get next question
    const nextQuestion = this.getCurrentQuestion(sessionId);
    this.saveSessionsToStorage();

    return {
      success: true,
      nextQuestion: nextQuestion || undefined,
      completed: false,
    };
  }

  /**
   * Go back to previous question
   */
  goToPreviousQuestion(sessionId: string): Question | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") return null;

    if (session.currentQuestionIndex > 0) {
      session.currentQuestionIndex--;
      session.lastActivityAt = new Date();
      this.saveSessionsToStorage();
    }

    return this.getCurrentQuestion(sessionId);
  }

  /**
   * Jump to a specific question (for review/editing)
   */
  goToQuestion(sessionId: string, questionIndex: number): Question | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const assessmentType = questionBankManager.getAssessmentType(
      session.assessmentTypeId
    );
    if (
      !assessmentType ||
      questionIndex < 0 ||
      questionIndex >= assessmentType.questions.length
    ) {
      return null;
    }

    session.currentQuestionIndex = questionIndex;
    session.lastActivityAt = new Date();
    this.saveSessionsToStorage();

    return this.getCurrentQuestion(sessionId);
  }

  /**
   * Get assessment progress
   */
  getProgress(sessionId: string): {
    current: number;
    total: number;
    percentage: number;
    timeSpent: number;
    estimatedTimeRemaining?: number;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const assessmentType = questionBankManager.getAssessmentType(
      session.assessmentTypeId
    );
    if (!assessmentType) return null;

    const current = session.currentQuestionIndex;
    const total = assessmentType.questions.length;
    const percentage = Math.round((current / total) * 100);

    // Calculate time spent
    const now = new Date();
    const timeSpent =
      session.timeSpent + (now.getTime() - session.lastActivityAt.getTime());

    // Estimate remaining time based on average time per question
    let estimatedTimeRemaining: number | undefined;
    if (current > 0) {
      const avgTimePerQuestion = timeSpent / current;
      const remainingQuestions = total - current;
      estimatedTimeRemaining = Math.round(
        (avgTimePerQuestion * remainingQuestions) / 1000
      ); // in seconds
    }

    return {
      current,
      total,
      percentage,
      timeSpent: Math.round(timeSpent / 1000), // in seconds
      estimatedTimeRemaining,
    };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): AssessmentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions for a user (in a real app, this would be filtered by user ID)
   */
  getAllSessions(): AssessmentSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): AssessmentSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.status === "active"
    );
  }

  /**
   * Get completed sessions
   */
  getCompletedSessions(): AssessmentSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.status === "completed"
    );
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.stopSessionTimer(sessionId);
      this.stopReminderTimer(sessionId);
      this.saveSessionsToStorage();
    }
    return deleted;
  }

  /**
   * Abandon a session
   */
  abandonSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = "abandoned";
    session.lastActivityAt = new Date();
    this.stopSessionTimer(sessionId);
    this.saveSessionsToStorage();

    return true;
  }

  /**
   * Set reminder for paused sessions
   */
  setReminder(sessionId: string, reminderTime: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "paused") return false;

    // Clear existing reminder
    this.stopReminderTimer(sessionId);

    // Set new reminder
    const timer = setTimeout(() => {
      this.sendReminder(sessionId);
    }, reminderTime);

    this.reminderTimers.set(sessionId, timer);
    return true;
  }

  /**
   * Validate answer format
   */
  private validateAnswer(
    question: Question,
    answer: any
  ): { valid: boolean; error?: string } {
    if (
      question.required &&
      (answer === null || answer === undefined || answer === "")
    ) {
      return { valid: false, error: "Answer is required" };
    }

    switch (question.type) {
      case "single_choice":
        if (
          question.options &&
          !question.options.some((opt) => opt.id === answer)
        ) {
          return { valid: false, error: "Invalid option selected" };
        }
        break;

      case "multiple_choice":
        if (!Array.isArray(answer)) {
          return {
            valid: false,
            error: "Multiple choice answer must be an array",
          };
        }
        if (question.options) {
          const validOptions = question.options.map((opt) => opt.id);
          const invalidAnswers = answer.filter(
            (a) => !validOptions.includes(a)
          );
          if (invalidAnswers.length > 0) {
            return { valid: false, error: "Invalid options selected" };
          }
        }
        break;

      case "scale":
        const numAnswer = Number(answer);
        if (isNaN(numAnswer)) {
          return { valid: false, error: "Scale answer must be a number" };
        }
        if (question.scaleMin !== undefined && numAnswer < question.scaleMin) {
          return {
            valid: false,
            error: `Answer must be at least ${question.scaleMin}`,
          };
        }
        if (question.scaleMax !== undefined && numAnswer > question.scaleMax) {
          return {
            valid: false,
            error: `Answer must be at most ${question.scaleMax}`,
          };
        }
        break;

      case "text":
        if (typeof answer !== "string") {
          return { valid: false, error: "Text answer must be a string" };
        }
        break;

      default:
        return { valid: false, error: "Unknown question type" };
    }

    return { valid: true };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  }

  /**
   * Start session timer for timeout management
   */
  private startSessionTimer(sessionId: string): void {
    this.stopSessionTimer(sessionId);

    const timer = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session && session.status === "active") {
        session.status = "paused";
        session.lastActivityAt = new Date();
        this.saveSessionsToStorage();
        console.log(`Session ${sessionId} timed out and was paused`);
      }
    }, this.sessionTimeout);

    this.sessionTimers.set(sessionId, timer);
  }

  /**
   * Stop session timer
   */
  private stopSessionTimer(sessionId: string): void {
    const timer = this.sessionTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.sessionTimers.delete(sessionId);
    }
  }

  /**
   * Stop reminder timer
   */
  private stopReminderTimer(sessionId: string): void {
    const timer = this.reminderTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.reminderTimers.delete(sessionId);
    }
  }

  /**
   * Send reminder (placeholder - in real app would send notification)
   */
  private sendReminder(sessionId: string): void {
    console.log(
      `Reminder: Please continue your assessment (Session: ${sessionId})`
    );
    // In a real application, this would trigger a notification
  }

  /**
   * Update session time spent
   */
  private updateSessionTime(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") return;

    const now = new Date();
    const timeDiff = now.getTime() - session.lastActivityAt.getTime();
    session.timeSpent += timeDiff;
    session.lastActivityAt = now;
  }

  /**
   * Start periodic auto-save
   */
  private startPeriodicSave(): void {
    // Only create the interval if we're in a browser environment
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }

    setInterval(() => {
      // Double-check browser environment in the interval callback
      if (typeof window === "undefined" || typeof localStorage === "undefined") {
        return;
      }

      // Update time spent for all active sessions
      for (const sessionId of this.sessions.keys()) {
        this.updateSessionTime(sessionId);
      }
      this.saveSessionsToStorage();
    }, this.autoSaveInterval);
  }

  /**
   * Save sessions to localStorage
   */
  private saveSessionsToStorage(): void {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }

    try {
      const sessionsData = Array.from(this.sessions.entries()).map(
        ([sessionId, session]) => ({
          ...session,
          id: sessionId,
          startedAt: session.startedAt.toISOString(),
          lastActivityAt: session.lastActivityAt.toISOString(),
          answers: session.answers.map((answer) => ({
            ...answer,
            answeredAt: answer.answeredAt.toISOString(),
          })),
        })
      );

      localStorage.setItem("assessment_sessions", JSON.stringify(sessionsData));
    } catch (error) {
      console.error("Failed to save sessions to storage:", error);
    }
  }

  /**
   * Load sessions from localStorage
   */
  private loadSessionsFromStorage(): void {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }

    try {
      const stored = localStorage.getItem("assessment_sessions");
      if (!stored) return;

      const sessionsData = JSON.parse(stored);
      for (const sessionData of sessionsData) {
        const session: AssessmentSession = {
          ...sessionData,
          startedAt: new Date(sessionData.startedAt),
          lastActivityAt: new Date(sessionData.lastActivityAt),
          answers: sessionData.answers.map((answer: any) => ({
            ...answer,
            answeredAt: new Date(answer.answeredAt),
          })),
        };

        this.sessions.set(session.id, session);

        // Resume timers for active sessions
        if (session.status === "active") {
          this.startSessionTimer(session.id);
        }
      }
    } catch (error) {
      console.error("Failed to load sessions from storage:", error);
    }
  }

  /**
   * Clear all session data (for testing or reset)
   */
  clearAllSessions(): void {
    // Stop all timers
    for (const sessionId of this.sessions.keys()) {
      this.stopSessionTimer(sessionId);
      this.stopReminderTimer(sessionId);
    }

    this.sessions.clear();
    this.sessionTimers.clear();
    this.reminderTimers.clear();

    // Check if we're in a browser environment
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem("assessment_sessions");
      } catch (error) {
        console.error("Failed to clear sessions from storage:", error);
      }
    }
  }

  /**
   * Get session statistics
   */
  getSessionStatistics(): {
    total: number;
    active: number;
    paused: number;
    completed: number;
    abandoned: number;
    averageCompletionTime: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const completed = sessions.filter((s) => s.status === "completed");

    const averageCompletionTime =
      completed.length > 0
        ? completed.reduce((sum, s) => sum + s.timeSpent, 0) /
          completed.length /
          1000 // in seconds
        : 0;

    return {
      total: sessions.length,
      active: sessions.filter((s) => s.status === "active").length,
      paused: sessions.filter((s) => s.status === "paused").length,
      completed: completed.length,
      abandoned: sessions.filter((s) => s.status === "abandoned").length,
      averageCompletionTime: Math.round(averageCompletionTime),
    };
  }
}

// Lazy singleton instance - only create when actually needed in browser
let _assessmentEngineInstance: AssessmentEngine | null = null;

export const assessmentEngine = {
  getInstance(): AssessmentEngine {
    if (!_assessmentEngineInstance) {
      _assessmentEngineInstance = new AssessmentEngine();
    }
    return _assessmentEngineInstance;
  },

  // Proxy all public methods to the singleton instance
  startAssessment(assessmentTypeId: string, language: string = 'en', culturalContext?: string) {
    return this.getInstance().startAssessment(assessmentTypeId, language, culturalContext);
  },

  resumeAssessment(sessionId: string) {
    return this.getInstance().resumeAssessment(sessionId);
  },

  pauseAssessment(sessionId: string) {
    return this.getInstance().pauseAssessment(sessionId);
  },

  getCurrentQuestion(sessionId: string) {
    return this.getInstance().getCurrentQuestion(sessionId);
  },

  submitAnswer(sessionId: string, answer: any) {
    return this.getInstance().submitAnswer(sessionId, answer);
  },

  goToPreviousQuestion(sessionId: string) {
    return this.getInstance().goToPreviousQuestion(sessionId);
  },

  goToQuestion(sessionId: string, questionIndex: number) {
    return this.getInstance().goToQuestion(sessionId, questionIndex);
  },

  getProgress(sessionId: string) {
    return this.getInstance().getProgress(sessionId);
  },

  getSession(sessionId: string) {
    return this.getInstance().getSession(sessionId);
  },

  getAllSessions() {
    return this.getInstance().getAllSessions();
  },

  getActiveSessions() {
    return this.getInstance().getActiveSessions();
  },

  getCompletedSessions() {
    return this.getInstance().getCompletedSessions();
  },

  deleteSession(sessionId: string) {
    return this.getInstance().deleteSession(sessionId);
  },

  abandonSession(sessionId: string) {
    return this.getInstance().abandonSession(sessionId);
  },

  setReminder(sessionId: string, reminderTime: number) {
    return this.getInstance().setReminder(sessionId, reminderTime);
  },

  clearAllSessions() {
    return this.getInstance().clearAllSessions();
  },

  getSessionStatistics() {
    return this.getInstance().getSessionStatistics();
  }
};
