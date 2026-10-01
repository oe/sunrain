import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import { createScene } from '../../src/lib/soundscape/scene.ts';

// Exercise the real coordinator with controllable world factories. These are
// lifecycle simulations, not browser/WebGL/video decoding coverage.
const sceneUrl = new URL('../../src/lib/soundscape/scene.ts', import.meta.url).href;
const factoryKey = 'sunrain.scene-lifecycle-test.factories';
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === sceneUrl && ['./photo-world', './media-world'].includes(specifier)) {
      return { url: `sunrain-test:${specifier.slice(2)}`, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    const method = url === 'sunrain-test:photo-world' ? 'createPhotoWorld'
      : url === 'sunrain-test:media-world' ? 'createMediaWorld' : null;
    if (method) {
      return {
        format: 'module', shortCircuit: true,
        source: `export function ${method}(...args) {
          return globalThis[Symbol.for('${factoryKey}')].${method}(...args);
        }`,
      };
    }
    return nextLoad(url, context);
  },
});

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

class TrackedTarget extends EventTarget {
  listeners = new Map();
  addEventListener(type, listener, options) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
    super.addEventListener(type, listener, options);
  }
  removeEventListener(type, listener, options) {
    this.listeners.get(type)?.delete(listener);
    super.removeEventListener(type, listener, options);
  }
  get listenerCount() {
    return [...this.listeners.values()].reduce((count, listeners) => count + listeners.size, 0);
  }
}

function setup(t, initialSounds = ['gentle-rain']) {
  const canvas = Object.assign(new TrackedTarget(), {
    width: 900, clientWidth: 900, clientHeight: 700, style: {}, dataset: {},
  });
  const document = Object.assign(new TrackedTarget(), { hidden: false });
  const reduced = Object.assign(new TrackedTarget(), { matches: false });
  const frames = new Map(), observers = [], worlds = [], scenes = [];
  let frameId = 0, sounds = initialSounds;
  function makeWorld(kind) {
    const world = {
      kind, activated: 0, disposed: 0, renders: [], motion: [], resizes: [],
      browserAnimation: kind !== 'rain',
      activate() { this.activated++; canvas.dataset.renderer = this.browserAnimation ? 'video' : 'three'; },
      resize(...args) { this.resizes.push(args); },
      render(time) { this.renders.push(time); },
      setMotion(enabled) { this.motion.push(enabled); },
      dispose() { this.disposed++; },
    };
    worlds.push(world);
    return world;
  }
  const factories = {
    createPhotoWorld: async (_canvas, kind) => makeWorld(kind),
    createMediaWorld: async (_canvas, source) => makeWorld(
      source.includes('fire') ? 'fire' : source.includes('stream') ? 'forest' : 'water',
    ),
  };
  const globals = {
    document, matchMedia: () => reduced,
    innerWidth: 900, innerHeight: 700, devicePixelRatio: 1,
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: class {
      disconnected = false;
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe() {}
      disconnect() { this.disconnected = true; }
    },
    [Symbol.for(factoryKey)]: factories,
  };
  const previousGlobals = new Map();
  for (const key of Reflect.ownKeys(globals)) {
    previousGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: globals[key] });
  }
  t.after(() => {
    scenes.forEach((scene) => scene.dispose());
    for (const [key, previous] of previousGlobals) {
      if (previous) Object.defineProperty(globalThis, key, previous);
      else delete globalThis[key];
    }
  });
  t.mock.method(console, 'warn', () => {});
  return {
    canvas, document, reduced, frames, observers, worlds, factories, makeWorld,
    sounds: () => sounds,
    setSounds(ids) { sounds = ids; },
    track(scene) { scenes.push(scene); },
  };
}

test('opening reconciles repeated mix changes and never activates obsolete worlds', async (t) => {
  const h = setup(t), rainReady = deferred(), fireReady = deferred();
  const rainEntered = deferred(), fireEntered = deferred();
  const rain = h.makeWorld('rain'), fire = h.makeWorld('fire');
  h.factories.createPhotoWorld = async () => { rainEntered.resolve(); return rainReady.promise; };
  h.factories.createMediaWorld = async (_canvas, source) => {
    if (source.includes('fire')) { fireEntered.resolve(); return fireReady.promise; }
    return h.makeWorld('forest');
  };
  const opening = createScene(h.canvas, h.sounds);
  await rainEntered.promise;
  h.setSounds(['fireplace']);
  rainReady.resolve(rain);
  assert.equal(await Promise.race([
    fireEntered.promise.then(() => 'preparing current mix'),
    opening.then(() => 'opened obsolete mix'),
  ]), 'preparing current mix');
  h.setSounds(['forest-birds']);
  fireReady.resolve(fire);
  const scene = await opening;
  h.track(scene);
  assert.deepEqual([rain.activated, rain.disposed, fire.activated, fire.disposed], [0, 1, 0, 1]);
  assert.equal(h.worlds.at(-1).kind, 'forest');
  assert.equal(h.worlds.at(-1).activated, 1);
  assert.match(h.canvas.style.backgroundImage, /stream-poster/);
});

