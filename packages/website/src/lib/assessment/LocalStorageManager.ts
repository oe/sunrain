import type { AssessmentSession, AssessmentResult } from "@/types/assessment";

// PouchDB imports with dynamic loading for better compatibility
let PouchDB: any = null;
let MemoryAdapter: any = null;

/**
 * 增强的本地存储管理器
 * 支持 PouchDB 结构化存储和内存存储回退，提供完整的数据管理功能
 */
export class LocalStorageManager {
  private readonly DB_NAME = "sunrain_assessments";

  private isClientSide: boolean = false;
  private db: any = null;
  private storageType: "pouchdb" | "memory" | "fallback" = "fallback";
  private isInitialized: boolean = false;
  private compatibilityWarning: string | null = null;

  constructor() {
    this.isClientSide = this.checkClientSideEnvironment();
    if (this.isClientSide) {
      this.initializeStorage();
    }
  }

  /**
   * 检查是否在客户端环境
   */
  private checkClientSideEnvironment(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  /**
   * 初始化存储系统
   */
  private async initializeStorage(): Promise<void> {
    if (!this.isClientSide || this.isInitialized) return;

    try {
      // 动态加载 PouchDB
      await this.loadPouchDB();

      // 检查浏览器兼容性
      const compatibility = this.checkBrowserCompatibility();

      if (compatibility.supportsIndexedDB && PouchDB) {
        // 使用 PouchDB with IndexedDB
        this.db = new PouchDB(this.DB_NAME);
        this.storageType = "pouchdb";
      } else if (MemoryAdapter && PouchDB) {
        // 使用内存适配器
        PouchDB.plugin(MemoryAdapter);
        this.db = new PouchDB(this.DB_NAME, { adapter: "memory" });
        this.storageType = "memory";
        this.compatibilityWarning =
          "您的浏览器不支持持久化存储，数据将在关闭浏览器后丢失。";
      } else {
        // 回退到简单的内存存储
        this.db = new Map();
        this.storageType = "fallback";
        this.compatibilityWarning =
          "存储功能受限，建议使用现代浏览器以获得更好的体验。";
      }

      this.isInitialized = true;

      if (this.compatibilityWarning) {
        this.showCompatibilityWarning();
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      // 最终回退方案
      this.db = new Map();
      this.storageType = "fallback";
      this.isInitialized = true;
    }
  }

  /**
   * 动态加载 PouchDB
   */
  private async loadPouchDB(): Promise<void> {
    try {
      const pouchModule = await import("pouchdb");
      PouchDB = pouchModule.default;

      const memoryModule = await import("pouchdb-adapter-memory");
      MemoryAdapter = memoryModule.default;
    } catch (error) {
      console.warn("Failed to load PouchDB:", error);
    }
  }

  /**
   * 检查浏览器兼容性
   */
  private checkBrowserCompatibility(): {
    supportsIndexedDB: boolean;
    supportsWebSQL: boolean;
    recommendedAdapter: string;
  } {
    const supportsIndexedDB =
      typeof window !== "undefined" &&
      "indexedDB" in window &&
      window.indexedDB !== null;

    const supportsWebSQL =
      typeof window !== "undefined" && "openDatabase" in window;

    return {
      supportsIndexedDB,
      supportsWebSQL,
      recommendedAdapter: supportsIndexedDB
        ? "idb"
        : supportsWebSQL
        ? "websql"
        : "memory",
    };
  }

  /**
   * 显示兼容性警告
   */
  private showCompatibilityWarning(): void {
    if (!this.compatibilityWarning) return;

    // 创建一个简单的通知
    if (typeof window !== "undefined" && window.console) {
      console.warn("存储兼容性警告:", this.compatibilityWarning);
    }
  }

  /**
   * 确保存储已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeStorage();
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * 保存文档到数据库
   */
  private async saveDocument(_collection: string, doc: any): Promise<string> {
    await this.ensureInitialized();

    const id = doc._id || this.generateId();
    const document = {
      ...doc,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (this.storageType === "pouchdb" || this.storageType === "memory") {
        // 使用 PouchDB
        const result = await this.db.put(document);
        return result.id;
      } else {
        // 回退到 Map 存储
        this.db.set(id, document);
        return id;
      }
    } catch (error) {
      console.error("Failed to save document:", error);
      throw error;
    }
  }

  /**
   * 查询文档
   */
  private async queryDocuments(selector: any = {}): Promise<any[]> {
    await this.ensureInitialized();

    try {
      if (this.storageType === "pouchdb" || this.storageType === "memory") {
        const result = await this.db.allDocs({ include_docs: true });
        return result.rows
          .map((row: any) => row.doc)
          .filter((doc: any) => {
            // 简单的过滤逻辑
            if (selector.type && doc.type !== selector.type) return false;
            if (
              selector.questionnaireId &&
              doc.questionnaireId !== selector.questionnaireId
            )
              return false;
            return true;
          });
      } else {
        // 回退到 Map 存储
        const docs = Array.from(this.db.values());
        return docs.filter((doc: any) => {
          if (selector.type && doc.type !== selector.type) return false;
          if (
            selector.questionnaireId &&
            doc.questionnaireId !== selector.questionnaireId
          )
            return false;
          return true;
        });
      }
    } catch (error) {
      console.error("Failed to query documents:", error);
      return [];
    }
  }

  /**
   * 保存会话数据
   */
  async saveSessions(sessions: AssessmentSession[]): Promise<boolean> {
    if (!this.isClientSide) {
      console.warn(
        "LocalStorageManager: Cannot save sessions in server-side environment"
      );
      return false;
    }

    try {
      await this.ensureInitialized();

      // 清理现有会话
      await this.clearSessions();

      // 保存新会话
      for (const session of sessions) {
        const sessionDoc = {
          _id: `session_${session.id}`,
          type: "session",
          ...session,
          startedAt: session.startedAt.toISOString(),
          lastActivityAt: session.lastActivityAt.toISOString(),
          answers: session.answers.map((answer) => ({
            ...answer,
            answeredAt: answer.answeredAt.toISOString(),
          })),
        };

        await this.saveDocument("sessions", sessionDoc);
      }

      return true;
    } catch (error) {
      console.error("Failed to save sessions:", error);
      return false;
    }
  }

  /**
   * 加载会话数据
   */
  loadSessions(): AssessmentSession[] {
    if (!this.isClientSide) {
      console.warn(
        "LocalStorageManager: Cannot load sessions in server-side environment"
      );
      return [];
    }

    try {
      // 由于这是同步方法，我们需要返回缓存的数据或空数组
      // 实际的异步加载会在后台进行
      return this.loadSessionsSync();
    } catch (error) {
      console.error("Failed to load sessions:", error);
      return [];
    }
  }

  /**
   * 同步加载会话（用于兼容现有接口）
   */
  private loadSessionsSync(): AssessmentSession[] {
    // 这里返回空数组，实际数据通过异步方法获取
    // 这是为了保持与现有接口的兼容性
    return [];
  }

  /**
   * 异步加载会话数据
   */
  async loadSessionsAsync(): Promise<AssessmentSession[]> {
    if (!this.isClientSide) {
      return [];
    }

    try {
      await this.ensureInitialized();
      const sessionDocs = await this.queryDocuments({ type: "session" });

      return sessionDocs.map((doc) => ({
        ...doc,
        startedAt: new Date(doc.startedAt),
        lastActivityAt: new Date(doc.lastActivityAt),
        answers: doc.answers.map((answer: any) => ({
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
   * 保存评测结果
   */
  async saveResult(result: AssessmentResult): Promise<boolean> {
    if (!this.isClientSide) {
      console.warn(
        "LocalStorageManager: Cannot save result in server-side environment"
      );
      return false;
    }

    try {
      await this.ensureInitialized();

      const resultDoc = {
        _id: `result_${result.id}`,
        type: "result",
        ...result,
        completedAt: result.completedAt.toISOString(),
      };

      await this.saveDocument("results", resultDoc);
      return true;
    } catch (error) {
      console.error("Failed to save result:", error);
      return false;
    }
  }

  /**
   * 加载评测结果
   */
  loadResults(): AssessmentResult[] {
    if (!this.isClientSide) {
      console.warn(
        "LocalStorageManager: Cannot load results in server-side environment"
      );
      return [];
    }

    try {
      // 同步方法返回空数组，保持兼容性
      return this.loadResultsSync();
    } catch (error) {
      console.error("Failed to load results:", error);
      return [];
    }
  }

  /**
   * 同步加载结果（用于兼容现有接口）
   */
  private loadResultsSync(): AssessmentResult[] {
    return [];
  }

  /**
   * 异步加载评测结果
   */
  async loadResultsAsync(): Promise<AssessmentResult[]> {
    if (!this.isClientSide) {
      return [];
    }

    try {
      await this.ensureInitialized();
      const resultDocs = await this.queryDocuments({ type: "result" });

      return resultDocs.map((doc) => ({
        ...doc,
        completedAt: new Date(doc.completedAt),
      }));
    } catch (error) {
      console.error("Failed to load results:", error);
      return [];
    }
  }



  /**
   * 清理会话数据
   */
  async clearSessions(): Promise<void> {
    if (!this.isClientSide) return;

    try {
      await this.ensureInitialized();
      const sessionDocs = await this.queryDocuments({ type: "session" });

      for (const doc of sessionDocs) {
        if (this.storageType === "pouchdb" || this.storageType === "memory") {
          await this.db.remove(doc);
        } else {
          this.db.delete(doc._id);
        }
      }
    } catch (error) {
      console.error("Failed to clear sessions:", error);
    }
  }

  /**
   * 清理结果数据
   */
  async clearResults(): Promise<void> {
    if (!this.isClientSide) return;

    try {
      await this.ensureInitialized();
      const resultDocs = await this.queryDocuments({ type: "result" });

      for (const doc of resultDocs) {
        if (this.storageType === "pouchdb" || this.storageType === "memory") {
          await this.db.remove(doc);
        } else {
          this.db.delete(doc._id);
        }
      }
    } catch (error) {
      console.error("Failed to clear results:", error);
    }
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<void> {
    if (!this.isClientSide) return;

    try {
      await this.clearSessions();
      await this.clearResults();

      // 如果使用 PouchDB，销毁数据库
      if (this.storageType === "pouchdb" || this.storageType === "memory") {
        await this.db.destroy();
        this.isInitialized = false;
        this.db = null;
      } else if (this.storageType === "fallback") {
        this.db.clear();
      }
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  }

  /**
   * 获取存储配额信息
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

        return {
          quota,
          usage,
          available,
          usagePercentage,
        };
      }
    } catch (error) {
      console.error("Failed to get storage quota:", error);
    }

    return {};
  }

  /**
   * 获取存储统计信息
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
      await this.ensureInitialized();
      const sessions = await this.loadSessionsAsync();
      const results = await this.loadResultsAsync();

      return {
        sessionCount: sessions.length,
        resultCount: results.length,
        storageType: this.storageType,
        isPersistent: this.storageType === "pouchdb",
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
   * 获取兼容性信息
   */
  getCompatibilityInfo(): {
    storageType: string;
    isPersistent: boolean;
    warning: string | null;
    features: string[];
  } {
    return {
      storageType: this.storageType,
      isPersistent: this.storageType === "pouchdb",
      warning: this.compatibilityWarning,
      features: [
        this.storageType === "pouchdb" ? "持久化存储" : "临时存储",
        this.storageType === "fallback" ? "基础功能" : "完整功能",
        "数据导入导出",
      ],
    };
  }


}

// 单例实例
let _localStorageManagerInstance: LocalStorageManager | null = null;

export const localStorageManager = {
  getInstance(): LocalStorageManager {
    if (!_localStorageManagerInstance) {
      _localStorageManagerInstance = new LocalStorageManager();
    }
    return _localStorageManagerInstance;
  },

  // 代理所有公共方法到单例实例
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






};
