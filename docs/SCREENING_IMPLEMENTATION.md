# Symptom screening and support

Implementation date: 2026-10-19. This describes the proposed source implementation, not a claim that it is deployed. Check the public `/build-metadata.json` for the deployed commit.

## Product contract

“I'm not feeling okay” primarily offers source-backed initial symptom screening, explanations, optional coping activities and preparation for professional help. General reflection remains a separate option. Sunrain does not identify every condition, produce a diagnosis or disease probability, prescribe treatment, or establish that a low-scoring person is safe. Depression and anxiety results stay separate; other conditions remain unassessed.

The reference edition uses PHQ-9 in all eight interface languages and GAD-7 in seven. Japanese additionally offers the author-hosted K6 translation, measuring broad psychological distress over 30 days, not anxiety alone. Japanese GAD-7 remains unavailable: the Japanese Society of Anxiety and Related Disorders' 2025 form explicitly prohibits unauthorized reproduction and electronic use. The source link remains readable; no questions, substitute machine translation or scoring for that version are shipped.

## Source admission and editorial limits

`src/data/screening-forms.json` replaces the old, unverified YAML translations in the runtime flow. The YAML candidates remain unused history. Each admitted form has its exact public source URL, regional language variant, downloaded PDF SHA-256 and transcribed form SHA-256 in `src/data/screening-registry.json`. The build refuses changed content, unverified rights, missing locale records or mismatched versions. There is no locale fallback. Regional source labels describe the translation, not the user's location or worldwide validation.

