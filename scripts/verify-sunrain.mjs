import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);

function readText(path) {
  return readFileSync(new URL(path, root), 'utf8');
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function flattenKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      return flattenKeys(child, next);
    }
    return [next];
  });
}

function assertNoMatch(file, pattern, reason) {
  const text = readText(file);
  assert.equal(pattern.test(text), false, `${file}: ${reason}`);
}

const i18nDir = new URL('src/i18n/', root);
const translationFiles = readdirSync(i18nDir)
  .filter((file) => file.endsWith('.json'))
  .sort();
const baseKeys = new Set(flattenKeys(readJson('src/i18n/en.json')));

for (const file of translationFiles) {
  const keys = new Set(flattenKeys(readJson(`src/i18n/${file}`)));
  const missing = [...baseKeys].filter((key) => !keys.has(key));
  assert.deepEqual(missing, [], `${file} is missing translation keys`);
}

const requirements = readText('docs/REQUIREMENTS.md');
assert.match(requirements, /\|\s*zh-hans\s*\|\s*简体中文\s*\|/);
assert.match(requirements, /\|\s*zh-hant\s*\|\s*繁體中文\s*\|/);
assert.doesNotMatch(requirements, /\|\s*zh\s*\|\s*中文\s*\|/);

const contentConfig = readText('src/content/config.ts');
assert.match(contentConfig, /resources\s*:/, 'resources collection must be explicit');

assertNoMatch(
  'src/pages/assessment/[id].astro',
  /Question \$\{|Submit|Next →/,
  'assessment flow text must use translations'
);
const assessmentPage = readText('src/pages/assessment/[id].astro');
assert.match(assessmentPage, /assessment\.results\.nextSteps\.title/);
assert.match(assessmentPage, /function hasSafetySignal\(\)/);
assert.match(assessmentPage, /result-safety-notice/);
assert.match(assessmentPage, /resultSafetyNotice\?\.focus\(\)/);
assert.match(assessmentPage, /assessmentLabels\.safetyScoreContext/);
assert.match(assessmentPage, /\/breathing\//);
assert.match(assessmentPage, /\/resources\//);
assert.match(assessmentPage, /\/crisis\//);
assertNoMatch(
  'src/pages/assessment/index.astro',
  /innerHTML|Score:|Are you sure you want to clear all history\?/,
  'assessment history must avoid raw HTML injection and hardcoded English'
);
assertNoMatch(
  'src/pages/crisis.astro',
  /No results found\. Try a different search term\./,
  'crisis empty state must use translations'
);
const resourcesPage = readText('src/pages/resources.astro');
assert.match(resourcesPage, /resources\.languageNotice/);

assertNoMatch(
  'src/pages/index.astro',
  /No tracking, no cookies, no servers/,
  'homepage fallback privacy copy must disclose infrastructure telemetry'
);

const phq9 = readText('src/content/questionnaires/phq-9.yaml');
assert.match(phq9, /questionId:\s*q9\s+minValue:\s*1/);

for (const file of translationFiles) {
  const translation = readJson(`src/i18n/${file}`);
  assertNoMatch(
    `src/i18n/${file}`,
    /No tracking, no cookies, no servers|无追踪、无Cookie、无服务器/,
    'privacy copy must distinguish local mental-health data from infrastructure telemetry'
  );
  assert.equal(
    translation.about.values.privacy.description,
    translation.home.privacy.description,
    `${file}: home and about privacy disclosures must stay consistent`
  );
}

console.log('Sunrain verification passed.');
