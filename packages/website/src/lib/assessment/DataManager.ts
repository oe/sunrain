import type {
  AssessmentSession,
  AssessmentResult,
  AssessmentAnswer
} from '../../types/assessment';

/**
 * Assessment Data Manager
 * Handles encrypted local storage, privacy protection, and data export
 */
export class AssessmentDataManager {
  private encryptionKey: string | null = null;
  private readonly STORAGE_PREFIX = 'sunrain_assessment_';
  private readonly ENCRYPTION_KEY_STORAGE = 'sunrain_encryption_key';

  constructor() {
    this.initializeEncryption();
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Safe localStorage wrapper methods
   */
  private safeSetItem(key: string, value: string): boolean {
    if (!this.isStorageAvailable()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
      return false;
    }
  }

  private safeGetItem(key: string): string | null {
    if (!this.isStorageAvailable()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  }

  private safeRemoveItem(key: string): boolean {
    if (!this.isStorageAvailable()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
      return false;
    }
  }

  /**
   * Initialize encryption system
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // Check if encryption key exists
      let storedKey = this.safeGetItem(this.ENCRYPTION_KEY_STORAGE);

      if (!storedKey) {
        // Generate new encryption key
        storedKey = this.generateEncryptionKey();
        this.safeSetItem(this.ENCRYPTION_KEY_STORAGE, storedKey);
      }

      this.encryptionKey = storedKey;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      // Fallback to unencrypted storage
      this.encryptionKey = null;
    }
  }

  /**
   * Generate encryption key
   */
  private generateEncryptionKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt data using simple XOR cipher (for demo purposes)
   * In production, use proper encryption like AES
   */
  private encrypt(data: string): string {
    if (!this.encryptionKey) return data;

    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
      const dataChar = data.charCodeAt(i);
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    return btoa(encrypted); // Base64 encode
  }

  /**
   * Decrypt data
   */
  private decrypt(encryptedData: string): string {
    if (!this.encryptionKey) return encryptedData;

    try {
      const encrypted = atob(encryptedData); // Base64 decode
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        const encryptedChar = encrypted.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return encryptedData;
    }
  }

  /**
   * Store assessment session securely
   */
  storeSession(session: AssessmentSession): boolean {
    try {
      const sessionData = {
        ...session,
        startedAt: session.startedAt.toISOString(),
        lastActivityAt: session.lastActivityAt.toISOString(),
        answers: session.answers.map(answer => ({
          ...answer,
          answeredAt: answer.answeredAt.toISOString()
        }))
      };

      const jsonData = JSON.stringify(sessionData);
      const encryptedData = this.encrypt(jsonData);

      localStorage.setItem(`${this.STORAGE_PREFIX}session_${session.id}`, encryptedData);

      // Store session index for quick retrieval
      this.updateSessionIndex(session.id, 'add');

      return true;
    } catch (error) {
      console.error('Failed to store session:', error);
      return false;
    }
  }

  /**
   * Retrieve assessment session
   */
  retrieveSession(sessionId: string): AssessmentSession | null {
    try {
      const encryptedData = localStorage.getItem(`${this.STORAGE_PREFIX}session_${sessionId}`);
      if (!encryptedData) return null;

      const jsonData = this.decrypt(encryptedData);
      const sessionData = JSON.parse(jsonData);

      return {
        ...sessionData,
        startedAt: new Date(sessionData.startedAt),
        lastActivityAt: new Date(sessionData.lastActivityAt),
        answers: sessionData.answers.map((answer: any) => ({
          ...answer,
          answeredAt: new Date(answer.answeredAt)
        }))
      };
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Store assessment result securely
   */
  storeResult(result: AssessmentResult): boolean {
    try {
      const resultData = {
        ...result,
        completedAt: result.completedAt.toISOString(),
        answers: result.answers.map(answer => ({
          ...answer,
          answeredAt: answer.answeredAt.toISOString()
        }))
      };

      const jsonData = JSON.stringify(resultData);
      const encryptedData = this.encrypt(jsonData);

      localStorage.setItem(`${this.STORAGE_PREFIX}result_${result.id}`, encryptedData);

      // Store result index for quick retrieval
      this.updateResultIndex(result.id, 'add');

      return true;
    } catch (error) {
      console.error('Failed to store result:', error);
      return false;
    }
  }

  /**
   * Retrieve assessment result
   */
  retrieveResult(resultId: string): AssessmentResult | null {
    try {
      const encryptedData = localStorage.getItem(`${this.STORAGE_PREFIX}result_${resultId}`);
      if (!encryptedData) return null;

      const jsonData = this.decrypt(encryptedData);
      const resultData = JSON.parse(jsonData);

      return {
        ...resultData,
        completedAt: new Date(resultData.completedAt),
        answers: resultData.answers.map((answer: any) => ({
          ...answer,
          answeredAt: new Date(answer.answeredAt)
        }))
      };
    } catch (error) {
      console.error('Failed to retrieve result:', error);
      return null;
    }
  }

  /**
   * Get all session IDs
   */
  getAllSessionIds(): string[] {
    try {
      const indexData = localStorage.getItem(`${this.STORAGE_PREFIX}session_index`);
      if (!indexData) return [];

      const decryptedData = this.decrypt(indexData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to get session index:', error);
      return [];
    }
  }

  /**
   * Get all result IDs
   */
  getAllResultIds(): string[] {
    try {
      const indexData = localStorage.getItem(`${this.STORAGE_PREFIX}result_index`);
      if (!indexData) return [];

      const decryptedData = this.decrypt(indexData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to get result index:', error);
      return [];
    }
  }

  /**
   * Get all sessions
   */
  getAllSessions(): AssessmentSession[] {
    const sessionIds = this.getAllSessionIds();
    const sessions: AssessmentSession[] = [];

    for (const sessionId of sessionIds) {
      const session = this.retrieveSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Get all results
   */
  getAllResults(): AssessmentResult[] {
    const resultIds = this.getAllResultIds();
    const results: AssessmentResult[] = [];

    for (const resultId of resultIds) {
      const result = this.retrieveResult(resultId);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}session_${sessionId}`);
      this.updateSessionIndex(sessionId, 'remove');
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Delete result
   */
  deleteResult(resultId: string): boolean {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}result_${resultId}`);
      this.updateResultIndex(resultId, 'remove');
      return true;
    } catch (error) {
      console.error('Failed to delete result:', error);
      return false;
    }
  }

  /**
   * Update session index
   */
  private updateSessionIndex(sessionId: string, operation: 'add' | 'remove'): void {
    try {
      let sessionIds = this.getAllSessionIds();

      if (operation === 'add' && !sessionIds.includes(sessionId)) {
        sessionIds.push(sessionId);
      } else if (operation === 'remove') {
        sessionIds = sessionIds.filter(id => id !== sessionId);
      }

      const jsonData = JSON.stringify(sessionIds);
      const encryptedData = this.encrypt(jsonData);
      localStorage.setItem(`${this.STORAGE_PREFIX}session_index`, encryptedData);
    } catch (error) {
      console.error('Failed to update session index:', error);
    }
  }

  /**
   * Update result index
   */
  private updateResultIndex(resultId: string, operation: 'add' | 'remove'): void {
    try {
      let resultIds = this.getAllResultIds();

      if (operation === 'add' && !resultIds.includes(resultId)) {
        resultIds.push(resultId);
      } else if (operation === 'remove') {
        resultIds = resultIds.filter(id => id !== resultId);
      }

      const jsonData = JSON.stringify(resultIds);
      const encryptedData = this.encrypt(jsonData);
      localStorage.setItem(`${this.STORAGE_PREFIX}result_index`, encryptedData);
    } catch (error) {
      console.error('Failed to update result index:', error);
    }
  }

  /**
   * Export all assessment data
   */
  exportAllData(): {
    sessions: AssessmentSession[];
    results: AssessmentResult[];
    exportedAt: string;
    version: string;
  } {
    const sessions = this.getAllSessions();
    const results = this.getAllResults();

    return {
      sessions,
      results,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Export data as JSON string
   */
  exportDataAsJson(): string {
    const data = this.exportAllData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export data as downloadable file
   */
  exportDataAsFile(): void {
    try {
      const jsonData = this.exportDataAsJson();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `sunrain_assessment_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data as file:', error);
    }
  }

  /**
   * Import assessment data
   */
  importData(jsonData: string): { success: boolean; errors: string[]; imported: { sessions: number; results: number } } {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      let importedSessions = 0;
      let importedResults = 0;

      // Validate data structure
      if (!data.sessions || !data.results) {
        return {
          success: false,
          errors: ['Invalid data format: missing sessions or results'],
          imported: { sessions: 0, results: 0 }
        };
      }

      // Import sessions
      for (const sessionData of data.sessions) {
        try {
          const session: AssessmentSession = {
            ...sessionData,
            startedAt: new Date(sessionData.startedAt),
            lastActivityAt: new Date(sessionData.lastActivityAt),
            answers: sessionData.answers.map((answer: any) => ({
              ...answer,
              answeredAt: new Date(answer.answeredAt)
            }))
          };

          if (this.storeSession(session)) {
            importedSessions++;
          } else {
            errors.push(`Failed to import session: ${session.id}`);
          }
        } catch (error) {
          errors.push(`Invalid session data: ${error}`);
        }
      }

      // Import results
      for (const resultData of data.results) {
        try {
          const result: AssessmentResult = {
            ...resultData,
            completedAt: new Date(resultData.completedAt),
            answers: resultData.answers.map((answer: any) => ({
              ...answer,
              answeredAt: new Date(answer.answeredAt)
            }))
          };

          if (this.storeResult(result)) {
            importedResults++;
          } else {
            errors.push(`Failed to import result: ${result.id}`);
          }
        } catch (error) {
          errors.push(`Invalid result data: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        errors,
        imported: { sessions: importedSessions, results: importedResults }
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Invalid JSON format: ${error}`],
        imported: { sessions: 0, results: 0 }
      };
    }
  }

  /**
   * Clear all assessment data
   */
  clearAllData(): boolean {
    try {
      const sessionIds = this.getAllSessionIds();
      const resultIds = this.getAllResultIds();

      // Delete all sessions
      for (const sessionId of sessionIds) {
        localStorage.removeItem(`${this.STORAGE_PREFIX}session_${sessionId}`);
      }

      // Delete all results
      for (const resultId of resultIds) {
        localStorage.removeItem(`${this.STORAGE_PREFIX}result_${resultId}`);
      }

      // Clear indexes
      localStorage.removeItem(`${this.STORAGE_PREFIX}session_index`);
      localStorage.removeItem(`${this.STORAGE_PREFIX}result_index`);

      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): {
    totalSessions: number;
    totalResults: number;
    estimatedSize: number;
    lastActivity: Date | null;
  } {
    const sessionIds = this.getAllSessionIds();
    const resultIds = this.getAllResultIds();

    // Estimate storage size (rough calculation)
    let estimatedSize = 0;
    for (const key in localStorage) {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        estimatedSize += localStorage[key].length;
      }
    }

    // Find last activity
    let lastActivity: Date | null = null;
    const allResults = this.getAllResults();
    if (allResults.length > 0) {
      lastActivity = allResults.reduce((latest, result) =>
        result.completedAt > latest ? result.completedAt : latest,
        allResults[0].completedAt
      );
    }

    return {
      totalSessions: sessionIds.length,
      totalResults: resultIds.length,
      estimatedSize,
      lastActivity
    };
  }

  /**
   * Validate data integrity
   */
  validateDataIntegrity(): {
    valid: boolean;
    issues: string[];
    orphanedSessions: string[];
    orphanedResults: string[];
  } {
    const issues: string[] = [];
    const orphanedSessions: string[] = [];
    const orphanedResults: string[] = [];

    try {
      const sessionIds = this.getAllSessionIds();
      const resultIds = this.getAllResultIds();

      // Check for orphaned sessions (sessions without corresponding storage)
      for (const sessionId of sessionIds) {
        const session = this.retrieveSession(sessionId);
        if (!session) {
          orphanedSessions.push(sessionId);
          issues.push(`Orphaned session ID: ${sessionId}`);
        }
      }

      // Check for orphaned results
      for (const resultId of resultIds) {
        const result = this.retrieveResult(resultId);
        if (!result) {
          orphanedResults.push(resultId);
          issues.push(`Orphaned result ID: ${resultId}`);
        }
      }

      // Check for storage items without index entries
      for (const key in localStorage) {
        if (key.startsWith(`${this.STORAGE_PREFIX}session_`) && key !== `${this.STORAGE_PREFIX}session_index`) {
          const sessionId = key.replace(`${this.STORAGE_PREFIX}session_`, '');
          if (!sessionIds.includes(sessionId)) {
            issues.push(`Session storage without index entry: ${sessionId}`);
          }
        }

        if (key.startsWith(`${this.STORAGE_PREFIX}result_`) && key !== `${this.STORAGE_PREFIX}result_index`) {
          const resultId = key.replace(`${this.STORAGE_PREFIX}result_`, '');
          if (!resultIds.includes(resultId)) {
            issues.push(`Result storage without index entry: ${resultId}`);
          }
        }
      }

      return {
        valid: issues.length === 0,
        issues,
        orphanedSessions,
        orphanedResults
      };
    } catch (error) {
      return {
        valid: false,
        issues: [`Data integrity check failed: ${error}`],
        orphanedSessions,
        orphanedResults
      };
    }
  }

  /**
   * Repair data integrity issues
   */
  repairDataIntegrity(): { success: boolean; repaired: string[] } {
    const repaired: string[] = [];

    try {
      const validation = this.validateDataIntegrity();

      // Remove orphaned index entries
      if (validation.orphanedSessions.length > 0) {
        const sessionIds = this.getAllSessionIds().filter(id => !validation.orphanedSessions.includes(id));
        const jsonData = JSON.stringify(sessionIds);
        const encryptedData = this.encrypt(jsonData);
        localStorage.setItem(`${this.STORAGE_PREFIX}session_index`, encryptedData);
        repaired.push(`Removed ${validation.orphanedSessions.length} orphaned session index entries`);
      }

      if (validation.orphanedResults.length > 0) {
        const resultIds = this.getAllResultIds().filter(id => !validation.orphanedResults.includes(id));
        const jsonData = JSON.stringify(resultIds);
        const encryptedData = this.encrypt(jsonData);
        localStorage.setItem(`${this.STORAGE_PREFIX}result_index`, encryptedData);
        repaired.push(`Removed ${validation.orphanedResults.length} orphaned result index entries`);
      }

      return {
        success: true,
        repaired
      };
    } catch (error) {
      console.error('Failed to repair data integrity:', error);
      return {
        success: false,
        repaired
      };
    }
  }

  /**
   * Get privacy settings
   */
  getPrivacySettings(): {
    encryptionEnabled: boolean;
    dataRetentionDays: number;
    autoExportEnabled: boolean;
  } {
    try {
      const settingsData = localStorage.getItem(`${this.STORAGE_PREFIX}privacy_settings`);
      if (!settingsData) {
        return {
          encryptionEnabled: true,
          dataRetentionDays: 365,
          autoExportEnabled: false
        };
      }

      const decryptedData = this.decrypt(settingsData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to get privacy settings:', error);
      return {
        encryptionEnabled: true,
        dataRetentionDays: 365,
        autoExportEnabled: false
      };
    }
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings: {
    encryptionEnabled?: boolean;
    dataRetentionDays?: number;
    autoExportEnabled?: boolean;
  }): boolean {
    try {
      const currentSettings = this.getPrivacySettings();
      const updatedSettings = { ...currentSettings, ...settings };

      const jsonData = JSON.stringify(updatedSettings);
      const encryptedData = this.encrypt(jsonData);
      localStorage.setItem(`${this.STORAGE_PREFIX}privacy_settings`, encryptedData);

      return true;
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      return false;
    }
  }

  /**
   * Clean up old data based on retention policy
   */
  cleanupOldData(): { success: boolean; deletedSessions: number; deletedResults: number } {
    try {
      const settings = this.getPrivacySettings();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetentionDays);

      let deletedSessions = 0;
      let deletedResults = 0;

      // Clean up old sessions
      const sessions = this.getAllSessions();
      for (const session of sessions) {
        if (session.lastActivityAt < cutoffDate) {
          if (this.deleteSession(session.id)) {
            deletedSessions++;
          }
        }
      }

      // Clean up old results
      const results = this.getAllResults();
      for (const result of results) {
        if (result.completedAt < cutoffDate) {
          if (this.deleteResult(result.id)) {
            deletedResults++;
          }
        }
      }

      return {
        success: true,
        deletedSessions,
        deletedResults
      };
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      return {
        success: false,
        deletedSessions: 0,
        deletedResults: 0
      };
    }
  }
}

// Singleton instance
export const assessmentDataManager = new AssessmentDataManager();
