# Soundscape immersion

The immersive view uses fixed, photorealistic generated artwork with small local
WebGL material effects. It is a calm environment rather than an audio spectrum visualizer.

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

`sounds.astro` keeps a small interaction/playback gate. `immersive.ts`, its CSS,
`scene.ts`, and exactly the selected WebP are loaded on demand. Image decoding
finishes before opening; state is checked again after loading to prevent stale
automatic entry. An initial asset failure leaves audio and the original page
usable, with a retryable message.

The renderer uses a single WebGL pass with source-image coordinates, so material
masks stay registered under responsive cover crops. Pixel density is capped at 1
on small screens and 1.5 on desktop, with a maximum 1920 × 1200 framebuffer. It
targets 30fps, stops in hidden tabs, and renders a static frame for reduced motion.
Textures upload only on scene changes. Exit deletes buffers, textures, programs,
animation callbacks and listeners; the reusable canvas keeps its single context.
No WebGL or a lost context shows the same photo using CSS; context restoration
rebuilds GPU resources. These are workload limits, not a hardware FPS guarantee.

Scene selection prioritizes fireplace, rain, woodland/stream, ocean, then a neutral
noise backdrop. Portrait crops center the relevant subject. Rain in a fireplace
mix also enables the glass effect; fire alone does not animate the rain. Multiple
tracks form one environment instead of switching scenes per sound.

- **Glass:** independently paced droplets descend along gently wandering paths.
  Each drop refracts the underlying photograph and leaves a tapering wet trail;
  window edges and foreground furniture are excluded. The photograph's existing
  small droplets provide the stationary layer.
- **Fire:** upward-travelling multiscale turbulence deforms the photographed flame
  texture. Bright flame regions move and fluctuate while masks protect the dark
  logs, firebox and room. This is texture animation, not a combustion simulation.
- **Stream:** two offset advection phases move the water texture downstream without
  a hard loop reset. Perspective adjusts speed; fine ripples perturb reflections.
  Hand-traced water/rock masks live in `materials.ts`; source-sample checks prevent
  rock pixels from being pulled into the water. The upper forest remains still.
- **Ocean:** localized travelling ripples affect the water, with a fixed horizon
  and sky. It is a secondary effect, not a simulated breaking-wave cycle.

`materials.ts` contains the GLSL and the authored water mask; `scene.ts` owns GPU
resources and lifecycle. No Three.js, WASM, extra image frames or new dependencies
are needed for this fixed-camera treatment. The effects correspond to the material
heard, not individual events in the recording. This remains a 2.5D photographic
scene: new camera angles would need new plates and masks.

## Artwork provenance and reproduction

The four photographic assets in `public/scenes/` were made with the built-in imagegen tool,
then converted to WebP at quality 85 with Sharp. Their generated dimensions are
1672×941 (approximately 16:9); responsive cover crops are intentional. There are
no external image services in the product and no microphone/audio-analysis access.

Prompt specifications:

- `rain-fireplace.webp`: photorealistic fixed eye-level evening room, large
  rain-wet dark-wood window on the left looking toward blue-grey woodland, real
  stone fireplace and modest flames on the right, believable glass/materials,
  quiet restrained exposure. No people, text, UI, watermark or fantasy effects.
- `rain-window.webp`: edit the same camera and architecture; extinguish the
  fireplace and embers, remove orange firelight, retain soft cool window light.
- `forest-stream.webp`: photorealistic fixed-camera temperate forest at dawn,
  realistic foliage, moss and ferns, fine mist and a shallow clear stream in the
  lower third; stream remains visible in a central portrait crop. No people,
  animals, buildings, dramatic light rays, text, UI or watermark.
- `ocean.webp`: photorealistic quiet sandy beach at blue hour, small natural
  breaking waves, wet sand, horizon around 45%, slate sky and restrained warm
  dusk light. Central portrait crop includes sky, sea and shore. No people,
  boats, buildings, tropical-ad colors, text, UI or watermark.

New interface copy is provided in all eight site languages; non-Chinese/English
translations should receive native-language review before being treated as final.

## Renderer verification (2026-09-22)

Browser plugin not available; used bundled Playwright Chromium against the local
Astro app. Desktop and mobile interaction checks passed, including idle hiding,
mouse/keyboard/touch wake, lock/unlock and Escape preserving audio. Rendered frame
comparisons checked moving rain/flame/water regions against fixed wall/log/rock
regions. Lifecycle checks cover reduced motion, context loss/restoration, repeated
opening, stale image-load cancellation, framebuffer limits and WebGL fallback.
Headless Chromium uses SwiftShader; this does not certify real-device GPU speed.

## Visual-quality assessment (2026-09-24)

The current stream animation is still visibly artificial. It advects and blends
samples from one static photograph. Its two phases can repeat the same foam and
reflection shapes, while the water mask only approximates irregular rock edges.
Frame differences and stable-rock checks measure motion and boundary stability;
they do not demonstrate convincing fluid motion. The same source-frame limit
affects the flame and droplet effects to a lesser degree.

Produce one stream pilot before further shader tuning. Use a fixed-camera
continuous scene with real temporal water frames, matching the existing calm
framing. A controlled real-water shoot is the first choice; a generated video is
acceptable only if rocks, banks, tree silhouettes, perspective and lighting stay
registered over time. Replace the still plate with the entire approved scene
clip, rather than warping or compositing new water over an unrelated single
frame. Reject the clip if foam reverses, eddies repeat visibly, rocks shimmer,
or the loop has a flash or motion jump at normal playback speed.

Then produce rain and fire from scene-specific motion sources: rain needs
droplets that form, merge and run down the glass while the frame remains fixed;
fire needs flame tongues rising from the logs and corresponding local light
change. A physically based Blender render is useful when the whole matching
scene can be built and rendered. Three.js or WASM do not recover missing
temporal information from a still photograph.

The approved clips should be silent; Howler remains the audio source. Load only
the selected scene after entry, show the current WebP as poster and reduced-motion
fallback, pause when hidden, release media on exit, and offer codec variants only
after checking device decoding support. Evaluate each pilot for natural motion,
loop continuity, asset size, start latency, and dropped frames on a real desktop
and phone before replacing another scene.
