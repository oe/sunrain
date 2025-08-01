import React, { useState, useEffect } from 'react';
import { getCSRTranslationManager } from '@/utils/csr-translation-manager';

const CSRManagerTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const testCSRManager = async () => {
    setLoading(true);
    const results: Record<string, any> = {};
    const manager = getCSRTranslationManager();

    // 测试assessment:zh
    try {
      console.log('Testing CSR manager with assessment:zh...');
      const translations = await manager.loadTranslations('assessment', 'zh');
      results['assessment:zh'] = {
        success: true,
        hasClient: !!translations.client,
        hasInteractive: !!translations.interactive,
        hasExecution: !!(translations as any).execution,
        clientKeys: translations.client ? Object.keys(translations.client) : [],
        sampleTranslation: translations.client?.loading?.assessment || 'Not found',
        executionSample: (translations as any).execution?.loading || 'Not found'
      };
    } catch (error) {
      results['assessment:zh'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 测试assessment:en
    try {
      console.log('Testing CSR manager with assessment:en...');
      const translations = await manager.loadTranslations('assessment', 'en');
      results['assessment:en'] = {
        success: true,
        hasClient: !!translations.client,
        hasInteractive: !!translations.interactive,
        hasExecution: !!(translations as any).execution,
        clientKeys: translations.client ? Object.keys(translations.client) : [],
        sampleTranslation: translations.client?.loading?.assessment || 'Not found',
        executionSample: (translations as any).execution?.loading || 'Not found'
      };
    } catch (error) {
      results['assessment:en'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 测试shared:zh
    try {
      console.log('Testing CSR manager with shared:zh...');
      const translations = await manager.loadTranslations('shared', 'zh');
      results['shared:zh'] = {
        success: true,
        hasClient: !!translations.client,
        hasInteractive: !!translations.interactive,
        clientKeys: translations.client ? Object.keys(translations.client) : [],
        sampleTranslation: translations.client?.loading?.general || 'Not found'
      };
    } catch (error) {
      results['shared:zh'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 测试getText方法
    try {
      console.log('Testing getText method...');
      const text1 = await manager.getText('assessment', 'client.loading.assessment', {}, 'zh');
      const text2 = await manager.getText('assessment', 'execution.errors.submitFailed', {}, 'zh');
      const text3 = await manager.getText('assessment', 'interactive.progress.text', { current: 5, total: 10 }, 'zh');

      results['getText'] = {
        success: true,
        clientLoading: text1,
        executionError: text2,
        progressText: text3
      };
    } catch (error) {
      results['getText'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testCSRManager();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>CSR Translation Manager Test</h2>

      {loading && <p>Testing CSR translation manager...</p>}

      <div style={{ marginTop: '20px' }}>
        {Object.entries(testResults).map(([testKey, result]) => (
          <div key={testKey} style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: result.success ? '#f0f8f0' : '#f8f0f0'
          }}>
            <h3>{testKey}</h3>
            <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>

            {result.success ? (
              <>
                {result.hasClient !== undefined && (
                  <p><strong>Has Client:</strong> {result.hasClient ? 'Yes' : 'No'}</p>
                )}
                {result.hasInteractive !== undefined && (
                  <p><strong>Has Interactive:</strong> {result.hasInteractive ? 'Yes' : 'No'}</p>
                )}
                {result.hasExecution !== undefined && (
                  <p><strong>Has Execution:</strong> {result.hasExecution ? 'Yes' : 'No'}</p>
                )}
                {result.clientKeys && (
                  <p><strong>Client Keys:</strong> {result.clientKeys.join(', ')}</p>
                )}
                {result.sampleTranslation && (
                  <p><strong>Sample Translation:</strong> {result.sampleTranslation}</p>
                )}
                {result.executionSample && (
                  <p><strong>Execution Sample:</strong> {result.executionSample}</p>
                )}
                {result.clientLoading && (
                  <>
                    <p><strong>Client Loading:</strong> {result.clientLoading}</p>
                    <p><strong>Execution Error:</strong> {result.executionError}</p>
                    <p><strong>Progress Text:</strong> {result.progressText}</p>
                  </>
                )}
              </>
            ) : (
              <p><strong>Error:</strong> {result.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CSRManagerTest;
