# 设计文档

## 概述

本设计文档描述了评估系统全面改进的技术实现方案。系统将通过增强多语言支持、改进用户界面、丰富问卷内容、完善结果解读等方式，打造一个完整的心理评估平台。

## 架构

### 整体架构
- **前端**: Astro + React 组件，支持SSR和CSR混合渲染
- **多语言**: 基于现有i18n系统扩展，问卷内容使用CSR渲染
- **数据管理**: PouchDB 本地结构化存储 + 内存适配器回退方案
- **内容组织**: 基于文件系统的问卷内容管理
- **兼容性**: 自动检测浏览器支持，优雅降级到内存存储

### 多语言架构
```
src/
├── client-locales/
│   └── questionnaires/           # 新增问卷专用翻译
│       ├── [questionnaire-id]/   # 每个问卷独立文件夹
│       │   ├── en.ts
│       │   ├── zh.ts
│       │   ├── ar.ts
│       │   └── ...
│       └── index.ts
└── lib/assessment/
    └── QuestionnaireTranslationManager.ts  # 翻译管理器
```

## 组件和接口

### 数据存储架构
```
lib/assessment/storage/
├── PouchDBManager.ts           # PouchDB 管理器
├── StorageAdapter.ts           # 存储适配器接口
├── MemoryStorageAdapter.ts     # 内存存储适配器
├── BrowserCompatibilityChecker.ts  # 浏览器兼容性检测
└── DataMigrationManager.ts     # 数据迁移管理
```

#### PouchDB 数据存储设计
```typescript
interface StorageManager {
  // 自动选择最佳存储方案
  initializeStorage(): Promise<StorageAdapter>
  
  // 检测浏览器兼容性
  checkBrowserCompatibility(): BrowserCompatibility
  
  // 显示兼容性警告
  showCompatibilityWarning(): void
  
  // 数据迁移和导出
  exportData(): Promise<ExportData>
  importData(data: ExportData): Promise<void>
}

interface BrowserCompatibility {
  supportsIndexedDB: boolean
  supportsWebSQL: boolean
  recommendedAdapter: 'idb' | 'websql' | 'memory'
  warningMessage?: string
}
```

### 核心组件

#### 1. QuestionnaireTranslationManager
```typescript
interface QuestionnaireTranslationManager {
  loadTranslations(questionnaireId: string, locale: string): Promise<QuestionnaireTranslations>
  getTranslatedContent(questionnaireId: string, key: string, locale: string): string
  fallbackToEnglish(questionnaireId: string, key: string): string
}
```

#### 2. EnhancedQuestionnaireCard
```typescript
interface QuestionnaireCardProps {
  questionnaire: Questionnaire
  hasHistory: boolean
  category: string
  onViewHistory: () => void
  onStartAssessment: () => void
}
```

#### 3. QuestionnaireInfoModal
```typescript
interface QuestionnaireInfoProps {
  questionnaire: Questionnaire
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}
```

#### 4. CategoryFilter
```typescript
interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}
```

#### 5. AssessmentHistoryViewer
```typescript
interface AssessmentHistoryProps {
  questionnaireId: string
  results: AssessmentResult[]
  onCompareResults: (results: AssessmentResult[]) => void
}
```

#### 6. EnhancedResultsDisplay
```typescript
interface EnhancedResultsProps {
  result: AssessmentResult
  interpretation: ResultInterpretation
  recommendations: ResourceRecommendation[]
  relatedResources: Resource[]
}
```

### 数据模型

#### Questionnaire 扩展
```typescript
interface Questionnaire {
  id: string
  titleKey: string              // 翻译键
  descriptionKey: string        // 翻译键
  category: QuestionnaireCategory
  estimatedMinutes: number      // 准确的估时
  questionCount: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  validatedScoring: boolean     // 是否使用验证过的评分方法
  professionalBacking: string   // 专业背景信息
  introductionKey: string       // 介绍内容翻译键
  purposeKey: string           // 目的说明翻译键
}
```

#### QuestionnaireCategory
```typescript
interface QuestionnaireCategory {
  id: string
  nameKey: string              // 翻译键
  descriptionKey: string       // 翻译键
  icon: string
  color: string
  order: number
}
```

#### ResultInterpretation
```typescript
interface ResultInterpretation {
  scoreRange: { min: number; max: number }
  levelKey: string             // 翻译键 (如 'low', 'moderate', 'high')
  interpretationKey: string    // 详细解读翻译键
  recommendationsKey: string   // 建议翻译键
  warningLevel: 'none' | 'mild' | 'moderate' | 'severe'
  supportResourcesKey?: string // 支持资源翻译键
}
```

## 错误处理

### 翻译错误处理
1. **缺失翻译**: 自动回退到英文
2. **加载失败**: 显示友好错误信息，允许重试
3. **格式错误**: 记录错误日志，使用默认文本

### 数据错误处理
1. **问卷加载失败**: 显示错误状态，提供刷新选项
2. **历史记录访问失败**: 优雅降级，隐藏历史功能
3. **结果计算错误**: 显示通用结果，记录错误

## 测试策略

### 单元测试
- 翻译管理器的回退机制
- 问卷分类和过滤逻辑
- 结果计算和解读生成
- 历史记录管理

### 集成测试
- 多语言切换的完整流程
- 问卷完成到结果显示的端到端流程
- 历史记录查看和比较功能

### 用户体验测试
- 不同语言下的界面一致性
- 响应式设计在各设备上的表现
- 加载性能和用户交互流畅度

## 性能优化

### 翻译内容优化
- 按需加载问卷翻译内容
- 翻译内容缓存策略
- 预加载常用语言的翻译

### UI渲染优化
- 问卷列表虚拟化滚动
- 图片和图标懒加载
- 组件级别的代码分割

### 数据管理优化
- 历史记录分页加载
- 结果数据压缩存储
- 智能缓存失效策略

## 内容管理策略

### 问卷内容组织
```
public/content/questionnaires/
├── categories.json              # 分类定义
├── questionnaires-index.json   # 问卷索引
└── questionnaires/
    ├── phq-9/                  # PHQ-9 抑郁量表
    │   ├── metadata.json       # 元数据
    │   ├── questions.json      # 问题内容
    │   ├── scoring.json        # 评分规则
    │   └── interpretations.json # 结果解读
    ├── gad-7/                  # GAD-7 焦虑量表
    └── big-five/               # 大五人格测试
```

### 翻译内容管理
- 每个问卷独立的翻译文件夹
- 统一的翻译键命名规范
- 翻译完整性检查工具

## 用户体验设计

### 视觉设计改进
- 现代化的卡片设计，增加阴影和圆角
- 改进的颜色方案和字体层级
- 一致的图标系统和视觉语言

### 交互设计优化
- 流畅的动画过渡效果
- 直观的导航和面包屑
- 清晰的状态反馈和加载指示

### 响应式设计
- 移动端优先的设计方法
- 平板和桌面端的适配优化
- 触摸友好的交互元素

## 安全和隐私

### 数据保护
- 本地存储的数据加密
- 敏感信息的安全处理
- 用户数据的匿名化

### 专业责任
- 明确的免责声明
- 专业建议的适当引导
- 危机情况的资源提供
