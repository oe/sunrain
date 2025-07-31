#!/usr/bin/env tsx

/**
 * 翻译完整性检测脚本
 * 检查所有翻译文件的完整性，识别缺失的翻译键和未翻译的内容
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 支持的语言列表
const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'ja', 'ko', 'hi', 'ar'];
const DEFAULT_LANGUAGE = 'en';

// 翻译模块列表
const TRANSLATION_MODULES = ['shared', 'home', 'guide', 'resources', 'about', 'assessment'];

// 获取当前脚本目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALES_DIR = path.join(__dirname, '../src/locales');

interface TranslationIssue {
  type: 'missing_key' | 'untranslated' | 'file_missing';
  module: string;
  language: string;
  key?: string;
  value?: string;
  message: string;
}

interface ModuleStats {
  total: number;
  translated: number;
  missing: number;
  untranslated: number;
  percentage: number;
}

interface ValidationReport {
  summary: {
    totalModules: number;
    totalLanguages: number;
    totalIssues: number;
    overallPercentage: number;
  };
  byModule: Record<string, Record<string, ModuleStats>>;
  byLanguage: Record<string, ModuleStats>;
  issues: TranslationIssue[];
}

/**
 * 递归提取对象中的所有键路径
 */
function extractKeys(obj: any, prefix: string = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * 根据键路径获取对象中的值
 */
function getValueByPath(obj: any, keyPath: string): any {
  const keys = keyPath.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * 动态导入翻译文件
 */
async function loadTranslationFile(moduleName: string, language: string): Promise<any> {
  try {
    const filePath = path.join(LOCALES_DIR, moduleName, `${language}.ts`);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return null;
    }

    // 动态导入文件
    const module = await import(filePath);

    // 尝试不同的导出格式
    const exportName = `${moduleName}${language.charAt(0).toUpperCase() + language.slice(1)}`;
    return module.default || module[exportName] || module;
  } catch (error) {
    console.warn(`Failed to load translation file: ${moduleName}/${language}`, error);
    return null;
  }
}

/**
 * 检查单个模块的翻译完整性
 */
async function checkModuleTranslations(moduleName: string): Promise<{
  issues: TranslationIssue[];
  stats: Record<string, ModuleStats>;
}> {
  const issues: TranslationIssue[] = [];
  const stats: Record<string, ModuleStats> = {};

  console.log(`Checking module: ${moduleName}`);

  // 加载默认语言作为基准
  const defaultTranslation = await loadTranslationFile(moduleName, DEFAULT_LANGUAGE);
  if (!defaultTranslation) {
    issues.push({
      type: 'file_missing',
      module: moduleName,
      language: DEFAULT_LANGUAGE,
      message: `Default language file not found: ${moduleName}/${DEFAULT_LANGUAGE}.ts`
    });
    return { issues, stats };
  }

  // 提取默认语言的所有键
  const defaultKeys = extractKeys(defaultTranslation);
  console.log(`  Found ${defaultKeys.length} keys in ${DEFAULT_LANGUAGE}`);

  // 检查每种语言
  for (const language of SUPPORTED_LANGUAGES) {
    const moduleStats: ModuleStats = {
      total: defaultKeys.length,
      translated: 0,
      missing: 0,
      untranslated: 0,
      percentage: 0
    };

    if (language === DEFAULT_LANGUAGE) {
      moduleStats.translated = defaultKeys.length;
      moduleStats.percentage = 100;
      stats[language] = moduleStats;
      continue;
    }

    console.log(`  Checking ${language}...`);

    // 加载目标语言翻译
    const targetTranslation = await loadTranslationFile(moduleName, language);
    if (!targetTranslation) {
      issues.push({
        type: 'file_missing',
        module: moduleName,
        language,
        message: `Translation file not found: ${moduleName}/${language}.ts`
      });
      moduleStats.missing = defaultKeys.length;
      stats[language] = moduleStats;
      continue;
    }

    // 检查每个键
    for (const keyPath of defaultKeys) {
      const defaultValue = getValueByPath(defaultTranslation, keyPath);
      const targetValue = getValueByPath(targetTranslation, keyPath);

      if (targetValue === undefined) {
        // 缺失的键
        issues.push({
          type: 'missing_key',
          module: moduleName,
          language,
          key: keyPath,
          message: `Missing translation key: ${keyPath}`
        });
        moduleStats.missing++;
      } else if (typeof defaultValue === 'string' && typeof targetValue === 'string') {
        if (defaultValue === targetValue) {
          // 可能未翻译的内容
          issues.push({
            type: 'untranslated',
            module: moduleName,
            language,
            key: keyPath,
            value: targetValue,
            message: `Possibly untranslated text: ${keyPath} = "${targetValue}"`
          });
          moduleStats.untranslated++;
        } else {
          moduleStats.translated++;
        }
      } else {
        moduleStats.translated++;
      }
    }

    moduleStats.percentage = Math.round((moduleStats.translated / moduleStats.total) * 100);
    stats[language] = moduleStats;

    console.log(`    ${language}: ${moduleStats.translated}/${moduleStats.total} (${moduleStats.percentage}%)`);
  }

  return { issues, stats };
}

/**
 * 生成验证报告
 */
async function generateValidationReport(): Promise<ValidationReport> {
  const report: ValidationReport = {
    summary: {
      totalModules: TRANSLATION_MODULES.length,
      totalLanguages: SUPPORTED_LANGUAGES.length,
      totalIssues: 0,
      overallPercentage: 0
    },
    byModule: {},
    byLanguage: {},
    issues: []
  };

  // 初始化语言统计
  for (const language of SUPPORTED_LANGUAGES) {
    report.byLanguage[language] = {
      total: 0,
      translated: 0,
      missing: 0,
      untranslated: 0,
      percentage: 0
    };
  }

  // 检查每个模块
  for (const moduleName of TRANSLATION_MODULES) {
    const { issues, stats } = await checkModuleTranslations(moduleName);

    report.issues.push(...issues);
    report.byModule[moduleName] = stats;

    // 累计语言统计
    for (const [language, moduleStats] of Object.entries(stats)) {
      const langStats = report.byLanguage[language];
      langStats.total += moduleStats.total;
      langStats.translated += moduleStats.translated;
      langStats.missing += moduleStats.missing;
      langStats.untranslated += moduleStats.untranslated;
    }
  }

  // 计算语言百分比
  for (const language of SUPPORTED_LANGUAGES) {
    const langStats = report.byLanguage[language];
    if (langStats.total > 0) {
      langStats.percentage = Math.round((langStats.translated / langStats.total) * 100);
    }
  }

  // 计算总体统计
  report.summary.totalIssues = report.issues.length;
  const totalKeys = Object.values(report.byLanguage).reduce((sum, stats) => sum + stats.total, 0);
  const totalTranslated = Object.values(report.byLanguage).reduce((sum, stats) => sum + stats.translated, 0);
  report.summary.overallPercentage = totalKeys > 0 ? Math.round((totalTranslated / totalKeys) * 100) : 0;

  return report;
}

/**
 * 打印控制台报告
 */
function printConsoleReport(report: ValidationReport) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TRANSLATION COMPLETENESS REPORT');
  console.log('='.repeat(60));

  // 总体统计
  console.log(`\n📈 Overall Statistics:`);
  console.log(`  Total Modules: ${report.summary.totalModules}`);
  console.log(`  Total Languages: ${report.summary.totalLanguages}`);
  console.log(`  Total Issues: ${report.summary.totalIssues}`);
  console.log(`  Overall Completeness: ${report.summary.overallPercentage}%`);

  // 按语言统计
  console.log(`\n🌍 By Language:`);
  for (const [language, stats] of Object.entries(report.byLanguage)) {
    const status = stats.percentage >= 90 ? '✅' : stats.percentage >= 70 ? '⚠️' : '❌';
    console.log(`  ${status} ${language.toUpperCase()}: ${stats.percentage}% (${stats.translated}/${stats.total})`);
    if (stats.missing > 0) {
      console.log(`    Missing: ${stats.missing} keys`);
    }
    if (stats.untranslated > 0) {
      console.log(`    Untranslated: ${stats.untranslated} keys`);
    }
  }

  // 按模块统计
  console.log(`\n📦 By Module:`);
  for (const [moduleName, moduleStats] of Object.entries(report.byModule)) {
    console.log(`  ${moduleName}:`);
    for (const [language, stats] of Object.entries(moduleStats)) {
      if (language === DEFAULT_LANGUAGE) continue;
      const status = stats.percentage >= 90 ? '✅' : stats.percentage >= 70 ? '⚠️' : '❌';
      console.log(`    ${status} ${language}: ${stats.percentage}% (${stats.translated}/${stats.total})`);
    }
  }

  // 问题详情
  if (report.issues.length > 0) {
    console.log(`\n❌ Issues Found:`);

    const missingFiles = report.issues.filter(issue => issue.type === 'file_missing');
    if (missingFiles.length > 0) {
      console.log(`\n  Missing Files (${missingFiles.length}):`);
      missingFiles.forEach(issue => {
        console.log(`    ${issue.module}/${issue.language}.ts`);
      });
    }

    const missingKeys = report.issues.filter(issue => issue.type === 'missing_key');
    if (missingKeys.length > 0) {
      console.log(`\n  Missing Keys (${missingKeys.length}):`);
      const groupedByModule = missingKeys.reduce((acc, issue) => {
        if (!acc[issue.module]) acc[issue.module] = {};
        if (!acc[issue.module][issue.language]) acc[issue.module][issue.language] = [];
        acc[issue.module][issue.language].push(issue.key!);
        return acc;
      }, {} as Record<string, Record<string, string[]>>);

      for (const [module, languages] of Object.entries(groupedByModule)) {
        console.log(`    ${module}:`);
        for (const [language, keys] of Object.entries(languages)) {
          console.log(`      ${language}: ${keys.length} keys`);
          if (keys.length <= 5) {
            keys.forEach(key => console.log(`        - ${key}`));
          } else {
            keys.slice(0, 3).forEach(key => console.log(`        - ${key}`));
            console.log(`        ... and ${keys.length - 3} more`);
          }
        }
      }
    }

    const untranslated = report.issues.filter(issue => issue.type === 'untranslated');
    if (untranslated.length > 0) {
      console.log(`\n  Possibly Untranslated (${untranslated.length}):`);
      const groupedByModule = untranslated.reduce((acc, issue) => {
        if (!acc[issue.module]) acc[issue.module] = {};
        if (!acc[issue.module][issue.language]) acc[issue.module][issue.language] = 0;
        acc[issue.module][issue.language]++;
        return acc;
      }, {} as Record<string, Record<string, number>>);

      for (const [module, languages] of Object.entries(groupedByModule)) {
        console.log(`    ${module}:`);
        for (const [language, count] of Object.entries(languages)) {
          console.log(`      ${language}: ${count} items`);
        }
      }
    }
  } else {
    console.log(`\n✅ No issues found! All translations are complete.`);
  }
}

