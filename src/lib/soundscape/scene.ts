/** Photoreal base plates with restrained, material-specific local motion. */
type SceneKind = 'rain' | 'fire' | 'forest' | 'water' | 'quiet';

interface SceneAssets {
  base?: HTMLImageElement;
  fireFrame?: HTMLImageElement;
  waterFrame?: HTMLImageElement;
}

const files: Record<Exclude<SceneKind, 'quiet'>, string> = {
  rain: '/scenes/rain-window.webp',
  fire: '/scenes/rain-fireplace.webp',
  forest: '/scenes/forest-stream.webp',
  water: '/scenes/ocean.webp'
};

const FIRE_FRAME = '/scenes/rain-fireplace-flame-b.png';
const WATER_FRAME = '/scenes/ocean-wave-b.webp';
const FIRE_FRAME_RECT = { x: 1332, y: 520, width: 220, height: 210 };
const WATER_FRAME_RECT = { x: 0, y: 450, width: 1672, height: 330 };

function kindFor(ids: string[]): SceneKind {
  if (ids.includes('fireplace')) return 'fire';
  if (ids.some((id) => id.includes('rain'))) return 'rain';
  if (
    ids.some(
      (id) =>
        id === 'forest-birds' ||
        id === 'wind-in-trees' ||
        id === 'flowing-river' ||
        id === 'water-droplets'
    )
  )
    return 'forest';
  if (ids.includes('ocean-waves')) return 'water';
  return 'quiet';
}

async function loadImage(source: string) {
  const image = new Image();
  image.src = source;
  await image.decode();
  return image;
}

async function loadAssets(
  kind: SceneKind,
  includeMotion = true
): Promise<SceneAssets> {
  if (kind === 'quiet') return {};
  const base = await loadImage(files[kind]);
  if (!includeMotion) return { base };
  if (kind === 'water') {
    const waterFrame = await loadImage(WATER_FRAME).catch(() => undefined);
    return { base, waterFrame };
  }
  if (kind !== 'fire') return { base };
  const fireFrame = await loadImage(FIRE_FRAME).catch(() => undefined);
  return { base, fireFrame };
}

function smoothstep(from: number, to: number, value: number) {
  const position = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return position * position * (3 - 2 * position);
}

