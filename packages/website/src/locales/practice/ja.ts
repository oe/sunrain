/**
 * Practice功能日语翻译
 */
import type { IPracticeTranslations } from './types';

export const practiceJa: IPracticeTranslations = {
  // 页面标题和描述
  title: 'マインドフルネス実践',
  description: 'メンタルヘルスのためのガイド付きマインドフルネス実践',
  'meta.description': 'メンタルヘルスとウェルビーイングの向上のためのガイド付きマインドフルネス実践、呼吸エクササイズ、瞑想セッションを見つけましょう。',
  
  // 导航和按钮
  backToList: 'リストに戻る',
  startPractice: '実践を開始',
  pausePractice: '実践を一時停止',
  resumePractice: '実践を再開',
  completePractice: '実践を完了',
  viewHistory: '履歴を表示',
  quickStart: 'クイックスタート',
  
  // 练习状态
  loadingPractice: '実践を読み込み中...',
  practiceTitle: '実践：{name}',
  practiceDescription: 'マインドフルネス実践を完了するためにガイド付きの指示に従ってください。',
  
  // 历史记录
  historyTitle: '実践履歴',
  historyDescription: 'マインドフルネスの旅を追跡し、時間の経過とともに進歩を確認してください。',
  noHistoryTitle: 'まだ実践履歴がありません',
  noHistoryDescription: '旅を追跡し始めるために最初のマインドフルネス実践を開始してください。',
  startFirstPractice: '最初の実践を開始',
  
  // 练习播放器
  progress: '進捗',
  previous: '前へ',
  next: '次へ',
  pause: '一時停止',
  resume: '再開',
  settings: '設定',
  practiceSettings: '実践設定',
  duration: '時間（分）',
  backgroundMusic: 'バックグラウンドミュージック',
  howAreYouFeeling: '今の気分はいかがですか？',
  rateYourMood: '開始前に気分を評価してください',
  
  // 计时器
  completed: '完了！',
  paused: '一時停止中',
  almostDone: 'もうすぐ完了！',
  inProgress: '進行中',
  greatJob: '素晴らしい！',
  practiceCompleted: '実践が完了しました。',
  quickStart: 'クイックスタート',
  
  // 呼吸练习
  breathingExercise: '呼吸エクササイズ',
  breatheIn: '吸う',
  breatheOut: '吐く',
  followTheCircle: '円が拡大・収縮するのに従ってください。大きくなる時に吸い、小さくなる時に吐いてください。',
  cycleCompleted: 'サイクル完了',
  
  // 筛选器
  searchPractices: '実践を検索...',
  filters: 'フィルター',
  clearAll: 'すべてクリア',
  category: 'カテゴリー',
  difficulty: '難易度',
  duration: '時間',
  all: 'すべて',
  short: '短時間（≤5分）',
  medium: '中時間（5-15分）',
  long: '長時間（>15分）',
  activeFilters: 'アクティブフィルター：',
  
  // 难度级别
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
  
  // 练习类别
  mindfulness: 'マインドフルネス',
  breathing: '呼吸',
  meditation: '瞑想',
  relaxation: 'リラクゼーション',
  movement: 'ムーブメント',
  visualization: 'ビジュアライゼーション',
  
  // 错误消息
  failedToLoadPractice: '実践の読み込みに失敗しました',
  practiceNotFound: '実践が見つかりません',
  audioNotSupported: 'このブラウザでは音声がサポートされていません',
  
  // 成功消息
  practiceSaved: '実践が正常に保存されました',
  achievementUnlocked: '実績が解除されました！',
  
  // 帮助文本
  practiceHelp: '現在の気分と利用可能な時間に合った実践を選択してください。',
  breathingHelp: '呼吸に集中し、視覚的なガイドに従ってください。',
  timerHelp: '自分に合った時間を設定してください。いつでも実践時間を延長または短縮できます。',
};

export default practiceJa;
