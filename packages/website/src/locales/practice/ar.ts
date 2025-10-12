/**
 * Practice功能阿拉伯语翻译
 */
import type { IPracticeTranslations } from './types';

export const practiceAr: IPracticeTranslations = {
  // 页面标题和描述
  title: 'ممارسات اليقظة الذهنية',
  description: 'تمارين اليقظة الذهنية الموجهة للرفاهية النفسية',
  'meta.description': 'اكتشف ممارسات اليقظة الذهنية الموجهة وتمارين التنفس وجلسات التأمل لتحسين صحتك النفسية ورفاهيتك.',
  
  // 导航和按钮
  backToList: 'العودة إلى القائمة',
  startPractice: 'بدء الممارسة',
  pausePractice: 'إيقاف الممارسة مؤقتاً',
  resumePractice: 'استئناف الممارسة',
  completePractice: 'إكمال الممارسة',
  viewHistory: 'عرض السجل',
  quickStart: 'بداية سريعة',
  
  // 练习状态
  loadingPractice: 'جاري تحميل الممارسة...',
  practiceTitle: 'الممارسة: {name}',
  practiceDescription: 'اتبع التعليمات الموجهة لإكمال ممارسة اليقظة الذهنية الخاصة بك.',
  
  // 历史记录
  historyTitle: 'سجل الممارسات',
  historyDescription: 'تتبع رحلة اليقظة الذهنية الخاصة بك وشاهد تقدمك مع مرور الوقت.',
  noHistoryTitle: 'لا يوجد سجل ممارسات بعد',
  noHistoryDescription: 'ابدأ أول ممارسة لليقظة الذهنية لبدء تتبع رحلتك.',
  startFirstPractice: 'ابدأ أول ممارسة لك',
  
  // 练习播放器
  progress: 'التقدم',
  previous: 'السابق',
  next: 'التالي',
  pause: 'إيقاف مؤقت',
  resume: 'استئناف',
  settings: 'الإعدادات',
  practiceSettings: 'إعدادات الممارسة',
  duration: 'المدة (بالدقائق)',
  backgroundMusic: 'الموسيقى الخلفية',
  howAreYouFeeling: 'كيف تشعر؟',
  rateYourMood: 'قيم مزاجك قبل البدء',
  
  // 计时器
  completed: 'مكتمل!',
  paused: 'متوقف مؤقتاً',
  almostDone: 'تقريباً انتهى!',
  inProgress: 'قيد التقدم',
  greatJob: 'عمل رائع!',
  practiceCompleted: 'تم إكمال الممارسة.',
  quickStart: 'بداية سريعة',
  
  // 呼吸练习
  breathingExercise: 'تمرين التنفس',
  breatheIn: 'شهيق',
  breatheOut: 'زفير',
  followTheCircle: 'اتبع الدائرة وهي تتوسع وتتقلص. استنشق عندما تكبر وازفر عندما تصغر.',
  cycleCompleted: 'دورة مكتملة',
  
  // 筛选器
  searchPractices: 'البحث في الممارسات...',
  filters: 'المرشحات',
  clearAll: 'مسح الكل',
  category: 'الفئة',
  difficulty: 'الصعوبة',
  duration: 'المدة',
  all: 'الكل',
  short: 'قصيرة (≤5 دقائق)',
  medium: 'متوسطة (5-15 دقيقة)',
  long: 'طويلة (>15 دقيقة)',
  activeFilters: 'المرشحات النشطة:',
  
  // 难度级别
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  
  // 练习类别
  mindfulness: 'اليقظة الذهنية',
  breathing: 'التنفس',
  meditation: 'التأمل',
  relaxation: 'الاسترخاء',
  movement: 'الحركة',
  visualization: 'التصور',
  
  // 错误消息
  failedToLoadPractice: 'فشل في تحميل الممارسة',
  practiceNotFound: 'لم يتم العثور على الممارسة',
  audioNotSupported: 'الصوت غير مدعوم في هذا المتصفح',
  
  // 成功消息
  practiceSaved: 'تم حفظ الممارسة بنجاح',
  achievementUnlocked: 'تم فتح الإنجاز!',
  
  // 帮助文本
  practiceHelp: 'اختر ممارسة تناسب مزاجك الحالي والوقت المتاح لديك.',
  breathingHelp: 'ركز على تنفسك واتبع الدليل البصري.',
  timerHelp: 'اضبط مدة تناسبك. يمكنك دائماً تمديد أو تقصير ممارستك.',
};

export default practiceAr;
