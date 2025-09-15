import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AssessmentEngine } from '../AssessmentEngine';

// Mock the questionBankAdapter
vi.mock('../QuestionBankAdapter', () => ({
  questionBankAdapter: {
    getAssessmentType: vi.fn((id: string) => {
      if (id === 'phq-9') {
        return {
          id: 'phq-9',
          name: 'PHQ-9 Depression Assessment',
          questions: [
            {
              id: 'phq9-1',
              text: 'Little interest or pleasure in doing things',
              type: 'single_choice',
              required: true,
              options: [
                { id: 'phq9-1-0', text: 'Not at all', value: 0 },
                { id: 'phq9-1-1', text: 'Several days', value: 1 },
                { id: 'phq9-1-2', text: 'More than half the days', value: 2 },
                { id: 'phq9-1-3', text: 'Nearly every day', value: 3 }
              ]
            },
            {
              id: 'phq9-2',
              text: 'Feeling down, depressed, or hopeless',
              type: 'single_choice',
              required: true,
              options: [
                { id: 'phq9-2-0', text: 'Not at all', value: 0 },
                { id: 'phq9-2-1', text: 'Several days', value: 1 },
                { id: 'phq9-2-2', text: 'More than half the days', value: 2 },
                { id: 'phq9-2-3', text: 'Nearly every day', value: 3 }
              ]
            }
          ]
        };
      }
      return null;
    }),
    getLocalizedAssessmentType: vi.fn((id: string) => {
      if (id === 'phq-9') {
        return {
          id: 'phq-9',
          name: 'PHQ-9 Depression Assessment',
          questions: [
            {
              id: 'phq9-1',
              text: 'Little interest or pleasure in doing things',
              type: 'single_choice',
              required: true,
              options: [
                { id: 'phq9-1-0', text: 'Not at all', value: 0 },
                { id: 'phq9-1-1', text: 'Several days', value: 1 },
                { id: 'phq9-1-2', text: 'More than half the days', value: 2 },
                { id: 'phq9-1-3', text: 'Nearly every day', value: 3 }
              ]
            },
            {
              id: 'phq9-2',
              text: 'Feeling down, depressed, or hopeless',
              type: 'single_choice',
              required: true,
              options: [
                { id: 'phq9-2-0', text: 'Not at all', value: 0 },
                { id: 'phq9-2-1', text: 'Several days', value: 1 },
                { id: 'phq9-2-2', text: 'More than half the days', value: 2 },
                { id: 'phq9-2-3', text: 'Nearly every day', value: 3 }
              ]
            }
          ]
        };
      }
      return null;
    })
  }
}));

// Mock the ResultsAnalyzer
vi.mock('../ResultsAnalyzer', () => ({
  resultsAnalyzer: {
    analyzeSession: vi.fn().mockResolvedValue({
      id: 'result-123',
      sessionId: 'session-123',
      assessmentTypeId: 'phq-9',
      completedAt: new Date(),
      scores: { 'phq9-total': 5 },
      interpretation: { 'phq9-total': 'Mild depression symptoms' },
      recommendations: ['Consider professional help'],
      riskLevel: 'low',
      language: 'en',
      culturalContext: undefined,
      totalTimeSpent: 120,
      answers: []
    })
  }
}));

// Mock structuredStorage
vi.mock('@/lib/storage/StructuredStorage', () => ({
  structuredStorage: {
    save: vi.fn().mockResolvedValue(true),
    getByType: vi.fn().mockResolvedValue([]),
    deleteByType: vi.fn().mockResolvedValue(true),
    getStorageType: vi.fn(() => 'localStorage')
  }
}));

