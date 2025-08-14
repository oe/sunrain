import { memo } from 'react';
import { Download, X } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';

interface FilterState {
  type: string;
  timeRange: string;
  riskLevel: string;
}

interface AssessmentFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  onExport: () => void;
}

function AssessmentFilters({ filters, onFiltersChange, onClearFilters, onExport }: AssessmentFiltersProps) {
  const { t } = useAssessmentTranslations();

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
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
              onChange={(e) => handleFilterChange('type', e.target.value)}
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
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
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
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            >
              <option value="">{t('common.all')}</option>
              <option value="low">{t('common.riskLevels.low')}</option>
              <option value="medium">{t('common.riskLevels.medium')}</option>
              <option value="high">{t('common.riskLevels.high')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={onClearFilters}>
              <X className="w-4 h-4" />
              {t('common.clear')}
            </button>
            <button className="btn btn-primary btn-sm" onClick={onExport}>
              <Download className="w-4 h-4" />
              {t('common.export')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(AssessmentFilters);
