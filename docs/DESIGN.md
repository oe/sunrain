# Sunrain 设计文档

> 版本: 2.0 | 更新日期: 2025-12

## 1. 架构概览

### 1.1 技术栈
```
Frontend: Astro + TailwindCSS + TypeScript
Rendering: Static Site Generation (SSG)
i18n: astro-i18n-aut + JSON translations
Storage: Browser localStorage
Deployment: Static hosting (GitHub Pages)
```

### 1.2 目录结构
```
src/
├── content/                 # 内容数据
│   ├── questionnaires/      # 问卷 YAML 文件
│   │   ├── phq-9.yaml
│   │   └── gad-7.yaml
│   └── resources/
│       └── crisis.json      # 危机热线数据
├── i18n/                    # UI 翻译文件
│   ├── en.json
│   ├── zh-hans.json
│   ├── zh-hant.json
│   └── ... (8 种语言)
├── lib/                     # 核心库
│   ├── i18n.ts              # 国际化工具
│   ├── questionnaire.ts     # 问卷处理
│   └── storage.ts           # 本地存储
├── layouts/
│   └── BaseLayout.astro     # 基础布局
├── components/
│   ├── Header.astro         # 页头
│   └── Footer.astro         # 页脚
├── pages/                   # 页面
│   ├── index.astro          # 首页
│   ├── assessment/
│   │   ├── index.astro      # 测评列表
│   │   └── [id].astro       # 测评详情
│   ├── breathing.astro      # 呼吸练习
│   ├── crisis.astro         # 危机热线
│   ├── about.astro          # 关于
│   └── 404.astro            # 404 页面
└── styles/
    └── tailwind.css         # 全局样式
```

---

## 2. 数据设计

### 2.1 问卷数据格式 (YAML)

采用单文件多语言设计，避免重复维护：

```yaml
id: phq-9
version: "1.0"
meta:
  title:
    en: "Patient Health Questionnaire-9 (PHQ-9)"
    zh-hans: "患者健康问卷-9 (PHQ-9)"
    zh-hant: "患者健康問卷-9 (PHQ-9)"
    # ... 其他语言
  description:
    en: "A brief questionnaire for screening depression"
    zh-hans: "用于筛查抑郁症状的简短问卷"
    zh-hant: "用於篩檢憂鬱症狀的簡短問卷"
  instruction:
    en: "Over the last 2 weeks, how often have you..."
    zh-hans: "在过去两周内，以下问题困扰您的频率是？"
    zh-hant: "在過去兩週內，以下問題困擾您的頻率是？"
  estimatedMinutes: 5
  category: depression

options:
  - value: 0
    label:
      en: "Not at all"
      zh-hans: "完全不会"
      zh-hant: "完全不會"
  - value: 1
    label:
      en: "Several days"
      zh-hans: "几天"
      zh-hant: "幾天"
  # ...

questions:
  - id: q1
    text:
      en: "Little interest or pleasure in doing things"
      zh-hans: "做事时提不起劲或没有兴趣"
      zh-hant: "做事時提不起勁或沒有興趣"
  # ...

scoring:
  type: sum
  maxScore: 27
  interpretations:
    - range: [0, 4]
      level: minimal
      color: "#22c55e"
      label:
        en: "Minimal depression"
        zh-hans: "极少抑郁"
        zh-hant: "極少憂鬱"
      suggestion:
        en: "Your symptoms suggest minimal depression..."
        zh-hans: "您的症状显示抑郁程度极低..."
        zh-hant: "您的症狀顯示憂鬱程度極低..."
    # ...
```

### 2.2 UI 翻译格式 (JSON)

采用扁平结构，支持 dot-notation 访问：

```json
{
  "site": {
    "name": "Sunrain",
    "tagline": "Where the sun meets the rain"
  },
  "nav": {
    "home": "Home",
    "assessment": "Assessment"
  },
  "assessment": {
    "title": "Mental Health Assessment",
    "history": {
      "title": "Assessment History",
      "empty": "No assessment history yet"
    }
  }
}
```

访问方式: `t('assessment.history.title', lang)` → `"Assessment History"`

### 2.3 测评结果存储格式

