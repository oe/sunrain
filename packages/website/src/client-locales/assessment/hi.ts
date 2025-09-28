/**
 * Assessment 系统英文翻译内容 (CSR)
 * 包含实际使用的翻译键，匹配组件中的client前缀结构
 */
import type { IAssessmentTranslations } from "./types";

export const assessmentEn: IAssessmentTranslations = {
  assessment: {
    title: "Mental Health Assessment",
  },

  loading: {
    default: "Loading...",
    assessment: "Loading assessment...",
  },

  errors: {
    title: "Error",
    initializationFailed: "Initialization failed",
    sessionStartFailed: "Unable to start assessment session",
    noData: "Assessment data loading failed",
    validationFailed: "Validation failed",
    unsupportedQuestionType: "Unsupported question type: {type}",
    cannotContinue: "Cannot continue session",
    continueFailed: "Failed to continue session",
    deleteFailed: "Failed to delete session",
    clearFailed: "Failed to clear sessions",
    loadFailed: "Loading Failed",
    loadFailedMessage: "Unable to load assessment data. Please try again.",
    boundary: {
      title: "Application Error",
      message: "Sorry, the application encountered an error.",
      details: "Error Details",
      retry: "Retry",
      goHome: "Go Home",
    },
  },

  question: {
    number: "Question {number}",
    required: "Required",
    selectedCount: "{count} selected",
    selectedValue: "Selected: {value}",
    textPlaceholder: "Please enter your answer...",
    characterCount: "{count} characters",
    textEntered: "Text entered",
    answered: "Answered",
  },

  questionList: {
    title: "Question List",
    progress: "Progress: {current}/{total}",
    questionNumber: "Question {number}",
    completed: "Completed",
    remaining: "Remaining",
  },

  continue: {
    title: "मूल्यांकन जारी रखें",
    subtitle: "अपने अधूरे मानसिक स्वास्थ्य मूल्यांकन को पूरा करें",
    loading: "Loading incomplete assessments...",
  },

  list: {
    activeSessions: {
      title: "You have {count} incomplete assessments",
      continueLink: "Continue assessments",
      lastActivity: "Last activity",
      progress: "Progress",
    },
  },

  progress: {
    text: "{current} of {total}",
  },

  validation: {
    checking: "Validating...",
    withWarnings: "with warnings",
  },

  execution: {
    errors: {
      submitFailed: "Save failed, please try again",
      required: "This field is required",
    },
    completion: {
      title: "Assessment Complete",
      message: "Generating results...",
    },
    pauseModal: {
      title: "Pause Assessment",
      message: "Are you sure you want to pause the assessment?",
      continue: "Continue",
      exit: "Exit",
    },
    navigation: {
      previous: "Previous",
      next: "Next",
      submit: "Complete Assessment",
      save: "Save Progress",
      submitting: "Completing...",
    },
    pause: "Pause",
    questionNumber: "Question {number}",
    timeSpent: "Time spent",
    complete: "complete",
  },

  results: {
    loading: "Loading assessment results...",
    completedAt: "Completed at",
    timeSpent: "Time spent",
    overallAssessment: "Overall Assessment",
    detailedInterpretation: "Detailed Interpretation",
    scoreDistribution: "Score Distribution",
    riskAssessment: "Risk Assessment",
    personalizedRecommendations: "Personalized Recommendations",
    recommendedResources: "Recommended Resources",
    nextSteps: {
      title: "Next Steps",
      moreAssessments: {
        title: "More Assessments",
        description: "Explore other assessment tools",
      },
      startPractice: {
        title: "Start Practice",
        description: "Try related mental health practices",
      },
      browseResources: {
        title: "Browse Resources",
        description: "View healing resource library",
      },
    },
    actions: {
      share: "Share Results",
      savePdf: "Save as PDF",
      viewHistory: "View History",
      backToAssessments: "Back to Assessments",
    },
    riskLevels: {
      high: {
        title: "Needs Attention",
        message:
          "Your assessment results indicate you may need professional help. Consider consulting a mental health expert or calling a mental health helpline.",
      },
      medium: {
        title: "Recommended Attention",
        message:
          "Your assessment results show some areas that need attention. Consider implementing self-care measures or seeking support.",
      },
      low: {
        title: "Good Status",
        message:
          "Your assessment results are within normal range. Continue maintaining healthy habits.",
      },
    },
    disclaimer: {
      title: "Important Notice",
      message:
        "These assessment results are for reference only and cannot replace professional mental health diagnosis. If you feel distressed or need help, please consult a professional mental health expert.",
    },
    quickActions: "Quick Actions",
    noResultFound: "Assessment result not found",
    noResultData: "No assessment data found",
  },

  actions: {
    retry: "Retry",
    goBack: "Go Back",
    refresh: "Refresh",
    startNew: "Start New Assessment",
    continue: "Continue",
    viewDetails: "View Details",
  },

  questionnaireInfo: {
    description: "Description",
    purpose: "Purpose",
    whatToExpect: "What to Expect",
    professionalBackground: "Professional Background",
    tags: "Tags",
    questions: "Questions",
    minutes: "Minutes",
    timeEstimate: {
      lessThanMinute: "Less than 1 minute",
      oneMinute: "1 minute",
      minutes: "{minutes} minutes",
    },
    difficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    steps: {
      step1: "Answer {count} questions honestly (takes about {time} minutes)",
      step2: "Your responses will be analyzed using validated scoring methods",
      step3: "Receive personalized results and recommendations",
    },
    validated: "Clinically Validated Assessment",
    mentalHealthAssessment: "Mental Health Assessment",
    purposeDescription:
      "This assessment helps identify symptoms and provides insights that can guide your understanding of your mental health.",
    validatedDescription:
      "This assessment uses scientifically validated methods and scoring systems.",
    privacy: {
      title: "Privacy & Data Security",
      message:
        "Your responses are stored locally on your device and are not shared with third parties.",
    },
    startAssessment: "Start Assessment",
    starting: "Starting...",
  },

  questionnaireCard: {
    featured: "Featured",
    minutes: "min",
    questions: "questions",
    difficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    validated: "Validated",
    viewHistory: "View History",
    startAssessment: "Start Assessment",
  },

  existingSession: {
    title: "Incomplete Assessment",
    progress: "Progress",
    lastActivity: "Last activity",
    questionsAnswered: "Answered",
    message: "You have an incomplete assessment. You can continue from where you left off, or start over.",
    continue: "Continue Assessment",
    restart: "Start Over",
    restartWarning: "Starting over will delete all your previous answers.",
  },

  history: {
    stats: {
      total: "Total Assessments",
      averageTime: "Average Time",
      lastAssessment: "Last Assessment",
    },
    list: {
      dimensions: "dimensions",
      viewDetails: "View Details",
      share: "Share",
      delete: "Delete",
    },
    filters: {
      type: "Assessment Type",
      timeRange: "Time Range",
      riskLevel: "Risk Level",
    },
  },

  status: {
    active: "Active",
    paused: "Paused",
  },

  labels: {
    unknownAssessment: "Unknown Assessment",
    startTime: "Started",
    timeSpent: "Time Spent",
    answered: "Answered",
    questions: "questions",
    estimatedRemaining: "Estimated Remaining",
  },

  time: {
    minutes: "minutes",
    varies: "Varies",
    minutesSeconds: "{minutes}m {seconds}s",
  },

  messages: {
    deleted: "Session deleted successfully",
    clearedCount: "Cleared {count} sessions",
    noActiveSessions: "All Caught Up!",
    noActiveSessionsMessage: "You don't have any incomplete assessments. Start a new one to continue your mental health journey.",
  },

  common: {
    loading: "Loading...",
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    error: "Error",
    showing: "Showing",
    to: "to",
    of: "of",
    results: "results",
    riskLevels: {
      high: "High Risk",
      medium: "Medium Risk",
      low: "Low Risk",
    },
    timeUnits: {
      minutes: "min",
      seconds: "s",
    },
  },

  priority: {
    high: "High",
    medium: "Medium",
    low: "Low",
  },

  recommendations: {
    riskBased: {
      high: [
        "🚨 Consider seeking immediate professional mental health support",
        "📞 Contact a mental health professional or crisis hotline",
        "🏥 Consider scheduling a detailed assessment with a mental health expert",
        "👥 Inform family or friends about your situation and seek support"
      ],
      medium: [
        "👨‍⚕️ Consider scheduling a consultation with a mental health professional",
        "🧘‍♀️ Learn and practice stress management techniques",
        "📚 Read books and resources about mental health",
        "🏃‍♂️ Maintain regular physical exercise"
      ],
      low: [
        "📊 Continue monitoring your mental health status",
        "🌱 Maintain healthy lifestyle habits",
        "💪 Develop positive coping strategies",
        "🎯 Set achievable goals and expectations"
      ]
    },
    general: [
      "💤 Ensure adequate sleep (7-9 hours)",
      "🥗 Maintain a balanced diet",
      "🚫 Avoid excessive use of alcohol and drugs",
      "🤝 Stay connected with friends and family"
    ],
    patterns: {
      stable: "📈 Your scores are relatively stable, continue maintaining your current state",
      variable: "📊 Your scores vary significantly, consider regular reassessment",
      extreme: "⚠️ Some aspects need special attention, consider seeking professional help",
      highAverage: "🔍 Consider a more detailed mental health assessment",
      mediumAverage: "👀 Consider regular monitoring of mental health status"
    }
  },

  trends: {
    title: "ट्रेंड विश्लेषण",
    subtitle: "अपने मानसिक स्वास्थ्य के रुझान और विकास पैटर्न का विश्लेषण करें",
    loading: "ट्रेंड डेटा लोड हो रहा है...",
    timeRange: {
      title: "समय सीमा",
      last30Days: "पिछले 30 दिन",
      last3Months: "पिछले 3 महीने",
      lastYear: "पिछला साल",
      allTime: "सभी समय"
    },
    charts: {
      overallTrend: "समग्र रुझान",
      frequency: "मूल्यांकन आवृत्ति",
      riskTrend: "जोखिम स्तर परिवर्तन",
      categoryPerformance: "श्रेणी प्रदर्शन"
    },
    insights: {
      title: "ट्रेंड अंतर्दृष्टि",
      positive: "सकारात्मक रुझान",
      warning: "ध्यान की आवश्यकता",
      info: "स्थिर"
    },
    statistics: {
      improvementTrend: "सुधार रुझान",
      stableDimensions: "स्थिर आयाम",
      attentionNeeded: "ध्यान की आवश्यकता"
    },
    noData: {
      title: "कोई ट्रेंड डेटा नहीं",
      message: "ट्रेंड विश्लेषण देखने के लिए आपको कम से कम 2 मूल्यांकन पूरे करने होंगे",
      startAssessment: "मूल्यांकन शुरू करें"
    },
    actions: {
      exportReport: "ट्रेंड रिपोर्ट निर्यात करें",
      newAssessment: "नया मूल्यांकन"
    }
  },

  scores: {
    total_score: "कुल स्कोर",
    depression: "अवसाद स्कोर",
    anxiety: "चिंता स्कोर",
    stress: "तनाव स्कोर",
    phq9_total: "PHQ-9 कुल स्कोर",
    gad7_total: "GAD-7 कुल स्कोर",
    stress_total: "तनाव स्केल कुल स्कोर"
  },
};

export default assessmentEn;
