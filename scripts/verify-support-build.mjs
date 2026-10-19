import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
const routes=['/','/check-in/','/self-help/','/self-help/grounding/','/self-help/one-step/','/self-help/sleep/','/self-help/worry/','/support/','/disclaimer/','/crisis/','/assessment/','/assessment/phq-9/','/assessment/gad-7/'];
const root=new URL('../dist/',import.meta.url);
let checked=0;
for(const lang of locales) for(const route of routes) {
  const local=`${lang==='en'?'':lang}${route}`.replace(/^\//,'');
  const html=readFileSync(new URL(`${local}index.html`,root),'utf8');
  assert.match(html,new RegExp(`<html[^>]*lang="${lang}"`));
  assert.match(html,new RegExp(`dir="${lang==='ar'?'rtl':'ltr'}"`));
  assert.match(html,/<h1[\s>]/);
  assert.doesNotMatch(html,/>\s*(?:ui|relax|support|resources)\.[\w.]+\s*</,'Unresolved translation');
  if(route!=='/') {
    assert.doesNotMatch(html,/static\.cloudflareinsights|fonts\.googleapis/,'Health pages must not load third-party telemetry or fonts');
  }
  if(route.startsWith('/assessment/')&&route!=='/assessment/') {
    assert.match(html,/data-screening-status="unavailable"/);
    assert.doesNotMatch(html,/name="answer"|questionnaire\.questions|"questionId"/);
  }
  for(const match of html.matchAll(/<(?:a|link)\b[^>]*?href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/g)) {
    const href=match[1]||match[2]||match[3];
    if(!href.startsWith('/')||href.startsWith('//'))continue;
    const pathname=decodeURIComponent(href.split(/[?#]/)[0]);
    const file=join(new URL('.',root).pathname,pathname,pathname.endsWith('/')?'index.html':'');
    assert.ok(existsSync(file),`${local}: broken local link ${href}`);
  }
  checked++;
}
console.log(`Support build verified: ${checked} localized pages, local links, language, privacy and screening availability.`);
