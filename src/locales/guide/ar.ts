/**
 * 指南页面阿拉伯文翻译内容
 */
import type { IGuideTranslations } from './types';

export const guideAr: IGuideTranslations = {
  page: {
    title: 'دليل المساعدة الذاتية للصحة النفسية',
    subtitle: 'موارد عملية للقلق والنوم والإدارة العاطفية',
    description: 'استكشف مجموعتنا الشاملة من أدلة الصحة النفسية التي تغطي القلق والاكتئاب ومشاكل النوم والتنظيم العاطفي.',
  },
  list: {
    viewAll: 'عرض جميع الأدلة',
    noGuides: 'لا توجد أدلة متاحة في الوقت الحالي.',
    loading: 'جاري تحميل الأدلة...',
    featured: 'الأدلة المميزة',
    allGuides: 'جميع الأدلة',
    featuredTag: 'مميز',
  },
  detail: {
    publishedOn: 'نُشر في',
    updatedOn: 'تم التحديث في',
    author: 'المؤلف',
    tags: 'العلامات',
    tableOfContents: 'جدول المحتويات',
    shareGuide: 'شارك هذا الدليل',
  },
  navigation: {
    previous: 'السابق',
    next: 'التالي',
    backToGuides: 'العودة إلى الأدلة',
  },
  actions: {
    readMore: 'اقرأ المزيد',
    backTo: 'العودة إلى',
    print: 'طباعة',
    share: 'مشاركة',
  },
  help: {
    needMoreHelp: 'تحتاج المزيد من المساعدة؟',
    helpDescription: 'إذا كنت تتعامل مع أزمة صحة نفسية أو تحتاج إلى دعم فوري، فلا تتردد في طلب المساعدة المهنية.',
    exploreResources: 'استكشف الموارد',
    getEmergencyHelp: 'احصل على مساعدة طارئة',
  },
  empty: {
    noGuidesAvailable: 'لا توجد أدلة متاحة',
    emptyDescription: 'تحقق مرة أخرى قريباً للحصول على أدلة وموارد صحة نفسية جديدة.',
  },
};

export default guideAr;