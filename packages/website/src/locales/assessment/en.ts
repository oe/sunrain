/**
 * 评测系统英文翻译内容
 */
import type { IAssessmentTranslations } from './types';

export const assessmentEn: IAssessmentTranslations = {
  pageTitle: 'Mental Health Assessment',

  list: {
    title: 'Mental Health Assessment',
    subtitle: 'Understand your mental health status through scientific assessment tools and get personalized recommendations and resources',
    categories: {
      mental_health: 'Mental Health Assessment',
      personality: 'Personality Assessment',
      stress: 'Stress Assessment',
      mood: 'Mood Assessment'
    },
    categoryDescriptions: {
      mental_health: 'Professional mental health screening tools to help identify potential mental health issues',
      personality: 'Understand your personality traits and behavioral patterns',
      stress: 'Assess your stress levels and coping abilities',
      mood: 'Monitor your emotional states and trends'
    },
    startButton: 'Start Assessment',
    minutes: 'minutes',
    questions: 'questions',
    activeSessions: {
      title: 'You have {count} incomplete assessments',
      message: 'Click to continue your assessments',
      continueLink: 'Continue assessments'
    },
    quickActions: {
      title: 'Quick Actions',
      history: {
        title: 'Assessment History',
        description: 'View historical assessment results'
      },
      trends: {
        title: 'Trend Analysis',
        description: 'View mental health trends'
      },
      continue: {
        title: 'Continue Assessment',
        description: 'Complete unfinished assessments'
      }
    },
    disclaimer: {
      title: 'Important Notice',
      message: 'These assessment tools are for screening and self-understanding only and cannot replace professional mental health diagnosis. If you feel distressed or need help, please consult a professional mental health expert.'
    }
  },

  execution: {
    loading: 'Loading assessment...',
    pause: 'Pause',
    save: 'Save Progress',
    next: 'Next',
    previous: 'Previous',
    complete: 'Complete Assessment',
    timeSpent: 'Time spent',
    required: '* Required',
    questionNumber: 'Question',
    totalQuestions: 'questions',
    completion: {
      title: 'Assessment Complete!',
      message: 'Analyzing your results...'
    },
    pauseModal: {
      title: 'Pause Assessment',
      message: 'Your progress has been automatically saved. You can continue the assessment later.',
      continue: 'Continue Assessment',
      exit: 'Exit'
    },
    errors: {
      required: 'Please answer this question before continuing.',
      submitFailed: 'Failed to submit answer, please try again.',
      loadFailed: 'Failed to load assessment, please refresh and try again.'
    }
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
      viewHistory: 'View History'
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
    }
  },

  history: {
    title: 'Assessment History',
    subtitle: 'View your historical assessment records and trend analysis',
    statistics: {
      total: 'Total Assessments',
      completed: 'Completed',
      averageTime: 'Average Time',
      lastAssessment: 'Last Assessment'
    },
    filters: {
      assessmentType: 'Assessment Type',
      timeRange: 'Time Range',
      riskLevel: 'Risk Level',
      allTypes: 'All Types',
      allTimes: 'All Times',
      allLevels: 'All Levels',
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      last3Months: 'Last 3 months',
      lastYear: 'Last year',
      clearFilters: 'Clear Filters'
    },
    list: {
      title: 'Assessment Records',
      viewDetails: 'View Details',
      share: 'Share',
      delete: 'Delete',
      dimensions: 'dimensions',
      today: 'Today',
      daysAgo: 'days ago'
    },
    empty: {
      title: 'No Assessment Records',
      message: "You haven't completed any assessments yet",
      startFirst: 'Start First Assessment'
    },
    pagination: {
      showing: 'Showing',
      to: 'to',
      of: 'of',
      records: 'records',
      previous: 'Previous',
      next: 'Next'
    },
    actions: {
      export: 'Export Data',
      newAssessment: 'New Assessment'
    }
  },

  continue: {
    title: 'Continue Assessment',
    subtitle: 'Complete your unfinished mental health assessments',
    loading: 'Loading incomplete assessments...',
    noSessions: {
      title: 'No Incomplete Assessments',
      message: 'You currently have no assessments to continue',
      startNew: 'Start New Assessment'
    },
    session: {
      startedAt: 'Started at',
      timeSpent: 'Time spent',
      progress: 'Progress',
      answered: 'Answered',
      estimatedRemaining: 'Estimated remaining',
      continueButton: 'Continue Assessment',
      status: {
        active: 'In Progress',
        paused: 'Paused'
      }
    },
    actions: {
      startNew: 'Start New Assessment',
      clearAll: 'Clear All Incomplete Assessments'
    },
    confirmations: {
      deleteSession: 'Are you sure you want to delete this incomplete assessment? All progress will be lost.',
      clearAll: 'Are you sure you want to clear all incomplete assessments? All progress will be lost.'
    }
  },

  trends: {
    title: 'Trend Analysis',
    subtitle: 'Analyze your mental health trends and development patterns',
    loading: 'Loading trend data...',
    timeRange: {
      title: 'Time Range',
      last30Days: 'Last 30 days',
      last3Months: 'Last 3 months',
      lastYear: 'Last year',
      allTime: 'All time'
    },
    charts: {
      overallTrend: 'Overall Trend',
      frequency: 'Assessment Frequency',
      riskTrend: 'Risk Level Changes',
      categoryPerformance: 'Category Performance'
    },
    insights: {
      title: 'Trend Insights',
      positive: 'Positive Trend',
      warning: 'Needs Attention',
      info: 'Stable'
    },
    statistics: {
      improvementTrend: 'Improvement Trend',
      stableDimensions: 'Stable Dimensions',
      attentionNeeded: 'Attention Needed'
    },
    noData: {
      title: 'No Trend Data',
      message: 'You need to complete at least 2 assessments to view trend analysis',
      startAssessment: 'Start Assessment'
    },
    actions: {
      exportReport: 'Export Trend Report',
      newAssessment: 'New Assessment'
    }
  },

  // Client component specific translations
  client: {
    loading: {
      assessment: 'Loading assessment...',
      translations: 'Loading language pack...',
      question: 'Loading question...',
    },
    errors: {
      title: 'Error Occurred',
      sessionStartFailed: 'Unable to start assessment session',
      initializationFailed: 'Initialization failed',
      submitFailed: 'Failed to submit answer, please try again',
      analysiseFailed: 'Failed to analyze results',
      noData: 'Assessment data failed to load',
    },
    actions: {
      retry: 'Retry',
      previous: 'Previous',
      next: 'Next',
      complete: 'Complete Assessment',
      save: 'Save Progress',
      saved: 'Saved',
    },
    progress: {
      text: '{current} / {total}',
    },
    question: {
      number: 'Question {current} of {total}',
      required: '* Required',
    },
  },

  common: {
    title: 'Mental Health Assessment',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    refresh: 'Refresh',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    save: 'Save',
    share: 'Share',
    export: 'Export',
    riskLevels: {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk'
    },
    timeUnits: {
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days'
    }
  }
};

export default assessmentEn;
