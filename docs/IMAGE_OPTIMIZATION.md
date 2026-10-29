# Image delivery

The 2026-10-29 pass reduces the images shipped in `public` from 2,709,925 to
1,386,281 bytes (48.8%), including responsive variants and format fallbacks.
Removing three unreferenced scene stills accounts for 808,062 bytes of that
change. Those files were not requested by current pages, so their removal is
not counted as a page-load saving. High-resolution transparent brand PNGs remain available;
they are not loaded by the header or footer.

## Delivery and quality

- The four guide illustrations use 540/800/1000-pixel AVIF sources (quality 60)
  and 540/1000-pixel WebP fallbacks (quality 82, method 6). They were exported
  from the original 1536×1024 generated PNGs, without regenerating the artwork.
  `UnderstandingIllustration.astro` shares their markup, with `sizes` matched to
  each layout. Cards remain lazy loaded; article hero art has high priority.
- The homepage keeps its existing 800/1200/1600-pixel widths, adds AVIF
  (quality 55), and retains WebP (quality 82). Existing intrinsic dimensions,
  placement and crop are preserved.
- The three video posters use full-resolution 1600×900 WebP (quality 84).
  `build-scene-loops.py` exports the same format for future rebuilds and the
  scene audit checks it. Rain retains its 1672×941 resolution in WebP quality 82.
  Videos and audio are unchanged.
- Header/footer use a shared 160-pixel logo export, enough for their largest
  40 CSS-pixel display at 4× density. PNG fallback, a 128-pixel favicon, and a
  1200-pixel progressive JPEG share card are retained. Changed brand exports
  have one shared version in `src/lib/branding.ts`.
  The approved aligned logo was extracted from its paper background using
  traditional pixel processing, as explicitly approved in the conversation.
  Original opaque interior pixels are unchanged in the transparent master;
  only the outline is unmatted. The droplet is a transparent cutout. Download
  PNGs use a 256-color palette with alpha. Source and export hashes, crop and
  settings are recorded in `docs/content/brand-exports.json`. The share card
  retains its intentional cloud background and existing text.

Compression was checked with side-by-side images, rendered desktop/mobile
screenshots and luminance SSIM. At the comparison sizes, scores were 0.958–0.986
for guide art, 0.979 for the full-resolution homepage background, and 0.976–0.989
for full-resolution scene images. These are similarity checks, not proof of
pixel-identical output. Essential guide information remains translated HTML;
the decorative illustrations contain no instructional text.

## Measured transfer

Cold Chromium contexts against the production build, after initial network
idle, including the shared header/footer logo. Desktop is 1440 pixels at 1×;
mobile is 390 pixels at 2×. Values are decimal KB of image response bodies,
not page weight or a promised loading time. AVIF was selected in these runs.

| Page | Desktop before → after | Mobile before → after |
| --- | --- | --- |
| Home | 83.4 → 37.4 KB | 27.1 → 13.5 KB |
| Guide collection | 193.4 → 46.6 KB | 193.4 → 89.3 KB |
| Depression guide | 68.4 → 19.4 KB | 68.4 → 35.2 KB |

The browser can fetch lazy images near the viewport before they are visible;
the collection measurements include all four illustrations. Other densities,
browser format support, cache state and viewport sizes change the selected file.
The four active scene stills together fall from 838,819 to 536,318 bytes (36.1%).

The connected Browser plugin had no callable browser-control tools in this
session, so verification used the repository's Playwright installation. Checks
covered widths 320/390/760/768/1440, 1×/2× density, image decoding and horizontal
overflow. A separate run removed AVIF sources from served HTML to exercise
WebP/PNG selection and decoding. Build verification checks every local image
and `srcset` candidate across the 144 localized support pages.

## Updating artwork

Export each size once from the original master, rather than recompressing a
previous delivery file repeatedly. Preserve the largest existing delivery
dimensions, wordless art, HTML dimensions, fallback format and aspect ratio.
If originals are unavailable, use the largest existing export and inspect the
result before replacing it. Keep generation masters outside `public` unless
they are intentionally downloadable. Update this measurement when assets or
layout sizing change; do not add browser jobs just to compare file sizes.
