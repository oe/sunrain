import { test, expect } from 'playwright/test';
import { readFile } from 'node:fs/promises';
const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
const topics=['depression','anxiety','sleep','bipolar'];
const local=(lang:string,route:string)=>`${lang==='en'?'':`/${lang}`}${route}`;
const activities={depression:'/self-help/one-step/',anxiety:'/self-help/worry/',sleep:'/self-help/sleep/',bipolar:'/support/'};
const copy=Object.fromEntries(await Promise.all(locales.map(async lang=>[lang,JSON.parse(await readFile(new URL(`../../src/data/understand/${lang}.json`,import.meta.url),'utf8'))])));

test('every language connects illustrated topic reading to practical support without a questionnaire',{tag:'@smoke'},async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const [i,lang] of locales.entries()) {
    await page.goto(local(lang,'/understand/'));
    await expect(page.locator('html')).toHaveAttribute('lang',lang);
    await expect(page.locator('html')).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');
    await expect(page.locator('[data-understand-card]')).toHaveCount(4);
    await page.locator(`[data-understand-card="${topics[i%4]}"]`).click();
    await expect(page.locator('[data-understand-topic]')).toHaveAttribute('data-understand-topic',topics[i%4]);
    await expect(page.locator('h1')).not.toBeEmpty();
    await expect(page.locator('input,textarea')).toHaveCount(0);
    if(topics[i%4]==='anxiety')await expect(page.locator('[data-context-always-visible]')).toBeVisible();
    await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0);
    const art=page.locator('.understand-hero img');
    await expect(art).toHaveAttribute('alt','');
    await expect.poll(()=>art.evaluate((img:HTMLImageElement)=>img.complete && img.naturalWidth>0)).toBe(true);
    await expect(art).toHaveAttribute('sizes',/max-width: 760px/);
    expect(await art.evaluate((img:HTMLImageElement)=>new URL(img.currentSrc).pathname)).toMatch(/\/images\/understand\/[^/]+(?:-\d+\.avif|(?:-540)?\.webp)$/);
    expect(await page.locator('#references a').count()).toBeGreaterThanOrEqual(2);
    await page.locator('.understand-hero a[href="#today"]').click();
    const top=(await page.locator('#today').boundingBox()).y;
    const header=(await page.locator('#main-header').boundingBox()).height;
    expect(top).toBeGreaterThanOrEqual(header-1);
    const example=page.locator('[data-practice-example]');await expect(example).toBeVisible();
    await page.locator('[data-topic-action]').click();await expect(page).toHaveURL(new RegExp(`${local(lang,activities[topics[i%4]])}.*$`));
    if(topics[i%4]==='bipolar')await expect(page.locator('#support-region')).toBeVisible();
    else await expect(page.locator('#guide-controls')).toBeVisible();
    if(topics[i%4]==='anxiety')for(const option of await page.locator('[data-worry-focus-options] input').all())await expect(option).toBeVisible();
    await page.goBack();await expect(page.locator('[data-practice-example]')).toBeVisible();
    const hard=page.locator('[data-practice-if-hard]');await expect(hard).not.toHaveAttribute('open','');
    await hard.locator('summary').focus();await page.keyboard.press('Enter');await expect(hard.locator('p')).toBeVisible();
    await hard.locator('a').click();
    const conversation=page.locator('[data-practice-conversation]');await expect(conversation).not.toHaveAttribute('open','');
    await conversation.locator('summary').focus();await page.keyboard.press('Enter');await expect(conversation.locator('blockquote')).toBeVisible();
    await page.locator('#care > a').click();
    await expect(page).toHaveURL(new RegExp(`${local(lang,'/support/')}.*$`));
    await expect(page.locator('#support-region')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('all four topics and their care and source sections remain readable without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  for(const topic of topics) {
    await page.goto(`http://127.0.0.1:4362/zh-hans/understand/${topic}/`);
    await expect(page.locator('#today ol li')).toHaveCount(3);
    await expect(page.locator('#treatment h3')).toHaveCount(2);
    await expect(page.locator('#care > p')).not.toBeEmpty();
    await page.locator('[data-young-readers] > summary').click();
    await expect(page.locator('[data-young-readers] p')).toBeVisible();
    await page.locator('[data-practice-if-hard] > summary').click();await expect(page.locator('[data-practice-if-hard] p')).toBeVisible();
    await page.locator('[data-practice-conversation] > summary').click();await expect(page.locator('[data-practice-conversation] blockquote')).toBeVisible();
    expect(await page.locator('#references a').count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('astro-error-overlay')).toHaveCount(0);
  }
  await context.close();
});

test('all 32 localized practical examples keep a visible next action, optional depth and direct support',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const lang of locales)for(const topic of topics){
    const expected=copy[lang].topics[topic].practice;await page.goto(local(lang,`/understand/${topic}/`));
    await expect(page.locator('[data-practice-example] p')).toHaveText(expected.example);
    await expect(page.locator('#today ol li')).toHaveCount(3);await expect(page.locator('#today > [data-topic-action]')).toHaveCount(1);
    const action=page.locator('[data-topic-action]');await expect(action).toHaveText(expected.action);await expect(action).toHaveAttribute('href',local(lang,activities[topic]));
    expect(await action.evaluate(el=>el.closest('details'))).toBeNull();
    expect(await page.locator('[data-practice-example]').evaluate(el=>el.closest('details'))).toBeNull();
    for(const selector of ['[data-practice-if-hard]','[data-practice-conversation]'])await expect(page.locator(selector)).not.toHaveAttribute('open','');
    await expect(page.locator('[data-practice-if-hard] a')).toHaveAttribute('href','#care');
    await expect(page.locator('[data-practice-conversation] blockquote')).toHaveText(expected.conversation);
    await expect(page.locator('#care > a')).toHaveAttribute('href',local(lang,'/support/'));
    await expect(page.locator('.understand-urgent a')).toHaveAttribute('href',local(lang,'/crisis/'));
    await expect(page.locator('#references a[href="https://www.nimh.nih.gov/health/publications/tips-for-talking-with-your-health-care-provider"]')).toHaveCount(1);
    await expect(page.locator('[data-practice-checked] time')).toHaveAttribute('datetime','2026-10-30');
    await expect(page.locator('input,textarea')).toHaveCount(0);expect(new URL(page.url()).search).toBe('');
  }
  expect(errors).toEqual([]);
});

test('topic navigation and references fit narrow RTL and wide translated layouts',async({page},testInfo)=>{
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:740});
  await page.goto('/ar/understand/sleep/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('a[href="#references"]').click();
  expect((await page.locator('#references h2').boundingBox()).y).toBeGreaterThanOrEqual(68);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await testInfo.attach('Arabic narrow references',{body:await page.screenshot(),contentType:'image/png'});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/hi/understand/');
  const navigation=await page.locator('.desktop-navigation').boundingBox();
  const controls=await page.locator('.header-controls').boundingBox();
  expect(navigation.x+navigation.width).toBeLessThanOrEqual(controls.x);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
