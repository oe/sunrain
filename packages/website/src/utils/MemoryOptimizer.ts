/**
 * 内存优化工具
 * 用于管理大数据量的内存使用，防止内存泄漏和优化性能
 */

interface MemoryConfig {
  maxMemoryUsage: number; // 最大内存使用量 (MB)
  gcThreshold: number; // 垃圾回收阈值
  monitoringEnabled: boolean; // 是否启用内存监控
  cleanupInterval: number; // 清理间隔 (ms)
}

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsagePercentage: number;
  lastCleanup: number;
  cleanupCount: number;
}

export class MemoryOptimizer {
  private readonly config: MemoryConfig = {
    maxMemoryUsage: 100, // 100MB
    gcThreshold: 0.8, // 80%
    monitoringEnabled: true,
    cleanupInterval: 60000 // 1分钟
  };

  private static instance: MemoryOptimizer;
  private cleanupCallbacks = new Set<() => void>();
  private monitoringTimer: number | null = null;
  private lastCleanup = 0;
  private cleanupCount = 0;

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  // 移除了复杂的弱引用管理 - 过度设计，实际收益有限

  /**
   * 注册清理回调
   */
  public registerCleanupCallback(callback: () => void): () => void {
    this.cleanupCallbacks.add(callback);

    // 返回取消注册的函数
    return () => {
      this.cleanupCallbacks.delete(callback);
    };
  }

  /**
   * 手动触发内存清理
   */
  public cleanup(): void {
    const now = Date.now();

    // 执行注册的清理回调
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    });

    this.lastCleanup = now;
    this.cleanupCount++;

    if (process.env.NODE_ENV === 'development') {
      console.log('Memory cleanup completed');
    }
  }

  /**
   * 获取内存统计信息
   */
  public getMemoryStats(): MemoryStats | null {
    if (!this.isMemoryAPIAvailable()) {
      return null;
    }

    const memory = (performance as any).memory;
    const memoryUsagePercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      memoryUsagePercentage,
      lastCleanup: this.lastCleanup,
      cleanupCount: this.cleanupCount
    };
  }

  /**
   * 检查是否需要清理内存
   */
  public shouldCleanup(): boolean {
    const stats = this.getMemoryStats();
    if (!stats) return false;

    return stats.memoryUsagePercentage > this.config.gcThreshold;
  }

  /**
   * 优化大数组的处理
   */
  public processLargeArray<T, R>(
    array: T[],
    processor: (item: T, index: number) => R,
    batchSize: number = 1000
  ): Promise<R[]> {
    return new Promise((resolve, reject) => {
      const results: R[] = [];
      let currentIndex = 0;

      const processBatch = () => {
        try {
          const endIndex = Math.min(currentIndex + batchSize, array.length);

          for (let i = currentIndex; i < endIndex; i++) {
            results.push(processor(array[i], i));
          }

          currentIndex = endIndex;

          if (currentIndex >= array.length) {
            resolve(results);
          } else {
            // 使用 setTimeout 让出控制权，避免阻塞主线程
            setTimeout(processBatch, 0);
          }
        } catch (error) {
          reject(error);
        }
      };

      processBatch();
    });
  }

  /**
   * 创建内存友好的数据流处理器
   */
  public createStreamProcessor<T, R>(
    processor: (item: T) => R,
    options: {
      bufferSize?: number;
      onBatch?: (batch: R[]) => void;
      onComplete?: (results: R[]) => void;
      onError?: (error: Error) => void;
    } = {}
  ) {
    const {
      bufferSize = 100,
      onBatch,
      onComplete,
      onError
    } = options;

    let buffer: R[] = [];
    let allResults: R[] = [];

    return {
      process: (item: T) => {
        try {
          const result = processor(item);
          buffer.push(result);
          allResults.push(result);

          if (buffer.length >= bufferSize) {
            if (onBatch) {
              onBatch([...buffer]);
            }
            buffer = []; // 清空缓冲区
          }
        } catch (error) {
          if (onError) {
            onError(error as Error);
          }
        }
      },

      flush: () => {
        if (buffer.length > 0 && onBatch) {
          onBatch([...buffer]);
          buffer = [];
        }
      },

      complete: () => {
        if (buffer.length > 0 && onBatch) {
          onBatch([...buffer]);
        }
        if (onComplete) {
          onComplete(allResults);
        }
        // 清理引用
        buffer = [];
        allResults = [];
      }
    };
  }

  /**
   * 监控组件的内存使用
   */
  public monitorComponent(componentName: string): {
    start: () => void;
    end: () => void;
    getStats: () => any;
  } {
    let startStats: MemoryStats | null = null;
    let endStats: MemoryStats | null = null;

    return {
      start: () => {
        startStats = this.getMemoryStats();
        console.log(`Memory monitoring started for ${componentName}`);
      },

      end: () => {
        endStats = this.getMemoryStats();
        console.log(`Memory monitoring ended for ${componentName}`);
      },

      getStats: () => {
        if (!startStats || !endStats) {
          return null;
        }

        return {
          component: componentName,
          memoryDelta: endStats.usedJSHeapSize - startStats.usedJSHeapSize,
          startMemory: startStats.usedJSHeapSize,
          endMemory: endStats.usedJSHeapSize,
          duration: endStats.lastCleanup - startStats.lastCleanup
        };
      }
    };
  }

  /**
   * 初始化内存监控
   */
  private initializeMonitoring(): void {
    if (!this.config.monitoringEnabled || !this.isMemoryAPIAvailable()) {
      return;
    }

    // 定期检查内存使用情况
    this.monitoringTimer = window.setInterval(() => {
      if (this.shouldCleanup()) {
        console.warn('Memory usage high, triggering cleanup');
        this.cleanup();
      }
    }, this.config.cleanupInterval);

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
      this.cleanup();
      if (this.monitoringTimer) {
        clearInterval(this.monitoringTimer);
      }
    });

    // 页面隐藏时清理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.cleanup();
      }
    });
  }

  // 移除了复杂的弱引用清理逻辑

  /**
   * 检查内存API是否可用
   */
  private isMemoryAPIAvailable(): boolean {
    return 'memory' in performance && typeof (performance as any).memory === 'object';
  }
}

// 导出单例实例
export const memoryOptimizer = MemoryOptimizer.getInstance();

// 导出React Hook用于组件内存监控
export function useMemoryMonitor(componentName: string) {
  const monitor = memoryOptimizer.monitorComponent(componentName);

  return {
    startMonitoring: monitor.start,
    endMonitoring: monitor.end,
    getMemoryStats: monitor.getStats,
    cleanup: () => memoryOptimizer.cleanup(),
    shouldCleanup: () => memoryOptimizer.shouldCleanup()
  };
}
