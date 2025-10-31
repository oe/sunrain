/**
 * PHQ-9 抑郁症筛查量表 - 中文翻译
 */

import type { QuestionnaireTranslations } from '../types';

const phq9Zh: QuestionnaireTranslations = {
  title: 'PHQ-9 抑郁症筛查量表',
  description: '用于筛查抑郁症状的简短问卷',
  introduction: '在过去的2周里，您有多经常被以下问题困扰？',
  purpose: '此问卷有助于识别抑郁症状及其严重程度。',

  questions: {
    q1: {
      text: '对事物缺乏兴趣或乐趣',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    },
    q2: {
      text: '感到沮丧、抑郁或绝望',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    },
    q3: {
      text: '入睡困难、睡眠不稳或睡眠过多',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    },
    q4: {
      text: '感到疲倦或精力不足',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    },
    q5: {
      text: '食欲不振或暴饮暴食',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    },
    q6: {
      text: '觉得自己很糟糕，或觉得自己是个失败者，或让自己或家人失望',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    },
    q7: {
      text: '难以集中注意力做事，如阅读报纸或看电视',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    },
    q8: {
      text: '动作或说话缓慢到别人都注意到了，或者相反——烦躁不安或坐立不安，比平时活动更多',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    },
    q9: {
      text: '有不如死了算了或伤害自己的想法',
      options: [
        '完全没有',
        '几天',
        '超过一半的天数',
        '几乎每天'
      ]
    }
  },

  interpretations: {
    '0-4': {
      level: '轻微',
      interpretation: '您的回答表明抑郁症状轻微。',
      recommendations: '继续保持健康的生活方式习惯，并监测您的情绪状态。'
    },
    '5-9': {
      level: '轻度',
      interpretation: '您的回答表明有轻度抑郁症状。',
      recommendations: '考虑改变生活方式、管理压力并监测症状。如果症状持续，建议咨询医疗保健提供者。'
    },
    '10-14': {
      level: '中度',
      interpretation: '您的回答表明有中度抑郁症状。',
      recommendations: '建议就您的症状咨询医疗保健提供者。治疗选择可能包括心理治疗或药物治疗。',
      supportResources: '考虑联系心理健康专业人士或您的主治医生。'
    },
    '15-19': {
      level: '中重度',
      interpretation: '您的回答表明有中重度抑郁症状。',
      recommendations: '寻求专业帮助很重要。可能需要治疗，而且治疗可能非常有效。',
      supportResources: '如果您有自伤想法，请联系心理健康专业人士、您的医生或危机热线。'
    },
    '20-27': {
      level: '重度',
      interpretation: '您的回答表明有重度抑郁症状。',
      recommendations: '强烈建议立即寻求专业帮助。抑郁症是可以治疗的，帮助是可获得的。',
      supportResources: '如果您有自伤想法，请立即联系心理健康专业人士、前往急诊室或拨打危机热线。'
    }
  },

  category: {
    name: '抑郁症',
    description: '抑郁症和情绪相关症状的评估'
  }
};

export default phq9Zh;
