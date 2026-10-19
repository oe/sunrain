import { test, expect } from 'playwright/test';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
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
    await expect(page.locator('[data-action="grounding"]')).toBeVisible();
    await expect(page.locator('[data-action="one-step"]')).toBeVisible();
    expect(await page.title()).toBe(title);
    expect(new URL(page.url()).search).toBe('');expect(new URL(page.url()).hash).toBe('');
    expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
    await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0);
    await page.locator('[data-action="grounding"] a').click();
    await expect(page.locator('ol li')).toHaveCount(4);
    await page.locator('input[value="worse"]').check();
    await expect(page.locator('#feedback-worse')).toBeVisible();
    await page.goto(path(locale,'/support/'));
    await expect(page.locator('#support-region')).toHaveValue('');
    await expect(page.locator('ol li')).toHaveCount(6);
    await expect(page.locator('[data-note-field]')).toHaveCount(5);
    await page.locator('#support-region').selectOption('US');
    await expect(page.locator('[data-service-region="US"]')).toBeVisible();
    await expect(page.locator('[data-service-region="GB-ENG"]')).toBeHidden();
    await page.locator('#support-region').selectOption('other');
    await expect(page.locator('#service-fallback')).toBeVisible();
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
test('unreviewed assessment deep links expose no form; legacy data can be deleted',async({page})=>{
  for(const locale of locales) for(const id of ['phq-9','gad-7']) {
    await page.goto(path(locale,`/assessment/${id}/`));await expect(page.locator('[data-screening-status="unavailable"]')).toBeVisible();await expect(page.locator('input[type="radio"]')).toHaveCount(0);
  }
  await page.goto('/assessment/');await page.evaluate(()=>localStorage.setItem('sunrain_assessment_results','[{"answers":[3]}]'));await page.locator('#clear-legacy-history').click();expect(await page.evaluate(()=>localStorage.getItem('sunrain_assessment_results'))).toBeNull();
});
test('self-help and provider instructions remain available without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4362/zh-hans/self-help/grounding/');await expect(page.locator('ol li')).toHaveCount(4);
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
    await page.goto(path(locale,`/self-help/${id}/`));await expect(page.locator('ol li')).toHaveCount(4);
    await page.locator('input[value="same"]').check();await expect(page.locator('#feedback-same')).toBeVisible();
    await expect(page.locator('main a[href$="/support/"]').first()).toBeVisible();
  }
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
