import { memo, useEffect, useState } from 'react';
import { RenderProfiler } from '@/utils/RenderOptimizer';
import { memoryOptimizer } from '@/utils/MemoryOptimizer';
import { cachePerformanceMonitor } from '@/utils/CachePerformanceMonitor';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
}

interface PerformanceStats {
  renderStats: Record<string, any>;
  memoryStats: any;
  cacheStats: any;
}

export default memo(function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  showDetails = false
}: PerformanceMonitorProps) {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const updateStats = () => {
      const renderStats = RenderProfiler.getAllStats();
      const memoryStats = memoryOptimizer.getMemoryStats();
      const cacheStats = cachePerformanceMonitor.getRealTimeMetrics();

      setStats({
        renderStats,
        memoryStats,
        cacheStats
      });
    };

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    updateStats(); // Initial update

    return () => clearInterval(interval as NodeJS.Timeout);
  }, [enabled]);

  if (!enabled || !stats) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-mono hover:bg-gray-700 transition-colors"
        title="Performance Monitor"
      >
        📊 Perf
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Performance Stats</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Memory Stats */}
          {stats.memoryStats && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Memory</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{Math.round(stats.memoryStats.usedJSHeapSize / 1024 / 1024)}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className={`${stats.memoryStats.memoryUsagePercentage > 0.8 ? 'text-red-500' : 'text-green-500'}`}>
                    {Math.round(stats.memoryStats.memoryUsagePercentage * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cleanups:</span>
                  <span>{stats.memoryStats.cleanupCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cache Stats */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cache</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Hit Rate:</span>
                <span className={`${stats.cacheStats.cacheHitRate < 0.5 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.round(stats.cacheStats.cacheHitRate * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Response:</span>
                <span className={`${stats.cacheStats.averageResponseTime > 100 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.round(stats.cacheStats.averageResponseTime)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <span className={`${stats.cacheStats.errorRate > 0.1 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.round(stats.cacheStats.errorRate * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Render Stats */}
          {showDetails && Object.keys(stats.renderStats).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Render Stats</h4>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(stats.renderStats).map(([component, componentStats]) => (
                  <div key={component} className="flex justify-between">
                    <span className="truncate mr-2">{component}:</span>
                    <span>{Math.round((componentStats as any)?.average || 0)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => {
                RenderProfiler.clear();
                memoryOptimizer.cleanup();
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear Stats
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
