/**
 * 扩展的问卷数据模型
 *
 * 基于现有的assessment.ts，添加分类、标签、专业背景等新字段
 */

import type { AssessmentType, ScoringRule, Question, RiskLevel } from './assessment';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuestionnaireCategory {
  id: string;
  nameKey: string;              // 翻译键
  descriptionKey: string;       // 翻译键
  icon: string;                 // 图标名称或路径
  color: string;                // 主题色
  order: number;                // 显示顺序
  parentId?: string;            // 父分类ID（支持嵌套分类）
}

export interface QuestionnaireTag {
  id: string;
  name: string;
  color?: string;
  category?: string;
}

export interface ResultInterpretation {
  scoreRange: { min: number; max: number };
  levelKey: string;             // 翻译键 (如 'low', 'moderate', 'high')
  interpretationKey: string;    // 详细解读翻译键
  recommendationsKey: string;   // 建议翻译键
  warningLevel: 'none' | 'mild' | 'moderate' | 'severe';
  supportResourcesKey?: string; // 支持资源翻译键
  riskLevel?: RiskLevel;
}

export interface ProfessionalBacking {
  source: string;               // 来源（如 "American Psychiatric Association"）
  reference: string;            // 参考文献
  validationStudies?: string[]; // 验证研究
  reliability?: number;         // 信度系数
  validity?: string;            // 效度信息
}

export interface Questionnaire extends Omit<AssessmentType, 'category' | 'name' | 'description'> {
  // 基本信息（使用翻译键）
  titleKey: string;              // 翻译键
  descriptionKey: string;        // 翻译键
  introductionKey: string;       // 介绍内容翻译键
  purposeKey: string;           // 目的说明翻译键

  // 分类和标签
  category: QuestionnaireCategory;
  tags: QuestionnaireTag[];

  // 时间和难度
  estimatedMinutes: number;      // 准确的估时
  questionCount: number;         // 问题数量
  difficulty: DifficultyLevel;   // 难度等级

  // 专业信息
  validatedScoring: boolean;     // 是否使用验证过的评分方法
  professionalBacking: ProfessionalBacking; // 专业背景信息

  // 结果解读
  interpretations: ResultInterpretation[];

  // 状态和元数据
  isActive: boolean;             // 是否启用
  isFeatured: boolean;          // 是否推荐
  completionCount?: number;      // 完成次数统计
  averageRating?: number;        // 平均评分

  // 访问控制
  requiresAuth?: boolean;        // 是否需要登录
  ageRestriction?: {            // 年龄限制
    min?: number;
    max?: number;
  };
}

export interface QuestionnaireFilter {
  categoryId?: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  estimatedTime?: {
    min?: number;
    max?: number;
  };
  validatedOnly?: boolean;
  featuredOnly?: boolean;
  searchQuery?: string;
}

export interface QuestionnaireSortOption {
  field: 'title' | 'estimatedMinutes' | 'completionCount' | 'averageRating' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface QuestionnaireListItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: QuestionnaireCategory;
  tags: QuestionnaireTag[];
  estimatedMinutes: number;
  questionCount: number;
  difficulty: DifficultyLevel;
  isFeatured: boolean;
  completionCount: number;
  averageRating: number;
  hasHistory: boolean;          // 用户是否有历史记录
  lastCompletedAt?: Date;       // 最后完成时间
}

// 预定义的分类
export const QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = [
  {
    id: 'depression',
    nameKey: 'categories.depression.name',
    descriptionKey: 'categories.depression.description',
    icon: 'mood-sad',
    color: '#3B82F6',
    order: 1
  },
  {
    id: 'anxiety',
    nameKey: 'categories.anxiety.name',
    descriptionKey: 'categories.anxiety.description',
    icon: 'heart-pulse',
    color: '#F59E0B',
    order: 2
  },
  {
    id: 'stress',
    nameKey: 'categories.stress.name',
    descriptionKey: 'categories.stress.description',
    icon: 'brain',
    color: '#EF4444',
    order: 3
  },
  {
    id: 'personality',
    nameKey: 'categories.personality.name',
    descriptionKey: 'categories.personality.description',
    icon: 'user-circle',
    color: '#8B5CF6',
    order: 4
  },
  {
    id: 'self-esteem',
    nameKey: 'categories.selfEsteem.name',
    descriptionKey: 'categories.selfEsteem.description',
    icon: 'heart',
    color: '#10B981',
    order: 5
  },
  {
    id: 'relationships',
    nameKey: 'categories.relationships.name',
    descriptionKey: 'categories.relationships.description',
    icon: 'users',
    color: '#F97316',
    order: 6
  }
];

// 预定义的标签
export const QUESTIONNAIRE_TAGS: QuestionnaireTag[] = [
  { id: 'validated', name: 'Clinically Validated', color: '#10B981' },
  { id: 'quick', name: 'Quick Assessment', color: '#3B82F6' },
  { id: 'comprehensive', name: 'Comprehensive', color: '#8B5CF6' },
  { id: 'screening', name: 'Screening Tool', color: '#F59E0B' },
  { id: 'diagnostic', name: 'Diagnostic Aid', color: '#EF4444' },
  { id: 'research', name: 'Research Based', color: '#6B7280' }
];
