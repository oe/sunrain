import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssessmentTaker from '../AssessmentTaker';
import type { AssessmentType } from '@/types/assessment';

// Light-weight Date stub to reduce object size in snapshots
const now = new Date();

// Mock heavy initialization to avoid real adapter work and memory usage
vi.mock('@/lib/assessment/initializeQuestionBank', () => ({
  initializeQuestionBank: vi.fn(async () => {}),
  isQuestionBankInitialized: vi.fn(() => true)
}));

// Provide minimal question bank adapter mock used indirectly
vi.mock('@/lib/assessment/QuestionBankAdapter', () => ({
  questionBankAdapter: {
    initialize: vi.fn(async () => {}),
    getAssessmentTypes: vi.fn(() => ['phq-9']),
    getAssessmentType: vi.fn(() => mockAssessmentData)
  }
}));

// Mock the assessment engine (lazy loaded inside component) using module factory pattern
vi.mock('@/lib/assessment/AssessmentEngine', () => ({
  assessmentEngine: {
    startAssessment: vi.fn(),
    resumeAssessment: vi.fn(),
    submitAnswer: vi.fn(),
    getCurrentQuestion: vi.fn(),
    getActiveSessions: vi.fn(() => []),
    pauseAssessment: vi.fn()
  }
}));

// Mock the results analyzer
vi.mock('@/lib/assessment/ResultsAnalyzer', () => ({
  resultsAnalyzer: {
    analyzeSession: vi.fn().mockResolvedValue(null),
    getAllResults: vi.fn(() => [])
  }
}));

// Mock the CSR translations hook (kept minimal)
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

// Shared mock data to avoid recreating large objects every test
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
    {
      id: 'phq9-1',
      text: 'Little interest or pleasure in doing things',
      type: 'single_choice',
      required: true,
      options: [
        { id: 'phq9-1-0', text: 'Not at all', value: 0 },
        { id: 'phq9-1-1', text: 'Several days', value: 1 },
        { id: 'phq9-1-2', text: 'More than half the days', value: 2 },
        { id: 'phq9-1-3', text: 'Nearly every day', value: 3 }
      ]
    },
    {
      id: 'phq9-2',
      text: 'Feeling down, depressed, or hopeless',
      type: 'single_choice',
      required: true,
      options: [
        { id: 'phq9-2-0', text: 'Not at all', value: 0 },
        { id: 'phq9-2-1', text: 'Several days', value: 1 },
        { id: 'phq9-2-2', text: 'More than half the days', value: 2 },
        { id: 'phq9-2-3', text: 'Nearly every day', value: 3 }
      ]
    }
  ],
  scoringRules: [
    {
      id: 'phq9-total',
      name: 'PHQ-9 Total Score',
      description: 'Sum of all PHQ-9 item scores',
      calculation: 'sum',
      questionIds: ['phq9-1', 'phq9-2'],
      ranges: [
        { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression symptoms', riskLevel: 'low' },
        { min: 5, max: 9, label: 'Mild', description: 'Mild depression symptoms', riskLevel: 'low' }
      ]
    }
  ],
  translations: {}
};

// Utility to produce fresh session object each test (avoid object mutation leaks)
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

    // Mock window.location minimal object
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        pathname: '/assessment/take/phq-9/',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn()
      },
      writable: true
    });

    // Mock sessionStorage/localStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  it('renders loading state initially', () => {
    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
  });

  it('renders error state when initialization fails', async () => {
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockImplementation(() => {
      throw new Error('Initialization failed');
    });

    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => expect(screen.getByText('Initialization failed')).toBeInTheDocument());
  });

  it('renders assessment questions when loaded', async () => {
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(createMockSession());

    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument();
    });
  });

  it('displays question options', async () => {
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(createMockSession());

    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => {
      ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].forEach(text => {
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });
  });

  it('handles answer selection', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(createMockSession());

    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument());
    const option = screen.getByText('Several days');
    await user.click(option);
    expect(option).toBeInTheDocument();
  });

  it('shows validation error for required question', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(createMockSession());

    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument());
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    await waitFor(() => expect(screen.getByText('This field is required')).toBeInTheDocument());
  });

  it('proceeds to next question on valid answer', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(createMockSession());
    vi.mocked(assessmentEngine.submitAnswer).mockResolvedValue({ success: true, completed: false });

    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument());
    await user.click(screen.getByText('Several days'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(screen.getByText('Question 2')).toBeInTheDocument());
  });

  it('shows completion state when finished', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(createMockSession());
    vi.mocked(assessmentEngine.submitAnswer).mockResolvedValue({ success: true, completed: true });

    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument());
    await user.click(screen.getByText('Several days'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(screen.getByText('Assessment Completed')).toBeInTheDocument());
  });

  it('shows pause modal when pause clicked', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(createMockSession());

    render(<AssessmentTaker assessmentId="phq-9" assessmentData={mockAssessmentData} language="en" />);
    await waitFor(() => expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /pause/i }));
    await waitFor(() => expect(screen.getByText('Pause Assessment')).toBeInTheDocument());
  });
});