test('a failed obsolete opening does not prevent the current mix from loading', async (t) => {
  const h = setup(t), ready = deferred(), entered = deferred();
  h.factories.createPhotoWorld = async () => { entered.resolve(); return ready.promise; };
  const opening = createScene(h.canvas, h.sounds);
  await entered.promise;
  h.setSounds(['fireplace']);
  ready.reject(new Error('rain texture unavailable'));
  const scene = await opening;
  h.track(scene);
  assert.equal(h.worlds.at(-1).kind, 'fire');
  assert.equal(h.worlds.at(-1).activated, 1);
  assert.match(h.canvas.style.backgroundImage, /fire-poster/);
});

test('a current preparation failure disposes the old world and shows the matching fallback', async (t) => {
  const h = setup(t);
  const scene = await createScene(h.canvas, h.sounds);
  h.track(scene);
  const rain = h.worlds[0];
  assert.equal(h.frames.size, 1);
  h.factories.createMediaWorld = async () => { throw new Error('poster unavailable'); };
  h.setSounds(['ocean-waves']);
  await scene.update();
  assert.equal(rain.disposed, 1);
  assert.equal(h.canvas.dataset.renderer, 'static');
  assert.match(h.canvas.style.backgroundImage, /ocean-poster/);
  assert.equal(h.frames.size, 0);
  // A subsequent different scene must still be able to recover normally.
  h.setSounds(['gentle-rain']);
  await scene.update();
  assert.equal(h.worlds.at(-1).activated, 1);
  assert.equal(h.canvas.dataset.renderer, 'three');
});

test('a stale failed update cannot replace a newer successful world', async (t) => {
  const h = setup(t), ready = deferred(), entered = deferred();
  const scene = await createScene(h.canvas, h.sounds);
  h.track(scene);
  h.factories.createMediaWorld = async (_canvas, source) => {
    if (source.includes('fire')) { entered.resolve(); return ready.promise; }
    return h.makeWorld('water');
  };
  h.setSounds(['fireplace']);
  const stale = scene.update();
  await entered.promise;
  h.setSounds(['ocean-waves']);
  await scene.update();
  const current = h.worlds.at(-1);
  ready.reject(new Error('obsolete poster failure'));
  await stale;
  assert.equal(current.kind, 'water');
  assert.equal(current.disposed, 0);
  assert.equal(h.canvas.dataset.renderer, 'video');
  assert.match(h.canvas.style.backgroundImage, /ocean-poster/);
});

for (const outcome of ['success', 'failure']) {
  test(`disposal during pending ${outcome} prevents activation and releases listeners`, async (t) => {
    const h = setup(t), ready = deferred(), entered = deferred();
    const scene = await createScene(h.canvas, h.sounds);
    const oldWorld = h.worlds[0];
    const prepared = h.makeWorld('fire');
    h.factories.createMediaWorld = async () => { entered.resolve(); return ready.promise; };
    h.setSounds(['fireplace']);
    const pending = scene.update();
    await entered.promise;
    scene.dispose();
    const background = h.canvas.style.backgroundImage;
    if (outcome === 'success') ready.resolve(prepared);
    else ready.reject(new Error('late failure'));
    await pending;
    assert.equal(prepared.activated, 0);
    assert.equal(prepared.disposed, outcome === 'success' ? 1 : 0);
    assert.equal(oldWorld.disposed, 1);
    assert.equal(h.canvas.style.backgroundImage, background);
    assert.equal(h.frames.size, 0);
    assert.equal(h.canvas.listenerCount + h.document.listenerCount + h.reduced.listenerCount, 0);
    assert.ok(h.observers.every((observer) => observer.disconnected));
  });
}

test('returning to the current kind cancels a pending scene switch', async (t) => {
  const h = setup(t), ready = deferred(), entered = deferred();
  const scene = await createScene(h.canvas, h.sounds);
  h.track(scene);
  const rain = h.worlds[0], fire = h.makeWorld('fire');
  h.factories.createMediaWorld = async () => { entered.resolve(); return ready.promise; };
  h.setSounds(['fireplace']);
  const pending = scene.update();
  await entered.promise;
  h.setSounds(['rain-on-window']);
  await scene.update();
  ready.resolve(fire);
  await pending;
  assert.equal(rain.disposed, 0);
  assert.equal(fire.activated, 0);
  assert.equal(fire.disposed, 1);
  assert.match(h.canvas.style.backgroundImage, /rain-window/);
});

test('visibility and reduced-motion changes pause and resume existing scene motion', async (t) => {
  const h = setup(t, ['fireplace']);
  const scene = await createScene(h.canvas, h.sounds);
  h.track(scene);
  const world = h.worlds[0];
  assert.equal(world.motion.at(-1), true);
  h.document.hidden = true;
  h.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(world.motion.at(-1), false);
  h.reduced.matches = true;
  h.document.hidden = false;
  h.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(world.motion.at(-1), false);
  h.reduced.matches = false;
  h.reduced.dispatchEvent(new Event('change'));
  assert.equal(world.motion.at(-1), true);
  assert.equal(h.worlds.length, 1);
});