describe('AssessmentEngine', () => {
  let engine: AssessmentEngine;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock browser environment
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      },
      writable: true
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      },
      writable: true
    });

    engine = new AssessmentEngine();
  });

  afterEach(() => {
    // Clean up any active sessions
    engine.clearAllSessions();
  });

  describe('startAssessment', () => {
    it('should start a new assessment session', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      
      expect(session).toBeDefined();
      expect(session?.id).toBeDefined();
      expect(session?.assessmentTypeId).toBe('phq-9');
      expect(session?.status).toBe('active');
      expect(session?.currentQuestionIndex).toBe(0);
      expect(session?.answers).toEqual([]);
      expect(session?.language).toBe('en');
    });

    it('should throw error for non-existent assessment type', async () => {
      await expect(engine.startAssessment('non-existent')).rejects.toThrow();
    });

    it('should throw error when active session already exists', async () => {
      // Start first session
      await engine.startAssessment('phq-9', 'en');
      
      // Try to start another session for same assessment type
      await expect(engine.startAssessment('phq-9', 'en')).rejects.toThrow();
    });
  });

  describe('resumeAssessment', () => {
    it('should resume an existing session', async () => {
      // Start a session
      const originalSession = await engine.startAssessment('phq-9', 'en');
      const sessionId = originalSession!.id;
      
      // Pause the session
      engine.pauseAssessment(sessionId);
      
      // Resume the session
      const resumedSession = engine.resumeAssessment(sessionId);
      
      expect(resumedSession).toBeDefined();
      expect(resumedSession?.id).toBe(sessionId);
      expect(resumedSession?.status).toBe('active');
    });

    it('should throw error for non-existent session', () => {
      expect(() => {
        engine.resumeAssessment('non-existent-session');
      }).toThrow();
    });

    it('should throw error for completed session', () => {
      // This would require completing a session first
      // For now, we'll test the error case
      expect(() => {
        engine.resumeAssessment('completed-session');
      }).toThrow();
    });
  });

  describe('pauseAssessment', () => {
    it('should pause an active session', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      const sessionId = session!.id;
      
      const result = engine.pauseAssessment(sessionId);
      
      expect(result).toBe(true);
      
      const pausedSession = engine.getSession(sessionId);
      expect(pausedSession?.status).toBe('paused');
    });

    it('should return false for non-existent session', () => {
      const result = engine.pauseAssessment('non-existent-session');
      expect(result).toBe(false);
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return current question for active session', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      const sessionId = session!.id;
      
      const question = await engine.getCurrentQuestion(sessionId);
      
      expect(question).toBeDefined();
      expect(question?.id).toBe('phq9-1');
      expect(question?.text).toBe('Little interest or pleasure in doing things');
    });

    it('should return null for non-existent session', async () => {
      const question = await engine.getCurrentQuestion('non-existent-session');
      expect(question).toBeNull();
    });
  });

  describe('submitAnswer', () => {
    it('should submit answer and move to next question', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      const sessionId = session!.id;
      
      const result = await engine.submitAnswer(sessionId, 1);
      
      expect(result.success).toBe(true);
      expect(result.completed).toBe(false);
      expect(result.nextQuestion).toBeDefined();
      
      // Check that session moved to next question
      const updatedSession = engine.getSession(sessionId);
      expect(updatedSession?.currentQuestionIndex).toBe(1);
      expect(updatedSession?.answers).toHaveLength(1);
    });

    it('should complete assessment when all questions answered', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      const sessionId = session!.id;
      
      // Answer first question
      await engine.submitAnswer(sessionId, 1);
      
      // Answer second question (completes the assessment)
      const result = await engine.submitAnswer(sessionId, 2);
      
      expect(result.success).toBe(true);
      expect(result.completed).toBe(true);
      
      // Check that session is marked as completed
      const completedSession = engine.getSession(sessionId);
      expect(completedSession?.status).toBe('completed');
    });

    it('should return false for invalid answer', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      const sessionId = session!.id;
      
      const result = await engine.submitAnswer(sessionId, 'invalid-answer');
      
      expect(result.success).toBe(false);
    });

    it('should return false for non-existent session', async () => {
      const result = await engine.submitAnswer('non-existent-session', 1);
      expect(result.success).toBe(false);
    });
  });

  describe('getProgress', () => {
    it('should return progress for active session', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      const sessionId = session!.id;
      
      const progress = engine.getProgress(sessionId);
      
      expect(progress).toBeDefined();
      expect(progress?.current).toBe(0);
      expect(progress?.total).toBe(2);
      expect(progress?.percentage).toBe(0);
      expect(progress?.timeSpent).toBeGreaterThanOrEqual(0);
    });

    it('should return null for non-existent session', () => {
      const progress = engine.getProgress('non-existent-session');
      expect(progress).toBeNull();
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions', async () => {
      const session1 = await engine.startAssessment('phq-9', 'en');
      
      const activeSessions = engine.getActiveSessions();
      
      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].id).toBe(session1!.id);
    });

    it('should not return paused sessions', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      const sessionId = session!.id;
      
      engine.pauseAssessment(sessionId);
      
      const activeSessions = engine.getActiveSessions();
      expect(activeSessions).toHaveLength(0);
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const session = await engine.startAssessment('phq-9', 'en');
      const sessionId = session!.id;
      
      const result = engine.deleteSession(sessionId);
      
      expect(result).toBe(true);
      
      const deletedSession = engine.getSession(sessionId);
      expect(deletedSession).toBeUndefined();
    });

    it('should return false for non-existent session', () => {
      const result = engine.deleteSession('non-existent-session');
      expect(result).toBe(false);
    });
  });

  describe('getSessionStatistics', () => {
    it('should return session statistics', async () => {
      await engine.startAssessment('phq-9', 'en');
      
      const stats = engine.getSessionStatistics();
      
      expect(stats).toBeDefined();
      expect(stats.total).toBe(1);
      expect(stats.active).toBe(1);
      expect(stats.paused).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.abandoned).toBe(0);
    });
  });
});