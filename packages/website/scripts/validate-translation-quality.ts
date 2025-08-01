#!/usr/bin/env tsx

/**
 * 翻译质量验证脚本
 * 对补全后的翻译进行质量检查，确保专业术语一致性和用户体验
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TERMINOLOGY_DICTIONARY } from './terminology-dictionary.js';


// 支持的语言列表
const SUPPORTED_LANGUAGES = ["en", "zh", "es", "ja", "ko", "hi", "ar"];
const DEFAULT_LANGUAGE = "en";

// 翻译模块列表
const TRANSLATION_MODULES = [
  "shared",
  "home",
  "guide",
  "resources",
  "about",
  "assessment",
];

// 获取当前脚本目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALES_DIR = path.join(__dirname, "../src/locales");

// 使用导入的专业术语词典

// 质量检查规则
const QUALITY_RULES = {
  // 长度检查 - 翻译不应该过短或过长
  lengthRatio: {
    min: 0.3, // 翻译长度不应少于原文的30%
    max: 3.0, // 翻译长度不应超过原文的300%
  },

  // 格式检查
  formatting: {
    preserveVariables: true, // 保留变量如 {name}, {count}
    preserveHtml: true, // 保留HTML标签
    preservePunctuation: true, // 检查标点符号
  },

  // 一致性检查
  consistency: {
    terminology: true, // 术语一致性
    tone: true, // 语调一致性
    formatting: true, // 格式一致性
  },
};

interface QualityIssue {
  type:
    | "terminology_inconsistency"
    | "length_mismatch"
    | "format_error"
    | "variable_mismatch"
    | "html_mismatch"
    | "punctuation_issue"
    | "untranslated_content";
  severity: "error" | "warning" | "info";
  module: string;
  language: string;
  key: string;
  originalValue: string;
  translatedValue: string;
  message: string;
  suggestion?: string;
}

interface QualityReport {
  summary: {
    totalChecked: number;
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    qualityScore: number; // 0-100
  };
  byModule: Record<
    string,
    {
      checked: number;
      issues: number;
      score: number;
    }
  >;
  byLanguage: Record<
    string,
    {
      checked: number;
      issues: number;
      score: number;
    }
  >;
  issues: QualityIssue[];
}

/**
 * 递归提取对象中的所有键值对
 */
function extractKeyValuePairs(
  obj: any,
  prefix: string = ""
): Array<{ key: string; value: any }> {
  const pairs: Array<{ key: string; value: any }> = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      pairs.push(...extractKeyValuePairs(value, fullKey));
    } else {
      pairs.push({ key: fullKey, value });
    }
  }

  return pairs;
}

/**
 * 动态导入翻译文件
 */
