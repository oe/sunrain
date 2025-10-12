/**
 * Practice功能韩语翻译
 */
import type { IPracticeTranslations } from './types';

export const practiceKo: IPracticeTranslations = {
  // 页面标题和描述
  title: '마인드풀니스 실천',
  description: '정신 건강을 위한 가이드 마인드풀니스 실천',
  'meta.description': '정신 건강과 웰빙 향상을 위한 가이드 마인드풀니스 실천, 호흡 운동, 명상 세션을 발견하세요.',
  
  // 导航和按钮
  backToList: '목록으로 돌아가기',
  startPractice: '실천 시작',
  pausePractice: '실천 일시정지',
  resumePractice: '실천 재개',
  completePractice: '실천 완료',
  viewHistory: '기록 보기',
  quickStart: '빠른 시작',
  
  // 练习状态
  loadingPractice: '실천을 불러오는 중...',
  practiceTitle: '실천: {name}',
  practiceDescription: '마인드풀니스 실천을 완료하기 위해 가이드 지시사항을 따르세요.',
  
  // 历史记录
  historyTitle: '실천 기록',
  historyDescription: '마인드풀니스 여정을 추적하고 시간이 지남에 따른 진전을 확인하세요.',
  noHistoryTitle: '아직 실천 기록이 없습니다',
  noHistoryDescription: '여정을 추적하기 시작하려면 첫 번째 마인드풀니스 실천을 시작하세요.',
  startFirstPractice: '첫 번째 실천 시작',
  
  // 练习播放器
  progress: '진행률',
  previous: '이전',
  next: '다음',
  pause: '일시정지',
  resume: '재개',
  settings: '설정',
  practiceSettings: '실천 설정',
  duration: '시간 (분)',
  backgroundMusic: '배경음악',
  howAreYouFeeling: '지금 기분이 어떠신가요?',
  rateYourMood: '시작하기 전에 기분을 평가해주세요',
  
  // 计时器
  completed: '완료!',
  paused: '일시정지됨',
  almostDone: '거의 완료!',
  inProgress: '진행 중',
  greatJob: '훌륭합니다!',
  practiceCompleted: '실천이 완료되었습니다.',
  quickStart: '빠른 시작',
  
  // 呼吸练习
  breathingExercise: '호흡 운동',
  breatheIn: '들숨',
  breatheOut: '날숨',
  followTheCircle: '원이 확장되고 수축하는 것을 따라하세요. 커질 때 들숨을 쉬고, 작아질 때 날숨을 쉬세요.',
  cycleCompleted: '사이클 완료',
  
  // 筛选器
  searchPractices: '실천 검색...',
  filters: '필터',
  clearAll: '모두 지우기',
  category: '카테고리',
  difficulty: '난이도',
  duration: '시간',
  all: '모두',
  short: '짧음 (≤5분)',
  medium: '보통 (5-15분)',
  long: '김 (>15분)',
  activeFilters: '활성 필터:',
  
  // 难度级别
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
  
  // 练习类别
  mindfulness: '마인드풀니스',
  breathing: '호흡',
  meditation: '명상',
  relaxation: '이완',
  movement: '움직임',
  visualization: '시각화',
  
  // 错误消息
  failedToLoadPractice: '실천을 불러오는데 실패했습니다',
  practiceNotFound: '실천을 찾을 수 없습니다',
  audioNotSupported: '이 브라우저에서는 오디오가 지원되지 않습니다',
  
  // 成功消息
  practiceSaved: '실천이 성공적으로 저장되었습니다',
  achievementUnlocked: '업적이 해제되었습니다!',
  
  // 帮助文本
  practiceHelp: '현재 기분과 사용 가능한 시간에 맞는 실천을 선택하세요.',
  breathingHelp: '호흡에 집중하고 시각적 가이드를 따라하세요.',
  timerHelp: '자신에게 맞는 시간을 설정하세요. 언제든지 실천 시간을 연장하거나 단축할 수 있습니다.',
};

export default practiceKo;
