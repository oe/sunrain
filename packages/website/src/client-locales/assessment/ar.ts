/**
 * Assessment 系统阿拉伯语翻译内容 (CSR)
 * 此文件由翻译同步工具自动生成，请勿手动编辑
 */
import type { IAssessmentTranslations } from './types';

export const assessmentAr: IAssessmentTranslations = {
  /** قائمة التقييمات */
  list: {
    title: 'تقييم الصحة النفسية',
    subtitle: 'فهم حالة صحتك النفسية من خلال أدوات التقييم العلمية والحصول على توصيات وموارد شخصية',
    categories: {
      mental_health: 'تقييم الصحة النفسية',
      personality: 'تقييم الشخصية',
      stress: 'تقييم الضغط النفسي',
      mood: 'تقييم المزاج',
    },
    categoryDescriptions: {
      mental_health: 'أدوات فحص الصحة النفسية المهنية للمساعدة في تحديد مشاكل الصحة النفسية المحتملة',
      personality: 'فهم سمات شخصيتك وأنماط سلوكك',
      stress: 'تقييم مستويات التوتر لديك وقدرات التأقلم',
      mood: 'مراقبة حالاتك العاطفية واتجاهاتها',
    },
    startButton: 'بدء التقييم',
    minutes: 'دقائق',
    questions: 'أسئلة',
    activeSessions: {
      title: 'لديك {count} تقييمات غير مكتملة',
      message: 'انقر لمتابعة تقييماتك',
      continueLink: 'متابعة التقييمات',
      lastActivity: 'آخر نشاط',
      progress: 'التقدم',
    },
    quickActions: {
      title: 'إجراءات سريعة',
      history: {
        title: 'تاريخ التقييمات',
        description: 'عرض نتائج التقييمات السابقة',
      },
      trends: {
        title: 'تحليل الاتجاهات',
        description: 'عرض اتجاهات الصحة النفسية',
      },
      continue: {
        title: 'متابعة التقييم',
        description: 'إكمال التقييمات غير المكتملة',
      },
    },
    disclaimer: {
      title: 'إشعار مهم',
      message: 'هذه أدوات التقييم مخصصة للفحص والفهم الذاتي فقط ولا يمكنها أن تحل محل التشخيص المهني للصحة النفسية. إذا كنت تشعر بالضيق أو تحتاج إلى مساعدة، يرجى استشارة أخصائي صحة نفسية مهني.',
    },
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
        description: 'استكشاف أدوات تقييم أخرى',
      },
      startPractice: {
        title: 'بدء الممارسة',
        description: 'تجربة ممارسات الصحة النفسية ذات الصلة',
      },
      browseResources: {
        title: 'تصفح الموارد',
        description: 'عرض مكتبة موارد الشفاء',
      },
    },
    actions: {
      share: 'مشاركة النتائج',
      savePdf: 'حفظ كـ PDF',
      viewHistory: 'عرض التاريخ',
    },
    riskLevels: {
      high: {
        title: 'يحتاج إلى انتباه',
        message: 'تشير نتائج تقييمك إلى أنك قد تحتاج إلى مساعدة مهنية. فكر في استشارة أخصائي صحة نفسية أو الاتصال بخط مساعدة الصحة النفسية.',
      },
      medium: {
        title: 'يُنصح بالانتباه',
        message: 'تُظهر نتائج تقييمك بعض المجالات التي تحتاج إلى انتباه. فكر في تنفيذ تدابير الرعاية الذاتية أو طلب الدعم.',
      },
      low: {
        title: 'حالة جيدة',
        message: 'نتائج تقييمك ضمن النطاق الطبيعي. استمر في الحفاظ على العادات الصحية.',
      },
    },
    disclaimer: {
      title: 'إشعار مهم',
      message: 'هذه نتائج التقييم للمرجع فقط ولا يمكنها أن تحل محل التشخيص المهني للصحة النفسية. إذا كنت تشعر بالضيق أو تحتاج إلى مساعدة، يرجى استشارة أخصائي صحة نفسية مهني.',
    },
  },

  history: {
    title: 'تاريخ التقييمات',
    subtitle: 'عرض سجلات التقييم التاريخية وتحليل الاتجاهات',
    statistics: {
      total: 'إجمالي التقييمات',
      completed: 'مكتملة',
      averageTime: 'متوسط الوقت',
      lastAssessment: 'آخر تقييم',
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
      clearFilters: 'مسح المرشحات',
    },
    list: {
      title: 'سجلات التقييم',
      viewDetails: 'عرض التفاصيل',
      share: 'مشاركة',
      delete: 'حذف',
      dimensions: 'أبعاد',
      today: 'اليوم',
      daysAgo: 'أيام مضت',
    },
    empty: {
      title: 'لا توجد سجلات تقييم',
      message: 'لم تكمل أي تقييمات بعد',
      startFirst: 'بدء التقييم الأول',
    },
    pagination: {
      showing: 'عرض',
      to: 'إلى',
      of: 'من',
      records: 'سجلات',
      previous: 'السابق',
      next: 'التالي',
    },
    actions: {
      export: 'تصدير البيانات',
      newAssessment: 'تقييم جديد',
    },
  },

  continue: {
    title: 'متابعة التقييم',
    subtitle: 'أكمل تقييمات الصحة النفسية غير المكتملة',
    loading: 'جاري تحميل التقييمات غير المكتملة...',
    noSessions: {
      title: 'لا توجد تقييمات غير مكتملة',
      message: 'ليس لديك حالياً تقييمات لمتابعتها',
      startNew: 'بدء تقييم جديد',
    },
    session: {
      startedAt: 'بدأ في',
      timeSpent: 'الوقت المستغرق',
      progress: 'التقدم',
      answered: 'تم الإجابة عليها',
      estimatedRemaining: 'الوقت المتبقي المقدر',
      continueButton: 'متابعة التقييم',
      status: {
        active: 'قيد التقدم',
        paused: 'متوقف مؤقتاً',
      },
    },
    actions: {
      startNew: 'بدء تقييم جديد',
      clearAll: 'مسح جميع التقييمات غير المكتملة',
    },
    confirmations: {
      deleteSession: 'هل أنت متأكد من أنك تريد حذف هذا التقييم غير المكتمل؟ سيتم فقدان جميع التقدم.',
      clearAll: 'هل أنت متأكد من أنك تريد مسح جميع التقييمات غير المكتملة؟ سيتم فقدان جميع التقدم.',
    },
  },

  trends: {
    title: 'تحليل الاتجاهات',
    subtitle: 'تحليل اتجاهات الصحة النفسية وأنماط التطوير',
    loading: 'جاري تحميل بيانات الاتجاهات...',
    timeRange: {
      title: 'النطاق الزمني',
      last30Days: 'آخر 30 يوماً',
      last3Months: 'آخر 3 أشهر',
      lastYear: 'العام الماضي',
      allTime: 'كل الوقت',
    },
    charts: {
      overallTrend: 'الاتجاه العام',
      frequency: 'تكرار التقييم',
      riskTrend: 'تغييرات مستوى المخاطر',
      categoryPerformance: 'أداء الفئة',
    },
    insights: {
      title: 'رؤى الاتجاهات',
      positive: 'اتجاه إيجابي',
      warning: 'يحتاج إلى انتباه',
      info: 'مستقر',
    },
    statistics: {
      improvementTrend: 'اتجاه التحسن',
      stableDimensions: 'أبعاد مستقرة',
      attentionNeeded: 'يحتاج إلى انتباه',
    },
    noData: {
      title: 'لا توجد بيانات اتجاهات',
      message: 'تحتاج إلى إكمال تقييمين على الأقل لعرض تحليل الاتجاهات',
      startAssessment: 'بدء التقييم',
    },
    actions: {
      exportReport: 'تصدير تقرير الاتجاهات',
      newAssessment: 'تقييم جديد',
    },
  },

  common: {
    title: 'تقييم الصحة النفسية',
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
      high: 'مخاطر عالية',
    },
    timeUnits: {
      seconds: 'ثواني',
      minutes: 'دقائق',
      hours: 'ساعات',
      days: 'أيام',
    },
  },
  /** 客户端特定内容 */
  client: {
    /** 加载状态 */
    loading: {
      /** 评测加载 */
      assessment: 'جاري تحميل التقييم...',
      /** 翻译加载 */
      translations: 'جاري تحميل الترجمات...',
      /** 问题加载 */
      question: 'جاري تحميل السؤال...',
      /** 结果分析 */
      analysis: 'جاري تحليل النتائج...',
      /** 历史记录 */
      history: 'جاري تحميل التاريخ...',
    },
    /** 错误信息 */
    errors: {
      /** 错误标题 */
      title: 'حدث خطأ',
      /** 会话启动失败 */
      sessionStartFailed: 'لا يمكن بدء جلسة التقييم',
      /** 初始化失败 */
      initializationFailed: 'فشل في التهيئة',
      /** 提交失败 */
      submitFailed: 'فشل في إرسال الإجابة، يرجى المحاولة مرة أخرى',
      /** 分析失败 */
      analysisFailed: 'فشل في تحليل النتائج',
      /** 无数据 */
      noData: 'فشل في تحميل بيانات التقييم',
      /** 无效量表 */
      invalidScale: 'يرجى اختيار قيمة بين {min} و {max}',
      /** 文本过长 */
      textTooLong: 'لا يمكن أن يتجاوز النص 1000 حرف',
      /** 不支持的问题类型 */
      unsupportedQuestionType: 'نوع سؤال غير مدعوم: {type}',
      /** 网络错误 */
      networkError: 'خطأ في الاتصال بالشبكة، يرجى التحقق من اتصالك بالإنترنت',
      /** 超时错误 */
      timeoutError: 'انتهت مهلة الطلب، يرجى المحاولة مرة أخرى',
    },
    /** 操作按钮 */
    actions: {
      /** 重试 */
      retry: 'إعادة المحاولة',
      /** 上一题 */
      previous: 'السابق',
      /** 下一题 */
      next: 'التالي',
      /** 完成 */
      complete: 'إكمال التقييم',
      /** 保存 */
      save: 'حفظ التقدم',
      /** 已保存 */
      saved: 'تم الحفظ',
      /** 暂停 */
      pause: 'إيقاف مؤقت',
      /** 继续 */
      continue: 'متابعة',
      /** 退出 */
      exit: 'خروج',
      /** 开始新评测 */
      startNew: 'بدء تقييم جديد',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: 'نشط',
        /** 暂停 */
        paused: 'متوقف مؤقتاً',
        /** 已完成 */
        completed: 'مكتمل',
        /** 已过期 */
        expired: 'منتهي الصلاحية',
      },
      /** 自动保存状态 */
      autoSave: {
        /** 保存中 */
        saving: 'جاري الحفظ...',
        /** 已保存 */
        saved: 'تم الحفظ تلقائياً',
        /** 保存失败 */
        failed: 'فشل في الحفظ',
        /** 最后保存时间 */
        lastSaved: 'آخر حفظ: {time}',
      },
      /** 会话警告 */
      warnings: {
        /** 会话即将过期 */
        expiring: 'ستنتهي صلاحية الجلسة خلال {minutes} دقيقة',
        /** 网络连接不稳定 */
        unstableConnection: 'تم اكتشاف اتصال شبكة غير مستقر',
        /** 数据同步失败 */
        syncFailed: 'فشل في مزامنة البيانات مع الخادم',
      },
    },
    /** 问题验证 */
    validation: {
      /** 必填字段 */
      required: 'هذا الحقل مطلوب',
      /** 选择数量不足 */
      minSelections: 'يرجى اختيار {min} خيارات على الأقل',
      /** 选择数量过多 */
      maxSelections: 'يرجى عدم اختيار أكثر من {max} خيارات',
      /** 文本长度不足 */
      minLength: 'يرجى إدخال {min} أحرف على الأقل',
      /** 文本长度过长 */
      maxLength: 'لا يمكن أن يتجاوز النص {max} حرف',
      /** 数值范围错误 */
      outOfRange: 'يجب أن تكون القيمة بين {min} و {max}',
    },
    /** 键盘快捷键 */
    shortcuts: {
      /** 下一题 */
      next: 'اضغط Enter للسؤال التالي',
      /** 上一题 */
      previous: 'اضغط Shift+Enter للسؤال السابق',
      /** 保存 */
      save: 'اضغط Ctrl+S للحفظ',
      /** 暂停 */
      pause: 'اضغط Esc للإيقاف المؤقت',
      /** 帮助 */
      help: 'اضغط F1 للمساعدة',
    },
  },
  /** ترجمات متعلقة بتنفيذ التقييم */
  execution: {
    /** حالات التحميل */
    loading: 'جاري تحميل التقييم...',
    /** إيقاف مؤقت */
    pause: 'إيقاف مؤقت',
    /** حفظ التقدم */
    save: 'حفظ التقدم',
    /** السؤال التالي */
    next: 'التالي',
    /** السؤال السابق */
    previous: 'السابق',
    /** إكمال التقييم */
    complete: 'إكمال التقييم',
    /** الوقت المستغرق */
    timeSpent: 'الوقت المستغرق',
    /** مطلوب */
    required: '* مطلوب',
    /** رقم السؤال */
    questionNumber: 'السؤال',
    /** إجمالي الأسئلة */
    totalQuestions: 'أسئلة',
    /** حالة الإكمال */
    completion: {
      /** العنوان */
      title: 'تم إكمال التقييم!',
      /** الرسالة */
      message: 'جاري تحليل نتائجك...',
    },
    /** نافذة الإيقاف المؤقت */
    pauseModal: {
      /** العنوان */
      title: 'إيقاف التقييم مؤقتاً',
      /** الرسالة */
      message: 'تم حفظ تقدمك تلقائياً. يمكنك متابعة التقييم لاحقاً.',
      /** متابعة */
      continue: 'متابعة التقييم',
      /** خروج */
      exit: 'خروج',
    },
    /** رسائل الخطأ */
    errors: {
      /** حقل مطلوب */
      required: 'يرجى الإجابة على هذا السؤال قبل المتابعة.',
      /** فشل الإرسال */
      submitFailed: 'فشل في إرسال الإجابة، يرجى المحاولة مرة أخرى.',
      /** فشل التحميل */
      loadFailed: 'فشل في تحميل التقييم، يرجى تحديث الصفحة والمحاولة مرة أخرى.',
    },
  },
  /** 交互式组件 */
  interactive: {
    /** 进度显示 */
    progress: {
      /** 进度文本 */
      text: '{current} / {total}',
      /** 完成百分比 */
      percentage: 'مكتمل {percentage}%',
      /** 剩余时间 */
      timeRemaining: 'الوقت المتبقي المقدر: {time}',
    },
    /** 问题显示 */
    question: {
      /** 问题编号 */
      number: 'السؤال {current} من {total}',
      /** 必答标记 */
      required: '* مطلوب',
      /** 已选择数量 */
      selectedCount: 'تم اختيار {count} عنصر',
      /** 已选择值 */
      selectedValue: 'الاختيار الحالي: {value}',
      /** 文本输入占位符 */
      textPlaceholder: 'يرجى إدخال إجابتك هنا...',
      /** 字符计数 */
      characterCount: 'تم إدخال {count} حرف',
      /** 已输入文本 */
      textEntered: 'تم إدخال الإجابة',
      /** 已回答 */
      answered: 'تمت الإجابة',
      /** 跳过 */
      skip: 'تخطي هذا السؤال',
    },
    /** 导航控制 */
    navigation: {
      /** 上一题 */
      previous: 'السؤال السابق',
      /** 下一题 */
      next: 'السؤال التالي',
      /** 跳转到 */
      goTo: 'الانتقال إلى السؤال {number}',
      /** 问题列表 */
      questionList: 'قائمة الأسئلة',
    },
    /** 会话管理 */
    session: {
      /** 会话状态 */
      status: {
        /** 活跃 */
        active: 'قيد التقدم',
        /** 暂停 */
        paused: 'متوقف مؤقتاً',
        /** 已完成 */
        completed: 'مكتمل',
      },
      /** 自动保存 */
      autoSave: {
        /** 保存中 */
        saving: 'جاري الحفظ...',
        /** 已保存 */
        saved: 'تم الحفظ',
        /** 保存失败 */
        failed: 'فشل في الحفظ',
      },
    },
    /** 结果显示 */
    results: {
      /** 分享选项 */
      share: {
        /** 分享结果 */
        title: 'مشاركة النتائج',
        /** 复制链接 */
        copyLink: 'نسخ الرابط',
        /** 已复制 */
        copied: 'تم النسخ إلى الحافظة',
        /** 下载PDF */
        downloadPdf: 'تحميل PDF',
      },
      /** 图表交互 */
      charts: {
        /** 显示详情 */
        showDetails: 'إظهار التفاصيل',
        /** 隐藏详情 */
        hideDetails: 'إخفاء التفاصيل',
        /** 切换视图 */
        toggleView: 'تبديل العرض',
      },
    },
    /** 历史记录 */
    history: {
      /** 筛选器 */
      filters: {
        /** 应用筛选 */
        apply: 'تطبيق المرشحات',
        /** 清除筛选 */
        clear: 'مسح المرشحات',
        /** 筛选选项 */
        options: 'خيارات المرشح',
      },
      /** 排序 */
      sorting: {
        /** 按日期排序 */
        byDate: 'ترتيب حسب التاريخ',
        /** 按类型排序 */
        byType: 'ترتيب حسب النوع',
        /** 按分数排序 */
        byScore: 'ترتيب حسب النتيجة',
        /** 升序 */
        ascending: 'تصاعدي',
        /** 降序 */
        descending: 'تنازلي',
      },
    },
    /** 问题类型特定交互 */
    questionTypes: {
      /** 单选题 */
      singleChoice: {
        /** 选择提示 */
        selectHint: 'اختر خياراً واحداً',
        /** 已选择 */
        selected: 'مختار',
      },
      /** 多选题 */
      multipleChoice: {
        /** 选择提示 */
        selectHint: 'اختر خياراً واحداً أو أكثر',
        /** 最少选择 */
        minSelect: 'اختر {min} خيارات على الأقل',
        /** 最多选择 */
        maxSelect: 'اختر حتى {max} خيارات',
      },
      /** 量表题 */
      scale: {
        /** 拖拽提示 */
        dragHint: 'اسحب لاختيار القيمة',
        /** 点击提示 */
        clickHint: 'انقر لاختيار القيمة',
        /** 当前值 */
        currentValue: 'القيمة الحالية: {value}',
      },
      /** 文本题 */
      text: {
        /** 输入提示 */
        inputHint: 'أدخل إجابتك',
        /** 字数统计 */
        wordCount: '{count} كلمة',
        /** 建议长度 */
        suggestedLength: 'الطول المقترح: {min}-{max} كلمة',
      },
    },
    /** 辅助功能 */
    accessibility: {
      /** 屏幕阅读器提示 */
      screenReader: {
        /** 问题导航 */
        questionNavigation: 'استخدم مفاتيح الأسهم للتنقل بين الأسئلة',
        /** 进度信息 */
        progressInfo: 'السؤال {current} من {total}، مكتمل {percentage} بالمائة',
        /** 选项描述 */
        optionDescription: 'الخيار {index}: {text}',
        /** 错误信息 */
        errorAnnouncement: 'خطأ: {message}',
      },
      /** 键盘导航 */
      keyboard: {
        /** 导航提示 */
        navigationHint: 'استخدم Tab للتنقل، Enter للاختيار',
        /** 选择提示 */
        selectionHint: 'استخدم مفتاح المسافة لاختيار/إلغاء اختيار الخيارات',
        /** 提交提示 */
        submitHint: 'اضغط Enter لإرسال الإجابة',
      },
    },
  },
};

export default assessmentAr;
