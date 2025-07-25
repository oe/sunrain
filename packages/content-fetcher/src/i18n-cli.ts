#!/usr/bin/env node

import { MultiLanguageSyncManager, SyncConfig } from './i18n/sync-manager.js';
import { logger } from './logger.js';
import { handleError } from './errors.js';

interface I18nCLIOptions {
  action: 'sync' | 'detect' | 'report' | 'cleanup';
  resourceType?: 'books' | 'movies' | 'music' | 'all';
  languages?: string[];
  dryRun?: boolean;
  verbose?: boolean;
}

function parseArgs(): I18nCLIOptions {
  const args = process.argv.slice(2);
  const options: I18nCLIOptions = {
    action: 'sync'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--action':
      case '-a':
        const action = args[++i];
        if (['sync', 'detect', 'report', 'cleanup'].includes(action)) {
          options.action = action as I18nCLIOptions['action'];
        } else {
          console.error(`Invalid action: ${action}`);
          process.exit(1);
        }
        break;
      case '--resource-type':
      case '-r':
        const resourceType = args[++i];
        if (['books', 'movies', 'music', 'all'].includes(resourceType)) {
          options.resourceType = resourceType as I18nCLIOptions['resourceType'];
        } else {
          console.error(`Invalid resource type: ${resourceType}`);
          process.exit(1);
        }
        break;
      case '--languages':
      case '-l':
        options.languages = args[++i].split(',');
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Multi-Language Content Synchronization CLI

Usage: tsx i18n-cli.ts [options]

Options:
  -a, --action <action>         Action to perform (sync|detect|report|cleanup) [default: sync]
  -r, --resource-type <type>    Resource type (books|movies|music|all) [default: all]
  -l, --languages <langs>       Comma-separated list of language codes [default: en,zh,es,fr]
  -d, --dry-run                 Run without making changes
  -v, --verbose                 Enable verbose logging
  -h, --help                    Show this help message

Actions:
  sync      Synchronize translations for all or specific resources
  detect    Detect missing translations
  report    Generate translation status report
  cleanup   Clean up old backup files

Examples:
  tsx i18n-cli.ts --action sync --resource-type books
  tsx i18n-cli.ts --action detect --verbose
  tsx i18n-cli.ts --action report
  tsx i18n-cli.ts --action cleanup
  tsx i18n-cli.ts --action sync --languages en,zh,es --dry-run
`);
}

async function main(): Promise<void> {
  try {
    const options = parseArgs();
    
    if (options.verbose) {
      process.env.DEBUG = 'true';
    }

    logger.info('Starting i18n CLI', options);

    // 配置多语言同步管理器
    const syncConfig: SyncConfig = {
      supportedLanguages: options.languages || ['en', 'zh', 'es', 'fr'],
      defaultLanguage: 'en',
      translationService: 'manual', // 可以改为 'google' 或 'deepl'
      outputDir: '../website/src/content/resources',
      fileNaming: 'suffix', // books_zh.json 格式
      backupEnabled: !options.dryRun,
      syncMode: 'full'
    };

    const syncManager = new MultiLanguageSyncManager(syncConfig);

    switch (options.action) {
      case 'sync':
        if (options.dryRun) {
          logger.info('Running in dry-run mode - no files will be modified');
        }
        
        if (options.resourceType && options.resourceType !== 'all') {
          await syncManager.syncResourceType(options.resourceType);
        } else {
          await syncManager.syncAllResources();
        }
        break;

      case 'detect':
        const missingTranslations = await syncManager.detectMissingTranslations();
        
        logger.info('Missing translations detected:');
        for (const [resourceType, languages] of Object.entries(missingTranslations)) {
          for (const [lang, missing] of Object.entries(languages)) {
            if (missing.length > 0) {
              logger.warn(`${resourceType} (${lang}):`, missing);
            }
          }
        }
        
        const totalMissing = Object.values(missingTranslations)
          .flatMap(resourceType => Object.values(resourceType))
          .flatMap(missing => missing).length;
        
        if (totalMissing === 0) {
          logger.info('✅ No missing translations detected');
        } else {
          logger.warn(`⚠️ Found ${totalMissing} missing translation issues`);
        }
        break;

      case 'report':
        await syncManager.generateTranslationStatusReport();
        logger.info('Translation status report generated');
        break;

      case 'cleanup':
        await syncManager.cleanupBackups(7); // 清理7天前的备份
        logger.info('Backup cleanup completed');
        break;

      default:
        throw new Error(`Unknown action: ${options.action}`);
    }

    logger.info('i18n CLI execution completed successfully');

  } catch (error) {
    const handledError = handleError(error, logger);
    logger.error('i18n CLI execution failed', { error: handledError.message });
    process.exit(1);
  }
}

// 只有直接运行此文件时才执行main函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}