/**
 * Practice功能印地语翻译
 */
import type { IPracticeTranslations } from './types';

export const practiceHi: IPracticeTranslations = {
  // 页面标题和描述
  title: 'माइंडफुलनेस अभ्यास',
  description: 'मानसिक कल्याण के लिए निर्देशित माइंडफुलनेस अभ्यास',
  'meta.description': 'अपने मानसिक स्वास्थ्य और कल्याण में सुधार के लिए निर्देशित माइंडफुलनेस अभ्यास, सांस लेने के व्यायाम और ध्यान सत्र खोजें।',
  
  // 导航和按钮
  backToList: 'सूची पर वापस जाएं',
  startPractice: 'अभ्यास शुरू करें',
  pausePractice: 'अभ्यास रोकें',
  resumePractice: 'अभ्यास जारी रखें',
  completePractice: 'अभ्यास पूरा करें',
  viewHistory: 'इतिहास देखें',
  quickStart: 'त्वरित शुरुआत',
  
  // 练习状态
  loadingPractice: 'अभ्यास लोड हो रहा है...',
  practiceTitle: 'अभ्यास: {name}',
  practiceDescription: 'अपना माइंडफुलनेस अभ्यास पूरा करने के लिए निर्देशित निर्देशों का पालन करें।',
  
  // 历史记录
  historyTitle: 'अभ्यास इतिहास',
  historyDescription: 'अपनी माइंडफुलनेस यात्रा को ट्रैक करें और समय के साथ अपनी प्रगति देखें।',
  noHistoryTitle: 'अभी तक कोई अभ्यास इतिहास नहीं',
  noHistoryDescription: 'अपनी यात्रा को ट्रैक करना शुरू करने के लिए अपना पहला माइंडफुलनेस अभ्यास शुरू करें।',
  startFirstPractice: 'अपना पहला अभ्यास शुरू करें',
  
  // 练习播放器
  progress: 'प्रगति',
  previous: 'पिछला',
  next: 'अगला',
  pause: 'रोकें',
  resume: 'जारी रखें',
  settings: 'सेटिंग्स',
  practiceSettings: 'अभ्यास सेटिंग्स',
  duration: 'अवधि (मिनट)',
  backgroundMusic: 'पृष्ठभूमि संगीत',
  howAreYouFeeling: 'आप कैसा महसूस कर रहे हैं?',
  rateYourMood: 'शुरू करने से पहले अपने मूड का मूल्यांकन करें',
  
  // 计时器
  completed: 'पूरा!',
  paused: 'रोका गया',
  almostDone: 'लगभग हो गया!',
  inProgress: 'प्रगति में',
  greatJob: 'बहुत बढ़िया!',
  practiceCompleted: 'अभ्यास पूरा हो गया।',
  quickStart: 'त्वरित शुरुआत',
  
  // 呼吸练习
  breathingExercise: 'सांस लेने का व्यायाम',
  breatheIn: 'सांस अंदर लें',
  breatheOut: 'सांस बाहर छोड़ें',
  followTheCircle: 'वृत्त का पालन करें जैसे यह फैलता और सिकुड़ता है। जब यह बढ़ता है तो सांस अंदर लें और जब यह सिकुड़ता है तो सांस बाहर छोड़ें।',
  cycleCompleted: 'चक्र पूरा',
  
  // 筛选器
  searchPractices: 'अभ्यास खोजें...',
  filters: 'फिल्टर',
  clearAll: 'सभी साफ करें',
  category: 'श्रेणी',
  difficulty: 'कठिनाई',
  duration: 'अवधि',
  all: 'सभी',
  short: 'छोटा (≤5 मिनट)',
  medium: 'मध्यम (5-15 मिनट)',
  long: 'लंबा (>15 मिनट)',
  activeFilters: 'सक्रिय फिल्टर:',
  
  // 难度级别
  beginner: 'शुरुआती',
  intermediate: 'मध्यवर्ती',
  advanced: 'उन्नत',
  
  // 练习类别
  mindfulness: 'माइंडफुलनेस',
  breathing: 'सांस लेना',
  meditation: 'ध्यान',
  relaxation: 'आराम',
  movement: 'गति',
  visualization: 'कल्पना',
  
  // 错误消息
  failedToLoadPractice: 'अभ्यास लोड करने में विफल',
  practiceNotFound: 'अभ्यास नहीं मिला',
  audioNotSupported: 'इस ब्राउज़र में ऑडियो समर्थित नहीं है',
  
  // 成功消息
  practiceSaved: 'अभ्यास सफलतापूर्वक सहेजा गया',
  achievementUnlocked: 'उपलब्धि अनलॉक!',
  
  // 帮助文本
  practiceHelp: 'एक अभ्यास चुनें जो आपके वर्तमान मूड और उपलब्ध समय के अनुकूल हो।',
  breathingHelp: 'अपनी सांस पर ध्यान केंद्रित करें और दृश्य मार्गदर्शिका का पालन करें।',
  timerHelp: 'एक अवधि निर्धारित करें जो आपके लिए काम करे। आप हमेशा अपने अभ्यास को बढ़ा या घटा सकते हैं।',
};

export default practiceHi;
