# Continuous integration

`Validate Sunrain` runs one job, **Build and regression tests**, for each pull
request. Feature-branch pushes do not start a duplicate run. A new commit cancels
the previous run for that PR. Production deployment calls the same workflow on
`main` and publishes only after its validation succeeds. There is no schedule.

## Routine checks

Pull requests and the production deployment install locked dependencies, audit
production dependencies, run all unit tests, check types, build the site once and
verify the source identity. They then run the Chromium smoke suite:

```sh
corepack pnpm test:smoke
```

The current selection is 32 cases: 18 desktop and 14 mobile. It covers home and
check-in routes, scored and general results, missed answers and item-nine support,
youth and declined-age paths, unusually high energy, optional notes and privacy,
self-help, crisis and care access, location selection, keyboard and RTL behavior,
eight-language page paths, and basic audio mixing/stop/return behavior. The four
extra `@ci` safety/privacy cases run on desktop; the existing `@smoke` cases run on
both Chromium projects. Selection is checked by a unit test so a missing critical
path fails instead of silently reducing coverage.

The build identity is checked again after testing. Pages receives the tested `dist`
only after validation succeeds, without rebuilding. PR validation and main
validation use their own exact commit/build; a PR artifact is not reused for
production. The check name remains **Build and regression tests**. Pages artifact
names include the run and attempt so reruns do not collide.

## Manual full regression

In GitHub Actions, open **Validate Sunrain**, choose **Run workflow**, select the
branch containing the final commit and set `browser-suite` to `full`. This runs
all 88 current Chromium cases: 74 desktop and 14 mobile. It includes the complete
locale and privacy checks, no-JavaScript reading, audio lifecycle cases and the
real-time natural-loop signal check. It does not deploy a site. There is no
scheduled full run and it is not an automatic PR or deployment gate.

Run it deliberately when the extra coverage is needed, especially for audio,
screening, privacy or browser-sensitive changes. Locally, use:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm exec playwright install --with-deps chromium
corepack pnpm build
corepack pnpm test:e2e
```

All tests still use one worker. The real-time audio signal check intentionally
waits across an actual loop boundary; it is not a human listening test. The
routine smoke includes basic audio controls but does not cover the full loop.

## Optional compatibility checks

The same manual workflow offers `browser-suite: compatibility` for 39 selected
smoke cases across desktop Firefox, desktop WebKit and mobile WebKit. This is
optional and does not publish to Pages. Locally use `corepack pnpm test:compat`
after installing those browsers. Linux WebKit is not physical Safari or an iPhone;
these checks also do not certify audio playback in Firefox or WebKit.

## Reports and timing

Each run uploads its report, failure evidence and build metadata as
`regression-evidence-<suite>-<commit>-<run>-<attempt>`, retained for 14 days.
The prior full PR run [41012180400](https://github.com/oe/sunrain/actions/runs/41012180400)
took 5m50s, including 4m56s of browser tests. Compare a successful smoke run
against this baseline; actual time varies with the runner and retries.
