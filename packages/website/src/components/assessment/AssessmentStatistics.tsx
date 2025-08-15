import { memo } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { AssessmentStatisticsProps } from '@/types/assessment';

function AssessmentStatistics({ totalResults, averageTime, lastAssessment }: AssessmentStatisticsProps) {
  const { t } = useAssessmentTranslations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="stat">
            <div className="stat-title">{t('history.stats.total')}</div>
            <div className="stat-value text-primary">{totalResults}</div>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="stat">
            <div className="stat-title">{t('history.stats.averageTime')}</div>
            <div className="stat-value text-secondary">{averageTime}{t('common.timeUnits.minutes')}</div>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="stat">
            <div className="stat-title">{t('history.stats.lastAssessment')}</div>
            <div className="stat-value text-accent">{lastAssessment}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(AssessmentStatistics);
