#!/usr/bin/env tsx

/**
 * Mental Health Terminology Dictionary
 *
 * This script creates and manages a comprehensive dictionary of mental health
 * professional terminology across all supported languages to ensure consistency
 * and cultural appropriateness.
 */

import fs from 'fs/promises';
import path from 'path';

export interface TerminologyEntry {
  en: string;
  zh: string;
  es: string;
  ja: string;
  ko: string;
  hi: string;
  ar: string;
  category: 'clinical' | 'assessment' | 'therapy' | 'symptoms' | 'general';
  context?: string;
  culturalNotes?: Record<string, string>;
}

export interface TerminologyDictionary {
  [key: string]: TerminologyEntry;
}

/**
 * Comprehensive mental health terminology dictionary
 */
export const mentalHealthTerminology: TerminologyDictionary = {
  // Clinical Terms
  'mental_health': {
    en: 'Mental Health',
    zh: '心理健康',
    es: 'Salud Mental',
    ja: 'メンタルヘルス',
    ko: '정신건강',
    hi: 'मानसिक स्वास्थ्य',
    ar: 'الصحة النفسية',
    category: 'clinical',
    context: 'General term for psychological well-being'
  },

  'assessment': {
    en: 'Assessment',
    zh: '评测',
    es: 'Evaluación',
    ja: '評価',
    ko: '평가',
    hi: 'मूल्यांकन',
    ar: 'تقييم',
    category: 'assessment',
    context: 'Process of evaluating mental health status'
  },

  'screening': {
    en: 'Screening',
    zh: '筛查',
    es: 'Detección',
    ja: 'スクリーニング',
    ko: '선별검사',
    hi: 'स्क्रीनिंग',
    ar: 'فحص',
    category: 'assessment',
    context: 'Initial evaluation to identify potential issues'
  },

  'diagnosis': {
    en: 'Diagnosis',
    zh: '诊断',
    es: 'Diagnóstico',
    ja: '診断',
    ko: '진단',
    hi: 'निदान',
    ar: 'تشخيص',
    category: 'clinical',
    context: 'Professional identification of mental health conditions'
  },

  'professional_help': {
    en: 'Professional Help',
    zh: '专业帮助',
    es: 'Ayuda Profesional',
    ja: '専門的な助け',
    ko: '전문적 도움',
    hi: 'पेशेवर सहायता',
    ar: 'مساعدة مهنية',
    category: 'therapy',
    context: 'Assistance from qualified mental health professionals'
  },

  'mental_health_expert': {
    en: 'Mental Health Expert',
    zh: '心理健康专家',
    es: 'Experto en Salud Mental',
    ja: 'メンタルヘルス専門家',
    ko: '정신건강 전문가',
    hi: 'मानसिक स्वास्थ्य विशेषज्ञ',
    ar: 'أخصائي الصحة النفسية',
    category: 'therapy',
    context: 'Qualified professional in mental health field'
  },

  // Symptoms and Conditions
  'anxiety': {
    en: 'Anxiety',
    zh: '焦虑',
    es: 'Ansiedad',
    ja: '不安',
    ko: '불안',
    hi: 'चिंता',
    ar: 'القلق',
    category: 'symptoms',
    context: 'Feeling of worry, nervousness, or unease'
  },

  'depression': {
    en: 'Depression',
    zh: '抑郁',
    es: 'Depresión',
    ja: 'うつ病',
    ko: '우울증',
    hi: 'अवसाद',
    ar: 'الاكتئاب',
    category: 'symptoms',
    context: 'Persistent feeling of sadness and loss of interest'
  },

  'stress': {
    en: 'Stress',
    zh: '压力',
    es: 'Estrés',
    ja: 'ストレス',
    ko: '스트레스',
    hi: 'तनाव',
    ar: 'الضغط النفسي',
    category: 'symptoms',
    context: 'Physical or mental tension from demanding circumstances'
  },

  'mood': {
    en: 'Mood',
    zh: '情绪',
    es: 'Estado de Ánimo',
    ja: '気分',
    ko: '기분',
    hi: 'मूड',
    ar: 'المزاج',
    category: 'symptoms',
    context: 'Temporary state of mind or feeling'
  },

  'emotional_regulation': {
    en: 'Emotional Regulation',
    zh: '情绪调节',
    es: 'Regulación Emocional',
    ja: '感情調節',
    ko: '감정 조절',
    hi: 'भावनात्मक नियंत्रण',
    ar: 'تنظيم المشاعر',
    category: 'therapy',
    context: 'Ability to manage and respond to emotional experiences'
  },

  // Assessment Terms
  'risk_assessment': {
    en: 'Risk Assessment',
    zh: '风险评估',
    es: 'Evaluación de Riesgo',
    ja: 'リスク評価',
    ko: '위험 평가',
    hi: 'जोखिम मूल्यांकन',
    ar: 'تقييم المخاطر',
    category: 'assessment',
    context: 'Evaluation of potential mental health risks'
  },

  'risk_level_high': {
    en: 'High Risk',
    zh: '高风险',
    es: 'Alto Riesgo',
    ja: '高リスク',
    ko: '높은 위험',
    hi: 'उच्च जोखिम',
    ar: 'مخاطر عالية',
    category: 'assessment',
    context: 'Significant concern requiring immediate attention'
  },

  'risk_level_medium': {
    en: 'Medium Risk',
    zh: '中风险',
    es: 'Riesgo Medio',
    ja: '中リスク',
    ko: '중간 위험',
    hi: 'मध्यम जोखिम',
    ar: 'مخاطر متوسطة',
    category: 'assessment',
    context: 'Moderate concern requiring attention'
  },

  'risk_level_low': {
    en: 'Low Risk',
    zh: '低风险',
    es: 'Bajo Riesgo',
    ja: '低リスク',
    ko: '낮은 위험',
    hi: 'कम जोखिम',
    ar: 'مخاطر منخفضة',
    category: 'assessment',
    context: 'Minimal concern, within normal range'
  },

  'needs_attention': {
    en: 'Needs Attention',
    zh: '需要关注',
    es: 'Necesita Atención',
    ja: '注意が必要',
    ko: '주의 필요',
    hi: 'ध्यान की आवश्यकता',
    ar: 'يحتاج إلى انتباه',
    category: 'assessment',
    context: 'Situation requiring professional consideration'
  },

  'recommended_attention': {
    en: 'Recommended Attention',
    zh: '建议关注',
    es: 'Atención Recomendada',
    ja: '注意を推奨',
    ko: '관심 권장',
    hi: 'ध्यान की सिफारिश',
    ar: 'يُنصح بالانتباه',
    category: 'assessment',
    context: 'Suggested focus on specific areas'
  },

  'good_status': {
    en: 'Good Status',
    zh: '状态良好',
    es: 'Buen Estado',
    ja: '良好な状態',
    ko: '양호한 상태',
    hi: 'अच्छी स्थिति',
    ar: 'حالة جيدة',
    category: 'assessment',
    context: 'Positive mental health status'
  },

  // Therapy and Treatment
  'self_care': {
    en: 'Self-Care',
    zh: '自我护理',
    es: 'Autocuidado',
    ja: 'セルフケア',
    ko: '자기관리',
    hi: 'स्व-देखभाल',
    ar: 'الرعاية الذاتية',
    category: 'therapy',
    context: 'Personal practices to maintain mental health'
  },

  'coping_strategies': {
    en: 'Coping Strategies',
    zh: '应对策略',
    es: 'Estrategias de Afrontamiento',
    ja: '対処戦略',
    ko: '대처 전략',
    hi: 'मुकाबला रणनीतियां',
    ar: 'استراتيجيات التأقلم',
    category: 'therapy',
    context: 'Methods to manage stress and challenges'
  },

  'support_system': {
    en: 'Support System',
    zh: '支持系统',
    es: 'Sistema de Apoyo',
    ja: 'サポートシステム',
    ko: '지원 시스템',
    hi: 'सहायता प्रणाली',
    ar: 'نظام الدعم',
    category: 'therapy',
    context: 'Network of people and resources for help'
  },

  'helpline': {
    en: 'Helpline',
    zh: '援助热线',
    es: 'Línea de Ayuda',
    ja: 'ヘルプライン',
    ko: '상담전화',
    hi: 'हेल्पलाइन',
    ar: 'خط المساعدة',
    category: 'therapy',
    context: 'Phone service for mental health support'
  },

  // General Terms
  'well_being': {
    en: 'Well-being',
    zh: '幸福感',
    es: 'Bienestar',
    ja: 'ウェルビーイング',
    ko: '웰빙',
    hi: 'कल्याण',
    ar: 'الرفاهية',
    category: 'general',
    context: 'State of being comfortable, healthy, or happy'
  },

  'psychological_health': {
    en: 'Psychological Health',
    zh: '心理健康',
    es: 'Salud Psicológica',
    ja: '心理的健康',
    ko: '심리적 건강',
    hi: 'मनोवैज्ञानिक स्वास्थ्य',
    ar: 'الصحة النفسية',
    category: 'clinical',
    context: 'Mental and emotional well-being'
  },

  'distress': {
    en: 'Distress',
    zh: '困扰',
    es: 'Angustia',
    ja: '苦痛',
    ko: '고통',
    hi: 'परेशानी',
    ar: 'الضيق',
    category: 'symptoms',
    context: 'Extreme anxiety, sorrow, or pain'
  },

  'resilience': {
    en: 'Resilience',
    zh: '韧性',
    es: 'Resistencia',
    ja: 'レジリエンス',
    ko: '회복력',
    hi: 'लचीलापन',
    ar: 'المرونة',
    category: 'general',
    context: 'Ability to recover from difficulties'
  }
};