```typescript
interface AssessmentResult {
  id: string;              // 唯一 ID: "result_1702123456_abc123"
  questionnaireId: string; // 问卷 ID: "phq-9"
  questionnaireTitle: string;
  answers: number[];       // 各题答案: [0, 1, 2, 3, 0, 1, 2, 3, 0]
  score: number;           // 总分: 12
  level: string;           // 等级: "moderate"
  label: string;           // 等级标签: "中度抑郁"
  color: string;           // 颜色: "#f97316"
  suggestion: string;      // 建议文本
  completedAt: string;     // ISO 日期: "2024-12-10T00:00:00.000Z"
  language: string;        // 测评时语言: "zh-hans"
}
```

存储位置: `localStorage.sunrain_assessment_results`

---

## 3. 核心模块设计

### 3.1 国际化模块 (`lib/i18n.ts`)

**职责**:
- 管理支持的语言列表
- 加载和访问翻译文件
- 从 URL 路径检测语言
- 生成本地化 URL

**关键函数**:
```typescript
// 支持的语言
const SUPPORTED_LANGUAGES = ['en', 'zh-hans', 'zh-hant', 'es', 'ja', 'ko', 'hi', 'ar'];

// 获取翻译
function t(key: string, lang: Language): string

// 从路径获取语言
function getLanguageFromPath(pathname: string): Language

// 获取本地化路径
function getLocalizedPath(pathname: string, lang: Language): string

// 判断 RTL
function isRTL(lang: Language): boolean
```

### 3.2 问卷模块 (`lib/questionnaire.ts`)

**职责**:
- 将 YAML 问卷数据转换为本地化版本
- 计算测评分数
- 根据分数获取结果解释
- 生成测评结果对象

**关键函数**:
```typescript
// 本地化问卷
function localizeQuestionnaire(data: any, lang: Language): LocalizedQuestionnaire

// 计算分数
function calculateScore(answers: number[]): number

// 获取解释
function getInterpretation(score: number, interpretations: Array): Interpretation

// 创建结果
function createAssessmentResult(
  questionnaire: LocalizedQuestionnaire,
  answers: number[],
  lang: Language
): AssessmentResult
```

### 3.3 存储模块 (`lib/storage.ts`)

**职责**:
- 保存测评结果到 localStorage
- 读取历史测评结果
- 清除历史记录

**关键函数**:
```typescript
// 保存结果
function saveResult(result: AssessmentResult): void

// 获取所有结果
function getResults(): AssessmentResult[]

// 获取特定问卷的结果
function getResultsByQuestionnaire(questionnaireId: string): AssessmentResult[]

// 清除所有结果
function clearAllResults(): void
```

**存储设计**:
- Key: `sunrain_assessment_results`
- Value: JSON 数组
- 容量限制: 最多保留 100 条记录

---

## 4. 页面设计

### 4.1 首页 (`pages/index.astro`)

```
┌─────────────────────────────────────────┐
│           Header (导航 + 语言切换)        │
├─────────────────────────────────────────┤
│                                         │
│              🌤️ Logo                    │
│      Where the sun meets the rain       │
│                                         │
│    Your Mental Health Journey           │
│         Starts Here                     │
│                                         │
│   [Start Assessment] [Try Breathing]    │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │   📋    │ │   🧘    │ │   📞    │  │
│  │ 自助测评 │ │ 呼吸练习 │ │ 危机热线 │  │
│  │         │ │         │ │         │  │
│  └─────────┘ └─────────┘ └─────────┘  │
├─────────────────────────────────────────┤
│              Footer                     │
└─────────────────────────────────────────┘
```

### 4.2 测评页 (`pages/assessment/[id].astro`)

**状态机**:
```
        ┌───────────────────┐
        │    Question 1     │
        │   ○ Option A      │
        │   ● Option B      │
        │   ○ Option C      │
        │   ○ Option D      │
        │                   │
        │  [Prev] [Next]    │
        │  ━━━━━░░░░░ 33%   │
        └───────────────────┘
                │
                │ (Answer all)
                ▼
        ┌───────────────────┐
        │    Your Results   │
        │                   │
        │     Score: 12     │
        │    ████████░░     │
        │  Moderate (橙色)   │
        │                   │
        │   建议文本...      │
        │                   │
        │   [Retake]        │
        └───────────────────┘
```

### 4.3 呼吸练习 (`pages/breathing.astro`)

**动画状态**:
```
    Inhale (4s)          Hold (4s)           Exhale (4s)
    
   ┌─────────┐        ┌─────────────┐      ┌─────────┐
   │  ●      │   →    │      ●      │  →   │  ●      │
   │         │        │             │      │         │
   │ (小→大) │        │  (保持大)   │      │ (大→小) │
   └─────────┘        └─────────────┘      └─────────┘
```

