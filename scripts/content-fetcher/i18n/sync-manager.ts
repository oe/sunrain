import fs from 'fs/promises';
import path from 'path';
import { ContentTranslator, TranslationConfig, MultiLanguageResource } from './translator.js';
import { ResourceItem } from '../types.js';
import { logger } from '../logger.js';

export interface SyncConfig extends TranslationConfig {
  outputDir: string;
  fileNaming: 'suffix' | 'directory'; // books_zh.json vs zh/books.json
  backupEnabled: boolean;
  syncMode: 'full' | 'incremental';
}

export class MultiLanguageSyncManager {
  private translator: ContentTranslator;

  constructor(private config: SyncConfig) {
    this.translator = new ContentTranslator(config);
  }

  async syncAllResources(): Promise<void> {
    logger.info('Starting multi-language resource synchronization...');

    const resourceTypes = ['books', 'movies', 'music'];
    
    for (const resourceType of resourceTypes) {
      try {
        await this.syncResourceType(resourceType);
        logger.info(`Successfully synced ${resourceType} resources`);
      } catch (error) {
        logger.error(`Failed to sync ${resourceType} resources`, { error });
        // 继续处理其他资源类型
      }
    }

    logger.info('Multi-language resource synchronization completed');
  }

  async syncResourceType(resourceType: string): Promise<void> {
    logger.info(`Syncing ${resourceType} resources...`);

    // 读取默认语言的资源文件
    const defaultResourcePath = path.join(
      this.config.outputDir,
      `${resourceType}.json`
    );

    let defaultResource;
    try {
      const content = await fs.readFile(defaultResourcePath, 'utf-8');
      defaultResource = JSON.parse(content);
    } catch (error) {
      logger.error(`Failed to read default resource file: ${defaultResourcePath}`, { error });
      throw error;
    }

    // 获取默认语言的资源数据
    const defaultLangData = defaultResource[this.config.defaultLanguage] || defaultResource.en;
    if (!defaultLangData) {
      throw new Error(`Default language data not found in ${defaultResourcePath}`);
    }

    // 翻译资源
    const multiLangResource = await this.translator.translateResourceCollection(
      defaultLangData.items,
      defaultLangData.title,
      defaultLangData.description
    );

    // 验证翻译完整性
    const validation = await this.translator.validateTranslations(multiLangResource);
    
    if (!validation.isComplete) {
      logger.warn(`Translation incomplete for ${resourceType}`, {
        missing: validation.missingTranslations.length,
        report: validation.report
      });
    }

    // 保存多语言文件
    await this.saveMultiLanguageFiles(resourceType, multiLangResource);

    // 生成同步报告
    await this.generateSyncReport(resourceType, validation);
  }