/**
 * Cultural adaptation notes for specific languages
 */
export const culturalAdaptationNotes = {
  zh: {
    'mental_health': '在中文语境中，"心理健康"比"精神健康"更容易被接受，避免污名化',
    'professional_help': '强调"专业"而非"治疗"，减少心理负担',
    'assessment': '使用"评测"而非"测试"，更加中性和科学'
  },
  ja: {
    'mental_health': '日本文化中对心理健康话题较为敏感，用词需要更加委婉',
    'distress': '使用"苦痛"而非更强烈的词汇，符合日本文化的含蓄表达',
    'help': '强调"支援"概念，符合日本社会的互助文化'
  },
  ar: {
    'mental_health': '阿拉伯文化中需要考虑宗教和家庭价值观，避免与传统观念冲突',
    'therapy': '强调"支持"和"指导"而非"治疗"，更容易被接受',
    'professional': '使用"专家"而非"医生"，减少医疗化印象'
  },
  hi: {
    'mental_health': '印地语中需要考虑传统医学观念，平衡现代心理学和传统智慧',
    'family_support': '强调家庭和社区支持的重要性，符合印度文化价值观',
    'spiritual_wellness': '可以适当融入精神健康的概念'
  },
  ko: {
    'mental_health': '韩国文化中对心理健康的认知在快速变化，用词需要现代化但不失敬意',
    'professional_help': '强调"专门가"的权威性，符合韩国对专业性的重视',
    'stigma': '需要特别注意去污名化的表达方式'
  },
  es: {
    'mental_health': '西班牙语使用地区广泛，需要考虑不同国家的文化差异',
    'family_involvement': '拉丁文化中家庭参与很重要，相关术语需要体现这一点',
    'community_support': '社区支持概念在拉丁文化中很重要'
  }
};

