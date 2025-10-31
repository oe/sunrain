/**
 * 问卷系统类型定义
 * 支持递归嵌套的问卷数据结构
 */

export type Language = 'en' | 'zh' | 'es' | 'ja' | 'ko' | 'hi' | 'ar';

export type QuestionType = 
  | 'single_choice' 
  | 'multiple_choice' 
  | 'scale' 
  | 'text' 
  | 'rating' 
  | 'boolean';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type CalculationMethod = 'sum' | 'average' | 'weighted_sum' | 'custom';

/**
 * 问卷选项
 */
export interface QuestionnaireOption {
  id: string;
  text: string;
  value: number | string | boolean;
  weight?: number;
  description?: string;
}

/**
 * 问卷问题
 */
export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  weight?: number;
  description?: string;
  options?: QuestionnaireOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleStep?: number;
  scaleLabels?: {
    min: string;
    max: string;
  };
  conditionalLogic?: {
    dependsOn: string;
    condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than';
    value: any;
  };
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
}

/**
 * 评分规则
 */
export interface ScoringRule {
  id: string;
  name: string;
  description: string;
  calculation: CalculationMethod;
  questionIds: string[];
  weights?: Record<string, number>;
  customFormula?: string;
  ranges: ScoreRange[];
}

/**
 * 分数范围
 */
export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  description: string;
  riskLevel: RiskLevel;
  color?: string;
  recommendations?: string[];
}

/**
 * 专业支持信息
 */
export interface ProfessionalBacking {
  source: string;
  reference: string;
  validationStudies: string[];
  reliability?: number;
  validity?: string;
  lastUpdated?: string;
  peerReviewed?: boolean;
}

/**
 * 问卷元数据
 */
export interface QuestionnaireMetadata {
  id: string;
  titleKey: string;
  descriptionKey: string;
  introductionKey: string;
  purposeKey: string;
  categoryId: string;
  tags: string[];
  estimatedMinutes: number;
  questionCount: number;
  difficulty: DifficultyLevel;
  validatedScoring: boolean;
  professionalBacking: ProfessionalBacking;
  instructions: string;
  disclaimer: string;
  isFeatured: boolean;
  isActive: boolean;
  requiresAuth: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  minAge?: number;
  maxAge?: number;
  genderSpecific?: 'male' | 'female' | 'all';
  culturalConsiderations?: string[];
}

/**
 * 问卷解释
 */
export interface QuestionnaireInterpretation {
  scoreRange: { min: number; max: number };
  levelKey: string;
  interpretationKey: string;
  recommendationsKey: string;
  warningLevel: 'none' | 'mild' | 'moderate' | 'severe';
  riskLevel: RiskLevel;
  supportResourcesKey?: string;
  nextStepsKey?: string;
}

/**
 * 完整问卷数据
 */
export interface Questionnaire {
  metadata: QuestionnaireMetadata;
  questions: QuestionnaireQuestion[];
  scoringRules: ScoringRule[];
  interpretations: QuestionnaireInterpretation[];
}

/**
 * 问卷翻译数据
 */
export interface QuestionnaireTranslation {
  title: string;
  description: string;
  introduction: string;
  purpose: string;
  instructions: string;
  disclaimer: string;
  questions: {
    [questionId: string]: {
      text: string;
      description?: string;
      options?: {
        [optionId: string]: string;
      };
      scaleLabels?: {
        min: string;
        max: string;
      };
    };
  };
  scoringRules: {
    [ruleId: string]: {
      name: string;
      description: string;
      ranges: {
        [rangeIndex: number]: {
          label: string;
          description: string;
          recommendations?: string[];
        };
      };
    };
  };
  interpretations: {
    [levelKey: string]: {
      interpretation: string;
      recommendations: string;
      supportResources?: string;
      nextSteps?: string;
    };
  };
}

/**
 * 问卷类别
 */
export interface QuestionnaireCategory {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

/**
 * 问卷索引
 */
export interface QuestionnaireIndex {
  questionnaires: string[];
  categories: QuestionnaireCategory[];
  lastUpdated: string;
}

/**
 * 问卷加载器配置
 */
export interface QuestionnaireLoaderConfig {
  dataPath: string;
  supportedLanguages: Language[];
  defaultLanguage: Language;
  cacheEnabled: boolean;
  cacheTimeout: number;
}

/**
 * 问卷搜索结果
 */
export interface QuestionnaireSearchResult {
  questionnaire: Questionnaire;
  score: number;
  matchedFields: string[];
}

/**
 * 问卷过滤器
 */
export interface QuestionnaireFilter {
  categoryId?: string;
  difficulty?: DifficultyLevel;
  estimatedMinutes?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  requiresAuth?: boolean;
  validatedScoring?: boolean;
}
