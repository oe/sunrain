import { useState } from 'react';
import { Info, X, Shield, CheckCircle } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { AssessmentType } from '@/types/assessment';

interface QuestionnaireInfoButtonProps {
  assessment: AssessmentType;
  buttonText: string;
  language: string;
  onStartAssessment?: (assessmentId: string) => void;
}

export default function QuestionnaireInfoButton({
  assessment,
  buttonText,
  language,
  onStartAssessment
}: QuestionnaireInfoButtonProps) {
  const { t } = useAssessmentTranslations(language as any);
  const [showModal, setShowModal] = useState(false);

  const handleStartAssessment = () => {
    setShowModal(false);
    if (onStartAssessment) {
      onStartAssessment(assessment.id);
    } else {
      // Fallback to direct navigation
      window.location.href = `/assessment/take/${assessment.id}/`;
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setShowModal(false);
    }
  };

  // Handle escape key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Info Button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full inline-flex items-center justify-center px-6 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium"
      >
        <Info className="w-5 h-5 mr-2" />
        {buttonText}
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {assessment.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('questionnaireInfo.mentalHealthAssessment')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label={t('common.close')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {assessment.questions.length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {t('questionnaireInfo.questions')}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {assessment.duration}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    {t('questionnaireInfo.minutes')}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                    {t('questionnaireInfo.difficulty.beginner')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {t('questionnaireInfo.description')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {assessment.description}
                </p>
              </div>

              {/* Purpose */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {t('questionnaireInfo.purpose')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('questionnaireInfo.purposeDescription')}
                </p>
              </div>

              {/* What to Expect */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {t('questionnaireInfo.whatToExpect')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t('questionnaireInfo.steps.step1', {
                        count: assessment.questions.length,
                        time: assessment.duration
                      })}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t('questionnaireInfo.steps.step2')}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">3</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t('questionnaireInfo.steps.step3')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Background */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {t('questionnaireInfo.professionalBackground')}
                </h3>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        {t('questionnaireInfo.validated')}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {t('questionnaireInfo.validatedDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {t('questionnaireInfo.privacy.title')}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {t('questionnaireInfo.privacy.message')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleStartAssessment}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  {t('questionnaireInfo.startAssessment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
