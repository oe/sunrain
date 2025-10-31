// Assessment system type definitions

import type { Language } from '@/shared';

export type QuestionType = 'single_choice' | 'multiple_choice' | 'scale' | 'text' | 'number' | 'date';
export type AssessmentCategory = 'personality' | 'mental_health' | 'stress' | 'mood' | 'anxiety' | 'depression';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type RiskLevel = 'low' | 'medium' | 'high';
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface QuestionOption {
  id: string;
  text: string;
  value: number;
  translations?: Record<string, string>;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  weight?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleStep?: number;
  scaleLabels?: {
    min: string;
    max: string;
  };
  minSelections?: number;
  maxSelections?: number;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  integer?: boolean;
  pattern?: string;
  patternMessage?: string;
  minDate?: string;
  maxDate?: string;
  translations?: Record<string, {
    text: string;
    options?: Record<string, string>;
    scaleLabels?: {
      min: string;
      max: string;
    };
  }>;
  culturalAdaptations?: Record<string, {
    text?: string;
    options?: QuestionOption[];
    notes?: string;
  }>;
}

export interface ScoringRule {
  id: string;
  name: string;
  description: string;
  calculation: 'sum' | 'average' | 'weighted_sum' | 'custom';
  questionIds: string[];
  weights?: Record<string, number>;
  customFormula?: string;
  ranges: {
    min: number;
    max: number;
    label: string;
    description: string;
    riskLevel?: RiskLevel;
  }[];
}

export interface AssessmentType {
  id: string;
  name: string;
  description: string;
  category: AssessmentCategory;
  duration: number; // estimated completion time in minutes
  questions: Question[];
  scoringRules: ScoringRule[];
  instructions: string;
  disclaimer?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  translations?: Record<string, {
    name: string;
    description: string;
    instructions: string;
    disclaimer?: string;
  }>;
  culturalAdaptations?: Record<string, {
    name?: string;
    description?: string;
    instructions?: string;
    disclaimer?: string;
    scoringAdjustments?: Record<string, number>;
  }>;
}

export interface AssessmentAnswer {
  questionId: string;
  value: any;
  answeredAt: Date;
}

export interface AssessmentSession {
  id: string;
  assessmentTypeId: string;
  startedAt: Date;
  currentQuestionIndex: number;
  answers: AssessmentAnswer[];
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  language: string;
  culturalContext?: string;
  timeSpent: number; // in seconds
  lastActivityAt: Date;
}

export interface AssessmentResult {
  id: string;
  sessionId: string;
  assessmentTypeId: string;
  completedAt: Date;
  scores: Record<string, {
    value: number;
    label: string;
    description: string;
    riskLevel?: RiskLevel;
  }>;
  interpretation: string;
  recommendations: string[];
  riskLevel?: RiskLevel;
  language: string;
  culturalContext?: string;
  totalTimeSpent: number;
  answers: AssessmentAnswer[];
}

export interface AssessmentReport {
  result: AssessmentResult;
  visualizations: {
    type: 'bar' | 'radar' | 'line' | 'pie';
    data: any;
    title: string;
    description: string;
  }[];
  comparisons?: {
    previousResults: AssessmentResult[];
    trends: {
      improving: string[];
      declining: string[];
      stable: string[];
    };
  };
  resourceRecommendations: {
    type: 'article' | 'exercise' | 'resource';
    id: string;
    title: string;
    description: string;
    relevanceScore: number;
  }[];
}

export interface Recommendation {
  id: string;
  type: 'immediate' | 'short_term' | 'long_term';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  resourceLinks: {
    type: 'internal' | 'external';
    url: string;
    title: string;
  }[];
  estimatedTimeCommitment?: string;
}

// ============================================================================
// EXTENDED QUESTIONNAIRE TYPES (consolidated from questionnaire.ts)
// ============================================================================

export interface QuestionnaireCategory {
  id: string;
  nameKey: string;              // Translation key
  descriptionKey: string;       // Translation key
  icon: string;                 // Icon name or path
  color: string;                // Theme color
  order: number;                // Display order
  parentId?: string;            // Parent category ID (supports nested categories)
}

export interface QuestionnaireTag {
  id: string;
  name: string;
  color?: string;
  category?: string;
}