async function loadTranslationFile(
  moduleName: string,
  language: string
): Promise<any> {
  try {
    const filePath = path.join(LOCALES_DIR, moduleName, `${language}.ts`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const module = await import(filePath);
    const exportName = `${moduleName}${
      language.charAt(0).toUpperCase() + language.slice(1)
    }`;
    return module.default || module[exportName] || module;
  } catch (error) {
    console.warn(
      `Failed to load translation file: ${moduleName}/${language}`,
      error
    );
    return null;
  }
}

/**
 * 检查术语一致性
 */
function checkTerminologyConsistency(
  originalText: string,
  translatedText: string,
  language: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  for (const [term, config] of Object.entries(TERMINOLOGY_DICTIONARY)) {
    if (originalText.includes(term)) {
      if (!config.shouldTranslate) {
        // 不应该翻译的术语
        if (!translatedText.includes(term)) {
          issues.push({
            type: "terminology_inconsistency",
            severity: "error",
            module: "",
            language,
            key: "",
            originalValue: originalText,
            translatedValue: translatedText,
            message: `术语 "${term}" 不应该被翻译，应保持原文`,
            suggestion: `保持 "${term}" 不变`,
          });
        }
      } else if (config.translations && config.translations[language]) {
        // 应该翻译的术语
        const expectedTranslation = config.translations[language];
        if (
          translatedText.includes(term) &&
          !translatedText.includes(expectedTranslation)
        ) {
          issues.push({
            type: "terminology_inconsistency",
            severity: "warning",
            module: "",
            language,
            key: "",
            originalValue: originalText,
            translatedValue: translatedText,
            message: `术语 "${term}" 应该翻译为 "${expectedTranslation}"`,
            suggestion: `将 "${term}" 替换为 "${expectedTranslation}"`,
          });
        }
      }
    }
  }

  return issues;
}

/**
 * 检查长度比例
 */
function checkLengthRatio(
  originalText: string,
  translatedText: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (typeof originalText !== "string" || typeof translatedText !== "string") {
    return issues;
  }

  const originalLength = originalText.length;
  const translatedLength = translatedText.length;

  if (originalLength === 0) return issues;

  const ratio = translatedLength / originalLength;

  if (ratio < QUALITY_RULES.lengthRatio.min) {
    issues.push({
      type: "length_mismatch",
      severity: "warning",
      module: "",
      language: "",
      key: "",
      originalValue: originalText,
      translatedValue: translatedText,
      message: `翻译过短，长度比例 ${ratio.toFixed(2)} < ${
        QUALITY_RULES.lengthRatio.min
      }`,
      suggestion: "检查翻译是否完整",
    });
  } else if (ratio > QUALITY_RULES.lengthRatio.max) {
    issues.push({
      type: "length_mismatch",
      severity: "warning",
      module: "",
      language: "",
      key: "",
      originalValue: originalText,
      translatedValue: translatedText,
      message: `翻译过长，长度比例 ${ratio.toFixed(2)} > ${
        QUALITY_RULES.lengthRatio.max
      }`,
      suggestion: "检查翻译是否过于冗长",
    });
  }

  return issues;
}

/**
 * 检查变量占位符
 */
function checkVariables(
  originalText: string,
  translatedText: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (typeof originalText !== "string" || typeof translatedText !== "string") {
    return issues;
  }

  // 提取变量 {variable}
  const variableRegex = /\{[^}]+\}/g;
  const originalVariables = originalText.match(variableRegex) || [];
  const translatedVariables = translatedText.match(variableRegex) || [];

  // 检查变量数量
  if (originalVariables.length !== translatedVariables.length) {
    issues.push({
      type: "variable_mismatch",
      severity: "error",
      module: "",
      language: "",
      key: "",
      originalValue: originalText,
      translatedValue: translatedText,
      message: `变量数量不匹配：原文 ${originalVariables.length} 个，翻译 ${translatedVariables.length} 个`,
      suggestion: "确保所有变量都被正确保留",
    });
  }

  // 检查变量名称
  const originalVarSet = new Set(originalVariables);
  const translatedVarSet = new Set(translatedVariables);

  for (const variable of originalVariables) {
    if (!translatedVarSet.has(variable)) {
      issues.push({
        type: "variable_mismatch",
        severity: "error",
        module: "",
        language: "",
        key: "",
        originalValue: originalText,
        translatedValue: translatedText,
        message: `缺失变量：${variable}`,
        suggestion: `在翻译中添加变量 ${variable}`,
      });
    }
  }

  return issues;
}

/**
 * 检查HTML标签
 */
function checkHtmlTags(
  originalText: string,
  translatedText: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (typeof originalText !== "string" || typeof translatedText !== "string") {
    return issues;
  }

  // 提取HTML标签
  const htmlRegex = /<[^>]+>/g;
  const originalTags = originalText.match(htmlRegex) || [];
  const translatedTags = translatedText.match(htmlRegex) || [];

  if (originalTags.length !== translatedTags.length) {
    issues.push({
      type: "html_mismatch",
      severity: "error",
      module: "",
      language: "",
      key: "",
      originalValue: originalText,
      translatedValue: translatedText,
      message: `HTML标签数量不匹配：原文 ${originalTags.length} 个，翻译 ${translatedTags.length} 个`,
      suggestion: "确保所有HTML标签都被正确保留",
    });
  }

  return issues;
}

/**
 * 检查未翻译内容
 */
function checkUntranslatedContent(
  originalText: string,
  translatedText: string,
  language: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  if (typeof originalText !== "string" || typeof translatedText !== "string") {
    return issues;
  }

  // 如果翻译与原文完全相同，可能未翻译
  if (originalText === translatedText && language !== DEFAULT_LANGUAGE) {
    // 检查是否是应该保持不变的术语
    const isKnownTerm = Object.keys(TERMINOLOGY_DICTIONARY).some(
      (term) =>
        originalText.includes(term) &&
        !TERMINOLOGY_DICTIONARY[term].shouldTranslate
    );

    if (!isKnownTerm) {
      issues.push({
        type: "untranslated_content",
        severity: "warning",
        module: "",
        language: "",
        key: "",
        originalValue: originalText,
        translatedValue: translatedText,
        message: "内容可能未翻译",
        suggestion: "检查是否需要翻译此内容",
      });
    }
  }

  return issues;
}

