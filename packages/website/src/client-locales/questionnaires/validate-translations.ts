#!/usr/bin/env node
/**
 * 翻译验证CLI工具
 *
 * 用于验证问卷翻译内容的完整性和一致性
 */

import { questionnaireValidator } from './validation';
import type { SupportedLocale } from './types';

const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'zh', 'ar', 'es', 'hi', 'ja', 'ko'];

async function validateQuestionnaire(questionnaireId: string) {
  console.log(`\n🔍 Validating translations for: ${questionnaireId}`);

  let baseTranslations: any = null;
  const results: { [locale: string]: any } = {};

  // 加载所有语言版本
  for (const locale of SUPPORTED_LOCALES) {
    try {
      const module = await import(`./${questionnaireId}/${locale}.ts`);
      const translations = module.default || module;
      results[locale] = translations;

      if (locale === 'en') {
        baseTranslations = translations;
      }

      console.log(`✅ Loaded ${locale} translations`);
    } catch (error) {
      console.log(`⚠️  ${locale} translations not found`);
    }
  }

  if (!baseTranslations) {
    console.error(`❌ English translations (base) not found for ${questionnaireId}`);
    return false;
  }

  let allValid = true;

  // 验证每个语言版本
  for (const [locale, translations] of Object.entries(results)) {
    const validation = questionnaireValidator.validateTranslations(
      questionnaireId,
      translations,
      locale as SupportedLocale
    );

    console.log(`\n📋 ${locale.toUpperCase()} Validation:`);

    if (validation.isValid) {
      console.log(`✅ Valid`);
    } else {
      console.log(`❌ Invalid`);
      allValid = false;
    }

    if (validation.errors.length > 0) {
      console.log(`🚨 Errors:`);
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (validation.warnings.length > 0) {
      console.log(`⚠️  Warnings:`);
      validation.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    // 与英文版本比较结构
    if (locale !== 'en') {
      const structureComparison = questionnaireValidator.compareTranslationStructure(
        baseTranslations,
        translations,
        locale as SupportedLocale
      );

      if (!structureComparison.isValid) {
        console.log(`🔄 Structure comparison with English:`);
        structureComparison.errors.forEach(error => console.log(`   - ${error}`));
        allValid = false;
      }

      if (structureComparison.warnings.length > 0) {
        structureComparison.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
    }
  }

  return allValid;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📝 Translation Validation Tool

Usage:
  npm run validate-translations <questionnaire-id>

Example:
  npm run validate-translations phq-9
    `);
    return;
  }

  const questionnaireId = args[0];
  const isValid = await validateQuestionnaire(questionnaireId);

  if (isValid) {
    console.log(`\n🎉 All translations for ${questionnaireId} are valid!`);
    process.exit(0);
  } else {
    console.log(`\n💥 Some translations for ${questionnaireId} have issues.`);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

export { validateQuestionnaire };