export interface ResultInterpretation {
  scoreRange: { min: number; max: number };
  levelKey: string;             // Translation key (e.g., 'low', 'moderate', 'high')
  interpretationKey: string;    // Detailed interpretation translation key
  recommendationsKey: string;   // Recommendations translation key
  warningLevel: 'none' | 'mild' | 'moderate' | 'severe';
  supportResourcesKey?: string; // Support resources translation key
  riskLevel?: RiskLevel;
}

export interface ProfessionalBacking {
  source: string;               // Source (e.g., "American Psychiatric Association")
  reference: string;            // Reference citation
  validationStudies?: string[]; // Validation studies
  reliability?: number;         // Reliability coefficient
  validity?: string;            // Validity information
}

export interface Questionnaire extends Omit<AssessmentType, 'category' | 'name' | 'description'> {
  // Basic information (using translation keys)
  titleKey: string;              // Translation key
  descriptionKey: string;        // Translation key
  introductionKey: string;       // Introduction content translation key
  purposeKey: string;           // Purpose explanation translation key

  // Categorization and tags
  category: QuestionnaireCategory;
  tags: QuestionnaireTag[];

  // Time and difficulty
  estimatedMinutes: number;      // Accurate time estimate
  questionCount: number;         // Question count
  difficulty: DifficultyLevel;   // Difficulty level

  // Professional information
  validatedScoring: boolean;     // Whether using validated scoring method
  professionalBacking: ProfessionalBacking; // Professional background info

  // Result interpretation
  interpretations: ResultInterpretation[];

  // Status and metadata
  isActive: boolean;             // Whether enabled
  isFeatured: boolean;          // Whether recommended
  completionCount?: number;      // Completion count statistics
  averageRating?: number;        // Average rating

  // Access control
  requiresAuth?: boolean;        // Whether login required
  ageRestriction?: {            // Age restrictions
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
  hasHistory: boolean;          // Whether user has history
  lastCompletedAt?: Date;       // Last completion time
}

// Predefined categories
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

// Predefined tags
export const QUESTIONNAIRE_TAGS: QuestionnaireTag[] = [
  { id: 'validated', name: 'Clinically Validated', color: '#10B981' },
  { id: 'quick', name: 'Quick Assessment', color: '#3B82F6' },
  { id: 'comprehensive', name: 'Comprehensive', color: '#8B5CF6' },
  { id: 'screening', name: 'Screening Tool', color: '#F59E0B' },
  { id: 'diagnostic', name: 'Diagnostic Aid', color: '#EF4444' },
  { id: 'research', name: 'Research Based', color: '#6B7280' }
];
// ============================================================================
// COMPONENT INTERFACE DEFINITIONS
// ============================================================================

export interface StartAssessmentButtonProps {
  assessment: AssessmentType;
  buttonText: string;
  language?: Language;
}

export interface QuestionnaireInfoButtonProps {
  assessment: AssessmentType;
  buttonText: string;
  language?: Language;
  onStartAssessment?: (assessmentId: string) => void;
}

export interface ExistingSessionDialogProps {
  existingSession: AssessmentSession;
  assessmentName: string;
  language?: Language;
  onContinue: () => void;
  onRestart: () => void;
  onCancel: () => void;
}

export interface AssessmentStatisticsProps {
  totalResults: number;
  averageTime: number;
  lastAssessment: string;
  language?: Language;
}

export interface ErrorHandlerProps {
  children?: React.ReactNode;
  error?: Error;
  title?: string;
  message?: string;
  fallback?: React.ReactNode;
  onRetry?: () => void;
  onGoBack?: () => void;
  onError?: (error: Error, errorInfo?: React.ErrorInfo) => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  language?: string;
  t?: (key: string, params?: Record<string, any>) => string;
}

export interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  language?: string;
  t?: (key: string, params?: Record<string, any>) => string;
}

export interface ContinueAssessmentPageProps {
  className?: string;
  asWidget?: boolean;
}

export interface VirtualizedQuestionListProps {
  questions: Question[];
  currentIndex: number;
  onQuestionSelect: (index: number) => void;
  containerHeight: number;
  itemHeight?: number;
  t: (key: string, params?: Record<string, any>) => string;
}

export interface NavigationControlsProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  showSaveButton?: boolean;
  t: (key: string, params?: Record<string, any>) => string;
}

export interface TrendData {
  month: string;
  avgScore: number;
  count: number;
}

export interface CategoryPerformance {
  [category: string]: number;
}

export interface RiskTrends {
  low: number;
  medium: number;
  high: number;
}

// All questionnaire types are now consolidated in this file
