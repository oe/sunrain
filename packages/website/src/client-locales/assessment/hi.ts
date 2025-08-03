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
};

export default assessmentHi;
