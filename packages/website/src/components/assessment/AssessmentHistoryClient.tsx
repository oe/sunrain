import React, { useState, useEffect } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer';
import { questionBankManager } from '@/lib/assessment/QuestionBankManager';
import type { Language } from '@sunrain/shared';

interface AssessmentHistoryClientProps {
  initialLang: Language;
}

export default function AssessmentHistoryClient({ initialLang }: AssessmentHistoryClientProps) {
  const { t, isLoading: translationsLoading } = useAssessmentTranslations();
  const [allResults, setAllResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    initializeInterface();
  }, []);

  const initializeInterface = async () => {
    try {
      setIsLoading(true);
      // Load all results
      const results = resultsAnalyzer.getAllResults();
      setAllResults(results);
      setFilteredResults([...results]);
      setError(null);
    } catch (err) {
      console.error('Failed to load assessment history:', err);
      setError('Failed to load assessment history');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatistics = () => {
    const stats = resultsAnalyzer.getAssessmentStatistics();

    const totalElement = document.getElementById('total-assessments');
    const completedElement = document.getElementById('completed-assessments');
    const averageTimeElement = document.getElementById('average-time');
    const lastAssessmentElement = document.getElementById('last-assessment');

    if (totalElement) totalElement.textContent = String(stats.totalResults);
    if (completedElement) completedElement.textContent = String(stats.totalResults);
    if (averageTimeElement) {
      averageTimeElement.textContent = `${Math.round(stats.averageCompletionTime / 60)}${t('common.timeUnits.minutes')}`;
    }

    // Last assessment
    if (lastAssessmentElement && allResults.length > 0) {
      const lastResult = allResults.sort((a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0];
      const daysSince = Math.floor((Date.now() - new Date(lastResult.completedAt).getTime()) / (1000 * 60 * 60 * 24));
      lastAssessmentElement.textContent = daysSince === 0 ? t('history.list.today') : `${daysSince}${t('history.list.daysAgo')}`;
    }
  };

  const displayResults = () => {
    const container = document.getElementById('history-list');
    if (!container) return;

    container.innerHTML = '';

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredResults.length);
    const pageResults = filteredResults.slice(startIndex, endIndex);

    // Display results
    pageResults.forEach(result => {
      const resultDiv = createResultItem(result);
      container.appendChild(resultDiv);
    });

    // Update pagination
    updatePagination();
  };

  const createResultItem = (result: any) => {
    const assessmentType = questionBankManager.getAssessmentType(result.assessmentTypeId);
    const resultDiv = document.createElement('div');
    resultDiv.className = 'border-b border-gray-200 dark:border-gray-700 last:border-b-0';

    const riskLevelClass = getRiskLevelClass(result.riskLevel);
    const riskLevelText = getRiskLevelText(result.riskLevel);

    resultDiv.innerHTML = `
      <div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                ${assessmentType?.name || t('common.error')}
              </h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full ${riskLevelClass}">
                ${riskLevelText}
              </span>
            </div>
            <div class="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
                ${formatDate(result.completedAt)}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
                ${t('execution.timeSpent')} ${formatDuration(result.totalTimeSpent)}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                ${Object.keys(result.scores).length} ${t('history.list.dimensions')}
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button
              class="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              onclick="window.location.href='/assessment/results/${result.id}/'"
            >
              ${t('history.list.viewDetails')}
            </button>
            <button
              class="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
              onclick="window.shareResult('${result.id}')"
            >
              ${t('history.list.share')}
            </button>
            <button
              class="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              onclick="window.deleteResult('${result.id}')"
            >
              ${t('history.list.delete')}
            </button>
          </div>
        </div>

        <!-- Score Summary -->
        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          ${Object.entries(result.scores).slice(0, 4).map(([, scoreData]) => `
            <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-lg font-semibold ${getRiskLevelColor((scoreData as any).riskLevel)}">
                ${(scoreData as any).value}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                ${(scoreData as any).label}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    return resultDiv;
  };

  const getRiskLevelClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const updatePagination = () => {
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredResults.length);

    const pageStartElement = document.getElementById('page-start');
    const pageEndElement = document.getElementById('page-end');
    const totalResultsElement = document.getElementById('total-results');

    if (pageStartElement) pageStartElement.textContent = String(startIndex + 1);
    if (pageEndElement) pageEndElement.textContent = String(endIndex);
    if (totalResultsElement) totalResultsElement.textContent = String(filteredResults.length);

    const prevBtn = document.getElementById('prev-page-btn') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page-btn') as HTMLButtonElement;

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  };

  const applyFilters = () => {
    const typeFilter = (document.getElementById('assessment-type-filter') as HTMLSelectElement)?.value;
    const timeFilter = (document.getElementById('time-range-filter') as HTMLSelectElement)?.value;
    const riskFilter = (document.getElementById('risk-level-filter') as HTMLSelectElement)?.value;

    const filtered = allResults.filter(result => {
      // Type filter
      if (typeFilter) {
        const assessmentType = questionBankManager.getAssessmentType(result.assessmentTypeId);
        if (!assessmentType || assessmentType.category !== typeFilter) {
          return false;
        }
      }

      // Time filter
      if (timeFilter) {
        const daysSince = (Date.now() - new Date(result.completedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > parseInt(timeFilter)) {
          return false;
        }
      }

      // Risk filter
      if (riskFilter && result.riskLevel !== riskFilter) {
        return false;
      }

      return true;
    });

    setFilteredResults(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    const typeFilter = document.getElementById('assessment-type-filter') as HTMLSelectElement;
    const timeFilter = document.getElementById('time-range-filter') as HTMLSelectElement;
    const riskFilter = document.getElementById('risk-level-filter') as HTMLSelectElement;

    if (typeFilter) typeFilter.value = '';
    if (timeFilter) timeFilter.value = '';
    if (riskFilter) riskFilter.value = '';

    setFilteredResults([...allResults]);
    setCurrentPage(1);
  };

  const shareResult = (resultId: string) => {
    const url = `${window.location.origin}/assessment/results/${resultId}`;

    if (navigator.share) {
      navigator.share({
        title: t('results.actions.share'),
        text: t('results.actions.share'),
        url: url
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showMessage(t('common.success'), 'success');
      });
    }
  };

  const deleteResult = (resultId: string) => {
    if (confirm(t('history.list.delete'))) {
      const success = resultsAnalyzer.deleteResult(resultId);
      if (success) {
        // Refresh the data
        const results = resultsAnalyzer.getAllResults();
        setAllResults(results);
        applyFilters();
        updateStatistics();

        // Show success message
        showMessage(t('common.success'), 'success');
      } else {
        showMessage(t('common.error'), 'error');
      }
    }
  };

  const exportData = () => {
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

      showMessage(t('common.success'), 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showMessage(t('common.error'), 'error');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(initialLang === 'zh' ? 'zh-CN' : 'en-US', {
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

  const showMessage = (message: string, type: string = 'info') => {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
      type === 'success' ? 'bg-green-600 text-white' :
      type === 'error' ? 'bg-red-600 text-white' :
      'bg-blue-600 text-white'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const showError = () => {
    const container = document.getElementById('history-list');
    if (!container) return;

    container.innerHTML = `
      <div class="p-8 text-center">
        <svg class="w-12 h-12 text-red-400 dark:text-red-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">${t('common.error')}</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">${t('common.error')}</p>
        <button onclick="window.location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          ${t('common.refresh')}
        </button>
      </div>
    `;
    container.classList.remove('hidden');
  };

  // Setup event listeners and global methods
  useEffect(() => {
    if (isLoading || translationsLoading) return;

    // Update statistics
    updateStatistics();

    // Display results
    displayResults();

    // Setup event listeners
    const typeFilter = document.getElementById('assessment-type-filter');
    const timeFilter = document.getElementById('time-range-filter');
    const riskFilter = document.getElementById('risk-level-filter');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const exportBtn = document.getElementById('export-btn');

    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (timeFilter) timeFilter.addEventListener('change', applyFilters);
    if (riskFilter) riskFilter.addEventListener('change', applyFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);

    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
        if (currentPage < totalPages) {
          setCurrentPage(currentPage + 1);
        }
      });
    }

    if (exportBtn) exportBtn.addEventListener('click', exportData);

    // Global methods for inline event handlers
    (window as any).shareResult = shareResult;
    (window as any).deleteResult = deleteResult;

    // Hide loading and show appropriate content
    const loadingElement = document.getElementById('history-loading');
    const emptyElement = document.getElementById('history-empty');
    const listElement = document.getElementById('history-list');
    const paginationElement = document.getElementById('pagination');

    if (loadingElement) loadingElement.classList.add('hidden');

    if (allResults.length === 0) {
      if (emptyElement) emptyElement.classList.remove('hidden');
    } else {
      if (listElement) listElement.classList.remove('hidden');
      if (paginationElement) paginationElement.classList.remove('hidden');
    }

    if (error) {
      showError();
    }

    // Cleanup function
    return () => {
      if (typeFilter) typeFilter.removeEventListener('change', applyFilters);
      if (timeFilter) timeFilter.removeEventListener('change', applyFilters);
      if (riskFilter) riskFilter.removeEventListener('change', applyFilters);
      if (clearFiltersBtn) clearFiltersBtn.removeEventListener('click', clearFilters);
      if (exportBtn) exportBtn.removeEventListener('click', exportData);
    };
  }, [isLoading, translationsLoading, allResults, filteredResults, currentPage, error]);

  // This component doesn't render anything visible - it just manages the client-side functionality
  return null;
}
