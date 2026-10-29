# Understanding guides

The first edition adds four educational themes in all eight supported locales:
low mood/depression, anxiety/worry/panic, sleep difficulties, and mood/energy/bipolar
disorder. Each guide separates possible experiences, small everyday actions,
professional treatment explanations, help-seeking and its original references.
The next themes in the content map are OCD, trauma-related difficulties, attention
and ADHD, eating difficulties, stress and grief. They are not published as empty
cards or presented as assessed by the existing questionnaires.

## Evidence and editorial scope

`src/lib/understand.ts` is the reference registry. Each topic ends with its own
named official sources, links, source language and check date. The source pages
were checked on 2026-10-29. English is the editorial reference copy; the other
seven locales convey the same facts and boundaries. These are independently
written summaries, not copied instruments, official translations, institutional
endorsements or validated treatment programmes. Independent clinical and
native-language review is pending and is stated on every guide.

| Topic | Source basis and claims |
| --- | --- |
| Depression | NIMH Depression: symptoms, duration, overlap, self-care and help-seeking. NICE NG222: adult treatment choices, CBT, behavioural activation and guided self-help with trained support. NIMH Teen Depression: youth-specific support and treatment context. |
| Anxiety/panic | NICE CG113: adult GAD/panic care and structured self-help. NHS Panic disorder: panic symptoms and the distinction between an attack and a disorder. NHS Chest pain: urgent medical assessment rather than assuming panic. NHS Tackling your worries: separating actionable worries and choosing a manageable step. |
| Sleep | NHS Insomnia: symptoms, three-month long-term definition, ordinary sleep care, causes and CBT. NIMH Bipolar Disorder: reduced need for sleep with unusual energy calls for assessment rather than an insomnia-only interpretation. |
| Bipolar | NIMH Bipolar Disorder and NICE CG185: episodic changes, professional assessment, ongoing medication/psychological care and adjunctive everyday support. No simple cycle graphic or screening score is used to label bipolar disorder. |

Adult guideline recommendations are not applied directly to children. The youth
note keeps reading and support accessible without an age gate and points to safe,
trusted support. Medicines are introduced as options to discuss with clinicians;
there are no drug selections, doses, tapering instructions, DIY exposure protocols
or sleep-restriction prescriptions. Symptoms can overlap and cannot establish or
exclude a diagnosis here. The existing questionnaire forms and scoring are separate.

## Reading and illustration contract

The four native-generated WebP illustrations are wordless, decorative editorial
art, not medical diagrams or recovery forecasts. They have empty alt attributes;
all essential information is ordinary, translated HTML. Three short symptom
cards and an ordered set of small steps offer visual structure without invented
statistics, curves, disease probabilities or a promised recovery timeline.

The pages reuse the site's paper/blue palette and existing self-help and help
routes. Source and treatment details remain readable without JavaScript. Index,
header/footer, self-help/resources and questionnaire results link into the guide
collection. PHQ-9 links to depression, GAD-7 to anxiety and broad-distress K6 to the
collection, preserving the difference in what each questionnaire describes.
Links from private results explicitly open a separate tab, so reading does not
discard the current unsaved answers or transfer them to the article.

Reading topics sends no third-party analytics request and carries no answers in
URLs. Educational pages remain indexable. No new answer collection, account,
storage or cross-page transfer is introduced.

## Verification

The build checks all 40 canonical localized education pages, including local
links, languages, RTL, no telemetry, references and static content. Unit checks
reject missing/empty/untranslated health-copy fields. Browser checks exercise
all-language reading-to-support navigation, complete no-JavaScript guides, narrow
RTL references, artwork loading and translated desktop navigation. Optional engine
checks include the portable guide-reading smoke path. Reports contain only
synthetic test content.
