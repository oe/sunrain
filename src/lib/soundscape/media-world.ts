import type { SceneWorld } from "./world";

/** Browser video decoding preserves real temporal motion and avoids copying a
 * full video texture to WebGL every frame. Audio always belongs to Howler. */
export async function createMediaWorld(
  canvas: HTMLCanvasElement,
  source: string,
  poster: string,
): Promise<SceneWorld> {
  const image = new Image();
  image.src = poster;
  await image.decode();
  const video = document.createElement("video");
  video.className = "room-motion";
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = "none";
  video.poster = poster;
  video.disablePictureInPicture = true;
  video.setAttribute("aria-hidden", "true");
  video.tabIndex = -1;
  let disposed = false,
    active = false,
    moving = false,
    revision = 0;
  const failed = () => {
    if (!disposed && active) {
      // Keep the matching poster visible if decoding or autoplay fails.
      video.pause();
      canvas.style.opacity = "1";
      canvas.dataset.renderer = "static";
    }
  };
  const playing = () => {
    if (!disposed && active && moving) {
      canvas.style.opacity = "0";
      canvas.dataset.renderer = "video";
    }
  };
  video.addEventListener("error", failed);
  video.addEventListener("playing", playing);
  return {
    browserAnimation: true,
    activate() {
      active = true;
      canvas.parentElement!.insertBefore(video, canvas);
      canvas.style.opacity = "1";
      canvas.style.backgroundImage = `url("${poster}")`;
      canvas.dataset.renderer = "static";
    },
    resize() {},
    render() {},
    setMotion(enabled) {
      moving = enabled;
      const token = ++revision;
      if (!enabled) {
        video.pause();
        return;
      }
      if (!video.getAttribute("src")) video.src = source;
      void video
        .play()
        .then(() => {
          if (disposed || !moving) video.pause();
        })
        .catch(() => {
          if (!disposed && token === revision) failed();
        });
    },
    dispose() {
      disposed = true;
      active = false;
      moving = false;
      ++revision;
      video.removeEventListener("error", failed);
      video.removeEventListener("playing", playing);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
    },
  };
}
