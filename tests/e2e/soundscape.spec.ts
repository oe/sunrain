import { test, expect, type Page } from 'playwright/test';
import { readBuildMetadata } from '../../scripts/build-metadata.mjs';

const runtimeErrors = new WeakMap<Page, string[]>();
const consoleLogs = new WeakMap<Page, string[]>();

// The flow under test is: choose/mix sounds -> enter immersion -> interrupt,
// rotate, lock, return or stop -> preserve the intended audio and dispose visuals.
// This launches an isolated browser against our local production build only.
// Browser plugin not available; no connection to an existing/remote browser.
async function installAudioProbe(page: Page) {
  await page.addInitScript(() => {
    const probe: { contexts: BaseAudioContext[]; sources: { source: AudioBufferSourceNode; gain: GainNode; ended: boolean }[]; analysers: AnalyserNode[] } = { contexts: [], sources: [], analysers: [] };
    (window as any).__audioProbe = probe;
    const originalConnect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(destination: any, ...args: any[]) {
      if (destination instanceof AudioDestinationNode) {
        if (!probe.contexts.includes(this.context)) probe.contexts.push(this.context);
        const analyser = this.context.createAnalyser();
        analyser.fftSize = 2048;
        originalConnect.call(this, analyser);
        probe.analysers.push(analyser);
      }
      if (this instanceof AudioBufferSourceNode && destination instanceof GainNode) {
        probe.sources.push({ source: this, gain: destination, ended: false });
        const entry = probe.sources.at(-1);
        this.addEventListener('ended', () => { entry.ended = true; });
      }
      return originalConnect.call(this, destination, ...args);
    } as typeof originalConnect;
  });
}
async function audioState(page: Page) {
  return page.evaluate(() => {
    const p = (window as any).__audioProbe;
    const active = p.sources.filter((entry: any) => !entry.ended);
    let peak = 0;
    for (const analyser of p.analysers.filter((node: AnalyserNode) => node.context.state !== 'closed')) {
      const samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);
      peak = Math.max(peak, ...samples.map(Math.abs));
    }
    return { active: active.length, gains: active.map((entry: any) => entry.gain.gain.value), peak,
      states: p.contexts.filter((ctx: AudioContext) => ctx.state !== 'closed').map((ctx: AudioContext) => ctx.state),
      durations: active.map((entry: any) => entry.source.buffer?.duration) };
  });
}
async function expectAudio(page: Page, active: number) {
  await expect.poll(async () => (await audioState(page)).active).toBe(active);
  if (active) await expect.poll(async () => (await audioState(page)).peak).toBeGreaterThan(0.0001);
  else await expect.poll(async () => (await audioState(page)).peak).toBeLessThan(0.0001);
}
async function play(page: Page, id: string) {
  const button = page.locator(`.play-btn[data-sound="${id}"]`);
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#immersive-enter')).toBeEnabled();
}
async function enter(page: Page) {
  await page.locator('#immersive-enter').click();
  await expect(page.locator('.sound-room')).toBeVisible();
  await expect(page.locator('.sound-room')).toHaveClass(/ready/);
}
async function setRange(page: Page, selector: string, value: number) {
  await page.locator(selector).evaluate((input: HTMLInputElement, value) => {
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

// Simulated visibility is deliberate: it validates lifecycle handlers, not OS
// suspension, mobile Safari, actual screen lock, decoder efficiency or battery.
async function visibility(page: Page, hidden: boolean) {
  await page.evaluate((hidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: hidden ? 'hidden' : 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

test.beforeEach(async ({ page }, testInfo) => {
  const errors: string[] = [], logs: string[] = [];
  runtimeErrors.set(page, errors);
  consoleLogs.set(page, logs);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) logs.push(message.text()); });
  const response = await page.request.get('/build-metadata.json');
  expect(response.ok()).toBe(true);
  const identity = await response.json();
  expect(identity).toEqual(readBuildMetadata(process.cwd()));
  await testInfo.attach('build-metadata.json', { body: JSON.stringify(identity, null, 2), contentType: 'application/json' });
  await page.route('https://static.cloudflareinsights.com/**', route => route.fulfill({ status: 204 }));
  await installAudioProbe(page);
  await page.goto('/relax/sounds/');
  await expect(page).toHaveTitle(/Sunrain/);
  await expect(page.locator('h1')).toContainText('Sound');
  await expect(page.locator('#soundscape-app')).toBeVisible();
  await expect(page.locator('astro-error-overlay')).toHaveCount(0);
});

test.afterEach(async ({ page }, testInfo) => {
  await testInfo.attach('browser-console.json', { body: JSON.stringify(consoleLogs.get(page)), contentType: 'application/json' });
  expect(runtimeErrors.get(page)).toEqual([]);
});

test('mix ratios, master volume, return, repeated entry and stop preserve intent', async ({ page }) => {
  await play(page, 'pink-noise');
  await play(page, 'ocean-waves');
  await expectAudio(page, 2);
  await setRange(page, '#soundscape-master', 0.5);
  await expect.poll(async () => (await audioState(page)).gains.sort()).toEqual([0.13, 0.2].map(Math.fround));
  await expect(page.locator('.volume-slider[data-sound="pink-noise"]')).toHaveValue('0.26');
  await expect(page.locator('.volume-slider[data-sound="ocean-waves"]')).toHaveValue('0.4');
  for (let index = 0; index < 3; index++) {
    await enter(page);
    await expect(page.locator('.room-motion')).toHaveCount(1);
    await page.locator('.room-controls button').first().click();
    await expect(page.locator('.sound-room')).not.toBeVisible();
    await expect(page.locator('.room-motion')).toHaveCount(0);
    await expectAudio(page, 2);
  }
  await enter(page);
  await setRange(page, '.room-volume input', 0.25);
  await expect(page.locator('#soundscape-master')).toHaveValue('0.25');
  await page.locator('.room-controls button').nth(1).click();
  await expect(page.locator('.sound-room')).not.toBeVisible();
  await expect(page.locator('#soundscape-dock')).toBeHidden();
  await expectAudio(page, 0);
});

test('rapid pause/resume cancels the old fade-out timer', async ({ page }) => {
  await play(page, 'pink-noise');
  await expectAudio(page, 1);
  const button = page.locator('.play-btn[data-sound="pink-noise"]');
  await button.click();
  await button.click();
  await page.waitForTimeout(800);
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expectAudio(page, 1);
  await expect.poll(async () => (await audioState(page)).gains[0]).toBeCloseTo(0.26, 4);
});

test('background/resume restarts motion and suspended audio, but never stopped audio', async ({ page }) => {
  await play(page, 'fireplace');
  await enter(page);
  const video = page.locator('.room-motion');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0)).toBe(true);
  await visibility(page, true);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.evaluate(async () => { await (window as any).__audioProbe.contexts.find((ctx: AudioContext) => ctx.state !== 'closed').suspend(); });
  await visibility(page, false);
  await expect.poll(async () => (await audioState(page)).states).toEqual(['running']);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  await expectAudio(page, 1);
  await page.locator('.room-controls button').nth(1).click();
  await expectAudio(page, 0);
  await page.evaluate(async () => { await (window as any).__audioProbe.contexts.find((ctx: AudioContext) => ctx.state !== 'closed').suspend(); });
  await visibility(page, true);
  await visibility(page, false);
  await expectAudio(page, 0);
  expect((await audioState(page)).states).toEqual(['suspended']);
});

test('reduced motion cold entry fetches no video and live changes pause/resume', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const movies: string[] = [];
  page.on('request', request => { if (/\/scenes\/.*\.mp4/.test(request.url())) movies.push(request.url()); });
  await play(page, 'fireplace');
  await enter(page);
  const video = page.locator('.room-motion');
  await expect(video).not.toHaveAttribute('src');
  expect(movies).toEqual([]);
  await expect(page.locator('.sound-room')).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const frame = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await page.waitForTimeout(300);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(frame, 1);
  await expectAudio(page, 1);
});

