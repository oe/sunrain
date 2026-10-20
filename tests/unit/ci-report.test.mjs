import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { verifyRegressionReport } from '../../scripts/verify-regression-report.mjs';

test('real Playwright split reports match the full plan and expose omitted or unfinished cases', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'sunrain-ci-report-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const cli = fileURLToPath(new URL('../../node_modules/playwright/cli.js', import.meta.url));
  const testModule = new URL('../../node_modules/playwright/test.mjs', import.meta.url).href;
  writeFileSync(join(root, 'playwright.config.mjs'), `export default {
    testDir: '.', testMatch: 'fixture.spec.mjs', workers: 1,
    projects: [{name:'desktop'}, {name:'mobile'}]
  };`);
  writeFileSync(join(root, 'fixture.spec.mjs'), `import {test,expect} from ${JSON.stringify(testModule)};
    test('runs',()=>expect(1).toBe(1));
    test.describe('nested',()=>test('runs',()=>expect(2).toBe(2)));
    test('runtime skip',({},info)=>{test.skip(info.project.name==='mobile');expect(3).toBe(3);});
  `);
  const env = { ...process.env, PLAYWRIGHT_HTML_OPEN: 'never' };
  for (const key of Object.keys(env)) {
    if (/^PLAYWRIGHT_(JSON|BLOB)_OUTPUT_/.test(key)) delete env[key];
  }
  const run = (args, extraEnv = {}) => execFileSync(process.execPath, [cli, ...args], {
    cwd: root, env: { ...env, ...extraEnv }, encoding: 'utf8', stdio: 'pipe', maxBuffer: 10 * 1024 * 1024,
  });
  const plan = JSON.parse(run(['test', '--list', '--reporter=json']));
  const blobs = join(root, 'all-blobs');
  mkdirSync(blobs);
  for (const project of ['desktop', 'mobile']) {
    const output = join(root, `blob-${project}`);
    run(['test', `--project=${project}`, '--reporter=blob'], {
      PLAYWRIGHT_BLOB_OUTPUT_DIR: output, PLAYWRIGHT_BLOB_OUTPUT_NAME: `${project}.zip`,
    });
    assert.deepEqual(readdirSync(output).filter(file => file.endsWith('.zip')), [`${project}.zip`]);
    cpSync(join(output, `${project}.zip`), join(blobs, `${project}.zip`));
  }
  const output = join(root, 'merged.json');
  run(['merge-reports', '--reporter=json', blobs], { PLAYWRIGHT_JSON_OUTPUT_FILE: output });
  const merged = JSON.parse(readFileSync(output, 'utf8'));
  assert.deepEqual(verifyRegressionReport(plan, merged), {
    total: 6, passed: 5, skipped: 1, expectedFailures: 0, flaky: 0,
  });

  await t.test('a missing project fails even when every remaining result passed', () => {
    const incomplete = structuredClone(merged);
    forEachSpec(incomplete, spec => { spec.tests = spec.tests.filter(test => test.projectName !== 'mobile'); });
    assert.throws(() => verifyRegressionReport(plan, incomplete), /Missing 3 planned browser cases/);
  });
  await t.test('duplicate reports fail instead of inflating coverage', () => {
    const duplicate = structuredClone(merged);
    duplicate.suites.push(structuredClone(duplicate.suites[0]));
    assert.throws(() => verifyRegressionReport(plan, duplicate), /Duplicate browser case/);
  });
  await t.test('interrupted and unexecuted cases cannot pass the gate', () => {
    for (const results of [[], [{ status: 'interrupted' }], [{ status: 'skipped' }]]) {
      const incomplete = structuredClone(merged);
      firstTest(incomplete).results = results;
      assert.throws(() => verifyRegressionReport(plan, incomplete), /not executed|incomplete or unexpected/);
    }
  });
  await t.test('unexpected failures and global runner errors fail the gate', () => {
    const failed = structuredClone(merged);
    firstTest(failed).status = 'unexpected';
    assert.throws(() => verifyRegressionReport(plan, failed), /did not finish as expected/);
    const errored = structuredClone(merged);
    errored.errors = [{ message: 'Runner stopped early' }];
    assert.throws(() => verifyRegressionReport(plan, errored), /global errors/);
  });
});

function forEachSpec(report, callback) {
  function visit(suite) {
    for (const spec of suite.specs || []) callback(spec);
    for (const child of suite.suites || []) visit(child);
  }
  for (const suite of report.suites) visit(suite);
}

function firstTest(report) {
  let found;
  forEachSpec(report, spec => { found ||= spec.tests[0]; });
  return found;
}
