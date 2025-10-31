import { memo, useCallback } from 'react';
import { Calendar, Clock, BarChart3, Eye, Share2, Trash2 } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import { getDateLocale } from '@/utils/language';
import { questionBankAdapter } from '@/lib/assessment/QuestionBankAdapter';
import type { AssessmentResult } from '@/types/assessment';

interface AssessmentHistoryItemProps {
  result: AssessmentResult;
  onViewDetails: (resultId: string) => void;
  onShare: (resultId: string) => void;
  onDelete: (resultId: string) => void;
}

function AssessmentHistoryItem({ result, onViewDetails, onShare, onDelete }: AssessmentHistoryItemProps) {
  const { t } = useAssessmentTranslations();

  const getRiskLevelClass = useCallback((riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'badge-error';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-success';
      default: return 'badge-neutral';
    }
  }, []);

  const getRiskLevelText = useCallback((riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return t('common.riskLevels.high');
      case 'medium': return t('common.riskLevels.medium');
      case 'low': return t('common.riskLevels.low');
      default: return t('common.error');
    }
  }, [t]);

  const getRiskLevelColor = useCallback((riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-neutral';
    }
  }, []);

  const formatDate = useCallback((date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(getDateLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}${t('common.timeUnits.minutes')}${remainingSeconds}${t('common.timeUnits.seconds')}`;
    }
    return `${remainingSeconds}${t('common.timeUnits.seconds')}`;
  }, [t]);

  const assessmentType = questionBankAdapter.getAssessmentType(result.assessmentTypeId);

  return (
    <div className="card bg-base-100 shadow-sm">
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
              onClick={() => onViewDetails(result.id)}
            >
              <Eye className="w-4 h-4" />
              {t('history.list.viewDetails')}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onShare(result.id)}
            >
              <Share2 className="w-4 h-4" />
              {t('history.list.share')}
            </button>
            <button
              className="btn btn-error btn-sm"
              onClick={() => onDelete(result.id)}
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
}

export default memo(AssessmentHistoryItem);
