import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

const copy=JSON.parse(readFileSync(new URL('../../src/data/worry-copy.json',import.meta.url),'utf8'));
const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
test('worry flow has complete localized choices and privacy/help copy in all eight languages',()=>{
  assert.deepEqual(Object.keys(copy).sort(),[...locales].sort());
  for(const lang of locales){
    assert.deepEqual(Object.keys(copy[lang]),Object.keys(copy.en),lang);
    for(const [key,value] of Object.entries(copy[lang])){
      if(Array.isArray(value)){
        assert.equal(value.length,key==='partOptions'?5:3,`${lang}.${key}`);
        assert.equal(new Set(value).size,value.length,`${lang}.${key}`);
        value.forEach(text=>assert.ok(typeof text==='string'&&text.trim()));
      }else assert.ok(typeof value==='string'&&value.trim(),`${lang}.${key}`);
    }
    if(lang!=='en')for(const key of ['intro','focusHelp','contextPrivacy','whyText','whoHelp'])assert.notEqual(copy[lang][key],copy.en[key],`${lang}.${key}`);
  }
});

test('worry display labels follow local punctuation while questions keep their native marks',()=>{
  const keys=['focusTitle','examplesLabel','focusLabel','partTitle','partLabel','partPlaceholder','actionTitle','planEditor','reviewTitle','summaryTitle','feedbackTitle','editPlan','resetTitle','resetButton','whyTitle'];
  for(const lang of locales){
    for(const key of keys)assert.doesNotMatch(copy[lang][key],/[。।.]$/,`${lang}.${key}: UI label`);
    for(const key of keys){
      if(lang==='es'&&copy[lang][key].includes('?'))assert.ok(copy[lang][key].startsWith('¿'),key);
      if(lang==='ar')assert.doesNotMatch(copy[lang][key],/\?/,key);
    }
  }
});
