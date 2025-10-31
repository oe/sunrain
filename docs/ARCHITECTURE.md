# Sunrain 架构设计文档

版本：2.0  
最后更新：2024-10-31

## 目录

- [概述](#概述)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [核心模块](#核心模块)
- [数据管理](#数据管理)
- [多语言系统](#多语言系统)
- [构建和部署](#构建和部署)
- [性能优化](#性能优化)

## 概述

Sunrain 是一个开源心理健康平台，采用现代化的前端技术栈和**单仓库架构**，提供心理健康自我评估、日常练习、放松功能和疗愈资源。

### 核心特性

- **自我评估系统** - 标准化心理健康评估问卷
- **日常练习** - 正念冥想和呼吸练习
- **快速放松** - 白噪音和放松音频
- **疗愈资源** - 精选书籍、音乐、电影推荐
- **多语言支持** - 7种语言全站支持
- **隐私优先** - 所有数据本地存储

### 设计原则

1. **简单优于复杂** - 避免过度工程，保持代码简洁
2. **隐私第一** - 所有数据在用户浏览器本地存储
3. **渐进增强** - 基础功能优先，逐步添加高级特性
4. **用户体验** - 快速加载、流畅交互、清晰界面
5. **可维护性** - 清晰的代码结构，完善的文档

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户界面层                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Astro SSG   │  │ React 客户端 │  │   PWA支持    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      功能模块层                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  评估系统    │  │  练习系统    │  │  放松功能    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  资源展示    │  │  翻译系统    │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      数据管理层                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  IndexedDB   │  │  内存存储    │  │  静态JSON    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 项目结构

```
sunrain/
├── src/
│   ├── components/           # React/Astro 组件
│   ├── pages/                # Astro 页面
│   ├── lib/                  # 业务逻辑
│   ├── locales/              # SSG 翻译
│   ├── client-locales/       # CSR 翻译
│   ├── data/                 # 问卷和练习数据
│   ├── shared/               # 共享类型和工具
│   └── types/                # TypeScript 类型
├── public/                   # 静态资源
├── docs/                     # 项目文档
├── scripts/                  # 工具脚本
└── test/                     # 测试文件
```

## 技术栈

### 前端框架

**Astro 5.x**
- 用途：静态站点生成 (SSG) 和服务端渲染 (SSR)
- 优势：零JS默认、快速加载、SEO友好
- 使用场景：页面框架、静态内容渲染

**React 19.x**
- 用途：交互式客户端组件
- 优势：丰富的生态系统、hooks、组件复用
- 使用场景：评估系统、动态交互、客户端状态管理

### UI 和样式

**Tailwind CSS 4.x**
- 实用优先的CSS框架
- 响应式设计
- 暗色主题支持

**DaisyUI**
- Tailwind组件库
- 预设计的UI组件
- 主题系统

**Lucide React**
- 轻量级图标库
- 一致的视觉语言
- Tree-shakable

### 构建工具

**pnpm**
- 快速、节省磁盘空间的包管理器
- 高效的依赖管理

**TypeScript 5.3+**
- 类型安全
- 更好的IDE支持
- 减少运行时错误

### 开发工具

- **Vitest** - 单元测试
- **Playwright** - E2E测试
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

## 核心模块

### 1. 评估系统 (Assessment System)

#### 架构

```
lib/assessment/
├── AssessmentEngine.ts          # 评估引擎
├── QuestionBankAdapter.ts       # 问卷适配器
├── NewQuestionBankManager.ts    # 问卷管理
├── ResultsAnalyzer.ts           # 结果分析
├── AnswerValidator.ts           # 答案验证
├── ResourceRecommendationEngine.ts  # 资源推荐
├── AssessmentErrors.ts          # 错误处理
└── AssessmentLogger.ts          # 日志记录

lib/questionnaire/
├── QuestionnaireManager.ts      # 问卷管理器
├── QuestionnaireLoader.ts       # 问卷加载器
├── QuestionnaireValidator.ts    # 问卷验证器
└── QuestionnaireFactory.ts      # 工厂模式
```

#### 核心类

**AssessmentEngine**
```typescript
class AssessmentEngine {
  // 会话管理
  startAssessment(typeId: string, lang: string): Promise<Session>
  resumeSession(sessionId: string): Session | null
  
  // 答案处理
  submitAnswer(sessionId: string, answer: Answer): void
  validateAnswer(question: Question, answer: any): boolean
  
  // 结果生成
  completeAssessment(sessionId: string): Promise<Result>
  calculateScore(session: Session): ScoreResult
}
```

**QuestionnaireManager**
```typescript
class QuestionnaireManager {
  // 问卷加载
  getAllQuestionnaires(): Questionnaire[]
  getQuestionnaire(id: string): Questionnaire
  
  // 翻译支持
  getLocalizedQuestionnaire(id: string, lang: Language): Questionnaire
  
  // 验证
  validateQuestionnaire(q: Questionnaire): ValidationResult
}
```

#### 数据流

```
1. 用户开始评估
   ↓
2. AssessmentEngine 创建会话
   ↓
3. QuestionnaireManager 加载问卷
   ↓
4. 用户回答问题
   ↓
5. AnswerValidator 验证答案
   ↓
6. 答案存储到 StructuredStorage
   ↓
7. 完成评估
   ↓
8. ResultsAnalyzer 分析结果
   ↓
9. ResourceRecommendationEngine 推荐资源
   ↓
10. 显示结果和建议
```

### 2. 问卷数据系统

#### 数据结构

```
data/questionnaires/
├── questionnaires-index.json    # 问卷索引
├── categories.json              # 分类定义
└── [questionnaire-id]/
    ├── metadata.json            # 元数据
    ├── questions.json           # 问题内容
    ├── scoring.json             # 评分规则
    └── interpretations.json     # 结果解读
```

#### 问卷元数据

```typescript
interface QuestionnaireMetadata {
  id: string;
  version: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  category: string;
  questionCount: number;
  estimatedMinutes: number;
  tags: string[];
}
```

### 3. 练习系统 (Practice System)

#### 架构

```
data/practices/
├── practices-index.json         # 练习索引
├── categories.json              # 分类定义
└── [practice-id]/
    ├── metadata.json            # 元数据
    ├── steps.json               # 练习步骤
    └── audio.json               # 音频指导（可选）

components/practice/
├── BreathingCircle.tsx          # 呼吸练习动画
└── PracticeControls.tsx         # 练习控制器
```

#### 练习类型

1. **正念呼吸** (Mindful Breathing)
   - 基础呼吸练习
   - 计时器和指导
   - 可视化呼吸节奏

2. **身体扫描** (Body Scan)
   - 渐进式放松
   - 音频指导
   - 步骤式进行

3. **慈心冥想** (Loving-Kindness)
   - 慈悲冥想
   - 引导式练习
   - 多语言支持

### 4. 放松功能 (Relaxation)

#### 白噪音播放器

```typescript
class WhiteNoisePlayer {
  // 音频控制
  play(audioUrl: string): Promise<void>
  pause(): void
  stop(): void
  
  // 设置
  setVolume(volume: number): void
  setLoop(loop: boolean): void
}
```

#### 音频类型

- **自然声音** - 雨声、海浪、森林
- **环境音** - 咖啡馆、图书馆
- **白噪音** - 粉红噪音、棕色噪音

## 数据管理

### StructuredStorage

统一的数据存储抽象层，自动在 IndexedDB 和内存存储之间回退。

```typescript
class StructuredStorage {
  // 基础操作
  save<T>(type: string, data: T, id?: string): Promise<string>
  get<T>(id: string): Promise<T | null>
  getByType<T>(type: string): Promise<T[]>
  delete(id: string): Promise<boolean>
  clear(): Promise<void>
  
  // 评估数据
  saveSession(session: AssessmentSession): Promise<string>
  getSessions(): Promise<AssessmentSession[]>
  saveResult(result: AssessmentResult): Promise<string>
  getResults(): Promise<AssessmentResult[]>
}
```

### 存储策略

```
┌─────────────────────┐
│  IndexedDB 检测     │
└──────────┬──────────┘
           │
           ├─── 支持 ──→ 使用 IndexedDB
           │
           └─── 不支持 ──→ 回退到内存存储
```

### 数据类型

| 数据类型 | 存储位置 | 持久化 |
|---------|---------|--------|
| 评估会话 | IndexedDB/Memory | 是 |
| 评估结果 | IndexedDB/Memory | 是 |
| 练习记录 | IndexedDB/Memory | 是 |
| 用户偏好 | localStorage | 是 |
| 问卷数据 | 静态JSON | 否 |
| 资源数据 | 静态JSON | 否 |

## 多语言系统

### 双层翻译架构

#### SSG 翻译 (服务端渲染)

```
src/locales/
├── shared/           # 共享翻译
├── home/             # 首页
├── assessment/       # 评估页面
├── practice/         # 练习页面
├── relax/            # 放松页面
├── resources/        # 资源页面
└── about/            # 关于页面
```

用途：
- 页面标题和描述 (SEO)
- 静态内容
- 导航菜单
- 页脚信息

#### CSR 翻译 (客户端渲染)

```
src/client-locales/
├── shared/           # 共享客户端翻译
├── assessment/       # 评估交互
└── questionnaires/   # 问卷翻译管理
```

用途：
- 交互式组件文本
- 动态加载内容
- 错误消息
- 按钮和表单

### 共享类型和工具

```
src/shared/
├── types.ts          # 共享类型定义
├── i18n.ts           # 国际化工具
└── content.ts        # 内容工具
```

### 翻译加载流程

```
1. 页面加载
   ↓
2. Astro 渲染 SSG 内容（带翻译）
   ↓
3. React 组件挂载
   ↓
4. 检测用户语言
   ↓
5. 加载 CSR 翻译文件
   ↓
6. 更新交互组件文本
```

### 支持的语言

| 语言 | 代码 | 完成度 |
|------|------|--------|
| 英语 | en | 100% |
| 中文 | zh | 100% |
| 西班牙语 | es | 95% |
| 日语 | ja | 90% |
| 韩语 | ko | 90% |
| 印地语 | hi | 85% |
| 阿拉伯语 | ar | 85% |

## 构建和部署

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test             # 所有测试
pnpm test:run         # 运行一次

# 代码检查
pnpm lint             # ESLint
pnpm type-check       # TypeScript
```

### 构建流程

```bash
# 完整构建
pnpm build

# 预览构建结果
pnpm preview
```

### 部署

**平台**: Cloudflare Pages

**配置**:
- 构建命令: `pnpm build`
- 输出目录: `dist/`
- Node版本: 18+

**环境变量**:
```bash
NODE_VERSION=18
PNPM_VERSION=10
```

## 性能优化

### 代码分割

1. **路由级别分割** - 每个页面独立bundle
2. **组件级别分割** - 大型组件懒加载
3. **第三方库分割** - vendor bundle独立

### 资源优化

1. **图片优化**
   - WebP格式
   - 响应式图片
   - 懒加载

2. **字体优化**
   - 本地字体
   - 字体子集
   - 预加载关键字体

3. **CSS优化**
   - PurgeCSS移除未使用样式
   - CSS Modules
   - Critical CSS内联

### 性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| 首次内容绘制 (FCP) | < 1.5s | ~1.2s |
| 最大内容绘制 (LCP) | < 2.5s | ~2.0s |
| 首次输入延迟 (FID) | < 100ms | ~50ms |
| 累积布局偏移 (CLS) | < 0.1 | ~0.05 |

## 内容管理

### 当前方案

内容数据以静态 JSON 文件存储在 `src/data/` 和 `public/content/` 目录。

### 推荐的内容获取工作流

对于需要定期更新的内容（书籍、音乐、电影等），建议使用 **n8n + AI** 工作流：

```
n8n 定时触发
    ↓
调用外部 API
    ↓
AI 处理和分类
    ↓
生成 JSON 文件
    ↓
自动提交到仓库
```

**优势**:
- ✅ 可视化流程设计
- ✅ 无需编写代码
- ✅ AI 辅助内容质量控制
- ✅ 灵活的调度和触发
- ✅ 易于维护和调整

## 安全和隐私

### 数据隐私

1. **本地存储** - 所有用户数据存储在本地
2. **无追踪** - 不使用第三方分析
3. **无cookies** - 不设置追踪cookies
4. **数据导出** - 用户可导出和删除数据

### 安全措施

1. **内容安全策略 (CSP)**
2. **HTTPS强制**
3. **依赖安全扫描**
4. **输入验证和净化**

## 可访问性

### WCAG 2.1 AA 标准

- ✅ 键盘导航
- ✅ 屏幕阅读器支持
- ✅ 足够的颜色对比度
- ✅ 可调整的文本大小
- ✅ 替代文本
- ✅ 语义化HTML

## 浏览器支持

### 最低版本要求

| 浏览器 | 版本 |
|--------|------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### 特性检测

```typescript
// IndexedDB 支持检测
const supportsIndexedDB = 'indexedDB' in window;

// Web Audio API 检测
const supportsWebAudio = 'AudioContext' in window;

// Service Worker 检测
const supportsServiceWorker = 'serviceWorker' in navigator;
```

## 未来规划

### 短期 (1-3个月)

- [ ] 完善现有问卷翻译
- [ ] 添加更多标准化评估问卷
- [ ] 提升测试覆盖率到80%
- [ ] 性能优化和监控

### 中期 (3-6个月)

- [ ] 心理语录分享系统
- [ ] 更多冥想和练习内容
- [ ] 社区功能基础
- [ ] 移动端优化

### 长期 (6-12个月)

- [ ] PWA离线支持
- [ ] 原生移动应用
- [ ] 内容自动化管理（n8n + AI）
- [ ] 用户社区功能

## 相关文档

- [项目状态](./PROJECT_STATUS.md) - 当前实现状态
- [问卷系统设计](./QUESTIONNAIRE_SYSTEM_DESIGN.md) - 问卷系统详细设计
- [状态管理指南](./state-management-guidelines.md) - 状态管理最佳实践

## 贡献指南

查看项目根目录的 `README.md` 了解如何贡献。

---

文档维护：定期更新以反映架构变化  
最后审查：2024-10-31  
架构版本：2.0（简化为单仓库）
