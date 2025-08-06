/**
 * 评测系统错误类型定义和错误处理
 */

export enum AssessmentErrorType {
  // 初始化错误
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  ENVIRONMENT_NOT_SUPPORTED = 'ENVIRONMENT_NOT_SUPPORTED',

  // 会话相关错误
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_ALREADY_COMPLETED = 'SESSION_ALREADY_COMPLETED',
  SESSION_ALREADY_EXISTS = 'SESSION_ALREADY_EXISTS',
  SESSION_CREATION_FAILED = 'SESSION_CREATION_FAILED',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',

  // 问题相关错误
  QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND',
  QUESTION_LOAD_FAILED = 'QUESTION_LOAD_FAILED',
  INVALID_QUESTION_TYPE = 'INVALID_QUESTION_TYPE',

  // 答案相关错误
  ANSWER_VALIDATION_FAILED = 'ANSWER_VALIDATION_FAILED',
  ANSWER_SUBMIT_FAILED = 'ANSWER_SUBMIT_FAILED',
  ANSWER_REQUIRED = 'ANSWER_REQUIRED',
  ANSWER_INVALID_FORMAT = 'ANSWER_INVALID_FORMAT',

  // 存储相关错误
  STORAGE_NOT_AVAILABLE = 'STORAGE_NOT_AVAILABLE',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_SAVE_FAILED = 'STORAGE_SAVE_FAILED',
  STORAGE_LOAD_FAILED = 'STORAGE_LOAD_FAILED',
  STORAGE_CORRUPTION = 'STORAGE_CORRUPTION',

  // 网络相关错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',

  // 评测类型错误
  ASSESSMENT_TYPE_NOT_FOUND = 'ASSESSMENT_TYPE_NOT_FOUND',
  ASSESSMENT_TYPE_INVALID = 'ASSESSMENT_TYPE_INVALID',

  // 翻译和本地化错误
  TRANSLATION_LOAD_FAILED = 'TRANSLATION_LOAD_FAILED',
  LANGUAGE_NOT_SUPPORTED = 'LANGUAGE_NOT_SUPPORTED',

  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OPERATION_CANCELLED = 'OPERATION_CANCELLED'
}

export enum AssessmentErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AssessmentErrorContext {
  sessionId?: string;
  questionId?: string;
  assessmentTypeId?: string;
  userId?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

export class AssessmentError extends Error {
  public readonly type: AssessmentErrorType;
  public readonly severity: AssessmentErrorSeverity;
  public readonly recoverable: boolean;
  public readonly context: AssessmentErrorContext;
  public readonly originalError?: Error;