function seeded(index: number) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export async function createScene(
  canvas: HTMLCanvasElement,
  sounds: () => string[]
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let kind = kindFor(sounds());
  let assets = await loadAssets(kind, !reduced.matches);
  let width = 0,
    height = 0,
    frame = 0,
    previous = 0,
    disposed = false,
    revision = 0;
  let scale = 1,
    offsetX = 0,
    offsetY = 0;

  function resize() {
    width = innerWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio, width < 700 ? 1 : 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  function glow(x: number, y: number, radius: number, color: string) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawBase(time: number) {
    const base = assets.base;
    if (!base) {
      const background = ctx.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, '#202831');
      background.addColorStop(1, '#0b171e');
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      glow(
        width * 0.42,
        height * 0.45,
        width * 0.7,
        `rgba(166,140,112,${0.13 + Math.sin(time * 0.09) * 0.01})`
      );
      return;
    }

    scale = Math.max(width / base.width, height / base.height);
    const focusX = kind === 'fire' ? 0.8 : kind === 'rain' ? 0.32 : 0.5;
    offsetX = Math.min(
      0,
      Math.max(
        width - base.width * scale,
        width / 2 - base.width * scale * focusX
      )
    );
    offsetY = (height - base.height * scale) / 2;
    ctx.drawImage(
      base,
      offsetX,
      offsetY,
      base.width * scale,
      base.height * scale
    );
  }

  function drawRain(time: number, base: HTMLImageElement) {
    // These bounds follow the actual glass, so refraction never crosses the frame.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(base.width * 0.059, base.height * 0.073);
    ctx.lineTo(base.width * 0.565, base.height * 0.145);
    ctx.lineTo(base.width * 0.565, base.height * 0.66);
    ctx.lineTo(base.width * 0.06, base.height * 0.65);
    ctx.closePath();
    ctx.clip();

    for (let index = 0; index < 11; index++) {
      const cycle = 8 + seeded(index + 40) * 9;
      const phase = (time / cycle + seeded(index + 70)) % 1;
      const movement = smoothstep(0.7, 0.94, phase);
      const fadeIn = smoothstep(0.02, 0.12, phase);
      const fadeOut = 1 - smoothstep(0.9, 0.99, phase);
      const opacity = fadeIn * fadeOut;
      if (opacity <= 0.01) continue;

      const x = base.width * (0.085 + seeded(index) * 0.455);
      const restingY = base.height * (0.16 + seeded(index + 15) * 0.35);
      const travel = base.height * (0.07 + seeded(index + 28) * 0.1);
      const curve =
        Math.sin(movement * Math.PI) * (seeded(index + 4) - 0.5) * 5;
      const y = restingY + movement * travel;
      const radius = 1.1 + seeded(index + 22) * 1.3;

      // A one-pixel sample offset creates refraction rather than a drawn white dot.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 1.7, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = opacity * 0.72;
      ctx.drawImage(base, 1.2, 0, base.width, base.height);
      ctx.restore();

      if (phase > 0.7 && phase < 0.97) {
        const tail = 4 + movement * 14;
        const tailGradient = ctx.createLinearGradient(x, y - tail, x, y);
        tailGradient.addColorStop(0, 'rgba(205,225,229,0)');
        tailGradient.addColorStop(1, `rgba(205,225,229,${opacity * 0.24})`);
        ctx.strokeStyle = tailGradient;
        ctx.lineWidth = Math.max(0.55, radius * 0.55);
        ctx.beginPath();
        ctx.moveTo(x - curve * 0.3, y - tail);
        ctx.quadraticCurveTo(x + curve, y - tail * 0.4, x, y);
        ctx.stroke();
      }

      ctx.strokeStyle = `rgba(224,237,239,${opacity * 0.24})`;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 1.7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFire(time: number, base: HTMLImageElement) {
    const alternate = assets.fireFrame;
    if (alternate) {
      const phase = (time % 11) / 11;
      let blend = 0;
      if (phase < 0.16) blend = smoothstep(0, 0.16, phase);
      else if (phase < 0.52) blend = 1;
      else if (phase < 0.68) blend = 1 - smoothstep(0.52, 0.68, phase);
      if (blend > 0) {
        ctx.globalAlpha = blend;
        ctx.drawImage(
          alternate,
          FIRE_FRAME_RECT.x,
          FIRE_FRAME_RECT.y,
          FIRE_FRAME_RECT.width,
          FIRE_FRAME_RECT.height
        );
        ctx.globalAlpha = 1;
      }
    }

    const pulse =
      0.018 + Math.sin(time * 1.1) * 0.004 + Math.sin(time * 1.9) * 0.003;
    const light = ctx.createRadialGradient(
      base.width * 0.875,
      base.height * 0.7,
      0,
      base.width * 0.875,
      base.height * 0.7,
      base.width * 0.3
    );
    light.addColorStop(0, `rgba(255,151,58,${pulse})`);
    light.addColorStop(1, 'transparent');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, base.width, base.height);
  }

  function drawWater(time: number, base: HTMLImageElement) {
    const alternate = assets.waterFrame;
    if (alternate) {
      const phase = (time % 14) / 14;
      let blend = 0;
      if (phase < 0.18) blend = smoothstep(0, 0.18, phase);
      else if (phase < 0.54) blend = 1;
      else if (phase < 0.72) blend = 1 - smoothstep(0.54, 0.72, phase);
      if (blend > 0) {
        ctx.globalAlpha = blend;
        ctx.drawImage(
          alternate,
          WATER_FRAME_RECT.x,
          WATER_FRAME_RECT.y,
          WATER_FRAME_RECT.width,
          WATER_FRAME_RECT.height
        );
        ctx.globalAlpha = 1;
      }
    }

    const reflection = ctx.createRadialGradient(
      base.width * (0.76 + Math.sin(time * 0.08) * 0.004),
      base.height * 0.63,
      0,
      base.width * 0.76,
      base.height * 0.63,
      base.width * 0.24
    );
    reflection.addColorStop(
      0,
      `rgba(222,202,175,${0.009 + Math.sin(time * 0.23) * 0.003})`
    );
    reflection.addColorStop(1, 'transparent');
    ctx.fillStyle = reflection;
    ctx.fillRect(0, 0, base.width, base.height);
  }
  function drawAtmosphere(time: number, base: HTMLImageElement) {
    if (kind === 'forest') {
      const mist = ctx.createRadialGradient(
        base.width * 0.52,
        base.height * 0.44,
        0,
        base.width * 0.5,
        base.height * 0.45,
        base.width * 0.46
      );
      mist.addColorStop(
        0,
        `rgba(218,230,218,${0.009 + Math.sin(time * 0.11) * 0.003})`
      );
      mist.addColorStop(1, 'transparent');
      ctx.fillStyle = mist;
      ctx.fillRect(0, 0, base.width, base.height);
    }
  }

  function draw(now: number) {
    const time = reduced.matches ? 0 : now / 1000;
    drawBase(time);
    const base = assets.base;
    if (reduced.matches || !base) return;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    const ids = sounds();
    if (
      (kind === 'rain' || kind === 'fire') &&
      ids.some((id) => id.includes('rain'))
    )
      drawRain(time, base);
    if (kind === 'fire') drawFire(time, base);
    if (kind === 'water') drawWater(time, base);
    drawAtmosphere(time, base);
    ctx.restore();
  }

  function tick(now: number) {
    if (now - previous > 50 && !document.hidden && !reduced.matches) {
      draw(now);
      previous = now;
    }
    frame = requestAnimationFrame(tick);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  function restart() {
    cancelAnimationFrame(frame);
    resize();
    if (!document.hidden && !reduced.matches)
      frame = requestAnimationFrame(tick);
  }
  reduced.addEventListener('change', restart);
  document.addEventListener('visibilitychange', restart);
  restart();

  return {
    async update() {
      const next = kindFor(sounds());
      if (next !== kind) {
        const updateRevision = ++revision;
        try {
          const nextAssets = await loadAssets(next, !reduced.matches);
          if (disposed || updateRevision !== revision) return;
          kind = next;
          assets = nextAssets;
        } catch {
          // Keep the last fully decoded scene when a later optional scene fails.
        }
      }
      if (!disposed) draw(performance.now());
    },
    dispose() {
      disposed = true;
      ++revision;
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduced.removeEventListener('change', restart);
      document.removeEventListener('visibilitychange', restart);
    }
  };
}