**CSS 动画实现**:
```css
@keyframes breathe-in {
  from { transform: scale(1); }
  to { transform: scale(1.5); }
}
@keyframes breathe-out {
  from { transform: scale(1.5); }
  to { transform: scale(1); }
}
```

---

## 5. 国际化路由

### 5.1 URL 结构

```
/                     → 英语首页 (默认)
/assessment/          → 英语测评列表
/assessment/phq-9/    → 英语 PHQ-9 测评

/zh-hans/                  → 简体中文首页
/zh-hans/assessment/       → 简体中文测评列表
/zh-hans/assessment/phq-9/ → 简体中文 PHQ-9 测评

/zh-hant/                  → 繁體中文首頁
/zh-hant/assessment/       → 繁體中文測評列表
/zh-hant/assessment/phq-9/ → 繁體中文 PHQ-9 測評

/ar/                  → 阿拉伯语首页 (RTL)
```

### 5.2 路由生成 (Astro)

使用 `astro-i18n-aut` 自动生成多语言路由：

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [
    i18n({
      defaultLocale: 'en',
      locales: ['en', 'zh-hans', 'zh-hant', 'es', 'ja', 'ko', 'hi', 'ar'],
    })
  ]
});
```

---

## 6. 构建与部署

### 6.1 构建流程

```
1. astro check    → TypeScript 类型检查
2. astro build    → 生成静态 HTML
3. Output: dist/  → 纯静态文件

构建产物:
dist/
├── index.html
├── assessment/
│   ├── index.html
│   ├── phq-9/index.html
│   └── gad-7/index.html
├── zh-hans/
├── zh-hant/
│   ├── index.html
│   └── assessment/...
└── _astro/
    └── *.js, *.css (打包资源)
```

### 6.2 部署配置

**GitHub Pages**:
```yaml
# .github/workflows/deploy.yml
- uses: withastro/action@v2
- uses: peaceiris/actions-gh-pages@v3
```

**文件大小目标**:
| 文件类型 | 目标大小 |
|---------|---------|
| HTML | < 50KB |
| CSS | < 30KB |
| JS | < 100KB |
| Total | < 200KB |

---

## 7. 代码规范

### 7.1 文件命名
- 组件: `PascalCase.astro` / `PascalCase.tsx`
- 页面: `kebab-case.astro`
- 工具: `camelCase.ts`
- 数据: `kebab-case.json` / `kebab-case.yaml`

### 7.2 组件结构 (Astro)
```astro
---
// 1. Imports
import Layout from '../layouts/BaseLayout.astro';
import { t, getLanguageFromPath } from '../lib/i18n';

// 2. Props
interface Props { /* ... */ }

// 3. Data fetching / processing
const lang = getLanguageFromPath(Astro.url.pathname);
const title = t('page.title', lang);
---

<!-- 4. Template -->
<Layout title={title}>
  <main>
    <!-- content -->
  </main>
</Layout>

<style>
  /* 5. Scoped styles (if any) */
</style>

<script>
  // 6. Client-side JavaScript (if any)
</script>
```

### 7.3 TypeScript
- 启用严格模式 (`strict: true` 目标)
- 导出所有公共类型
- 函数添加 JSDoc 注释

---

## 8. 性能优化

### 8.1 已实施优化
- ✅ 静态生成 (SSG) - 无服务端渲染开销
- ✅ 内联关键 CSS
- ✅ 最小化 JS Bundle
- ✅ 预加载字体

### 8.2 未来优化方向
- [ ] 图片压缩 (如添加图片)
- [ ] Service Worker (离线支持)
- [ ] 更激进的代码分割

---

## 附录 A: 代码统计

| 指标 | 数值 |
|------|------|
| 文件总数 | 25 |
| 代码行数 | ~4,600 |
| 页面数 | 6 |
| 组件数 | 2 |
| 工具库 | 3 |
| 翻译文件 | 7 |

## 附录 B: 依赖列表

```json
{
  "dependencies": {
    "astro": "^5.x",
    "tailwindcss": "^3.x",
    "daisyui": "^4.x",
    "astro-i18n-aut": "^0.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@astrojs/tailwind": "^5.x"
  }
}
```
