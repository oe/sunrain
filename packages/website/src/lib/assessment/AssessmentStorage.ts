import type { AssessmentSession, AssessmentResult } from '@/types/assessment';
import { createStorage } from '@/lib/storage/StructuredStorage';

/**
 * Simple assessment data storage
 * Replaces LocalStorageManager, DataManager, and CacheManager
 */
export class AssessmentStorage {
  private storage = createStorage('assessment_data');
  private readonly TYPES = {
    SESSION: 'assessment_session',
    RESULT: 'assessment_result'
  } as const;

  async saveSessions(sessions: AssessmentSession[]): Promise<boolean> {
    try {
      // Clear existing sessions first
      await this.storage.deleteByType(this.TYPES.SESSION);

      // Save new sessions
      for (const session of sessions) {
        await this.storage.save(this.TYPES.SESSION, session, `session_${session.id}`);
      }
      return true;
    } catch (error) {
      console.error('Failed to save sessions:', error);
      return false;
    }
  }

  async loadSessions(): Promise<AssessmentSession[]> {
    try {
      const sessions = await this.storage.getByType<AssessmentSession>(this.TYPES.SESSION);
      return sessions.map(session => ({
        ...session,
        startedAt: new Date(session.startedAt),
        lastActivityAt: new Date(session.lastActivityAt),
        answers: session.answers.map(answer => ({
          ...answer,
          answeredAt: new Date(answer.answeredAt)
        }))
      }));
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  async saveResult(result: AssessmentResult): Promise<boolean> {
    try {
      await this.storage.save(this.TYPES.RESULT, result, `result_${result.id}`);
      return true;
    } catch (error) {
      console.error('Failed to save result:', error);
      return false;
    }
  }

  async loadResults(): Promise<AssessmentResult[]> {
    try {
      const results = await this.storage.getByType<AssessmentResult>(this.TYPES.RESULT);
      return results.map(result => ({
        ...result,
        completedAt: new Date(result.completedAt),
        answers: result.answers.map(answer => ({
          ...answer,
          answeredAt: new Date(answer.answeredAt)
        }))
      }));
    } catch (error) {
      console.error('Failed to load results:', error);
      return [];
    }
  }

  async getResult(resultId: string): Promise<AssessmentResult | null> {
    try {
      const result = await this.storage.get<AssessmentResult>(`result_${resultId}`);
      if (!result) return null;

      return {
        ...result,
        completedAt: new Date(result.completedAt),
        answers: result.answers.map(answer => ({
          ...answer,
          answeredAt: new Date(answer.answeredAt)
        }))
      };
    } catch (error) {
      console.error('Failed to get result:', error);
      return null;
    }
  }

  async deleteResult(resultId: string): Promise<boolean> {
    try {
      return await this.storage.delete(`result_${resultId}`);
    } catch (error) {
      console.error('Failed to delete result:', error);
      return false;
    }
  }

  async clearSessions(): Promise<void> {
    try {
      await this.storage.deleteByType(this.TYPES.SESSION);
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  }

  async clearResults(): Promise<void> {
    try {
      await this.storage.deleteByType(this.TYPES.RESULT);
    } catch (error) {
      console.error('Failed to clear results:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.clearSessions();
      await this.clearResults();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  getStorageType(): string {
    return this.storage.getStorageType();
  }

  async getStorageStats(): Promise<{
    sessionCount: number;
    resultCount: number;
    storageType: string;
  }> {
    try {
      const sessions = await this.loadSessions();
      const results = await this.loadResults();

      return {
        sessionCount: sessions.length,
        resultCount: results.length,
        storageType: this.getStorageType()
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        sessionCount: 0,
        resultCount: 0,
        storageType: 'unknown'
      };
    }
  }
}

// Create singleton instance
export const assessmentStorage = new AssessmentStorage();
