# Releasing Sunrain

Sunrain is a static education and self-care site. A passing software build does not establish clinical validity. Keep the medical screening routes closed while the instrument/locale review is incomplete.

## Current release decision

The 2026-10-19 release is a general mental-health education, self-care and help-navigation website. It is not a professional mental-health service, diagnostic tool or treatment programme. The project owner authorised publication within this scope; hiring clinicians in every supported country is not a prerequisite for this edition.

Release requirements are traceable references and rights, complete eight-language support paths and scope/privacy statements, honest unreviewed-content status, working stop/help paths, closed medical scoring, and passing software checks. AI source and language-consistency checks do not become clinical or native-speaker approval. Independent expert review, real-user research and physical-device testing remain useful future work; their absence is recorded rather than presented as completed or used to indefinitely hold this general-support edition.

## Supported scope

- Eight interface languages, including Arabic RTL, with no English fallback in the support content pack.
- A non-diagnostic check-in on one URL, with visible progress and real skip controls. Results show one optional activity first; all selected concerns remain in the editable summary. This is a usability choice, not a clinical ranking of concerns.
- General support has no 18+ confirmation or age collection. All eight locales welcome younger visitors, explain the reference-only scope and encourage early professional help or support from a safe trusted adult/youth service. Parent permission is not a site-access prerequisite; medical-service consent and eligibility depend on the actual provider. NHS youth guidance is available alongside the explicitly adult England talking-therapies entry, including without JavaScript. This does not claim clinical validation for children or enable adult screening for them.
- Four general activities: grounding, a manageable step, a sleep routine and organising a worry. Each has optional everyday examples, four guided steps, an editable small plan, stopping, feedback and onward support. Sensory steps can be skipped, with this option explained before starting. These are not validated treatment programmes. Without JavaScript, every instruction remains readable.
- The recommended activity and help preparation can run inside the check-in page. Original answers, the small plan and feedback remain available when the user explicitly chooses to prepare contact. Direct activity pages also offer preparation on the same page. No cross-page storage or URL carries health information. Refresh, language changes, navigation away and return from browser history clear unsaved content.
- Editable contact text includes all nonempty preparation fields, with no unresolved sentence placeholders. Plans are labelled as considered support rather than completed treatment. A too-long activity record is explicitly announced; the complete plan remains in the page and can be downloaded separately. Copy, explicit device save/load/delete and local text download are available. Copy denial leaves the message and download available. An external link never sends the note.
- Official routine-care entry points for England, the US, Japan, South Korea, Spain and Hong Kong, plus one hospital's own booking instructions in Beijing. The Beijing entry is explicitly a single provider, not China-wide coverage. `src/data/support-services.json` is the runtime catalog; its entry-page checks are recorded in `docs/content/support-resources.json`. Other regions receive an explicit coverage-gap message and local primary-care guidance. Country is never inferred from language. External appointment booking, acceptance, waiting time and service-language availability are not verified by this site.
- Crisis support links to the maintained Find A Helpline directory. It is not emergency dispatch; immediate danger must go directly to local emergency services. If the directory is unavailable, the emergency path remains explicit and does not redirect to routine booking. The previous unverified phone/SMS list is retained only as source history, not rendered.

## Clinical and language gates

`src/data/support-copy.json` is the runtime content source; its review metadata is intentionally honest. Independent clinical and native-language review is pending. Original source references do not mean the source organisation approved Sunrain's wording or translations. The separate sourceConsistency/languageConsistency fields record an AI editorial check of source scope and high-consequence meaning across the eight locales; they do not change the independent professional or native-language review fields.

`src/data/screening-registry.json` records the two candidate tools. Their exact forms, translation validation, rights evidence and qualified reviewer records are incomplete. Existing assessment bookmarks show an unavailable state, sources and working support links; questionnaire text is not serialized to the browser. Changing registry strings alone does not enable a screener. Opening a screening tool requires a reviewed implementation PR with the exact instrument/version/locale, strict completeness and scoring checks, independent safety responses and accessible interaction tests. Never add a bipolar diagnosis quiz or suicide prediction/risk grading.

Before adding medical screening, clinical interpretation or treatment-oriented features, obtain the appropriate qualified review of the exact tools, released language versions and safety responses. Automated checks or a disclaimer cannot establish clinical validity. Record reviewer identity, qualifications, scope and date without inventing approvals. This is a separate feature gate, not a requirement to hire experts in every country before publishing general educational support.

After the general-support release, repository maintainers continue to check source changes and broken service links, correct wording and translations, and act on usability feedback. Gradually extend regional coverage only with traceable entry points and clear limits. Real-user research and device testing can improve confidence, but must not be described as clinical-outcome evidence.

## Reproducible validation

Use Node 24 (minimum 22.22) and the declared pnpm version through Corepack:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm audit --audit-level=high
corepack pnpm test:unit
corepack pnpm build
corepack pnpm verify:sunrain
corepack pnpm exec playwright install --with-deps chromium firefox webkit
corepack pnpm test:e2e
```

The build validates all eight locales, local links, private-page telemetry exclusions and closed assessment routes. End-to-end configuration covers desktop/mobile Chromium, desktop Firefox, desktop WebKit and an iPhone-sized WebKit viewport. All eight support flows, keyboard operation, storage/clipboard denial, long-note preservation and no-JavaScript reading are exercised. Audio-specific regressions remain in the Chromium projects; other engines run the support suite. Consult the final CI run for passing results, rather than treating a configured project as tested. The build fingerprint must match the checked-out source; do not edit files while building or testing. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an existing Chromium binary locally. Linux WebKit is not macOS/iOS Safari or a physical iPhone. Those systems, real screen locks, external appointments and clinical outcomes need separate verification.

Astro 7 and Tailwind 4 replace the older vulnerable build stack. Locale templates are generated by `scripts/localized-routes.mjs` using the filesystem, without a glob-parser dependency. The ignored template copies are removed after a build. No Google Fonts request is made. Health reflection pages do not include Cloudflare analytics; home/about retain the existing page analytics. Hosting/CDN infrastructure can still process requests. No answers, notes or scores belong in a URL, telemetry event, title, console output or bug report.

Volume edits during audio fades must preserve both the live gain and Howler's stored playback volume for the next loop. Master, track and preset edits use the same fade-cancellation workaround. The Chromium regression deliberately stretches the real startup fade, then changes master and track controls; waiting for the fade to finish would miss this failure.

## Deploy, inspect and roll back

1. Confirm the PR stays within the general-support scope above and run the full validation workflow on the final commit. A general-support PR may be marked ready and merged while independent clinical/native review remains honestly uncompleted. Keep a proposed medical-screening feature closed until its separate gates are met.
2. On an approved merge to `main`, the existing GitHub Pages workflow deploys the exact artifact produced by its validation job. Do not deploy a separate local rebuild.
3. Check the public `/build-metadata.json` commit against the deployed commit. Smoke-test home → check-in → one activity → support, the crisis directory and language switching on the real domain. Confirm the privacy page can delete current and legacy browser records. Do not enter real health information into release tests.
4. Monitor failed deploys, broken internal routes and external service links. Recheck sources and service entry points when their providers change; record a real check date. Do not claim a provider is available or an appointment is booked from a click count.
5. To roll back, revert the release commit through a reviewed PR and let the same validated deployment workflow run. Saved notes are versioned; a rollback does not delete a user's downloads or device data. Keep the privacy deletion path available.
