import { test, expect } from 'playwright/test';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
const copy=JSON.parse(await readFile(new URL('../../src/data/support-copy.json',import.meta.url),'utf8')).locales;
const path=(locale:string,route:string)=>`${locale==='en'?'':`/${locale}`}${route}`;
// Production build, isolated Chromium. The Browser skill is present but its js
// connection is not callable in this environment; repository Playwright is used.
// Flow: home -> check-in -> select concerns -> practical support -> prepare help.
for(const locale of locales) {
  test(`${locale}: check-in, self-help, help-seeking and disclaimer are connected`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(path(locale,'/'));
    await page.locator('#home-check-in').click();
    await expect(page).toHaveURL(new RegExp(`${path(locale,'/check-in/')}.*$`));
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');
    const title=await page.title();
    await expect(page.locator('[data-step="0"] [data-forward]')).toBeDisabled();
    await page.locator('#adult-check').check();
    await page.locator('[data-step="0"] [data-forward]').click();
    const questionBounds=await page.locator('[data-step="1"] legend').boundingBox();
    const navigationBounds=await page.locator('#main-header').boundingBox();
    expect(questionBounds.y).toBeGreaterThanOrEqual(navigationBounds.y+navigationBounds.height+8);
    await page.locator('input[value="mood"]').check();
    await page.locator('input[value="worry"]').check();
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
  await page.goto('/check-in/');await page.locator('#adult-check').check();await page.locator('[data-step="0"] [data-forward]').click();await page.locator('[data-step="1"] [data-forward]').click();await page.locator('button[type="submit"]').click();
  await expect(page.locator('#check-in-result')).toBeVisible();
  await expect(page.locator('#result-summary')).toContainText('Skip / leave unanswered');
  await page.reload();await expect(page.locator('#check-in-result')).toBeHidden();await expect(page.locator('#adult-check')).not.toBeChecked();
});
test('unusually high energy directs to care and does not present a diagnosis',async({page})=>{
  await page.goto('/check-in/');await page.locator('#adult-check').check();await page.locator('[data-step="0"] [data-forward]').click();await page.locator('input[value="energy"]').check();await page.locator('[data-step="1"] [data-forward]').click();await page.locator('button[type="submit"]').click();
  await expect(page.locator('#energy-care')).toBeVisible();await expect(page.locator('[data-action="grounding"]')).toBeHidden();await expect(page.locator('[data-action="one-step"]')).toBeHidden();
  await expect(page.locator('#energy-care')).toContainText('cannot tell');
  await expect(page.locator('[data-action="sleep"]')).toBeHidden();
  await expect(page.locator('[data-note-field]').first()).toHaveValue('Unusually high energy or needing much less sleep');
});
test('notes are voluntary, reload blank, load explicitly, export locally and delete',async({page})=>{
  const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
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
  expect(requests.filter(url=>!url.startsWith('http://127.0.0.1:4362/'))).toEqual([]);
  expect(requests.some(url=>url.includes('private')||url.includes('three%20weeks'))).toBe(false);
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
test('unreviewed assessment deep links expose no form; legacy data can be deleted',async({page})=>{
  for(const locale of locales) for(const id of ['phq-9','gad-7']) {
    await page.goto(path(locale,`/assessment/${id}/`));await expect(page.locator('[data-screening-status="unavailable"]')).toBeVisible();await expect(page.locator('input[type="radio"]')).toHaveCount(0);
  }
  await page.goto('/assessment/');await page.evaluate(()=>localStorage.setItem('sunrain_assessment_results','[{"answers":[3]}]'));await page.locator('#clear-legacy-history').click();expect(await page.evaluate(()=>localStorage.getItem('sunrain_assessment_results'))).toBeNull();
});
test('self-help and provider instructions remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4362/zh-hans/self-help/grounding/');await expect(page.locator('#guided-activity ol li')).toHaveCount(4);
  await page.goto('http://127.0.0.1:4362/zh-hans/support/');await expect(page.locator('ol li')).toHaveCount(6);await expect(page.locator('noscript a[href="https://findtreatment.gov/"]')).toBeVisible();await context.close();
});
test('Arabic responsive layout and visible flow screenshots',async({page},testInfo)=>{
  await page.goto('/ar/check-in/');await page.locator('#adult-check').check();await page.locator('[data-step="0"] [data-forward]').click();
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
  await page.goto('/check-in/');await page.locator('#adult-check').check();await page.locator('[data-step="0"] [data-forward]').click();
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