The original [PHQ Screeners download page](https://www.phqscreeners.com/select-screener) permits reproducing, translating, displaying and distributing its forms and translations. Its [terms](https://www.phqscreeners.com/terms) require clinical judgment for a definitive diagnosis. The original scoring manual, downloaded and read, is separately pinned in the registry. A general permission statement is not extended to a separately restricted translation.

Source comparison was performed by AI, including visual transcription of Hindi and Arabic PDFs whose text extraction loses characters. Paper checkmark/circle instructions are replaced by radio controls; wrapping spaces, typographic compatibility characters and font encoding are normalized. Scored item order, wording, recall period, answer order and values remain those of the specified source. The PHQ functional-impact question is displayed separately and never added to the score. This is not independent clinical or native-speaker approval; review metadata remains `pending` and that limitation is visible before and after answering.

The owner's stated scope is a nonprofessional, source-backed support site without hiring clinicians in each country. This edition therefore admits **symptom-reference** tools after source/permission/content/technical checks, with their limitations visible. This intentionally replaces the former blanket closed-scoring policy. It does not mark professional review complete or open diagnostic algorithms, treatment selection, bipolar quizzes, suicide prediction or custom cutoffs. Features with those claims remain outside this release.

## Age and interpretation

The entrance, general reflection, activities and help preparation have no adult-only gate. An optional broad age choice establishes how these particular forms can be presented; no date of birth is collected. Declining the question or being under 13 leaves general and youth support available. The age choice stays in memory.

- Ages 18+: report standard adult symptom-reference bands from the original manual: PHQ-9 0–4/5–9/10–14/15–19/20–27; GAD-7 0–4/5–9/10–14/15–21. These are symptom bands, not diagnoses, disease probabilities or suicide-risk grades. Their suitability varies by population and language.
- Ages 13–17: offer a symptom record and raw totals for discussion, **without adult severity bands or threshold-based next-step selection**. Youth professional interpretation is encouraged. This is not presented as validated youth clinical screening in all eight translations.
- Under 13 or age suitability unknown: do not score these forms; offer general support and youth help immediately. The whole site remains accessible.

Adolescent research exists for the English PHQ-9 (Richardson et al., [PubMed 21041282](https://pubmed.ncbi.nlm.nih.gov/21041282/), ages 13–17) and GAD-7 (Mossman et al., [PubMed 29069107](https://pubmed.ncbi.nlm.nih.gov/29069107/), diagnosed patients aged 12–17). Indexed abstracts were checked; full PMC pages returned a browser challenge during this investigation. Those studies do not verify our released language versions or establish general-population diagnostic thresholds. We do not import their diagnostic cutoffs into this implementation.

## Answer handling, safety and next steps

Every scored item must have one integer answer from 0–3 for PHQ-9/GAD-7, or 0–4 for K6. Blank, sparse, corrupt or partial answers never become zero or a score. Users can skip a whole questionnaire; skipped, unselected and unavailable tools have explicit unassessed states. Revisiting answers recalculates current results; no combined score is produced.

Any nonzero PHQ-9 item 9 answer immediately shows support, before completion. That notice also appears at the result even if the user skips the questionnaire after answering that item. It is a support rule, not a determination of present danger; no low-risk or “now safe” output exists. Crisis help is always available without completing a form.

The PHQ impact item and optional context choices are separate from scoring. Marked functional difficulty gets an additional care invitation independent of the total, including when the user skips the scored questionnaire. The volunteered impact answer remains in the complete response export. Unusually elevated energy/reduced need for sleep or difficulty meeting basic needs puts professional support before activity recommendations. It does not identify bipolar disorder. Existing care plans should continue.

Depression-related responses connect to a manageable step; anxiety-related responses connect to organising a worry. Completed K6 responses connect nervous/restless items to worry support and the other distress items to a manageable step, without assigning a disease. Both may appear together. These are optional general coping activities, not treatments prescribed by a score. Each can run inside check-in and lead to the existing editable care note, service finder, stop/feedback paths and explicit save/download/delete controls. Self-help is never a prerequisite to care.

All answers and results remain in one document. No answer, age, score, symptom branch or free text enters a URL, title, network request, analytics, console or automatic browser storage. A complete response record, with timestamp, language, version, original sources and unassessed states, is available for explicit local text download. Results, source version and source links can also be carried into the editable care note; manual edits survive questionnaire revisions. Refresh, navigation, language changes and restored browser history clear unsaved responses. Saved notes and downloads remain user-initiated, with the existing shared-device warning and deletion controls.

## Verification

Required automated checks cover source admission/digests, boundary values, partial/skipped forms, adult/youth separation, simultaneous results, item-9 support with a low total or skipped form, revising answers, care-note preservation, unsupported-language handling, keyboard access, no-JavaScript support, RTL/narrow layouts, and no sensitive network/storage/URL changes. A passing software suite does not establish clinical validity or prove that the activities treat a condition. Test outcomes belong in the PR/CI evidence, not inferred from this checklist.

## Japanese K6 source edition (2026-10-19)

The current [author page](https://rckessler.scholars.harvard.edu/k10-and-k6-scales) explicitly grants free use without formal approval and unrestricted use of the posted translations, requiring copyright acknowledgement and citation of Kessler et al. (2003). The older 2007 Japanese K6+ PDF has a permission-request footer; we rely on that author's current explicit grant, not on declaring the translation public domain. The Japanese acknowledgement credits Furukawa, Kawakami and Kim. Copyright and the requested citation appear in source details and the complete response export.

Only the six scored items on page 1 are used. The five answer labels and their highest-to-lowest frequency order stay intact: いつも / たいてい / ときどき / 少しだけ / 全くない. Printed source codes 1–5 are recoded to 4/3/2/1/0 under the author's scoring instructions, giving 0–24. Paper circling instructions become radio selection; the product title identifies K6 rather than the full K6+ supplement. Names, addresses, DOB, research identifiers and optional supplemental questions on pages 1–2 are not requested. The author page states these supplements are unnecessary to score K6.

The registry pins both the source PDF and official scoring PDF. Exact source items were compared with extracted text and the rendered first page. This is an AI source check, not an independent linguistic or clinical review. Furukawa et al. (2008), DOI 10.1002/mpr.257, reports Japanese validation in 2,436 participants; its indexed/publisher abstract was read, not the paywalled full study. That study is not clinical-outcome evidence for Sunrain and does not establish youth suitability.

K6 displays a separate raw-score record and explains that higher scores reflect more frequent reported distress. It uses no adult severity bands, diagnostic cutoffs, probabilities or threshold-selected treatment. The official scoring FAQ warns that the often-used 13+ threshold depends on the calibration population; we do not silently reuse it or PHQ/GAD bands. Youth receives the same raw-record boundary and the existing explicit youth limitation. Zero, missing, skipped and unselected remain distinct. A positive completed response offers optional coping matched to the reported items and an invitation to seek professional support when distress persists, is strong or affects daily life, regardless of score.

PHQ-9's two-week recall and K6's 30-day recall appear on choices, questions, results, care preparation and exported records. The mixed-window record is never labelled entirely as two weeks, and totals are not added or compared. The Japanese GAD-7 bookmark remains honest about that specific restricted form and directs visitors to PHQ-9/K6 and support. Other languages do not silently receive a Japanese or newly translated K6.

Questionnaire recall periods belong to the source-labelled result/care summary. The care field “When it started” is left for the person to fill in; neither a two-week PHQ/GAD window nor a 30-day K6 window establishes symptom onset. Manual onset text survives questionnaire revision.
