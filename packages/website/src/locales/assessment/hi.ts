/**
 * 评测系统印地语翻译内容
 */
import type { IAssessmentTranslations } from './types';

export const assessmentHi: IAssessmentTranslations = {
  pageTitle: 'मानसिक स्वास्थ्य मूल्यांकन',

  list: {
    title: 'मानसिक स्वास्थ्य मूल्यांकन',
    subtitle: 'वैज्ञानिक मूल्यांकन उपकरणों के माध्यम से अपनी मानसिक स्वास्थ्य स्थिति को समझें और व्यक्तिगत सिफारिशें और संसाधन प्राप्त करें',
    categories: {
      mental_health: 'मानसिक स्वास्थ्य मूल्यांकन',
      personality: 'व्यक्तित्व मूल्यांकन',
      stress: 'तनाव मूल्यांकन',
      mood: 'मूड मूल्यांकन'
    },
    categoryDescriptions: {
      mental_health: 'संभावित मानसिक स्वास्थ्य समस्याओं की पहचान करने में मदद करने वाले पेशेवर मानसिक स्वास्थ्य स्क्रीनिंग उपकरण',
      personality: 'अपने व्यक्तित्व लक्षणों और व्यवहार पैटर्न को समझें',
      stress: 'अपने तनाव स्तर और मुकाबला करने की क्षमताओं का आकलन करें',
      mood: 'अपनी भावनात्मक स्थितियों और रुझानों की निगरानी करें'
    },
    startButton: 'मूल्यांकन शुरू करें',
    infoButton: 'और जानें',
    minutes: 'मिनट',
    questions: 'प्रश्न',
    activeSessions: {
      title: 'आपके पास {count} अधूरे मूल्यांकन हैं',
      message: 'अपने मूल्यांकन जारी रखने के लिए क्लिक करें',
      continueLink: 'मूल्यांकन जारी रखें',
      lastActivity: 'अंतिम गतिविधि',
      progress: 'प्रगति'
    },
    quickActions: {
      title: 'त्वरित कार्य',
      history: {
        title: 'मूल्यांकन इतिहास',
        description: 'ऐतिहासिक मूल्यांकन परिणाम देखें'
      },
      trends: {
        title: 'रुझान विश्लेषण',
        description: 'मानसिक स्वास्थ्य रुझान देखें'
      },
      continue: {
        title: 'मूल्यांकन जारी रखें',
        description: 'अधूरे मूल्यांकन पूरे करें'
      }
    },
    existingSession: {
      title: "अधूरा मूल्यांकन",
      message: "आपका एक अधूरा मूल्यांकन है। आप जहाँ छोड़ा था वहाँ से जारी रख सकते हैं, या फिर से शुरू कर सकते हैं।",
      progress: "प्रगति",
      lastActivity: "अंतिम गतिविधि",
      questionsAnswered: "उत्तर दिए गए",
      continue: "मूल्यांकन जारी रखें",
      restart: "फिर से शुरू करें",
      restartWarning: "फिर से शुरू करने से आपके सभी पिछले उत्तर हट जाएंगे।"
    },
    disclaimer: {
      title: 'महत्वपूर्ण सूचना',
      message: 'ये मूल्यांकन उपकरण केवल स्क्रीनिंग और आत्म-समझ के लिए हैं और पेशेवर मानसिक स्वास्थ्य निदान का विकल्प नहीं हैं। यदि आप परेशान महसूस करते हैं या मदद की जरूरत है, तो कृपया एक पेशेवर मानसिक स्वास्थ्य विशेषज्ञ से सलाह लें।'
    }
  },

  execution: {
    loading: 'मूल्यांकन लोड हो रहा है...',
    pause: 'रोकें',
    save: 'प्रगति सहेजें',
    next: 'अगला',
    previous: 'पिछला',
    complete: 'मूल्यांकन पूरा करें',
    timeSpent: 'बिताया गया समय',
    required: '* आवश्यक',
    questionNumber: 'प्रश्न',
    totalQuestions: 'प्रश्न',
    completion: {
      title: 'मूल्यांकन पूरा!',
      message: 'आपके परिणामों का विश्लेषण कर रहे हैं...'
    },
    pauseModal: {
      title: 'मूल्यांकन रोकें',
      message: 'आपकी प्रगति स्वचालित रूप से सहेज दी गई है। आप बाद में मूल्यांकन जारी रख सकते हैं।',
      continue: 'मूल्यांकन जारी रखें',
      exit: 'बाहर निकलें'
    },
    errors: {
      required: 'कृपया जारी रखने से पहले इस प्रश्न का उत्तर दें।',
      submitFailed: 'उत्तर जमा करने में विफल, कृपया पुनः प्रयास करें।',
      loadFailed: 'मूल्यांकन लोड करने में विफल, कृपया पेज रीफ्रेश करके पुनः प्रयास करें।'
    }
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
        description: 'अन्य मूल्यांकन उपकरण खोजें'
      },
      startPractice: {
        title: 'अभ्यास शुरू करें',
        description: 'संबंधित मानसिक स्वास्थ्य अभ्यास आज़माएं'
      },
      browseResources: {
        title: 'संसाधन ब्राउज़ करें',
        description: 'उपचार संसाधन लाइब्रेरी देखें'
      }
    },
    actions: {
      share: 'परिणाम साझा करें',
      savePdf: 'PDF के रूप में सहेजें',
      viewHistory: 'इतिहास देखें'
    },
    riskLevels: {
      high: {
        title: 'ध्यान की आवश्यकता',
        message: 'आपके मूल्यांकन परिणाम इंगित करते हैं कि आपको पेशेवर मदद की आवश्यकता हो सकती है। मानसिक स्वास्थ्य विशेषज्ञ से सलाह लेने या मानसिक स्वास्थ्य हेल्पलाइन पर कॉल करने पर विचार करें।'
      },
      medium: {
        title: 'ध्यान की सिफारिश',
        message: 'आपके मूल्यांकन परिणाम कुछ क्षेत्रों को दिखाते हैं जिन पर ध्यान देने की आवश्यकता है। स्व-देखभाल उपायों को लागू करने या सहायता मांगने पर विचार करें।'
      },
      low: {
        title: 'अच्छी स्थिति',
        message: 'आपके मूल्यांकन परिणाम सामान्य सीमा के भीतर हैं। स्वस्थ आदतों को बनाए रखना जारी रखें।'
      }
    },
    disclaimer: {
      title: 'महत्वपूर्ण सूचना',
      message: 'ये मूल्यांकन परिणाम केवल संदर्भ के लिए हैं और पेशेवर मानसिक स्वास्थ्य निदान का विकल्प नहीं हैं। यदि आप परेशान महसूस करते हैं या मदद की जरूरत है, तो कृपया एक पेशेवर मानसिक स्वास्थ्य विशेषज्ञ से सलाह लें।'
    }
  },

  history: {
    title: 'मूल्यांकन इतिहास',
    subtitle: 'अपने ऐतिहासिक मूल्यांकन रिकॉर्ड और रुझान विश्लेषण देखें',
    statistics: {
      total: 'कुल मूल्यांकन',
      completed: 'पूर्ण',
      averageTime: 'औसत समय',
      lastAssessment: 'अंतिम मूल्यांकन'
    },
    filters: {
      assessmentType: 'मूल्यांकन प्रकार',
      timeRange: 'समय सीमा',
      riskLevel: 'जोखिम स्तर',
      allTypes: 'सभी प्रकार',
      allTimes: 'सभी समय',
      allLevels: 'सभी स्तर',
      last7Days: 'पिछले 7 दिन',
      last30Days: 'पिछले 30 दिन',
      last3Months: 'पिछले 3 महीने',
      lastYear: 'पिछला साल',
      clearFilters: 'फ़िल्टर साफ़ करें'
    },
    list: {
      title: 'मूल्यांकन रिकॉर्ड',
      viewDetails: 'विवरण देखें',
      share: 'साझा करें',
      delete: 'हटाएं',
      dimensions: 'आयाम',
      today: 'आज',
      daysAgo: 'दिन पहले'
    },
    empty: {
      title: 'कोई मूल्यांकन रिकॉर्ड नहीं',
      message: 'आपने अभी तक कोई मूल्यांकन पूरा नहीं किया है',
      startFirst: 'पहला मूल्यांकन शुरू करें'
    },
    pagination: {
      showing: 'दिखा रहे हैं',
      to: 'से',
      of: 'का',
      records: 'रिकॉर्ड',
      previous: 'पिछला',
      next: 'अगला'
    },
    actions: {
      export: 'डेटा निर्यात करें',
      newAssessment: 'नया मूल्यांकन'
    }
  },

  continue: {
    title: 'मूल्यांकन जारी रखें',
    subtitle: 'अपने अधूरे मानसिक स्वास्थ्य मूल्यांकन पूरे करें',
    loading: 'अधूरे मूल्यांकन लोड हो रहे हैं...',
    noSessions: {
      title: 'कोई अधूरा मूल्यांकन नहीं',
      message: 'वर्तमान में आपके पास जारी रखने के लिए कोई मूल्यांकन नहीं है',
      startNew: 'नया मूल्यांकन शुरू करें'
    },
    session: {
      startedAt: 'शुरू किया गया',
      timeSpent: 'बिताया गया समय',
      progress: 'प्रगति',
      answered: 'उत्तर दिए गए',
      estimatedRemaining: 'अनुमानित शेष',
      continueButton: 'मूल्यांकन जारी रखें',
      status: {
        active: 'प्रगति में',
        paused: 'रोका गया'
      }
    },
    actions: {
      startNew: 'नया मूल्यांकन शुरू करें',
      clearAll: 'सभी अधूरे मूल्यांकन साफ़ करें'
    },
    confirmations: {
      deleteSession: 'क्या आप वाकई इस अधूरे मूल्यांकन को हटाना चाहते हैं? सभी प्रगति खो जाएगी।',
      clearAll: 'क्या आप वाकई सभी अधूरे मूल्यांकन साफ़ करना चाहते हैं? सभी प्रगति खो जाएगी।'
    }
  },

  trends: {
    title: 'रुझान विश्लेषण',
    subtitle: 'अपने मानसिक स्वास्थ्य रुझानों और विकास पैटर्न का विश्लेषण करें',
    loading: 'रुझान डेटा लोड हो रहा है...',
    timeRange: {
      title: 'समय सीमा',
      last30Days: 'पिछले 30 दिन',
      last3Months: 'पिछले 3 महीने',
      lastYear: 'पिछला साल',
      allTime: 'सभी समय'
    },
    charts: {
      overallTrend: 'समग्र रुझान',
      frequency: 'मूल्यांकन आवृत्ति',
      riskTrend: 'जोखिम स्तर परिवर्तन',
      categoryPerformance: 'श्रेणी प्रदर्शन'
    },
    insights: {
      title: 'रुझान अंतर्दृष्टि',
      positive: 'सकारात्मक रुझान',
      warning: 'ध्यान की आवश्यकता',
      info: 'स्थिर'
    },
    statistics: {
      improvementTrend: 'सुधार रुझान',
      stableDimensions: 'स्थिर आयाम',
      attentionNeeded: 'ध्यान की आवश्यकता'
    },
    noData: {
      title: 'कोई रुझान डेटा नहीं',
      message: 'रुझान विश्लेषण देखने के लिए आपको कम से कम 2 मूल्यांकन पूरे करने होंगे',
      startAssessment: 'मूल्यांकन शुरू करें'
    },
    actions: {
      exportReport: 'रुझान रिपोर्ट निर्यात करें',
      newAssessment: 'नया मूल्यांकन'
    }
  },

  common: {
    title: 'शीर्षक',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    refresh: 'रीफ्रेश',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    delete: 'हटाएं',
    save: 'सहेजें',
    share: 'साझा करें',
    export: 'निर्यात',
    riskLevels: {
      low: 'कम जोखिम',
      medium: 'मध्यम जोखिम',
      high: 'उच्च जोखिम'
    },
    timeUnits: {
      seconds: 'सेकंड',
      minutes: 'मिनट',
      hours: 'घंटे',
      days: 'दिन'
    }
  }
};

export default assessmentHi;
