import React, { useState, useEffect } from 'react';

const DirectImportTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const testDirectImports = async () => {
    setLoading(true);
    const results: Record<string, any> = {};

    // 直接测试静态导入
    try {
      console.log('Testing static import of assessment zh...');
      const { default: assessmentZh } = await import('@/client-locales/assessment/zh');
      results['static-assessment-zh'] = {
        success: true,
        hasClient: !!assessmentZh.client,
        hasExecution: !!(assessmentZh as any).execution,
        clientLoadingAssessment: assessmentZh.client?.loading?.assessment,
        executionLoading: (assessmentZh as any).execution?.loading,
        executionSubmitFailed: (assessmentZh as any).execution?.errors?.submitFailed
      };
    } catch (error) {
      results['static-assessment-zh'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 测试动态导入映射
    try {
      console.log('Testing dynamic import mapping...');
      const moduleMap: Record<string, () => Promise<any>> = {
        'assessment:zh': () => import('@/client-locales/assessment/zh'),
        'assessment:en': () => import('@/client-locales/assessment/en'),
        'shared:zh': () => import('@/client-locales/shared/zh'),
      };

      for (const [key, loader] of Object.entries(moduleMap)) {
        try {
          const module = await loader();
          const translations = module.default;

          results[`dynamic-${key}`] = {
            success: true,
            hasDefault: !!module.default,
            hasClient: !!translations?.client,
            sampleKey: key.includes('assessment')
              ? translations?.client?.loading?.assessment
              : translations?.client?.loading?.general
          };
        } catch (error) {
          results[`dynamic-${key}`] = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    } catch (error) {
      results['dynamic-mapping'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testDirectImports();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Direct Import Test</h2>

      {loading && <p>Testing direct imports...</p>}

      <div style={{ marginTop: '20px' }}>
        {Object.entries(testResults).map(([testKey, result]) => (
          <div key={testKey} style={{
            marginBottom: '15px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: result.success ? '#f0f8f0' : '#f8f0f0'
          }}>
            <h4>{testKey}</h4>
            <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>

            {result.success ? (
              <>
                {result.hasDefault !== undefined && (
                  <p><strong>Has Default:</strong> {result.hasDefault ? 'Yes' : 'No'}</p>
                )}
                {result.hasClient !== undefined && (
                  <p><strong>Has Client:</strong> {result.hasClient ? 'Yes' : 'No'}</p>
                )}
                {result.hasExecution !== undefined && (
                  <p><strong>Has Execution:</strong> {result.hasExecution ? 'Yes' : 'No'}</p>
                )}
                {result.clientLoadingAssessment && (
                  <p><strong>Client Loading Assessment:</strong> {result.clientLoadingAssessment}</p>
                )}
                {result.executionLoading && (
                  <p><strong>Execution Loading:</strong> {result.executionLoading}</p>
                )}
                {result.executionSubmitFailed && (
                  <p><strong>Execution Submit Failed:</strong> {result.executionSubmitFailed}</p>
                )}
                {result.sampleKey && (
                  <p><strong>Sample Key:</strong> {result.sampleKey}</p>
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

export default DirectImportTest;
