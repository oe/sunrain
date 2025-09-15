# 问卷系统设计方案

## 概述

本文档描述了一个完整的问卷数据管理系统，解决了原有硬编码问卷数据无法扩展的问题。新系统基于文件系统，支持多语言，具有完整的类型定义和验证机制。

## 系统架构

### 1. 数据结构设计

#### 核心类型定义 (`src/types/questionnaire.ts`)
- **Questionnaire**: 完整问卷数据结构
- **QuestionnaireTranslation**: 问卷翻译数据
- **QuestionnaireMetadata**: 问卷元数据
- **QuestionnaireQuestion**: 问卷问题（支持递归嵌套）
- **ScoringRule**: 评分规则
- **QuestionnaireCategory**: 问卷类别

#### 支持的问题类型
- `single_choice`: 单选题
- `multiple_choice`: 多选题
- `scale`: 量表题
- `text`: 文本题
- `rating`: 评分题
- `boolean`: 布尔题

#### 支持的语言
- 英文 (en)
- 中文 (zh)
- 西班牙语 (es)
- 日语 (ja)
- 韩语 (ko)
- 印地语 (hi)
- 阿拉伯语 (ar)

### 2. 文件系统结构

```
src/data/questionnaires/
├── index.json                    # 问卷索引
├── categories.json               # 问卷类别
├── phq-9/                       # PHQ-9问卷
│   ├── metadata.json            # 元数据
│   ├── questions.json           # 问题数据
│   ├── scoring.json             # 评分规则
│   ├── interpretations.json     # 解释数据
│   └── translations/            # 翻译文件
│       ├── en.json             # 英文翻译
│       ├── zh.json             # 中文翻译
│       └── ...                 # 其他语言
├── gad-7/                       # GAD-7问卷
│   └── ...                     # 相同结构
└── stress-scale/                # 压力量表
    └── ...                     # 相同结构
```

### 3. 核心组件

#### QuestionnaireLoader (`src/lib/questionnaire/QuestionnaireLoader.ts`)
- 从文件系统加载问卷数据
- 支持缓存机制
- 提供搜索和过滤功能
- 支持分页查询

#### QuestionnaireManager (`src/lib/questionnaire/QuestionnaireManager.ts`)
- 高级问卷管理功能
- 本地化支持
- 数据验证
- 统计信息

#### QuestionnaireFactory (`src/lib/questionnaire/QuestionnaireFactory.ts`)
- 单例模式管理
- 配置管理
- 实例创建和销毁

#### QuestionnaireValidator (`src/lib/questionnaire/QuestionnaireValidator.ts`)
- 数据完整性验证
- 结构验证
- 翻译验证
- 批量验证

### 4. 工具和脚本

#### CLI工具 (`scripts/questionnaire-cli.ts`)
```bash
# 验证所有问卷数据
npm run questionnaire validate

# 显示统计信息
npm run questionnaire stats

# 列出所有问卷
npm run questionnaire list

# 显示特定问卷信息
npm run questionnaire info phq-9
```

#### 数据迁移脚本 (`scripts/migrate-questionnaires.ts`)
```bash
# 迁移现有问卷数据
npm run migrate-questionnaires
```

## 数据格式规范

### 1. 元数据格式 (metadata.json)
```json
{
  "id": "phq-9",
  "titleKey": "PHQ-9 Depression Assessment",
  "descriptionKey": "Patient Health Questionnaire-9 for depression screening",
  "categoryId": "depression",
  "tags": ["validated", "screening", "quick"],
  "estimatedMinutes": 5,
  "questionCount": 9,
  "difficulty": "beginner",
  "validatedScoring": true,
  "professionalBacking": {
    "source": "Kroenke, K., Spitzer, R. L., & Williams, J. B.",
    "reference": "The PHQ-9: validity of a brief depression severity measure...",
    "reliability": 0.89
  },
  "instructions": "Over the last 2 weeks, how often have you been bothered...",
  "disclaimer": "This assessment is for screening purposes only...",
  "isFeatured": true,
  "isActive": true,
  "requiresAuth": false,
  "version": "1.0.0",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. 问题格式 (questions.json)
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Little interest or pleasure in doing things",
      "type": "single_choice",
      "required": true,
      "weight": 1,
      "options": [
        { "id": "not_at_all", "text": "Not at all", value: 0 },
        { "id": "several_days", "text": "Several days", value: 1 },
        { "id": "more_than_half", "text": "More than half the days", value: 2 },
        { "id": "nearly_every_day", "text": "Nearly every day", value: 3 }
      ]
    }
  ]
}
```

