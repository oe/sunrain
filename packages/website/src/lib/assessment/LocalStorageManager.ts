import type { AssessmentSession, AssessmentResult } from '@/types/assessment';

/**
 * 本地存储管理器
 * 负责处理评测会话和结果的本地存储，包括数据加密、完整性验证和存储配额管理
 */
export class LocalStorageManager {
  private readonly SESSIONS_KEY = 'assessment_sessions';
  private readonly RESULTS_KEY = 'assessment_results';
  private readonly METADATA_KEY = 'assessment_metadata';
  private readonly ENCRYPTION_KEY = 'assessment_encryption_key';

  private isClientSide: boolean = false;
  private encryptionKey: string | null = null;

  constructor() {
    this.isClientSide = this.checkClientSideEnvironment();
    if (this.isClientSide) {
      this.initializeEncryption();
    }
  }

  /**
   * 检查是否在客户端环境
   */
  private checkClientSideEnvironment(): boolean {
    return typeof window !== 'undefined' &&
           typeof localStorage !== 'undefined';
  }

  /**
   * 初始化加密密钥
   */
  private initializeEncryption(): void {
    if (!this.isClientSide) return;

    try {
      let key = localStorage.getItem(this.ENCRYPTION_KEY);
      if (!key) {
        // 生成新的加密密钥
        key = this.generateEncryptionKey();
        localStorage.setItem(this.ENCRYPTION_KEY, key);
      }
      this.encryptionKey = key;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      // 如果无法使用localStorage，则使用内存中的临时密钥
      this.encryptionKey = this.generateEncryptionKey();
    }
  }

  /**
   * 生成加密密钥
   */
  private generateEncryptionKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 简单的数据加密（基于XOR）
   */
  private encrypt(data: string): string {
    if (!this.encryptionKey) return data;

    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
      const dataChar = data.charCodeAt(i);
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    return btoa(encrypted); // Base64编码
  }

  /**
   * 简单的数据解密
   */
  private decrypt(encryptedData: string): string {
    if (!this.encryptionKey) return encryptedData;

    try {
      const data = atob(encryptedData); // Base64解码
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        const dataChar = data.charCodeAt(i);
        decrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return encryptedData;
    }
  }