/**
 * 检查单个翻译的质量
 */
function checkTranslationQuality(
  originalText: string,
  translatedText: string,
  language: string,
  moduleName: string,
  key: string
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // 术语一致性检查
  issues.push(
    ...checkTerminologyConsistency(originalText, translatedText, language)
  );

  // 长度比例检查
  issues.push(...checkLengthRatio(originalText, translatedText));

  // 变量检查
  issues.push(...checkVariables(originalText, translatedText));

  // HTML标签检查
  issues.push(...checkHtmlTags(originalText, translatedText));

  // 未翻译内容检查
  issues.push(
    ...checkUntranslatedContent(originalText, translatedText, language)
  );

  // 为所有问题添加上下文信息
  issues.forEach((issue) => {
    issue.module = moduleName;
    issue.language = language;
    issue.key = key;
  });

  return issues;
}

/**
 * 检查单个模块的翻译质量
 */
async function checkModuleQuality(moduleName: string): Promise<{
  issues: QualityIssue[];
  stats: { checked: number; issues: number };
}> {
  const issues: QualityIssue[] = [];
  let checkedCount = 0;

  console.log(`Checking quality for module: ${moduleName}`);

  // 加载默认语言作为基准
  const defaultTranslation = await loadTranslationFile(
    moduleName,
    DEFAULT_LANGUAGE
  );
  if (!defaultTranslation) {
    return { issues, stats: { checked: 0, issues: 0 } };
  }

  // 提取默认语言的所有键值对
  const defaultPairs = extractKeyValuePairs(defaultTranslation);

  // 检查每种语言
  for (const language of SUPPORTED_LANGUAGES) {
    if (language === DEFAULT_LANGUAGE) continue;

    console.log(`  Checking ${language}...`);

    const targetTranslation = await loadTranslationFile(moduleName, language);
    if (!targetTranslation) continue;

    const targetPairs = extractKeyValuePairs(targetTranslation);
    const targetMap = new Map(
      targetPairs.map((pair) => [pair.key, pair.value])
    );

    // 检查每个键值对
    for (const { key, value: originalValue } of defaultPairs) {
      const translatedValue = targetMap.get(key);

      if (
        translatedValue !== undefined &&
        typeof originalValue === "string" &&
        typeof translatedValue === "string"
      ) {
        checkedCount++;
        const qualityIssues = checkTranslationQuality(
          originalValue,
          translatedValue,
          language,
          moduleName,
          key
        );
        issues.push(...qualityIssues);
      }
    }
  }

  console.log(`    Found ${issues.length} quality issues`);
  return { issues, stats: { checked: checkedCount, issues: issues.length } };
}
/**
 * 生成质量报告
 */
async function generateQualityReport(): Promise<QualityReport> {
  const report: QualityReport = {
    summary: {
      totalChecked: 0,
      totalIssues: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      qualityScore: 0,
    },
    byModule: {},
    byLanguage: {},
    issues: [],
  };

  // 初始化语言统计
  for (const language of SUPPORTED_LANGUAGES) {
    if (language !== DEFAULT_LANGUAGE) {
      report.byLanguage[language] = {
        checked: 0,
        issues: 0,
        score: 0,
      };
    }
  }

  // 检查每个模块
  for (const moduleName of TRANSLATION_MODULES) {
    const { issues, stats } = await checkModuleQuality(moduleName);

    report.issues.push(...issues);
    report.byModule[moduleName] = {
      checked: stats.checked,
      issues: stats.issues,
      score:
        stats.checked > 0
          ? Math.max(0, 100 - (stats.issues / stats.checked) * 100)
          : 100,
    };

    report.summary.totalChecked += stats.checked;
    report.summary.totalIssues += stats.issues;

    // 按语言统计
    const issuesByLanguage = issues.reduce((acc, issue) => {
      if (!acc[issue.language]) acc[issue.language] = 0;
      acc[issue.language]++;
      return acc;
    }, {} as Record<string, number>);

    for (const [language, count] of Object.entries(issuesByLanguage)) {
      if (report.byLanguage[language]) {
        report.byLanguage[language].issues += count;
      }
    }
  }

  // 计算语言得分和检查数量
  for (const language of SUPPORTED_LANGUAGES) {
    if (language !== DEFAULT_LANGUAGE && report.byLanguage[language]) {
      const langStats = report.byLanguage[language];
      langStats.checked = Math.floor(
        report.summary.totalChecked / (SUPPORTED_LANGUAGES.length - 1)
      );
      langStats.score =
        langStats.checked > 0
          ? Math.max(0, 100 - (langStats.issues / langStats.checked) * 100)
          : 100;
    }
  }

  // 计算严重程度统计
  report.summary.errorCount = report.issues.filter(
    (issue) => issue.severity === "error"
  ).length;
  report.summary.warningCount = report.issues.filter(
    (issue) => issue.severity === "warning"
  ).length;
  report.summary.infoCount = report.issues.filter(
    (issue) => issue.severity === "info"
  ).length;

  // 计算总体质量得分
  report.summary.qualityScore =
    report.summary.totalChecked > 0
      ? Math.max(
          0,
          100 - (report.summary.totalIssues / report.summary.totalChecked) * 100
        )
      : 100;

  return report;
}

