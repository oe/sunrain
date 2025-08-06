/**
 * 评测系统阿拉伯语翻译内容
 */
import type { IAssessmentTranslations } from './types';

export const assessmentAr: IAssessmentTranslations = {
  pageTitle: 'تقييم الصحة النفسية',

  list: {
    title: 'تقييم الصحة النفسية',
    subtitle: 'فهم حالة صحتك النفسية من خلال أدوات التقييم العلمية والحصول على توصيات وموارد شخصية',
    categories: {
      mental_health: 'تقييم الصحة النفسية',
      personality: 'تقييم الشخصية',
      stress: 'تقييم الضغط النفسي',
      mood: 'تقييم المزاج'
    },
    categoryDescriptions: {
      mental_health: 'أدوات فحص الصحة النفسية المهنية للمساعدة في تحديد مشاكل الصحة النفسية المحتملة',
      personality: 'فهم سمات شخصيتك وأنماط سلوكك',
      stress: 'تقييم مستويات التوتر لديك وقدرات التأقلم',
      mood: 'مراقبة حالاتك العاطفية واتجاهاتها'
    },
    startButton: 'بدء التقييم',
    infoButton: 'معرفة المزيد',
    minutes: 'دقائق',
    questions: 'أسئلة',
    activeSessions: {
      title: 'لديك {count} تقييمات غير مكتملة',
      message: 'انقر لمتابعة تقييماتك',
      continueLink: 'متابعة التقييمات',
      lastActivity: 'آخر نشاط',
      progress: 'التقدم'
    },
    quickActions: {
      title: 'إجراءات سريعة',
      history: {
        title: 'تاريخ التقييمات',
        description: 'عرض نتائج التقييمات السابقة'
      },
      trends: {
        title: 'تحليل الاتجاهات',
        description: 'عرض اتجاهات الصحة النفسية'
      },
      continue: {
        title: 'متابعة التقييم',
        description: 'إكمال التقييمات غير المكتملة'
      }
    },
    existingSession: {
      title: "تقييم غير مكتمل",
      message: "لديك تقييم غير مكتمل. يمكنك المتابعة من حيث توقفت، أو البدء من جديد.",
      progress: "التقدم",
      lastActivity: "آخر نشاط",
      questionsAnswered: "تم الإجابة عليها",
      continue: "متابعة التقييم",
      restart: "البدء من جديد",
      restartWarning: "البدء من جديد سيحذف جميع إجاباتك السابقة."
    },
    disclaimer: {
      title: 'إشعار مهم',
      message: 'هذه أدوات التقييم مخصصة للفحص والفهم الذاتي فقط ولا يمكنها أن تحل محل التشخيص المهني للصحة النفسية. إذا كنت تشعر بالضيق أو تحتاج إلى مساعدة، يرجى استشارة أخصائي صحة نفسية مهني.'
    }
  },

  execution: {
    loading: 'جاري تحميل التقييم...',
    pause: 'إيقاف مؤقت',
    save: 'حفظ التقدم',
    next: 'التالي',
    previous: 'السابق',
    complete: 'إكمال التقييم',
    timeSpent: 'الوقت المستغرق',
    required: '* مطلوب',
    questionNumber: 'سؤال',
    totalQuestions: 'أسئلة',
    completion: {
      title: 'تم إكمال التقييم!',
      message: 'جاري تحليل نتائجك...'
    },
    pauseModal: {
      title: 'إيقاف التقييم مؤقتاً',
      message: 'تم حفظ تقدمك تلقائياً. يمكنك متابعة التقييم لاحقاً.',
      continue: 'متابعة التقييم',
      exit: 'خروج'
    },
    errors: {
      required: 'يرجى الإجابة على هذا السؤال قبل المتابعة.',
      submitFailed: 'فشل في إرسال الإجابة، يرجى المحاولة مرة أخرى.',
      loadFailed: 'فشل في تحميل التقييم، يرجى تحديث الصفحة والمحاولة مرة أخرى.'
    }
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
        description: 'استكشاف أدوات تقييم أخرى'
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
      viewHistory: 'عرض التاريخ'
    },
    riskLevels: {
      high: {
        title: 'يحتاج إلى انتباه',
        message: 'تشير نتائج تقييمك إلى أنك قد تحتاج إلى مساعدة مهنية. فكر في استشارة أخصائي صحة نفسية أو الاتصال بخط مساعدة الصحة النفسية.'
      },
      medium: {
        title: 'يُنصح بالانتباه',
        message: 'تُظهر نتائج تقييمك بعض المجالات التي تحتاج إلى انتباه. فكر في تنفيذ تدابير الرعاية الذاتية أو طلب الدعم.'
      },
      low: {
        title: 'حالة جيدة',
        message: 'نتائج تقييمك ضمن النطاق الطبيعي. استمر في الحفاظ على العادات الصحية.'
      }
    },
    disclaimer: {
      title: 'إشعار مهم',
      message: 'هذه نتائج التقييم للمرجع فقط ولا يمكنها أن تحل محل التشخيص المهني للصحة النفسية. إذا كنت تشعر بالضيق أو تحتاج إلى مساعدة، يرجى استشارة أخصائي صحة نفسية مهني.'
    }
  },

  history: {
    title: 'تاريخ التقييمات',
    subtitle: 'عرض سجلات التقييمات السابقة وتحليل الاتجاهات',
    statistics: {
      total: 'إجمالي التقييمات',
      completed: 'مكتملة',
      averageTime: 'متوسط الوقت',
      lastAssessment: 'آخر تقييم'
    },
    filters: {
      assessmentType: 'نوع التقييم',
      timeRange: 'النطاق الزمني',
      riskLevel: 'مستوى المخاطر',
      allTypes: 'جميع الأنواع',
      allTimes: 'جميع الأوقات',
      allLevels: 'جميع المستويات',
      last7Days: 'آخر 7 أيام',
      last30Days: 'آخر 30 يوماً',
      last3Months: 'آخر 3 أشهر',
      lastYear: 'العام الماضي',
      clearFilters: 'مسح المرشحات'
    },
    list: {
      title: 'سجلات التقييم',
      viewDetails: 'عرض التفاصيل',
      share: 'مشاركة',
      delete: 'حذف',
      dimensions: 'أبعاد',
      today: 'اليوم',
      daysAgo: 'أيام مضت'
    },
    empty: {
      title: 'لا توجد سجلات تقييم',
      message: 'لم تكمل أي تقييمات بعد',
      startFirst: 'بدء التقييم الأول'
    },
    pagination: {
      showing: 'عرض',
      to: 'إلى',
      of: 'من',
      records: 'سجلات',
      previous: 'السابق',
      next: 'التالي'
    },
    actions: {
      export: 'تصدير البيانات',
      newAssessment: 'تقييم جديد'
    }
  },

  continue: {
    title: 'متابعة التقييم',
    subtitle: 'أكمل تقييمات الصحة النفسية غير المكتملة',
    loading: 'جاري تحميل التقييمات غير المكتملة...',
    noSessions: {
      title: 'لا توجد تقييمات غير مكتملة',
      message: 'ليس لديك حالياً أي تقييمات لمتابعتها',
      startNew: 'بدء تقييم جديد'
    },
    session: {
      startedAt: 'بدأ في',
      timeSpent: 'الوقت المستغرق',
      progress: 'التقدم',
      answered: 'تم الإجابة عليها',
      estimatedRemaining: 'المتبقي المقدر',
      continueButton: 'متابعة التقييم',
      status: {
        active: 'قيد التقدم',
        paused: 'متوقف مؤقتاً'
      }
    },
    actions: {
      startNew: 'بدء تقييم جديد',
      clearAll: 'مسح جميع التقييمات غير المكتملة'
    },
    confirmations: {
      deleteSession: 'هل أنت متأكد من أنك تريد حذف هذا التقييم غير المكتمل؟ سيتم فقدان جميع التقدم.',
      clearAll: 'هل أنت متأكد من أنك تريد مسح جميع التقييمات غير المكتملة؟ سيتم فقدان جميع التقدم.'
    }
  },

  trends: {
    title: 'تحليل الاتجاهات',
    subtitle: 'تحليل اتجاهات صحتك النفسية وأنماط التطور',
    loading: 'جاري تحميل بيانات الاتجاهات...',
    timeRange: {
      title: 'النطاق الزمني',
      last30Days: 'آخر 30 يوماً',
      last3Months: 'آخر 3 أشهر',
      lastYear: 'العام الماضي',
      allTime: 'جميع الأوقات'
    },
    charts: {
      overallTrend: 'الاتجاه العام',
      frequency: 'تكرار التقييم',
      riskTrend: 'تغيرات مستوى المخاطر',
      categoryPerformance: 'أداء الفئات'
    },
    insights: {
      title: 'رؤى الاتجاهات',
      positive: 'اتجاه إيجابي',
      warning: 'يحتاج إلى انتباه',
      info: 'مستقر'
    },
    statistics: {
      improvementTrend: 'اتجاه التحسن',
      stableDimensions: 'الأبعاد المستقرة',
      attentionNeeded: 'يحتاج إلى انتباه'
    },
    noData: {
      title: 'لا توجد بيانات اتجاهات',
      message: 'تحتاج إلى إكمال تقييمين على الأقل لعرض تحليل الاتجاهات',
      startAssessment: 'بدء التقييم'
    },
    actions: {
      exportReport: 'تصدير تقرير الاتجاهات',
      newAssessment: 'تقييم جديد'
    }
  },

  common: {
    title: 'العنوان',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    refresh: 'تحديث',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    delete: 'حذف',
    save: 'حفظ',
    share: 'مشاركة',
    export: 'تصدير',
    riskLevels: {
      low: 'مخاطر منخفضة',
      medium: 'مخاطر متوسطة',
      high: 'مخاطر عالية'
    },
    timeUnits: {
      seconds: 'ثواني',
      minutes: 'دقائق',
      hours: 'ساعات',
      days: 'أيام'
    }
  }
};

export default assessmentAr;
