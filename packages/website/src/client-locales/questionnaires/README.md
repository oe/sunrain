# 问卷翻译系统

这个模块提供了问卷内容的多语言支持，包括翻译管理、验证和回退机制。

## 文件结构

```
questionnaires/
├── index.ts                    # 主导出文件
├── types.ts                    # 类型定义
├── QuestionnaireTranslationManager.ts  # 翻译管理器
├── validation.ts               # 验证工具
├── validate-translations.ts    # CLI验证工具
├── README.md                   # 说明文档
└── [questionnaire-id]/         # 每个问卷的翻译文件夹
    ├── en.ts                   # 英文翻译（必需，作为基准）
    ├── zh.ts                   # 中文翻译
    ├── ar.ts                   # 阿拉伯文翻译
    └── ...                     # 其他语言
```

## 使用方法

### 1. 基本使用

```typescript
import { questionnaireTranslationManager } from '@/client-locales/questionnaires';

// 加载翻译
const translations = await questionnaireTranslationManager.loadTranslations('phq-9', 'zh');

// 获取翻译内容
const title = questionnaireTranslationManager.getTranslatedContent('phq-9', 'title', 'zh');
const questionText = questionnaireTranslationManager.getTranslatedContent('phq-9', 'questions.q1.text', 'zh');
```

### 2. 预加载翻译

```typescript
// 预加载常用语言
await questionnaireTranslationManager.preloadTranslations('phq-9', ['en', 'zh']);
```

### 3. 验证翻译

```typescript
import { questionnaireValidator } from '@/client-locales/questionnaires';

const validation = questionnaireValidator.validateTranslations('phq-9', translations, 'zh');
if (!validation.isValid) {
  console.error('Translation errors:', validation.errors);
}
```

## 添加新问卷翻译

### 1. 创建问卷文件夹

为新问卷创建文件夹，使用kebab-case命名：

```bash
mkdir packages/website/src/client-locales/questionnaires/gad-7
```

### 2. 创建英文翻译（必需）

```typescript
// packages/website/src/client-locales/questionnaires/gad-7/en.ts
import type { QuestionnaireTranslations } from '../types';

const gad7En: QuestionnaireTranslations = {
  title: 'GAD-7 Anxiety Screening',
  description: 'A brief questionnaire to screen for anxiety symptoms',
  introduction: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
  purpose: 'This questionnaire helps identify symptoms of anxiety and their severity.',
  
  questions: {
    q1: {
      text: 'Feeling nervous, anxious, or on edge',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    // ... 更多问题
  },
  
  interpretations: {
    '0-4': {
      level: 'Minimal',
      interpretation: 'Your responses suggest minimal anxiety symptoms.',
      recommendations: 'Continue maintaining healthy lifestyle habits.'
    },
    // ... 更多解读
  },
  
  category: {
    name: 'Anxiety',
    description: 'Assessments for anxiety and stress-related symptoms'
  }
};

export default gad7En;
```

### 3. 添加其他语言翻译

按照相同结构创建其他语言版本，确保所有字段都有对应翻译。

### 4. 验证翻译

```bash
# 在项目根目录运行
npx ts-node packages/website/src/client-locales/questionnaires/validate-translations.ts gad-7
```

## 翻译键命名规范

### 问卷ID
- 使用kebab-case格式
- 例如：`phq-9`, `gad-7`, `big-five`

### 问题ID
- 使用`q{数字}`格式
- 例如：`q1`, `q2`, `q10`

### 分数范围
- 使用`{最小分}-{最大分}`格式
- 例如：`0-4`, `5-9`, `15-19`

## 错误处理

系统提供多层错误处理：

1. **翻译文件缺失**：自动回退到英文版本
2. **英文版本缺失**：返回默认翻译对象
3. **翻译键缺失**：返回键名作为回退值
4. **加载失败**：记录警告并继续执行

## 性能优化

- **缓存机制**：已加载的翻译会被缓存
- **按需加载**：只在需要时加载特定问卷的翻译
- **预加载支持**：可以预加载常用语言的翻译
- **去重加载**：避免重复加载相同的翻译文件

## 支持的语言

当前支持的语言代码：
- `en` - English（英文，必需作为基准）
- `zh` - 中文（简体）
- `ar` - العربية（阿拉伯文）
- `es` - Español（西班牙文）
- `hi` - हिन्दी（印地文）
- `ja` - 日本語（日文）
- `ko` - 한국어（韩文）

## 最佳实践

1. **始终提供英文翻译**：英文版本作为基准和回退选项
2. **保持结构一致**：所有语言版本应有相同的问题和解读结构
3. **使用专业术语**：心理健康相关术语应使用专业、准确的翻译
4. **定期验证**：使用验证工具确保翻译完整性
5. **文化适应**：考虑不同文化背景下的表达习惯