test('lock/unlock, orientation and native fullscreen keep controls usable', async ({ page }, testInfo) => {
  await play(page, 'pink-noise');
  await enter(page);
  const lock = page.locator('.room-lock');
  await lock.click();
  await expect(lock).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.room-controls')).toBeHidden();
  await page.waitForTimeout(6800);
  await expect(page.locator('.sound-room')).toHaveClass(/controls-hidden/);
  await page.mouse.click(10, 10);
  await expect(page.locator('.sound-room')).not.toHaveClass(/controls-hidden/);
  await lock.click();
  await expect(page.locator('.room-controls')).toBeVisible();
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    // Synthetic inset coverage; this is not physical notch validation.
    await page.locator('.sound-room').evaluate((room: HTMLElement) => {
      room.style.setProperty('--room-safe-left', '59px');
      room.style.setProperty('--room-safe-right', '0px');
    });
    for (const control of [lock, page.locator('.room-controls')]) {
      const box = await control.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(59);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    }
  }
  const fullscreen = page.locator('.room-controls button').nth(2);
  if (await page.evaluate(() => document.fullscreenEnabled)) {
    await fullscreen.click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.className)).toBe('room-stage');
    await fullscreen.click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  } else {
    await expect(fullscreen).toBeHidden();
    testInfo.annotations.push({ type: 'limitation', description: 'Native fullscreen unavailable in this browser project' });
  }
  await page.screenshot({ path: testInfo.outputPath('landscape-controls.png') });
  await page.keyboard.press('Escape');
  await expect(page.locator('.sound-room')).not.toBeVisible();
  await expectAudio(page, 1);
});