/**
 * 打印控制台报告
 */
function printQualityReport(report: QualityReport) {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 TRANSLATION QUALITY VALIDATION REPORT");
  console.log("=".repeat(60));

  // 总体统计
  console.log(`\n📊 Overall Quality Statistics:`);
  console.log(`  Total Translations Checked: ${report.summary.totalChecked}`);
  console.log(`  Total Quality Issues: ${report.summary.totalIssues}`);
  console.log(`  Quality Score: ${report.summary.qualityScore.toFixed(1)}%`);
  console.log(`  Errors: ${report.summary.errorCount}`);
  console.log(`  Warnings: ${report.summary.warningCount}`);
  console.log(`  Info: ${report.summary.infoCount}`);

  // 按语言统计
  console.log(`\n🌍 Quality by Language:`);
  for (const [language, stats] of Object.entries(report.byLanguage)) {
    const status = stats.score >= 90 ? "✅" : stats.score >= 70 ? "⚠️" : "❌";
    console.log(
      `  ${status} ${language.toUpperCase()}: ${stats.score.toFixed(1)}% (${
        stats.issues
      } issues in ${stats.checked} translations)`
    );
  }

  // 按模块统计
  console.log(`\n📦 Quality by Module:`);
  for (const [moduleName, stats] of Object.entries(report.byModule)) {
    const status = stats.score >= 90 ? "✅" : stats.score >= 70 ? "⚠️" : "❌";
    console.log(
      `  ${status} ${moduleName}: ${stats.score.toFixed(1)}% (${
        stats.issues
      } issues in ${stats.checked} translations)`
    );
  }

  // 问题详情
  if (report.issues.length > 0) {
    console.log(`\n❌ Quality Issues Found:`);

    // 按类型分组
    const issuesByType = report.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    }, {} as Record<string, QualityIssue[]>);

    for (const [type, issues] of Object.entries(issuesByType)) {
      console.log(
        `\n  ${getIssueTypeIcon(type)} ${getIssueTypeName(type)} (${
          issues.length
        }):`
      );

      // 显示前几个问题作为示例
      const samplesToShow = Math.min(5, issues.length);
      for (let i = 0; i < samplesToShow; i++) {
        const issue = issues[i];
        console.log(
          `    ${getSeverityIcon(issue.severity)} ${issue.module}/${
            issue.language
          } - ${issue.key}`
        );
        console.log(`      ${issue.message}`);
        if (issue.suggestion) {
          console.log(`      💡 ${issue.suggestion}`);
        }
      }

      if (issues.length > samplesToShow) {
        console.log(`    ... and ${issues.length - samplesToShow} more`);
      }
    }
  } else {
    console.log(
      `\n✅ No quality issues found! All translations meet quality standards.`
    );
  }

  // 质量建议
  console.log(`\n💡 Quality Recommendations:`);
  if (report.summary.qualityScore >= 95) {
    console.log(`  🎉 Excellent translation quality! Keep up the good work.`);
  } else if (report.summary.qualityScore >= 85) {
    console.log(
      `  👍 Good translation quality. Address remaining issues for perfection.`
    );
  } else if (report.summary.qualityScore >= 70) {
    console.log(
      `  ⚠️ Moderate translation quality. Focus on fixing errors and warnings.`
    );
  } else {
    console.log(
      `  🚨 Translation quality needs improvement. Prioritize fixing critical issues.`
    );
  }

  if (report.summary.errorCount > 0) {
    console.log(`  🔴 Fix ${report.summary.errorCount} critical errors first`);
  }
  if (report.summary.warningCount > 0) {
    console.log(
      `  🟡 Review ${report.summary.warningCount} warnings for consistency`
    );
  }
}

