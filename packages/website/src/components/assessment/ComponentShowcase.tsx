import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import ProgressBar from './ProgressBar';
import NavigationControls from './NavigationControls';
import { useTranslations } from '@/hooks/useTranslations';

export default function ComponentShowcase() {
  const { t } = useTranslations('assessment');
  const [currentDemo, setCurrentDemo] = useState<'loading' | 'error' | 'progress' | 'navigation'>('loading');
  const [progress, setProgress] = useState({ current: 2, total: 10, percentage: 30 });

  const handleRetry = () => {
    console.log('Retry clicked');
  };

  const handleGoBack = () => {
    console.log('Go back clicked');
  };

  const handlePrevious = () => {
    if (progress.current > 0) {
      const newCurrent = progress.current - 1;
      setProgress({
        current: newCurrent,
        total: progress.total,
        percentage: Math.round(((newCurrent + 1) / progress.total) * 100)
      });
    }
  };

  const handleNext = () => {
    if (progress.current < progress.total - 1) {
      const newCurrent = progress.current + 1;
      setProgress({
        current: newCurrent,
        total: progress.total,
        percentage: Math.round(((newCurrent + 1) / progress.total) * 100)
      });
    }
  };

  const handleSave = () => {
    console.log('Save clicked');
  };

  const handlePause = () => {
    console.log('Pause clicked');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          评估组件展示
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          展示新创建的进度条、导航控件、加载和错误状态组件
        </p>
      </div>

      {/* Demo selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'loading', label: '加载状态' },
          { key: 'error', label: '错误状态' },
          { key: 'progress', label: '进度条' },
          { key: 'navigation', label: '导航控件' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCurrentDemo(key as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentDemo === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Demo content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        {currentDemo === 'loading' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">加载状态组件</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">小尺寸加载器</h3>
                <LoadingSpinner size="small" message="正在加载数据..." t={t} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">中等尺寸加载器</h3>
                <LoadingSpinner size="medium" message="正在处理您的请求..." t={t} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">大尺寸加载器</h3>
                <LoadingSpinner size="large" message="正在初始化评测系统..." t={t} />
              </div>
            </div>
          </div>
        )}

        {currentDemo === 'error' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">错误状态组件</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">基本错误显示</h3>
                <ErrorDisplay
                  message="无法连接到服务器，请检查您的网络连接。"
                  onRetry={handleRetry}
                  t={t}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">带返回按钮的错误显示</h3>
                <ErrorDisplay
                  title="评测加载失败"
                  message="找不到指定的评测内容，可能已被删除或移动。"
                  onRetry={handleRetry}
                  onGoBack={handleGoBack}
                  showGoBack={true}
                  t={t}
                />
              </div>
            </div>
          </div>
        )}

        {currentDemo === 'progress' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">进度条组件</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">评测进度条</h3>
                <ProgressBar
                  current={progress.current}
                  total={progress.total}
                  percentage={progress.percentage}
                  assessmentName="心理健康评测"
                  timeSpent={125}
                  onPause={handlePause}
                  showPauseButton={true}
                  t={t}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setProgress({ current: 0, total: 10, percentage: 10 })}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  重置到开始
                </button>
                <button
                  onClick={() => setProgress({ current: 4, total: 10, percentage: 50 })}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  设置到50%
                </button>
                <button
                  onClick={() => setProgress({ current: 9, total: 10, percentage: 100 })}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  设置到完成
                </button>
              </div>
            </div>
          </div>
        )}

        {currentDemo === 'navigation' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">导航控件组件</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">评测导航控件</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded border">
                    <p className="text-gray-600 dark:text-gray-300">
                      当前问题 {progress.current + 1} / {progress.total}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      这里是问题内容的占位符...
                    </p>
                  </div>
                  <NavigationControls
                    canGoBack={progress.current > 0}
                    canGoNext={true}
                    isLastQuestion={progress.current === progress.total - 1}
                    isSubmitting={false}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSave={handleSave}
                    showSaveButton={true}
                    t={t}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">提交状态的导航控件</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <NavigationControls
                    canGoBack={true}
                    canGoNext={true}
                    isLastQuestion={true}
                    isSubmitting={true}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onSave={handleSave}
                    showSaveButton={true}
                    t={t}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
