import { fragmentSource, vertexSource, streamMask } from './materials';

type SceneKind = 'rain' | 'fire' | 'forest' | 'water' | 'quiet';
const files = {
  rain: '/scenes/rain-window.webp',
  fire: '/scenes/rain-fireplace.webp',
  forest: '/scenes/forest-stream.webp',
  water: '/scenes/ocean.webp'
};
const codes = { quiet: 0, rain: 1, fire: 2, forest: 3, water: 4 };
function kindFor(ids: string[]): SceneKind {
  if (ids.includes('fireplace')) return 'fire';
  if (ids.some((id) => id.includes('rain'))) return 'rain';
  if (
    ids.some((id) =>
      [
        'forest-birds',
        'wind-in-trees',
        'flowing-river',
        'water-droplets'
      ].includes(id)
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
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let kind = kindFor(sounds());
  let base = await load(kind);
  let disposed = false,
    revision = 0,
    frame = 0,
    last = 0,
    elapsed = 0;
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let textures: WebGLTexture[] = [];
  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  let mask: HTMLCanvasElement | undefined;
  let lost = false;

  // CSS fallback also remains visible while a GPU context is lost.
  function fallback() {
    canvas.style.backgroundColor = '#14232b';
    canvas.style.backgroundImage = base ? `url("${base.src}")` : 'none';
    canvas.style.backgroundSize = 'cover';
    canvas.style.backgroundPosition = `${kind === 'fire' ? 80 : kind === 'rain' ? 32 : 50}% center`;
  }
  function release() {
    if (!gl) return;
    textures.forEach((texture) => gl!.deleteTexture(texture));
    textures = [];
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    buffer = null;
    program = null;
  }
  function texture(source: TexImageSource | undefined, unit: number) {
    const t = gl!.createTexture();
    if (!t) throw new Error('Texture unavailable');
    textures.push(t);
    gl!.activeTexture(gl!.TEXTURE0 + unit);
    gl!.bindTexture(gl!.TEXTURE_2D, t);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    if (source)
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        source
      );
    else
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        1,
        1,
        0,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255])
      );
  }
  function upload() {
    if (!gl || !program || lost) return;
    textures.forEach((t) => gl!.deleteTexture(t));
    textures = [];
    texture(base, 0);
    if (kind === 'forest') mask ??= streamMask();
    texture(kind === 'forest' ? mask : undefined, 1);
  }
  function init() {
    canvas.dataset.renderer = 'static';
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power'
      });
      if (!gl) return;
      const shaders: WebGLShader[] = [];
      try {
        program = gl.createProgram();
        if (!program) throw new Error('Program unavailable');
        for (const [type, source] of [
          [gl.VERTEX_SHADER, vertexSource],
          [gl.FRAGMENT_SHADER, fragmentSource]
        ] as const) {
          const shader = gl.createShader(type)!;
          shaders.push(shader);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw new Error(gl.getShaderInfoLog(shader) || 'Shader failed');
          gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
          throw new Error('Link failed');
      } finally {
        shaders.forEach((shader) => gl!.deleteShader(shader));
      }
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );
      const position = gl.getAttribLocation(program!, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      uniforms = Object.fromEntries(
        [
          'plate',
          'regions',
          'cropScale',
          'cropOffset',
          'time',
          'scene',
          'rain',
          'motion'
        ].map((name) => [name, gl!.getUniformLocation(program!, name)])
      );
      gl.uniform1i(uniforms.plate, 0);
      gl.uniform1i(uniforms.regions, 1);
      upload();
      canvas.dataset.renderer = 'webgl';
    } catch (error) {
      console.warn('Soundscape uses a static fallback:', error);
      release();
    }
  }
  function draw() {
    if (!gl || !program || lost || disposed) return;
    const w = canvas.width,
      h = canvas.height;
    const iw = base?.width || w,
      ih = base?.height || h;
    const scale = Math.max(w / iw, h / ih);
    const focus = kind === 'fire' ? 0.8 : kind === 'rain' ? 0.32 : 0.5;
    const left = Math.min(
      0,
      Math.max(w - iw * scale, w / 2 - iw * scale * focus)
    );
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uniforms.cropScale, w / (iw * scale), h / (ih * scale));
    gl.uniform2f(
      uniforms.cropOffset,
      -left / (iw * scale),
      (ih * scale - h) / (2 * ih * scale)
    );
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.scene, codes[kind]);
    gl.uniform1f(
      uniforms.rain,
      sounds().some((id) => id.includes('rain')) ? 1 : 0
    );
    gl.uniform1f(uniforms.motion, reduced.matches ? 0 : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function animate(now: number) {
    frame = 0;
    if (
      disposed ||
      lost ||
      document.hidden ||
      reduced.matches ||
      !program ||
      kind === 'quiet'
    )
      return;
    if (!last || now - last >= 1000 / 30) {
      if (last) elapsed += Math.min((now - last) / 1000, 0.1);
      last = now;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function restart() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    draw();
    if (
      !disposed &&
      !document.hidden &&
      !reduced.matches &&
      !lost &&
      program &&
      kind !== 'quiet'
    )
      frame = requestAnimationFrame(animate);
  }
  function resize() {
    const width = canvas.clientWidth || innerWidth,
      height = canvas.clientHeight || innerHeight;
    // A bounded framebuffer avoids a 4K/Retina fragment workload.
    const dpr = Math.min(
      devicePixelRatio,
      width < 700 ? 1 : 1.5,
      1920 / width,
      1200 / height
    );
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    if (base) {
      const scale = Math.max(width / base.width, height / base.height);
      const focus = kind === 'fire' ? 0.8 : kind === 'rain' ? 0.32 : 0.5;
      const left = Math.min(
        0,
        Math.max(
          width - base.width * scale,
          width / 2 - base.width * scale * focus
        )
      );
      canvas.style.backgroundSize = `${base.width * scale}px ${base.height * scale}px`;
      canvas.style.backgroundPosition = `${left}px ${(height - base.height * scale) / 2}px`;
    }
    restart();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    lost = true;
    program = null;
    buffer = null;
    textures = [];
    cancelAnimationFrame(frame);
    canvas.dataset.renderer = 'static';
  }
  function contextRestored() {
    if (disposed) return;
    lost = false;
    release();
    init();
    resize();
  }
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  reduced.addEventListener('change', restart);
  document.addEventListener('visibilitychange', restart);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  fallback();
  init();
  resize();
  return {
    async update() {
      const token = ++revision;
      const next = kindFor(sounds());
      if (next === kind) {
        restart();
        return;
      }
      try {
        const image = await load(next);
        if (disposed || token !== revision) return;
        kind = next;
        base = image;
        elapsed = 0;
        fallback();
        upload();
        resize();
      } catch {
        /* Keep the last decoded scene and audio if an asset fails. */
      }
    },
    dispose() {
      disposed = true;
      revision++;
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduced.removeEventListener('change', restart);
      document.removeEventListener('visibilitychange', restart);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      release();
      mask = undefined;
    }
  };
}
