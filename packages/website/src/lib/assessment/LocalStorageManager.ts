import type { AssessmentSession, AssessmentResult } from "@/types/assessment";

/**
 * Simple structured data storage using IndexedDB with memory fallback
 * Replaces the failed PouchDB integration with a minimal, focused solution
 */
export class StructuredStorage {
  private readonly DB_NAME = "sunrain_assessments";
  private readonly DB_VERSION = 1;

  private isClientSide: boolean = false;
  private db: IDBDatabase | null = null;
  private memoryStorage: Map<string, any> = new Map();
  private storageType: "indexeddb" | "memory" = "memory";
  private isInitialized: boolean = false;

  constructor() {
    this.isClientSide = typeof window !== "undefined";
    if (this.isClientSide) {
      this.initializeStorage();
    }
  }

  /**
   * Initialize storage system - IndexedDB with memory fallback
   */
  private async initializeStorage(): Promise<void> {
    if (!this.isClientSide || this.isInitialized) return;

    try {
      if (this.supportsIndexedDB()) {
        await this.initializeIndexedDB();
        this.storageType = "indexeddb";
      } else {
        this.storageType = "memory";
        console.warn(
          "IndexedDB not supported, using memory storage. Data will be lost on page refresh."
        );
      }
      this.isInitialized = true;
    } catch (error) {
      console.error(
        "Failed to initialize IndexedDB, falling back to memory storage:",
        error
      );
      this.storageType = "memory";
      this.isInitialized = true;
    }
  }

