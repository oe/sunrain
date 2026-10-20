# Continuous integration

`Validate Sunrain` runs for pull requests and manual dispatches. Feature-branch
pushes do not start a second copy of the PR checks. A new commit cancels the
previous run for that PR. The deployment workflow calls the same validation on
the resulting `main` commit; its Pages deployment lock remains non-cancelling.

## Build once, test in parallel

1. `build` installs dependencies, audits them, runs unit tests, checks types,
   builds the site, and verifies the source contracts and clean build identity.
2. It collects the complete Playwright test plan and archives it with `dist`.
   A SHA-256 output identifies the archive. Tar preserves hidden files and modes.
3. Five browser jobs restore that exact archive, verify its checksum and source
   identity, and each run one existing Playwright project. Each job installs only
   its required browser. Tests remain serial within a project to avoid contention
   in the real-time audio checks.
4. `validate` merges the five blob reports into HTML and JSON, and compares every
   result with the complete test plan. Missing projects, duplicate cases, global
   errors and unfinished results fail validation. Intentional skips are preserved.
5. Only after all browser jobs and the report checks pass can the validated `dist`
   be uploaded as a Pages artifact. Deployment uses that artifact without rebuilding.

The final check retains the name **Build and regression tests** for existing branch
protection. It runs even if an upstream job fails, so a skipped matrix cannot make
the required check pass.

## Reports and reruns

- `production-build-<run>-<build-attempt>` contains the immutable build archive and
  full test plan; it is retained for three days.
- `browser-results-<project>-<run>-<build-attempt>` contains a blob report, including
  screenshot and trace attachments. A failed-project rerun replaces only that
  project's report while retaining reports from the successful jobs.
- `regression-evidence-<commit>-<run>-<attempt>` contains the merged HTML report,
  JSON results and build metadata. Reports are retained for 14 days.
- Pages artifacts include the run and attempt in their name, so rerunning the
  workflow does not collide with an earlier upload. The reusable workflow returns
  the actual artifact name to the deployment job.

Use **Re-run failed jobs** for an intermittent infrastructure failure. The build's
outputs identify the existing archive and report group even when the retry has a
new attempt number. If the three-day build archive has expired, rerun all jobs.

When adding a Playwright project, also add its browser to the workflow matrix.
The complete-plan comparison will fail if the matrix omits any planned cases.

## Timing baseline

Before this change, production run [39349293533](https://github.com/oe/sunrain/actions/runs/39349293533)
took 15m30s: browser tests 13m42s, browser installation 54s, typecheck/build 13s,
dependency installation 2s and deployment 7s. All 248 browser cases ran with one
worker. The longest individual project accounted for about 4m06s of test time.
Parallel jobs preserve the same coverage while reducing the workflow's critical
path. Actual runtime depends on runner availability and is measured on the PR.
