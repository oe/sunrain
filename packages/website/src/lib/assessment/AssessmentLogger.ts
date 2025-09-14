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
 * 评测系统日志记录器
 */
export class AssessmentLogger {
  private outputs: LogOutput[] = [];
  private minLevel: LogLevel = LogLevel.INFO;

  constructor() {
    // 默认添加控制台输出
    this.outputs.push(new ConsoleLogOutput());

    // 在开发环境中启用本地存储日志
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      this.outputs.push(new LocalStorageLogOutput());
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




}

// 导出单例实例
export const assessmentLogger = new AssessmentLogger();

// Classes are already exported individually above
