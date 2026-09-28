import * as THREE from "three";
import type { SceneWorld } from "./world";
import {
  fragmentSource,
  vertexSource,
  dropVertex,
  dropFragment,
} from "./materials";

export async function createPhotoWorld(
  canvas: HTMLCanvasElement,
  kind: "rain" | "quiet",
  file: string | undefined,
  sounds: () => string[],
): Promise<SceneWorld> {
  const texture = file
    ? await new THREE.TextureLoader().loadAsync(file)
    : new THREE.Texture();
  texture.flipY = false;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
  } catch (error) {
    texture.dispose();
    throw error;
  }
  const scene = new THREE.Scene(),
    camera = new THREE.Camera();
  const uniforms = {
    plate: { value: texture },
    cropScale: { value: new THREE.Vector2(1, 1) },
    cropOffset: { value: new THREE.Vector2() },
    time: { value: 0 },
    scene: { value: kind === "rain" ? 1 : 0 },
  };
  const material = new THREE.RawShaderMaterial({
    uniforms,
    vertexShader: vertexSource,
    fragmentShader: fragmentSource,
    depthTest: false,
    depthWrite: false,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));
  let seed = 331;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const drops = Array.from({ length: 112 }, () => ({
    x: 0,
    y: 0,
    r: 0,
    v: 0,
    trail: 0,
    age: 10,
    phase: random() * 6,
  }));
  function reset(d: (typeof drops)[number], initial = false) {
    d.x = 0.077 + random() * 0.468;
    const top = 0.09 + d.x * 0.15;
    const bottom = d.x < 0.3 ? 0.59 : 0.65;
    d.y = initial ? top + random() * (bottom - top) : top;
    // A mix of pinned beads and clearly visible rivulets, all in plate UV space.
    d.r = 0.0018 + Math.pow(random(), 1.4) * 0.0045;
    d.v = initial && d.r > 0.003 ? 0.015 + random() * 0.025 : 0;
    d.trail = 0;
    d.age = initial ? 10 : 0;
  }
  drops.forEach((d) => reset(d, true));
  const dropGeometry = new THREE.InstancedBufferGeometry();
  dropGeometry.setAttribute("position", geometry.attributes.position);
  dropGeometry.setIndex(geometry.index);
  const attributes = new THREE.InstancedBufferAttribute(
    new Float32Array(drops.length * 4),
    4,
  );
  attributes.setUsage(THREE.DynamicDrawUsage);
  const life = new THREE.InstancedBufferAttribute(
    new Float32Array(drops.length).fill(1),
    1,
  );
  life.setUsage(THREE.DynamicDrawUsage);
  dropGeometry.setAttribute("life", life);
  dropGeometry.setAttribute(
    "phase",
    new THREE.InstancedBufferAttribute(
      new Float32Array(drops.map((d) => d.phase)),
      1,
    ),
  );
  dropGeometry.setAttribute("drop", attributes);
  dropGeometry.instanceCount = drops.length;
  const dropMaterial = new THREE.RawShaderMaterial({
    uniforms,
    vertexShader: dropVertex,
    fragmentShader: dropFragment,
    // Top-left plate UVs invert Y in the vertex shader, reversing winding.
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const rain = new THREE.Mesh(dropGeometry, dropMaterial);
  rain.frustumCulled = false;
  rain.renderOrder = 1;
  scene.add(rain);
  let previous = 0;
  return {
    activate() {
      canvas.style.opacity = "1";
      canvas.dataset.renderer = "three";
    },
    resize(width: number, height: number, pixelRatio: number) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      const w = canvas.width,
        h = canvas.height;
      const image = texture.image as HTMLImageElement | undefined;
      const iw = image?.width || w,
        ih = image?.height || h,
        scale = Math.max(w / iw, h / ih),
        focus = kind === "rain" ? 0.32 : 0.5;
      const left = Math.min(
        0,
        Math.max(w - iw * scale, w / 2 - iw * scale * focus),
      );
      uniforms.cropScale.value.set(w / (iw * scale), h / (ih * scale));
      uniforms.cropOffset.value.set(
        -left / (iw * scale),
        (ih * scale - h) / (2 * ih * scale),
      );
      // Preserve the exact crop if WebGL is lost, including portrait layouts.
      canvas.style.backgroundSize = `${(iw * scale * width) / w}px ${(ih * scale * height) / h}px`;
      canvas.style.backgroundPosition = `${(left * width) / w}px ${((h - ih * scale) * height) / (2 * h)}px`;
    },
    render(t: number) {
      uniforms.time.value = t;
      rain.visible =
        kind === "rain" && sounds().some((id) => id.includes("rain"));
      const dt = Math.max(0, Math.min(t - previous, 0.1));
      previous = t;
      if (rain.visible) {
        if (dt > 0)
          for (let i = 0; i < drops.length; i++) {
            const d = drops[i];
            d.age += dt;
            // Small beads pin to the glass. Larger beads accelerate under gravity;
            // surface tension intermittently arrests them rather than resetting time.
            const moving = d.r > 0.003;
            if (moving) {
              const drag = 0.7 + 0.3 * Math.sin(t * 0.9 + d.phase);
              d.v = Math.min(
                0.085,
                (d.v + dt * (0.016 + d.r * 4)) * Math.pow(0.98, dt * 30),
              );
              const travel = d.v * drag * dt;
              d.y += travel;
              d.trail = Math.min(0.15, d.trail + travel);
              d.x += Math.sin(d.y * 45 + d.phase) * travel * 0.08;
            } else d.r += dt * 0.000012;
            if (d.y > (d.x < 0.3 ? 0.6 : 0.66)) reset(d);
            // Coalescence conserves the approximate bead volume.
            for (let j = 0; j < i; j++) {
              const b = drops[j];
              if (
                Math.hypot((d.x - b.x) * 1.7778, d.y - b.y) <
                (d.r + b.r) * 0.75
              ) {
                d.r = Math.min(0.0075, Math.cbrt(d.r ** 3 + b.r ** 3));
                reset(b);
              }
            }
          }
        drops.forEach((d, i) => {
          attributes.setXYZW(i, d.x, d.y, d.r, d.trail);
          life.setX(i, Math.min(d.age / 1.5, 1));
        });
        attributes.needsUpdate = true;
        life.needsUpdate = true;
      }
      renderer.render(scene, camera);
    },
    dispose() {
      texture.dispose();
      geometry.dispose();
      material.dispose();
      dropGeometry.dispose();
      dropMaterial.dispose();
      renderer.dispose();
    },
  };
}
