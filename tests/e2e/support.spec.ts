import { test, expect, type Page } from 'playwright/test';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
const copy=JSON.parse(await readFile(new URL('../../src/data/support-copy.json',import.meta.url),'utf8')).locales;
const screeningCopy=JSON.parse(await readFile(new URL('../../src/data/screening-copy.json',import.meta.url),'utf8'));
const path=(locale:string,route:string)=>`${locale==='en'?'':`/${locale}`}${route}`;
async function entranceSettled(page:Page,selector='body'){
  await page.locator(selector).evaluate(async el=>{
    await Promise.all(el.getAnimations({subtree:true})
      .filter(animation=>animation.effect?.getTiming().iterations!==Infinity)
      .map(animation=>animation.finished.catch(()=>{})));
  });
}
async function alignedStepActions(page:Page,step:number){
  const actions=page.locator(`[data-step="${step}"] .step-actions`);
  await actions.scrollIntoViewIfNeeded();
  const buttons=actions.locator('button');
  const back=await buttons.nth(0).boundingBox(),next=await buttons.nth(1).boundingBox();
  expect(Math.abs(back.y-next.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(back.height-next.height)).toBeLessThanOrEqual(1);
  expect(back.height).toBeGreaterThanOrEqual(44);
  expect(back.width).toBeGreaterThanOrEqual(44);
  const rtl=await page.locator('html').getAttribute('dir')==='rtl';
  expect(rtl?back.x>next.x:back.x<next.x).toBe(true);
  // WebKit may scroll a target during hover. Compare document coordinates so
  // normal scrolling is not mistaken for a button moving within its row.
  const documentTop=await buttons.nth(0).evaluate(el=>el.getBoundingClientRect().top+scrollY);
  await buttons.nth(0).hover();
  const hoveredTop=await buttons.nth(0).evaluate(el=>el.getBoundingClientRect().top+scrollY);
  expect(Math.abs(hoveredTop-documentTop)).toBeLessThanOrEqual(1);
}
// Production build, isolated browser engines. The Browser skill is present but its js
// connection is not callable in this environment; repository Playwright is used.
// Flow: home -> check-in -> select concerns -> practical support -> prepare help.
test.beforeEach(async({page})=>{
  // Home retains analytics. Do not send localhost test traffic to its provider;
  // health-page script exclusion is still asserted below and in build checks.
  await page.route('https://static.cloudflareinsights.com/**',route=>route.fulfill({
    status:200,contentType:'application/javascript',body:'',
    headers:{'access-control-allow-origin':'*'},
  }));
});
for(const locale of locales) {
  test(`${locale}: check-in, self-help, help-seeking and disclaimer are connected`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(path(locale,'/'));
    await page.locator('#home-check-in').click();
    await expect(page).toHaveURL(new RegExp(`${path(locale,'/check-in/')}.*$`));
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');
    const title=await page.title();
    await expect(page.locator('[data-step="0"] [data-forward]')).toBeEnabled();
    await expect(page.locator('[data-step="0"] input')).toHaveCount(0);
    await expect(page.locator('#adult-check')).toHaveCount(0);
    await expect(page.locator('[data-step="0"] [data-youth-support]')).toHaveText(copy[locale].ui.younger);
    await page.locator('[data-step="0"] [data-forward]').click();
    const questionBounds=await page.locator('[data-step="1"] legend').boundingBox();
    const navigationBounds=await page.locator('#main-header').boundingBox();
    expect(questionBounds.y).toBeGreaterThanOrEqual(navigationBounds.y+navigationBounds.height+8);
    await alignedStepActions(page,1);
    await page.locator('input[value="mood"]').check();
    await page.locator('input[value="worry"]').check();
    await page.locator('[data-step="1"] [data-forward]').click();
    await alignedStepActions(page,2);
    await page.locator('[data-step="2"] [data-back]').click();
    await expect(page.locator('input[value="mood"]')).toBeChecked();
    await page.locator('[data-step="1"] [data-forward]').click();
    await page.locator('input[value="weeks"]').check();
    await page.locator('input[value="disruptive"]').check();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#check-in-result')).toBeVisible();
    await expect(page.locator('#result-title')).toBeFocused();
    expect((await page.locator('#result-title').boundingBox()).y).toBeGreaterThanOrEqual(navigationBounds.height+8);
    await expect(page.locator('[data-action="grounding"]')).toBeHidden();
    await expect(page.locator('[data-action="one-step"]')).toBeVisible();
    expect(await page.title()).toBe(title);
    expect(new URL(page.url()).search).toBe('');expect(new URL(page.url()).hash).toBe('');
    expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
    expect(await page.evaluate(()=>Object.keys(sessionStorage))).toEqual([]);
    await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0);
    // Preparing care keeps the existing answers in the same document. No
    // browser storage, URL parameters or external handoff carries health data.
    await page.locator('#check-in-result .support-grid [data-prepare-support]').click();
    await expect(page.locator('#prepare-support')).toHaveAttribute('open','');
    const fields=page.locator('#prepare-support [data-note-field]');
    await expect(fields.nth(0)).toHaveValue(`${copy[locale].ui.mood} · ${copy[locale].ui.worry}`);
    await expect(fields.nth(1)).toHaveValue(copy[locale].ui.weeks);
    await expect(fields.nth(2)).toHaveValue(copy[locale].ui.disruptive);
    await page.locator('#support-region').selectOption('JP');
    await expect(page.locator('[data-service-region="JP"]')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${path(locale,'/check-in/')}.*$`));
    expect(new URL(page.url()).hash).toBe('');
    expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
    expect(await page.evaluate(()=>Object.keys(sessionStorage))).toEqual([]);
    await page.locator('[data-action="one-step"] a').click();
    await expect(page.locator('#inline-activity')).toBeVisible();
    const activityBack=await page.locator('[data-activity-close]').boundingBox();
    const activityCard=await page.locator('#guided-activity').boundingBox();
    expect(activityCard.y-activityBack.y-activityBack.height).toBeGreaterThanOrEqual(15.99);
    await expect(page).toHaveURL(new RegExp(`${path(locale,'/check-in/')}.*$`));
    await expect(page.locator('#guided-activity ol li')).toHaveCount(4);
    const example=page.locator('input[name="activity-example"]').first();
    const chosen=await example.inputValue();await example.check();
    await expect(page.locator('[data-activity-note] [data-note-field]').first()).toHaveValue(chosen);
    for(let i=0;i<3;i++)await page.locator('#guide-next').click();
    await expect(page.locator('#guide-finish')).toBeVisible();
    await page.locator('#guide-finish').click();
    await page.locator('input[value="worse"]').check();
    await expect(page.locator('#feedback-worse')).toBeVisible();
    await expect(page.locator('#feedback-urgent')).toBeVisible();
    await expect(page.locator('#other-activities')).toBeHidden();
    await page.locator('#activity-reflection [data-prepare-support]').click();
    await expect(page.locator('#prepare-support [data-note-field]').nth(3)).toHaveValue(new RegExp(chosen.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    await expect(fields.nth(0)).toHaveValue(`${copy[locale].ui.mood} · ${copy[locale].ui.worry}`);
    await expect(fields.nth(1)).toHaveValue(copy[locale].ui.weeks);
    expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
    expect(await page.evaluate(()=>Object.keys(sessionStorage))).toEqual([]);
    await page.goto(path(locale,'/support/'));
    await expect(page.locator('#support-region')).toHaveValue('');
    await expect(page.locator('ol li')).toHaveCount(6);
    await expect(page.locator('[data-note-field]')).toHaveCount(5);
    await page.locator('#support-region').selectOption('GB-ENG');
    await expect(page.locator('[data-youth-service] a')).toHaveAttribute('href','https://www.nhs.uk/mental-health/children-and-young-adults/mental-health-support/how-to-get-support/where-to-get-support/');
    await expect(page.locator('[data-youth-service]')).toContainText(copy[locale].services['GB-ENG'].youthInstructions);
    await page.locator('#support-region').selectOption('US');
    await expect(page.locator('[data-service-region="US"]')).toBeVisible();
    await expect(page.locator('[data-service-region="GB-ENG"]')).toBeHidden();
    await page.locator('#support-region').selectOption('other');
    await expect(page.locator('#service-fallback')).toBeVisible();
    await expect(page.locator('[data-contact-preview]')).not.toContainText('{concern}');
    await page.goto(path(locale,'/crisis/'));
    await expect(page.locator('#crisis-fallback')).toHaveText(copy[locale].flow.crisisFallback);
    await expect(page.locator('main')).not.toContainText(copy[locale].seekHelp.noService);
    await page.goto(path(locale,'/disclaimer/'));
    await expect(page.locator('h1')).not.toBeEmpty();
    await expect(page.locator('astro-error-overlay')).toHaveCount(0);
    expect(errors).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
test('skipping questions shows no score; reload clears responses',async({page})=>{
  await page.goto('/check-in/');await page.locator('[data-step="0"] [data-forward]').click();await page.locator('[data-step="1"] [data-forward]').click();await page.locator('button[type="submit"]').click();
  await expect(page.locator('#check-in-result')).toBeVisible();
  await expect(page.locator('#result-summary')).toContainText('Skip / leave unanswered');
  await expect(page.locator('[data-action="choose"]')).toBeVisible();
  await expect(page.locator('[data-action="one-step"]')).toBeHidden();
  await expect(page.locator('[data-action="grounding"]')).toBeHidden();
  await page.reload();await expect(page.locator('#check-in-result')).toBeHidden();await expect(page.locator('[data-step="0"] [data-forward]')).toBeEnabled();
});
test('unusually high energy directs to care and does not present a diagnosis',async({page})=>{
  await page.goto('/check-in/');await page.locator('[data-step="0"] [data-forward]').click();await page.locator('input[value="energy"]').check();await page.locator('[data-step="1"] [data-forward]').click();await page.locator('button[type="submit"]').click();
  await expect(page.locator('#energy-care')).toBeVisible();await expect(page.locator('[data-action="grounding"]')).toBeHidden();await expect(page.locator('[data-action="one-step"]')).toBeHidden();
  await expect(page.locator('#energy-care')).toContainText('cannot tell');
  await expect(page.locator('[data-action="sleep"]')).toBeHidden();
  await expect(page.locator('[data-note-field]').first()).toHaveValue('Unusually high energy or needing much less sleep');
});
test('notes are voluntary, reload blank, load explicitly, export locally and delete',async({page})=>{
  const requests:{url:string;body:string}[]=[];page.on('request',r=>requests.push({url:r.url(),body:r.postData()||''}));
  await page.goto('/support/');const fields=page.locator('[data-note-field]');
  await fields.nth(0).fill('<private concern>');await fields.nth(1).fill('three weeks');await fields.nth(2).fill('sleep');
  await expect(page.locator('[data-contact-preview]')).toContainText('<private concern>');
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
  await page.locator('[data-note-action="save"]').click();await expect(page.locator('[data-note-status]')).toContainText('Saved on this device');
  await page.reload();await expect(fields.nth(0)).toHaveValue('');
  await page.locator('[data-note-action="load"]').click();await expect(fields.nth(0)).toHaveValue('<private concern>');
  const pending=page.waitForEvent('download');await page.locator('[data-note-action="download"]').click();const download=await pending;const file=await download.path();expect(await readFile(file,'utf8')).toContain('<private concern>');
  await page.locator('[data-note-action="clear"]').click();await expect(fields.nth(0)).toHaveValue('');
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
  expect(requests.filter(r=>!r.url.startsWith('http://127.0.0.1:4362/'))).toEqual([]);
  // Match actual test values in URLs and request bodies. Public filenames such
  // as private-notes.js are not the user's private content.
  for(const value of ['<private concern>','three weeks']){
    expect(requests.some(r=>[r.url,r.body].some(text=>text.includes(value)||text.includes(encodeURIComponent(value))))).toBe(false);
  }
});
test('storage denial leaves theme, menu, notes and download usable',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));
  await page.goto('/support/');await page.locator('[data-note-field]').first().fill('private note');
  await page.locator('[data-note-action="save"]').click();await expect(page.locator('[data-note-status]')).toContainText('Could not save');
  const download=page.waitForEvent('download');await page.locator('[data-note-action="download"]').click();await download;
  await page.locator('#theme-toggle').click();await expect(page.locator('#theme-menu')).toBeVisible();
  expect(errors).toEqual([]);
});
test('clipboard denial retains the message and offers a working local download',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new DOMException('Blocked','NotAllowedError');}}}));
  await page.goto('/support/');await page.locator('[data-note-field]').first().fill('Example appointment concern');
  await page.locator('[data-note-field]').nth(4).fill('Question about cost');
  await page.locator('[data-note-action="copy"]').click();
  await expect(page.locator('[data-note-status]')).toHaveText(copy.en.flow.copyFailed);
  await expect(page.locator('[data-contact-preview]')).toContainText('Question about cost');
  const pending=page.waitForEvent('download');await page.locator('[data-note-action="download"]').click();
  const download=await pending;const file=await download.path();const message=await readFile(file,'utf8');
  expect(message).toContain('Example appointment concern');expect(message).toContain('Question about cost');
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
});
test('assessment bookmarks explain exact locale availability and preserve legacy deletion',async({page})=>{
  for(const locale of locales) for(const id of ['phq-9','gad-7']) {
    await page.goto(path(locale,`/assessment/${id}/`));await expect(page.locator(`[data-screening-status="${locale==='ja'&&id==='gad-7'?'unavailable':'available'}"]`)).toBeVisible();await expect(page.locator('input[type="radio"]')).toHaveCount(0);
  }
  await page.goto('/assessment/');await page.evaluate(()=>localStorage.setItem('sunrain_assessment_results','[{"answers":[3]}]'));await page.locator('#clear-legacy-history').click();expect(await page.evaluate(()=>localStorage.getItem('sunrain_assessment_results'))).toBeNull();
});

async function startScreening(page:Page,locale='en',age='adult'){
  await page.goto(path(locale,'/check-in/'));
  await page.locator('#start-screening').click();
  await page.locator('#screening-age').selectOption(age);
  await page.locator('#screening-start-tools').click();
}
async function answerTool(page:Page,id:string,answers:number[]){
  for(const [i,value]of answers.entries())await page.locator(`input[name="screening-${id}-${i}"][value="${value}"]`).check();
  await page.locator(`[data-screen-stage="${id}"] [data-screening-next]`).click();
}
for(const locale of locales){
  test(`${locale}: source screening connects separate results to inline self-help and care`,async({page})=>{
    const errors:string[]=[],requests:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
    await startScreening(page,locale);
    const title=await page.title();
    await expect(page.locator('[data-screen-stage="phq-9"]')).toBeVisible();
    await answerTool(page,'phq-9',[2,2,2,2,2,2,2,2,0]);
    if(locale==='ja'){
      await expect(page.locator('[data-screen-stage="gad-7"]')).toHaveCount(0);
      await expect(page.locator('[data-screen-stage="context"]')).toBeVisible();
    }else await answerTool(page,'gad-7',Array(7).fill(1));
    await page.locator('#screening-finish').click();
    await expect(page.locator('#result-title')).toHaveText(screeningCopy[locale].results);
    await expect(page.locator('[data-screening-report="phq-9"] [data-report-score]')).toHaveText('16 / 27');
    await expect(page.locator('[data-screening-report="phq-9"] [data-report-band]')).toContainText(screeningCopy[locale].bands[3]);
    await expect(page.locator('[data-screening-report="gad-7"] [data-report-score]')).toHaveText(locale==='ja'?screeningCopy[locale].availability:'7 / 21');
    await expect(page.locator('[data-action="one-step"]')).toBeVisible();
    if(locale!=='ja')await expect(page.locator('[data-action="worry"]')).toBeVisible();
    await expect(page.locator('#screening-result-safety')).toBeHidden();
    // The same private document carries scores, exact version and sources into
    // an editable care record. Only explicit save/download persists that record.
    await page.locator('#result-options [data-prepare-support]').click();
    const notes=page.locator('#prepare-support [data-note-field]');
    await expect(notes.nth(0)).toHaveValue(/16 \/ 27/);
    await expect(notes.nth(0)).toHaveValue(/phqscreeners-201412/);
    await expect(notes.nth(0)).toHaveValue(/https:\/\/www.phqscreeners.com/);
    expect((await notes.nth(0).inputValue()).length).toBeLessThanOrEqual(2000);
    await expect(notes.nth(1)).toHaveValue(screeningCopy[locale].twoWeeks);
    await notes.nth(0).fill('My own care summary');
    await page.locator('[data-action="one-step"] a').click();
    await expect(page.locator('#inline-activity')).toBeVisible();
    for(let i=0;i<3;i++)await page.locator('#guide-next').click();
    await page.locator('#guide-finish').click();
    await page.locator('input[value="same"]').check();
    await page.locator('#activity-reflection [data-prepare-support]').click();
    await expect(notes.nth(0)).toHaveValue('My own care summary');
    // Questionnaire revision cannot resurrect stale results or overwrite edits.
    await page.locator('[data-activity-close]').click();
    await page.locator('#screening-revise').click();
    await page.locator('#screening-start-tools').click();
    await expect(page.locator('input[name="screening-phq-9-0"][value="2"]')).toBeChecked();
    await answerTool(page,'phq-9',Array(9).fill(0));
    if(locale!=='ja')await answerTool(page,'gad-7',Array(7).fill(0));
    await page.locator('#screening-finish').click();
    await expect(page.locator('[data-screening-report="phq-9"] [data-report-score]')).toHaveText('0 / 27');
    await expect(notes.nth(0)).toHaveValue('My own care summary');
    await expect(page.locator('[data-action="choose"]')).toBeVisible();
    expect(await page.title()).toBe(title);expect(new URL(page.url()).search).toBe('');expect(new URL(page.url()).hash).toBe('');
    expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
    expect(await page.evaluate(()=>Object.keys(sessionStorage))).toEqual([]);
    expect(requests.some(url=>/screening|answers|score=|symptoms=/.test(new URL(url).search))).toBe(false);
    expect(requests.filter(url=>new URL(url).origin!=='http://127.0.0.1:4362')).toEqual([]);
    expect(errors).toEqual([]);
    await page.reload();await expect(page.locator('#check-in-result')).toBeHidden();
    await expect(page.locator('#screening-age')).toHaveValue('');
    await expect(page.locator('#screening-flow input[type="radio"]:checked')).toHaveCount(0);
    await expect(notes.nth(0)).toHaveValue('');
  });
}
test('partial and skipped forms never become normal; item-9 support survives skipping with a low total',async({page})=>{
  await startScreening(page);
  await page.locator('[data-screen-stage="phq-9"] [data-screening-next]').click();
  await expect(page.locator('[data-screen-stage="phq-9"] [data-screening-error]')).toHaveText(screeningCopy.en.answerError);
  await expect(page.locator('input[name="screening-phq-9-0"][value="0"]')).toBeFocused();
  await page.locator('input[name="screening-phq-9-8"][value="1"]').check();
  await expect(page.locator('#screening-live-safety')).toBeVisible();
  await page.locator('[data-screen-stage="phq-9"] [data-screening-skip]').click();
  await answerTool(page,'gad-7',Array(7).fill(0));await page.locator('#screening-finish').click();
  await expect(page.locator('[data-screening-report="phq-9"] [data-report-score]')).toHaveText(screeningCopy.en.unanswered);
  await expect(page.locator('[data-screening-report="phq-9"] [data-report-band]')).toBeHidden();
  await expect(page.locator('#screening-result-safety')).toBeVisible();
  await page.locator('#screening-revise').click();await page.locator('#screening-start-tools').click();
  await answerTool(page,'phq-9',[0,0,0,0,0,0,0,0,1]);await answerTool(page,'gad-7',Array(7).fill(0));
  await page.locator('#screening-finish').click();
  await expect(page.locator('[data-screening-report="phq-9"] [data-report-score]')).toHaveText('1 / 27');
  await expect(page.locator('#screening-result-safety')).toBeVisible();
  await expect(page.locator('[data-screening-report="gad-7"] [data-report-score]')).toHaveText('0 / 21');
});
test('youth records have scores without adult bands and declining age keeps general support accessible',async({page})=>{
  await startScreening(page,'zh-hans','youth');
  await answerTool(page,'phq-9',Array(9).fill(3));await answerTool(page,'gad-7',Array(7).fill(3));await page.locator('#screening-finish').click();
  await expect(page.locator('[data-screening-report="phq-9"] [data-report-score]')).toHaveText('27 / 27');
  await expect(page.locator('[data-screening-report="phq-9"] [data-report-next]')).toHaveText(screeningCopy['zh-hans'].youthResult);
  await expect(page.locator('[data-report-band]:visible')).toHaveCount(0);
  await expect(page.locator('#screening-result-safety')).toBeVisible();
  for(const age of ['child','declined']){
    await page.goto('/check-in/');await page.locator('#start-screening').click();await page.locator('#screening-age').selectOption(age);
    await expect(page.locator('#screening-start-tools')).toBeDisabled();await expect(page.locator('#screening-age-alternative')).toBeVisible();
    await page.locator('[data-screening-exit]').click();await expect(page.locator('[data-step="1"]')).toBeVisible();
    await expect(page.locator('#screening-age')).toHaveValue('');
  }
});
test('function and elevated-energy context prioritise care independently of totals',async({page})=>{
  await startScreening(page);
  for(let i=0;i<9;i++)await page.locator(`input[name="screening-phq-9-${i}"][value="0"]`).check();
  await page.locator('input[name="screening-impact"][value="3"]').check();
  await page.locator('[data-screen-stage="phq-9"] [data-screening-next]').click();
  await answerTool(page,'gad-7',Array(7).fill(0));await page.locator('#screening-energy').check();await page.locator('#screening-finish').click();
  await expect(page.locator('#screening-functional-care')).toBeVisible();await expect(page.locator('#energy-care')).toBeVisible();
  await expect(page.locator('[data-action]:visible')).toHaveCount(0);
  await expect(page.locator('[data-screening-report="phq-9"] [data-report-score]')).toHaveText('0 / 27');
  await page.locator('#energy-care [data-prepare-support]').click();await expect(page.locator('#prepare-support')).toHaveAttribute('open','');
});
test('skipping a scored form retains volunteered functional difficulty in support and complete export',async({page})=>{
  await startScreening(page);
  await page.locator('input[name="screening-impact"][value="3"]').check();
  await page.locator('[data-screen-stage="phq-9"] [data-screening-skip]').click();
  await answerTool(page,'gad-7',Array(7).fill(0));await page.locator('#screening-finish').click();
  await expect(page.locator('[data-screening-report="phq-9"] [data-report-score]')).toHaveText(screeningCopy.en.unanswered);
  await expect(page.locator('#screening-functional-care')).toBeVisible();
  await page.locator('#screening-functional-care [data-prepare-support]').click();
  await expect(page.locator('#prepare-support [data-note-field]').nth(2)).toHaveValue('Extremely difficult');
  const pending=page.waitForEvent('download');await page.locator('#screening-export').click();
  const download=await pending;const record=await readFile(await download.path(),'utf8');
  expect(record).toContain('If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?\nExtremely difficult');
});
test('unselected tools and all-skipped screens remain unassessed',async({page})=>{
  await page.goto('/check-in/');await page.locator('#start-screening').click();await page.locator('#screening-start-tools').click();
  await expect(page.locator('#screening-selection-error')).toHaveText(screeningCopy.en.selectError);
  await page.locator('#screening-age').selectOption('adult');await page.locator('input[name="screening-tool"][value="gad-7"]').uncheck();
  await page.locator('#screening-start-tools').click();await page.locator('[data-screen-stage="phq-9"] [data-screening-skip]').click();await page.locator('#screening-finish').click();
  await expect(page.locator('[data-screening-report="phq-9"] [data-report-score]')).toHaveText(screeningCopy.en.unanswered);
  await expect(page.locator('[data-screening-report="gad-7"] [data-report-score]')).toHaveText(screeningCopy.en.notSelected);
  await expect(page.locator('[data-report-band]:visible')).toHaveCount(0);
});
test('complete response export is explicit, includes sources and answers, and does not save browser history',async({page})=>{
  await startScreening(page);
  await answerTool(page,'phq-9',[1,1,1,1,1,1,1,1,0]);await answerTool(page,'gad-7',Array(7).fill(1));await page.locator('#screening-finish').click();
  const pending=page.waitForEvent('download');await page.locator('#screening-export').click();
  const download=await pending;expect(download.suggestedFilename()).toBe('sunrain-screening-record.txt');
  const record=await readFile(await download.path(),'utf8');
  expect(record).toContain('8 / 27');expect(record).toContain('7 / 21');
  expect(record).toContain('Little interest or pleasure in doing things\nSeveral days');
  expect(record).toContain('Thoughts that you would be better off dead or of hurting yourself in some way\nNot at all');
  expect(record).toContain('https://www.phqscreeners.com/');expect(record).toContain(screeningCopy.en.notes);
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
  await page.locator('#result-options [data-prepare-support]').click();
  await page.locator('#prepare-support [data-note-action="save"]').click();
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual(['sunrain_note_v1:check-in-appointment:en']);
  await page.goto('/disclaimer/');await page.locator('#delete-all-notes').click();
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
});
test('screening radio options and results work by keyboard and remain within a narrow RTL layout',async({page})=>{
  await page.setViewportSize({width:320,height:720});
  await startScreening(page,'ar');
  await page.addStyleTag({content:'::-webkit-scrollbar{width:15px}'});
  await entranceSettled(page);
  const number=await page.locator('[data-screen-stage="phq-9"] legend bdi').first().boundingBox();
  const stem=await page.locator('[data-screen-stage="phq-9"] [data-question-text]').first().boundingBox();
  expect(Math.abs(number.y-stem.y)).toBeLessThanOrEqual(1);
  expect(number.x).toBeGreaterThanOrEqual(stem.x+stem.width);
  const first=page.locator('input[name="screening-phq-9-0"][value="0"]');
  await first.focus();await page.keyboard.press('Space');await expect(first).toBeChecked();
  await page.keyboard.press('ArrowDown');await expect(page.locator('input[name="screening-phq-9-0"][value="1"]')).toBeChecked();
  await answerTool(page,'phq-9',Array(9).fill(0));
  await answerTool(page,'gad-7',Array(7).fill(0));await page.locator('#screening-finish').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  await expect(page.locator('#result-title')).toBeFocused();
});
test('self-help and provider instructions remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4362/zh-hans/self-help/grounding/');await expect(page.locator('#guided-activity ol li')).toHaveCount(4);
  await page.goto('http://127.0.0.1:4362/zh-hans/support/');await expect(page.locator('ol li')).toHaveCount(6);await expect(page.locator('noscript a[href="https://findtreatment.gov/"]')).toBeVisible();
  await expect(page.locator('noscript a[href="https://www.nhs.uk/mental-health/children-and-young-adults/mental-health-support/how-to-get-support/where-to-get-support/"]')).toBeVisible();await context.close();
});
test('Arabic responsive layout and visible flow screenshots',async({page},testInfo)=>{
  await page.goto('/ar/check-in/');await page.locator('[data-step="0"] [data-forward]').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const file=join(tmpdir(),`sunrain-check-in-ar-${testInfo.project.name}.png`);await page.screenshot({path:file,fullPage:true});
  await testInfo.attach('Arabic check-in',{path:file,contentType:'image/png'});
  await page.goto('/zh-hans/support/');await page.locator('#support-region').selectOption('US');await page.locator('[data-note-field]').first().fill('最近很难集中注意力');
  const supportFile=join(tmpdir(),`sunrain-support-zh-${testInfo.project.name}.png`);await page.screenshot({path:supportFile,fullPage:true});await testInfo.attach('Help preparation',{path:supportFile,contentType:'image/png'});
});

test('sleep and worry lead to specific four-step guides, with care available throughout',async({page})=>{
  for(const locale of locales) for(const id of ['sleep','worry']) {
    await page.goto(path(locale,`/self-help/${id}/`));await expect(page.locator('#guided-activity ol li')).toHaveCount(4);
    await page.locator('input[value="same"]').check();await expect(page.locator('#feedback-same')).toBeVisible();
    await expect(page.locator('#activity-reflection [data-prepare-support]')).toBeVisible();
  }
});

test('explicit skip clears selected answers and all basic-needs results offer care first',async({page})=>{
  await page.goto('/check-in/');await page.locator('[data-step="0"] [data-forward]').click();
  await page.locator('input[value="mood"]').check();await page.locator('[data-step="1"] [data-skip]').click();
  await page.locator('input[value="basicNeeds"]').check();await page.locator('button[type="submit"]').click();
  await expect(page.locator('#function-care')).toBeVisible();
  await expect(page.locator('[data-action]:visible')).toHaveCount(0);
  await page.locator('#function-care [data-prepare-support]').click();
  await expect(page.locator('#prepare-support [data-note-field]').first()).toHaveValue('');
  await expect(page.locator('#prepare-support [data-note-field]').nth(2)).toHaveValue(copy.en.ui.basicNeeds);
  await page.reload();await expect(page.locator('#check-in-result')).toBeHidden();
  await expect(page.locator('#prepare-support [data-note-field]').nth(2)).toHaveValue('');
});

test('privacy page deletes notes across languages without touching unrelated storage',async({page})=>{
  await page.goto('/disclaimer/');
  await page.evaluate(()=>{localStorage.setItem('sunrain_note_v1:appointment:ar','{}');localStorage.setItem('sunrain_note_v1:grounding:en','{}');localStorage.setItem('sunrain_assessment_results','[]');localStorage.setItem('theme','dark');});
  await page.locator('#delete-all-notes').click();
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
  expect(await page.evaluate(()=>localStorage.getItem('theme'))).toBe('dark');
});

test('legacy English bookmarks remain available with a canonical default-language URL',async({page})=>{
  await page.goto('/en/crisis/');await expect(page.locator('h1')).toContainText('Crisis');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://sunrain.me/crisis/');
});

test('long activity plans remain intact and personal edits survive another preparation',async({page})=>{
  await page.goto('/self-help/one-step/');
  const fields=page.locator('[data-activity-note] [data-note-field]');
  const plan='Example plan '.repeat(150);
  const timing='Example timing '.repeat(100);
  await fields.nth(0).fill(plan);await fields.nth(1).fill(timing);
  await page.locator('input[value="same"]').check();
  await page.locator('#activity-reflection [data-prepare-support]').click();
  await expect(page.locator('#preparation-status')).toHaveText(copy.en.flow.recordTruncated);
  await expect(fields.nth(0)).toHaveValue(plan);await expect(fields.nth(1)).toHaveValue(timing);
  const carried=page.locator('#prepare-support [data-note-field]').nth(3);
  expect((await carried.inputValue()).length).toBeLessThanOrEqual(2000);
  await carried.fill('My own edited account');
  await page.locator('input[value="better"]').check();
  await page.locator('#activity-reflection [data-prepare-support]').click();
  await expect(carried).toHaveValue('My own edited account');
  await expect(page.locator('#preparation-status')).toBeEmpty();
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
});

test('keyboard alone can reach, complete and carry a check-in into help preparation',async({page})=>{
  await page.goto('/check-in/');
  async function tabTo(selector:string){
    const control=page.locator(selector);
    for(let i=0;i<40;i++){
      if(await control.evaluate(el=>el===document.activeElement))return;
      await page.keyboard.press('Tab');
    }
    await expect(control).toBeFocused();
  }
  await tabTo('[data-step="0"] [data-forward]');await page.keyboard.press('Enter');
  await tabTo('input[value="mood"]');await page.keyboard.press('Space');
  await tabTo('[data-step="1"] [data-forward]');await page.keyboard.press('Enter');
  await tabTo('input[value="recent"]');await page.keyboard.press('Space');
  await tabTo('input[value="manageable"]');await page.keyboard.press('ArrowDown');
  await tabTo('button[type="submit"]');await page.keyboard.press('Enter');
  await expect(page.locator('#result-title')).toBeFocused();
  await tabTo('#result-options [data-prepare-support]');await page.keyboard.press('Enter');
  await expect(page.locator('#preparation-title')).toBeFocused();
  await expect(page.locator('#prepare-support [data-note-field]').first()).toHaveValue(copy.en.ui.mood);
  await expect(page.locator('#prepare-support [data-note-field]').nth(2)).toHaveValue(copy.en.ui.disruptive);
});

test('320px layouts keep navigation intact and translated Back actions on one row',async({page})=>{
  await page.setViewportSize({width:320,height:720});
  for(const [i,locale] of locales.entries()){
    await page.emulateMedia({colorScheme:i%2?'dark':'light',reducedMotion:'reduce'});
    await page.goto(path(locale,'/check-in/'));
    // Desktop systems may reserve a wider scrollbar than this machine's 6px
    // default. Exercise the available content width, not only innerWidth.
    await page.addStyleTag({content:'::-webkit-scrollbar{width:15px}'});
    const logo=page.locator('#main-header img');
    expect((await logo.boundingBox()).width).toBe(32);
    const brand=await page.locator('#main-header nav > a').boundingBox();
    const controls=await page.locator('#main-header nav > div').last().boundingBox();
    expect(locale==='ar'?controls.x+controls.width<=brand.x:brand.x+brand.width<=controls.x).toBe(true);
    await page.locator('#theme-toggle').click();
    await entranceSettled(page,'#theme-menu');
    const menu=await page.locator('#theme-menu').boundingBox();
    expect(menu.x).toBeGreaterThanOrEqual(0);expect(menu.x+menu.width).toBeLessThanOrEqual(320);
    for(const button of await page.locator('#theme-menu button').all())expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Escape');
    await expect(page.locator('#theme-toggle')).toBeFocused();
    await page.locator('[data-step="0"] [data-forward]').click();await alignedStepActions(page,1);
    await page.locator('[data-step="1"] [data-forward]').click();await alignedStepActions(page,2);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.goto(path(locale,'/relax/sounds/'));
    // Animated translation can produce a 43.99999px rectangle for a 44px
    // target; round floating-point measurement noise to a thousandth of a px.
    const backHeight=(await page.locator('#soundscape-app a').first().boundingBox()).height;
    expect(Math.round(backHeight*1000)/1000).toBeGreaterThanOrEqual(44);
    await page.goto(path(locale,'/breathing/'));
    await page.addStyleTag({content:'::-webkit-scrollbar{width:15px}'});
    await entranceSettled(page);
    const offsets=await page.locator('.mode-btn').evaluateAll(buttons=>buttons.map(button=>
      button.firstElementChild.getBoundingClientRect().top-button.getBoundingClientRect().top));
    expect(Math.max(...offsets)-Math.min(...offsets)).toBeLessThanOrEqual(1);
    const start=await page.locator('#start-btn').boundingBox(),reset=await page.locator('#reset-btn').boundingBox();
    expect(Math.abs(start.y-reset.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(start.height-reset.height)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    await page.locator('#start-btn').click();await expect(page.locator('#pause-btn')).toBeVisible();
    await page.locator('#reset-btn').click();await expect(page.locator('#start-btn')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  }
});

test('activity cards align their final action across translated desktop rows',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  for(const locale of locales){
    await page.goto(path(locale,'/self-help/'));
    const cards=page.locator('.support-grid > .support-card');
    const rows=new Map<number,number[]>();
    for(const card of await cards.all()){
      const bounds=await card.boundingBox();
      const action=await card.locator('.button').last().boundingBox();
      const row=Math.round(bounds.y),bottom=action.y+action.height;
      rows.set(row,[...(rows.get(row)||[]),bottom]);
    }
    for(const bottoms of rows.values())expect(Math.max(...bottoms)-Math.min(...bottoms)).toBeLessThanOrEqual(1);
  }
});
