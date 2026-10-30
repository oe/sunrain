import { test, expect } from 'playwright/test';
import { readFile } from 'node:fs/promises';
const load = async (file:string) => JSON.parse(await readFile(new URL(`../../src/data/${file}`,import.meta.url),'utf8'));
const pathways = await load('support-pathways.json');
const catalog = await load('support-services.json');
const resources = await load('resource-copy.json');
const locales = Object.keys(pathways.locales);
const local = (lang:string,route:string) => `${lang==='en'?'':`/${lang}`}${route}`;
const audioSections = {en:'english','zh-hans':'Mandarin','zh-hant':'Mandarin',es:'spanish',ja:'japanese',ko:'korean',hi:'Hindi',ar:'Arabic'};

test.beforeEach(async({page})=>{
  await page.route('https://static.cloudflareinsights.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
});

test('eight-language England and Japan routes keep practical steps optional and reset on interrupted returns',{tag:'@smoke'},async({page,context})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  // Check the handoff URL without sending a real application to a provider.
  await context.route('https://www.nhs.uk/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<title>External destination fixture</title>'}));
  for(const lang of locales){
    await page.goto(local(lang,'/support/'));
    await expect(page.locator('html')).toHaveAttribute('lang',lang);
    await expect(page.locator('html')).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');
    await expect(page.locator('#support-region')).toHaveValue('');
    await expect(page.locator('#contact-preparation')).not.toHaveAttribute('open','');
    for(const region of ['GB-ENG','JP']){
      await page.locator('#support-region').selectOption(region);
      const entry=page.locator(`[data-service-region="${region}"]`),guide=entry.locator('[data-service-guide]'),c=pathways.locales[lang].regions[region];
      await expect(entry).toBeVisible();await expect(entry.locator(':scope > p').first()).toHaveText(c.fit);
      await expect(guide).not.toHaveAttribute('open','');await expect(entry.locator('a.primary')).toBeVisible();
      await guide.locator('summary').focus();await page.keyboard.press('Enter');
      await expect(guide.locator('ol li')).toHaveText(c.steps);await expect(guide.locator('dd')).toHaveText([c.cost,c.language,c.hours]);
      await expect(guide.locator('input,textarea,select')).toHaveCount(0);
      await expect(guide.locator(`a[href="${local(lang,'/crisis/')}"]`)).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(region==='GB-ENG')await expect(entry.locator('[data-youth-service] a')).toBeVisible();
      if(lang==='en'&&region==='GB-ENG'){
        const [popup]=await Promise.all([page.waitForEvent('popup'),entry.locator('a.primary').click()]);
        await popup.waitForLoadState();await expect(popup).toHaveURL(catalog.entries.find(e=>e.region===region).url);await popup.close();
      }
    }
    await expect(page.locator('[data-service-region="GB-ENG"] [data-service-guide]')).not.toHaveAttribute('open','');
    await page.locator('#support-region').selectOption('other');await expect(page.locator('#service-fallback')).toBeVisible();
    await expect(page.locator('[data-service-guide][open]')).toHaveCount(0);
    await page.locator('#support-region').selectOption('JP');await page.locator('[data-service-region="JP"] summary').click();
    await page.reload();await expect(page.locator('#support-region')).toHaveValue('');await expect(page.locator('[data-service-guide][open]')).toHaveCount(0);
    await page.locator('#support-region').selectOption('GB-ENG');await page.goto(local(lang,'/self-help/'));await page.goBack();
    await expect(page.locator('#support-region')).toHaveValue('');await page.goForward();await expect(page).toHaveURL(new RegExp(local(lang,'/self-help/')+'$'));
    expect(await page.evaluate(()=>Object.keys(sessionStorage))).toEqual([]);
    expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('sunrain')))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('resource labels disclose external language and adult scope and open the verified audio-language section',async({page})=>{
  for(const lang of locales){
    await page.goto(local(lang,'/resources/'));
    for(const summary of await page.locator('.resource-group > summary').all()){await summary.focus();await page.keyboard.press('Enter');}
    await expect(page.locator('[data-resource]')).toHaveCount(10);
    await expect(page.locator('[data-resource="nimhAnxiety"]')).toHaveAttribute('href','https://www.nimh.nih.gov/health/topics/anxiety-disorders');
    await expect(page.locator('[data-resource="nhsDepression"] [data-resource-audience]')).toHaveText(resources[lang].adult);
    await expect(page.locator('[data-resource="nhsDepression"]')).toHaveAttribute('href','https://www.nhs.uk/mental-health/conditions/depression-in-adults/');
    const audio=page.locator('[data-resource="ucla"]');
    await expect(audio).toHaveAttribute('href',`https://www.uclahealth.org/uclamindful/guided-meditations#${audioSections[lang]}`);
    await expect(audio.locator('[data-resource-language]')).toHaveText(resources[lang].audio);
    await expect(page.locator('[data-resource="adaa"] [data-resource-language]')).toHaveText(resources[lang].english);
    await expect(page.locator('[data-resource="adaa"]')).toContainText(resources[lang].titles.adaa);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator(`.resource-actions a[href="${local(lang,'/support/')}"]`).click();await expect(page.locator('#support-region')).toBeVisible();
  }
});

test('localized service steps and resource language labels remain available without JavaScript',async({browser},testInfo)=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL:testInfo.project.use.baseURL});
  const page=await context.newPage();
  for(const lang of locales){
    await page.goto(local(lang,'/support/'));
    await expect(page.locator('noscript [data-service-region]')).toHaveCount(7);
    for(const region of ['GB-ENG','JP']){
      const entry=page.locator(`noscript [data-service-region="${region}"]`);await expect(entry).toBeVisible();
      await entry.locator('summary').click();await expect(entry.locator('ol li')).toHaveText(pathways.locales[lang].regions[region].steps);
      await expect(entry.locator('a.primary')).toHaveAttribute('href',catalog.entries.find(e=>e.region===region).url);
    }
    await page.goto(local(lang,'/resources/'));await page.locator('.resource-group').last().locator('summary').click();
    await expect(page.locator('[data-resource="ucla"] [data-resource-language]')).toHaveText(resources[lang].audio);
  }
  await context.close();
});
