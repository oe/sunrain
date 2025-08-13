import { useState, useEffect } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import { getDateLocale } from '@/utils/language';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer';
import { questionBankManager } from '@/lib/assessment/QuestionBankManager';
import { Calendar, Clock, BarChart3, Eye, Share2, Trash2, Download, X } from 'lucide-react';

import type { AssessmentResult } from '@/types/assessment';



interface FilterState {
  type: string;
  timeRange: string;
  riskLevel: string;
}

export default function AssessmentHistoryClient() {
  const { t, isLoading: translationsLoading } = useAssessmentTranslations();
  const [allResults, setAllResults] = useState<AssessmentResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<AssessmentResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    timeRange: '',
    riskLevel: ''
  });
  const [showMessage, setShowMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allResults, filters]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const results = resultsAnalyzer.getAllResults();
      setAllResults(results);
      setError(null);
    } catch (err) {
      console.error('Failed to load assessment history:', err);
      setError('Failed to load assessment history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatistics = () => {
    const stats = resultsAnalyzer.getAssessmentStatistics();
    const lastResult = allResults.length > 0
      ? allResults.sort((a, b) => {
          const dateA = a.completedAt instanceof Date ? a.completedAt : new Date(a.completedAt);
          const dateB = b.completedAt instanceof Date ? b.completedAt : new Date(b.completedAt);
          return dateB.getTime() - dateA.getTime();
        })[0]
      : null;

    const daysSince = lastResult
      ? Math.floor((Date.now() - (lastResult.completedAt instanceof Date ? lastResult.completedAt : new Date(lastResult.completedAt)).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      totalResults: stats.totalResults,
      averageTime: Math.round(stats.averageCompletionTime / 60),
      lastAssessment: lastResult ? (daysSince === 0 ? t('history.list.today') : `${daysSince}${t('history.list.daysAgo')}`) : '-'
    };
  };

  const applyFilters = () => {
    const filtered = allResults.filter(result => {
      // Type filter
      if (filters.type) {
        const assessmentType = questionBankManager.getAssessmentType(result.assessmentTypeId);
        if (!assessmentType || assessmentType.category !== filters.type) {
          return false;
        }
      }

      // Time filter
      if (filters.timeRange) {
        const completedDate = result.completedAt instanceof Date ? result.completedAt : new Date(result.completedAt);
        const daysSince = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > parseInt(filters.timeRange)) {
          return false;
        }
      }

      // Risk filter
      if (filters.riskLevel && result.riskLevel !== filters.riskLevel) {
        return false;
      }

      return true;
    });

    setFilteredResults(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ type: '', timeRange: '', riskLevel: '' });
  };

  const getPaginatedResults = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredResults.length);
    return filteredResults.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const handleViewDetails = (resultId: string) => {
    window.location.href = `/assessment/results/${resultId}/`;
  };

  const handleShare = async (resultId: string) => {
    const url = `${window.location.origin}/assessment/results/${resultId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: t('results.actions.share'),
          text: t('results.actions.share'),
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShowMessage({ text: t('common.success'), type: 'success' });
      }
    } catch (error) {
      console.error('Share failed:', error);
      setShowMessage({ text: t('common.error'), type: 'error' });
    }
  };

  const handleDelete = (resultId: string) => {
    if (confirm(t('history.list.delete'))) {
      const success = resultsAnalyzer.deleteResult(resultId);
      if (success) {
        loadResults();
        setShowMessage({ text: t('common.success'), type: 'success' });
      } else {
        setShowMessage({ text: t('common.error'), type: 'error' });
      }
    }
  };

  const handleExport = () => {
    try {
      const data = resultsAnalyzer.exportResults();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowMessage({ text: t('common.success'), type: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      setShowMessage({ text: t('common.error'), type: 'error' });
    }
  };

  const getRiskLevelClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'badge-error';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return t('common.riskLevels.high');
      case 'medium': return t('common.riskLevels.medium');
      case 'low': return t('common.riskLevels.low');
      default: return t('common.error');
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-neutral';
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(getDateLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}${t('common.timeUnits.minutes')}${remainingSeconds}${t('common.timeUnits.seconds')}`;
    }
    return `${remainingSeconds}${t('common.timeUnits.seconds')}`;
  };

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  if (translationsLoading || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div>
          <h3 className="font-bold">{t('common.error')}</h3>
          <div className="text-xs">{error}</div>
        </div>
        <div>
          <button className="btn btn-sm" onClick={loadResults}>
            {t('common.refresh')}
          </button>
        </div>
      </div>
    );
  }

  const statistics = getStatistics();
  const paginatedResults = getPaginatedResults();
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, filteredResults.length);

  return (
    <div className="space-y-6">
      {/* Toast Message */}
      {showMessage && (
        <div className="toast toast-top toast-end">
          <div className={`alert ${showMessage.type === 'success' ? 'alert-success' : showMessage.type === 'error' ? 'alert-error' : 'alert-info'}`}>
            <span>{showMessage.text}</span>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">{t('history.stats.total')}</div>
              <div className="stat-value text-primary">{statistics.totalResults}</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">{t('history.stats.averageTime')}</div>
              <div className="stat-value text-secondary">{statistics.averageTime}{t('common.timeUnits.minutes')}</div>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">{t('history.stats.lastAssessment')}</div>
              <div className="stat-value text-accent">{statistics.lastAssessment}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('history.filters.type')}</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">{t('common.all')}</option>
                <option value="mental-health">{t('assessments.categories.mentalHealth')}</option>
                <option value="personality">{t('assessments.categories.personality')}</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('history.filters.timeRange')}</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              >
                <option value="">{t('common.all')}</option>
                <option value="7">{t('history.filters.lastWeek')}</option>
                <option value="30">{t('history.filters.lastMonth')}</option>
                <option value="90">{t('history.filters.lastQuarter')}</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('history.filters.riskLevel')}</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.riskLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
              >
                <option value="">{t('common.all')}</option>
                <option value="low">{t('common.riskLevels.low')}</option>
                <option value="medium">{t('common.riskLevels.medium')}</option>
                <option value="high">{t('common.riskLevels.high')}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                <X className="w-4 h-4" />
                {t('common.clear')}
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleExport}>
                <Download className="w-4 h-4" />
                {t('common.export')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results List */}
      {allResults.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-base-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('history.empty.title')}</h3>
            <p className="text-base-content/60">{t('history.empty.message')}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedResults.map((result) => {
              const assessmentType = questionBankManager.getAssessmentType(result.assessmentTypeId);
              return (
                <div key={result.id} className="card bg-base-100 shadow-sm">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">
                            {assessmentType?.name || t('common.error')}
                          </h3>
                          <div className={`badge ${getRiskLevelClass(result.riskLevel)}`}>
                            {getRiskLevelText(result.riskLevel)}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-base-content/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(result.completedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {t('execution.timeSpent')} {formatDuration(result.totalTimeSpent)}
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {Object.keys(result.scores).length} {t('history.list.dimensions')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleViewDetails(result.id)}
                        >
                          <Eye className="w-4 h-4" />
                          {t('history.list.viewDetails')}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleShare(result.id)}
                        >
                          <Share2 className="w-4 h-4" />
                          {t('history.list.share')}
                        </button>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => handleDelete(result.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('history.list.delete')}
                        </button>
                      </div>
                    </div>

                    {/* Score Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {Object.entries(result.scores).slice(0, 4).map(([key, scoreData]: [string, any]) => (
                        <div key={key} className="stat bg-base-200 rounded-lg">
                          <div className={`stat-value text-sm ${getRiskLevelColor(scoreData.riskLevel)}`}>
                            {scoreData.value}
                          </div>
                          <div className="stat-desc text-xs">
                            {scoreData.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-base-content/60">
                {t('common.showing')} {startIndex} {t('common.to')} {endIndex} {t('common.of')} {filteredResults.length} {t('common.results')}
              </div>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  {t('common.previous')}
                </button>
                <button className="join-item btn btn-sm btn-active">
                  {currentPage}
                </button>
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  {t('common.next')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