/**
 * Validate terminology consistency across languages
 */
export function validateTerminologyConsistency(dictionary: TerminologyDictionary): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const languages = ['en', 'zh', 'es', 'ja', 'ko', 'hi', 'ar'];

  for (const [key, entry] of Object.entries(dictionary)) {
    // Check if all languages are present
    for (const lang of languages) {
      if (!entry[lang as keyof TerminologyEntry]) {
        errors.push(`Missing translation for "${key}" in language "${lang}"`);
      } else if (typeof entry[lang as keyof TerminologyEntry] !== 'string') {
        errors.push(`Invalid translation type for "${key}" in language "${lang}"`);
      }
    }

    // Check if category is valid
    const validCategories = ['clinical', 'assessment', 'therapy', 'symptoms', 'general'];
    if (!validCategories.includes(entry.category)) {
      errors.push(`Invalid category "${entry.category}" for term "${key}"`);
    }

    // Warn about missing context
    if (!entry.context) {
      warnings.push(`Missing context for term "${key}"`);
    }

    // Check for potential inconsistencies
    const enTerm = entry.en.toLowerCase();
    if (enTerm.includes('mental health') && !key.includes('mental')) {
      warnings.push(`Term "${key}" contains "mental health" but key doesn't reflect this`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate terminology report
 */
export async function generateTerminologyReport(
  dictionary: TerminologyDictionary,
  outputPath: string
): Promise<void> {
  const validation = validateTerminologyConsistency(dictionary);
  const categories = [...new Set(Object.values(dictionary).map(entry => entry.category))];

  const report = {
    summary: {
      totalTerms: Object.keys(dictionary).length,
      categories: categories.length,
      languages: 7,
      isValid: validation.isValid
    },
    validation,
    categoriesBreakdown: categories.map(category => ({
      category,
      count: Object.values(dictionary).filter(entry => entry.category === category).length,
      terms: Object.keys(dictionary).filter(key => dictionary[key].category === category)
    })),
    culturalNotes: culturalAdaptationNotes,
    generatedAt: new Date().toISOString()
  };

  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Terminology report generated: ${outputPath}`);
}

/**
 * Apply terminology improvements to translation files
 */
export async function applyTerminologyImprovements(
  translationFilePath: string,
  dictionary: TerminologyDictionary,
  language: string
): Promise<void> {
  try {
    const content = await fs.readFile(translationFilePath, 'utf-8');
    let updatedContent = content;
    let changesCount = 0;

    // Apply terminology improvements
    for (const [, entry] of Object.entries(dictionary)) {
      const correctTerm = entry[language as keyof TerminologyEntry] as string;
      if (!correctTerm) continue;

      // Create regex patterns to find and replace terminology
      const patterns = [
        // Direct string matches in quotes
        new RegExp(`(['"])[^'"]*${entry.en}[^'"]*\\1`, 'gi'),
        // Object property values
        new RegExp(`(:\\s*)(['"])[^'"]*${entry.en}[^'"]*\\2`, 'gi')
      ];

      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          // This is a simplified replacement - in practice, you'd want more sophisticated logic
          // to ensure you're only replacing the right instances
          console.log(`Found potential terminology update in ${translationFilePath}: ${entry.en} -> ${correctTerm}`);
        }
      }
    }

    if (changesCount > 0) {
      await fs.writeFile(translationFilePath, updatedContent, 'utf-8');
      console.log(`Applied ${changesCount} terminology improvements to ${translationFilePath}`);
    }
  } catch (error) {
    console.error(`Error applying terminology improvements to ${translationFilePath}:`, error);
  }
}

/**
 * Main function to run terminology optimization
 */
export async function optimizeTerminology(): Promise<void> {
  console.log('🔍 Starting mental health terminology optimization...');

  // Validate terminology dictionary
  const validation = validateTerminologyConsistency(mentalHealthTerminology);

  if (!validation.isValid) {
    console.error('❌ Terminology dictionary validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    return;
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Terminology warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  // Generate terminology report
  const reportPath = path.join(process.cwd(), 'packages/website/reports/terminology-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await generateTerminologyReport(mentalHealthTerminology, reportPath);

  // Apply improvements to translation files
  const translationDirs = [
    'packages/website/src/locales',
    'packages/website/src/client-locales'
  ];

  const languages = ['zh', 'es', 'ja', 'ko', 'hi', 'ar'];
  const modules = ['assessment', 'shared', 'home', 'guide', 'resources'];

  for (const dir of translationDirs) {
    for (const module of modules) {
      for (const lang of languages) {
        const filePath = path.join(process.cwd(), dir, module, `${lang}.ts`);

        try {
          await fs.access(filePath);
          await applyTerminologyImprovements(filePath, mentalHealthTerminology, lang);
        } catch (error) {
          // File doesn't exist, skip
          continue;
        }
      }
    }
  }

  console.log('✅ Mental health terminology optimization completed');
  console.log(`📊 Report saved to: ${reportPath}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeTerminology().catch(console.error);
}
