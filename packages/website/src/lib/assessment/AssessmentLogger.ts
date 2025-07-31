import type { AssessmentError } from './AssessmentErrors';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  sessionId?: string;
  userId?: string;
  error?: AssessmentError;
  stack?: string;
}

/**
 * 日志输出接口
 */
export interface LogOutput {
  write(entry: LogEntry): Promise<void>;
  flush?(): Promise<void>;
}

/**
 * 控制台日志输出
 */
export class ConsoleLogOutput implements LogOutput {
  async write(entry: LogEntry): Promise<void> {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${level}] [${entry.category}]`;

    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.data);
        if (entry.error) {
          console.error('Error details:', entry.error);
        }
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }
}

/**
 * 本地存储日志输出
 */
export class LocalStorageLogOutput implements LogOutput {
  private readonly maxEntries = 1000;
  private readonly storageKey = 'assessment_logs';
  private isClientSide: boolean;

  constructor() {
    this.isClientSide = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.isClientSide) return;

    try {
      const logs = this.loadLogs();
      logs.push({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      });

      // 保持日志数量在限制内
      if (logs.length > this.maxEntries) {
        logs.splice(0, logs.length - this.maxEntries);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      // 如果存储失败，至少输出到控制台
      console.error('Failed to write log to localStorage:', error);
      console.log('Original log entry:', entry);
    }
  }

  private loadLogs(): any[] {
    if (!this.isClientSide) return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load logs from localStorage:', error);
      return [];
    }
  }

  /**
   * 获取存储的日志
   */
  getLogs(): LogEntry[] {
    const logs = this.loadLogs();
    return logs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));
  }

  /**
   * 清除所有日志
   */
  clearLogs(): void {
    if (!this.isClientSide) return;

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  /**
   * 导出日志为JSON
   */
  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}

/**
 * 远程日志输出（用于生产环境错误报告）
 */
export class RemoteLogOutput implements LogOutput {
  private endpoint: string;
  private apiKey?: string;
  private batchSize = 10;
  private batch: LogEntry[] = [];
  private flushTimer?: number;

  constructor(endpoint: string, apiKey?: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async write(entry: LogEntry): Promise<void> {
    // 只发送警告级别以上的日志到远程
    if (entry.level < LogLevel.WARN) return;

    this.batch.push(entry);

    if (this.batch.length >= this.batchSize) {
      await this.flush();
    } else {
      // 设置定时器，确保日志最终会被发送
      this.scheduleFlush();
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const logsToSend = [...this.batch];
    this.batch = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          logs: logsToSend.map(entry => ({
            ...entry,
            timestamp: entry.timestamp.toISOString()
          }))
        })
      });
    } catch (error) {
      console.error('Failed to send logs to remote endpoint:', error);
      // 将失败的日志重新加入批次
      this.batch.unshift(...logsToSend);
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;

    this.flushTimer = window.setTimeout(() => {
      this.flush();
    }, 5000); // 5秒后自动发送
  }
}

/**
 * 评测系统日志记录器
 */
export class AssessmentLogger {
  private outputs: LogOutput[] = [];
  private minLevel: LogLevel = LogLevel.INFO;
  private isDebugMode: boolean = false;

  constructor() {
    // 默认添加控制台输出
    this.outputs.push(new ConsoleLogOutput());

    // 在开发环境中启用本地存储日志
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      this.outputs.push(new LocalStorageLogOutput());
      this.isDebugMode = true;
      this.minLevel = LogLevel.DEBUG;
    }
  }

  /**
   * 设置最小日志级别
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * 启用调试模式
   */
  enableDebugMode(): void {
    this.isDebugMode = true;
    this.minLevel = LogLevel.DEBUG;
  }

  /**
   * 添加日志输出
   */
  addOutput(output: LogOutput): void {
    this.outputs.push(output);
  }

  /**
   * 移除日志输出
   */
  removeOutput(output: LogOutput): void {
    const index = this.outputs.indexOf(output);
    if (index > -1) {
      this.outputs.splice(index, 1);
    }
  }

  /**
   * 记录调试信息
   */
  debug(category: string, message: string, data?: any, sessionId?: string): void {
    this.log(LogLevel.DEBUG, category, message, data, sessionId);
  }

  /**
   * 记录信息
   */
  info(category: string, message: string, data?: any, sessionId?: string): void {
    this.log(LogLevel.INFO, category, message, data, sessionId);
  }

  /**
   * 记录警告
   */
  warn(category: string, message: string, data?: any, sessionId?: string): void {
    this.log(LogLevel.WARN, category, message, data, sessionId);
  }

  /**
   * 记录错误
   */
  error(category: string, message: string, error?: AssessmentError | Error, sessionId?: string): void {
    const assessmentError = error instanceof Error && !(error as any).type
      ? undefined
      : error as AssessmentError;

    this.log(LogLevel.ERROR, category, message, undefined, sessionId, assessmentError);
  }

  /**
   * 记录严重错误
   */
  critical(category: string, message: string, error?: AssessmentError | Error, sessionId?: string): void {
    const assessmentError = error instanceof Error && !(error as any).type
      ? undefined
      : error as AssessmentError;

    this.log(LogLevel.CRITICAL, category, message, undefined, sessionId, assessmentError);
  }

  /**
   * 记录会话事件
   */
  logSessionEvent(event: string, sessionId: string, data?: any): void {
    this.info('SESSION', `Session ${event}`, { sessionId, ...data }, sessionId);
  }

  /**
   * 记录用户操作
   */
  logUserAction(action: string, sessionId?: string, data?: any): void {
    this.info('USER_ACTION', action, data, sessionId);
  }

  /**
   * 记录性能指标
   */
  logPerformance(metric: string, value: number, unit: string, sessionId?: string): void {
    this.info('PERFORMANCE', `${metric}: ${value}${unit}`, { metric, value, unit }, sessionId);
  }

  /**
   * 记录存储操作
   */
  logStorageOperation(operation: string, success: boolean, data?: any): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    this.log(level, 'STORAGE', `Storage ${operation} ${success ? 'succeeded' : 'failed'}`, data);
  }

  /**
   * 核心日志记录方法
   */
  private async log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    sessionId?: string,
    error?: AssessmentError
  ): Promise<void> {
    // 检查日志级别
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      sessionId,
      error,
      stack: error?.stack || (new Error()).stack
    };

    // 写入所有输出
    const writePromises = this.outputs.map(output =>
      output.write(entry).catch(err =>
        console.error('Log output failed:', err)
      )
    );

    await Promise.all(writePromises);
  }

  /**
   * 生成唯一的日志ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 刷新所有输出
   */
  async flush(): Promise<void> {
    const flushPromises = this.outputs
      .filter(output => output.flush)
      .map(output => output.flush!().catch(err =>
        console.error('Log flush failed:', err)
      ));

    await Promise.all(flushPromises);
  }

  /**
   * 获取日志统计信息
   */
  getLogStatistics(): {
    totalOutputs: number;
    debugMode: boolean;
    minLevel: string;
  } {
    return {
      totalOutputs: this.outputs.length,
      debugMode: this.isDebugMode,
      minLevel: LogLevel[this.minLevel]
    };
  }

  /**
   * 导出本地存储的日志
   */
  exportLocalLogs(): string | null {
    const localStorageOutput = this.outputs.find(output => output instanceof LocalStorageLogOutput) as LocalStorageLogOutput;
    return localStorageOutput ? localStorageOutput.exportLogs() : null;
  }

  /**
   * 清除本地存储的日志
   */
  clearLocalLogs(): void {
    const localStorageOutput = this.outputs.find(output => output instanceof LocalStorageLogOutput) as LocalStorageLogOutput;
    if (localStorageOutput) {
      localStorageOutput.clearLogs();
    }
  }
}

// 导出单例实例
export const assessmentLogger = new AssessmentLogger();

// Classes are already exported individually above
