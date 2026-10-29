# Continuous integration

`Validate Sunrain` runs one job, **Build and regression tests**, for each pull
request. Feature-branch pushes do not start a duplicate run. A new commit cancels
the previous run for that PR. Production deployment calls the same Chromium
validation on `main`; its Pages deployment lock remains non-cancelling.

## Daily checks

The job installs the locked dependencies, audits production dependencies, runs
unit tests, checks types, builds the site once and verifies its source identity.
Playwright tests that production build using Chromium only:

- Desktop runs the complete 59-case regression suite, including all eight
  languages, screening edge cases, privacy, keyboard access, narrow layouts,
  audio controls and the real-time audio loop check.
- Mobile runs nine cases tagged `@smoke`: English and Arabic check-in
  and screening journeys, narrow RTL keyboard controls, 320px layouts across all
  eight languages, sound mixing/return/stop controls, and the multilingual
  topic-reading path, plus grouped-question navigation and support persistence.
  The other desktop cases are not repeated on mobile.

Tests remain serial within the job to avoid contention in the real-time audio
checks. There is no browser matrix, intermediate build archive or report merger.
The default local command, `pnpm test:e2e`, uses the same Chromium scope as CI.

The build identity is checked again after testing. Pages receives this tested
`dist` only after validation passes, without rebuilding. The required check keeps
its existing name. Pages artifact names include the run and attempt so reruns do
not collide, and the reusable workflow returns that name to deployment.

## Optional compatibility checks

Before a release or when changing browser-sensitive code, manually run
**Validate Sunrain**, select the desired branch and choose
`browser-suite: compatibility`. This runs eight support-flow smoke cases on each
of desktop Firefox, desktop WebKit and mobile WebKit (24 cases) in one job. It
installs only Firefox and WebKit and does not publish to Pages.

For a local run:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps firefox webkit
pnpm build
pnpm test:compat
```

These are engine and device-emulation checks. Linux WebKit does not certify
Safari or a physical iPhone. Full business-logic coverage belongs to the daily
Chromium suite; the optional checks target differences in rendering, forms,
navigation and keyboard interaction. Audio signal and lifecycle regressions
remain in Chromium. The optional checks do not certify audio playback in Firefox
or WebKit: headless audio-output availability and the existing Web Audio probe's
buffer-lifecycle assumptions vary between engines.

## Reports

Every run uploads its HTML report, failure traces/screenshots, attachments and
build metadata as `regression-evidence-<suite>-<commit>-<run>-<attempt>`, retained
for 14 days. Inspect this artifact on a failed run, then rerun the single job.

## Timing baseline

The previous PR run [39288950541](https://github.com/oe/sunrain/actions/runs/39288950541)
took 15m51s and repeated the suite across five configurations (248 cases).
The simplified daily suite has 68 cases with no planned skips. Its actual
GitHub Actions runtime is recorded on the PR and varies with runner availability.
