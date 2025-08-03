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
};

export default assessmentAr;
