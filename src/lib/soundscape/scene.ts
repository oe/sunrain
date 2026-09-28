import type { SceneWorld } from "./world";

type SceneKind = "rain" | "fire" | "forest" | "water" | "quiet";
const files = {
  rain: "/scenes/rain-window.webp",
  fire: "/scenes/fire-poster.jpg?v=20260928",
  forest: "/scenes/stream-poster.jpg?v=20260928",
  water: "/scenes/ocean-poster.jpg",
};
const movies = {
  fire: "/scenes/fire-loop.mp4?v=20260928",
  forest: "/scenes/stream-loop.mp4?v=20260928",
  water: "/scenes/ocean-loop.mp4",
};
export function kindFor(ids: string[]): SceneKind {
  if (ids.includes("fireplace")) return "fire";
  if (ids.some((id) => id.includes("rain"))) return "rain";
  if (
    ids.some((id) =>
      [
        "forest-birds",
        "wind-in-trees",
        "flowing-river",
        "water-droplets",
      ].includes(id),
    )
  )
    return "forest";
  if (ids.includes("ocean-waves")) return "water";
  return "quiet";
}
export async function createScene(
  canvas: HTMLCanvasElement,
  sounds: () => string[],
) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let kind = kindFor(sounds());
  let disposed = false,
    revision = 0,
    frame = 0,
    last = 0,
    elapsed = 0,
    lost = false;
  let world: SceneWorld | undefined;
  function fallback() {
    // Discard the previous WebGL frame when changing to a native video poster.
    canvas.width = canvas.width;
    canvas.style.opacity = "1";
    canvas.style.backgroundColor = "#14232b";
    canvas.style.backgroundImage =
      kind === "quiet"
        ? "linear-gradient(#203039, #0b161c)"
        : `url("${files[kind]}")`;
    canvas.style.backgroundSize = "cover";
    canvas.style.backgroundPosition = kind === "rain" ? "32% center" : "center";
    canvas.dataset.renderer = "static";
  }
  async function prepare(next: SceneKind): Promise<SceneWorld> {
    if (next === "quiet")
      return { activate() {}, resize() {}, render() {}, dispose() {} };
    if (next === "forest" || next === "water" || next === "fire") {
      const { createMediaWorld } = await import("./media-world");
      const source =
        innerWidth < 700
          ? movies[next].replace(".mp4", "-mobile.mp4")
          : movies[next];
      return createMediaWorld(canvas, source, files[next]);
    }
    const { createPhotoWorld } = await import("./photo-world");
    return createPhotoWorld(canvas, next, files[next], sounds);
  }
  function draw() {
    if (!disposed && !lost) world?.render(elapsed);
  }
  function animate(now: number) {
    frame = 0;
    if (
      disposed ||
      lost ||
      document.hidden ||
      reduced.matches ||
      !world ||
      world.browserAnimation ||
      kind === "quiet"
    )
      return;
    if (!last || now - last >= 1000 / 30 - 1) {
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
    const moving = !disposed && !lost && !document.hidden && !reduced.matches;
    world?.setMotion?.(moving);
    if (!document.hidden) draw();
    if (moving && world && !world.browserAnimation && kind !== "quiet")
      frame = requestAnimationFrame(animate);
  }
  function resize() {
    if (disposed || lost) return;
    const width = canvas.clientWidth || innerWidth,
      height = canvas.clientHeight || innerHeight;
    const dpr = Math.min(
      devicePixelRatio,
      width < 700 ? 1 : 1.5,
      1920 / width,
      1200 / height,
    );
    world?.resize(width, height, dpr);
    restart();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    if (world?.browserAnimation) return;
    lost = true;
    cancelAnimationFrame(frame);
    canvas.dataset.renderer = "static";
  }
  function contextRestored() {
    if (disposed || world?.browserAnimation) return;
    lost = false;
    canvas.dataset.renderer = "three";
    resize();
  }
  fallback();
  try {
    world = await prepare(kind);
    world.activate();
  } catch (error) {
    console.warn("Soundscape uses a static fallback:", error);
  }
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  reduced.addEventListener("change", restart);
  document.addEventListener("visibilitychange", restart);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  return {
    async update() {
      const token = ++revision,
        next = kindFor(sounds());
      if (next === kind) {
        restart();
        return;
      }
      try {
        const prepared = await prepare(next);
        if (disposed || token !== revision) {
          prepared.dispose();
          return;
        }
        world?.dispose();
        world = prepared;
        kind = next;
        elapsed = 0;
        lost = false;
        fallback();
        world.activate();
        resize();
      } catch (error) {
        console.warn("Could not change soundscape:", error);
      }
    },
    dispose() {
      disposed = true;
      ++revision;
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduced.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      world?.dispose();
      world = undefined;
    },
  };
}
