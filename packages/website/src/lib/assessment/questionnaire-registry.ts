/**
 * 问卷注册表
 *
 * 初始化和注册所有可用的问卷
 */

import { questionnaireManager } from './QuestionnaireManager';
import { QuestionnaireFactory } from './QuestionnaireFactory';

/**
 * 初始化默认问卷
 */
export function initializeQuestionnaires() {
  // 注册PHQ-9抑郁症筛查量表
  const phq9 = QuestionnaireFactory.createPHQ9();
  questionnaireManager.registerQuestionnaire(phq9);

  // 注册GAD-7焦虑症筛查量表
  const gad7 = QuestionnaireFactory.createGAD7();
  questionnaireManager.registerQuestionnaire(gad7);

  console.log('✅ Questionnaires initialized successfully');
}

/**
 * 获取所有已注册的问卷ID
 */
export function getRegisteredQuestionnaireIds(): string[] {
  return ['phq-9', 'gad-7']; // 这里应该从questionnaireManager获取，但目前没有公开方法
}

/**
 * 检查问卷是否已注册
 */
export function isQuestionnaireRegistered(id: string): boolean {
  return questionnaireManager.getQuestionnaire(id) !== undefined;
}

// 自动初始化
if (typeof window !== 'undefined') {
  // 在浏览器环境中自动初始化
  initializeQuestionnaires();
}