  /**
   * Check if IndexedDB is supported
   */
  private supportsIndexedDB(): boolean {
    return (
      typeof window !== "undefined" &&
      "indexedDB" in window &&
      window.indexedDB !== null
    );
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("results")) {
          db.createObjectStore("results", { keyPath: "id" });
        }
      };
    });
  }

  /**
   * Ensure storage is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeStorage();
    }
  }

  /**
   * Save data to IndexedDB or memory storage
   */
  private async saveToStore(storeName: string, data: any): Promise<void> {
    await this.ensureInitialized();

    if (this.storageType === "indexeddb" && this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // Memory storage fallback
      const key = `${storeName}_${data.id}`;
      this.memoryStorage.set(key, data);
    }
  }

  /**
   * Load data from IndexedDB or memory storage
   */
  private async loadFromStore(storeName: string): Promise<any[]> {
    await this.ensureInitialized();

    if (this.storageType === "indexeddb" && this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } else {
      // Memory storage fallback
      const results: any[] = [];
      for (const [key, value] of this.memoryStorage.entries()) {
        if (key.startsWith(`${storeName}_`)) {
          results.push(value);
        }
      }
      return results;
    }
  }

  /**
   * Clear data from IndexedDB or memory storage
   */
  private async clearStore(storeName: string): Promise<void> {
    await this.ensureInitialized();

    if (this.storageType === "indexeddb" && this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // Memory storage fallback
      const keysToDelete: string[] = [];
      for (const key of this.memoryStorage.keys()) {
        if (key.startsWith(`${storeName}_`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => this.memoryStorage.delete(key));
    }
  }

  /**
   * Save assessment sessions
   */
  async saveSessions(sessions: AssessmentSession[]): Promise<boolean> {
    if (!this.isClientSide) {
      console.warn(
        "StructuredStorage: Cannot save sessions in server-side environment"
      );
      return false;
    }

    try {
      // Clear existing sessions first
      await this.clearSessions();

      // Save new sessions
      for (const session of sessions) {
        await this.saveToStore("sessions", {
          ...session,
          startedAt: session.startedAt.toISOString(),
          lastActivityAt: session.lastActivityAt.toISOString(),
          answers: session.answers.map((answer) => ({
            ...answer,
            answeredAt: answer.answeredAt.toISOString(),
          })),
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to save sessions:", error);
      return false;
    }
  }

  /**
   * Load assessment sessions (synchronous for compatibility)
   */
  loadSessions(): AssessmentSession[] {
    if (!this.isClientSide) {
      return [];
    }
    // Return empty array for sync compatibility - use loadSessionsAsync for actual data
    return [];
  }

  /**
   * Load assessment sessions (asynchronous)
   */
  async loadSessionsAsync(): Promise<AssessmentSession[]> {
    if (!this.isClientSide) {
      return [];
    }

    try {
      const sessionData = await this.loadFromStore("sessions");

      return sessionData.map((data) => ({
        ...data,
        startedAt: new Date(data.startedAt),
        lastActivityAt: new Date(data.lastActivityAt),
        answers: data.answers.map((answer: any) => ({
          ...answer,
          answeredAt: new Date(answer.answeredAt),
        })),
      }));
    } catch (error) {
      console.error("Failed to load sessions:", error);
      return [];
    }
  }

  /**
   * Save assessment result
   */
  async saveResult(result: AssessmentResult): Promise<boolean> {
    if (!this.isClientSide) {
      console.warn(
        "StructuredStorage: Cannot save result in server-side environment"
      );
      return false;
    }

    try {
      await this.saveToStore("results", {
        ...result,
        completedAt: result.completedAt.toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Failed to save result:", error);
      return false;
    }
  }

  /**
   * Load assessment results (synchronous for compatibility)
   */
  loadResults(): AssessmentResult[] {
    if (!this.isClientSide) {
      return [];
    }
    // Return empty array for sync compatibility - use loadResultsAsync for actual data
    return [];
  }

  /**
   * Load assessment results (asynchronous)
   */
  async loadResultsAsync(): Promise<AssessmentResult[]> {
    if (!this.isClientSide) {
      return [];
    }

    try {
      const resultData = await this.loadFromStore("results");

      return resultData.map((data) => ({
        ...data,
        completedAt: new Date(data.completedAt),
      }));
    } catch (error) {
      console.error("Failed to load results:", error);
      return [];
    }
  }

  /**
   * Clear all sessions
   */
  async clearSessions(): Promise<void> {
    if (!this.isClientSide) return;

    try {
      await this.clearStore("sessions");
    } catch (error) {
      console.error("Failed to clear sessions:", error);
    }
  }

  /**
   * Clear all results
   */
  async clearResults(): Promise<void> {
    if (!this.isClientSide) return;

    try {
      await this.clearStore("results");
    } catch (error) {
      console.error("Failed to clear results:", error);
    }
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    if (!this.isClientSide) return;

    try {
      await this.clearSessions();
      await this.clearResults();

      if (this.storageType === "indexeddb" && this.db) {
        this.db.close();
        this.db = null;
        this.isInitialized = false;
      } else {
        this.memoryStorage.clear();
      }
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota(): Promise<{
    quota?: number;
    usage?: number;
    available?: number;
    usagePercentage?: number;
  }> {
    if (!this.isClientSide) {
      return {};
    }

    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
        const available = quota - usage;
        const usagePercentage =
          quota > 0 ? Math.round((usage / quota) * 100) : 0;

        return { quota, usage, available, usagePercentage };
      }
    } catch (error) {
      console.error("Failed to get storage quota:", error);
    }

    return {};
  }

  /**
   * Get storage statistics
   */
  async getStorageStatistics(): Promise<{
    sessionCount: number;
    resultCount: number;
    storageType: string;
    isPersistent: boolean;
    lastUpdated: Date | null;
  }> {
    if (!this.isClientSide) {
      return {
        sessionCount: 0,
        resultCount: 0,
        storageType: "none",
        isPersistent: false,
        lastUpdated: null,
      };
    }

    try {
      const sessions = await this.loadSessionsAsync();
      const results = await this.loadResultsAsync();

      return {
        sessionCount: sessions.length,
        resultCount: results.length,
        storageType: this.storageType,
        isPersistent: this.storageType === "indexeddb",
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Failed to get storage statistics:", error);
      return {
        sessionCount: 0,
        resultCount: 0,
        storageType: this.storageType,
        isPersistent: false,
        lastUpdated: null,
      };
    }
  }

  /**
   * Get compatibility information
   */
  getCompatibilityInfo(): {
    storageType: string;
    isPersistent: boolean;
    features: string[];
  } {
    return {
      storageType: this.storageType,
      isPersistent: this.storageType === "indexeddb",
      features: [
        this.storageType === "indexeddb"
          ? "Persistent Storage"
          : "Memory Storage",
        "Assessment Data Management",
        "Session Management",
      ],
    };
  }
}

// Singleton instance
let _structuredStorageInstance: StructuredStorage | null = null;

export const localStorageManager = {
  getInstance(): StructuredStorage {
    if (!_structuredStorageInstance) {
      _structuredStorageInstance = new StructuredStorage();
    }
    return _structuredStorageInstance;
  },

  // Proxy all public methods to singleton instance
  async saveSessions(sessions: AssessmentSession[]) {
    return this.getInstance().saveSessions(sessions);
  },

  loadSessions() {
    return this.getInstance().loadSessions();
  },

  async loadSessionsAsync() {
    return this.getInstance().loadSessionsAsync();
  },

  async saveResult(result: AssessmentResult) {
    return this.getInstance().saveResult(result);
  },

  loadResults() {
    return this.getInstance().loadResults();
  },

  async loadResultsAsync() {
    return this.getInstance().loadResultsAsync();
  },

  async clearSessions() {
    return this.getInstance().clearSessions();
  },

  async clearResults() {
    return this.getInstance().clearResults();
  },

  async clearAllData() {
    return this.getInstance().clearAllData();
  },

  async getStorageQuota() {
    return this.getInstance().getStorageQuota();
  },

  async getStorageStatistics() {
    return this.getInstance().getStorageStatistics();
  },

  getCompatibilityInfo() {
    return this.getInstance().getCompatibilityInfo();
  },
};
