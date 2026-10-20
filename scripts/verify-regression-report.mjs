import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function cases(report) {
  const found = new Map();
  function visit(suite, parents = []) {
    const titles = [...parents, suite.title];
    for (const spec of suite.specs || []) {
      for (const test of spec.tests) {
        const key = JSON.stringify([test.projectName, spec.file, spec.line, spec.column, titles, spec.title]);
        assert(!found.has(key), `Duplicate browser case: ${key}`);
        found.set(key, test);
      }
    }
    for (const child of suite.suites || []) visit(child, titles);
  }
  for (const suite of report.suites || []) visit(suite);
  return found;
}

/** Match merged results against the full plan, including projects outside the matrix. */
export function verifyRegressionReport(plan, report) {
  const planned = cases(plan), actual = cases(report);
  assert(planned.size > 0, 'The full browser test plan is empty');
  const missing = [...planned.keys()].filter(key => !actual.has(key));
  const extra = [...actual.keys()].filter(key => !planned.has(key));
  assert.equal(missing.length, 0, `Missing ${missing.length} planned browser cases: ${missing.slice(0, 3).join(', ')}`);
  assert.equal(extra.length, 0, `Unexpected browser cases: ${extra.slice(0, 3).join(', ')}`);
  assert.equal((report.errors || []).length, 0, 'The browser run reported global errors');
  const summary = { total: actual.size, passed: 0, skipped: 0, expectedFailures: 0, flaky: 0 };
  for (const [key, test] of actual) {
    assert(['expected', 'flaky', 'skipped'].includes(test.status), `Browser case did not finish as expected: ${key}`);
    const last = test.results?.at(-1);
    assert(last, `Browser case was not executed: ${key}`);
    const expected = test.expectedStatus || 'passed';
    assert.equal(last.status, expected, `Browser case has an incomplete or unexpected result: ${key}`);
    if (expected === 'skipped') summary.skipped++;
    else if (expected === 'failed') summary.expectedFailures++;
    else { assert.equal(expected, 'passed'); summary.passed++; }
    if (test.status === 'flaky') summary.flaky++;
  }
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.equal(process.argv.length, 4, 'Usage: node scripts/verify-regression-report.mjs <plan.json> <results.json>');
  const summary = verifyRegressionReport(...process.argv.slice(2).map(file => JSON.parse(readFileSync(file, 'utf8'))));
  console.log(`Verified all ${summary.total} planned browser cases: ${JSON.stringify(summary)}.`);
}
