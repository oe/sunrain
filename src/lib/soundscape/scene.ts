/** Photoreal base + restrained local micro motion. No video, GPU dependency or audio capture. */
type SceneKind = 'rain' | 'fire' | 'forest' | 'water' | 'quiet';
const files: Record<Exclude<SceneKind, 'quiet'>, string> = {
  rain: '/scenes/rain-window.webp',
  fire: '/scenes/rain-fireplace.webp',
  forest: '/scenes/forest-stream.webp',
  water: '/scenes/ocean.webp'
};
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
async function load(kind: SceneKind) {
  if (kind === 'quiet') return undefined;
  const image = new Image();
  image.src = files[kind];
  await image.decode();
  return image;
}
export async function createScene(
  canvas: HTMLCanvasElement,
  sounds: () => string[]
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let kind = kindFor(sounds()),
    image = await load(kind);
  let width = 0,
    height = 0,
    frame = 0,
    previous = 0,
    disposed = false,
    revision = 0;
  let scale = 1,
    offsetX = 0,
    offsetY = 0;
  const seeds = Array.from({ length: 48 }, (_, i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  });
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
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
  function draw(now: number) {
    const t = reduced.matches ? 0 : now / 1000;
    const ids = sounds();
    if (image) {
      // Cover crop uses the same transform for photograph and effects, including portrait viewports.
      scale = Math.max(width / image.width, height / image.height);
      const focusX = kind === 'fire' ? 0.8 : kind === 'rain' ? 0.32 : 0.5;
      offsetX = Math.min(
        0,
        Math.max(
          width - image.width * scale,
          width / 2 - image.width * scale * focusX
        )
      );
      offsetY = (height - image.height * scale) / 2;
      ctx.drawImage(
        image,
        offsetX,
        offsetY,
        image.width * scale,
        image.height * scale
      );
    } else {
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, '#202831');
      g.addColorStop(1, '#0b171e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      glow(
        width * (0.4 + Math.sin(t * 0.05) * 0.08),
        height * 0.45,
        width * 0.7,
        '#a68c702b'
      );
    }
    if (reduced.matches || !image) return;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    const w = image.width,
      h = image.height;
    if (
      (kind === 'rain' || kind === 'fire') &&
      ids.some((id) => id.includes('rain'))
    ) {
      // Polygon follows the actual pane; rain never drifts across furniture or wood frames.
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(w * 0.059, h * 0.073);
      ctx.lineTo(w * 0.565, h * 0.145);
      ctx.lineTo(w * 0.565, h * 0.66);
      ctx.lineTo(w * 0.06, h * 0.65);
      ctx.closePath();
      ctx.clip();
      for (let i = 0; i < 32; i++) {
        const x = w * (0.07 + seeds[i] * 0.49);
        const y =
          h *
          (0.12 +
            ((seeds[(i + 13) % 48] + t * (0.003 + seeds[i] * 0.005)) % 1) *
              0.55);
        const length = 6 + seeds[i] * 18;
        ctx.strokeStyle = '#d1e0e02b';
        ctx.lineWidth = 0.7 + seeds[i] * 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y - length);
        ctx.bezierCurveTo(
          x - 1,
          y - length * 0.6,
          x + 1.4,
          y - length * 0.3,
          x,
          y
        );
        ctx.stroke();
        ctx.fillStyle = '#d1e0e045';
        ctx.beginPath();
        ctx.ellipse(x, y, 1, 1.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (kind === 'fire') {
      const pulse =
        0.025 + Math.sin(t * 1.6) * 0.008 + Math.sin(t * 2.7 + 0.4) * 0.006;
      const g = ctx.createRadialGradient(
        w * 0.875,
        h * 0.72,
        0,
        w * 0.875,
        h * 0.72,
        w * 0.3
      );
      g.addColorStop(0, `rgba(255,154,56,${pulse})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // Tiny shimmer confined to the flame interior; the camera and architectural edges stay fixed.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(
        w * 0.886,
        h * 0.674,
        w * 0.031,
        h * 0.085,
        0,
        0,
        Math.PI * 2
      );
      ctx.clip();
      for (let y = Math.floor(h * 0.585); y < h * 0.76; y += 3) {
        const shift = Math.sin(t * 1.7 + y * 0.09) * 1.4;
        ctx.drawImage(
          image,
          w * 0.84,
          y,
          w * 0.09,
          3,
          w * 0.84 + shift,
          y,
          w * 0.09,
          3
        );
      }
      ctx.restore();
    }
    if (kind === 'forest') {
      const g = ctx.createRadialGradient(
        w * (0.49 + Math.sin(t * 0.06) * 0.02),
        h * 0.45,
        0,
        w * 0.5,
        h * 0.45,
        w * 0.5
      );
      g.addColorStop(
        0,
        `rgba(218,230,218,${0.016 + Math.sin(t * 0.13) * 0.006})`
      );
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    if (
      (kind === 'forest' &&
        ids.some((id) => id === 'flowing-river' || id === 'water-droplets')) ||
      kind === 'water'
    ) {
      ctx.save();
      ctx.beginPath();
      if (kind === 'water') ctx.rect(0, h * 0.54, w, h * 0.4);
      else {
        ctx.moveTo(w * 0.51, h * 0.7);
        ctx.lineTo(w * 0.65, h * 0.72);
        ctx.lineTo(w * 0.42, h * 0.94);
        ctx.lineTo(w * 0.24, h * 0.86);
        ctx.closePath();
      }
      ctx.clip();
      const start = kind === 'water' ? 0.54 : 0.7;
      for (let y = Math.floor(h * start); y < h * 0.94; y += 4) {
        const taper = Math.sin((Math.PI * (y / h - start)) / (0.94 - start));
        const shift = Math.sin(t * 0.65 + y * 0.045) * taper * 0.9;
        ctx.drawImage(image, 0, y, w, 4, shift, y, w, 4);
      }
      ctx.restore();
    }
    if (kind === 'water') {
      // A barely perceptible wash follows the shore's slow swell; no zoom or parallax.
      const g = ctx.createLinearGradient(0, h * 0.52, 0, h);
      g.addColorStop(0, 'transparent');
      g.addColorStop(
        0.6,
        `rgba(186,213,218,${0.012 + Math.sin(t * 0.5) * 0.009})`
      );
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }
  function tick(now: number) {
    if (now - previous > 65 && !document.hidden && !reduced.matches) {
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
        const id = ++revision;
        try {
          const nextImage = await load(next);
          if (disposed || id !== revision) return;
          kind = next;
          image = nextImage;
        } catch {
          /* Keep the last valid scene if a later asset fails. */
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
