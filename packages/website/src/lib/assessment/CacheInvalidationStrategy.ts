/**
 * 缓存失效策略管理器
 * 负责管理缓存的更新、失效和一致性
 */

import { cacheManager } from './CacheManager';
import { questionCache } from './QuestionCache';
import { translationCache } from '@/utils/TranslationCache';
import { assessmentLogger } from './AssessmentLogger';

interface InvalidationRule {
  pattern: RegExp;
  dependencies: string[];
  ttl?: number;
}

interface CacheVersion {
  version: string;
  timestamp: number;
  checksum?: string;
}

export class CacheInvalidationStrategy {
  private static instance: CacheInvalidationStrategy;
  private versionMap = new Map<string, CacheVersion>();
  private invalidationRules: InvalidationRule[] = [];

  private constructor() {
    this.initializeInvalidationRules();
    this.loadVersionMap();
  }

  public static getInstance(): CacheInvalidationStrategy {
    if (!CacheInvalidationStrategy.instance) {
      CacheInvalidationStrategy.instance = new CacheInvalidationStrategy();
    }
    return CacheInvalidationStrategy.instance;
  }

  /**
   * 初始化失效规则
   */
  private initializeInvalidationRules(): void {
    this.invalidationRules = [
      // 问题数据更新时，失效相关的评测类型缓存
      {
        pattern: /^question:/,
        dependencies: ['assessment_type:', 'question_bank:'],
        ttl: 60 * 60 * 1000 // 1小时
      },

      // 评测类型更新时，失效相关问题缓存
      {
        pattern: /^assessment_type:/,
        dependencies: ['question:', 'question_bank:'],
        ttl: 24 * 60 * 60 * 1000 // 24小时
      },

      // 翻译文件更新时，失效相关语言缓存
      {
        pattern: /^translation:/,
        dependencies: ['translation_fragment:'],
        ttl: 24 * 60 * 60 * 1000 // 24小时
      },

      // 会话数据更新时，失效相关问题缓存
      {
        pattern: /^session_questions:/,
        dependencies: ['question:'],
        ttl: 30 * 60 * 1000 // 30分钟
      }
    ];
  }

  /**
   * 检查缓存是否需要失效
   */
  public shouldInvalidate(key: string, currentVersion?: string): boolean {
    const cachedVersion = this.versionMap.get(key);

    if (!cachedVersion) {
      return true; // 没有版本信息，需要更新
    }

    // 检查版本是否匹配
    if (currentVersion && cachedVersion.version !== currentVersion) {
      return true;
    }

    // 检查是否过期
    const now = Date.now();
    const rule = this.findMatchingRule(key);
    const ttl = rule?.ttl || 60 * 60 * 1000; // 默认1小时

    return now - cachedVersion.timestamp > ttl;
  }

  /**
   * 更新缓存版本信息
   */
  public updateVersion(key: string, version: string, checksum?: string): void {
    this.versionMap.set(key, {
      version,
      timestamp: Date.now(),
      checksum
    });

    this.saveVersionMap();
  }

  /**
   * 失效指定键的缓存
   */
  public invalidate(key: string): void {
    try {
      // 删除主缓存
      cacheManager.delete(key);

      // 删除版本信息
      this.versionMap.delete(key);

      // 根据规则失效依赖缓存
      this.invalidateDependencies(key);

      assessmentLogger.info('CACHE', 'Cache invalidated', { key });
    } catch (error) {
      assessmentLogger.error('CACHE', `Failed to invalidate cache: ${key}`, error);
    }
  }

  /**
   * 批量失效缓存
   */
  public invalidatePattern(pattern: RegExp): void {
    try {
      const stats = cacheManager.getStats();
      let invalidatedCount = 0;

      // 这里需要遍历所有缓存键，实际实现中可能需要维护键的索引
      // 暂时记录失效模式
      assessmentLogger.info('CACHE', 'Pattern invalidation requested', {
        pattern: pattern.source,
        totalEntries: stats.entryCount
      });

      // 清理版本映射中匹配的条目
      for (const [key] of this.versionMap.entries()) {
        if (pattern.test(key)) {
          this.versionMap.delete(key);
          invalidatedCount++;
        }
      }

      if (invalidatedCount > 0) {
        this.saveVersionMap();
        assessmentLogger.info('CACHE', 'Pattern invalidation completed', {
          pattern: pattern.source,
          invalidatedCount
        });
      }
    } catch (error) {
      assessmentLogger.error('CACHE', `Failed to invalidate pattern: ${pattern.source}`, error);
    }
  }

