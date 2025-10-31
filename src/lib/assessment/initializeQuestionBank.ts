/**
 * 问卷库初始化脚本
 * 在应用启动时预加载数据
 */

import { questionBankAdapter } from './QuestionBankAdapter';

let isInitialized = false;

/**
 * 初始化问卷库数据
 */
export async function initializeQuestionBank(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    console.log('Initializing question bank data...');
    await questionBankAdapter.initialize();
    isInitialized = true;
    console.log('Question bank data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize question bank data:', error);
    // 即使初始化失败，也标记为已初始化，避免重复尝试
    isInitialized = true;
  }
}

/**
 * 检查是否已初始化
 */
export function isQuestionBankInitialized(): boolean {
  return isInitialized;
}

/**
 * 重新初始化（用于开发环境的热重载）
 */
export async function reinitializeQuestionBank(): Promise<void> {
  isInitialized = false;
  await initializeQuestionBank();
}
