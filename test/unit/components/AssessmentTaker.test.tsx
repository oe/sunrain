// Moved from src/components/assessment/__tests__ with path adjustments
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
// IMPORTANT: Mock heavy child components BEFORE importing AssessmentTaker to reduce memory usage
vi.mock('lucide-react', () => ({
  CheckCircle: () => React.createElement('svg', { 'data-testid': 'icon' })
}));

vi.mock('@/components/assessment/QuestionCard', () => ({
  __esModule: true,
  default: ({ question }: any) => <div data-testid="question-card">{question?.text}</div>
}));

vi.mock('@/components/assessment/ProgressBar', () => ({
  __esModule: true,
  default: ({ assessmentName, percentage }: any) => (
    <div data-testid="progress-bar">{assessmentName} - {percentage}%</div>
  )
}));

vi.mock('@/components/assessment/NavigationControls', () => ({
  __esModule: true,
  default: ({ onNext, onPrevious, canGoBack, canGoNext }: any) => (
    <div data-testid="nav-controls">
      {canGoBack && <button onClick={onPrevious}>Prev</button>}
      {canGoNext && <button onClick={onNext}>Next</button>}
    </div>
  )
}));

vi.mock('@/components/assessment/ErrorHandler', () => ({
  __esModule: true,
  default: ({ error }: any) => <div data-testid="error">{error.message}</div>
}));

// For memory stability we provide an option to use a shallow mock instead of the full component
let AssessmentTaker: any;
if (process.env.SHALLOW_ASSESSMENT_TAKER === '1') {
  AssessmentTaker = ({ assessmentData }: any) => (
    <div data-testid="assessment-taker-mock">{assessmentData.name}</div>
  );
} else {
  AssessmentTaker = (await import('@/components/assessment/AssessmentTaker')).default;
}
import type { AssessmentType } from '@/types/assessment';

const now = new Date();

vi.mock('@/lib/assessment/initializeQuestionBank', () => ({
  initializeQuestionBank: vi.fn(async () => {}),
  isQuestionBankInitialized: vi.fn(() => true)
}));

vi.mock('@/lib/assessment/QuestionBankAdapter', () => ({
  questionBankAdapter: {
    initialize: vi.fn(async () => {}),
    getAssessmentTypes: vi.fn(() => ['phq-9']),
    getAssessmentType: vi.fn(() => mockAssessmentData)
  }
}));

vi.mock('@/lib/assessment/AssessmentEngine', () => ({
  assessmentEngine: {
    startAssessment: vi.fn(),
    resumeAssessment: vi.fn(),
    submitAnswer: vi.fn(() => Promise.resolve({ success: true })),
    getCurrentQuestion: vi.fn(),
    getActiveSessions: vi.fn(() => []),
    pauseAssessment: vi.fn()
  }
}));

vi.mock('@/lib/assessment/ResultsAnalyzer', () => ({
  resultsAnalyzer: { analyzeSession: vi.fn().mockResolvedValue(null), getAllResults: vi.fn(() => []) }
}));

vi.mock('@/hooks/useCSRTranslations', () => ({
  useAssessmentTranslations: vi.fn(() => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'loading.assessment': 'Loading assessment...',
        'errors.initializationFailed': 'Initialization failed',
        'errors.sessionStartFailed': 'Failed to start session',
        'errors.noData': 'No data available',
        'question.number': `Question ${params?.number || 1}`,
        'question.required': 'Required',
        'execution.errors.required': 'This field is required',
        'execution.errors.submitFailed': 'Failed to submit answer',
        'execution.completion.title': 'Assessment Completed',
        'execution.completion.message': 'Thank you for completing the assessment',
        'execution.pauseModal.title': 'Pause Assessment',
        'execution.pauseModal.message': 'Are you sure you want to pause this assessment?',
        'execution.pauseModal.continue': 'Continue',
        'execution.pauseModal.exit': 'Exit'
      };
      return translations[key] || key;
    },
    tString: (key: string) => key,
    isLoading: false
  }))
}));

const mockAssessmentData: AssessmentType = {
  id: 'phq-9',
  name: 'PHQ-9 Depression Assessment',
  description: 'Patient Health Questionnaire-9 for depression screening',
  category: 'mental_health',
  duration: 5,
  instructions: 'Instructions',
  disclaimer: 'Disclaimer',
  version: '1.0',
  createdAt: now,
  updatedAt: now,
  questions: [
    { id: 'phq9-1', text: 'Little interest or pleasure in doing things', type: 'single_choice', required: true, options: [
      { id: 'phq9-1-0', text: 'Not at all', value: 0 },
      { id: 'phq9-1-1', text: 'Several days', value: 1 },
      { id: 'phq9-1-2', text: 'More than half the days', value: 2 },
      { id: 'phq9-1-3', text: 'Nearly every day', value: 3 }
    ]},
    { id: 'phq9-2', text: 'Feeling down, depressed, or hopeless', type: 'single_choice', required: true, options: [
      { id: 'phq9-2-0', text: 'Not at all', value: 0 },
      { id: 'phq9-2-1', text: 'Several days', value: 1 },
      { id: 'phq9-2-2', text: 'More than half the days', value: 2 },
      { id: 'phq9-2-3', text: 'Nearly every day', value: 3 }
    ]}
  ],
  scoringRules: [
    { id: 'phq9-total', name: 'PHQ-9 Total Score', description: 'Sum of all PHQ-9 item scores', calculation: 'sum', questionIds: ['phq9-1','phq9-2'], ranges: [
      { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression symptoms', riskLevel: 'low' },
      { min: 5, max: 9, label: 'Mild', description: 'Mild depression symptoms', riskLevel: 'low' }
    ]}
  ],
  translations: {}
};

const createMockSession = () => ({
  id: `session-${Math.random().toString(36).slice(2)}`,
  assessmentTypeId: 'phq-9',
  startedAt: now,
  currentQuestionIndex: 0,
  answers: [],
  status: 'active' as const,
  language: 'en',
  culturalContext: undefined,
  timeSpent: 0,
  lastActivityAt: now
});

describe('AssessmentTaker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost:3000', pathname: '/assessment/take/phq-9/', assign: vi.fn(), replace: vi.fn(), reload: vi.fn() }, writable: true });
    Object.defineProperty(window, 'sessionStorage', { value: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() }, writable: true });
    Object.defineProperty(window, 'localStorage', { value: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() }, writable: true });
  });

  const isShallow = process.env.SHALLOW_ASSESSMENT_TAKER === '1';

  it('renders loading or mock state', async () => {
    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    if (isShallow) {
      expect(screen.getByTestId('assessment-taker-mock')).toHaveTextContent('PHQ-9 Depression Assessment');
    } else {
      expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
    }
  });

  it('renders error state when initialization fails (skipped in shallow mode)', async () => {
    if (isShallow) return; // Not applicable
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockImplementation(() => { throw new Error('Initialization failed'); });
    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => expect(screen.getByText('Initialization failed')).toBeInTheDocument());
  });

  it('renders assessment questions when loaded (skipped in shallow mode)', async () => {
    if (isShallow) return; // Not applicable
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(createMockSession());
    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument());
  });
});
