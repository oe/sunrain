import React, { useState } from 'react';
import { useCSRTranslations } from '@/hooks/useTranslations';
import type { Language } from '@sunrain/shared';

const CSRTranslationTest: React.FC = () => {
  const [currentNamespace, setCurrentNamespace] = useState<'assessment' | 'shared'>('assessment');
  const { t, language, changeLanguage, isLoading, currentMode, csrLoadState } = useCSRTranslations(currentNamespace);

  const languages: Language[] = ['zh', 'en', 'es', 'ja', 'ko', 'hi', 'ar'];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>CSR Translation Test</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>Current Status</h3>
        <p><strong>Current Language:</strong> {language}</p>
        <p><strong>Current Namespace:</strong> {currentNamespace}</p>
        <p><strong>Translation Mode:</strong> {currentMode}</p>
        <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>CSR Load State:</strong> {JSON.stringify(csrLoadState)}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Language Switcher</h3>
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            style={{
              margin: '5px',
              padding: '5px 10px',
              backgroundColor: language === lang ? '#007bff' : '#f8f9fa',
              color: language === lang ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Namespace Switcher</h3>
        <button
          onClick={() => setCurrentNamespace('assessment')}
          style={{
            margin: '5px',
            padding: '5px 10px',
            backgroundColor: currentNamespace === 'assessment' ? '#007bff' : '#f8f9fa',
            color: currentNamespace === 'assessment' ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Assessment
        </button>
        <button
          onClick={() => setCurrentNamespace('shared')}
          style={{
            margin: '5px',
            padding: '5px 10px',
            backgroundColor: currentNamespace === 'shared' ? '#007bff' : '#f8f9fa',
            color: currentNamespace === 'shared' ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Shared
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Translation Tests</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <h4>Client Translations</h4>
            <p><strong>Loading Assessment:</strong> {t('client.loading.assessment')}</p>
            <p><strong>Error Title:</strong> {t('client.errors.title')}</p>
            <p><strong>Initialization Failed:</strong> {t('client.errors.initializationFailed')}</p>
            <p><strong>Session Start Failed:</strong> {t('client.errors.sessionStartFailed')}</p>
            <p><strong>Retry Action:</strong> {t('client.actions.retry')}</p>
            <p><strong>Next Action:</strong> {t('client.actions.next')}</p>
          </div>

          <div>
            <h4>Execution Translations</h4>
            <p><strong>Execution Loading:</strong> {t('execution.loading')}</p>
            <p><strong>Submit Failed:</strong> {t('execution.errors.submitFailed')}</p>
            <p><strong>Required Field:</strong> {t('execution.errors.required')}</p>
            <p><strong>Completion Title:</strong> {t('execution.completion.title')}</p>
            <p><strong>Pause Title:</strong> {t('execution.pauseModal.title')}</p>
            <p><strong>Question Number:</strong> {t('execution.questionNumber')}</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Interactive Translations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <h4>Progress</h4>
            <p><strong>Progress Text:</strong> {t('interactive.progress.text', { current: 5, total: 10 })}</p>
            <p><strong>Percentage:</strong> {t('interactive.progress.percentage', { percentage: 50 })}</p>
          </div>

          <div>
            <h4>Question</h4>
            <p><strong>Question Number:</strong> {t('interactive.question.number', { current: 3, total: 10 })}</p>
            <p><strong>Required:</strong> {t('interactive.question.required')}</p>
            <p><strong>Selected Count:</strong> {t('interactive.question.selectedCount', { count: 2 })}</p>
          </div>
        </div>
      </div>

      {currentNamespace === 'shared' && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Shared Translations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <h4>Loading States</h4>
              <p><strong>General Loading:</strong> {t('client.loading.general')}</p>
              <p><strong>Data Loading:</strong> {t('client.loading.data')}</p>
              <p><strong>Translations Loading:</strong> {t('client.loading.translations')}</p>
            </div>

            <div>
              <h4>Language Switcher</h4>
              <p><strong>Current Language:</strong> {t('interactive.languageSwitcher.current')}</p>
              <p><strong>Switch To:</strong> {t('interactive.languageSwitcher.switchTo')}</p>
              <p><strong>Select Language:</strong> {t('interactive.languageSwitcher.selectLanguage')}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Fallback Test</h3>
        <p><strong>Non-existent Key:</strong> {t('non.existent.key')}</p>
        <p><strong>Parameterized Non-existent:</strong> {t('non.existent.param', { value: 'test' })}</p>
      </div>
    </div>
  );
};

export default CSRTranslationTest;
