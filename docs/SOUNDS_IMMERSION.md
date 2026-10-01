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

- **Rain:** 112 instanced refractive beads have individual position, size, velocity,
  growth, and age. Small beads stick; larger beads accelerate, merge approximately
  by volume, and leave narrow trails. New beads fade in, and exiting beads fade
  out above the furniture. Each bead samples the background through its own
  curved lens. Window frames and furniture are not deformed.
- **Stream / woodland:** registered temporal water, reflections, and drifting mist
  remain live through a feathered mask. A fixed bank/canopy plate removes residual
  near/far parallax, so the shore no longer sways with the source camera.
- **Fire:** the camera is registered to brick/log reference patches before encoding.
  Actual flame tongues rise, split, and disappear with their original firelight. There is no displacement of a photographed flame.
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

The asset scripts require ffmpeg and ffprobe. Stream/fire registration additionally
requires Python packages `numpy` and `opencv-python-headless` (validated with NumPy
2.3.5 and OpenCV 4.13.0). These are offline tools, never browser dependencies.
`register-scene.py` verifies source hashes, applies calibrated affine tracks and
a fixed crop, and composites the stream bank. See `scripts/scene-registration/`
for the calibration data and its limitations. `audit:scenes` checks H.264/yuv420p,
24fps, both dimensions, silent streams, duration, file budgets, MP4 faststart, and
the decoded final-to-first frame difference relative to ordinary internal changes.
It also checks the stream bank against its fixed plate and tracks a
brightness-normalized firebox mortar edge across every frame.
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

**Superseded visual verdict:** the initial frame/crop review missed camera drift
and a back-face-culling error in the rain layer. The checks below replace that
acceptance; loading a renderer and comparing only a loop boundary were inadequate.
All six encoded variants passed the loop-boundary audit. Build/type checks and
`verify:sunrain` passed. The checks also exposed a Howler loop event resetting the
20-second idle timer and restarting the audio fade; only requested starts now do
that. Real playback automatic entry and rapid pause/resume volume were retested.


### Corrections verified on 2026-09-28

- Source camera motion is corrected offline, with one constant crop throughout.
  The stream's fixed shore no longer moves during the dissolve. Fire retains the
  source flame pixels and illumination; a flame-keying experiment was rejected
  because it damaged soft flame edges.
- Loop windows were reselected by comparing full overlap sequences, including
  temporal differences, after registration. Stream uses a 7-second loop with a
  1-second overlap; fire uses 6.125 seconds with a 0.5-second overlap. These remain
  editorial dissolves, not physically synthesized continuations. No reversal or
  animated zoom is used. Versioned URLs invalidate the previous videos/posters.
- Top-left plate coordinates reverse the rain quads' winding. The droplet material
  now renders both sides, fixing the invisible layer. Droplets have visible sizes,
  curved refractive trails and a glass-only mask; furniture remains unchanged.
- Desktop (1440×900) and touch (390×844) Chrome frames one second apart contained
  4,886 and 1,739 visibly changed pixels respectively. Desktop furniture outside
  the glass stayed identical. With reduced motion, both viewport pairs were
  identical. These checks demonstrate actual rain motion, not just a running RAF.
- The new structural audit rejects the previous assets: the old fire's mortar edge
  stayed aligned in only 27.6% of sampled frames, versus 100% now under the same
  coarse audit. The fixed stream-bank difference remains below the codec-noise
  threshold throughout the new loop. This is sampled structural evidence, not a
  guarantee that every pixel is stationary; water, flame and illumination should move.

Production Chrome playback crossed three actual loop boundaries per scene without
application errors. Measured presentation intervals at the native
video rewind were 50–84ms; native `video.loop` still has a small decoder rewind
cost, so this is not a claim of sample-perfect gapless playback. The visual camera
jump and the misregistered dissolve are addressed by the assets above.

Browser checks use the production preview plus the existing Playwright fallback.
Physical iPhone/Android performance remains untested.

## Repeatable regression checks

Use Node 24.1 or newer and the repository's pinned pnpm version:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test:unit
pnpm build
pnpm verify:sunrain
pnpm test:e2e
git diff --check
```

`test:e2e` starts a fresh production preview on `127.0.0.1:4362` and launches
isolated desktop and touch-emulated Chromium contexts. It never attaches to an
existing browser. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` may select an installed
Chromium binary. Do not substitute a production URL for the local preview.

The suite covers real Web Audio output signal, mix/master ratios, rapid
pause/resume, Back versus Stop, repeated entry/disposal, scene changes,
lock/unlock, native fullscreen when available, portrait/landscape control bounds,
synthetic asymmetric safe areas, reduced-motion cold/live changes, and simulated
visibility/page lifecycle interruptions. A real-time pink-noise check samples
output through an actual loop boundary; it detects software silence, not clicks,
subjective quality, physical speaker output, or every sound's seam. The Node suite
uses isolated browser/world substitutes to exercise interrupted/suspended audio,
gesture retry, cancellation, stale scene preparation, poster failure and cleanup.

On foreground return, an existing active audio session now attempts to resume a
suspended or interrupted AudioContext. If browser autoplay policy rejects this,
the next pointer/key gesture retries. Stopped sounds are not restarted. Scene
preparation reconciles with the current mix before opening; failed scene changes
release the old renderer and select the requested scene's static background.
Immersion temporarily opts into edge-to-edge viewport coverage, restores the
original viewport on exit, and lays out controls inside asymmetric safe insets.

Every production build emits `/build-metadata.json` with its full commit,
clean/dirty/unknown source state, and a deterministic source fingerprint. The
fingerprint covers tracked and non-ignored source files, not dependencies,
ignored local environment files, or a checksum of output bytes. A dirty build
must not be reported as validation of its commit alone. Builds fail if source
changes during generation. Browser results attach that exact metadata and reject
an outdated build. CI retains metadata, console logs, screenshots and failure
traces in `regression-evidence-<commit>` for 14 days; deployments use the same
validated build artifact.

These checks do not certify physical iPhone/Android backgrounding, OS screen
lock, native Safari fullscreen behavior, audible listening quality, heat or
battery use. Device acceptance must record device/OS/browser, tested URL and
`build-metadata.json`, then manually cover those cases before claiming them.
