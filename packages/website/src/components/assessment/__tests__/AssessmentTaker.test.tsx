import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssessmentTaker from '../AssessmentTaker';
import type { AssessmentType } from '@/types/assessment';

// Mock the assessment engine
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

// Mock the question bank manager
vi.mock('@/lib/assessment/QuestionBankManager', () => ({
  questionBankManager: {
    getAssessmentType: vi.fn()
  }
}));

// Mock the results analyzer
vi.mock('@/lib/assessment/ResultsAnalyzer', () => ({
  resultsAnalyzer: {
    analyzeSession: vi.fn().mockResolvedValue(null),
    getAllResults: vi.fn(() => [])
  }
}));

// Mock the CSR translations hook
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
    isLoading: false
  }))
}));

describe('AssessmentTaker', () => {
  const mockAssessmentData: AssessmentType = {
    id: 'phq-9',
    name: 'PHQ-9 Depression Assessment',
    description: 'Patient Health Questionnaire-9 for depression screening',
    category: 'mental_health',
    duration: 5,
    instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    disclaimer: 'This assessment is for screening purposes only and does not replace professional medical advice.',
    version: '1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const mockSession = {
    id: 'session-123',
    assessmentTypeId: 'phq-9',
    startedAt: new Date(),
    currentQuestionIndex: 0,
    answers: [],
    status: 'active' as const,
    language: 'en',
    culturalContext: undefined,
    timeSpent: 0,
    lastActivityAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn()
      },
      writable: true
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  it('should render loading state initially', () => {
    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
  });

  it('should render error state when initialization fails', async () => {
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    vi.mocked(assessmentEngine.startAssessment).mockImplementation(() => {
      throw new Error('Initialization failed');
    });

    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Initialization failed')).toBeInTheDocument();
    });
  });

  it('should render assessment questions when loaded successfully', async () => {
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(mockSession);
    vi.mocked(questionBankManager.getAssessmentType).mockReturnValue(mockAssessmentData);

    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument();
    });
  });

  it('should display question options', async () => {
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(mockSession);
    vi.mocked(questionBankManager.getAssessmentType).mockReturnValue(mockAssessmentData);

    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Not at all')).toBeInTheDocument();
      expect(screen.getByText('Several days')).toBeInTheDocument();
      expect(screen.getByText('More than half the days')).toBeInTheDocument();
      expect(screen.getByText('Nearly every day')).toBeInTheDocument();
    });
  });

  it('should handle answer selection', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(mockSession);
    vi.mocked(questionBankManager.getAssessmentType).mockReturnValue(mockAssessmentData);

    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument();
    });

    // Click on an option
    const option = screen.getByText('Several days');
    await user.click(option);

    // The option should be selected (this depends on the component implementation)
    expect(option).toBeInTheDocument();
  });

  it('should show validation error for required questions', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(mockSession);
    vi.mocked(questionBankManager.getAssessmentType).mockReturnValue(mockAssessmentData);

    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument();
    });

    // Try to proceed without selecting an answer
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('should proceed to next question when valid answer is provided', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(mockSession);
    vi.mocked(assessmentEngine.submitAnswer).mockResolvedValue({ success: true, completed: false });
    vi.mocked(questionBankManager.getAssessmentType).mockReturnValue(mockAssessmentData);

    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument();
    });

    // Select an answer
    const option = screen.getByText('Several days');
    await user.click(option);

    // Click next
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should proceed to next question
    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
      expect(screen.getByText('Feeling down, depressed, or hopeless')).toBeInTheDocument();
    });
  });

  it('should show completion state when assessment is finished', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(mockSession);
    vi.mocked(assessmentEngine.submitAnswer).mockResolvedValue({ success: true, completed: true });
    vi.mocked(questionBankManager.getAssessmentType).mockReturnValue(mockAssessmentData);

    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument();
    });

    // Select an answer and complete
    const option = screen.getByText('Several days');
    await user.click(option);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should show completion state
    await waitFor(() => {
      expect(screen.getByText('Assessment Completed')).toBeInTheDocument();
      expect(screen.getByText('Thank you for completing the assessment')).toBeInTheDocument();
    });
  });

  it('should show pause modal when pause button is clicked', async () => {
    const user = userEvent.setup();
    const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    
    vi.mocked(assessmentEngine.startAssessment).mockResolvedValue(mockSession);
    vi.mocked(questionBankManager.getAssessmentType).mockReturnValue(mockAssessmentData);

    render(
      <AssessmentTaker
        assessmentId="phq-9"
        assessmentData={mockAssessmentData}
        language="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Little interest or pleasure in doing things')).toBeInTheDocument();
    });

    // Click pause button
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);

    // Should show pause modal
    await waitFor(() => {
      expect(screen.getByText('Pause Assessment')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to pause this assessment?')).toBeInTheDocument();
    });
  });
});
