// Server-only admission: unverified or changed forms never reach the browser.
import {createHash} from 'node:crypto';
import registry from '@/data/screening-registry.json';
import originals from '@/data/screening-forms.json';
import copy from '@/data/screening-copy.json';
import k6Copy from '@/data/k6-copy.json';
import {canPublishScreening, SCREENING_SPECS} from './screening.mjs';
import type {Language} from './i18n';
export function getScreeningContent(lang:Language) {
  const forms: Record<string, {title:string;instruction:string;options:string[];questions:string[];impact?:string;impactOptions?:string[];source:string;version:string;optionValues:number[];label:string;meaning:string;recall:string;scope:string;guidance:string;manual:string;rights:string}>={};
  const s=copy[lang];
  for(const id of Object.keys(registry.tools)) {
    const tool=registry.tools[id],form=originals[id][lang];
    if(!canPublishScreening(tool,lang))continue;
    const spec=SCREENING_SPECS[id];
    if(!form || form.questions.length!==spec.count || form.options.length!==spec.optionValues.length ||
      createHash('sha256').update(JSON.stringify(form)).digest('hex')!==tool.locales[lang].formSha256) throw new Error(`Changed screening source: ${id}/${lang}`);
    const extra=id==='k6'?k6Copy[lang]:null;
    if(id==='k6'&&!extra)throw new Error(`Missing K6 guidance: ${lang}`);
    forms[id]={...form,source:tool.locales[lang].source,version:tool.version,optionValues:spec.optionValues,
      label:extra?.label||(id==='phq-9'?s.depression:s.anxiety),meaning:extra?.meaning||(id==='phq-9'?s.moodMeaning:s.worryMeaning),
      recall:extra?.recall||s.twoWeeks,scope:extra?.scope||'',guidance:extra?.guidance||'',
      manual:tool.manual?.url||registry.manual.url,rights:tool.rights.evidence};
  }
  const ids=['phq-9',forms.k6?'k6':'gad-7'];
  return {forms,ids,copy:s,manual:registry.manual.url,rights:registry.tools['phq-9'].rights.evidence};
}
