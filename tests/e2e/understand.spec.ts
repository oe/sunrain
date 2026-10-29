import { test, expect } from 'playwright/test';
const locales=['en','zh-hans','zh-hant','es','ja','ko','hi','ar'];
const topics=['depression','anxiety','sleep','bipolar'];
const local=(lang:string,route:string)=>`${lang==='en'?'':`/${lang}`}${route}`;

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
    await page.locator('#care summary').click();
    await expect(page.locator('#care details p')).toBeVisible();
    expect(await page.locator('#references a').count()).toBeGreaterThanOrEqual(2);
    await expect(page.locator('astro-error-overlay')).toHaveCount(0);
  }
  await context.close();
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
