/**
 * Practice功能翻译类型定义
 */
export interface IPracticeTranslations {
  // 页面标题和描述
  title: string;
  description: string;
  'meta.description': string;
  
  // 导航和按钮
  backToList: string;
  backToPractice: string;
  startPractice: string;
  pausePractice: string;
  resumePractice: string;
  completePractice: string;
  viewHistory: string;
  quickStart: string;
  
  // 练习状态
  loadingPractice: string;
  practiceTitle: string;
  practiceDescription: string;
  
  // 历史记录
  historyTitle: string;
  historyDescription: string;
  noHistoryTitle: string;
  noHistoryDescription: string;
  startFirstPractice: string;
  
  // 练习播放器
  progress: string;
  previous: string;
  next: string;
  pause: string;
  resume: string;
  reset: string;
  mute: string;
  unmute: string;
  settings: string;
  practiceSettings: string;
  duration: string;
  backgroundMusic: string;
  howAreYouFeeling: string;
  rateYourMood: string;
  
  // 计时器
  completed: string;
  paused: string;
  almostDone: string;
  inProgress: string;
  greatJob: string;
  practiceCompleted: string;
  
  // 练习信息
  quickInfo: string;
  practiceSteps: string;
  benefits: string;
  tips: string;
  difficulty: string;
  category: string;
  targetAudience: string;
  completionRate: string;
  minutes: string;
  
  // 呼吸练习
  breathingExercise: string;
  breatheIn: string;
  breatheOut: string;
  followTheCircle: string;
  cycleCompleted: string;
  
  // 筛选器
  searchPractices: string;
  filters: string;
  clearAll: string;
  filterCategory: string;
  filterDifficulty: string;
  all: string;
  short: string;
  medium: string;
  long: string;
  activeFilters: string;
  
  // 难度级别
  beginner: string;
  intermediate: string;
  advanced: string;
  
  // 练习类别
  mindfulness: string;
  breathing: string;
  meditation: string;
  relaxation: string;
  movement: string;
  visualization: string;
  
  // 标签翻译
  tags: {
    breathing: string;
    mindfulness: string;
    relaxation: string;
    beginner: string;
    meditation: string;
    'body-scan': string;
    sleep: string;
    compassion: string;
    'loving-kindness': string;
    heart: string;
    intermediate: string;
  };
  
  // 错误消息
  failedToLoadPractice: string;
  practiceNotFound: string;
  audioNotSupported: string;
  
  // 成功消息
  practiceSaved: string;
  achievementUnlocked: string;
  
  // 确认对话框
  durationChangeTitle: string;
  durationChangeMessage: string;
  durationChangeCancel: string;
  durationChangeConfirm: string;
  
  // 帮助文本
  practiceHelp: string;
  breathingHelp: string;
  timerHelp: string;
}
