/**
 * 缓存性能监控器
 * 监控缓存的性能指标，提供优化建议
 */

import { cacheManager } from '@/lib/assessment/CacheManager';
import { questionCache } from '@/lib/assessment/QuestionCache';
import { translationCache } from '@/utils/TranslationCache';
import { memoryOptimizer } from '@/utils/MemoryOptimizer';

interface PerformanceMetrics {
  cacheHitRate: number;
  cacheMissRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  evictionRate: number;
  errorRate: number;
}

interface CacheOperation {
  type: 'hit' | 'miss' | 'set' | 'delete' | 'evict';
  key: string;
  timestamp: number;
  responseTime?: number;
  size?: number;
  error?: string;
}

interface PerformanceReport {
  period: {
    start: number;
    end: number;
    duration: number;
  };
  metrics: PerformanceMetrics;
  topKeys: {
    mostAccessed: Array<{ key: string; count: number }>;
    largestSize: Array<{ key: string; size: number }>;
    slowestResponse: Array<{ key: string; time: number }>;
  };
  recommendations: string[];
  healthScore: number;
}

export class CachePerformanceMonitor {
  private static instance: CachePerformanceMonitor;
  private operations: CacheOperation[] = [];
  private keyAccessCounts = new Map<string, number>();
  private keyResponseTimes = new Map<string, number[]>();
  private keyErrorCounts = new Map<string, number>();
  private monitoringStartTime = Date.now();
  private maxOperationsHistory = 10000;

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): CachePerformanceMonitor {
    if (!CachePerformanceMonitor.instance) {
      CachePerformanceMonitor.instance = new CachePerformanceMonitor();
    }
    return CachePerformanceMonitor.instance;
  }

  /**
   * 记录缓存操作
   */
  public recordOperation(operation: CacheOperation): void {
    // 添加操作记录
    this.operations.push(operation);

    // 更新访问计数
    const currentCount = this.keyAccessCounts.get(operation.key) || 0;
    this.keyAccessCounts.set(operation.key, currentCount + 1);

    // 记录响应时间
    if (operation.responseTime !== undefined) {
      const times = this.keyResponseTimes.get(operation.key) || [];
      times.push(operation.responseTime);

      // 只保留最近的100次记录
      if (times.length > 100) {
        times.shift();
      }

      this.keyResponseTimes.set(operation.key, times);
    }

    // 记录错误
    if (operation.error) {
      const errorCount = this.keyErrorCounts.get(operation.key) || 0;
      this.keyErrorCounts.set(operation.key, errorCount + 1);
    }

    // 限制历史记录大小
    if (this.operations.length > this.maxOperationsHistory) {
      this.operations = this.operations.slice(-this.maxOperationsHistory * 0.8);
    }
  }

  /**
   * 生成性能报告
   */
  public generateReport(periodMinutes: number = 60): PerformanceReport {
    const now = Date.now();
    const periodStart = now - (periodMinutes * 60 * 1000);

    // 过滤指定时间段的操作
    const periodOperations = this.operations.filter(
      op => op.timestamp >= periodStart
    );

    const metrics = this.calculateMetrics(periodOperations);
    const topKeys = this.analyzeTopKeys(periodOperations);
    const recommendations = this.generateRecommendations(metrics, topKeys);
    const healthScore = this.calculateHealthScore(metrics);

    return {
      period: {
        start: periodStart,
        end: now,
        duration: now - periodStart
      },
      metrics,
      topKeys,
      recommendations,
      healthScore
    };
  }

  /**
   * 获取实时性能指标
   */
  public getRealTimeMetrics(): PerformanceMetrics {
    const recentOperations = this.operations.slice(-1000); // 最近1000次操作
    return this.calculateMetrics(recentOperations);
  }

  /**
   * 监控缓存健康状态
   */
  public monitorHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    suggestions: string[];
  } {
    const metrics = this.getRealTimeMetrics();
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 检查命中率
    if (metrics.cacheHitRate < 0.5) {
      issues.push('缓存命中率过低');
      suggestions.push('考虑调整缓存策略或增加预加载');
    }

    // 检查内存使用
    if (metrics.memoryUsage > 0.8) {
      issues.push('内存使用率过高');
      suggestions.push('执行内存清理或调整缓存大小限制');
    }

    // 检查错误率
    if (metrics.errorRate > 0.1) {
      issues.push('缓存错误率过高');
      suggestions.push('检查缓存实现和错误处理逻辑');
    }

    // 检查响应时间
    if (metrics.averageResponseTime > 100) {
      issues.push('缓存响应时间过长');
      suggestions.push('优化缓存查找算法或减少缓存大小');
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 2) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return { status, issues, suggestions };
  }

  /**
   * 开始性能测试
   */
  public startPerformanceTest(testName: string): {
    end: () => PerformanceTestResult;
  } {
    const startTime = performance.now();
    const startOperationCount = this.operations.length;

    return {
      end: () => {
        const endTime = performance.now();
        const endOperationCount = this.operations.length;

        return {
          testName,
          duration: endTime - startTime,
          operationCount: endOperationCount - startOperationCount,
          operationsPerSecond: (endOperationCount - startOperationCount) / ((endTime - startTime) / 1000),
          averageOperationTime: (endTime - startTime) / (endOperationCount - startOperationCount)
        };
      }
    };
  }

  /**
   * 导出性能数据
   */
  public exportData(): {
    operations: CacheOperation[];
    keyStats: Array<{
      key: string;
      accessCount: number;
      averageResponseTime: number;
      errorCount: number;
    }>;
    summary: PerformanceMetrics;
  } {
    const keyStats = Array.from(this.keyAccessCounts.entries()).map(([key, accessCount]) => {
      const responseTimes = this.keyResponseTimes.get(key) || [];
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;
      const errorCount = this.keyErrorCounts.get(key) || 0;

      return {
        key,
        accessCount,
        averageResponseTime,
        errorCount
      };
    });

    return {
      operations: [...this.operations],
      keyStats,
      summary: this.getRealTimeMetrics()
    };
  }

  /**
   * 清理监控数据
   */
  public cleanup(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 保留24小时数据

    this.operations = this.operations.filter(op => op.timestamp > cutoffTime);

    // 清理访问计数（保留活跃的键）
    const activeKeys = new Set(
      this.operations.slice(-1000).map(op => op.key)
    );

    for (const [key] of this.keyAccessCounts.entries()) {
      if (!activeKeys.has(key)) {
        this.keyAccessCounts.delete(key);
        this.keyResponseTimes.delete(key);
        this.keyErrorCounts.delete(key);
      }
    }
  }

  /**
   * 初始化监控
   */
  private initializeMonitoring(): void {
    // 定期清理数据
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // 每小时清理一次

    // 监控内存使用
    setInterval(() => {
      const memoryStats = memoryOptimizer.getMemoryStats();
      if (memoryStats && memoryStats.memoryUsagePercentage > 0.9) {
        this.recordOperation({
          type: 'evict',
          key: 'memory_pressure',
          timestamp: Date.now(),
          error: 'High memory usage detected'
        });
      }
    }, 30 * 1000); // 每30秒检查一次
  }

  /**
   * 计算性能指标
   */
  private calculateMetrics(operations: CacheOperation[]): PerformanceMetrics {
    if (operations.length === 0) {
      return {
        cacheHitRate: 0,
        cacheMissRate: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        evictionRate: 0,
        errorRate: 0
      };
    }

    const hits = operations.filter(op => op.type === 'hit').length;
    const misses = operations.filter(op => op.type === 'miss').length;
    const evictions = operations.filter(op => op.type === 'evict').length;
    const errors = operations.filter(op => op.error).length;

    const totalRequests = hits + misses;
    const responseTimes = operations
      .filter(op => op.responseTime !== undefined)
      .map(op => op.responseTime!);

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // 获取内存使用情况
    const memoryStats = memoryOptimizer.getMemoryStats();
    const memoryUsage = memoryStats ? memoryStats.memoryUsagePercentage : 0;

    return {
      cacheHitRate: totalRequests > 0 ? hits / totalRequests : 0,
      cacheMissRate: totalRequests > 0 ? misses / totalRequests : 0,
      averageResponseTime,
      memoryUsage,
      evictionRate: operations.length > 0 ? evictions / operations.length : 0,
      errorRate: operations.length > 0 ? errors / operations.length : 0
    };
  }

  /**
   * 分析热点键
   */
  private analyzeTopKeys(operations: CacheOperation[]): PerformanceReport['topKeys'] {
    const keyStats = new Map<string, { count: number; totalTime: number; size: number }>();

    operations.forEach(op => {
      const stats = keyStats.get(op.key) || { count: 0, totalTime: 0, size: 0 };
      stats.count++;
      if (op.responseTime) stats.totalTime += op.responseTime;
      if (op.size) stats.size = Math.max(stats.size, op.size);
      keyStats.set(op.key, stats);
    });

    const entries = Array.from(keyStats.entries());

    return {
      mostAccessed: entries
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([key, stats]) => ({ key, count: stats.count })),

      largestSize: entries
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, 10)
        .map(([key, stats]) => ({ key, size: stats.size })),

      slowestResponse: entries
        .filter(([, stats]) => stats.count > 0)
        .sort((a, b) => (b[1].totalTime / b[1].count) - (a[1].totalTime / a[1].count))
        .slice(0, 10)
        .map(([key, stats]) => ({ key, time: stats.totalTime / stats.count }))
    };
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(metrics: PerformanceMetrics, topKeys: PerformanceReport['topKeys']): string[] {
    const recommendations: string[] = [];

    if (metrics.cacheHitRate < 0.6) {
      recommendations.push('缓存命中率较低，考虑增加预加载或调整缓存策略');
    }

    if (metrics.averageResponseTime > 50) {
      recommendations.push('缓存响应时间较长，考虑优化数据结构或减少缓存大小');
    }

    if (metrics.memoryUsage > 0.8) {
      recommendations.push('内存使用率过高，建议执行内存清理或调整缓存限制');
    }

    if (metrics.evictionRate > 0.1) {
      recommendations.push('缓存驱逐率过高，考虑增加缓存容量或优化LRU策略');
    }

    if (topKeys.slowestResponse.length > 0 && topKeys.slowestResponse[0].time > 100) {
      recommendations.push(`键 "${topKeys.slowestResponse[0].key}" 响应时间过长，需要优化`);
    }

    if (recommendations.length === 0) {
      recommendations.push('缓存性能良好，继续保持当前配置');
    }

    return recommendations;
  }

  /**
   * 计算健康分数
   */
  private calculateHealthScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // 命中率权重 40%
    score -= (1 - metrics.cacheHitRate) * 40;

    // 响应时间权重 25%
    if (metrics.averageResponseTime > 100) {
      score -= 25;
    } else if (metrics.averageResponseTime > 50) {
      score -= 15;
    }

    // 内存使用权重 20%
    if (metrics.memoryUsage > 0.9) {
      score -= 20;
    } else if (metrics.memoryUsage > 0.8) {
      score -= 10;
    }

    // 错误率权重 15%
    score -= metrics.errorRate * 15;

    return Math.max(0, Math.min(100, score));
  }
}

interface PerformanceTestResult {
  testName: string;
  duration: number;
  operationCount: number;
  operationsPerSecond: number;
  averageOperationTime: number;
}

// 导出单例实例
export const cachePerformanceMonitor = CachePerformanceMonitor.getInstance();
