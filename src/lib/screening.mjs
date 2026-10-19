// Fail closed: source evidence and a locale-specific review are required.
export function canPublishScreening(tool, locale) {
  const translation = tool?.locales?.[locale];
  return Boolean(tool?.version && tool?.source?.startsWith('https://') && tool?.population === 'adults' &&
    tool?.recallDays === 14 && tool?.rights?.status === 'verified' && tool?.rights?.evidence &&
    tool?.clinicalReview?.status === 'approved' && tool?.clinicalReview?.reviewer &&
    /^\d{4}-\d{2}-\d{2}$/.test(tool?.clinicalReview?.date || '') &&
    translation?.status === 'verified' && translation?.source && translation?.reviewer &&
    translation?.version === tool.version);
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
