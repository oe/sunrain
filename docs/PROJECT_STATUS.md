# Sunrain 项目当前状态

最后更新：2024-10-31

## 项目概述

Sunrain 是一个开源心理健康平台，提供自我评估、日常练习、放松功能和疗愈资源。

- **网站**：https://sunrain.fun
- **仓库**：Monorepo 结构（pnpm workspaces + Turbo）
- **技术栈**：Astro + React + TypeScript

## 核心功能实现状态

### ✅ 已实现

#### 1. 自我评估系统
- **问卷数量**：3 个（PHQ-9, GAD-7, Stress Scale）
- **功能**：
  - 评估会话管理
  - 进度保存和恢复
  - 结果计算和解读
  - 历史记录和趋势分析
- **存储**：IndexedDB（带内存回退）

#### 2. 日常练习系统
- **练习类型**：3 个
  - 正念呼吸练习（Mindful Breathing）
  - 身体扫描冥想（Body Scan Meditation）
  - 慈心冥想（Loving-Kindness Meditation）
- **功能**：
  - 练习计时器
  - 音频指导
  - 练习记录

#### 3. 快速放松
- **白噪音播放器**
  - 自然声音
  - 环境声音
  - 音量控制
  - 循环播放

#### 4. 疗愈资源
- **资源类型**：书籍、音乐、电影
- **功能**：
  - 资源展示和浏览
  - 基础过滤
  - 外部链接

#### 5. 多语言支持
- **支持语言**：7 种（en, zh, es, ja, ko, hi, ar）
- **覆盖范围**：全站多语言
- **实现方式**：SSG + CSR 混合翻译

### ❌ 未实现

- 心理语录分享系统
- 海报生成功能
- 支持热线数据库
- 用户心声/社区功能
- 数据同步功能
- 内容自动抓取

## 技术架构

### Monorepo 结构
```
sunrain/
├── packages/
│   ├── website/          # 主网站 (Astro)
│   ├── content-fetcher/  # 内容抓取工具
│   └── shared/           # 共享类型和工具
├── docs/                 # 项目文档
└── .kiro/               # 规范和状态文档
    └── specs/           # 功能规范
```

### 前端技术栈
- **框架**：Astro 5.x（SSG + SSR 混合）
- **UI库**：React 19.x
- **样式**：Tailwind CSS 4.x + DaisyUI
- **图标**：Lucide React
- **构建**：Turbo（缓存和并行构建）

### 数据管理
- **存储**：StructuredStorage（IndexedDB 封装）
- **回退**：内存存储（不支持 IndexedDB 时）
- **数据格式**：JSON
- **持久化**：浏览器本地存储

### 翻译系统
- **SSG 翻译**：`src/locales/`（静态页面内容）
- **CSR 翻译**：`src/client-locales/`（客户端组件）
- **管理**：手动维护翻译文件

### 内容管理
- **评估问卷**：`src/data/questionnaires/`（JSON 文件）
- **练习内容**：`src/data/practices/`（JSON 文件）
- **资源数据**：`public/content/`（静态 JSON）

## 代码组织

### 核心模块

#### Assessment（评估系统）
- **位置**：`packages/website/src/lib/assessment/`
- **核心类**：
  - `AssessmentEngine`：评估引擎
  - `QuestionBankAdapter`：问卷适配器
  - `ResultsAnalyzer`：结果分析
  - `ResourceRecommendationEngine`：资源推荐

#### Questionnaire（问卷管理）
- **位置**：`packages/website/src/lib/questionnaire/`
- **核心类**：
  - `QuestionnaireManager`：问卷管理
  - `QuestionnaireLoader`：问卷加载
  - `QuestionnaireValidator`：问卷验证

#### Storage（存储）
- **位置**：`packages/website/src/lib/storage/`
- **核心类**：
  - `StructuredStorage`：统一存储接口

#### Components（组件）
- **位置**：`packages/website/src/components/`
- **主要组件**：
  - `assessment/`：评估相关组件
  - `practice/`：练习相关组件
  - `relax/`：放松功能组件

## 构建和部署

### 开发环境
```bash
pnpm install
pnpm dev        # 启动开发服务器
```

### 构建
```bash
pnpm build      # 使用 Turbo 构建所有包
```

### 测试
```bash
pnpm test       # 运行单元测试
```

### 部署
- **平台**：Cloudflare Pages
- **构建命令**：`pnpm build`
- **输出目录**：`packages/website/dist/`

## 性能指标

### 包大小
- **网站包**：~2MB（已优化）
- **首次加载**：< 100KB（关键路径）

### 构建时间
- **完整构建**：~30-45 秒
- **增量构建**：~5-10 秒（Turbo 缓存）

## 质量保证

### 代码质量
- **TypeScript**：严格模式
- **Linting**：ESLint
- **格式化**：Prettier
- **测试覆盖率**：部分模块有单元测试

### 浏览器支持
- Chrome/Edge（现代版本）
- Firefox（现代版本）
- Safari（现代版本）
- 移动浏览器

## 已知问题

1. **翻译完整性**：部分语言翻译不完整
2. **测试覆盖**：测试覆盖率需要提升
3. **性能优化**：大型问卷渲染可以优化

## 规范文档状态

### 已完成（已归档到 `specs/_archived/`）
- ✅ `assessment-code-cleanup`
- ✅ `monorepo-restructure`

### 部分实现（有 STATUS.md 说明）
- ⚠️ `assessment-system-enhancement`
- ⚠️ `comprehensive-mental-health-platform`

### 其他规范
- `assessment-pages-translation`：翻译相关
- `translation-completion`：翻译完整性

## 下一步计划

### 短期（1-2 个月）
1. 完善现有问卷的翻译
2. 添加更多标准化评估问卷
3. 提升测试覆盖率

### 中期（3-6 个月）
1. 实现心理语录系统
2. 添加更多练习内容
3. 优化性能和用户体验

### 长期（6+ 个月）
1. 社区功能
2. 内容自动化管理
3. 移动应用

## 贡献指南

查看 `/README.md` 了解如何贡献。

## 相关文档

- [项目 README](/README.md)
- [迁移指南](/docs/MIGRATION_GUIDE.md)
- [资源页面改进](/docs/RESOURCES_PAGE_IMPROVEMENTS.md)
- [规范文档](./specs/)

