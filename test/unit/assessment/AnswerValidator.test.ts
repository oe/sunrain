import { describe, it, expect } from 'vitest';
import { RequiredFieldRule, SingleChoiceRule, MultipleChoiceRule } from '@/lib/assessment/AnswerValidator';
import type { Question } from '@/types/assessment';

const singleChoiceQuestion: Question = {
  id: 'q1',
  text: 'A single choice question',
  type: 'single_choice',
  required: true,
  options: [
    { id: 'q1-0', text: 'Zero', value: 0 },
    { id: 'q1-1', text: 'One', value: 1 }
  ]
};

const multiChoiceQuestion: Question = {
  id: 'q2',
  text: 'A multiple choice question',
  type: 'multiple_choice',
  required: true,
  minSelections: 1,
  maxSelections: 2,
  options: [
    { id: 'q2-0', text: 'A', value: 0 },
    { id: 'q2-1', text: 'B', value: 1 },
    { id: 'q2-2', text: 'C', value: 2 }
  ]
};

describe('AnswerValidator rules', () => {
  const requiredRule = new RequiredFieldRule();
  const singleRule = new SingleChoiceRule();
  const multiRule = new MultipleChoiceRule();

  it('RequiredFieldRule should flag empty value', () => {
    const err = requiredRule.validate('', singleChoiceQuestion);
    expect(err).not.toBeNull();
    expect(err!.code).toBe('FIELD_REQUIRED');
  });

  it('SingleChoiceRule should accept option id and value forms', () => {
    const idErr = singleRule.validate('q1-0', singleChoiceQuestion);
    expect(idErr).toBeNull();
    const valueErr = singleRule.validate(1, singleChoiceQuestion);
    expect(valueErr).toBeNull();
  });

  it('SingleChoiceRule should reject invalid option', () => {
    const err = singleRule.validate('invalid', singleChoiceQuestion);
    expect(err).not.toBeNull();
    expect(err!.code).toBe('SINGLE_CHOICE_INVALID_OPTION');
  });

  it('MultipleChoiceRule should validate selection count and options', () => {
    const valid = multiRule.validate(['q2-0', 'q2-1'], multiChoiceQuestion);
    expect(valid).toBeNull();
    const tooFew = multiRule.validate([], multiChoiceQuestion);
    expect(tooFew).not.toBeNull();
    expect(tooFew!.code).toBe('MULTIPLE_CHOICE_MIN_SELECTIONS');
    const invalid = multiRule.validate(['q2-0', 'bogus'], multiChoiceQuestion);
    expect(invalid).not.toBeNull();
    expect(invalid!.code).toBe('MULTIPLE_CHOICE_INVALID_OPTIONS');
  });
});
