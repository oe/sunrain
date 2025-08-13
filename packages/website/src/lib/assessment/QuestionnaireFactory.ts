/**
 * 问卷工厂
 *
 * 用于创建和配置问卷实例
 */

import type {
  Questionnaire,
  DifficultyLevel,
  ProfessionalBacking,
  ResultInterpretation
} from '@/types/questionnaire';
import type { Question, ScoringRule } from '@/types/assessment';
import { QUESTIONNAIRE_CATEGORIES, QUESTIONNAIRE_TAGS } from '@/types/questionnaire';

export interface QuestionnaireConfig {
  id: string;
  titleKey: string;
  descriptionKey: string;
  introductionKey: string;
  purposeKey: string;
  categoryId: string;
  tagIds: string[];
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  questions: Question[];
  scoringRules: ScoringRule[];
  interpretations: ResultInterpretation[];
  professionalBacking: ProfessionalBacking;
  instructions: string;
  disclaimer?: string;
  isFeatured?: boolean;
  requiresAuth?: boolean;
  ageRestriction?: {
    min?: number;
    max?: number;
  };
}

export class QuestionnaireFactory {
  /**
   * 创建问卷实例
   */
  static createQuestionnaire(config: QuestionnaireConfig): Questionnaire {
    const category = QUESTIONNAIRE_CATEGORIES.find(c => c.id === config.categoryId);
    if (!category) {
      throw new Error(`Category not found: ${config.categoryId}`);
    }

    const tags = config.tagIds.map(tagId => {
      const tag = QUESTIONNAIRE_TAGS.find(t => t.id === tagId);
      if (!tag) {
        throw new Error(`Tag not found: ${tagId}`);
      }
      return tag;
    });

    const now = new Date();

    return {
      id: config.id,
      titleKey: config.titleKey,
      descriptionKey: config.descriptionKey,
      introductionKey: config.introductionKey,
      purposeKey: config.purposeKey,
      category,
      tags,
      estimatedMinutes: config.estimatedMinutes,
      questionCount: config.questions.length,
      difficulty: config.difficulty,
      validatedScoring: true, // 默认为验证过的评分
      professionalBacking: config.professionalBacking,
      interpretations: config.interpretations,
      isActive: true,
      isFeatured: config.isFeatured || false,
      completionCount: 0,
      averageRating: 0,
      requiresAuth: config.requiresAuth || false,
      ageRestriction: config.ageRestriction,

      // 继承自 AssessmentType 的字段
      duration: config.estimatedMinutes,
      questions: config.questions,
      scoringRules: config.scoringRules,
      instructions: config.instructions,
      disclaimer: config.disclaimer,
      version: '1.0.0',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * 创建PHQ-9问卷
   */
  static createPHQ9(): Questionnaire {
    return this.createQuestionnaire({
      id: 'phq-9',
      titleKey: 'questionnaires.phq9.title',
      descriptionKey: 'questionnaires.phq9.description',
      introductionKey: 'questionnaires.phq9.introduction',
      purposeKey: 'questionnaires.phq9.purpose',
      categoryId: 'depression',
      tagIds: ['validated', 'screening', 'quick'],
      estimatedMinutes: 4,
      difficulty: 'beginner',
      questions: this.createPHQ9Questions(),
      scoringRules: this.createPHQ9ScoringRules(),
      interpretations: this.createPHQ9Interpretations(),
      professionalBacking: {
        source: 'Kroenke, K., Spitzer, R. L., & Williams, J. B.',
        reference: 'The PHQ-9: validity of a brief depression severity measure. Journal of general internal medicine, 16(9), 606-613.',
        validationStudies: [
          'Kroenke et al. (2001) - Original validation study',
          'Manea et al. (2012) - Systematic review and meta-analysis'
        ],
        reliability: 0.89,
        validity: 'Construct validity confirmed through factor analysis'
      },
      instructions: 'Please read each statement carefully and select the response that best describes how you have been feeling over the past 2 weeks.',
      disclaimer: 'This questionnaire is for screening purposes only and does not constitute a medical diagnosis.',
      isFeatured: true
    });
  }

  /**
   * 创建GAD-7问卷
   */
  static createGAD7(): Questionnaire {
    return this.createQuestionnaire({
      id: 'gad-7',
      titleKey: 'questionnaires.gad7.title',
      descriptionKey: 'questionnaires.gad7.description',
      introductionKey: 'questionnaires.gad7.introduction',
      purposeKey: 'questionnaires.gad7.purpose',
      categoryId: 'anxiety',
      tagIds: ['validated', 'screening', 'quick'],
      estimatedMinutes: 3,
      difficulty: 'beginner',
      questions: this.createGAD7Questions(),
      scoringRules: this.createGAD7ScoringRules(),
      interpretations: this.createGAD7Interpretations(),
      professionalBacking: {
        source: 'Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B.',
        reference: 'A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of internal medicine, 166(10), 1092-1097.',
        validationStudies: [
          'Spitzer et al. (2006) - Original validation study',
          'Löwe et al. (2008) - Cross-cultural validation'
        ],
        reliability: 0.92,
        validity: 'Excellent internal consistency and test-retest reliability'
      },
      instructions: 'Please read each statement carefully and select the response that best describes how often you have been bothered by the following problems over the past 2 weeks.',
      disclaimer: 'This questionnaire is for screening purposes only and does not constitute a medical diagnosis.',
      isFeatured: true
    });
  }

  // 私有方法用于创建具体的问题、评分规则和解读
  private static createPHQ9Questions(): Question[] {
    const options = [
      { id: 'not_at_all', text: 'Not at all', value: 0 },
      { id: 'several_days', text: 'Several days', value: 1 },
      { id: 'more_than_half', text: 'More than half the days', value: 2 },
      { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
    ];

    const questions = [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
      'Trouble concentrating on things, such as reading the newspaper or watching television',
      'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
      'Thoughts that you would be better off dead, or of hurting yourself'
    ];

    return questions.map((text, index) => ({
      id: `q${index + 1}`,
      text,
      type: 'single_choice' as const,
      options,
      required: true,
      weight: 1
    }));
  }

  private static createPHQ9ScoringRules(): ScoringRule[] {
    return [{
      id: 'total_score',
      name: 'PHQ-9 Total Score',
      description: 'Sum of all item scores',
      calculation: 'sum',
      questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'],
      ranges: [
        { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression', riskLevel: 'low' },
        { min: 5, max: 9, label: 'Mild', description: 'Mild depression', riskLevel: 'low' },
        { min: 10, max: 14, label: 'Moderate', description: 'Moderate depression', riskLevel: 'medium' },
        { min: 15, max: 19, label: 'Moderately Severe', description: 'Moderately severe depression', riskLevel: 'high' },
        { min: 20, max: 27, label: 'Severe', description: 'Severe depression', riskLevel: 'high' }
      ]
    }];
  }

  private static createPHQ9Interpretations(): ResultInterpretation[] {
    return [
      {
        scoreRange: { min: 0, max: 4 },
        levelKey: 'interpretations.minimal',
        interpretationKey: 'interpretations.phq9.minimal.interpretation',
        recommendationsKey: 'interpretations.phq9.minimal.recommendations',
        warningLevel: 'none',
        riskLevel: 'low'
      },
      {
        scoreRange: { min: 5, max: 9 },
        levelKey: 'interpretations.mild',
        interpretationKey: 'interpretations.phq9.mild.interpretation',
        recommendationsKey: 'interpretations.phq9.mild.recommendations',
        warningLevel: 'mild',
        riskLevel: 'low'
      },
      {
        scoreRange: { min: 10, max: 14 },
        levelKey: 'interpretations.moderate',
        interpretationKey: 'interpretations.phq9.moderate.interpretation',
        recommendationsKey: 'interpretations.phq9.moderate.recommendations',
        warningLevel: 'moderate',
        riskLevel: 'medium',
        supportResourcesKey: 'interpretations.phq9.moderate.supportResources'
      },
      {
        scoreRange: { min: 15, max: 19 },
        levelKey: 'interpretations.moderatelySevere',
        interpretationKey: 'interpretations.phq9.moderatelySevere.interpretation',
        recommendationsKey: 'interpretations.phq9.moderatelySevere.recommendations',
        warningLevel: 'severe',
        riskLevel: 'high',
        supportResourcesKey: 'interpretations.phq9.moderatelySevere.supportResources'
      },
      {
        scoreRange: { min: 20, max: 27 },
        levelKey: 'interpretations.severe',
        interpretationKey: 'interpretations.phq9.severe.interpretation',
        recommendationsKey: 'interpretations.phq9.severe.recommendations',
        warningLevel: 'severe',
        riskLevel: 'high',
        supportResourcesKey: 'interpretations.phq9.severe.supportResources'
      }
    ];
  }

  private static createGAD7Questions(): Question[] {
    const options = [
      { id: 'not_at_all', text: 'Not at all', value: 0 },
      { id: 'several_days', text: 'Several days', value: 1 },
      { id: 'more_than_half', text: 'More than half the days', value: 2 },
      { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
    ];

    const questions = [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid, as if something awful might happen'
    ];

    return questions.map((text, index) => ({
      id: `q${index + 1}`,
      text,
      type: 'single_choice' as const,
      options,
      required: true,
      weight: 1
    }));
  }

  private static createGAD7ScoringRules(): ScoringRule[] {
    return [{
      id: 'total_score',
      name: 'GAD-7 Total Score',
      description: 'Sum of all item scores',
      calculation: 'sum',
      questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
      ranges: [
        { min: 0, max: 4, label: 'Minimal', description: 'Minimal anxiety', riskLevel: 'low' },
        { min: 5, max: 9, label: 'Mild', description: 'Mild anxiety', riskLevel: 'low' },
        { min: 10, max: 14, label: 'Moderate', description: 'Moderate anxiety', riskLevel: 'medium' },
        { min: 15, max: 21, label: 'Severe', description: 'Severe anxiety', riskLevel: 'high' }
      ]
    }];
  }

  private static createGAD7Interpretations(): ResultInterpretation[] {
    return [
      {
        scoreRange: { min: 0, max: 4 },
        levelKey: 'interpretations.minimal',
        interpretationKey: 'interpretations.gad7.minimal.interpretation',
        recommendationsKey: 'interpretations.gad7.minimal.recommendations',
        warningLevel: 'none',
        riskLevel: 'low'
      },
      {
        scoreRange: { min: 5, max: 9 },
        levelKey: 'interpretations.mild',
        interpretationKey: 'interpretations.gad7.mild.interpretation',
        recommendationsKey: 'interpretations.gad7.mild.recommendations',
        warningLevel: 'mild',
        riskLevel: 'low'
      },
      {
        scoreRange: { min: 10, max: 14 },
        levelKey: 'interpretations.moderate',
        interpretationKey: 'interpretations.gad7.moderate.interpretation',
        recommendationsKey: 'interpretations.gad7.moderate.recommendations',
        warningLevel: 'moderate',
        riskLevel: 'medium',
        supportResourcesKey: 'interpretations.gad7.moderate.supportResources'
      },
      {
        scoreRange: { min: 15, max: 21 },
        levelKey: 'interpretations.severe',
        interpretationKey: 'interpretations.gad7.severe.interpretation',
        recommendationsKey: 'interpretations.gad7.severe.recommendations',
        warningLevel: 'severe',
        riskLevel: 'high',
        supportResourcesKey: 'interpretations.gad7.severe.supportResources'
      }
    ];
  }
}
