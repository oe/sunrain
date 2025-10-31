/**
 * 问卷注册表
 *
 * 初始化和注册所有可用的问卷
 */

import { questionBankAdapter } from './QuestionBankAdapter';

/**
 * 初始化默认问卷
 */
export async function initializeQuestionnaires() {
  try {
    await questionBankAdapter.initialize();
    console.log('✅ Questionnaires initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize questionnaires:', error);
  }
}

/**
 * 获取所有已注册的问卷ID
 */
export function getRegisteredQuestionnaireIds(): string[] {
  return questionBankAdapter.getAssessmentTypes().map(assessment => assessment.id);
}

/**
 * 检查问卷是否已注册
 */
export function isQuestionnaireRegistered(id: string): boolean {
  return questionBankAdapter.getAssessmentType(id) !== undefined;
}

// 自动初始化
if (typeof window !== 'undefined') {
  // 在浏览器环境中自动初始化
  initializeQuestionnaires();
}
