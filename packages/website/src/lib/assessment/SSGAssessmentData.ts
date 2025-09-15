/**
 * SSG 评测数据获取器
 * 在构建时获取评测数据，避免客户端闪烁
 */

import { initializeQuestionBank } from './initializeQuestionBank';
import { questionBankAdapter } from './QuestionBankAdapter';
import type { Language } from '@/types/questionnaire';
import type { AssessmentType } from '@/types/assessment';

export interface SSGAssessmentData {
  assessments: AssessmentType[];
  categories: string[];
  assessmentsByCategory: Record<string, AssessmentType[]>;
}

/**
 * 获取 SSG 评测数据
 */
export async function getSSGAssessmentData(language: Language): Promise<SSGAssessmentData> {
  // 初始化问卷库数据
  await initializeQuestionBank();
  
  // 获取本地化的评测数据
  const assessments = questionBankAdapter.getAllLocalizedAssessmentTypes(language);
  const categories = [...new Set(assessments.map((a) => a.category))];
  
  // 按类别分组
  const assessmentsByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = assessments.filter(a => a.category === category);
      return acc;
    },
    {} as Record<string, AssessmentType[]>
  );

  return {
    assessments,
    categories,
    assessmentsByCategory
  };
}

/**
 * 获取所有语言的 SSG 评测数据
 */
export async function getAllSSGAssessmentData(): Promise<Record<Language, SSGAssessmentData>> {
  const languages: Language[] = ['en', 'zh', 'es', 'ja', 'ko', 'hi', 'ar'];
  const result: Record<Language, SSGAssessmentData> = {} as any;
  
  for (const lang of languages) {
    result[lang] = await getSSGAssessmentData(lang);
  }
  
  return result;
}