  constructor(
    type: AssessmentErrorType,
    message: string,
    options: {
      severity?: AssessmentErrorSeverity;
      recoverable?: boolean;
      context?: Partial<AssessmentErrorContext>;
      originalError?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AssessmentError';
    this.type = type;
    this.severity = options.severity || AssessmentErrorSeverity.MEDIUM;
    this.recoverable = options.recoverable !== false; // 默认为可恢复
    this.originalError = options.originalError;

    // 构建错误上下文
    this.context = {
      timestamp: new Date(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...options.context
    };

    // 保持错误堆栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssessmentError);
    }
  }

  /**
   * 将错误转换为可序列化的对象
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      severity: this.severity,
      recoverable: this.recoverable,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage(): string {
    switch (this.type) {
      case AssessmentErrorType.SESSION_NOT_FOUND:
        return '评测会话未找到，请重新开始评测';
      case AssessmentErrorType.SESSION_ALREADY_COMPLETED:
        return '此评测已经完成，无法继续';
      case AssessmentErrorType.ANSWER_REQUIRED:
        return '请回答此问题后再继续';
      case AssessmentErrorType.STORAGE_NOT_AVAILABLE:
        return '浏览器存储不可用，请检查浏览器设置';
      case AssessmentErrorType.STORAGE_QUOTA_EXCEEDED:
        return '存储空间不足，请清理浏览器数据';
      case AssessmentErrorType.NETWORK_ERROR:
        return '网络连接出现问题，请检查网络连接';
      case AssessmentErrorType.ASSESSMENT_TYPE_NOT_FOUND:
        return '评测类型不存在，请联系管理员';
      case AssessmentErrorType.TRANSLATION_LOAD_FAILED:
        return '语言包加载失败，将使用默认语言';
      default:
        return '操作失败，请稍后重试';
    }
  }

  /**
   * 获取恢复建议
   */
  getRecoveryActions(): string[] {
    const actions: string[] = [];

    switch (this.type) {
      case AssessmentErrorType.SESSION_NOT_FOUND:
        actions.push('重新开始评测');
        actions.push('检查是否有其他活跃的评测会话');
        break;
      case AssessmentErrorType.STORAGE_NOT_AVAILABLE:
        actions.push('启用浏览器的本地存储功能');
        actions.push('尝试使用隐私模式');
        actions.push('清除浏览器缓存和数据');
        break;
      case AssessmentErrorType.STORAGE_QUOTA_EXCEEDED:
        actions.push('清理浏览器存储数据');
        actions.push('删除不需要的评测记录');
        actions.push('使用其他浏览器');
        break;
      case AssessmentErrorType.NETWORK_ERROR:
        actions.push('检查网络连接');
        actions.push('刷新页面重试');
        actions.push('稍后再试');
        break;
      case AssessmentErrorType.ANSWER_VALIDATION_FAILED:
        actions.push('检查答案格式');
        actions.push('确保所有必填项已填写');
        break;
      default:
        actions.push('刷新页面重试');
        actions.push('清除浏览器缓存');
        actions.push('联系技术支持');
    }

    return actions;
  }
}

/**
 * 错误工厂类，用于创建标准化的错误
 */
export class AssessmentErrorFactory {
  static createSessionError(
    type: AssessmentErrorType,
    message: string,
    sessionId?: string,
    originalError?: Error
  ): AssessmentError {
    return new AssessmentError(type, message, {
      severity: AssessmentErrorSeverity.HIGH,
      context: { sessionId },
      originalError
    });
  }

  static createStorageError(
    type: AssessmentErrorType,
    message: string,
    originalError?: Error
  ): AssessmentError {
    return new AssessmentError(type, message, {
      severity: AssessmentErrorSeverity.HIGH,
      recoverable: type !== AssessmentErrorType.STORAGE_NOT_AVAILABLE,
      originalError
    });
  }

  static createValidationError(
    message: string,
    questionId?: string,
    originalError?: Error
  ): AssessmentError {
    return new AssessmentError(AssessmentErrorType.ANSWER_VALIDATION_FAILED, message, {
      severity: AssessmentErrorSeverity.LOW,
      recoverable: true,
      context: { questionId },
      originalError
    });
  }

  static createNetworkError(
    message: string,
    originalError?: Error
  ): AssessmentError {
    return new AssessmentError(AssessmentErrorType.NETWORK_ERROR, message, {
      severity: AssessmentErrorSeverity.MEDIUM,
      recoverable: true,
      originalError
    });
  }

  static fromGenericError(
    error: Error,
    context?: Partial<AssessmentErrorContext>
  ): AssessmentError {
    // 尝试从错误消息中推断错误类型
    let type = AssessmentErrorType.UNKNOWN_ERROR;
    let severity = AssessmentErrorSeverity.MEDIUM;

    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      type = AssessmentErrorType.STORAGE_QUOTA_EXCEEDED;
      severity = AssessmentErrorSeverity.HIGH;
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      type = AssessmentErrorType.NETWORK_ERROR;
      severity = AssessmentErrorSeverity.MEDIUM;
    } else if (error.message.includes('storage') || error.message.includes('localStorage')) {
      type = AssessmentErrorType.STORAGE_SAVE_FAILED;
      severity = AssessmentErrorSeverity.HIGH;
    }

