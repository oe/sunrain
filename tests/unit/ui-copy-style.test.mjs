import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read=path=>JSON.parse(readFileSync(new URL(`../../src/${path}`,import.meta.url),'utf8'));
const platform=read('data/platform-copy.json');
const support=read('data/support-copy.json').locales;
const terminalStops={en:/(?<!\.)\.$/,es:/(?<!\.)\.$/,ar:/(?<!\.)\.$/,ko:/(?<!\.)\.$/,hi:/(?<!\.)[।.]$/,ja:/(?<!\.)[。.]$/,'zh-hans':/(?<!\.)[。.]$/,'zh-hant':/(?<!\.)[。.]$/};
const platformLabels=['start','selfHelp','explore','support','supportAction','details','resultsDetails','record','recordActions','contact','guideTips','mix','rhythm','crisisAction','audioDetails','breathingReady','supportDetails','quickStart','groundingAction','oneStepAction','sleepAction','worryAction','soundsAction'];
const topicLabels=['nav','title','browse','back','open','signs','context','steps','treatment','care','references','checked','young','next','activity','support','checkIn','crisis','learnLink','more','selfHelpLink','sourcesLanguage','newTab'];

test('display headings and explicit UI fragments follow locale punctuation conventions',()=>{
  for(const locale of Object.keys(terminalStops)){
    const shared=read(`i18n/${locale}.json`),topics=read(`data/understand/${locale}.json`);
    function fragment(text,path){
      assert.equal(typeof text,'string',`${locale}.${path}`);
      assert.doesNotMatch(text.trim(),terminalStops[locale],`${locale}.${path}: heading or UI fragment, not prose`);
      // Questions keep the punctuation customary to their language. These
      // fields are Sunrain UI, never standardized questionnaire/source text.
      if(locale==='es'&&text.includes('?'))assert.ok(text.includes('¿'),`${path}: opening question mark`);
      if(locale==='ar')assert.doesNotMatch(text,/\?/,`${path}: use Arabic question marks`);
    }
    platform[locale].headline.forEach((line,i)=>fragment(line,`headline.${i}`));
    for(const key of platformLabels)fragment(platform[locale][key],`platform.${key}`);
    for(const [key,value] of Object.entries(shared.nav))fragment(value,`nav.${key}`);
    for(const key of ['back','next','finish','save','load','clear','download','feedback','note','summary'])fragment(support[locale].ui[key],`ui.${key}`);
    for(const [id,guide] of Object.entries(support[locale].guides))fragment(guide.title,`guide.${id}.title`);
    for(const key of topicLabels)fragment(topics.common[key],`understand.${key}`);
    for(const [id,topic] of Object.entries(topics.topics)){
      fragment(topic.title,`topic.${id}.title`);
      topic.treatments.forEach((entry,i)=>fragment(entry.title,`topic.${id}.treatment.${i}.title`));
    }
    fragment(shared.about.values.accessibility.description,'accessibility feature list');
    fragment(platform[locale].relaxIntro,'relaxation tagline');
    if(locale.startsWith('zh-')){
      for(const key of ['saved','deleted','empty','failed'])fragment(support[locale].ui[key],`ui.${key}`);
      for(const key of ['description','selfHelpDescription','supportDescription','supportIntro','guidesIntro','mixDescription','grounding','oneStep','sleep','worry'])fragment(platform[locale][key],`platform.${key}`);
      fragment(shared.footer.copyright,'footer copyright');
    }
    // Full sentences stay punctuated: this check intentionally does not scan
    // article bodies, safety explanations, references, examples or instruments.
  }
});
