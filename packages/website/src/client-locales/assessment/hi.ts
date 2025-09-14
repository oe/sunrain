/**
 * Assessment 系统印地语翻译内容 (CSR)
 * 包含实际使用的翻译键，匹配组件中的client前缀结构
 */
import type { IAssessmentTranslations } from './types';

export const assessmentHi: IAssessmentTranslations = {
  assessment: {
    title: 'मानसिक स्वास्थ्य मूल्यांकन',
  },

  loading: {
    default: 'लोड हो रहा है...',
    assessment: 'मूल्यांकन लोड हो रहा है...',
  },

  errors: {
    title: 'त्रुटि',
    initializationFailed: 'प्रारंभिकरण विफल',
    sessionStartFailed: 'मूल्यांकन सत्र शुरू नहीं कर सकते',
    noData: 'मूल्यांकन डेटा लोड करने में विफल',
    validationFailed: 'सत्यापन विफल',
    unsupportedQuestionType: 'असमर्थित प्रश्न प्रकार: {type}',
    cannotContinue: 'जारी नहीं रख सकते',
    continueFailed: 'जारी रखने में विफल',
    deleteFailed: 'हटाने में विफल',
    clearFailed: 'साफ़ करने में विफल',
    loadFailed: 'लोड करने में विफल',
    loadFailedMessage: 'डेटा लोड करने में समस्या हुई',
    boundary: {
      title: 'एप्लिकेशन त्रुटि',
      message: 'खुशी है, एप्लिकेशन में एक त्रुटि हुई है।',
      details: 'त्रुटि विवरण',
      retry: 'पुनः प्रयास',
      goHome: 'होम पर जाएं',
    },
  },

  question: {
    number: 'प्रश्न {number}',
    required: 'आवश्यक',
    selectedCount: '{count} चयनित',
    selectedValue: 'चयनित: {value}',
    textPlaceholder: 'कृपया अपना उत्तर दर्ज करें...',
    characterCount: '{count} अक्षर',
    textEntered: 'टेक्स्ट दर्ज किया गया',
    answered: 'उत्तर दिया गया',
  },

  questionList: {
    title: 'प्रश्न सूची',
    progress: 'प्रगति: {current}/{total}',
    questionNumber: 'प्रश्न {number}',
    completed: 'पूर्ण',
    remaining: 'शेष',
  },

  continue: {
    loading: 'अधूरे मूल्यांकन लोड हो रहे हैं...',
  },

  list: {
    activeSessions: {
      title: 'आपके पास {count} अधूरे मूल्यांकन हैं',
      continueLink: 'मूल्यांकन जारी रखें',
      lastActivity: 'अंतिम गतिविधि',
      progress: 'प्रगति',
    },
  },

  progress: {
    text: '{current} / {total}',
  },

  validation: {
    checking: 'सत्यापन कर रहे हैं...',
    withWarnings: 'with warnings', // TODO: Translate to Hindi
  },

  execution: {
    errors: {
      submitFailed: 'सबमिशन विफल',
      required: 'यह फ़ील्ड आवश्यक है',
    },
    completion: {
      title: 'मूल्यांकन पूर्ण',
      message: 'परिणाम उत्पन्न कर रहे हैं...',
    },
    pauseModal: {
      title: 'मूल्यांकन रोकें',
      message: 'क्या आप मूल्यांकन को रोकना चाहते हैं?',
      continue: 'जारी रखें',
      exit: 'बाहर निकलें',
    },
    navigation: {
      previous: 'पिछला',
      next: 'अगला',
      submit: 'सबमिट',
      save: 'सहेजें',
      submitting: 'सबमिट कर रहे हैं...',
    },
    pause: 'रोकें',
    questionNumber: 'प्रश्न {number}',
    timeSpent: 'बिताया गया समय',
    complete: 'पूर्ण',
  },

  results: {
    loading: 'मूल्यांकन परिणाम लोड हो रहे हैं...',
    completedAt: 'पूरा किया गया',
    timeSpent: 'बिताया गया समय',
    overallAssessment: 'समग्र मूल्यांकन',
    detailedInterpretation: 'विस्तृत व्याख्या',
    scoreDistribution: 'स्कोर वितरण',
    riskAssessment: 'जोखिम मूल्यांकन',
    personalizedRecommendations: 'व्यक्तिगत सिफारिशें',
    recommendedResources: 'अनुशंसित संसाधन',
    nextSteps: {
      title: 'अगले कदम',
      moreAssessments: {
        title: 'अधिक मूल्यांकन',
        description: 'अन्य मूल्यांकन उपकरणों का अन्वेषण करें'
      },
      startPractice: {
        title: 'अभ्यास शुरू करें',
        description: 'संबंधित मानसिक स्वास्थ्य अभ्यास आज़माएं'
      },
      browseResources: {
        title: 'संसाधन ब्राउज़ करें',
        description: 'उपचार संसाधन पुस्तकालय देखें'
      }
    },
    actions: {
      share: 'परिणाम साझा करें',
      savePdf: 'PDF के रूप में सहेजें',
      viewHistory: 'इतिहास देखें',
      backToAssessments: 'मूल्यांकन पर वापस जाएं'
    },
    riskLevels: {
      high: {
        title: 'ध्यान की आवश्यकता',
        message: 'आपके मूल्यांकन परिणाम इंगित करते हैं कि आपको पेशेवर सहायता की आवश्यकता हो सकती है। मानसिक स्वास्थ्य विशेषज्ञ से सलाह लेने पर विचार करें।'
      },
      medium: {
        title: 'ध्यान की सिफारिश',
        message: 'आपके मूल्यांकन परिणाम कुछ क्षेत्रों को दिखाते हैं जिन पर ध्यान देने की आवश्यकता है। स्व-देखभाल उपायों को लागू करने पर विचार करें।'
      },
      low: {
        title: 'अच्छी स्थिति',
        message: 'आपके मूल्यांकन परिणाम सामान्य सीमा के भीतर हैं। स्वस्थ आदतों को बनाए रखना जारी रखें।'
      }
    },
    disclaimer: {
      title: 'महत्वपूर्ण सूचना',
      message: 'ये मूल्यांकन परिणाम केवल संदर्भ के लिए हैं और पेशेवर मानसिक स्वास्थ्य निदान का स्थान नहीं ले सकते।'
    },
    quickActions: 'त्वरित क्रियाएं',
    noResultFound: 'मूल्यांकन परिणाम नहीं मिला',
    noResultData: 'मूल्यांकन डेटा नहीं मिला'
  },

  actions: {
    retry: 'पुनः प्रयास करें',
    goBack: 'वापस जाएं',
    refresh: 'ताज़ा करें',
    startNew: 'नया मूल्यांकन शुरू करें',
    continue: 'जारी रखें',
  },

  questionnaireInfo: {
    description: 'विवरण',
    purpose: 'उद्देश्य',
    whatToExpect: 'क्या अपेक्षा करें',
    professionalBackground: 'व्यावसायिक पृष्ठभूमि',
    tags: 'टैग',
    questions: 'प्रश्न',
    minutes: 'मिनट',
    timeEstimate: {
      lessThanMinute: '1 मिनट से कम',
      oneMinute: '1 मिनट',
      minutes: '{minutes} मिनट',
    },
    difficulty: {
      beginner: 'शुरुआती',
      intermediate: 'मध्यम',
      advanced: 'उन्नत',
    },
    steps: {
      step1: '{count} प्रश्नों का ईमानदारी से उत्तर दें (लगभग {time} मिनट लगेंगे)',
      step2: 'आपके उत्तरों का विश्वसनीय स्कोरिंग विधियों का उपयोग करके विश्लेषण किया जाएगा',
      step3: 'व्यक्तिगत परिणाम और सिफारिशें प्राप्त करें',
    },
    validated: 'नैदानिक रूप से सत्यापित मूल्यांकन',
    mentalHealthAssessment: 'मानसिक स्वास्थ्य मूल्यांकन',
    purposeDescription: 'यह मूल्यांकन लक्षणों की पहचान करने और अंतर्दृष्टि प्रदान करने में मदद करता है जो आपकी मानसिक स्वास्थ्य स्थिति की समझ का मार्गदर्शन कर सकती है।',
    validatedDescription: 'यह मूल्यांकन वैज्ञानिक रूप से सत्यापित विधियों और स्कोरिंग सिस्टम का उपयोग करता है।',
    privacy: {
      title: 'गोपनीयता और डेटा सुरक्षा',
      message: 'आपके उत्तर आपके डिवाइस पर स्थानीय रूप से संग्रहीत होते हैं और तीसरे पक्ष के साथ साझा नहीं किए जाते।',
    },
    startAssessment: 'मूल्यांकन शुरू करें',
    starting: 'शुरू हो रहा है...',
  },

  questionnaireCard: {
    featured: 'विशेष',
    minutes: 'मिनट',
    questions: 'प्रश्न',
    difficulty: {
      beginner: 'शुरुआती',
      intermediate: 'मध्यम',
      advanced: 'उन्नत',
    },
    validated: 'सत्यापित',
    viewHistory: 'इतिहास देखें',
    startAssessment: 'मूल्यांकन शुरू करें',
  },

  existingSession: {
    title: 'अधूरा मूल्यांकन',
    progress: 'प्रगति',
    lastActivity: 'अंतिम गतिविधि',
    questionsAnswered: 'उत्तर दिए गए',
    message: 'आपका एक अधूरा मूल्यांकन है। आप जहां छोड़ा था वहां से जारी रख सकते हैं, या फिर से शुरू कर सकते हैं।',
    continue: 'मूल्यांकन जारी रखें',
    restart: 'फिर से शुरू करें',
    restartWarning: 'फिर से शुरू करने से आपके सभी पिछले उत्तर हट जाएंगे।',
  },

  common: {
    loading: 'लोड हो रहा है...',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    confirm: 'पुष्टि करें',
    yes: 'हां',
    no: 'नहीं',
    error: 'त्रुटि',
    showing: 'दिखा रहा है',
    to: 'से',
    of: 'का',
    results: 'परिणाम',
    riskLevels: {
      low: 'कम जोखिम',
      medium: 'मध्यम जोखिम',
      high: 'उच्च जोखिम',
    },
    timeUnits: {
      seconds: 'सेकंड',
      minutes: 'मिनट',
    },
  },

  history: {
    stats: {
      total: 'कुल',
      averageTime: 'औसत समय',
      lastAssessment: 'अंतिम मूल्यांकन',
    },
    list: {
      dimensions: 'आयाम',
      viewDetails: 'विवरण देखें',
      share: 'साझा करें',
      delete: 'हटाएं',
    },
    filters: {
      type: 'प्रकार',
      timeRange: 'समय सीमा',
      riskLevel: 'जोखिम स्तर',
    },
  },

  status: {
    active: 'सक्रिय',
    paused: 'रोका गया',
  },

  labels: {
    unknownAssessment: 'अज्ञात मूल्यांकन',
    startTime: 'शुरुआत का समय',
    timeSpent: 'बिताया गया समय',
    answered: 'उत्तर दिया',
    questions: 'प्रश्न',
    estimatedRemaining: 'अनुमानित शेष',
  },

  time: {
    minutes: 'मिनट',
  },

  messages: {
    deleted: 'हटाया गया',
    clearedCount: '{count} साफ़ किया गया',
    noActiveSessions: 'कोई सक्रिय सत्र नहीं',
    noActiveSessionsMessage: 'आपके पास कोई सक्रिय मूल्यांकन सत्र नहीं है',
  },
};

export default assessmentHi;
