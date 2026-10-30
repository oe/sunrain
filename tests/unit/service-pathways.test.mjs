import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=path=>JSON.parse(readFileSync(new URL(`../../src/data/${path}`,import.meta.url),'utf8'));
const paths=read('support-pathways.json'),resources=read('resource-copy.json'),catalog=read('support-services.json');
const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
function complete(actual,expected,key){
  if(typeof expected==='string'){assert.equal(typeof actual,'string',key);assert.ok(actual.trim(),key);assert.doesNotMatch(actual,/\{[^}]+\}/,key);}
  else{assert.deepEqual(Object.keys(actual),Object.keys(expected),key);for(const k of Object.keys(expected))complete(actual[k],expected[k],`${key}.${k}`);}
}
test('all locales contain complete region-specific guidance and resource language labels without adding regions',()=>{
  assert.deepEqual(Object.keys(paths.locales).sort(),[...locales].sort());assert.deepEqual(Object.keys(resources).sort(),[...locales].sort());
  for(const lang of locales){
    complete(paths.locales[lang],paths.locales.en,lang);complete(resources[lang],resources.en,lang);
    assert.deepEqual(Object.keys(paths.locales[lang].regions),['GB-ENG','JP']);
    for(const c of Object.values(paths.locales[lang].regions))assert.equal(c.steps.length,3);
    if(lang!=='en'){assert.notEqual(paths.locales[lang].regions.JP.fit,paths.locales.en.regions.JP.fit);assert.notEqual(resources[lang].titles.ucla,resources.en.titles.ucla);}
  }
  assert.deepEqual(catalog.entries.map(e=>e.region),['GB-ENG','US','JP','KR','ES','HK','CN-BJ']);
});
test('each entry carries its own check date and pathway references remain separate from provider acceptance',()=>{
  for(const entry of catalog.entries){assert.match(entry.checkedAt,/^\d{4}-\d{2}-\d{2}$/);assert.equal(new URL(entry.url).protocol,'https:');}
  assert(catalog.entries.find(e=>e.region==='KR').url.endsWith('PotalHealthFacListTab2.do'));
  assert.equal(catalog.entries.find(e=>e.region==='US').websiteLanguages,'English / Español');
  for(const sources of Object.values(paths.sources))for(const source of sources)assert(['www.nhs.uk','www.iryou.teikyouseido.mhlw.go.jp'].includes(new URL(source.url).hostname));
});