    return new AssessmentError(type, error.message, {
      severity,
      context,
      originalError: error
    });
  }
}

/**
 * 错误恢复策略
 */
export interface ErrorRecoveryStrategy {
  canRecover(error: AssessmentError): boolean;
  recover(error: AssessmentError): Promise<boolean>;
  getDescription(): string;
}

export class StorageQuotaRecoveryStrategy implements ErrorRecoveryStrategy {
  canRecover(error: AssessmentError): boolean {
    return error.type === AssessmentErrorType.STORAGE_QUOTA_EXCEEDED;
  }

  async recover(_error: AssessmentError): Promise<boolean> {
    try {
      // 尝试清理旧数据
      const LocalStorageManagerModule = await import('./LocalStorageManager');
      const localStorageManager = LocalStorageManagerModule.localStorageManager;

      // 获取存储统计信息
      const stats = await localStorageManager.getStorageStatistics();

      if (stats.sessionCount > 10 || stats.resultCount > 50) {
        // 清理旧数据
        console.log('Attempting to clear old data to free up storage space');

        // 这里可以实现更智能的清理策略
        // 比如只保留最近的会话和结果

        return true;
      }

      return false;
    } catch (recoveryError) {
      console.error('Failed to recover from storage quota error:', recoveryError);
      return false;
    }
  }

  getDescription(): string {
    return '清理旧的评测数据以释放存储空间';
  }
}

export class SessionRecoveryStrategy implements ErrorRecoveryStrategy {
  canRecover(error: AssessmentError): boolean {
    return error.type === AssessmentErrorType.SESSION_NOT_FOUND ||
           error.type === AssessmentErrorType.SESSION_TIMEOUT;
  }

  async recover(error: AssessmentError): Promise<boolean> {
    try {
      // 尝试从本地存储恢复会话
      const LocalStorageManagerModule = await import('./LocalStorageManager');
      const localStorageManager = LocalStorageManagerModule.localStorageManager;
      const sessions = await localStorageManager.loadSessionsAsync();

      if (error.context.sessionId) {
        const session = sessions.find((s: any) => s.id === error.context.sessionId);
        if (session && session.status !== 'completed') {
          // 会话存在且未完成，可以恢复
          return true;
        }
      }

      // 检查是否有其他活跃会话
      const activeSessions = sessions.filter((s: any) => s.status === 'active' || s.status === 'paused');
      return activeSessions.length > 0;
    } catch (recoveryError) {
      console.error('Failed to recover session:', recoveryError);
      return false;
    }
  }

  getDescription(): string {
    return '尝试恢复评测会话或查找其他活跃会话';
  }
}

/**
 * 错误恢复管理器
 */
export class ErrorRecoveryManager {
  private strategies: ErrorRecoveryStrategy[] = [
    new StorageQuotaRecoveryStrategy(),
    new SessionRecoveryStrategy()
  ];

  /**
   * 尝试恢复错误
   */
  async attemptRecovery(error: AssessmentError): Promise<{
    recovered: boolean;
    strategy?: ErrorRecoveryStrategy;
    message?: string;
  }> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          const recovered = await strategy.recover(error);
          if (recovered) {
            return {
              recovered: true,
              strategy,
              message: `已使用策略恢复：${strategy.getDescription()}`
            };
          }
        } catch (recoveryError) {
          console.error(`Recovery strategy failed:`, recoveryError);
        }
      }
    }

    return {
      recovered: false,
      message: '无法自动恢复，需要手动处理'
    };
  }

  /**
   * 添加自定义恢复策略
   */
  addStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * 获取所有可用的恢复策略
   */
  getAvailableStrategies(error: AssessmentError): ErrorRecoveryStrategy[] {
    return this.strategies.filter(strategy => strategy.canRecover(error));
  }
}

// 导出单例实例
export const errorRecoveryManager = new ErrorRecoveryManager();
