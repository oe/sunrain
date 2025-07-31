import React, { useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * 防抖Hook
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number | undefined>(undefined);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * 节流Hook
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<number | undefined>(undefined);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;

    if (timeSinceLastCall >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  }, [callback, delay]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * 空闲时间执行Hook
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let handle: any;

    if ('requestIdleCallback' in window) {
      handle = (window as any).requestIdleCallback(callback, { timeout: 5000 });
    } else {
      handle = setTimeout(callback, 0);
    }

    return () => {
      if ('cancelIdleCallback' in window && handle) {
        (window as any).cancelIdleCallback(handle);
      } else if (handle) {
        clearTimeout(handle);
      }
    };
  }, deps);
}

/**
 * 内存使用监控Hook
 */
export function useMemoryMonitor(): {
  memoryInfo: any | null;
  isMemoryPressure: boolean;
} {
  const memoryInfo = useMemo(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const perf = window.performance as any;
    return perf.memory || null;
  }, []);

  const isMemoryPressure = useMemo(() => {
    if (!memoryInfo) return false;

    const usageRatio = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
    return usageRatio > 0.8; // 超过80%认为是内存压力
  }, [memoryInfo]);

  return { memoryInfo, isMemoryPressure };
}

/**
 * 网络状态监控Hook
 */
export function useNetworkStatus(): {
  isOnline: boolean;
  connectionType: string | null;
  isSlowConnection: boolean;
} {
  const [networkStatus, setNetworkStatus] = React.useState<{
    online: boolean;
    effectiveType: string;
    downlink: number;
    rtt: number;
  }>(() => {
    if (typeof window === 'undefined') {
      return {
        online: true,
        effectiveType: '4g',
        downlink: 10,
        rtt: 100
      };
    }

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 100
      });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);

      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return {
    isOnline: networkStatus.online,
    connectionType: networkStatus.effectiveType,
    isSlowConnection: networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g'
  };
}

/**
 * 性能指标收集Hook
 */
export function usePerformanceMetrics(): {
  recordMetric: (name: string, value: number, unit?: string) => void;
  getMetrics: () => Record<string, { value: number; unit: string; timestamp: number }>;
  clearMetrics: () => void;
} {
  const metricsRef = useRef<Record<string, { value: number; unit: string; timestamp: number }>>({});

  const recordMetric = useCallback((name: string, value: number, unit: string = 'ms') => {
    metricsRef.current[name] = {
      value,
      unit,
      timestamp: Date.now()
    };

    // 如果有性能API，也记录到那里
    if (typeof window !== 'undefined' && 'performance' in window && 'mark' in window.performance) {
      try {
        window.performance.mark(`assessment-${name}-${value}`);
      } catch (error) {
        // 忽略性能API错误
      }
    }
  }, []);

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = {};
  }, []);

  return { recordMetric, getMetrics, clearMetrics };
}

/**
 * 组件渲染性能监控Hook
 */
export function useRenderPerformance(componentName: string): void {
  const renderStartRef = useRef<number | undefined>(undefined);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;

      // 记录渲染时间
      if (renderTime > 16) { // 超过一帧的时间
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCountRef.current})`);
      }

      // 记录到性能API
      if (typeof window !== 'undefined' && 'performance' in window && 'mark' in window.performance) {
        try {
          window.performance.mark(`${componentName}-render-${renderCountRef.current}-${renderTime.toFixed(2)}ms`);
        } catch (error) {
          // 忽略性能API错误
        }
      }
    }
  });
}

/**
 * 虚拟化列表Hook（用于大量数据的优化显示）
 */
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
): {
  visibleItems: Array<{ item: T; index: number }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  onScroll: (scrollTop: number) => void;
} {
  const [scrollTop, setScrollTop] = React.useState<number>(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        result.push({ item: items[i], index: i });
      }
    }
    return result;
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;

  const scrollToIndex = useCallback((index: number) => {
    const scrollTop = index * itemHeight;
    setScrollTop(scrollTop);
  }, [itemHeight]);

  const onScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    scrollToIndex,
    onScroll
  };
}
