/**
 * 问卷翻译系统类型定义
 */

export type SupportedLocale = 'en' | 'zh' | 'ar' | 'es' | 'hi' | 'ja' | 'ko';

export interface QuestionnaireTranslations {
  /** 问卷基本信息 */
  title: string;
  description: string;
  introduction: string;
  purpose: string;

  /** 问题内容 */
  questions: {
    [questionId: string]: {
      text: string;
      options?: string[];
      instruction?: string;
    };
  };

  /** 结果解读 */
  interpretations: {
    [scoreRange: string]: {
      level: string;
      interpretation: string;
      recommendations: string;
      supportResources?: string;
    };
  };

  /** 分类信息 */
  category: {
    name: string;
    description: string;
  };
}

export type QuestionnaireTranslationKey = keyof QuestionnaireTranslations;
