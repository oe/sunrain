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

  actions: {
    retry: 'إعادة المحاولة',
    goBack: 'العودة',
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
  },
};

export default assessmentAr;
