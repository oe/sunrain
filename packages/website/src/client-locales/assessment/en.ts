/**
 * Assessment 系统英文翻译内容 (CSR)
 * 包含实际使用的翻译键，匹配组件中的client前缀结构
 */
import type { IAssessmentTranslations } from './types';

export const assessmentEn: IAssessmentTranslations = {
  assessment: {
    title: 'Mental Health Assessment',
  },

  loading: {
    default: 'Loading...',
    assessment: 'Loading assessment...',
  },

  errors: {
    title: 'Error',
    initializationFailed: 'Initialization failed',
    sessionStartFailed: 'Unable to start assessment session',
    noData: 'Assessment data loading failed',
    validationFailed: 'Validation failed',
    unsupportedQuestionType: 'Unsupported question type: {type}',
    boundary: {
      title: 'Application Error',
      message: 'Sorry, the application encountered an error.',
      details: 'Error Details',
      retry: 'Retry',
      goHome: 'Go Home',
    },
  },

  question: {
    number: 'Question {number}',
    required: 'Required',
    selectedCount: '{count} selected',
    selectedValue: 'Selected: {value}',
    textPlaceholder: 'Please enter your answer...',
    characterCount: '{count} characters',
    textEntered: 'Text entered',
    answered: 'Answered',
  },

  questionList: {
    title: 'Question List',
    progress: 'Progress: {current}/{total}',
    questionNumber: 'Question {number}',
    completed: 'Completed',
    remaining: 'Remaining',
  },

  continue: {
    loading: 'Loading incomplete assessments...',
  },

  list: {
    activeSessions: {
      title: 'You have {count} incomplete assessments',
      continueLink: 'Continue assessments',
      lastActivity: 'Last activity',
      progress: 'Progress',
    },
  },

  progress: {
    text: '{current} of {total}',
  },

  validation: {
    checking: 'Validating...',
  },

  execution: {
    errors: {
      submitFailed: 'Save failed, please try again',
      required: 'This field is required',
    },
    completion: {
      title: 'Assessment Complete',
      message: 'Generating results...',
    },
    pauseModal: {
      title: 'Pause Assessment',
      message: 'Are you sure you want to pause the assessment?',
      continue: 'Continue',
      exit: 'Exit',
    },
    navigation: {
      previous: 'Previous',
      next: 'Next',
      submit: 'Complete Assessment',
      save: 'Save Progress',
      submitting: 'Completing...',
    },
    pause: 'Pause',
    questionNumber: 'Question {number}',
    timeSpent: 'Time spent',
    complete: 'complete',
  },

  results: {
    loading: 'Loading assessment results...',
    completedAt: 'Completed at',
    timeSpent: 'Time spent',
    overallAssessment: 'Overall Assessment',
    detailedInterpretation: 'Detailed Interpretation',
    scoreDistribution: 'Score Distribution',
    riskAssessment: 'Risk Assessment',
    personalizedRecommendations: 'Personalized Recommendations',
    recommendedResources: 'Recommended Resources',
    nextSteps: {
      title: 'Next Steps',
      moreAssessments: {
        title: 'More Assessments',
        description: 'Explore other assessment tools'
      },
      startPractice: {
        title: 'Start Practice',
        description: 'Try related mental health practices'
      },
      browseResources: {
        title: 'Browse Resources',
        description: 'View healing resource library'
      }
    },
    actions: {
      share: 'Share Results',
      savePdf: 'Save as PDF',
      viewHistory: 'View History',
      backToAssessments: 'Back to Assessments'
    },
    riskLevels: {
      high: {
        title: 'Needs Attention',
        message: 'Your assessment results indicate you may need professional help. Consider consulting a mental health expert or calling a mental health helpline.'
      },
      medium: {
        title: 'Recommended Attention',
        message: 'Your assessment results show some areas that need attention. Consider implementing self-care measures or seeking support.'
      },
      low: {
        title: 'Good Status',
        message: 'Your assessment results are within normal range. Continue maintaining healthy habits.'
      }
    },
    disclaimer: {
      title: 'Important Notice',
      message: 'These assessment results are for reference only and cannot replace professional mental health diagnosis. If you feel distressed or need help, please consult a professional mental health expert.'
    },
    quickActions: 'Quick Actions',
    noResultFound: 'Assessment result not found',
    noResultData: 'No assessment data found'
  },

  actions: {
    retry: 'Retry',
    goBack: 'Go Back',
  },
};

export default assessmentEn;
