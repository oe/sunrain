import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { calculateScore, getInterpretation, hasSafetySignal, canPublishScreening, makeScreeningReport } from '../../src/lib/screening.mjs';
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
test('only exact source-checked reference forms are admitted; restricted Japanese GAD-7 stays absent',()=>{
  const forms=read('../../src/data/screening-forms.json');
  for(const [id,tool] of Object.entries(registry.tools)) for(const lang of locales) {
    const available=!(id==='gad-7'&&lang==='ja');
    assert.equal(canPublishScreening(tool,lang),available);
    assert.equal(tool.clinicalReview.status,'pending');
    if(!available){assert.equal(forms[id][lang],undefined);continue;}
    assert.equal(createHash('sha256').update(JSON.stringify(forms[id][lang])).digest('hex'),tool.locales[lang].formSha256);
    assert.equal(forms[id][lang].questions.length,id==='phq-9'?9:7);
    assert.equal(forms[id][lang].options.length,4);
    assert.equal(new URL(tool.locales[lang].source).hostname,'www.phqscreeners.com');
  }
  const admitted=registry.tools['phq-9'];
  for(const field of ['mode','sourceCheck','rights','version','source']) { const tool=structuredClone(admitted); delete tool[field]; assert.equal(canPublishScreening(tool,'en'),false); }
  for(const field of ['formSha256','sourceSha256','version','status','source']) {const tool=structuredClone(admitted);delete tool.locales.en[field];assert.equal(canPublishScreening(tool,'en'),false);}
  const wrong=structuredClone(admitted);wrong.locales.en.version='different';assert.equal(canPublishScreening(wrong,'en'),false);
  assert.equal(canPublishScreening(admitted,'unknown'),false);
});
test('screening reports preserve completeness and never apply adult severity bands to youth',()=>{
  for(const [id,count,max]of [['phq-9',9,27],['gad-7',7,21]]){
    const youth=makeScreeningReport(id,Array(count).fill(3),'youth');
    assert.equal(youth.score,max);assert.equal(youth.band,null);
    assert.equal(makeScreeningReport(id,Array(count).fill(3),'adult').band,4);
    for(const age of ['child','declined','',null])assert.throws(()=>makeScreeningReport(id,Array(count).fill(0),age));
    for(const answers of [Array(count),Array(count).fill(null),Array(count-1).fill(0),Array(count).fill('0')])assert.throws(()=>makeScreeningReport(id,answers,'adult'));
    for(const status of ['skipped','notSelected','unavailable']){
      const report=makeScreeningReport(id,[], 'adult',status);
      assert.equal(report.score,null);assert.equal(report.band,null);assert.equal(report.status,status);
    }
  }
  assert.equal(makeScreeningReport('phq-9',[0,0,0,0,0,0,0,0,1],'adult').safety,true);
  assert.equal(makeScreeningReport('phq-9',[0,0,0,0,0,0,0,0,1],'adult').band,0);
  assert.equal(makeScreeningReport('gad-7',Array(7).fill(0),'adult').safety,false);
});
test('screening guidance and disclaimers are complete in all eight languages',()=>{
  const copy=read('../../src/data/screening-copy.json');
  assert.deepEqual(Object.keys(copy).sort(),[...locales].sort());
  for(const locale of locales){
    assert.deepEqual(paths(copy[locale]),paths(copy.en));
    for(const key of paths(copy.en))assert.ok(key.split('.').reduce((v,k)=>v[k],copy[locale]).trim(),`${locale}.${key}`);
    assert.equal(copy[locale].bands.length,5);assert.equal(copy[locale].ageOptions.length,5);
  }
});
test('private saved notes reject corrupt, oversized, wrong-version and wrong-locale data',()=>{
  const note=makeNote(['hello'],'grounding','ar');
  assert.deepEqual(parseNote(JSON.stringify(note),'grounding','ar',1),['hello']);
  for(const raw of ['{','null','[]',JSON.stringify({...note,version:2}),JSON.stringify({...note,fields:[3]}),JSON.stringify({...note,fields:['x'.repeat(2001)]})]) assert.equal(parseNote(raw,'grounding','ar',1),null);
  assert.equal(parseNote(JSON.stringify(note),'appointment','ar',1),null);
  assert.equal(parseNote(JSON.stringify(note),'grounding','en',1),null);
});
