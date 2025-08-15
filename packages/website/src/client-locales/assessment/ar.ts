/**
 * Assessment 系统阿拉伯语翻译内容 (CSR)
 * 包含实际使用的翻译键，匹配组件中的client前缀结构
 */
import type { IAssessmentTranslations } from './types';

export const assessmentAr: IAssessmentTranslations = {
  assessment: {
    title: 'تقييم الصحة النفسية',
  },

  loading: {
    default: 'جاري التحميل...',
    assessment: 'جاري تحميل التقييم...',
  },

  errors: {
    title: 'خطأ',
    initializationFailed: 'فشل في التهيئة',
    sessionStartFailed: 'لا يمكن بدء جلسة التقييم',
    noData: 'فشل في تحميل بيانات التقييم',
    validationFailed: 'فشل في التحقق',
    unsupportedQuestionType: 'نوع سؤال غير مدعوم: {type}',
    cannotContinue: 'Cannot continue session', // TODO: Translate to Arabic
    continueFailed: 'Failed to continue session', // TODO: Translate to Arabic
    deleteFailed: 'Failed to delete session', // TODO: Translate to Arabic
    clearFailed: 'Failed to clear sessions', // TODO: Translate to Arabic
    loadFailed: 'Loading Failed', // TODO: Translate to Arabic
    loadFailedMessage: 'Unable to load assessment data. Please try again.', // TODO: Translate to Arabic
    boundary: {
      title: 'خطأ في التطبيق',
      message: 'عذراً، حدث خطأ في التطبيق.',
      details: 'تفاصيل الخطأ',
      retry: 'إعادة المحاولة',
      goHome: 'العودة للرئيسية',
    },
  },

  question: {
    number: 'السؤال {number}',
    required: 'مطلوب',
    selectedCount: '{count} مختار',
    selectedValue: 'مختار: {value}',
    textPlaceholder: 'يرجى إدخال إجابتك...',
    characterCount: '{count} حرف',
    textEntered: 'تم إدخال النص',
    answered: 'تمت الإجابة',
  },

  questionList: {
    title: 'قائمة الأسئلة',
    progress: 'التقدم: {current}/{total}',
    questionNumber: 'السؤال {number}',
    completed: 'مكتمل',
    remaining: 'متبقي',
  },

  continue: {
    loading: 'جاري تحميل التقييمات غير المكتملة...',
  },

  list: {
    activeSessions: {
      title: 'لديك {count} تقييمات غير مكتملة',
      continueLink: 'متابعة التقييمات',
      lastActivity: 'آخر نشاط',
      progress: 'التقدم',
    },
  },

  progress: {
    text: '{current} من {total}',
  },

  validation: {
    checking: 'جاري التحقق...',
    withWarnings: 'with warnings', // TODO: Translate to Arabic
  },

  execution: {
    errors: {
      submitFailed: 'فشل في الإرسال',
      required: 'هذا الحقل مطلوب',
    },
    completion: {
      title: 'اكتمل التقييم',
      message: 'جاري إنشاء النتائج...',
    },
    pauseModal: {
      title: 'إيقاف التقييم مؤقتاً',
      message: 'هل أنت متأكد من إيقاف التقييم مؤقتاً؟',
      continue: 'متابعة',
      exit: 'خروج',
    },
    navigation: {
      previous: 'السابق',
      next: 'التالي',
      submit: 'إرسال',
      save: 'حفظ',
      submitting: 'جاري الإرسال...',
    },
    pause: 'إيقاف مؤقت',
    questionNumber: 'السؤال {number}',
    timeSpent: 'الوقت المستغرق',
    complete: 'مكتمل',
  },

  results: {
    loading: 'جاري تحميل نتائج التقييم...',
    completedAt: 'تم الإكمال في',
    timeSpent: 'الوقت المستغرق',
    overallAssessment: 'التقييم العام',
    detailedInterpretation: 'التفسير المفصل',
    scoreDistribution: 'توزيع النقاط',
    riskAssessment: 'تقييم المخاطر',
    personalizedRecommendations: 'التوصيات الشخصية',
    recommendedResources: 'الموارد الموصى بها',
    nextSteps: {
      title: 'الخطوات التالية',
      moreAssessments: {
        title: 'المزيد من التقييمات',
        description: 'استكشاف أدوات التقييم الأخرى'
      },
      startPractice: {
        title: 'بدء الممارسة',
        description: 'تجربة ممارسات الصحة النفسية ذات الصلة'
      },
      browseResources: {
        title: 'تصفح الموارد',
        description: 'عرض مكتبة موارد الشفاء'
      }
    },
    actions: {
      share: 'مشاركة النتائج',
      savePdf: 'حفظ كـ PDF',
      viewHistory: 'عرض التاريخ',
      backToAssessments: 'العودة إلى التقييمات'
    },
    riskLevels: {
      high: {
        title: 'يحتاج إلى انتباه',
        message: 'تشير نتائج التقييم إلى أنك قد تحتاج إلى مساعدة مهنية. فكر في استشارة خبير الصحة النفسية.'
      },
      medium: {
        title: 'انتباه موصى به',
        message: 'تظهر نتائج التقييم بعض المجالات التي تحتاج إلى انتباه. فكر في تنفيذ تدابير الرعاية الذاتية.'
      },
      low: {
        title: 'حالة جيدة',
        message: 'نتائج التقييم ضمن النطاق الطبيعي. استمر في الحفاظ على العادات الصحية.'
      }
    },
    disclaimer: {
      title: 'إشعار مهم',
      message: 'نتائج هذا التقييم للمرجع فقط ولا يمكن أن تحل محل التشخيص المهني للصحة النفسية.'
    },
    quickActions: 'الإجراءات السريعة',
    noResultFound: 'لم يتم العثور على نتيجة التقييم',
    noResultData: 'لم يتم العثور على بيانات التقييم'
  },

  history: {
    stats: {
      total: "Total Assessments", // TODO: Translate to Arabic
      averageTime: "Average Time", // TODO: Translate to Arabic
      lastAssessment: "Last Assessment", // TODO: Translate to Arabic
    },
    list: {
      dimensions: "dimensions", // TODO: Translate to Arabic
      viewDetails: "View Details", // TODO: Translate to Arabic
      share: "Share", // TODO: Translate to Arabic
      delete: "Delete", // TODO: Translate to Arabic
    },
    filters: {
      type: "Assessment Type", // TODO: Translate to Arabic
      timeRange: "Time Range", // TODO: Translate to Arabic
      riskLevel: "Risk Level", // TODO: Translate to Arabic
    },
  },

  status: {
    active: "Active", // TODO: Translate to Arabic
    paused: "Paused", // TODO: Translate to Arabic
  },

  labels: {
    unknownAssessment: "Unknown Assessment", // TODO: Translate to Arabic
    startTime: "Started", // TODO: Translate to Arabic
    timeSpent: "Time Spent", // TODO: Translate to Arabic
    answered: "Answered", // TODO: Translate to Arabic
    questions: "questions", // TODO: Translate to Arabic
    estimatedRemaining: "Estimated Remaining", // TODO: Translate to Arabic
  },

  time: {
    minutes: "minutes", // TODO: Translate to Arabic
  },

  messages: {
    deleted: "Session deleted successfully", // TODO: Translate to Arabic
    clearedCount: "Cleared {count} sessions", // TODO: Translate to Arabic
    noActiveSessions: "All Caught Up!", // TODO: Translate to Arabic
    noActiveSessionsMessage: "You don't have any incomplete assessments. Start a new one to continue your mental health journey.", // TODO: Translate to Arabic
  },

  actions: {
    retry: 'إعادة المحاولة',
    goBack: 'العودة',
    refresh: "Refresh", // TODO: Translate to Arabic
    startNew: "Start New Assessment", // TODO: Translate to Arabic
    continue: "Continue", // TODO: Translate to Arabic
  },

  questionnaireInfo: {
    description: 'الوصف',
    purpose: 'الغرض',
    whatToExpect: 'ما يمكن توقعه',
    professionalBackground: 'الخلفية المهنية',
    tags: 'العلامات',
    questions: 'الأسئلة',
    minutes: 'دقائق',
    timeEstimate: {
      lessThanMinute: 'أقل من دقيقة',
      oneMinute: 'دقيقة واحدة',
      minutes: '{minutes} دقائق',
    },
    difficulty: {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    },
    steps: {
      step1: 'أجب على {count} أسئلة بصدق (يستغرق حوالي {time} دقائق)',
      step2: 'سيتم تحليل إجاباتك باستخدام طرق تسجيل معتمدة',
      step3: 'احصل على نتائج وتوصيات شخصية',
    },
    validated: 'تقييم معتمد سريرياً',
    mentalHealthAssessment: 'تقييم الصحة النفسية',
    purposeDescription: 'يساعد هذا التقييم في تحديد الأعراض وتقديم رؤى يمكن أن توجه فهمك لحالتك النفسية.',
    validatedDescription: 'يستخدم هذا التقييم طرق وأنظمة تسجيل معتمدة علمياً.',
    privacy: {
      title: 'الخصوصية وأمان البيانات',
      message: 'يتم تخزين إجاباتك محلياً على جهازك ولا تتم مشاركتها مع أطراف ثالثة.',
    },
    startAssessment: 'بدء التقييم',
    starting: 'جاري البدء...',
  },

  questionnaireCard: {
    featured: 'مميز',
    minutes: 'دقيقة',
    questions: 'أسئلة',
    difficulty: {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    },
    validated: 'معتمد',
    viewHistory: 'عرض التاريخ',
    startAssessment: 'بدء التقييم',
  },

  existingSession: {
    title: 'تقييم غير مكتمل',
    progress: 'التقدم',
    lastActivity: 'آخر نشاط',
    questionsAnswered: 'تمت الإجابة',
    message: 'لديك تقييم غير مكتمل. يمكنك المتابعة من حيث توقفت، أو البدء من جديد.',
    continue: 'متابعة التقييم',
    restart: 'البدء من جديد',
    restartWarning: 'البدء من جديد سيحذف جميع إجاباتك السابقة.',
  },

  common: {
    loading: 'جاري التحميل...',
    cancel: 'إلغاء',
    close: 'إغلاق',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    error: "Error", // TODO: Translate to Arabic
    showing: "Showing", // TODO: Translate to Arabic
    to: "to", // TODO: Translate to Arabic
    of: "of", // TODO: Translate to Arabic
    results: "results", // TODO: Translate to Arabic
    riskLevels: {
      high: "High Risk", // TODO: Translate to Arabic
      medium: "Medium Risk", // TODO: Translate to Arabic
      low: "Low Risk", // TODO: Translate to Arabic
    },
    timeUnits: {
      minutes: "min", // TODO: Translate to Arabic
      seconds: "s", // TODO: Translate to Arabic
    },
  },
};

export default assessmentAr;
