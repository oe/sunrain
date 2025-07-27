/**
 * Test enhanced URL generator functionality
 */

import { URLGenerator, MonetizationConfig } from '../url-generator.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
  }
}

async function runTests() {
  console.log('🧪 Running Enhanced URL Generator Tests...\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test basic affiliate link generation
  console.log('Testing basic affiliate link generation...');
  try {
    const config: MonetizationConfig = {
      amazon: {
        affiliateTag: 'test-affiliate-20',
        regions: {
          us: 'amazon.com',
          uk: 'amazon.co.uk',
          de: 'amazon.de'
        }
      }
    };

    const generator = new URLGenerator(config);
    const url = generator.generateAmazonUrl('1234567890', 'us');

    assert(url.includes('tag=test-affiliate-20'), 'Should include affiliate tag');
    assert(url.includes('amazon.com'), 'Should use correct domain');
    assert(url.includes('/dp/1234567890'), 'Should include ISBN in URL');

    testsPassed++;
    console.log('✅ Basic affiliate link generation passed');
  } catch (error) {
    console.error('❌ Basic affiliate link generation failed:', error.message);
    testsFailed++;
  }

  // Test region-specific affiliate tags
  console.log('\nTesting region-specific affiliate tags...');
  try {
    const config: MonetizationConfig = {
      amazon: {
        affiliateTag: {
          us: 'us-affiliate-20',
          uk: 'uk-affiliate-21',
          de: 'de-affiliate-21'
        },
        regions: {
          us: 'amazon.com',
          uk: 'amazon.co.uk',
          de: 'amazon.de'
        }
      }
    };

    const generator = new URLGenerator(config);

    const usUrl = generator.generateAmazonUrl('1234567890', 'us');
    const ukUrl = generator.generateAmazonUrl('1234567890', 'uk');
    const deUrl = generator.generateAmazonUrl('1234567890', 'de');

    assert(usUrl.includes('tag=us-affiliate-20'), 'Should use US affiliate tag');
    assert(ukUrl.includes('tag=uk-affiliate-21'), 'Should use UK affiliate tag');
    assert(deUrl.includes('tag=de-affiliate-21'), 'Should use DE affiliate tag');

    assert(usUrl.includes('amazon.com'), 'Should use US domain');
    assert(ukUrl.includes('amazon.co.uk'), 'Should use UK domain');
    assert(deUrl.includes('amazon.de'), 'Should use DE domain');

    testsPassed++;
    console.log('✅ Region-specific affiliate tags passed');
  } catch (error) {
    console.error('❌ Region-specific affiliate tags failed:', error.message);
    testsFailed++;
  }

  // Test fallback when no affiliate tag
  console.log('\nTesting fallback when no affiliate tag...');
  try {
    const config: MonetizationConfig = {
      amazon: {
        affiliateTag: '',
        regions: {
          us: 'amazon.com',
          uk: 'amazon.co.uk'
        }
      }
    };

    const generator = new URLGenerator(config);
    const url = generator.generateAmazonUrl('1234567890', 'us');

    assert(!url.includes('tag='), 'Should not include affiliate tag');
    assert(url.includes('amazon.com/dp/1234567890'), 'Should include basic URL structure');

    testsPassed++;
    console.log('✅ Fallback without affiliate tag passed');
  } catch (error) {
    console.error('❌ Fallback without affiliate tag failed:', error.message);
    testsFailed++;
  }

  // Test generateAmazonUrlFromISBN enhanced method
  console.log('\nTesting enhanced generateAmazonUrlFromISBN...');
  try {
    const config: MonetizationConfig = {
      amazon: {
        affiliateTag: 'test-affiliate-20',
        regions: {
          us: 'amazon.com'
        }
      }
    };

    const generator = new URLGenerator(config);

    // Test with valid ISBN
    const validUrl = generator.generateAmazonUrlFromISBN('0306406152', 'us');
    assert(validUrl.includes('tag=test-affiliate-20'), 'Should include affiliate tag for valid ISBN');

    // Test with invalid ISBN (should still generate URL but log warning)
    const invalidUrl = generator.generateAmazonUrlFromISBN('invalid-isbn', 'us');
    assert(invalidUrl.includes('amazon.com'), 'Should still generate URL for invalid ISBN');

    testsPassed++;
    console.log('✅ Enhanced generateAmazonUrlFromISBN passed');
  } catch (error) {
    console.error('❌ Enhanced generateAmazonUrlFromISBN failed:', error.message);
    testsFailed++;
  }

  // Test URL repair with affiliate tags
  console.log('\nTesting URL repair with affiliate tags...');
  try {
    const config: MonetizationConfig = {
      amazon: {
        affiliateTag: 'repair-affiliate-20',
        regions: {
          us: 'amazon.com'
        }
      }
    };

    const generator = new URLGenerator(config);
    const brokenUrl = 'https://amazon.com/broken-link/dp/B08N5WRWNW/broken-ref';
    const repairedUrl = await generator.repairAmazonUrl(brokenUrl, 'us');

    assert(repairedUrl.includes('/dp/B08N5WRWNW'), 'Should extract and preserve ASIN');
    assert(repairedUrl.includes('tag=repair-affiliate-20'), 'Should add affiliate tag to repaired URL');

    testsPassed++;
    console.log('✅ URL repair with affiliate tags passed');
  } catch (error) {
    console.error('❌ URL repair with affiliate tags failed:', error.message);
    testsFailed++;
  }

  // Summary
  console.log('\n📊 Test Results:');
  console.log(`✅ Tests passed: ${testsPassed}`);
  console.log(`❌ Tests failed: ${testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All enhanced URL generator tests passed!');
  } else {
    console.log('\n💥 Some tests failed!');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