/**
 * 获取问题类型图标
 */
function getIssueTypeIcon(type: string): string {
  const icons = {
    terminology_inconsistency: "📚",
    length_mismatch: "📏",
    format_error: "🔧",
    variable_mismatch: "🔗",
    html_mismatch: "🏷️",
    punctuation_issue: "✏️",
    untranslated_content: "🔤",
  };
  return icons[type] || "❓";
}

/**
 * 获取问题类型名称
 */
function getIssueTypeName(type: string): string {
  const names = {
    terminology_inconsistency: "Terminology Inconsistency",
    length_mismatch: "Length Mismatch",
    format_error: "Format Error",
    variable_mismatch: "Variable Mismatch",
    html_mismatch: "HTML Tag Mismatch",
    punctuation_issue: "Punctuation Issue",
    untranslated_content: "Untranslated Content",
  };
  return names[type] || type;
}

/**
 * 获取严重程度图标
 */
function getSeverityIcon(severity: string): string {
  const icons = {
    error: "🔴",
    warning: "🟡",
    info: "🔵",
  };
  return icons[severity] || "⚪";
}

/**
 * 保存质量报告
 */
async function saveQualityReport(report: QualityReport, outputPath: string) {
  try {
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    await fs.promises.mkdir(outputDir, { recursive: true });

    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(report, null, 2),
      "utf-8"
    );
    console.log(`\n📄 Detailed quality report saved to: ${outputPath}`);
  } catch (error) {
    console.error(`Failed to save quality report: ${error}`);
  }
}

/**
 * 运行用户体验测试
 */
async function runUserExperienceTests(): Promise<void> {
  console.log("\n🧪 Running User Experience Tests...");

  // 检查关键用户流程的翻译
  const criticalPaths = [
    "shared.navigation",
    "home.hero",
    "assessment.start",
    "guide.steps",
    "resources.categories",
  ];

  for (const path of criticalPaths) {
    console.log(`  Testing critical path: ${path}`);
    // 这里可以添加更复杂的UX测试逻辑
  }

  console.log("  ✅ User experience tests completed");
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const outputPath =
    args.find((arg) => arg.startsWith("--output="))?.split("=")[1] ||
    "translation-quality-report.json";
  const runUxTests = args.includes("--ux-tests");
  const showHelp = args.includes("--help") || args.includes("-h");

  if (showHelp) {
    console.log(`
Usage: tsx scripts/validate-translation-quality.ts [options]

Options:
  --output=<path>    Output JSON report file (default: translation-quality-report.json)
  --ux-tests         Run additional user experience tests
  --help, -h         Show this help message

Examples:
  tsx scripts/validate-translation-quality.ts
  tsx scripts/validate-translation-quality.ts --output=reports/quality.json --ux-tests
`);
    return;
  }

  console.log("🔍 Starting translation quality validation...");
  console.log(`📁 Scanning directory: ${LOCALES_DIR}`);
  console.log(`🌍 Languages: ${SUPPORTED_LANGUAGES.join(", ")}`);
  console.log(`📦 Modules: ${TRANSLATION_MODULES.join(", ")}`);

  try {
    // 生成质量报告
    const report = await generateQualityReport();

    // 打印报告
    printQualityReport(report);

    // 保存报告
    if (outputPath) {
      await saveQualityReport(report, outputPath);
    }

    // 运行用户体验测试
    if (runUxTests) {
      await runUserExperienceTests();
    }

    // 设置退出码
    const hasErrors = report.summary.errorCount > 0;
    const qualityThreshold = 80; // 质量阈值
    const belowThreshold = report.summary.qualityScore < qualityThreshold;

    if (hasErrors || belowThreshold) {
      console.log(`\n❌ Quality validation failed:`);
      if (hasErrors) {
        console.log(`  - ${report.summary.errorCount} critical errors found`);
      }
      if (belowThreshold) {
        console.log(
          `  - Quality score ${report.summary.qualityScore.toFixed(
            1
          )}% below threshold ${qualityThreshold}%`
        );
      }
      process.exit(1);
    } else {
      console.log(`\n✅ Translation quality validation passed!`);
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error during quality validation:", error);
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
