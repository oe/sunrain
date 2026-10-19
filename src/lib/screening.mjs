// Source-faithful symptom reference, never an automated diagnostic algorithm.
// Independent clinical review is recorded honestly, not inferred from sources.
// The build separately compares the exact form digest before serializing it.
export function canPublishScreening(tool, locale) {
  const translation = tool?.locales?.[locale];
  return Boolean(tool?.mode === 'symptom-reference' && tool?.version && tool?.source?.startsWith('https://') &&
    tool?.population === 'adult-reference-and-adolescent-record' &&
    tool?.recallDays === 14 && tool?.rights?.status === 'verified' && tool?.rights?.evidence &&
    tool?.sourceCheck?.status === 'checked' && /^\d{4}-\d{2}-\d{2}$/.test(tool?.sourceCheck?.date || '') &&
    translation?.status === 'source-checked' && translation?.source?.startsWith('https://') &&
    /^[a-f0-9]{64}$/.test(translation?.sourceSha256 || '') && /^[a-f0-9]{64}$/.test(translation?.formSha256 || '') &&
    translation?.version === tool.version);
}

export const SCREENING_SPECS = {
  'phq-9': { count:9, max:27, bands:[[0,4,0],[5,9,1],[10,14,2],[15,19,3],[20,27,4]] },
  'gad-7': { count:7, max:21, bands:[[0,4,0],[5,9,1],[10,14,2],[15,21,4]] },
};

// Missing and skipped questionnaires remain explicit. Adult bands must not
// leak into adolescent records; no summed score or disease probability exists.
export function makeScreeningReport(id, answers, age, status = 'complete') {
  const spec=SCREENING_SPECS[id];
  if(!spec || !['adult','youth'].includes(age) || !['complete','skipped','notSelected','unavailable'].includes(status)) throw new Error('Invalid screening context');
  if(status !== 'complete') return {id,status,score:null,band:null,max:spec.max,safety:false};
  const score=calculateScore(answers,spec.count);
  const band=age==='adult' ? spec.bands.find(([min,max])=>score>=min&&score<=max)?.[2] : null;
  return {id,status,score,band,max:spec.max,safety:id==='phq-9' && answers[8]>0};
}

export function calculateScore(answers, questionCount = answers?.length, values = [0, 1, 2, 3]) {
  if (!Array.isArray(answers) || !Number.isInteger(questionCount) || questionCount <= 0 ||
      answers.length !== questionCount || Array.from(answers).some(value => !Number.isInteger(value) || !values.includes(value))) {
    throw new Error('Incomplete or invalid answers');
  }
  return answers.reduce((sum, value) => sum + value, 0);
}

export function getInterpretation(score, interpretations) {
  if (!Number.isInteger(score) || score < 0 || !Array.isArray(interpretations)) return null;
  const matching = interpretations.filter(i => Array.isArray(i.range) && score >= i.range[0] && score <= i.range[1]);
  // A missing or overlapping range is a data error, never the highest severity.
  return matching.length === 1 ? matching[0] : null;
}

export function hasSafetySignal(answers, questionIds, triggers) {
  return triggers.some(trigger => {
    const index = questionIds.indexOf(trigger.questionId);
    const value = answers[index];
    return index >= 0 && Number.isInteger(value) && value >= trigger.minValue;
  });
}
