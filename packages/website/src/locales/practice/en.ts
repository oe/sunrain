/**
 * Practice功能英文翻译
 */
import type { IPracticeTranslations } from './types';

export const practiceEn: IPracticeTranslations = {
  // 页面标题和描述
  title: 'Mindfulness Practices',
  description: 'Guided mindfulness exercises for mental well-being',
  'meta.description': 'Discover guided mindfulness practices, breathing exercises, and meditation sessions to improve your mental health and well-being.',
  
  // 导航和按钮
  backToList: 'Back to List',
  startPractice: 'Start Practice',
  pausePractice: 'Pause Practice',
  resumePractice: 'Resume Practice',
  completePractice: 'Complete Practice',
  viewHistory: 'View History',
  quickStart: 'Quick Start',
  
  // 练习状态
  loadingPractice: 'Loading practice...',
  practiceTitle: 'Practice: {name}',
  practiceDescription: 'Follow the guided instructions to complete your mindfulness practice.',
  
  // 历史记录
  historyTitle: 'Practice History',
  historyDescription: 'Track your mindfulness journey and see your progress over time.',
  noHistoryTitle: 'No Practice History Yet',
  noHistoryDescription: 'Start your first mindfulness practice to begin tracking your journey.',
  startFirstPractice: 'Start Your First Practice',
  
  // 练习播放器
  progress: 'Progress',
  previous: 'Previous',
  next: 'Next',
  pause: 'Pause',
  resume: 'Resume',
  settings: 'Settings',
  practiceSettings: 'Practice Settings',
  duration: 'Duration (minutes)',
  backgroundMusic: 'Background Music',
  howAreYouFeeling: 'How are you feeling?',
  rateYourMood: 'Rate your mood before starting',
  
  // 计时器
  completed: 'Completed!',
  paused: 'Paused',
  almostDone: 'Almost done!',
  inProgress: 'In Progress',
  greatJob: 'Great job!',
  practiceCompleted: 'Practice completed.',
  
  // 呼吸练习
  breathingExercise: 'Breathing Exercise',
  breatheIn: 'Breathe In',
  breatheOut: 'Breathe Out',
  followTheCircle: 'Follow the circle as it expands and contracts. Breathe in as it grows, and breathe out as it shrinks.',
  cycleCompleted: 'cycle completed',
  
  // 筛选器
  searchPractices: 'Search practices...',
  filters: 'Filters',
  clearAll: 'Clear all',
  category: 'Category',
  difficulty: 'Difficulty',
  all: 'All',
  short: 'Short (≤5 min)',
  medium: 'Medium (5-15 min)',
  long: 'Long (>15 min)',
  activeFilters: 'Active filters:',
  
  // 难度级别
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  
  // 练习类别
  mindfulness: 'Mindfulness',
  breathing: 'Breathing',
  meditation: 'Meditation',
  relaxation: 'Relaxation',
  movement: 'Movement',
  visualization: 'Visualization',
  
  // 错误消息
  failedToLoadPractice: 'Failed to load practice',
  practiceNotFound: 'Practice not found',
  audioNotSupported: 'Audio not supported in this browser',
  
  // 成功消息
  practiceSaved: 'Practice saved successfully',
  achievementUnlocked: 'Achievement unlocked!',
  
  // 帮助文本
  practiceHelp: 'Choose a practice that suits your current mood and available time.',
  breathingHelp: 'Focus on your breath and follow the visual guide.',
  timerHelp: 'Set a duration that works for you. You can always extend or shorten your practice.',
};

export default practiceEn;
