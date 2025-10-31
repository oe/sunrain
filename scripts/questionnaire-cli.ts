#!/usr/bin/env tsx

/**
 * 问卷管理CLI工具
 * 用于验证、管理和维护问卷数据
 */

import { QuestionnaireValidator } from '../src/lib/questionnaire/QuestionnaireValidator';
import { getQuestionnaireManager } from '../src/lib/questionnaire/QuestionnaireFactory';
// import fs from 'fs';
// import path from 'path';

const COMMANDS = {
  validate: '验证所有问卷数据',
  stats: '显示问卷统计信息',
  list: '列出所有问卷',
  info: '显示特定问卷信息',
  help: '显示帮助信息'
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  const dataPath = 'src/data/questionnaires';
  const supportedLanguages = ['en', 'zh', 'es', 'ja', 'ko', 'hi', 'ar'];

  try {
    switch (command) {
      case 'validate':
        await validateQuestionnaires(dataPath, supportedLanguages);
        break;
      case 'stats':
        await showStats();
        break;
      case 'list':
        await listQuestionnaires();
        break;
      case 'info':
        const questionnaireId = args[1];
        if (!questionnaireId) {
          console.error('❌ 请提供问卷ID');
          process.exit(1);
        }
        await showQuestionnaireInfo(questionnaireId);
        break;
      default:
        console.error(`❌ 未知命令: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 执行失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function validateQuestionnaires(dataPath: string, supportedLanguages: string[]) {
  console.log('🔍 正在验证问卷数据...\n');

  const validator = new QuestionnaireValidator(dataPath, supportedLanguages as any);
  const result = await validator.validateAllQuestionnaires();

  console.log('📊 验证结果:');
  console.log(`   总计: ${result.summary.total}`);
  console.log(`   ✅ 有效: ${result.summary.valid}`);
  console.log(`   ❌ 无效: ${result.summary.invalid}\n`);

  if (result.valid.length > 0) {
    console.log('✅ 有效的问卷:');
    result.valid.forEach(id => console.log(`   - ${id}`));
    console.log('');
  }

  if (result.invalid.length > 0) {
    console.log('❌ 无效的问卷:');
    result.invalid.forEach(({ id, errors }) => {
      console.log(`   - ${id}:`);
      errors.forEach(error => console.log(`     • ${error}`));
    });
    console.log('');

    console.log('📈 错误统计:');
    Object.entries(result.summary.errors).forEach(([errorType, count]) => {
      console.log(`   ${errorType}: ${count}`);
    });
  }

  if (result.summary.invalid === 0) {
    console.log('🎉 所有问卷数据验证通过！');
  } else {
    process.exit(1);
  }
}

async function showStats() {
  console.log('📊 正在获取问卷统计信息...\n');

  const manager = await getQuestionnaireManager();
  const stats = manager.getQuestionnaireStats();

  console.log('📈 问卷统计:');
  console.log(`   总计: ${stats.total}`);
  console.log(`   活跃: ${stats.active}`);
  console.log(`   特色: ${stats.featured}\n`);

  console.log('📂 按类别分布:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });
  console.log('');

  console.log('🎯 按难度分布:');
  Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
    console.log(`   ${difficulty}: ${count}`);
  });
}

async function listQuestionnaires() {
  console.log('📋 正在获取问卷列表...\n');

  const manager = await getQuestionnaireManager();
  const questionnaires = manager.getQuestionnaires();

  console.log('📝 问卷列表:');
  questionnaires.forEach(questionnaire => {
    const status = questionnaire.metadata.isActive ? '✅' : '❌';
    const featured = questionnaire.metadata.isFeatured ? '⭐' : '  ';
    console.log(`   ${status} ${featured} ${questionnaire.metadata.id} - ${questionnaire.metadata.titleKey}`);
    console.log(`      类别: ${questionnaire.metadata.categoryId}`);
    console.log(`      问题数: ${questionnaire.metadata.questionCount}`);
    console.log(`      预计时间: ${questionnaire.metadata.estimatedMinutes}分钟`);
    console.log(`      难度: ${questionnaire.metadata.difficulty}`);
    console.log('');
  });
}

async function showQuestionnaireInfo(questionnaireId: string) {
  console.log(`🔍 正在获取问卷信息: ${questionnaireId}\n`);

  const manager = await getQuestionnaireManager();
  const questionnaire = manager.getQuestionnaire(questionnaireId);

  if (!questionnaire) {
    console.error(`❌ 未找到问卷: ${questionnaireId}`);
    process.exit(1);
  }

  console.log('📋 问卷信息:');
  console.log(`   ID: ${questionnaire.metadata.id}`);
  console.log(`   标题: ${questionnaire.metadata.titleKey}`);
  console.log(`   描述: ${questionnaire.metadata.descriptionKey}`);
  console.log(`   类别: ${questionnaire.metadata.categoryId}`);
  console.log(`   问题数: ${questionnaire.metadata.questionCount}`);
  console.log(`   预计时间: ${questionnaire.metadata.estimatedMinutes}分钟`);
  console.log(`   难度: ${questionnaire.metadata.difficulty}`);
  console.log(`   版本: ${questionnaire.metadata.version}`);
  console.log(`   创建时间: ${questionnaire.metadata.createdAt}`);
  console.log(`   更新时间: ${questionnaire.metadata.updatedAt}`);
  console.log(`   活跃: ${questionnaire.metadata.isActive ? '是' : '否'}`);
  console.log(`   特色: ${questionnaire.metadata.isFeatured ? '是' : '否'}`);
  console.log(`   需要认证: ${questionnaire.metadata.requiresAuth ? '是' : '否'}`);
  console.log(`   验证评分: ${questionnaire.metadata.validatedScoring ? '是' : '否'}`);
  console.log('');

  console.log('🏷️ 标签:');
  questionnaire.metadata.tags.forEach(tag => console.log(`   - ${tag}`));
  console.log('');

  console.log('📝 问题列表:');
  questionnaire.questions.forEach((question, index) => {
    console.log(`   ${index + 1}. ${question.text} (${question.type})`);
  });
  console.log('');

  console.log('📊 评分规则:');
  questionnaire.scoringRules.forEach(rule => {
    console.log(`   - ${rule.name}: ${rule.calculation}`);
    console.log(`     问题: ${rule.questionIds.join(', ')}`);
    console.log(`     范围: ${rule.ranges.length} 个`);
  });
}

function showHelp() {
  console.log('📚 问卷管理CLI工具\n');
  console.log('用法: npm run questionnaire <command> [options]\n');
  console.log('可用命令:');
  Object.entries(COMMANDS).forEach(([cmd, desc]) => {
    console.log(`   ${cmd.padEnd(10)} ${desc}`);
  });
  console.log('\n示例:');
  console.log('   npm run questionnaire validate          # 验证所有问卷');
  console.log('   npm run questionnaire stats             # 显示统计信息');
  console.log('   npm run questionnaire list              # 列出所有问卷');
  console.log('   npm run questionnaire info phq-9        # 显示PHQ-9问卷信息');
}

// 运行主函数
main().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});