### 3. 评分规则格式 (scoring.json)
```json
{
  "scoringRules": [
    {
      "id": "total_score",
      "name": "PHQ-9 Total Score",
      "description": "Sum of all item scores",
      "calculation": "sum",
      "questionIds": ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"],
      "ranges": [
        {
          "min": 0,
          "max": 4,
          "label": "Minimal",
          "description": "Minimal depression symptoms",
          "riskLevel": "low"
        }
      ]
    }
  ]
}
```

### 4. 翻译格式 (translations/zh.json)
```json
{
  "title": "PHQ-9 抑郁筛查量表",
  "description": "患者健康问卷-9，用于抑郁症状筛查",
  "instructions": "请仔细阅读每个陈述，选择最能描述您在过去两周内感受的答案。",
  "questions": {
    "q1": {
      "text": "对事物缺乏兴趣或乐趣",
      "options": {
        "not_at_all": "完全没有",
        "several_days": "几天",
        "more_than_half": "超过一半的天数",
        "nearly_every_day": "几乎每天"
      }
    }
  }
}
```

## 使用方式

### 1. 基本使用
```typescript
import { getQuestionnaireManager } from '@/lib/questionnaire/QuestionnaireFactory';

// 获取管理器实例
const manager = await getQuestionnaireManager();

// 获取所有问卷
const questionnaires = manager.getQuestionnaires();

// 获取特定问卷
const questionnaire = manager.getQuestionnaire('phq-9');

// 获取本地化问卷
const localizedQuestionnaire = await manager.getLocalizedQuestionnaire('phq-9', 'zh');
```

### 2. 搜索和过滤
```typescript
// 搜索问卷
const results = await manager.searchQuestionnaires('depression');

// 分页获取问卷
const paginated = await manager.getQuestionnaires(1, 10, {
  categoryId: 'depression',
  difficulty: 'beginner'
});
```

### 3. 数据验证
```typescript
import { QuestionnaireValidator } from '@/lib/questionnaire/QuestionnaireValidator';

const validator = new QuestionnaireValidator('src/data/questionnaires', ['en', 'zh']);
const result = await validator.validateAllQuestionnaires();
```

## 优势

### 1. 可扩展性
- 基于文件系统，易于添加新问卷
- 支持递归嵌套的数据结构
- 模块化设计，易于维护

### 2. 多语言支持
- 完整的翻译系统
- 支持7种语言
- 翻译数据与问卷数据分离

### 3. 类型安全
- 完整的TypeScript类型定义
- 编译时类型检查
- 更好的开发体验

### 4. 数据验证
- 自动验证数据完整性
- 结构验证
- 翻译验证

### 5. 开发工具
- CLI工具用于数据管理
- 迁移脚本
- 统计和监控功能

## 迁移指南

### 1. 从硬编码数据迁移
```bash
# 运行迁移脚本
npm run migrate-questionnaires
```

### 2. 更新现有代码
```typescript
// 旧方式
import { questionBankManager } from '@/lib/assessment/QuestionBankManager';
const assessments = questionBankManager.getAssessmentTypes();

// 新方式
import { getQuestionnaireManager } from '@/lib/questionnaire/QuestionnaireFactory';
const manager = await getQuestionnaireManager();
const assessments = await manager.getAllLocalizedAssessmentTypes('en');
```

### 3. 验证迁移结果
```bash
# 验证所有问卷数据
npm run questionnaire validate

# 查看统计信息
npm run questionnaire stats
```

## 维护指南

### 1. 添加新问卷
1. 在 `src/data/questionnaires/` 下创建新文件夹
2. 添加 `metadata.json`、`questions.json`、`scoring.json`、`interpretations.json`
3. 在 `translations/` 文件夹下添加各语言翻译文件
4. 更新 `index.json` 添加新问卷ID
5. 运行验证脚本确保数据正确

### 2. 更新现有问卷
1. 修改相应的JSON文件
2. 运行验证脚本
3. 测试问卷功能

### 3. 添加新语言
1. 在问卷的 `translations/` 文件夹下添加新的语言文件
2. 更新 `QuestionnaireLoader` 配置中的 `supportedLanguages`
3. 运行验证脚本

## 总结

新的问卷系统解决了原有硬编码数据的问题，提供了：

- ✅ **可扩展性**: 基于文件系统，易于添加新问卷
- ✅ **多语言支持**: 完整的翻译系统
- ✅ **类型安全**: 完整的TypeScript类型定义
- ✅ **数据验证**: 自动验证数据完整性
- ✅ **开发工具**: CLI工具和迁移脚本
- ✅ **维护性**: 模块化设计，易于维护

这个系统为问卷管理提供了一个坚实的基础，支持未来的扩展和维护需求。
