import fs from 'fs';
import path from 'path';
import { createSSGTranslations } from '../../i18n/utils';
import type { Language } from '@/shared';

export interface PracticeStep {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  instruction: string;
}

export interface PracticeTranslation {
  title: string;
  description: string;
  instructions: string[];
  benefits: string[];
  tips: string[];
  steps: PracticeStep[];
}

export interface PracticeData {
  id: string;
  titleKey: string;
  descriptionKey: string;
  categoryId: string;
  tags: string[];
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isFeatured: boolean;
  isActive: boolean;
  version: string;
  lastUpdated: string;
}

export interface PracticeCategory {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
}

// 简化的练习类型，直接对应我们的数据结构
export interface SimplePracticeType {
  id: string;
  name: string;
  description: string;
  category: string; // 翻译后的分类名称
  difficulty: string; // 翻译后的难度级别
  defaultDuration: number; // in minutes
  minDuration: number;
  maxDuration: number;
  steps: PracticeStep[];
  instructions: string[];
  benefits: string[];
  tips: string[];
  tags: string[]; // 翻译后的标签
  language: string;
  // 添加一些常用的统计字段
  averageRating?: number;
  completionRate?: number;
  targetAudience?: string[];
}

class PracticeLoader {
  private practicesData: PracticeData[] | null = null;
  private categoriesData: PracticeCategory[] | null = null;
  private translationsCache: Map<string, PracticeTranslation> = new Map();

  constructor() {
    this.loadPracticesData();
    this.loadCategoriesData();
  }

  private loadPracticesData(): void {
    try {
      const indexPath = path.join(process.cwd(), 'src/data/practices/practices-index.json');
      const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      this.practicesData = data.practices;
    } catch (error) {
      console.error('Failed to load practices data:', error);
      this.practicesData = [];
    }
  }

  private loadCategoriesData(): void {
    try {
      const categoriesPath = path.join(process.cwd(), 'src/data/practices/categories.json');
      const data = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
      this.categoriesData = data.categories;
    } catch (error) {
      console.error('Failed to load categories data:', error);
      this.categoriesData = [];
    }
  }

  public getPractices(): PracticeData[] {
    return this.practicesData || [];
  }

  public getPracticeById(id: string): PracticeData | null {
    const practices = this.getPractices();
    return practices.find(practice => practice.id === id) || null;
  }

  public getCategories(): PracticeCategory[] {
    return this.categoriesData || [];
  }

  public getCategoryById(id: string): PracticeCategory | null {
    const categories = this.getCategories();
    return categories.find(category => category.id === id) || null;
  }

  public getPracticeTranslation(practiceId: string, language: string): PracticeTranslation | null {
    const cacheKey = `${practiceId}-${language}`;
    
    if (this.translationsCache.has(cacheKey)) {
      return this.translationsCache.get(cacheKey)!;
    }

    try {
      const translationPath = path.join(
        process.cwd(), 
        'src/data/practices', 
        practiceId, 
        'translations', 
        `${language}.json`
      );
      
      if (!fs.existsSync(translationPath)) {
        // Fallback to English if translation doesn't exist
        const englishPath = path.join(
          process.cwd(), 
          'src/data/practices', 
          practiceId, 
          'translations', 
          'en.json'
        );
        
        if (fs.existsSync(englishPath)) {
          const translation = JSON.parse(fs.readFileSync(englishPath, 'utf-8'));
          this.translationsCache.set(cacheKey, translation);
          return translation;
        }
        return null;
      }

      const translation = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
      this.translationsCache.set(cacheKey, translation);
      return translation;
    } catch (error) {
      console.error(`Failed to load translation for ${practiceId} in ${language}:`, error);
      return null;
    }
  }

