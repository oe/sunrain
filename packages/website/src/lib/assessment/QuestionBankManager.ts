import type {
  AssessmentType,
  Question,
  AssessmentCategory
} from '../../types/assessment';

/**
 * Question Bank Manager
 * Handles standardized assessment question data formats and multi-language support
 */
export class QuestionBankManager {
  private assessmentTypes: Map<string, AssessmentType> = new Map();
  private questionsByCategory: Map<AssessmentCategory, Question[]> = new Map();
  private currentLanguage: string = 'en';


  constructor() {
    this.initializeDefaultAssessments();
  }

  /**
   * Initialize default assessment types with sample questions
   */
  private initializeDefaultAssessments(): void {
    // PHQ-9 Depression Assessment
    const phq9Assessment: AssessmentType = {
      id: 'phq-9',
      name: 'PHQ-9 Depression Assessment',
      description: 'Patient Health Questionnaire-9 for depression screening',
      category: 'mental_health',
      duration: 5,
      instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      disclaimer: 'This assessment is for screening purposes only and does not replace professional medical advice.',
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 'phq9-1',
          text: 'Little interest or pleasure in doing things',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-1-0', text: 'Not at all', value: 0 },
            { id: 'phq9-1-1', text: 'Several days', value: 1 },
            { id: 'phq9-1-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-1-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '对事物缺乏兴趣或乐趣',
              options: {
                'phq9-1-0': '完全没有',
                'phq9-1-1': '几天',
                'phq9-1-2': '超过一半的天数',
                'phq9-1-3': '几乎每天'
              },
              scaleLabels: {
                min: '完全没有',
                max: '几乎每天'
              }
            }
          }
        },
        {
          id: 'phq9-2',
          text: 'Feeling down, depressed, or hopeless',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-2-0', text: 'Not at all', value: 0 },
            { id: 'phq9-2-1', text: 'Several days', value: 1 },
            { id: 'phq9-2-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-2-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '感到沮丧、抑郁或绝望',
              options: {
                'phq9-2-0': '完全没有',
                'phq9-2-1': '几天',
                'phq9-2-2': '超过一半的天数',
                'phq9-2-3': '几乎每天'
              }
            }
          }
        }
      ],
      scoringRules: [
        {
          id: 'phq9-total',
          name: 'PHQ-9 Total Score',
          description: 'Sum of all PHQ-9 item scores',
          calculation: 'sum',
          questionIds: ['phq9-1', 'phq9-2'],
          ranges: [
            { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression symptoms', riskLevel: 'low' },
            { min: 5, max: 9, label: 'Mild', description: 'Mild depression symptoms', riskLevel: 'low' },
            { min: 10, max: 14, label: 'Moderate', description: 'Moderate depression symptoms', riskLevel: 'medium' },
            { min: 15, max: 19, label: 'Moderately Severe', description: 'Moderately severe depression symptoms', riskLevel: 'medium' },
            { min: 20, max: 27, label: 'Severe', description: 'Severe depression symptoms', riskLevel: 'high' }
          ]
        }
      ],
      translations: {
        zh: {
          name: 'PHQ-9 抑郁症评估',
          description: '患者健康问卷-9，用于抑郁症筛查',
          instructions: '在过去的2周里，您被以下问题困扰的频率如何？',
          disclaimer: '此评估仅用于筛查目的，不能替代专业医疗建议。'
        }
      }
    };

    // GAD-7 Anxiety Assessment
    const gad7Assessment: AssessmentType = {
      id: 'gad-7',
      name: 'GAD-7 Anxiety Assessment',
      description: 'Generalized Anxiety Disorder 7-item scale',
      category: 'mental_health',
      duration: 3,
      instructions: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
      disclaimer: 'This assessment is for screening purposes only and does not replace professional medical advice.',
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 'gad7-1',
          text: 'Feeling nervous, anxious, or on edge',
          type: 'scale',
          required: true,
          scaleMin: 0,
          scaleMax: 3,
          scaleLabels: {
            min: 'Not at all',
            max: 'Nearly every day'
          },
          options: [
            { id: 'gad7-1-0', text: 'Not at all', value: 0 },
            { id: 'gad7-1-1', text: 'Several days', value: 1 },
            { id: 'gad7-1-2', text: 'More than half the days', value: 2 },
            { id: 'gad7-1-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '感到紧张、焦虑或烦躁',
              options: {
                'gad7-1-0': '完全没有',
                'gad7-1-1': '几天',
                'gad7-1-2': '超过一半的天数',
                'gad7-1-3': '几乎每天'
              }
            }
          }
        }
      ],
      scoringRules: [
        {
          id: 'gad7-total',
          name: 'GAD-7 Total Score',
          description: 'Sum of all GAD-7 item scores',
          calculation: 'sum',
          questionIds: ['gad7-1'],
          ranges: [
            { min: 0, max: 4, label: 'Minimal', description: 'Minimal anxiety symptoms', riskLevel: 'low' },
            { min: 5, max: 9, label: 'Mild', description: 'Mild anxiety symptoms', riskLevel: 'low' },
            { min: 10, max: 14, label: 'Moderate', description: 'Moderate anxiety symptoms', riskLevel: 'medium' },
            { min: 15, max: 21, label: 'Severe', description: 'Severe anxiety symptoms', riskLevel: 'high' }
          ]
        }
      ],
      translations: {
        zh: {
          name: 'GAD-7 焦虑症评估',
          description: '广泛性焦虑障碍7项量表',
          instructions: '在过去的2周里，您被以下问题困扰的频率如何？',
          disclaimer: '此评估仅用于筛查目的，不能替代专业医疗建议。'
        }
      }
    };

    // Stress Assessment
    const stressAssessment: AssessmentType = {
      id: 'stress-scale',
      name: 'Perceived Stress Scale',
      description: 'Assessment of perceived stress levels',
      category: 'stress',
      duration: 4,
      instructions: 'In the last month, how often have you felt or thought a certain way?',
      disclaimer: 'This assessment helps identify stress levels but does not replace professional consultation.',
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [
        {
          id: 'stress-1',
          text: 'How often have you been upset because of something that happened unexpectedly?',
          type: 'scale',
          required: true,
          scaleMin: 0,
          scaleMax: 4,
          scaleLabels: {
            min: 'Never',
            max: 'Very often'
          },
          options: [
            { id: 'stress-1-0', text: 'Never', value: 0 },
            { id: 'stress-1-1', text: 'Almost never', value: 1 },
            { id: 'stress-1-2', text: 'Sometimes', value: 2 },
            { id: 'stress-1-3', text: 'Fairly often', value: 3 },
            { id: 'stress-1-4', text: 'Very often', value: 4 }
          ],
          translations: {
            zh: {
              text: '您多久因为意外发生的事情而感到不安？',
              options: {
                'stress-1-0': '从不',
                'stress-1-1': '几乎从不',
                'stress-1-2': '有时',
                'stress-1-3': '经常',
                'stress-1-4': '非常经常'
              }
            }
          }
        }
      ],
      scoringRules: [
        {
          id: 'stress-total',
          name: 'Perceived Stress Total',
          description: 'Total perceived stress score',
          calculation: 'sum',
          questionIds: ['stress-1'],
          ranges: [
            { min: 0, max: 13, label: 'Low Stress', description: 'Low perceived stress levels', riskLevel: 'low' },
            { min: 14, max: 26, label: 'Moderate Stress', description: 'Moderate perceived stress levels', riskLevel: 'medium' },
            { min: 27, max: 40, label: 'High Stress', description: 'High perceived stress levels', riskLevel: 'high' }
          ]
        }
      ],
      translations: {
        zh: {
          name: '感知压力量表',
          description: '评估感知压力水平',
          instructions: '在过去的一个月里，您多久有过某种感受或想法？',
          disclaimer: '此评估有助于识别压力水平，但不能替代专业咨询。'
        }
      }
    };

    // Store assessments
    this.assessmentTypes.set(phq9Assessment.id, phq9Assessment);
    this.assessmentTypes.set(gad7Assessment.id, gad7Assessment);
    this.assessmentTypes.set(stressAssessment.id, stressAssessment);

    // Categorize questions
    this.categorizeQuestions();
  }

  /**
   * Categorize questions by assessment category
   */
  private categorizeQuestions(): void {
    this.questionsByCategory.clear();

    for (const assessment of this.assessmentTypes.values()) {
      const categoryQuestions = this.questionsByCategory.get(assessment.category) || [];
      categoryQuestions.push(...assessment.questions);
      this.questionsByCategory.set(assessment.category, categoryQuestions);
    }
  }

  /**
   * Get all assessment types
   */
  getAssessmentTypes(): AssessmentType[] {
    return Array.from(this.assessmentTypes.values());
  }

  /**
   * Get assessment types by category
   */
  getAssessmentTypesByCategory(category: AssessmentCategory): AssessmentType[] {
    return Array.from(this.assessmentTypes.values())
      .filter(assessment => assessment.category === category);
  }

  /**
   * Get specific assessment type by ID
   */
  getAssessmentType(id: string): AssessmentType | undefined {
    return this.assessmentTypes.get(id);
  }

  /**
   * Get questions by category
   */
  getQuestionsByCategory(category: AssessmentCategory): Question[] {
    return this.questionsByCategory.get(category) || [];
  }

  /**
   * Add new assessment type
   */
  addAssessmentType(assessment: AssessmentType): void {
    this.assessmentTypes.set(assessment.id, assessment);
    this.categorizeQuestions();
  }

  /**
   * Update existing assessment type
   */
  updateAssessmentType(id: string, updates: Partial<AssessmentType>): boolean {
    const existing = this.assessmentTypes.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.assessmentTypes.set(id, updated);
    this.categorizeQuestions();
    return true;
  }

  /**
   * Remove assessment type
   */
  removeAssessmentType(id: string): boolean {
    const deleted = this.assessmentTypes.delete(id);
    if (deleted) {
      this.categorizeQuestions();
    }
    return deleted;
  }

  /**
   * Set current language for localization
   */
  setLanguage(language: string): void {
    this.currentLanguage = language;
  }



  /**
   * Get localized assessment type
   */
  getLocalizedAssessmentType(id: string, language?: string): AssessmentType | undefined {
    const assessment = this.assessmentTypes.get(id);
    if (!assessment) return undefined;

    const lang = language || this.currentLanguage;
    if (lang === 'en' || !assessment.translations?.[lang]) {
      return assessment;
    }

    const translation = assessment.translations[lang];
    return {
      ...assessment,
      name: translation.name || assessment.name,
      description: translation.description || assessment.description,
      instructions: translation.instructions || assessment.instructions,
      disclaimer: translation.disclaimer || assessment.disclaimer,
      questions: assessment.questions.map(question => this.getLocalizedQuestion(question, lang))
    };
  }

  /**
   * Get localized question
   */
  private getLocalizedQuestion(question: Question, language: string): Question {
    if (language === 'en' || !question.translations?.[language]) {
      return question;
    }

    const translation = question.translations[language];
    return {
      ...question,
      text: translation.text || question.text,
      options: question.options?.map(option => ({
        ...option,
        text: translation.options?.[option.id] || option.text
      })),
      scaleLabels: translation.scaleLabels || question.scaleLabels
    };
  }



  /**
   * Basic validation for question format
   */
  validateQuestion(question: Question): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!question.id?.trim()) {
      errors.push('Question ID is required');
    }

    if (!question.text?.trim()) {
      errors.push('Question text is required');
    }

    if (!['single_choice', 'multiple_choice', 'scale', 'text'].includes(question.type)) {
      errors.push('Invalid question type');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Basic validation for assessment type format
   */
  validateAssessmentType(assessment: AssessmentType): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!assessment.id?.trim()) {
      errors.push('Assessment ID is required');
    }

    if (!assessment.name?.trim()) {
      errors.push('Assessment name is required');
    }

    if (!assessment.questions?.length) {
      errors.push('Assessment must have at least one question');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }


}

// Singleton instance
export const questionBankManager = new QuestionBankManager();
