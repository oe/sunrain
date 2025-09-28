import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer';
import type { AssessmentSession, AssessmentAnswer } from '@/types/assessment';

vi.mock('@/lib/assessment/QuestionBankAdapter', () => {
  const assessment = {
    id: 'phq-9',
    name: 'PHQ-9 Depression Assessment',
    description: 'Patient Health Questionnaire-9 for depression screening',
    category: 'mental_health',
    duration: 5,
    instructions: 'Instructions',
    disclaimer: 'Screening tool only.',
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: Array.from({ length: 9 }).map((_, idx) => {
      const n = idx + 1;
      return {
        id: `phq9-${n}`,
        text: `Q${n}`,
        type: 'single_choice',
        required: true,
        options: [0,1,2,3].map(v => ({ id: `phq9-${n}-${v}`, text: `Opt${v}`, value: v }))
      };
    }),
    scoringRules: [
      {
        id: 'phq9-total',
        name: 'PHQ-9 Total Score',
        description: 'Sum',
        calculation: 'sum',
        questionIds: Array.from({ length: 9 }).map((_, i) => `phq9-${i+1}`),
        ranges: [
          { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression symptoms', riskLevel: 'low' },
            { min: 5, max: 9, label: 'Mild', description: 'Mild depression symptoms', riskLevel: 'low' },
          { min: 10, max: 14, label: 'Moderate', description: 'Moderate depression symptoms', riskLevel: 'medium' },
          { min: 15, max: 19, label: 'Moderately Severe', description: 'Moderately severe depression symptoms', riskLevel: 'medium' },
          { min: 20, max: 27, label: 'Severe', description: 'Severe depression symptoms', riskLevel: 'high' }
        ]
      }
    ]
  };
  return {
    questionBankAdapter: {
      getAssessmentType: vi.fn((id: string) => id === 'phq-9' ? assessment : undefined),
      getAssessmentTypes: vi.fn(() => [assessment]),
      initialize: vi.fn(async () => true)
    }
  };
});

vi.mock('@/lib/storage/StructuredStorage', () => ({
  structuredStorage: {
    save: vi.fn().mockResolvedValue(true),
    getByType: vi.fn().mockResolvedValue([]),
    deleteByType: vi.fn().mockResolvedValue(0),
    getStorageType: vi.fn(() => 'memory')
  }
}));

describe('ResultsAnalyzer', () => {
  beforeEach(() => vi.clearAllMocks());

  const buildCompletedSession = (answers: number[]): AssessmentSession => {
    const assessmentAnswers: AssessmentAnswer[] = answers.map((value, idx) => ({
      questionId: `phq9-${idx+1}`,
      value,
      answeredAt: new Date()
    }));
    return {
      id: `session_${Math.random().toString(36).slice(2)}`,
      assessmentTypeId: 'phq-9',
      startedAt: new Date(Date.now() - 60_000),
      currentQuestionIndex: 9,
      answers: assessmentAnswers,
      status: 'completed',
      language: 'en',
      timeSpent: 60,
      lastActivityAt: new Date()
    };
  };

  it('returns null for non-completed session', async () => {
    const incomplete = buildCompletedSession(Array(9).fill(1));
    incomplete.status = 'active';
    const result = await resultsAnalyzer.analyzeSession(incomplete);
    expect(result).toBeNull();
  });

  it('calculates total score and risk level (moderate)', async () => {
    const session = buildCompletedSession([2,2,1,1,2,1,1,1,1]); // sum=12
    const result = await resultsAnalyzer.analyzeSession(session);
    expect(result).not.toBeNull();
    const score = result!.scores['phq9-total'];
    expect(score.value).toBe(12);
    expect(score.label).toBe('Moderate');
    expect(result!.riskLevel).toBe('medium');
  });

  it('classifies high risk for severe scores', async () => {
    const session = buildCompletedSession(Array(9).fill(3));
    const result = await resultsAnalyzer.analyzeSession(session);
    expect(result!.scores['phq9-total'].value).toBe(27);
    expect(result!.scores['phq9-total'].label).toBe('Severe');
    expect(result!.riskLevel).toBe('high');
  });

  it('generates deduplicated recommendations array <=8', async () => {
    const session = buildCompletedSession(Array(9).fill(3));
    const result = await resultsAnalyzer.analyzeSession(session);
    expect(Array.isArray(result!.recommendations)).toBe(true);
    const unique = new Set(result!.recommendations);
    expect(unique.size).toBe(result!.recommendations.length);
    expect(result!.recommendations.length).toBeGreaterThan(0);
    expect(result!.recommendations.length).toBeLessThanOrEqual(8);
  });
});
