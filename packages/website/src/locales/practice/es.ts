/**
 * Practice功能西班牙语翻译
 */
import type { IPracticeTranslations } from './types';

export const practiceEs: IPracticeTranslations = {
  // 页面标题和描述
  title: 'Prácticas de Mindfulness',
  description: 'Ejercicios guiados de mindfulness para el bienestar mental',
  'meta.description': 'Descubre prácticas guiadas de mindfulness, ejercicios de respiración y sesiones de meditación para mejorar tu salud mental y bienestar.',
  
  // 导航和按钮
  backToList: 'Volver a la Lista',
  startPractice: 'Iniciar Práctica',
  pausePractice: 'Pausar Práctica',
  resumePractice: 'Reanudar Práctica',
  completePractice: 'Completar Práctica',
  viewHistory: 'Ver Historial',
  quickStart: 'Inicio Rápido',
  
  // 练习状态
  loadingPractice: 'Cargando práctica...',
  practiceTitle: 'Práctica: {name}',
  practiceDescription: 'Sigue las instrucciones guiadas para completar tu práctica de mindfulness.',
  
  // 历史记录
  historyTitle: 'Historial de Prácticas',
  historyDescription: 'Rastrea tu viaje de mindfulness y ve tu progreso a lo largo del tiempo.',
  noHistoryTitle: 'Aún No Hay Historial de Prácticas',
  noHistoryDescription: 'Comienza tu primera práctica de mindfulness para empezar a rastrear tu viaje.',
  startFirstPractice: 'Inicia Tu Primera Práctica',
  
  // 练习播放器
  progress: 'Progreso',
  previous: 'Anterior',
  next: 'Siguiente',
  pause: 'Pausar',
  resume: 'Reanudar',
  settings: 'Configuración',
  practiceSettings: 'Configuración de Práctica',
  duration: 'Duración (minutos)',
  backgroundMusic: 'Música de Fondo',
  howAreYouFeeling: '¿Cómo te sientes?',
  rateYourMood: 'Evalúa tu estado de ánimo antes de comenzar',
  
  // 计时器
  completed: '¡Completado!',
  paused: 'Pausado',
  almostDone: '¡Casi terminado!',
  inProgress: 'En Progreso',
  greatJob: '¡Excelente trabajo!',
  practiceCompleted: 'Práctica completada.',
  quickStart: 'Inicio Rápido',
  
  // 呼吸练习
  breathingExercise: 'Ejercicio de Respiración',
  breatheIn: 'Inhalar',
  breatheOut: 'Exhalar',
  followTheCircle: 'Sigue el círculo mientras se expande y contrae. Inhala cuando crece y exhala cuando se encoge.',
  cycleCompleted: 'ciclo completado',
  
  // 筛选器
  searchPractices: 'Buscar prácticas...',
  filters: 'Filtros',
  clearAll: 'Limpiar todo',
  category: 'Categoría',
  difficulty: 'Dificultad',
  duration: 'Duración',
  all: 'Todas',
  short: 'Corta (≤5 min)',
  medium: 'Media (5-15 min)',
  long: 'Larga (>15 min)',
  activeFilters: 'Filtros activos:',
  
  // 难度级别
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  
  // 练习类别
  mindfulness: 'Mindfulness',
  breathing: 'Respiración',
  meditation: 'Meditación',
  relaxation: 'Relajación',
  movement: 'Movimiento',
  visualization: 'Visualización',
  
  // 错误消息
  failedToLoadPractice: 'Error al cargar la práctica',
  practiceNotFound: 'Práctica no encontrada',
  audioNotSupported: 'Audio no compatible en este navegador',
  
  // 成功消息
  practiceSaved: 'Práctica guardada exitosamente',
  achievementUnlocked: '¡Logro desbloqueado!',
  
  // 帮助文本
  practiceHelp: 'Elige una práctica que se adapte a tu estado de ánimo actual y tiempo disponible.',
  breathingHelp: 'Enfócate en tu respiración y sigue la guía visual.',
  timerHelp: 'Establece una duración que funcione para ti. Siempre puedes extender o acortar tu práctica.',
};

export default practiceEs;
