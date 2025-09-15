/**
 * 问卷工厂
 * 创建和管理问卷系统的单例实例
 */

import { QuestionnaireLoader } from './QuestionnaireLoader';
import { BrowserQuestionnaireLoader } from './BrowserQuestionnaireLoader';
import { QuestionnaireManager } from './QuestionnaireManager';
import type { IQuestionnaireLoader } from './IQuestionnaireLoader';
import type { QuestionnaireLoaderConfig } from '@/types/questionnaire';

// 默认配置
const DEFAULT_CONFIG: QuestionnaireLoaderConfig = {
  dataPath: 'src/data/questionnaires',
  supportedLanguages: ['en', 'zh', 'es', 'ja', 'ko', 'hi', 'ar'],
  defaultLanguage: 'en',
  cacheEnabled: true,
  cacheTimeout: 5 * 60 * 1000, // 5分钟
};

class QuestionnaireFactory {
  private static instance: QuestionnaireFactory | null = null;
  private loader: IQuestionnaireLoader | null = null;
  private manager: QuestionnaireManager | null = null;
  private config: QuestionnaireLoaderConfig;

  private constructor(config: QuestionnaireLoaderConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: QuestionnaireLoaderConfig): QuestionnaireFactory {
    if (!QuestionnaireFactory.instance) {
      QuestionnaireFactory.instance = new QuestionnaireFactory(config);
    }
    return QuestionnaireFactory.instance;
  }

  /**
   * 获取问卷加载器
   */
  getLoader(): IQuestionnaireLoader {
    if (!this.loader) {
      // 在浏览器环境中使用 BrowserQuestionnaireLoader
      if (typeof window !== 'undefined') {
        this.loader = new BrowserQuestionnaireLoader(this.config);
      } else {
        this.loader = new QuestionnaireLoader(this.config);
      }
    }
    return this.loader;
  }

  /**
   * 获取问卷管理器
   */
  async getManager(): Promise<QuestionnaireManager> {
    if (!this.manager) {
      const loader = this.getLoader();
      this.manager = new QuestionnaireManager(loader);
      await this.manager.initialize();
    }
    return this.manager;
  }

  /**
   * 重新初始化
   */
  async reinitialize(config?: QuestionnaireLoaderConfig): Promise<void> {
    if (config) {
      this.config = config;
    }

    if (this.loader) {
      this.loader.clearCache();
    }

    this.loader = new QuestionnaireLoader(this.config);
    this.manager = new QuestionnaireManager(this.loader);
    await this.manager.initialize();
  }

  /**
   * 获取配置
   */
  getConfig(): QuestionnaireLoaderConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<QuestionnaireLoaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (this.loader) {
      this.loader.clearCache();
    }
    this.loader = null;
    this.manager = null;
    QuestionnaireFactory.instance = null;
  }
}

// 导出便捷函数
export const getQuestionnaireManager = async (): Promise<QuestionnaireManager> => {
  const factory = QuestionnaireFactory.getInstance();
  return factory.getManager();
};

export const getQuestionnaireLoader = (): IQuestionnaireLoader => {
  const factory = QuestionnaireFactory.getInstance();
  return factory.getLoader();
};

export const initializeQuestionnaireSystem = async (
  config?: QuestionnaireLoaderConfig
): Promise<QuestionnaireManager> => {
  const factory = QuestionnaireFactory.getInstance(config);
  return factory.getManager();
};

export const destroyQuestionnaireSystem = (): void => {
  const factory = QuestionnaireFactory.getInstance();
  factory.destroy();
};

export default QuestionnaireFactory;
