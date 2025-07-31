/**
 * 客户端缓存管理器
 * 负责管理问题数据、翻译文件和其他资源的客户端缓存
 */

import { isClientSide, safeLocalStorage } from '@/utils/environment';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
  size: number;
}

interface CacheConfig {
  maxSize: number; // 最大缓存大小 (bytes)
  defaultTTL: number; // 默认过期时间 (ms)
  maxEntries: number; // 最大条目数
  compressionEnabled: boolean;
}

interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private accessTimes = new Map<string, number>();
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private readonly config: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    defaultTTL: 30 * 60 * 1000, // 30分钟
    maxEntries: 1000,
    compressionEnabled: true
  };

  private static instance: CacheManager;

  private constructor() {
    if (isClientSide()) {
      this.initializeCache();
      this.setupPeriodicCleanup();
    }
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * 初始化缓存系统
   */
  private initializeCache(): void {
    const storage = safeLocalStorage();
    if (!storage) {
      console.warn('CacheManager: localStorage not available, running in server environment');
      return;
    }

    // 从 localStorage 恢复缓存数据
    try {
      const savedCache = storage.getItem('assessment_cache_data');
      if (savedCache) {
        const cacheData = JSON.parse(savedCache);
        const now = Date.now();

        // 恢复未过期的缓存条目
        Object.entries(cacheData).forEach(([key, entry]: [string, any]) => {
          if (entry.expiresAt > now) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to restore cache from localStorage:', error);
      storage.removeItem('assessment_cache_data');
    }
  }

  /**
   * 设置定期清理任务
   */
  private setupPeriodicCleanup(): void {
    // 每5分钟清理一次过期缓存
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);

    // 页面卸载时保存缓存
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.persistCache();
      });
    }

    // 页面隐藏时保存缓存
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.persistCache();
        }
      });
    }
  }

  /**
   * 获取缓存数据
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    const now = Date.now();
    if (entry.expiresAt <= now) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.missCount++;
      return null;
    }

    // 更新访问时间
    this.accessTimes.set(key, now);
    this.hitCount++;

    return entry.data;
  }

  /**
   * 设置缓存数据
   */
  public set<T>(
    key: string,
    data: T,
    ttl: number = this.config.defaultTTL,
    version: string = '1.0'
  ): boolean {
    try {
      const now = Date.now();
      const serializedData = JSON.stringify(data);
      const size = new Blob([serializedData]).size;

      // 检查单个条目大小限制
      if (size > this.config.maxSize * 0.1) {
        console.warn(`Cache entry too large: ${key} (${size} bytes)`);
        return false;
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: now + ttl,
        version,
        size
      };

      // 确保有足够空间
      this.ensureSpace(size);

      this.cache.set(key, entry);
      this.accessTimes.set(key, now);

      return true;
    } catch (error) {
      console.error('Failed to set cache entry:', error);
      return false;
    }
  }

  /**
   * 删除缓存条目
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.accessTimes.delete(key);
    return deleted;
  }

  /**
   * 清空所有缓存
   */
  public clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;

    const storage = safeLocalStorage();
    if (storage) {
      storage.removeItem('assessment_cache_data');
    }
  }

  /**
   * 检查缓存是否存在且未过期
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存统计信息
   */
  public getStats(): CacheStats {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    const totalRequests = this.hitCount + this.missCount;

    return {
      totalSize,
      entryCount: this.cache.size,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      missRate: totalRequests > 0 ? this.missCount / totalRequests : 0,
      evictionCount: this.evictionCount
    };
  }

  /**
   * 确保有足够的缓存空间
   */
  private ensureSpace(requiredSize: number): void {
    const currentSize = this.getCurrentSize();

    if (currentSize + requiredSize <= this.config.maxSize &&
        this.cache.size < this.config.maxEntries) {
      return;
    }

    // 使用 LRU 策略清理缓存
    this.evictLRUEntries(requiredSize);
  }

  /**
   * 使用 LRU 策略清理缓存条目
   */
  private evictLRUEntries(requiredSize: number): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        lastAccess: this.accessTimes.get(key) || 0
      }))
      .sort((a, b) => a.lastAccess - b.lastAccess);

    let freedSize = 0;
    let evicted = 0;

    for (const { key, entry } of entries) {
      if (freedSize >= requiredSize && this.cache.size < this.config.maxEntries) {
        break;
      }

      this.cache.delete(key);
      this.accessTimes.delete(key);
      freedSize += entry.size;
      evicted++;
    }

    this.evictionCount += evicted;

    if (evicted > 0) {
      console.log(`Evicted ${evicted} cache entries, freed ${freedSize} bytes`);
    }
  }

  /**
   * 清理过期的缓存条目
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * 获取当前缓存总大小
   */
  private getCurrentSize(): number {
    return Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
  }

  /**
   * 持久化缓存到 localStorage
   */
  private persistCache(): void {
    const storage = safeLocalStorage();
    if (!storage) {
      return;
    }

    try {
      const cacheData: Record<string, CacheEntry<any>> = {};

      // 只保存未过期的条目
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt > now) {
          cacheData[key] = entry;
        }
      }

      storage.setItem('assessment_cache_data', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to persist cache to localStorage:', error);
      // 如果存储失败，可能是空间不足，清理一些缓存
      this.evictLRUEntries(this.getCurrentSize() * 0.3);
    }
  }

  /**
   * 预热缓存 - 预加载常用数据
   */
  public async warmup(keys: string[]): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.has(key)) {
        // 这里可以根据 key 的类型加载相应的数据
        // 例如问题数据、翻译文件等
        console.log(`Warming up cache for key: ${key}`);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 获取缓存键的建议
   */
  public static getCacheKey(type: string, id: string, version?: string, lang?: string): string {
    const parts = [type, id];
    if (version) parts.push(version);
    if (lang) parts.push(lang);
    return parts.join(':');
  }
}

// 导出单例实例
export const cacheManager = CacheManager.getInstance();
