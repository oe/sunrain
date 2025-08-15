import { memo, useCallback, useMemo } from 'react';
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

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  const typeOptions = useMemo(() => [
    { value: '', label: t('common.all') },
    { value: 'mental-health', label: t('assessments.categories.mentalHealth') },
    { value: 'personality', label: t('assessments.categories.personality') }
  ], [t]);

  const timeRangeOptions = useMemo(() => [
    { value: '', label: t('common.all') },
    { value: '7', label: t('history.filters.lastWeek') },
    { value: '30', label: t('history.filters.lastMonth') },
    { value: '90', label: t('history.filters.lastQuarter') }
  ], [t]);

  const riskLevelOptions = useMemo(() => [
    { value: '', label: t('common.all') },
    { value: 'low', label: t('common.riskLevels.low') },
    { value: 'medium', label: t('common.riskLevels.medium') },
    { value: 'high', label: t('common.riskLevels.high') }
  ], [t]);

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
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {riskLevelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
