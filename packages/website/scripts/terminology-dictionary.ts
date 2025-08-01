/**
 * 专业术语词典
 * 确保所有翻译中专业术语的一致性
 */

export interface TerminologyEntry {
  // 是否应该翻译
  shouldTranslate: boolean;
  // 各语言的标准翻译
  translations?: Record<string, string>;
  // 备选翻译（用于检测不一致）
  alternatives?: string[];
  // 术语说明
  description?: string;
  // 使用场景
  context?: string[];
}

export const TERMINOLOGY_DICTIONARY: Record<string, TerminologyEntry> = {
  // 技术术语 - 不应翻译
  API: {
    shouldTranslate: false,
    description: "Application Programming Interface",
    context: ["technical", "development"],
  },
  GitHub: {
    shouldTranslate: false,
    description: "代码托管平台名称",
    context: ["platform", "development"],
  },
  JavaScript: {
    shouldTranslate: false,
    description: "编程语言名称",
    context: ["technical", "development"],
  },
  TypeScript: {
    shouldTranslate: false,
    description: "编程语言名称",
    context: ["technical", "development"],
  },
  React: {
    shouldTranslate: false,
    description: "前端框架名称",
    context: ["technical", "development"],
  },
  "Node.js": {
    shouldTranslate: false,
    description: "运行时环境名称",
    context: ["technical", "development"],
  },
  npm: {
    shouldTranslate: false,
    description: "包管理器名称",
    context: ["technical", "development"],
  },
  JSON: {
    shouldTranslate: false,
    description: "数据格式名称",
    context: ["technical", "data"],
  },
  HTML: {
    shouldTranslate: false,
    description: "标记语言名称",
    context: ["technical", "web"],
  },
  CSS: {
    shouldTranslate: false,
    description: "样式表语言名称",
    context: ["technical", "web"],
  },
  URL: {
    shouldTranslate: false,
    description: "统一资源定位符",
    context: ["technical", "web"],
  },
  HTTP: {
    shouldTranslate: false,
    description: "超文本传输协议",
    context: ["technical", "web"],
  },
  HTTPS: {
    shouldTranslate: false,
    description: "安全超文本传输协议",
    context: ["technical", "web"],
  },
  OAuth: {
    shouldTranslate: false,
    description: "开放授权协议",
    context: ["technical", "security"],
  },
  JWT: {
    shouldTranslate: false,
    description: "JSON Web Token",
    context: ["technical", "security"],
  },

  // 品牌名称 - 不应翻译
  Spotify: {
    shouldTranslate: false,
    description: "音乐流媒体平台",
    context: ["platform", "music"],
  },
  YouTube: {
    shouldTranslate: false,
    description: "视频分享平台",
    context: ["platform", "video"],
  },
  Amazon: {
    shouldTranslate: false,
    description: "电商平台",
    context: ["platform", "commerce"],
  },
  Goodreads: {
    shouldTranslate: false,
    description: "读书社交平台",
    context: ["platform", "books"],
  },
  Google: {
    shouldTranslate: false,
    description: "搜索引擎公司",
    context: ["platform", "search"],
  },
  Microsoft: {
    shouldTranslate: false,
    description: "软件公司",
    context: ["platform", "software"],
  },
  Apple: {
    shouldTranslate: false,
    description: "科技公司",
    context: ["platform", "technology"],
  },
  Netflix: {
    shouldTranslate: false,
    description: "流媒体平台",
    context: ["platform", "entertainment"],
  },

  // 心理健康专业术语 - 应该翻译
  Assessment: {
    shouldTranslate: true,
    translations: {
      zh: "评估",
      es: "Evaluación",
      ja: "アセスメント",
      ko: "평가",
      hi: "मूल्यांकन",
      ar: "التقييم",
    },
    description: "心理健康评估",
    context: ["mental_health", "evaluation"],
  },
  "Mental Health": {
    shouldTranslate: true,
    translations: {
      zh: "心理健康",
      es: "Salud Mental",
      ja: "メンタルヘルス",
      ko: "정신 건강",
      hi: "मानसिक स्वास्थ्य",
      ar: "الصحة النفسية",
    },
    description: "心理健康状态",
    context: ["mental_health", "wellness"],
  },
  Anxiety: {
    shouldTranslate: true,
    translations: {
      zh: "焦虑",
      es: "Ansiedad",
      ja: "不安",
      ko: "불안",
      hi: "चिंता",
      ar: "القلق",
    },
    description: "焦虑情绪或障碍",
    context: ["mental_health", "emotion"],
  },
  Depression: {
    shouldTranslate: true,
    translations: {
      zh: "抑郁",
      es: "Depresión",
      ja: "うつ病",
      ko: "우울증",
      hi: "अवसाद",
      ar: "الاكتئاب",
    },
    description: "抑郁情绪或障碍",
    context: ["mental_health", "emotion"],
  },
  Stress: {
    shouldTranslate: true,
    translations: {
      zh: "压力",
      es: "Estrés",
      ja: "ストレス",
      ko: "스트레스",
      hi: "तनाव",
      ar: "الضغط النفسي",
    },
    description: "心理或生理压力",
    context: ["mental_health", "emotion"],
  },
  Mindfulness: {
    shouldTranslate: true,
    translations: {
      zh: "正念",
      es: "Atención Plena",
      ja: "マインドフルネス",
      ko: "마음챙김",
      hi: "सचेतता",
      ar: "اليقظة الذهنية",
    },
    description: "正念冥想练习",
    context: ["mental_health", "practice"],
  },
  Meditation: {
    shouldTranslate: true,
    translations: {
      zh: "冥想",
      es: "Meditación",
      ja: "瞑想",
      ko: "명상",
      hi: "ध्यान",
      ar: "التأمل",
    },
    description: "冥想练习",
    context: ["mental_health", "practice"],
  },
  Therapy: {
    shouldTranslate: true,
    translations: {
      zh: "治疗",
      es: "Terapia",
      ja: "セラピー",
      ko: "치료",
      hi: "चिकित्सा",
      ar: "العلاج",
    },
    description: "心理治疗",
    context: ["mental_health", "treatment"],
  },
  Counseling: {
    shouldTranslate: true,
    translations: {
      zh: "咨询",
      es: "Consejería",
      ja: "カウンセリング",
      ko: "상담",
      hi: "परामर्श",
      ar: "الاستشارة",
    },
    description: "心理咨询",
    context: ["mental_health", "support"],
  },
  "Self-Care": {
    shouldTranslate: true,
    translations: {
      zh: "自我关怀",
      es: "Autocuidado",
      ja: "セルフケア",
      ko: "자기 관리",
      hi: "स्व-देखभाल",
      ar: "الرعاية الذاتية",
    },
    description: "自我照顾和关怀",
    context: ["mental_health", "wellness"],
  },
  Wellness: {
    shouldTranslate: true,
    translations: {
      zh: "健康",
      es: "Bienestar",
      ja: "ウェルネス",
      ko: "웰빙",
      hi: "कल्याण",
      ar: "العافية",
    },
    description: "整体健康状态",
    context: ["mental_health", "wellness"],
  },
  Resilience: {
    shouldTranslate: true,
    translations: {
      zh: "韧性",
      es: "Resistencia",
      ja: "レジリエンス",
      ko: "회복력",
      hi: "लचीलापन",
      ar: "المرونة",
    },
    description: "心理韧性和恢复力",
    context: ["mental_health", "strength"],
  },

  // 通用术语 - 应该翻译
  Error: {
    shouldTranslate: true,
    translations: {
      zh: "错误",
      es: "Error",
      ja: "エラー",
      ko: "오류",
      hi: "त्रुटि",
      ar: "خطأ",
    },
    description: "系统错误信息",
    context: ["ui", "system"],
  },
  Loading: {
    shouldTranslate: true,
    translations: {
      zh: "加载中",
      es: "Cargando",
      ja: "読み込み中",
      ko: "로딩 중",
      hi: "लोड हो रहा है",
      ar: "جاري التحميل",
    },
    description: "加载状态提示",
    context: ["ui", "system"],
  },
  Success: {
    shouldTranslate: true,
    translations: {
      zh: "成功",
      es: "Éxito",
      ja: "成功",
      ko: "성공",
      hi: "सफलता",
      ar: "نجح",
    },
    description: "成功状态提示",
    context: ["ui", "system"],
  },
  Cancel: {
    shouldTranslate: true,
    translations: {
      zh: "取消",
      es: "Cancelar",
      ja: "キャンセル",
      ko: "취소",
      hi: "रद्द करें",
      ar: "إلغاء",
    },
    description: "取消操作按钮",
    context: ["ui", "action"],
  },
  Confirm: {
    shouldTranslate: true,
    translations: {
      zh: "确认",
      es: "Confirmar",
      ja: "確認",
      ko: "확인",
      hi: "पुष्टि करें",
      ar: "تأكيد",
    },
    description: "确认操作按钮",
    context: ["ui", "action"],
  },
  Save: {
    shouldTranslate: true,
    translations: {
      zh: "保存",
      es: "Guardar",
      ja: "保存",
      ko: "저장",
      hi: "सहेजें",
      ar: "حفظ",
    },
    description: "保存操作按钮",
    context: ["ui", "action"],
  },
  Delete: {
    shouldTranslate: true,
    translations: {
      zh: "删除",
      es: "Eliminar",
      ja: "削除",
      ko: "삭제",
      hi: "हटाएं",
      ar: "حذف",
    },
    description: "删除操作按钮",
    context: ["ui", "action"],
  },
  Edit: {
    shouldTranslate: true,
    translations: {
      zh: "编辑",
      es: "Editar",
      ja: "編集",
      ko: "편집",
      hi: "संपादित करें",
      ar: "تحرير",
    },
    description: "编辑操作按钮",
    context: ["ui", "action"],
  },
  Share: {
    shouldTranslate: true,
    translations: {
      zh: "分享",
      es: "Compartir",
      ja: "共有",
      ko: "공유",
      hi: "साझा करें",
      ar: "مشاركة",
    },
    description: "分享操作按钮",
    context: ["ui", "action"],
  },
  Export: {
    shouldTranslate: true,
    translations: {
      zh: "导出",
      es: "Exportar",
      ja: "エクスポート",
      ko: "내보내기",
      hi: "निर्यात",
      ar: "تصدير",
    },
    description: "导出操作按钮",
    context: ["ui", "action"],
  },

  // 媒体和内容术语
  Director: {
    shouldTranslate: true,
    translations: {
      zh: "导演",
      es: "Director",
      ja: "監督",
      ko: "감독",
      hi: "निर्देशक",
      ar: "مخرج",
    },
    description: "电影导演",
    context: ["media", "movies"],
  },
  Author: {
    shouldTranslate: true,
    translations: {
      zh: "作者",
      es: "Autor",
      ja: "著者",
      ko: "저자",
      hi: "लेखक",
      ar: "المؤلف",
    },
    description: "书籍作者",
    context: ["media", "books"],
  },
  Artist: {
    shouldTranslate: true,
    translations: {
      zh: "艺术家",
      es: "Artista",
      ja: "アーティスト",
      ko: "아티스트",
      hi: "कलाकार",
      ar: "الفنان",
    },
    description: "音乐艺术家",
    context: ["media", "music"],
  },
};

/**
 * 获取术语的标准翻译
 */
export function getStandardTranslation(
  term: string,
  language: string
): string | null {
  const entry = TERMINOLOGY_DICTIONARY[term];
  if (!entry || !entry.shouldTranslate || !entry.translations) {
    return null;
  }
  return entry.translations[language] || null;
}

/**
 * 检查术语是否应该翻译
 */
export function shouldTranslateTerm(term: string): boolean {
  const entry = TERMINOLOGY_DICTIONARY[term];
  return entry ? entry.shouldTranslate : true; // 默认应该翻译
}

/**
 * 获取术语的所有备选翻译
 */
export function getTermAlternatives(term: string): string[] {
  const entry = TERMINOLOGY_DICTIONARY[term];
  return entry?.alternatives || [];
}

/**
 * 按上下文筛选术语
 */
export function getTermsByContext(
  context: string
): Record<string, TerminologyEntry> {
  const filtered: Record<string, TerminologyEntry> = {};

  for (const [term, entry] of Object.entries(TERMINOLOGY_DICTIONARY)) {
    if (entry.context && entry.context.includes(context)) {
      filtered[term] = entry;
    }
  }

  return filtered;
}

export default TERMINOLOGY_DICTIONARY;
