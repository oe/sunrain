import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateScore, getInterpretation, hasSafetySignal, canPublishScreening } from '../../src/lib/screening.mjs';
import { parseNote, makeNote, formatContact } from '../../src/lib/private-notes.mjs';
const read = path => JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const pack = read('../../src/data/support-copy.json');
const registry = read('../../src/data/screening-registry.json');
const locales = ['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
function paths(value,prefix='') {
  return Object.entries(value).flatMap(([key,child]) => typeof child==='object' ? paths(child,`${prefix}${key}.`) : [`${prefix}${key}`]);
}
test('every supported language has complete nonempty health copy and templates',()=>{
  assert.deepEqual(Object.keys(pack.locales).sort(), [...locales].sort());
  const keys=paths(pack.locales.en);
  for(const locale of locales) {
    const copy=pack.locales[locale];
    assert.deepEqual(paths(copy),keys,locale);
    for(const key of keys) assert.ok(key.split('.').reduce((v,k)=>v[k],copy).trim(),`${locale}.${key}`);
    assert.doesNotMatch(copy.seekHelp.contactTemplate,/\{(?:concern|duration|impact)\}/);
    assert.equal(copy.review.professional,'pending');
    assert.equal(copy.review.direction,locale==='ar'?'rtl':'ltr');
  }
});
test('contact messages include every supplied field and omit empty optional fields in every language',()=>{
  for(const locale of locales){
    const c=pack.locales[locale];
    assert.equal(formatContact(c.seekHelp.contactTemplate,c.seekHelp.summaryLabels,Array(5).fill('')),c.seekHelp.contactTemplate);
    const values=['<private concern>','three weeks','','tried resting','cost question'];
    const message=formatContact(c.seekHelp.contactTemplate,c.seekHelp.summaryLabels,values);
    for(const i of [0,1,3,4])assert.ok(message.includes(`${c.seekHelp.summaryLabels[i]}\n${values[i]}`));
    assert.ok(!message.includes(c.seekHelp.summaryLabels[2]));
  }
});
test('every listed service has localized instructions and an explicit coverage type',()=>{
  const catalog=read('../../src/data/support-services.json');
  assert.equal(new Set(catalog.entries.map(e=>e.region)).size,catalog.entries.length);
  for(const entry of catalog.entries){
    assert.equal(new URL(entry.url).protocol,'https:');
    assert.ok(['directory','public_service_information','single_provider_information'].includes(entry.kind));
    for(const locale of locales){
      assert.ok(pack.locales[locale].services[entry.region].instructions.trim());
      assert.ok(pack.locales[locale].services[entry.region].region.trim());
    }
  }
});
test('incomplete, sparse, nonnumeric and out-of-range answers never produce a score',()=>{
  for(const answers of [[],[null],[undefined],[NaN],[Infinity],['1'],[-1],[4],[1.5],Array(9)]) {
    assert.throws(()=>calculateScore(answers));
  }
  assert.throws(()=>calculateScore([0,1],9));
  assert.equal(calculateScore(Array(9).fill(0),9),0);
  assert.equal(calculateScore(Array(9).fill(3),9),27);
  assert.equal(calculateScore(Array(7).fill(3),7),21);
});
test('all PHQ-9 and GAD-7 boundary values map exactly once; invalid ranges fail closed',()=>{
  for(const ranges of [[[0,4],[5,9],[10,14],[15,19],[20,27]],[[0,4],[5,9],[10,14],[15,21]]]) {
    const interpretations=ranges.map((range,i)=>({range,level:i}));
    for(let score=0;score<=ranges.at(-1)[1];score++) {
      assert.equal(getInterpretation(score,interpretations).level,ranges.findIndex(([a,b])=>score>=a&&score<=b));
    }
    for(const score of [-1,NaN,100,1.5]) assert.equal(getInterpretation(score,interpretations),null);
    assert.equal(getInterpretation(5,[{range:[0,7]},{range:[5,9]}]),null);
  }
});
test('any nonzero PHQ safety response is independent of total score; missing is not negative',()=>{
  const ids=Array.from({length:9},(_,i)=>`q${i+1}`), triggers=[{questionId:'q9',minValue:1}];
  for(const value of [1,2,3]) assert.equal(hasSafetySignal([...Array(8).fill(0),value],ids,triggers),true);
  for(const value of [0,null,undefined]) assert.equal(hasSafetySignal([...Array(8).fill(3),value],ids,triggers),false);
});
test('unverified tools and unverified locales cannot be published',()=>{
  for(const tool of Object.values(registry.tools)) for(const lang of locales) assert.equal(canPublishScreening(tool,lang),false);
  const approved={version:'v1',source:'https://example.org/original',population:'adults',recallDays:14,rights:{status:'verified',evidence:'signed permission'},clinicalReview:{status:'approved',reviewer:'qualified reviewer',date:'2026-10-19'},locales:{en:{status:'verified',source:'original',reviewer:'reviewer',version:'v1'}}};
  assert.equal(canPublishScreening(approved,'en'),true);
  assert.equal(canPublishScreening(approved,'ar'),false);
  for(const field of ['clinicalReview','rights','version','source']) { const tool=structuredClone(approved); delete tool[field]; assert.equal(canPublishScreening(tool,'en'),false); }
});
test('private saved notes reject corrupt, oversized, wrong-version and wrong-locale data',()=>{
  const note=makeNote(['hello'],'grounding','ar');
  assert.deepEqual(parseNote(JSON.stringify(note),'grounding','ar',1),['hello']);
  for(const raw of ['{','null','[]',JSON.stringify({...note,version:2}),JSON.stringify({...note,fields:[3]}),JSON.stringify({...note,fields:['x'.repeat(2001)]})]) assert.equal(parseNote(raw,'grounding','ar',1),null);
  assert.equal(parseNote(JSON.stringify(note),'appointment','ar',1),null);
  assert.equal(parseNote(JSON.stringify(note),'grounding','en',1),null);
});
