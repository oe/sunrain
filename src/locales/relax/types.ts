/**
 * Relax功能翻译类型定义
 */
export interface IRelaxTranslations {
  // 页面标题和描述
  title: string;
  description: string;
  'meta.description': string;
  
  // 导航
  backToRelax: string;
  backToPractice: string;
  backToHome: string;
  
  // 白噪音
  whitenoise: {
    title: string;
    description: string;
    start: string;
  };
  
  // 呼吸练习
  breathing: {
    title: string;
    description: string;
    start: string;
  };
  
  // 放松游戏
  games: {
    title: string;
    description: string;
    start: string;
  };
  
  // 白噪音播放器
  whitenoisePlayer: {
    selectTrack: string;
    volume: string;
    timer: string;
    tips: string;
    timeRemaining: string;
    stop: string;
  };
  
  // 呼吸练习
  breathingExercise: {
    selectPattern: string;
    inhale: string;
    exhale: string;
    hold: string;
    followCircle: string;
    cycleCompleted: string;
  };
  
  // 放松游戏
  relaxationGames: {
    coloring: string;
    puzzle: string;
    meditation: string;
  };
}