  public getAvailableLanguages(practiceId: string): string[] {
    try {
      const translationsDir = path.join(process.cwd(), 'src/data/practices', practiceId, 'translations');
      if (!fs.existsSync(translationsDir)) {
        return ['en'];
      }

      const files = fs.readdirSync(translationsDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.error(`Failed to get available languages for ${practiceId}:`, error);
      return ['en'];
    }
  }

  // 直接返回简化的练习数据，无需复杂转换
  public getSimplePractices(language: string): SimplePracticeType[] {
    const practicesData = this.getPractices();
    
    return practicesData.map(practiceData => {
      const translation = this.getPracticeTranslation(practiceData.id, language);
      
      return {
        id: practiceData.id,
        name: translation?.title || practiceData.id,
        description: translation?.description || '',
        category: this.translateCategory(practiceData.categoryId, language),
        difficulty: this.translateDifficulty(practiceData.difficulty, language),
        defaultDuration: practiceData.estimatedMinutes,
        minDuration: Math.max(1, practiceData.estimatedMinutes - 2),
        maxDuration: practiceData.estimatedMinutes + 10,
        steps: translation?.steps.map((step, index) => ({
          id: `step-${index + 1}`,
          title: step.title,
          description: step.description,
          duration: index === 0 ? 30 : 60,
          instruction: step.instruction,
        })) || [],
        instructions: translation?.instructions || [],
        benefits: translation?.benefits || [],
        tips: translation?.tips || [],
        tags: practiceData.tags.map(tag => this.translateTag(tag, language)),
        language,
        // 添加统计字段
        averageRating: 4.7,
        completionRate: 0.89,
        targetAudience: this.translateTargetAudience(['beginners'], language),
      };
    });
  }

  // 获取单个简化的练习
  public getSimplePractice(practiceId: string, language: string): SimplePracticeType | null {
    const practiceData = this.getPracticeById(practiceId);
    const translation = this.getPracticeTranslation(practiceId, language);
    
    if (!practiceData || !translation) {
      return null;
    }
    
    return {
      id: practiceData.id,
      name: translation.title,
      description: translation.description,
      category: this.translateCategory(practiceData.categoryId, language),
      difficulty: this.translateDifficulty(practiceData.difficulty, language),
      defaultDuration: practiceData.estimatedMinutes,
      minDuration: Math.max(1, practiceData.estimatedMinutes - 2),
      maxDuration: practiceData.estimatedMinutes + 10,
      steps: translation.steps.map((step, index) => ({
        id: `step-${index + 1}`,
        title: step.title,
        description: step.description,
        duration: index === 0 ? 30 : 60,
        instruction: step.instruction,
      })),
      instructions: translation.instructions,
      benefits: translation.benefits,
      tips: translation.tips,
      tags: practiceData.tags.map(tag => this.translateTag(tag, language)),
      language,
      // 添加统计字段
      averageRating: 4.7,
      completionRate: 0.89,
      targetAudience: this.translateTargetAudience(['beginners'], language),
    };
  }

  // 翻译分类
  public translateCategory(categoryId: string, language: string): string {
    const t = createSSGTranslations(language as Language, 'practice');
    
    const categoryMap: Record<string, string> = {
      'breathing': t('breathing'),
      'meditation': t('meditation'),
      'mindfulness': t('mindfulness'),
      'relaxation': t('relaxation')
    };

    return categoryMap[categoryId] || categoryId;
  }

  // 翻译难度级别
  public translateDifficulty(difficulty: string, language: string): string {
    const t = createSSGTranslations(language as Language, 'practice');
    
    const difficultyMap: Record<string, string> = {
      'beginner': t('beginner'),
      'intermediate': t('intermediate'),
      'advanced': t('advanced')
    };

    return difficultyMap[difficulty] || difficulty;
  }

  // 翻译标签
  public translateTag(tag: string, language: string): string {
    const t = createSSGTranslations(language as Language, 'practice');
    
    const tagMap: Record<string, string> = {
      'breathing': t('tags.breathing'),
      'mindfulness': t('tags.mindfulness'),
      'relaxation': t('tags.relaxation'),
      'beginner': t('tags.beginner'),
      'meditation': t('tags.meditation'),
      'body scan': t('tags.body-scan'),
      'sleep': t('tags.sleep'),
      'compassion': t('tags.compassion'),
      'loving-kindness': t('tags.loving-kindness'),
      'heart': t('tags.heart'),
      'intermediate': t('tags.intermediate')
    };

    return tagMap[tag] || tag;
  }

  // 翻译目标受众
  public translateTargetAudience(audience: string[], language: string): string[] {
    const t = createSSGTranslations(language as Language, 'practice');
    
    const audienceMap: Record<string, string> = {
      'beginners': t('beginner'),
      'intermediate': t('intermediate'),
      'advanced': t('advanced')
    };

    return audience.map(aud => audienceMap[aud] || aud);
  }
}

// Singleton instance
export const practiceLoader = new PracticeLoader();
