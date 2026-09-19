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

The renderer caps pixel density to 1 on small screens and 1.5 on desktop, and draws
at approximately 20fps. It stops rendering in hidden tabs and uses a static frame
for reduced motion. Scene exit disposes animation and resize listeners. Scene
selection prioritizes fireplace, then rain, woodland/stream, ocean, then a neutral
noise backdrop. In portrait orientation, the crop centers the relevant subject.
Multiple tracks form one environment instead of switching scenes per sound.

Effects are intentionally small and material-specific. Rain droplets pause, gather,
refract the view, then slide with non-linear timing. The fireplace alternates two
locally masked flame states with a feathered boundary and restrained warm-light
variation. Forest mist changes optically without deforming scene geometry. The ocean uses a
second, locally masked wave state with feathered horizontal boundaries. They reflect the kind of sound; they do not synchronize individual
recorded drops or wave crests. A future Blender workflow can replace these local
states with short masked loops without changing the controls. Three.js/WASM remain
unnecessary for the current fixed camera.

## Artwork provenance and reproduction

The six visual assets in `public/scenes/` were made with the built-in imagegen tool,
then converted to WebP at quality 85 with Sharp. Their generated dimensions are
1672×941 (approximately 16:9); responsive cover crops are intentional. There are
no external image services in the product and no microphone/audio-analysis access.

Prompt specifications:

- `rain-fireplace.webp`: photorealistic fixed eye-level evening room, large
  rain-wet dark-wood window on the left looking toward blue-grey woodland, real
  stone fireplace and modest flames on the right, believable glass/materials,
  quiet restrained exposure. No people, text, UI, watermark or fantasy effects.
- `rain-fireplace-flame-b.png`: alternate frame generated from the fireplace plate;
  only the inner flames and ember intensity change. The runtime uses its small,
  feathered local crop, so generated lighting drift outside the firebox is absent.
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
- `ocean-wave-b.webp`: alternate frame derived from the ocean plate; only the
  lower water band advances a calm breaking wave. Its alpha feather keeps the
  horizon, sky, camera, and shoreline stable during the local transition.

New interface copy is provided in all eight site languages; non-Chinese/English
translations should receive native-language review before being treated as final.
