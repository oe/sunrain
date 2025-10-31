/**
 * PHQ-9 抑郁症筛查量表 - 英文翻译
 */

import type { QuestionnaireTranslations } from '../types';

const phq9En: QuestionnaireTranslations = {
  title: 'PHQ-9 Depression Screening',
  description: 'A brief questionnaire to screen for depression symptoms',
  introduction: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  purpose: 'This questionnaire helps identify symptoms of depression and their severity.',

  questions: {
    q1: {
      text: 'Little interest or pleasure in doing things',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    },
    q2: {
      text: 'Feeling down, depressed, or hopeless',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    },
    q3: {
      text: 'Trouble falling or staying asleep, or sleeping too much',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    },
    q4: {
      text: 'Feeling tired or having little energy',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    },
    q5: {
      text: 'Poor appetite or overeating',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    },
    q6: {
      text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    },
    q7: {
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    },
    q8: {
      text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    },
    q9: {
      text: 'Thoughts that you would be better off dead, or of hurting yourself',
      options: [
        'Not at all',
        'Several days',
        'More than half the days',
        'Nearly every day'
      ]
    }
  },

  interpretations: {
    '0-4': {
      level: 'Minimal',
      interpretation: 'Your responses suggest minimal depression symptoms.',
      recommendations: 'Continue maintaining healthy lifestyle habits and monitor your mood.'
    },
    '5-9': {
      level: 'Mild',
      interpretation: 'Your responses suggest mild depression symptoms.',
      recommendations: 'Consider lifestyle changes, stress management, and monitoring symptoms. If symptoms persist, consider speaking with a healthcare provider.'
    },
    '10-14': {
      level: 'Moderate',
      interpretation: 'Your responses suggest moderate depression symptoms.',
      recommendations: 'It is recommended to speak with a healthcare provider about your symptoms. Treatment options may include therapy or medication.',
      supportResources: 'Consider contacting a mental health professional or your primary care doctor.'
    },
    '15-19': {
      level: 'Moderately Severe',
      interpretation: 'Your responses suggest moderately severe depression symptoms.',
      recommendations: 'It is important to seek professional help. Treatment is likely needed and can be very effective.',
      supportResources: 'Please contact a mental health professional, your doctor, or a crisis helpline if you are having thoughts of self-harm.'
    },
    '20-27': {
      level: 'Severe',
      interpretation: 'Your responses suggest severe depression symptoms.',
      recommendations: 'Immediate professional help is strongly recommended. Depression is treatable, and help is available.',
      supportResources: 'Please contact a mental health professional immediately, go to an emergency room, or call a crisis helpline if you are having thoughts of self-harm.'
    }
  },

  category: {
    name: 'Depression',
    description: 'Assessments for depression and mood-related symptoms'
  }
};

export default phq9En;
