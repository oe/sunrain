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
      submitFailed: 'Submission failed',
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
      submit: 'Submit',
      save: 'Save',
      submitting: 'Submitting...',
    },
    pause: 'Pause',
    questionNumber: 'Question {number}',
    timeSpent: 'Time spent',
    complete: 'complete',
  },
};

export default assessmentEn;
