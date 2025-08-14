/**
 * 问卷注册表
 *
 * 初始化和注册所有可用的问卷
 */

import { questionBankManager } from './QuestionBankManager';

/**
 * 初始化默认问卷
 */
export function initializeQuestionnaires() {
  // QuestionBankManager already initializes default assessments in constructor
  console.log('✅ Questionnaires initialized successfully');
}

/**
 * 获取所有已注册的问卷ID
 */
export function getRegisteredQuestionnaireIds(): string[] {
  return questionBankManager.getAssessmentTypes().map(assessment => assessment.id);
}

/**
 * 检查问卷是否已注册
 */
export function isQuestionnaireRegistered(id: string): boolean {
  return questionBankManager.getAssessmentType(id) !== undefined;
}

// 自动初始化
if (typeof window !== 'undefined') {
  // 在浏览器环境中自动初始化
  initializeQuestionnaires();
}
