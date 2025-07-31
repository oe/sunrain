// Assessment system type definitions

export type QuestionType = 'single_choice' | 'multiple_choice' | 'scale' | 'text' | 'number' | 'date';
export type AssessmentCategory = 'personality' | 'mental_health' | 'stress' | 'mood';
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
