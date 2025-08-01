import React, { useState, useEffect } from 'react';

const CSRModuleTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const testModuleLoading = async () => {
    setLoading(true);
    const results: Record<string, any> = {};

    try {
      // 测试assessment:zh
      console.log('Testing assessment:zh module loading...');
      const assessmentZh = await import('@/client-locales/assessment/zh');
      results['assessment:zh'] = {
        success: true,
        hasDefault: !!assessmentZh.default,
        hasNamedExport: !!assessmentZh.assessmentZh,
        exports: Object.keys(assessmentZh),
        defaultKeys: assessmentZh.default ? Object.keys(assessmentZh.default) : [],
        sampleTranslation: assessmentZh.default?.client?.loading?.assessment || 'Not found'
      };
    } catch (error) {
      results['assessment:zh'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    try {
      // 测试assessment:en
      console.log('Testing assessment:en module loading...');
      const assessmentEn = await import('@/client-locales/assessment/en');
      results['assessment:en'] = {
        success: true,
        hasDefault: !!assessmentEn.default,
        hasNamedExport: !!assessmentEn.assessmentEn,
        exports: Object.keys(assessmentEn),
        defaultKeys: assessmentEn.default ? Object.keys(assessmentEn.default) : [],
        sampleTranslation: assessmentEn.default?.client?.loading?.assessment || 'Not found'
      };
    } catch (error) {
      results['assessment:en'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    try {
      // 测试shared:zh
      console.log('Testing shared:zh module loading...');
      const sharedZh = await import('@/client-locales/shared/zh');
      results['shared:zh'] = {
        success: true,
        hasDefault: !!sharedZh.default,
        hasNamedExport: !!sharedZh.sharedZh,
        exports: Object.keys(sharedZh),
        defaultKeys: sharedZh.default ? Object.keys(sharedZh.default) : [],
        sampleTranslation: sharedZh.default?.client?.loading?.general || 'Not found'
      };
    } catch (error) {
      results['shared:zh'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testModuleLoading();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>CSR Module Loading Test</h2>

      {loading && <p>Testing module loading...</p>}

      <div style={{ marginTop: '20px' }}>
        {Object.entries(testResults).map(([moduleKey, result]) => (
          <div key={moduleKey} style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: result.success ? '#f0f8f0' : '#f8f0f0'
          }}>
            <h3>{moduleKey}</h3>
            <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>

            {result.success ? (
              <>
                <p><strong>Has Default Export:</strong> {result.hasDefault ? 'Yes' : 'No'}</p>
                <p><strong>Has Named Export:</strong> {result.hasNamedExport ? 'Yes' : 'No'}</p>
                <p><strong>Available Exports:</strong> {result.exports.join(', ')}</p>
                <p><strong>Default Export Keys:</strong> {result.defaultKeys.join(', ')}</p>
                <p><strong>Sample Translation:</strong> {result.sampleTranslation}</p>
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

export default CSRModuleTest;
