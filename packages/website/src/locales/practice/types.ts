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
  category: string;
  difficulty: string;
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
  
  // 错误消息
  failedToLoadPractice: string;
  practiceNotFound: string;
  audioNotSupported: string;
  
  // 成功消息
  practiceSaved: string;
  achievementUnlocked: string;
  
  // 帮助文本
  practiceHelp: string;
  breathingHelp: string;
  timerHelp: string;
}
