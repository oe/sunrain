/**
 * 问卷加载器接口
 * 定义问卷加载器的通用接口
 */

import type {
  Questionnaire,
  QuestionnaireTranslation,
  QuestionnaireIndex,
  QuestionnaireCategory,
  Language,
  QuestionnaireSearchResult,
  QuestionnaireFilter
} from '@/types/questionnaire';

export interface IQuestionnaireLoader {
  loadIndex(): Promise<QuestionnaireIndex>;
  loadCategories(): Promise<QuestionnaireCategory[]>;
  loadQuestionnaire(id: string): Promise<Questionnaire>;
  loadQuestionnaireTranslation(id: string, language: Language): Promise<QuestionnaireTranslation>;
  loadAllQuestionnaires(): Promise<Questionnaire[]>;
  searchQuestionnaires(query: string, filter?: QuestionnaireFilter): Promise<QuestionnaireSearchResult[]>;
  getQuestionnaires(
    page?: number,
    limit?: number,
    filter?: QuestionnaireFilter
  ): Promise<{ questionnaires: Questionnaire[]; total: number; page: number; limit: number }>;
  questionnaireExists(id: string): Promise<boolean>;
  getSupportedLanguages(id: string): Promise<Language[]>;
  clearCache(): void;
  clearCacheForQuestionnaire(id: string): void;
}
