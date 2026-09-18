# Soundscape immersion

The immersive view uses fixed, photorealistic generated artwork with small local
Canvas effects. It is a calm environment rather than an audio spectrum visualizer.

## Interaction

- Actual, non-muted playback and 20 seconds without pointer, keyboard or wheel
  activity permit automatic entry on viewports at least 1024px wide with a fine
  pointer and hover. Hidden tabs and reduced-motion preferences prevent entry.
- The automatic-entry preference is optional localStorage state. Mobile and touch
  devices only enter via the explicit button. No scene is fetched before entry.
- Leaving a scene preserves playback and suppresses automatic entry for that
  listening session. Stopping every track permits automatic entry next time.
- Gentle movement/touch reveals controls; sustained rapid mouse movement over the
  scene leaves it. Controls and the first 1.2 seconds after entry are protected.
- Lock hides other controls and disables movement exits; a visible Unlock button
  remains. Escape always allows leaving the modal (the browser may consume the
  first Escape to leave native fullscreen).
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

The renderer caps pixel density to 1 on small screens and 1.5 on desktop, and draws
at approximately 15fps. It stops rendering in hidden tabs and uses a static frame
for reduced motion. Scene exit disposes animation and resize listeners. Scene
selection prioritizes fireplace, then rain, woodland/stream, ocean, then a neutral
noise backdrop. In portrait orientation, the crop centers the relevant subject.
Multiple tracks form one environment instead of switching scenes per sound.

Effects are intentionally small: glass-bound rain trails, localized flame shimmer
and warm illumination, forest mist, and localized water shimmer. They reflect the
kind of sound; they do not synchronize individual recorded drops or wave crests.
A future Blender workflow can replace the backgrounds or produce short masked
loops without changing these controls. Three.js/WASM are unnecessary for the
current fixed camera and would add downloads and runtime complexity.

## Artwork provenance and reproduction

The four images in `public/scenes/` were made with the built-in imagegen tool,
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