  private async saveMultiLanguageFiles(
    resourceType: string,
    multiLangResource: MultiLanguageResource
  ): Promise<void> {
    logger.info(`Saving multi-language files for ${resourceType}...`);

    for (const [lang, resource] of Object.entries(multiLangResource)) {
      const filePath = this.getLanguageFilePath(resourceType, lang);
      
      // 创建备份（如果启用）
      if (this.config.backupEnabled) {
        await this.createBackup(filePath);
      }

      // 确保目录存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // 写入文件
      const content = JSON.stringify(resource, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');

      logger.debug(`Saved ${lang} version of ${resourceType} to ${filePath}`);
    }
  }

  private getLanguageFilePath(resourceType: string, lang: string): string {
    if (this.config.fileNaming === 'directory') {
      // zh/books.json 格式
      return path.join(this.config.outputDir, lang, `${resourceType}.json`);
    } else {
      // books_zh.json 格式
      if (lang === this.config.defaultLanguage) {
        return path.join(this.config.outputDir, `${resourceType}.json`);
      } else {
        return path.join(this.config.outputDir, `${resourceType}_${lang}.json`);
      }
    }
  }

  private async createBackup(filePath: string): Promise<void> {
    try {
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      if (exists) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${filePath}.backup.${timestamp}`;
        await fs.copyFile(filePath, backupPath);
        logger.debug(`Created backup: ${backupPath}`);
      }
    } catch (error) {
      logger.warn(`Failed to create backup for ${filePath}`, { error });
    }
  }

  private async generateSyncReport(
    resourceType: string,
    validation: any
  ): Promise<void> {
    const reportPath = path.join(
      this.config.outputDir,
      `sync-report-${resourceType}-${new Date().toISOString().split('T')[0]}.json`
    );

    const report = {
      resourceType,
      timestamp: new Date().toISOString(),
      languages: this.config.supportedLanguages,
      validation,
      config: {
        translationService: this.config.translationService,
        fileNaming: this.config.fileNaming,
        syncMode: this.config.syncMode
      }
    };

    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
      logger.info(`Sync report saved: ${reportPath}`);
    } catch (error) {
      logger.warn(`Failed to save sync report`, { error });
    }
  }

  // 检测缺失的翻译
  async detectMissingTranslations(): Promise<{
    [resourceType: string]: {
      [language: string]: string[];
    };
  }> {
    logger.info('Detecting missing translations...');

    const missingTranslations: { [resourceType: string]: { [language: string]: string[] } } = {};
    const resourceTypes = ['books', 'movies', 'music'];

    for (const resourceType of resourceTypes) {
      missingTranslations[resourceType] = {};

      for (const lang of this.config.supportedLanguages) {
        if (lang === this.config.defaultLanguage) continue;

        const filePath = this.getLanguageFilePath(resourceType, lang);
        const missing: string[] = [];

        try {
          const exists = await fs.access(filePath).then(() => true).catch(() => false);
          if (!exists) {
            missing.push(`File does not exist: ${filePath}`);
          } else {
            // 检查文件内容完整性
            const content = await fs.readFile(filePath, 'utf-8');
            const resource = JSON.parse(content);
            
            // 简单检查：如果标题或描述与默认语言相同，可能未翻译
            const defaultPath = this.getLanguageFilePath(resourceType, this.config.defaultLanguage);
            const defaultContent = await fs.readFile(defaultPath, 'utf-8');
            const defaultResource = JSON.parse(defaultContent);

            if (resource.title === defaultResource.title) {
              missing.push('Title not translated');
            }
            if (resource.description === defaultResource.description) {
              missing.push('Description not translated');
            }
          }
        } catch (error) {
          missing.push(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        if (missing.length > 0) {
          missingTranslations[resourceType][lang] = missing;
        }
      }
    }

    logger.info('Missing translation detection completed');
    return missingTranslations;
  }

  // 清理旧的备份文件
  async cleanupBackups(olderThanDays: number = 7): Promise<void> {
    logger.info(`Cleaning up backup files older than ${olderThanDays} days...`);

    try {
      const files = await fs.readdir(this.config.outputDir);
      const backupFiles = files.filter(file => file.includes('.backup.'));
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let deletedCount = 0;

      for (const file of backupFiles) {
        const filePath = path.join(this.config.outputDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
          logger.debug(`Deleted old backup: ${file}`);
        }
      }

      logger.info(`Cleanup completed: ${deletedCount} backup files deleted`);
    } catch (error) {
      logger.warn('Backup cleanup failed', { error });
    }
  }

  // 生成翻译状态报告
  async generateTranslationStatusReport(): Promise<void> {
    logger.info('Generating translation status report...');

    const missingTranslations = await this.detectMissingTranslations();
    const reportPath = path.join(
      this.config.outputDir,
      `translation-status-${new Date().toISOString().split('T')[0]}.json`
    );

    const report = {
      timestamp: new Date().toISOString(),
      supportedLanguages: this.config.supportedLanguages,
      defaultLanguage: this.config.defaultLanguage,
      missingTranslations,
      summary: {
        totalLanguages: this.config.supportedLanguages.length,
        resourceTypes: Object.keys(missingTranslations),
        languagesWithMissing: Object.values(missingTranslations)
          .flatMap(resourceType => Object.keys(resourceType))
          .filter((lang, index, self) => self.indexOf(lang) === index)
      }
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    logger.info(`Translation status report saved: ${reportPath}`);
  }
}