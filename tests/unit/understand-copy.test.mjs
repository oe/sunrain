import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
const load=lang=>JSON.parse(readFileSync(new URL(`../../src/data/understand/${lang}.json`,import.meta.url),'utf8'));
const canonical=load('en');

function complete(actual,reference,path) {
  if(typeof reference==='string') {
    assert.equal(typeof actual,'string',path);
    assert.ok(actual.trim(),`Missing health copy: ${path}`);
    assert.doesNotMatch(actual,/\{[^}]+\}|\[object Object\]/,`Unresolved copy: ${path}`);
  } else if(Array.isArray(reference)) {
    assert.ok(Array.isArray(actual),path);
    assert.equal(actual.length,reference.length,path);
    actual.forEach((item,i)=>complete(item,reference[i],`${path}[${i}]`));
  } else {
    assert.deepEqual(Object.keys(actual).sort(),Object.keys(reference).sort(),path);
    for(const key of Object.keys(reference))complete(actual[key],reference[key],`${path}.${key}`);
  }
}

test('all eight locales contain complete topic explanations, care boundaries and references copy',()=>{
  for(const locale of locales)complete(load(locale),canonical,locale);
});

test('non-English topic content is translated instead of silently reusing English health guidance',()=>{
  for(const locale of locales.filter(lang=>lang!=='en')) {
    const data=load(locale);
    for(const key of ['review','youngText','urgent','treatmentNote','referenceIntro'])
      assert.notEqual(data.common[key],canonical.common[key],`${locale}.${key}`);
    for(const topic of Object.keys(canonical.topics)) {
      for(const key of ['intro','context','care'])
        assert.notEqual(data.topics[topic][key],canonical.topics[topic][key],`${locale}.${topic}.${key}`);
    }
  }
});
