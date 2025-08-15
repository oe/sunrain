import { memo, useCallback, useMemo } from 'react';
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

  const { startIndex, endIndex } = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, totalResults);
    return { startIndex: start, endIndex: end };
  }, [currentPage, itemsPerPage, totalResults]);

  const handlePrevious = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-base-content/60">
        {t('common.showing')} {startIndex} {t('common.to')} {endIndex} {t('common.of')} {totalResults} {t('common.results')}
      </div>
      <div className="join">
        <button
          className="join-item btn btn-sm"
          disabled={currentPage === 1}
          onClick={handlePrevious}
        >
          {t('common.previous')}
        </button>
        <button className="join-item btn btn-sm btn-active">
          {currentPage}
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={currentPage === totalPages}
          onClick={handleNext}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}

export default memo(AssessmentPagination);