/**
 * 保存JSON报告
 */
async function saveJsonReport(report: ValidationReport, outputPath: string) {
  try {
    await fs.promises.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n📄 Detailed report saved to: ${outputPath}`);
  } catch (error) {
    console.error(`Failed to save report: ${error}`);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'translation-report.json';
  const showHelp = args.includes('--help') || args.includes('-h');

  if (showHelp) {
    console.log(`
Usage: tsx scripts/check-translations.ts [options]

Options:
  --output=<path>    Output JSON report file (default: translation-report.json)
  --help, -h         Show this help message

Examples:
  tsx scripts/check-translations.ts
  tsx scripts/check-translations.ts --output=reports/translations.json
`);
    return;
  }

  console.log('🔍 Starting translation completeness check...');
  console.log(`📁 Scanning directory: ${LOCALES_DIR}`);
  console.log(`🌍 Languages: ${SUPPORTED_LANGUAGES.join(', ')}`);
  console.log(`📦 Modules: ${TRANSLATION_MODULES.join(', ')}`);

  try {
    const report = await generateValidationReport();

    printConsoleReport(report);

    if (outputPath) {
      await saveJsonReport(report, outputPath);
    }

    // 设置退出码
    const hasErrors = report.issues.some(issue => issue.type === 'missing_key' || issue.type === 'file_missing');
    process.exit(hasErrors ? 1 : 0);

  } catch (error) {
    console.error('❌ Error during translation check:', error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