  /**
   * 计算数据完整性校验和
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }

  /**
   * 验证数据完整性
   */
  private verifyIntegrity(data: string, expectedChecksum: string): boolean {
    const actualChecksum = this.calculateChecksum(data);
    return actualChecksum === expectedChecksum;
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
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
        const available = quota - usage;
        const usagePercentage = quota > 0 ? Math.round((usage / quota) * 100) : 0;

        return {
          quota,
          usage,
          available,
          usagePercentage
        };
      }
    } catch (error) {
      console.error('Failed to get storage quota:', error);
    }

    return {};
  }

  /**
   * 检查存储空间是否足够
   */
  private async checkStorageSpace(dataSize: number): Promise<boolean> {
    const quota = await this.getStorageQuota();

    if (quota.available !== undefined) {
      // 保留10%的缓冲空间
      const bufferSpace = (quota.quota || 0) * 0.1;
      return dataSize < (quota.available - bufferSpace);
    }

    // 如果无法获取配额信息，尝试写入测试数据
    try {
      const testKey = '__storage_space_test__';
      const testData = 'x'.repeat(dataSize);
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 保存会话数据
   */
  async saveSessions(sessions: AssessmentSession[]): Promise<boolean> {
    if (!this.isClientSide) {
      console.warn('LocalStorageManager: Cannot save sessions in server-side environment');
      return false;
    }

    try {
      // 序列化会话数据
      const serializedSessions = sessions.map(session => ({
        ...session,
        startedAt: session.startedAt.toISOString(),
        lastActivityAt: session.lastActivityAt.toISOString(),
        answers: session.answers.map(answer => ({
          ...answer,
          answeredAt: answer.answeredAt.toISOString()
        }))
      }));

      const dataString = JSON.stringify(serializedSessions);
      const dataSize = new Blob([dataString]).size;

      // 检查存储空间
      const hasSpace = await this.checkStorageSpace(dataSize);
      if (!hasSpace) {
        console.warn('Insufficient storage space, attempting to clear old data');
        await this.clearOldData();

        // 再次检查
        const hasSpaceAfterCleanup = await this.checkStorageSpace(dataSize);
        if (!hasSpaceAfterCleanup) {
          throw new Error('Insufficient storage space even after cleanup');
        }
      }

      // 加密数据
      const encryptedData = this.encrypt(dataString);
      const checksum = this.calculateChecksum(dataString);

      // 保存数据和元数据
      const metadata = {
        checksum,
        timestamp: new Date().toISOString(),
        version: '1.0',
        sessionCount: sessions.length
      };

      localStorage.setItem(this.SESSIONS_KEY, encryptedData);
      localStorage.setItem(`${this.SESSIONS_KEY}_meta`, JSON.stringify(metadata));

      return true;
    } catch (error) {
      console.error('Failed to save sessions:', error);
      return false;
    }
  }

  /**
   * 加载会话数据
   */
  loadSessions(): AssessmentSession[] {
    if (!this.isClientSide) {
      console.warn('LocalStorageManager: Cannot load sessions in server-side environment');
      return [];
    }

    try {
      const encryptedData = localStorage.getItem(this.SESSIONS_KEY);
      const metadataString = localStorage.getItem(`${this.SESSIONS_KEY}_meta`);

      if (!encryptedData || !metadataString) {
        return [];
      }

      // 验证元数据
      const metadata = JSON.parse(metadataString);
      const decryptedData = this.decrypt(encryptedData);

      // 验证数据完整性
      if (!this.verifyIntegrity(decryptedData, metadata.checksum)) {
        console.error('Session data integrity check failed, clearing corrupted data');
        this.clearSessions();
        return [];
      }

      const sessionsData = JSON.parse(decryptedData);

      // 验证数据结构
      if (!Array.isArray(sessionsData)) {
        console.warn('Invalid sessions data format, clearing storage');
        this.clearSessions();
        return [];
      }

      // 反序列化会话数据
      const sessions: AssessmentSession[] = [];
      for (const sessionData of sessionsData) {
        try {
          if (!this.validateSessionData(sessionData)) {
            console.warn('Invalid session data, skipping:', sessionData.id);
            continue;
          }

          const session: AssessmentSession = {
            ...sessionData,
            startedAt: new Date(sessionData.startedAt),
            lastActivityAt: new Date(sessionData.lastActivityAt),
            answers: sessionData.answers.map((answer: any) => ({
              ...answer,
              answeredAt: new Date(answer.answeredAt)
            }))
          };

          sessions.push(session);
        } catch (sessionError) {
          console.error('Failed to load individual session:', sessionError);
        }
      }

      return sessions;
    } catch (error) {
      console.error('Failed to load sessions:', error);
      // 清除损坏的数据
      this.clearSessions();
      return [];
    }
  }

  /**
   * 验证会话数据结构
   */
  private validateSessionData(sessionData: any): boolean {
    return sessionData &&
           typeof sessionData.id === 'string' &&
           typeof sessionData.assessmentTypeId === 'string' &&
           typeof sessionData.startedAt === 'string' &&
           typeof sessionData.lastActivityAt === 'string' &&
           Array.isArray(sessionData.answers) &&
           ['active', 'paused', 'completed', 'abandoned'].includes(sessionData.status);
  }

  /**
   * 保存评测结果
   */
  async saveResult(result: AssessmentResult): Promise<boolean> {
    if (!this.isClientSide) {
      console.warn('LocalStorageManager: Cannot save result in server-side environment');
      return false;
    }

    try {
      const results = this.loadResults();

      // 序列化结果数据
      const serializedResult = {
        ...result,
        completedAt: result.completedAt.toISOString()
      };

      results.push(serializedResult as any);

      const dataString = JSON.stringify(results);
      const dataSize = new Blob([dataString]).size;

      // 检查存储空间
      const hasSpace = await this.checkStorageSpace(dataSize);
      if (!hasSpace) {
        console.warn('Insufficient storage space for results, attempting cleanup');
        await this.clearOldResults();
      }

      // 加密并保存
      const encryptedData = this.encrypt(dataString);
      const checksum = this.calculateChecksum(dataString);

      const metadata = {
        checksum,
        timestamp: new Date().toISOString(),
        version: '1.0',
        resultCount: results.length
      };

      localStorage.setItem(this.RESULTS_KEY, encryptedData);
      localStorage.setItem(`${this.RESULTS_KEY}_meta`, JSON.stringify(metadata));

      return true;
    } catch (error) {
      console.error('Failed to save result:', error);
      return false;
    }
  }

  /**
   * 加载评测结果
   */
  loadResults(): AssessmentResult[] {
    if (!this.isClientSide) {
      console.warn('LocalStorageManager: Cannot load results in server-side environment');
      return [];
    }

    try {
      const encryptedData = localStorage.getItem(this.RESULTS_KEY);
      const metadataString = localStorage.getItem(`${this.RESULTS_KEY}_meta`);

      if (!encryptedData || !metadataString) {
        return [];
      }

      const metadata = JSON.parse(metadataString);
      const decryptedData = this.decrypt(encryptedData);

      // 验证数据完整性
      if (!this.verifyIntegrity(decryptedData, metadata.checksum)) {
        console.error('Results data integrity check failed, clearing corrupted data');
        this.clearResults();
        return [];
      }

      const resultsData = JSON.parse(decryptedData);

      if (!Array.isArray(resultsData)) {
        console.warn('Invalid results data format, clearing storage');
        this.clearResults();
        return [];
      }

      // 反序列化结果数据
      return resultsData.map((result: any) => ({
        ...result,
        completedAt: new Date(result.completedAt)
      }));
    } catch (error) {
      console.error('Failed to load results:', error);
      this.clearResults();
      return [];
    }
  }

  /**
   * 清除旧的会话数据
   */
  private async clearOldData(): Promise<void> {
    try {
      await this.clearOldSessions();
      await this.clearOldResults();
    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  }

  /**
   * 清除旧的会话数据（保留最近7天的活跃和暂停会话）
   */
  private async clearOldSessions(): Promise<void> {
    const sessions = this.loadSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const sessionsToKeep = sessions.filter(session => {
      return session.status === 'active' ||
             session.status === 'paused' ||
             session.lastActivityAt > cutoffDate;
    });

    await this.saveSessions(sessionsToKeep);
  }

  /**
   * 清除旧的结果数据（保留最近30天的结果）
   */
  private async clearOldResults(): Promise<void> {
    const results = this.loadResults();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const resultsToKeep = results.filter(result => {
      return result.completedAt > cutoffDate;
    });

    // 重新保存筛选后的结果
    if (resultsToKeep.length < results.length) {
      const dataString = JSON.stringify(resultsToKeep.map(result => ({
        ...result,
        completedAt: result.completedAt.toISOString()
      })));

      const encryptedData = this.encrypt(dataString);
      const checksum = this.calculateChecksum(dataString);

      const metadata = {
        checksum,
        timestamp: new Date().toISOString(),
        version: '1.0',
        resultCount: resultsToKeep.length
      };

      localStorage.setItem(this.RESULTS_KEY, encryptedData);
      localStorage.setItem(`${this.RESULTS_KEY}_meta`, JSON.stringify(metadata));
    }
  }

  /**
   * 清除所有会话数据
   */
  clearSessions(): void {
    if (!this.isClientSide) return;

    try {
      localStorage.removeItem(this.SESSIONS_KEY);
      localStorage.removeItem(`${this.SESSIONS_KEY}_meta`);
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  }

  /**
   * 清除所有结果数据
   */
  clearResults(): void {
    if (!this.isClientSide) return;

    try {
      localStorage.removeItem(this.RESULTS_KEY);
      localStorage.removeItem(`${this.RESULTS_KEY}_meta`);
    } catch (error) {
      console.error('Failed to clear results:', error);
    }
  }

  /**
   * 清除所有数据
   */
  clearAllData(): void {
    if (!this.isClientSide) return;

    try {
      this.clearSessions();
      this.clearResults();
      localStorage.removeItem(this.METADATA_KEY);
      localStorage.removeItem(this.ENCRYPTION_KEY);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStatistics(): Promise<{
    sessionCount: number;
    resultCount: number;
    totalSize: number;
    quota: {
      quota?: number;
      usage?: number;
      available?: number;
      usagePercentage?: number;
    };
    lastUpdated: Date | null;
  }> {
    const sessions = this.loadSessions();
    const results = this.loadResults();
    const quota = await this.getStorageQuota();

    // 计算数据大小
    let totalSize = 0;
    try {
      const sessionsData = localStorage.getItem(this.SESSIONS_KEY);
      const resultsData = localStorage.getItem(this.RESULTS_KEY);

      if (sessionsData) {
        totalSize += new Blob([sessionsData]).size;
      }
      if (resultsData) {
        totalSize += new Blob([resultsData]).size;
      }
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    }

    // 获取最后更新时间
    let lastUpdated: Date | null = null;
    try {
      const sessionsMeta = localStorage.getItem(`${this.SESSIONS_KEY}_meta`);
      const resultsMeta = localStorage.getItem(`${this.RESULTS_KEY}_meta`);

      const timestamps: Date[] = [];
      if (sessionsMeta) {
        const meta = JSON.parse(sessionsMeta);
        timestamps.push(new Date(meta.timestamp));
      }
      if (resultsMeta) {
        const meta = JSON.parse(resultsMeta);
        timestamps.push(new Date(meta.timestamp));
      }

      if (timestamps.length > 0) {
        lastUpdated = new Date(Math.max(...timestamps.map(d => d.getTime())));
      }
    } catch (error) {
      console.error('Failed to get last updated time:', error);
    }

    return {
      sessionCount: sessions.length,
      resultCount: results.length,
      totalSize,
      quota,
      lastUpdated
    };
  }

  /**
   * 执行存储健康检查
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 检查环境
    if (!this.isClientSide) {
      issues.push('Running in server-side environment');
      recommendations.push('LocalStorageManager should only be used in client-side environment');
    }

    // 检查localStorage可用性
    try {
      const testKey = '__health_check_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      issues.push('localStorage is not available');
      recommendations.push('Enable localStorage or use alternative storage solution');
    }

    // 检查存储配额
    const quota = await this.getStorageQuota();
    if (quota.usagePercentage && quota.usagePercentage > 80) {
      issues.push(`Storage usage is high (${quota.usagePercentage}%)`);
      recommendations.push('Consider clearing old data to free up space');
    }

    // 检查数据完整性
    try {
      const sessions = this.loadSessions();
      const results = this.loadResults();

      if (sessions.length === 0 && results.length === 0) {
        // 这可能是正常情况，不算问题
      }
    } catch (error) {
      issues.push('Data integrity check failed');
      recommendations.push('Clear corrupted data and restart');
    }

    // 检查加密密钥
    if (!this.encryptionKey) {
      issues.push('Encryption key not available');
      recommendations.push('Reinitialize encryption system');
    }

    const status = issues.length === 0 ? 'healthy' :
                   issues.some(issue => issue.includes('server-side') || issue.includes('localStorage')) ? 'error' : 'warning';

    return {
      status,
      issues,
      recommendations
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

  async saveResult(result: AssessmentResult) {
    return this.getInstance().saveResult(result);
  },

  loadResults() {
    return this.getInstance().loadResults();
  },

  clearSessions() {
    return this.getInstance().clearSessions();
  },

  clearResults() {
    return this.getInstance().clearResults();
  },

  clearAllData() {
    return this.getInstance().clearAllData();
  },

  async getStorageQuota() {
    return this.getInstance().getStorageQuota();
  },

  async getStorageStatistics() {
    return this.getInstance().getStorageStatistics();
  },

  async performHealthCheck() {
    return this.getInstance().performHealthCheck();
  }
};
