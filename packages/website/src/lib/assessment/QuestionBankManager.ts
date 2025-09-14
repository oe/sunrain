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
          name: 'PHQ-9 抑郁筛查量表',
          description: '患者健康问卷-9，用于抑郁症状筛查',
          instructions: '在过去的两周里，您是否经常被以下问题困扰？',
          disclaimer: '此评估仅用于筛查目的，不能替代专业医疗建议。'
        },
        es: {
          name: 'Evaluación de Depresión PHQ-9',
          description: 'Cuestionario de Salud del Paciente-9 para detección de depresión',
          instructions: 'Durante las últimas 2 semanas, ¿con qué frecuencia se ha sentido molesto por alguno de los siguientes problemas?',
          disclaimer: 'Esta evaluación es solo para fines de detección y no reemplaza el consejo médico profesional.'
        },
        ja: {
          name: 'PHQ-9 うつ病評価',
          description: 'うつ病スクリーニング用患者健康質問票-9',
          instructions: '過去2週間、以下の問題のいずれかにどの程度悩まされましたか？',
          disclaimer: 'この評価はスクリーニング目的のみであり、専門的な医療アドバイスに代わるものではありません。'
        },
        ko: {
          name: 'PHQ-9 우울증 평가',
          description: '우울증 스크리닝을 위한 환자 건강 설문지-9',
          instructions: '지난 2주 동안 다음 문제들 중 어떤 것에 얼마나 자주 괴로워하셨습니까?',
          disclaimer: '이 평가는 스크리닝 목적으로만 사용되며 전문적인 의료 조언을 대체하지 않습니다.'
        },
        hi: {
          name: 'PHQ-9 अवसाद मूल्यांकन',
          description: 'अवसाद स्क्रीनिंग के लिए रोगी स्वास्थ्य प्रश्नावली-9',
          instructions: 'पिछले 2 सप्ताह में, आप निम्नलिखित समस्याओं में से किसी से कितनी बार परेशान हुए हैं?',
          disclaimer: 'यह मूल्यांकन केवल स्क्रीनिंग उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह को प्रतिस्थापित नहीं करता है।'
        },
        ar: {
          name: 'تقييم الاكتئاب PHQ-9',
          description: 'استبيان صحة المريض-9 لفحص الاكتئاب',
          instructions: 'خلال الأسبوعين الماضيين، كم مرة أزعجتك أي من المشاكل التالية؟',
          disclaimer: 'هذا التقييم مخصص لأغراض الفحص فقط ولا يحل محل المشورة الطبية المهنية.'
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
          name: 'GAD-7 焦虑筛查量表',
          description: '广泛性焦虑障碍7项量表',
          instructions: '在过去的两周里，您是否经常被以下问题困扰？',
          disclaimer: '此评估仅用于筛查目的，不能替代专业医疗建议。'
        },
        es: {
          name: 'Evaluación de Ansiedad GAD-7',
          description: 'Escala de 7 elementos para el Trastorno de Ansiedad Generalizada',
          instructions: 'Durante las últimas 2 semanas, ¿con qué frecuencia se ha sentido molesto por los siguientes problemas?',
          disclaimer: 'Esta evaluación es solo para fines de detección y no reemplaza el consejo médico profesional.'
        },
        ja: {
          name: 'GAD-7 不安評価',
          description: '全般性不安障害7項目スケール',
          instructions: '過去2週間、以下の問題のいずれかにどの程度悩まされましたか？',
          disclaimer: 'この評価はスクリーニング目的のみであり、専門的な医療アドバイスに代わるものではありません。'
        },
        ko: {
          name: 'GAD-7 불안 평가',
          description: '범불안장애 7항목 척도',
          instructions: '지난 2주 동안 다음 문제들 중 어떤 것에 얼마나 자주 괴로워하셨습니까?',
          disclaimer: '이 평가는 스크리닝 목적으로만 사용되며 전문적인 의료 조언을 대체하지 않습니다.'
        },
        hi: {
          name: 'GAD-7 चिंता मूल्यांकन',
          description: 'सामान्यीकृत चिंता विकार 7-आइटम स्केल',
          instructions: 'पिछले 2 सप्ताह में, आप निम्नलिखित समस्याओं में से किसी से कितनी बार परेशान हुए हैं?',
          disclaimer: 'यह मूल्यांकन केवल स्क्रीनिंग उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह को प्रतिस्थापित नहीं करता है।'
        },
        ar: {
          name: 'تقييم القلق GAD-7',
          description: 'مقياس اضطراب القلق العام 7 عناصر',
          instructions: 'خلال الأسبوعين الماضيين، كم مرة أزعجتك أي من المشاكل التالية؟',
          disclaimer: 'هذا التقييم مخصص لأغراض الفحص فقط ولا يحل محل المشورة الطبية المهنية.'
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
          instructions: '在过去的一个月里，您多久会有以下感受或想法？',
          disclaimer: '此评估有助于识别压力水平，但不能替代专业咨询。'
        },
        es: {
          name: 'Escala de Estrés Percibido',
          description: 'Evaluación de los niveles de estrés percibido',
          instructions: 'En el último mes, ¿con qué frecuencia se ha sentido o pensado de cierta manera?',
          disclaimer: 'Esta evaluación ayuda a identificar los niveles de estrés pero no reemplaza la consulta profesional.'
        },
        ja: {
          name: '知覚ストレス尺度',
          description: '知覚ストレスレベルの評価',
          instructions: '過去1ヶ月間、どの程度の頻度で特定の方法で感じたり考えたりしましたか？',
          disclaimer: 'この評価はストレスレベルを特定するのに役立ちますが、専門的な相談に代わるものではありません。'
        },
        ko: {
          name: '지각된 스트레스 척도',
          description: '지각된 스트레스 수준 평가',
          instructions: '지난 한 달 동안 특정한 방식으로 느끼거나 생각한 빈도는 얼마나 되었습니까?',
          disclaimer: '이 평가는 스트레스 수준을 파악하는 데 도움이 되지만 전문적인 상담을 대체하지는 않습니다.'
        },
        hi: {
          name: 'अनुभूत तनाव स्केल',
          description: 'अनुभूत तनाव स्तर का मूल्यांकन',
          instructions: 'पिछले महीने में, आपने कितनी बार एक निश्चित तरीके से महसूस किया या सोचा?',
          disclaimer: 'यह मूल्यांकन तनाव स्तर की पहचान करने में मदद करता है लेकिन पेशेवर परामर्श को प्रतिस्थापित नहीं करता है।'
        },
        ar: {
          name: 'مقياس الإجهاد المدرك',
          description: 'تقييم مستويات الإجهاد المدرك',
          instructions: 'في الشهر الماضي، كم مرة شعرت أو فكرت بطريقة معينة؟',
          disclaimer: 'هذا التقييم يساعد في تحديد مستويات الإجهاد ولكنه لا يحل محل الاستشارة المهنية.'
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
