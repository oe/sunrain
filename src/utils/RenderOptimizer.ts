/**
 * 渲染性能优化工具
 * 提供React组件渲染优化的工具和策略
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * 防抖Hook - 优化频繁更新的状态
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流Hook - 限制函数调用频率
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// 移除了 useBatchedUpdates Hook - 过度复杂，React 18 的自动批处理已经足够

/**
 * 虚拟化列表Hook - 优化长列表渲染
 */
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
}

/**
 * 简化的性能监控Hook - 仅在开发环境使用
 */
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    // 仅在开发环境下输出基本信息
    if (process.env.NODE_ENV === 'development' && renderCount.current % 20 === 0) {
      console.log(`[${componentName}] Render count: ${renderCount.current}`);
    }
  });

  return {
    renderCount: renderCount.current
  };
}

/**
 * 智能memo比较函数生成器
 */
export function createMemoComparison<T extends Record<string, any>>(
  keys: (keyof T)[]
): (prevProps: T, nextProps: T) => boolean {
  return (prevProps: T, nextProps: T) => {
    for (const key of keys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  };
}

/**
 * 优化的列表渲染Hook - 避免不必要的重新渲染
 */
export function useOptimizedList<T extends { id: string }>(
  items: T[],
  dependencies: React.DependencyList = []
): T[] {
  return useMemo(() => items, [items, ...dependencies]);
}

/**
 * 稳定的回调函数Hook - 避免子组件不必要的重新渲染
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * 深度比较Hook - 避免不必要的依赖更新
 */
export function useDeepMemo<T>(value: T, deps: React.DependencyList): T {
  const ref = useRef<T>(value);
  const depsRef = useRef(deps);

  const hasChanged = useMemo(() => {
    if (depsRef.current.length !== deps.length) {
      return true;
    }

    return depsRef.current.some((dep, index) => {
      const newDep = deps[index];

      // 深度比较对象
      if (typeof dep === 'object' && typeof newDep === 'object') {
        return JSON.stringify(dep) !== JSON.stringify(newDep);
      }

      return dep !== newDep;
    });
  }, deps);

  if (hasChanged) {
    ref.current = value;
    depsRef.current = deps;
  }

  return ref.current;
}

/**
 * 异步状态管理Hook - 避免竞态条件
 */
export function useAsyncState<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList,
  initialValue?: T
) {
  const [state, setState] = useState<{
    data: T | undefined;
    loading: boolean;
    error: Error | null;
  }>({
    data: initialValue,
    loading: false,
    error: null
  });

  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    cancelRef.current = false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    asyncFunction()
      .then(data => {
        if (!cancelled && !cancelRef.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch(error => {
        if (!cancelled && !cancelRef.current) {
          setState(prev => ({ ...prev, loading: false, error }));
        }
      });

    return () => {
      cancelled = true;
      cancelRef.current = true;
    };
  }, deps);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return { ...state, cancel };
}

/**
 * 组件懒加载工具
 */
export function createLazyComponent<T extends (props: any) => any>(
  importFunction: () => Promise<{ default: T }>
) {
  // This function would need to be implemented in a React context
  // For now, we'll return a placeholder that can be used with React.lazy
  return importFunction;
}

/**
 * 渲染优化配置
 */
export interface RenderOptimizationConfig {
  enableVirtualization: boolean;
  batchUpdateDelay: number;
  debounceDelay: number;
  throttleDelay: number;
  maxRenderTime: number;
}

export const defaultRenderConfig: RenderOptimizationConfig = {
  enableVirtualization: true,
  batchUpdateDelay: 16, // 一帧的时间
  debounceDelay: 300,
  throttleDelay: 100,
  maxRenderTime: 16 // 60fps
};

/**
 * 渲染性能分析器
 */
export class RenderProfiler {
  private static measurements = new Map<string, number[]>();

  static startMeasurement(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const measurements = this.measurements.get(name) || [];
      measurements.push(duration);

      // 只保留最近100次测量
      if (measurements.length > 100) {
        measurements.shift();
      }

      this.measurements.set(name, measurements);
    };
  }

  static getStats(name: string) {
    const measurements = this.measurements.get(name) || [];

    if (measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, time) => sum + time, 0);
    const average = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      average,
      min,
      max,
      total
    };
  }

  static getAllStats() {
    const stats: Record<string, any> = {};

    for (const [name] of this.measurements.entries()) {
      stats[name] = this.getStats(name);
    }

    return stats;
  }

  static clear(name?: string) {
    if (name) {
      this.measurements.delete(name);
    } else {
      this.measurements.clear();
    }
  }
}

// React types for compatibility
declare namespace React {
  type DependencyList = ReadonlyArray<any>;
  interface UIEvent<T = Element> {
    currentTarget: T;
  }
}
