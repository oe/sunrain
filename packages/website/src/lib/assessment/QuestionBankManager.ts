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
        },
        {
          id: 'phq9-3',
          text: 'Trouble falling or staying asleep, or sleeping too much',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-3-0', text: 'Not at all', value: 0 },
            { id: 'phq9-3-1', text: 'Several days', value: 1 },
            { id: 'phq9-3-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-3-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '入睡困难、睡眠不稳或睡眠过多',
              options: {
                'phq9-3-0': '完全没有',
                'phq9-3-1': '几天',
                'phq9-3-2': '超过一半的天数',
                'phq9-3-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'phq9-4',
          text: 'Feeling tired or having little energy',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-4-0', text: 'Not at all', value: 0 },
            { id: 'phq9-4-1', text: 'Several days', value: 1 },
            { id: 'phq9-4-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-4-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '感到疲倦或精力不足',
              options: {
                'phq9-4-0': '完全没有',
                'phq9-4-1': '几天',
                'phq9-4-2': '超过一半的天数',
                'phq9-4-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'phq9-5',
          text: 'Poor appetite or overeating',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-5-0', text: 'Not at all', value: 0 },
            { id: 'phq9-5-1', text: 'Several days', value: 1 },
            { id: 'phq9-5-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-5-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '食欲不振或暴饮暴食',
              options: {
                'phq9-5-0': '完全没有',
                'phq9-5-1': '几天',
                'phq9-5-2': '超过一半的天数',
                'phq9-5-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'phq9-6',
          text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-6-0', text: 'Not at all', value: 0 },
            { id: 'phq9-6-1', text: 'Several days', value: 1 },
            { id: 'phq9-6-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-6-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '觉得自己很糟糕，或者觉得自己是个失败者，或者让自己或家人失望',
              options: {
                'phq9-6-0': '完全没有',
                'phq9-6-1': '几天',
                'phq9-6-2': '超过一半的天数',
                'phq9-6-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'phq9-7',
          text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-7-0', text: 'Not at all', value: 0 },
            { id: 'phq9-7-1', text: 'Several days', value: 1 },
            { id: 'phq9-7-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-7-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '难以集中注意力做事，比如看报纸或看电视',
              options: {
                'phq9-7-0': '完全没有',
                'phq9-7-1': '几天',
                'phq9-7-2': '超过一半的天数',
                'phq9-7-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'phq9-8',
          text: 'Moving or speaking so slowly that other people could have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-8-0', text: 'Not at all', value: 0 },
            { id: 'phq9-8-1', text: 'Several days', value: 1 },
            { id: 'phq9-8-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-8-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '动作或说话缓慢到别人可能已经注意到，或者相反 - 坐立不安或烦躁，比平时活动得多',
              options: {
                'phq9-8-0': '完全没有',
                'phq9-8-1': '几天',
                'phq9-8-2': '超过一半的天数',
                'phq9-8-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'phq9-9',
          text: 'Thoughts that you would be better off dead, or of hurting yourself',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'phq9-9-0', text: 'Not at all', value: 0 },
            { id: 'phq9-9-1', text: 'Several days', value: 1 },
            { id: 'phq9-9-2', text: 'More than half the days', value: 2 },
            { id: 'phq9-9-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '想到死了会更好，或者伤害自己',
              options: {
                'phq9-9-0': '完全没有',
                'phq9-9-1': '几天',
                'phq9-9-2': '超过一半的天数',
                'phq9-9-3': '几乎每天'
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
          questionIds: ['phq9-1', 'phq9-2', 'phq9-3', 'phq9-4', 'phq9-5', 'phq9-6', 'phq9-7', 'phq9-8', 'phq9-9'],
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
          type: 'single_choice',
          required: true,
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
        },
        {
          id: 'gad7-2',
          text: 'Not being able to stop or control worrying',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'gad7-2-0', text: 'Not at all', value: 0 },
            { id: 'gad7-2-1', text: 'Several days', value: 1 },
            { id: 'gad7-2-2', text: 'More than half the days', value: 2 },
            { id: 'gad7-2-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '无法停止或控制担忧',
              options: {
                'gad7-2-0': '完全没有',
                'gad7-2-1': '几天',
                'gad7-2-2': '超过一半的天数',
                'gad7-2-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'gad7-3',
          text: 'Worrying too much about different things',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'gad7-3-0', text: 'Not at all', value: 0 },
            { id: 'gad7-3-1', text: 'Several days', value: 1 },
            { id: 'gad7-3-2', text: 'More than half the days', value: 2 },
            { id: 'gad7-3-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '对很多事情过度担忧',
              options: {
                'gad7-3-0': '完全没有',
                'gad7-3-1': '几天',
                'gad7-3-2': '超过一半的天数',
                'gad7-3-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'gad7-4',
          text: 'Trouble relaxing',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'gad7-4-0', text: 'Not at all', value: 0 },
            { id: 'gad7-4-1', text: 'Several days', value: 1 },
            { id: 'gad7-4-2', text: 'More than half the days', value: 2 },
            { id: 'gad7-4-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '难以放松',
              options: {
                'gad7-4-0': '完全没有',
                'gad7-4-1': '几天',
                'gad7-4-2': '超过一半的天数',
                'gad7-4-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'gad7-5',
          text: 'Being so restless that it is hard to sit still',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'gad7-5-0', text: 'Not at all', value: 0 },
            { id: 'gad7-5-1', text: 'Several days', value: 1 },
            { id: 'gad7-5-2', text: 'More than half the days', value: 2 },
            { id: 'gad7-5-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '坐立不安，难以静坐',
              options: {
                'gad7-5-0': '完全没有',
                'gad7-5-1': '几天',
                'gad7-5-2': '超过一半的天数',
                'gad7-5-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'gad7-6',
          text: 'Becoming easily annoyed or irritable',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'gad7-6-0', text: 'Not at all', value: 0 },
            { id: 'gad7-6-1', text: 'Several days', value: 1 },
            { id: 'gad7-6-2', text: 'More than half the days', value: 2 },
            { id: 'gad7-6-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '容易生气或易怒',
              options: {
                'gad7-6-0': '完全没有',
                'gad7-6-1': '几天',
                'gad7-6-2': '超过一半的天数',
                'gad7-6-3': '几乎每天'
              }
            }
          }
        },
        {
          id: 'gad7-7',
          text: 'Feeling afraid as if something awful might happen',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'gad7-7-0', text: 'Not at all', value: 0 },
            { id: 'gad7-7-1', text: 'Several days', value: 1 },
            { id: 'gad7-7-2', text: 'More than half the days', value: 2 },
            { id: 'gad7-7-3', text: 'Nearly every day', value: 3 }
          ],
          translations: {
            zh: {
              text: '感到害怕，好像会发生什么可怕的事情',
              options: {
                'gad7-7-0': '完全没有',
                'gad7-7-1': '几天',
                'gad7-7-2': '超过一半的天数',
                'gad7-7-3': '几乎每天'
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
          questionIds: ['gad7-1', 'gad7-2', 'gad7-3', 'gad7-4', 'gad7-5', 'gad7-6', 'gad7-7'],
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


}

// Singleton instance
export const questionBankManager = new QuestionBankManager();