  /**
   * 智能失效 - 基于使用频率和重要性
   */
  public smartInvalidation(): void {
    try {
      const now = Date.now();
      const lowPriorityThreshold = 7 * 24 * 60 * 60 * 1000; // 7天
      const mediumPriorityThreshold = 24 * 60 * 60 * 1000; // 1天

      const toInvalidate: string[] = [];

      for (const [key, version] of this.versionMap.entries()) {
        const age = now - version.timestamp;

        // 根据键的类型确定优先级
        if (this.isLowPriority(key) && age > lowPriorityThreshold) {
          toInvalidate.push(key);
        } else if (this.isMediumPriority(key) && age > mediumPriorityThreshold) {
          toInvalidate.push(key);
        }
      }

      // 批量失效
      toInvalidate.forEach(key => this.invalidate(key));

      if (toInvalidate.length > 0) {
        assessmentLogger.info('CACHE', 'Smart invalidation completed', {
          invalidatedCount: toInvalidate.length
        });
      }
    } catch (error) {
      assessmentLogger.error('CACHE', 'Smart invalidation failed', error);
    }
  }

  /**
   * 预热缓存 - 预加载重要数据
   */
  public async warmupCache(): Promise<void> {
    try {
      const criticalKeys = [
        'assessment_type:anxiety:zh',
        'assessment_type:depression:zh',
        'translation:shared:zh',
        'translation:assessment:zh'
      ];

      const warmupPromises = criticalKeys.map(async (key) => {
        if (this.shouldInvalidate(key)) {
          // 这里应该调用相应的数据加载逻辑
          assessmentLogger.info('CACHE', 'Warming up cache', { key });
        }
      });

      await Promise.allSettled(warmupPromises);
      assessmentLogger.info('CACHE', 'Cache warmup completed');
    } catch (error) {
      assessmentLogger.error('CACHE', 'Cache warmup failed', error);
    }
  }

  /**
   * 获取缓存健康状态
   */
  public getHealthStatus(): {
    totalVersions: number;
    expiredVersions: number;
    healthScore: number;
    recommendations: string[];
  } {
    const now = Date.now();
    const totalVersions = this.versionMap.size;
    let expiredVersions = 0;

    for (const [key, version] of this.versionMap.entries()) {
      if (this.shouldInvalidate(key)) {
        expiredVersions++;
      }
    }

    const healthScore = totalVersions > 0 ?
      ((totalVersions - expiredVersions) / totalVersions) * 100 : 100;

    const recommendations: string[] = [];

    if (healthScore < 70) {
      recommendations.push('考虑执行智能失效清理过期缓存');
    }

    if (expiredVersions > 50) {
      recommendations.push('缓存过期条目过多，建议增加清理频率');
    }

    if (totalVersions > 1000) {
      recommendations.push('缓存条目过多，考虑优化缓存策略');
    }

    return {
      totalVersions,
      expiredVersions,
      healthScore,
      recommendations
    };
  }

  /**
   * 失效依赖缓存
   */
  private invalidateDependencies(key: string): void {
    const rule = this.findMatchingRule(key);
    if (!rule || !rule.dependencies) return;

    rule.dependencies.forEach(depPattern => {
      // 这里需要找到所有匹配依赖模式的键
      // 实际实现中可能需要维护更复杂的索引结构
      assessmentLogger.info('CACHE', 'Invalidating dependency', {
        originalKey: key,
        dependencyPattern: depPattern
      });
    });
  }

  /**
   * 查找匹配的失效规则
   */
  private findMatchingRule(key: string): InvalidationRule | null {
    return this.invalidationRules.find(rule => rule.pattern.test(key)) || null;
  }

  /**
   * 判断是否为低优先级缓存
   */
  private isLowPriority(key: string): boolean {
    return key.includes('translation_fragment') ||
           key.includes('session_questions');
  }

  /**
   * 判断是否为中等优先级缓存
   */
  private isMediumPriority(key: string): boolean {
    return key.includes('question:') ||
           key.includes('translation:');
  }

  /**
   * 加载版本映射
   */
  private loadVersionMap(): void {
    try {
      const saved = localStorage.getItem('cache_version_map');
      if (saved) {
        const data = JSON.parse(saved);
        this.versionMap = new Map(Object.entries(data));
      }
    } catch (error) {
      assessmentLogger.warn('CACHE', 'Failed to load version map', error);
      this.versionMap.clear();
    }
  }

  /**
   * 保存版本映射
   */
  private saveVersionMap(): void {
    try {
      const data = Object.fromEntries(this.versionMap);
      localStorage.setItem('cache_version_map', JSON.stringify(data));
    } catch (error) {
      assessmentLogger.warn('CACHE', 'Failed to save version map', error);
    }
  }
}

// 导出单例实例
export const cacheInvalidationStrategy = CacheInvalidationStrategy.getInstance();
