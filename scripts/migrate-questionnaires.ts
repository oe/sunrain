#!/usr/bin/env tsx

/**
 * 问卷数据迁移脚本
 * 将现有的硬编码问卷数据迁移到新的文件系统结构
 */

import fs from 'fs';
import path from 'path';

// 从现有的QuestionBankManager中提取的数据
const MIGRATION_DATA = {
  'phq-9': {
    metadata: {
      id: 'phq-9',
      titleKey: 'PHQ-9 Depression Assessment',
      descriptionKey: 'Patient Health Questionnaire-9 for depression screening',
      introductionKey: 'The PHQ-9 is a validated depression screening tool consisting of 9 questions that can help identify the severity of depressive symptoms.',
      purposeKey: 'This scale is designed to help identify and assess depressive symptoms, but it cannot replace professional medical diagnosis.',
      categoryId: 'depression',
      tags: ['validated', 'screening', 'quick'],
      estimatedMinutes: 5,
      questionCount: 9,
      difficulty: 'beginner',
      validatedScoring: true,
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
      instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      disclaimer: 'This assessment is for screening purposes only and does not replace professional medical advice.',
      isFeatured: true,
      isActive: true,
      requiresAuth: false,
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    questions: [
      {
        id: 'q1',
        text: 'Little interest or pleasure in doing things',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 'q2',
        text: 'Feeling down, depressed, or hopeless',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 'q3',
        text: 'Trouble falling or staying asleep, or sleeping too much',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 'q4',
        text: 'Feeling tired or having little energy',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 'q5',
        text: 'Poor appetite or overeating',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 'q6',
        text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 'q7',
        text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 'q8',
        text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      },
      {
        id: 'q9',
        text: 'Thoughts that you would be better off dead, or of hurting yourself',
        type: 'single_choice',
        required: true,
        weight: 1,
        options: [
          { id: 'not_at_all', text: 'Not at all', value: 0 },
          { id: 'several_days', text: 'Several days', value: 1 },
          { id: 'more_than_half', text: 'More than half the days', value: 2 },
          { id: 'nearly_every_day', text: 'Nearly every day', value: 3 }
        ]
      }
    ],
    scoringRules: [
      {
        id: 'total_score',
        name: 'PHQ-9 Total Score',
        description: 'Sum of all item scores',
        calculation: 'sum',
        questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'],
        ranges: [
          { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression symptoms', riskLevel: 'low' },
          { min: 5, max: 9, label: 'Mild', description: 'Mild depression symptoms', riskLevel: 'low' },
          { min: 10, max: 14, label: 'Moderate', description: 'Moderate depression symptoms', riskLevel: 'medium' },
          { min: 15, max: 19, label: 'Moderately Severe', description: 'Moderately severe depression symptoms', riskLevel: 'high' },
          { min: 20, max: 27, label: 'Severe', description: 'Severe depression symptoms', riskLevel: 'high' }
        ]
      }
    ],
    interpretations: [
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
    ]
  }
};

async function main() {
  console.log('🚀 开始迁移问卷数据...\n');

  const dataPath = 'src/data/questionnaires';
  
  // 确保数据目录存在
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  // 迁移每个问卷
  for (const [questionnaireId, data] of Object.entries(MIGRATION_DATA)) {
    console.log(`📝 迁移问卷: ${questionnaireId}`);
    
    const questionnairePath = path.join(dataPath, questionnaireId);
    
    // 创建问卷目录
    if (!fs.existsSync(questionnairePath)) {
      fs.mkdirSync(questionnairePath, { recursive: true });
    }

    // 写入元数据
    const metadataPath = path.join(questionnairePath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(data.metadata, null, 2));

    // 写入问题
    const questionsPath = path.join(questionnairePath, 'questions.json');
    fs.writeFileSync(questionsPath, JSON.stringify({ questions: data.questions }, null, 2));

    // 写入评分规则
    const scoringPath = path.join(questionnairePath, 'scoring.json');
    fs.writeFileSync(scoringPath, JSON.stringify({ scoringRules: data.scoringRules }, null, 2));

    // 写入解释
    const interpretationsPath = path.join(questionnairePath, 'interpretations.json');
    fs.writeFileSync(interpretationsPath, JSON.stringify({ interpretations: data.interpretations }, null, 2));

    console.log(`   ✅ 完成: ${questionnaireId}`);
  }

  // 更新索引文件
  const indexPath = path.join(dataPath, 'index.json');
  const indexData = {
    questionnaires: Object.keys(MIGRATION_DATA),
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));

  console.log('\n🎉 迁移完成！');
  console.log(`📊 迁移了 ${Object.keys(MIGRATION_DATA).length} 个问卷`);
  console.log(`📁 数据目录: ${dataPath}`);
}

// 运行迁移
main().catch(error => {
  console.error('❌ 迁移失败:', error);
  process.exit(1);
});
