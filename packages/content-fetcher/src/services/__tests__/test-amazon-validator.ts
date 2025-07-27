/**
 * Simple test runner for Amazon Link Validator
 */

import { AmazonLinkValidator } from "../amazon-link-validator.js";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`
    );
  }
}

async function runTests() {
  console.log("🧪 Running Amazon Link Validator Tests...\n");

  const validator = new AmazonLinkValidator();
  let testsPassed = 0;
  let testsFailed = 0;

  // Test ASIN extraction
  console.log("Testing ASIN extraction...");
  try {
    assertEqual(
      validator.extractAsinFromUrl("https://amazon.com/dp/B08N5WRWNW"),
      "B08N5WRWNW",
      "Should extract ASIN from standard URL"
    );

    assertEqual(
      validator.extractAsinFromUrl(
        "https://www.amazon.com/gp/product/1234567890"
      ),
      "1234567890",
      "Should extract ASIN from gp/product URL"
    );

    assertEqual(
      validator.extractAsinFromUrl("https://amazon.com/search?keywords=test"),
      null,
      "Should return null for URLs without ASIN"
    );

    testsPassed += 3;
    console.log("✅ ASIN extraction tests passed");
  } catch (error) {
    console.error("❌ ASIN extraction test failed:", error.message);
    testsFailed++;
  }

  // Test ISBN validation
  console.log("\nTesting ISBN validation...");
  try {
    assert(
      validator.validateIsbn("0306406152"),
      "Should validate correct ISBN-10"
    );

    assert(
      validator.validateIsbn("9780306406157"),
      "Should validate correct ISBN-13"
    );

    assert(!validator.validateIsbn("1234567890"), "Should reject invalid ISBN");

    testsPassed += 3;
    console.log("✅ ISBN validation tests passed");
  } catch (error) {
    console.error("❌ ISBN validation test failed:", error.message);
    testsFailed++;
  }

  // Test ISBN extraction from text
  console.log("\nTesting ISBN extraction from text...");
  try {
    const testText = "ISBN-13: 978-0-306-40615-7";
    const result = validator.extractIsbnFromText(testText);
    console.log(`Debug: extracting from "${testText}" got: ${result}`);

    // Test the ISBN validation directly
    const testIsbn = "9780306406157";
    const isValid = validator.validateIsbn(testIsbn);
    console.log(`Debug: ISBN ${testIsbn} is valid: ${isValid}`);

    assertEqual(
      result,
      "9780306406157",
      "Should extract ISBN-13 from formatted text"
    );

    assertEqual(
      validator.extractIsbnFromText(
        "The book ISBN is 0-306-40615-2 and it is great"
      ),
      "0306406152",
      "Should extract ISBN-10 from sentence"
    );

    assertEqual(
      validator.extractIsbnFromText("No ISBN here"),
      null,
      "Should return null for text without ISBN"
    );

    testsPassed += 3;
    console.log("✅ ISBN extraction tests passed");
  } catch (error) {
    console.error("❌ ISBN extraction test failed:", error.message);
    testsFailed++;
  }

  // Test Amazon URL detection
  console.log("\nTesting Amazon URL detection...");
  try {
    assert(
      validator.isAmazonUrl("https://amazon.com/dp/B08N5WRWNW"),
      "Should detect Amazon URL"
    );

    assert(
      validator.isAmazonUrl("https://amzn.to/3abc123"),
      "Should detect Amazon short URL"
    );

    assert(
      !validator.isAmazonUrl("https://google.com"),
      "Should reject non-Amazon URL"
    );

    testsPassed += 3;
    console.log("✅ Amazon URL detection tests passed");
  } catch (error) {
    console.error("❌ Amazon URL detection test failed:", error.message);
    testsFailed++;
  }

  // Test URL normalization
  console.log("\nTesting URL normalization...");
  try {
    assertEqual(
      validator.normalizeAmazonUrl(
        "https://amazon.com/some-long-title/dp/B08N5WRWNW/ref=sr_1_1?keywords=test"
      ),
      "https://amazon.com/dp/B08N5WRWNW",
      "Should normalize Amazon URL to clean format"
    );

    const unchangedUrl = "https://amazon.com/search?keywords=test";
    assertEqual(
      validator.normalizeAmazonUrl(unchangedUrl),
      unchangedUrl,
      "Should return original URL if ASIN cannot be extracted"
    );

    testsPassed += 2;
    console.log("✅ URL normalization tests passed");
  } catch (error) {
    console.error("❌ URL normalization test failed:", error.message);
    testsFailed++;
  }

  // Test URL repair
  console.log("\nTesting URL repair...");
  try {
    assertEqual(
      validator.attemptUrlRepair(
        "https://amazon.com/broken-link/dp/B08N5WRWNW/broken-ref"
      ),
      "https://amazon.com/dp/B08N5WRWNW",
      "Should repair URL with extractable ASIN"
    );

    assertEqual(
      validator.attemptUrlRepair("https://amazon.com/completely-broken-url"),
      undefined,
      "Should return undefined for unrepairable URLs"
    );

    testsPassed += 2;
    console.log("✅ URL repair tests passed");
  } catch (error) {
    console.error("❌ URL repair test failed:", error.message);
    testsFailed++;
  }

  // Summary
  console.log("\n📊 Test Results:");
  console.log(`✅ Tests passed: ${testsPassed}`);
  console.log(`❌ Tests failed: ${testsFailed}`);

  if (testsFailed === 0) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log("\n💥 Some tests failed!");
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});
