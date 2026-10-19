// Server-only admission: unverified or changed forms never reach the browser.
import {createHash} from 'node:crypto';
import registry from '@/data/screening-registry.json';
import originals from '@/data/screening-forms.json';
import copy from '@/data/screening-copy.json';
import {canPublishScreening, SCREENING_SPECS} from './screening.mjs';
import type {Language} from './i18n';
export function getScreeningContent(lang:Language) {
  const forms: Record<string, {title:string;instruction:string;options:string[];questions:string[];impact?:string;impactOptions?:string[];source:string;version:string}>={};
  for(const id of ['phq-9','gad-7']) {
    const tool=registry.tools[id],form=originals[id][lang];
    if(!canPublishScreening(tool,lang))continue;
    if(!form || form.questions.length!==SCREENING_SPECS[id].count || form.options.length!==4 ||
      createHash('sha256').update(JSON.stringify(form)).digest('hex')!==tool.locales[lang].formSha256) throw new Error(`Changed screening source: ${id}/${lang}`);
    forms[id]={...form,source:tool.locales[lang].source,version:tool.version};
  }
  return {forms,copy:copy[lang],manual:registry.manual.url,rights:registry.tools['phq-9'].rights.evidence};
}