test('scene changes and navigation dispose the previous player', async ({ page }) => {
  await play(page, 'ocean-waves');
  await enter(page);
  for (const [id, movie] of [['fireplace', 'fire-loop'], ['fireplace', 'ocean-loop'], ['flowing-river', 'stream-loop'], ['flowing-river', 'ocean-loop']]) {
    // Underlying controls are inert while modal; dispatch only to exercise the
    // scene-update lifecycle. This is a simulated mix change, not a user gesture.
    await page.locator(`.play-btn[data-sound="${id}"]`).evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.locator('.sound-room')).toBeVisible();
    await expect(page.locator('.room-motion')).toHaveCount(1);
    await expect(page.locator('.room-motion')).toHaveAttribute('src', new RegExp(movie));
  }
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await expect(page.locator('.room-motion')).toHaveCount(0);
  await expectAudio(page, 0);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expectAudio(page, 0);
  await play(page, 'pink-noise');
  await enter(page);
  await expect(page.locator('.room-motion')).toHaveCount(0);
});

test('real audio stays non-silent across a natural loop boundary', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'One real-time signal check; not a human listening verdict');
  await play(page, 'pink-noise');
  await expectAudio(page, 1);
  await page.locator('#immersive-auto').uncheck();
  const duration = (await audioState(page)).durations[0];
  expect(duration).toBeGreaterThan(1);
  expect(duration).toBeLessThan(60);
  await page.waitForTimeout((duration - 1) * 1000);
  const signal = await page.evaluate(async () => {
    // Howler may replace its initial context when the device uses 48 kHz.
    // Sample the live graph rather than its closed startup analyser.
    const analyser = (window as any).__audioProbe.analysers.find((node: AnalyserNode) => node.context.state === 'running') as AnalyserNode;
    const samples = new Float32Array(analyser.fftSize);
    const readings: number[] = [];
    const until = performance.now() + 2500;
    while (performance.now() < until) {
      analyser.getFloatTimeDomainData(samples);
      readings.push(Math.max(...samples.map(Math.abs)));
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    return readings;
  });
  expect(signal.length).toBeGreaterThan(50);
  expect(Math.min(...signal)).toBeGreaterThan(0.0001);
  await testInfo.attach('audio-loop-signal.json', { body: JSON.stringify({ duration, sampleIntervalMs: 20, peaks: signal, limitation: 'Software Web Audio signal only, not physical device or human listening' }), contentType: 'application/json' });
});
