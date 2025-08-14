import { memo } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';

interface AssessmentPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function AssessmentPagination({
  currentPage,
  totalPages,
  totalResults,
  itemsPerPage,
  onPageChange
}: AssessmentPaginationProps) {
  const { t } = useAssessmentTranslations();

  if (totalPages <= 1) {
    return null;
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalResults);

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-base-content/60">
        {t('common.showing')} {startIndex} {t('common.to')} {endIndex} {t('common.of')} {totalResults} {t('common.results')}
      </div>
      <div className="join">
        <button
          className="join-item btn btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t('common.previous')}
        </button>
        <button className="join-item btn btn-sm btn-active">
          {currentPage}
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}

export default memo(AssessmentPagination);
