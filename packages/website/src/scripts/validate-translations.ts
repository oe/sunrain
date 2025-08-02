#!/usr/bin/env tsx

/**
 * 简单的翻译完整性验证脚本
 * 检查SSG翻译文件的缺失键值，生成基本报告
 */

import fs from 'fs';
import path from 'path';

// 支持的语言列表
const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'ja', 'ar', 'ko', 'hi'];
const DEFAULT_LANGUAGE = 'en';

// 支持的模块列表
const MODULES = ['assessment', 'shared', 'home', 'guide', 'resources', 'about'];

interface ValidationResult {
  module: string;
  language: string;
  missingKeys: string[];
  totalKeys: number;
  translatedKeys: number;
  completeness: number;
}

interface ValidationReport {
  results: ValidationResult[];
  summary: {
    totalModules: number;
    totalLanguages: number;
    overallCompleteness: number;
    moduleStats: Record<string, { completeness: number; missingCount: number }>;
    languageStats: Record<string, { completeness: number; missingCount: number }>;
  };
}

/**
 * 递归提取对象中的所有键路径
 */
function extractKeys(obj: any, prefix: string = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * 加载翻译文件
 */
async function loadTranslation(module: string, language: string): Promise<any | null> {
  const filePath = path.join(__dirname, '..', 'locales', module, `${language}.ts`);

  try {
    // 检查文件是否存在
    await fs.promises.access(filePath);

    // 动态导入翻译文件
    const translationModule = await import(filePath);
    const exportName = `${module}${language.charAt(0).toUpperCase() + language.slice(1)}`;

    return translationModule.default || translationModule[exportName] || null;
  } catch (error) {
    return null;
  }
}

/**
 * 验证单个模块的翻译完整性
 */
async function validateModule(module: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // 加载默认语言（英文）作为基准
  const defaultTranslation = await loadTranslation(module, DEFAULT_LANGUAGE);
  if (!defaultTranslation) {
    console.warn(`⚠️  无法加载模块 ${module} 的默认语言翻译文件`);
    return results;
  }

  const defaultKeys = extractKeys(defaultTranslation);

  // 验证每种语言
  for (const language of SUPPORTED_LANGUAGES) {
    const translation = await loadTranslation(module, language);

    if (!translation) {
      // 翻译文件不存在
      results.push({
        module,
        language,
        missingKeys: defaultKeys,
        totalKeys: defaultKeys.length,
        translatedKeys: 0,
        completeness: 0
      });
      continue;
    }

    const translationKeys = extractKeys(translation);
    const missingKeys = defaultKeys.filter(key => !translationKeys.includes(key));
    const translatedKeys = defaultKeys.length - missingKeys.length;
    const completeness = Math.round((translatedKeys / defaultKeys.length) * 100);

    results.push({
      module,
      language,
      missingKeys,
      totalKeys: defaultKeys.length,
      translatedKeys,
      completeness
    });
  }

  return results;
}

/**
 * 生成验证报告
 */
function generateReport(results: ValidationResult[]): ValidationReport {
  const moduleStats: Record<string, { completeness: number; missingCount: number }> = {};
  const languageStats: Record<string, { completeness: number; missingCount: number }> = {};

  let totalCompleteness = 0;
  let totalResults = 0;

  // 计算统计信息
  for (const result of results) {
    // 模块统计
    if (!moduleStats[result.module]) {
      moduleStats[result.module] = { completeness: 0, missingCount: 0 };
    }
    moduleStats[result.module].completeness += result.completeness;
    moduleStats[result.module].missingCount += result.missingKeys.length;

    // 语言统计
    if (!languageStats[result.language]) {
      languageStats[result.language] = { completeness: 0, missingCount: 0 };
    }
    languageStats[result.language].completeness += result.completeness;
    languageStats[result.language].missingCount += result.missingKeys.length;

    totalCompleteness += result.completeness;
    totalResults++;
  }

  // 计算平均值
  for (const module of Object.keys(moduleStats)) {
    moduleStats[module].completeness = Math.round(
      moduleStats[module].completeness / SUPPORTED_LANGUAGES.length
    );
  }

  for (const language of Object.keys(languageStats)) {
    languageStats[language].completeness = Math.round(
      languageStats[language].completeness / MODULES.length
    );
  }

  const overallCompleteness = totalResults > 0 ? Math.round(totalCompleteness / totalResults) : 0;

  return {
    results,
    summary: {
      totalModules: MODULES.length,
      totalLanguages: SUPPORTED_LANGUAGES.length,
      overallCompleteness,
      moduleStats,
      languageStats
    }
  };
}

/**
 * 打印验证报告
 */
function printReport(report: ValidationReport): void {
  console.log('\n📊 翻译完整性验证报告');
  console.log('='.repeat(50));

  // 总体统计
  console.log(`\n📈 总体统计:`);
  console.log(`   模块数量: ${report.summary.totalModules}`);
  console.log(`   语言数量: ${report.summary.totalLanguages}`);
  console.log(`   整体完整性: ${report.summary.overallCompleteness}%`);

  // 按模块统计
  console.log(`\n📦 按模块统计:`);
  for (const [module, stats] of Object.entries(report.summary.moduleStats)) {
    const status = stats.completeness >= 95 ? '✅' : stats.completeness >= 80 ? '⚠️' : '❌';
    console.log(`   ${status} ${module}: ${stats.completeness}% (缺失 ${stats.missingCount} 个键)`);
  }

  // 按语言统计
  console.log(`\n🌍 按语言统计:`);
  for (const [language, stats] of Object.entries(report.summary.languageStats)) {
    const status = stats.completeness >= 95 ? '✅' : stats.completeness >= 80 ? '⚠️' : '❌';
    console.log(`   ${status} ${language}: ${stats.completeness}% (缺失 ${stats.missingCount} 个键)`);
  }

  // 详细问题列表
  const problemResults = report.results.filter(r => r.missingKeys.length > 0);
  if (problemResults.length > 0) {
    console.log(`\n❌ 发现的问题:`);
    for (const result of problemResults) {
      if (result.missingKeys.length > 0) {
        console.log(`\n   ${result.module}/${result.language} (缺失 ${result.missingKeys.length} 个键):`);
        for (const key of result.missingKeys.slice(0, 5)) { // 只显示前5个
          console.log(`     - ${key}`);
        }
        if (result.missingKeys.length > 5) {
          console.log(`     ... 还有 ${result.missingKeys.length - 5} 个缺失的键`);
        }
      }
    }
  } else {
    console.log(`\n✅ 所有翻译文件都是完整的！`);
  }
}

/**
 * 保存报告到文件
 */
async function saveReport(report: ValidationReport, outputPath: string): Promise<void> {
  const reportData = {
    timestamp: new Date().toISOString(),
    ...report
  };

  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(reportData, null, 2),
    'utf-8'
  );

  console.log(`\n💾 详细报告已保存到: ${outputPath}`);
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🔍 开始验证翻译完整性...\n');

  const allResults: ValidationResult[] = [];

  // 验证每个模块
  for (const module of MODULES) {
    console.log(`📦 验证模块: ${module}`);
    const moduleResults = await validateModule(module);
    allResults.push(...moduleResults);
  }

  // 生成报告
  const report = generateReport(allResults);

  // 打印报告
  printReport(report);

  // 保存详细报告
  const outputPath = path.join(__dirname, '..', '..', 'docs', 'translation-validation-report.json');
  await saveReport(report, outputPath);

  // 根据结果设置退出码
  const hasProblems = report.results.some(r => r.missingKeys.length > 0);
  if (hasProblems) {
    console.log('\n⚠️  发现翻译完整性问题，请查看上述报告');
    process.exit(1);
  } else {
    console.log('\n✅ 所有翻译文件验证通过！');
    process.exit(0);
  }
}

// 运行脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 验证过程中发生错误:', error);
    process.exit(1);
  });
}

export { main, validateModule, generateReport };
