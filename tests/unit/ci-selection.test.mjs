import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../..',import.meta.url));
const npmPath=process.env.npm_execpath;
const command=npmPath ? process.execPath : 'corepack';
const prefix=npmPath ? [npmPath,'--silent','run'] : ['pnpm','--silent','run'];

function selected(script){
  // Run the actual package command in list mode: this exercises the project
  // and tag filters without starting a browser, server or external service.
  const output=execFileSync(command,[...prefix,script,'--list','--reporter=json'],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
  const result=JSON.parse(output),cases=[];
  function collect(suite){
    for(const spec of suite.specs||[])for(const run of spec.tests||[]){
      const entry=`${run.projectName} :: ${spec.file} :: ${spec.title}`;
      if(script==='test:smoke')assert.equal(run.expectedStatus,'passed',`Routine case is marked skipped: ${entry}`);
      cases.push(entry);
    }
    for(const child of suite.suites||[])collect(child);
  }
  for(const suite of result.suites)collect(suite);
  return cases;
}

test('routine CI keeps essential safety/privacy paths while manual full retains the natural audio loop',()=>{
  const smoke=selected('test:smoke'),full=selected('test:e2e'),fullSet=new Set(full);
  assert(smoke.length>0 && full.length>smoke.length);
  for(const entry of smoke)assert(fullSet.has(entry),`Smoke case absent from full: ${entry}`);
  const requiredDesktop=[
    'partial and skipped forms never become normal; item-9 support survives skipping',
    'youth records have scores without adult bands and declining age keeps general support accessible',
    'function and elevated-energy context prioritise care independently of totals',
    'notes are voluntary, reload blank, load explicitly, export locally and delete',
  ];
  for(const title of requiredDesktop)assert(smoke.some(s=>s.startsWith('desktop-chromium :: ')&&s.includes(title)),`Missing critical desktop case: ${title}`);
  for(const project of ['desktop-chromium','mobile-chromium'])for(const title of [
    'en: check-in, self-help, help-seeking and disclaimer are connected',
    'ar: check-in, self-help, help-seeking and disclaimer are connected',
    'eight-language England and Japan routes',
    'mix ratios, master volume, return, repeated entry and stop preserve intent',
  ])assert(smoke.some(s=>s.startsWith(`${project} :: `)&&s.includes(title)),`Missing ${project} case: ${title}`);
  assert(full.some(s=>s.includes('real audio stays non-silent across a natural loop boundary')));
  assert(!smoke.some(s=>s.includes('real audio stays non-silent across a natural loop boundary')));
});
