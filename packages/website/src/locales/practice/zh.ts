/**
 * Practice功能中文翻译
 */
import type { IPracticeTranslations } from './types';

export const practiceZh: IPracticeTranslations = {
  // 页面标题和描述
  title: '正念练习',
  description: '引导式正念练习，提升心理健康',
  'meta.description': '发现引导式正念练习、呼吸练习和冥想课程，改善您的心理健康和幸福感。',
  
  // 导航和按钮
  backToList: '返回列表',
  startPractice: '开始练习',
  pausePractice: '暂停练习',
  resumePractice: '继续练习',
  completePractice: '完成练习',
  viewHistory: '查看历史',
  quickStart: '快速开始',
  
  // 练习状态
  loadingPractice: '正在加载练习...',
  practiceTitle: '练习：{name}',
  practiceDescription: '按照引导说明完成您的正念练习。',
  
  // 历史记录
  historyTitle: '练习历史',
  historyDescription: '追踪您的正念之旅，查看您的进步历程。',
  noHistoryTitle: '暂无练习历史',
  noHistoryDescription: '开始您的第一个正念练习，开始追踪您的旅程。',
  startFirstPractice: '开始您的第一个练习',
  
  // 练习播放器
  progress: '进度',
  previous: '上一步',
  next: '下一步',
  pause: '暂停',
  resume: '继续',
  settings: '设置',
  practiceSettings: '练习设置',
  duration: '时长（分钟）',
  backgroundMusic: '背景音乐',
  howAreYouFeeling: '您现在感觉如何？',
  rateYourMood: '开始前请评估您的心情',
  
  // 计时器
  completed: '已完成！',
  paused: '已暂停',
  almostDone: '快完成了！',
  inProgress: '进行中',
  greatJob: '太棒了！',
  practiceCompleted: '练习已完成。',
  quickStart: '快速开始',
  
  // 呼吸练习
  breathingExercise: '呼吸练习',
  breatheIn: '吸气',
  breatheOut: '呼气',
  followTheCircle: '跟随圆圈的变化。圆圈扩大时吸气，缩小时呼气。',
  cycleCompleted: '个周期已完成',
  
  // 筛选器
  searchPractices: '搜索练习...',
  filters: '筛选',
  clearAll: '清除全部',
  category: '类别',
  difficulty: '难度',
  duration: '时长',
  all: '全部',
  short: '短时（≤5分钟）',
  medium: '中等（5-15分钟）',
  long: '长时（>15分钟）',
  activeFilters: '活跃筛选：',
  
  // 难度级别
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
  
  // 练习类别
  mindfulness: '正念',
  breathing: '呼吸',
  meditation: '冥想',
  relaxation: '放松',
  movement: '运动',
  visualization: '想象',
  
  // 错误消息
  failedToLoadPractice: '加载练习失败',
  practiceNotFound: '未找到练习',
  audioNotSupported: '此浏览器不支持音频',
  
  // 成功消息
  practiceSaved: '练习保存成功',
  achievementUnlocked: '成就解锁！',
  
  // 帮助文本
  practiceHelp: '选择适合您当前心情和可用时间的练习。',
  breathingHelp: '专注于您的呼吸，跟随视觉引导。',
  timerHelp: '设置适合您的时长。您可以随时延长或缩短练习时间。',
};

export default practiceZh;
