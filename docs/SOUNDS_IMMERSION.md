# Soundscape immersion

The immersive view combines a generated rain-room plate with Three.js droplets
and licensed, edited temporal footage for the stream, fireplace, and sea.
Motion follows the sound environment rather than an audio spectrum.

## Interaction

- The selection page shows presets and sounds first. Playback reveals a compact
  bottom control bar with the active mix, master volume, stop, immersive entry,
  and the desktop automatic-entry setting. Stopping all sounds hides it again.
- Actual, non-muted playback and 20 seconds without pointer, keyboard or wheel
  activity permit automatic entry on viewports at least 1024px wide with a fine
  pointer and hover. Hidden tabs and reduced-motion preferences prevent entry.
- The automatic-entry preference is optional localStorage state. Mobile and touch
  devices only enter via the explicit button. No scene is fetched before entry.
- Leaving a scene preserves playback and suppresses automatic entry for that
  listening session. Stopping every track permits automatic entry next time.
- Title and controls remain visible for the first 6.5 seconds. After 3.2 seconds
  without mouse, keyboard, wheel, or touch input, all chrome and the pointer fade
  away. Any input restores them immediately; leaving uses Back or Escape.
- Lock limits restored controls to Unlock. It also fades away during inactivity
  and returns on input. Escape always allows leaving the modal (the browser may
  consume the first Escape to leave native fullscreen).
- Native fullscreen is an explicit user action and operates on the scene wrapper,
  since a dialog itself cannot be a fullscreen target. Unsupported browsers omit
  the button; rejected requests retain the page-sized view.
- Mix volume is shared between the original page and the scene. Per-track sliders
  retain their mix ratios. Stop sounds stops all tracks; Back leaves them playing.

## Loading and rendering

`sounds.astro` loads the room only on entry. `scene.ts` then loads only the selected
renderer and assets. Rain imports `photo-world.ts`, Three.js, and the rain-room
WebP. The other natural scenes import `media-world.ts`, a matching poster, and
one silent MP4. Video scenes do not download Three.js. Quiet noise uses a static
CSS gradient and does not initialize a GPU renderer.

- **Rain:** 72 instanced refractive beads have individual position, size, velocity,
  growth, and age. Small beads stick; larger beads accelerate, merge approximately
  by volume, and leave narrow trails. New beads fade in, and exiting beads fade
  out above the furniture. Each bead samples the background through its own
  curved lens. Window frames and furniture are not deformed.
- **Stream / woodland:** real water, reflections, drifting mist, and nearby
  foliage move together in a registered, fixed-camera scene. Rocks stay fixed.
- **Fire:** actual flame tongues rise, split, and disappear, with corresponding
  light on the firebox. There is no displacement of a photographed flame.
- **Ocean:** shore waves advance and recede at sunset, with a fixed horizon. The
  earlier clip that contained only retreating foam was rejected for its seam.

Rain targets 30fps with bounded drawing-buffer density (1 on small screens, 1.5
on desktop, maximum 1920 by 1200). The video scenes use native muted `playsinline`
playback at 24fps. This avoids re-uploading full video frames through WebGL.
Desktop assets are 1920 by 1080; viewports under 700px choose the 1280 by 720
variant once on entry. Portrait cover crops are centered on the scene.

The videos have no audio track. Howler remains the sole sound source. Only the
active video exists; exit pauses it, removes its source, resets the media element,
and removes it. Scene preparation uses revisions so a stale completion cannot
replace a newer scene or leak a player after exit.

With reduced motion already enabled, entering a video scene fetches only its
poster; it does not fetch the video. Changing the preference while playing freezes
the current frame. Hidden tabs pause playback and the rain loop. Returning resumes
without a catch-up jump. Rain renders once for reduced motion. WebGL failure,
context loss, media-load failure, or denied autoplay retains the matching static
background. Rendering limits are workload controls, not universal FPS guarantees.

## Motion sources and reproduction

The rain room was generated with imagegen at 1672 by 941, then converted to WebP.
The three temporal sources are **real footage**, not AI-generated video or fluid
simulations. They were selected after rejecting a procedural 3D creek pilot whose
banks and stones still looked artificial, and a fire clip with a moving camera.

The exact source pages, download URLs, approved license, and loop parameters are
recorded in `public/scenes/motion-sources.json`. On 2026-09-25, each selected item
page displayed **Mixkit Stock Video Free License**; the linked license permits
commercial projects and editing. Candidates under the **Restricted License**
were excluded. Attribution is optional under the license; provenance is retained
here and in the manifest. See https://mixkit.co/license/#videoFree and
https://mixkit.co/terms/ for the applicable terms. Originals are not committed.

The processing keeps forward motion throughout. A trimmed middle segment is
followed by a short dissolve from the source tail into its head; the next loop
continues at the next head frame. No ping-pong/reverse playback is used. Modest
color adjustment is baked into both resolutions. The first encoded frame becomes
the poster, avoiding a composition change as playback starts. A dissolve is an
editorial loop seam, not a physical continuation of the source recording.

To reproduce, download the three manifest URLs into a local source directory,
using the manifest's `input` filenames, then run:

```sh
python3 scripts/build-scene-loops.py /path/to/originals
pnpm audit:scenes
pnpm build
pnpm verify:sunrain
git diff --check
```

The asset scripts require ffmpeg and ffprobe. `audit:scenes` checks H.264/yuv420p,
24fps, both dimensions, silent streams, duration, file budgets, MP4 faststart, and
the decoded final-to-first frame difference relative to ordinary internal changes.
That numerical check catches flashes and cuts; it does not prove visual realism.
Visual review must also check normal forward motion, fixed geometry, the dissolve,
portrait crops, and interaction at actual playback speed.

## Browser acceptance

The acceptance flow is: choose a sound, enter immersion, observe motion, let the
controls hide, restore them with input, lock/unlock, exit while preserving audio,
and stop playback. Repeat on desktop and a touch-sized viewport. Also exercise
reduced motion, asset failure, hidden/resumed playback, repeated entry/exit, rapid
scene changes, WebGL context loss/restoration, and a cold initial resource list.

The Browser plugin is not available in this environment; browser checks use
bundled Playwright with installed Chrome. Hardware-backed desktop rendering can
be checked via `WEBGL_debug_renderer_info`. Mobile emulation verifies layout and
interaction only; it does not certify a physical phone's decoder, GPU, or battery
use. Native iOS Safari and physical Android still need device coverage.

### Verified on 2026-09-25

Production-build Chrome checks passed at 1440×900 on Apple M2 / ANGLE Metal,
plus a 390×844 touch viewport at DPR 2. The run verified cold-load asset isolation,
actual-audio desktop automatic entry, mobile manual-only entry, all four scene
renderers, idle cursor/control hiding, mouse/keyboard/touch wake, lock/unlock,
Escape preserving audio, explicit fullscreen, repeated player disposal, failed
video poster fallback, cancellation during delayed preparation, reduced-motion
cold entry and live preference changes, and real WebGL context loss/restoration.
The clean production run reported no application console or runtime errors.
The three video observations each advanced roughly 180 frames with zero dropped
frames in that run; this is one-device evidence, not a general performance claim.

Frame and portrait-crop review accepted the fixed geometry and natural movement.
All six encoded variants passed the loop-boundary audit. Build/type checks and
`verify:sunrain` passed. The checks also exposed a Howler loop event resetting the
20-second idle timer and restarting the audio fade; only requested starts now do
that. Real playback automatic entry and rapid pause/resume volume were retested.
