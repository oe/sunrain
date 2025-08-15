import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer';
import { questionBankManager } from '@/lib/assessment/QuestionBankManager';
import { BarChart3 } from 'lucide-react';
import AssessmentHistoryItem from './AssessmentHistoryItem';
import AssessmentStatistics from './AssessmentStatistics';
import AssessmentFilters from './AssessmentFilters';
import AssessmentPagination from './AssessmentPagination';

import type { AssessmentResult } from '@/types/assessment';



interface FilterState {
  type: string;
  timeRange: string;
  riskLevel: string;
}

function AssessmentHistoryClient() {
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteResultId, setDeleteResultId] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allResults, filters]);

  const loadResults = useCallback(async () => {
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
  }, []);

  const statistics = useMemo(() => {
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
  }, [allResults, t]);

  const applyFilters = useCallback(() => {
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
  }, [allResults, filters]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ type: '', timeRange: '', riskLevel: '' });
  }, []);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredResults.length);
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => Math.ceil(filteredResults.length / itemsPerPage), [filteredResults.length, itemsPerPage]);

  const handleViewDetails = useCallback((resultId: string) => {
    window.location.href = `/assessment/results/${resultId}/`;
  }, []);

  const handleShare = useCallback(async (resultId: string) => {
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
  }, [t]);

  const handleDelete = useCallback((resultId: string) => {
    setDeleteResultId(resultId);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteResultId) {
      const success = resultsAnalyzer.deleteResult(deleteResultId);
      if (success) {
        loadResults();
        setShowMessage({ text: t('common.success'), type: 'success' });
      } else {
        setShowMessage({ text: t('common.error'), type: 'error' });
      }
    }
    setShowDeleteModal(false);
    setDeleteResultId(null);
  }, [deleteResultId, t, loadResults]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setDeleteResultId(null);
  }, []);

  const handleExport = useCallback(() => {
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
  }, [t]);



  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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
      <AssessmentStatistics
        totalResults={statistics.totalResults}
        averageTime={statistics.averageTime}
        lastAssessment={statistics.lastAssessment}
      />

      {/* Filters */}
      <AssessmentFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
        onExport={handleExport}
      />

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
            {paginatedResults.map((result) => (
              <AssessmentHistoryItem
                key={result.id}
                result={result}
                onViewDetails={handleViewDetails}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          <AssessmentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={filteredResults.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <div className={`modal ${showDeleteModal ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {t('history.list.confirmDelete')}
          </h3>
          <p className="py-4">
            {t('history.list.deleteMessage')}
          </p>
          <div className="modal-action">
            <button
              onClick={confirmDelete}
              className="btn btn-error"
            >
              {t('common.delete')}
            </button>
            <button
              onClick={cancelDelete}
              className="btn btn-outline"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(AssessmentHistoryClient);
