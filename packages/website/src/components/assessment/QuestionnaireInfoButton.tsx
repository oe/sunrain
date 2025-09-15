import { useState } from 'react';
import { Info, X, Shield, CheckCircle } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { QuestionnaireInfoButtonProps } from '@/types/assessment';

export default function QuestionnaireInfoButton({
  assessment,
  buttonText,
  language,
  onStartAssessment
}: QuestionnaireInfoButtonProps) {
  const { t } = useAssessmentTranslations(language);
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



  // Handle escape key


  return (
    <>
      {/* Info Button */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-outline btn-primary w-full"
      >
        <Info className="w-5 h-5" />
        {buttonText}
      </button>

      {/* Modal */}
      <div className={`modal ${showModal ? 'modal-open' : ''}`} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
        <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-xl font-bold">
                  {assessment.name}
                </h2>
                <p className="text-sm opacity-70">
                  {t('questionnaireInfo.mentalHealthAssessment')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-sm btn-circle btn-ghost"
              aria-label={(() => {
                const closeText = t('common.close');
                return Array.isArray(closeText) ? closeText.join(', ') : closeText;
              })()}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="stat bg-primary/10 rounded-lg">
                <div className="stat-value text-primary">
                  {assessment.questions.length}
                </div>
                <div className="stat-title">
                  {t('questionnaireInfo.questions')}
                </div>
              </div>
              <div className="stat bg-secondary/10 rounded-lg">
                <div className="stat-value text-secondary">
                  {assessment.duration}
                </div>
                <div className="stat-title">
                  {t('questionnaireInfo.minutes')}
                </div>
              </div>
              <div className="stat bg-accent/10 rounded-lg">
                <div className="stat-value">
                  <div className="badge badge-success">
                    {t('questionnaireInfo.difficulty.beginner')}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t('questionnaireInfo.description')}
              </h3>
              <p className="leading-relaxed">
                {assessment.description}
              </p>
            </div>

            {/* Purpose */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t('questionnaireInfo.purpose')}
              </h3>
              <p className="leading-relaxed">
                {t('questionnaireInfo.purposeDescription')}
              </p>
            </div>

            {/* What to Expect */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t('questionnaireInfo.whatToExpect')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="badge badge-primary badge-sm">1</div>
                  <p>
                    {t('questionnaireInfo.steps.step1', {
                      count: assessment.questions.length,
                      time: assessment.duration
                    })}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="badge badge-primary badge-sm">2</div>
                  <p>
                    {t('questionnaireInfo.steps.step2')}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="badge badge-primary badge-sm">3</div>
                  <p>
                    {t('questionnaireInfo.steps.step3')}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Background */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t('questionnaireInfo.professionalBackground')}
              </h3>
              <div className="alert alert-success">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <div className="font-medium">
                    {t('questionnaireInfo.validated')}
                  </div>
                  <div className="text-sm">
                    {t('questionnaireInfo.validatedDescription')}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="alert alert-info">
              <Shield className="w-5 h-5" />
              <div>
                <div className="font-medium">
                  {t('questionnaireInfo.privacy.title')}
                </div>
                <div className="text-sm">
                  {t('questionnaireInfo.privacy.message')}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-action">
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-outline"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleStartAssessment}
              className="btn btn-primary"
            >
              {t('questionnaireInfo.startAssessment')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
