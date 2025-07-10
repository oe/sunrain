# 国际化 (i18n) 架构文档

## 📁 新的翻译结构

本项目已经重构为模块化的多语言翻译架构，大大提高了代码的可维护性和组织性。

### 文件结构

```
src/
├── locales/                    # 多语言内容根目录
│   ├── shared/                 # 公共翻译内容（导航、页脚等）
│   │   ├── en.ts               # 英文公共翻译
│   │   ├── zh.ts               # 中文公共翻译
│   │   ├── es.ts               # 西班牙文公共翻译
│   │   ├── ja.ts               # 日文公共翻译
│   │   ├── ko.ts               # 韩文公共翻译
│   │   ├── hi.ts               # 印地文公共翻译
│   │   └── ar.ts               # 阿拉伯文公共翻译
│   ├── home/                   # 首页专属翻译
│   │   ├── en.ts               # 首页英文翻译
│   │   └── zh.ts               # 首页中文翻译
│   ├── guide/                  # 指南页专属翻译
│   │   ├── en.ts               # 指南页英文翻译
│   │   └── zh.ts               # 指南页中文翻译
│   ├── resources/              # 资源页专属翻译
│   │   ├── en.ts               # 资源页英文翻译
│   │   └── zh.ts               # 资源页中文翻译
│   ├── about/                  # 关于页专属翻译
│   │   ├── en.ts               # 关于页英文翻译
│   │   └── zh.ts               # 关于页中文翻译
│   └── index.ts                # 导出所有翻译内容的索引文件
├── i18n/
│   ├── config.ts               # 语言配置
│   └── utils.ts                # 翻译工具函数
```

## 🎯 设计优势

### 1. 模块化管理
- 每个页面的翻译内容独立管理
- 公共翻译内容统一维护
- 避免单一文件过于庞大

### 2. 类型安全
- 使用 TypeScript 接口定义翻译结构
- 编译时检查翻译键的完整性
- IDE 自动补全支持

### 3. 易于维护
- 新增页面只需创建对应的翻译文件
- 公共内容修改自动应用到所有页面
- 清晰的文件组织结构

### 4. 嵌套键访问
- 支持 `hero.title`、`nav.home` 等嵌套键访问
- 自动回退到公共翻译和默认语言

## 🔧 使用方法

### 页面级翻译函数

```astro
---
import { getLocale } from 'astro-i18n-aut';
import { useHomeTranslations } from '../i18n/utils';

const lang = getLocale(Astro.url);
const t = useHomeTranslations(lang);
---

<h1>{t('hero.title')}</h1>
<p>{t('hero.subtitle')}</p>
<!-- 自动访问共享翻译 -->
<nav>{t('nav.home')}</nav>
```

### 可用的翻译函数

1. **`useSharedTranslations(lang)`** - 仅公共翻译
2. **`useHomeTranslations(lang)`** - 首页翻译 + 公共翻译
3. **`useGuideTranslations(lang)`** - 指南页翻译 + 公共翻译
4. **`useResourcesTranslations(lang)`** - 资源页翻译 + 公共翻译
5. **`useAboutTranslations(lang)`** - 关于页翻译 + 公共翻译
6. **`useTranslations(lang, pageType)`** - 通用翻译函数

### 通用翻译函数示例

```astro
---
import { useTranslations } from '../i18n/utils';

const lang = getLocale(Astro.url);
const t = useTranslations(lang, 'home'); // 指定页面类型
---
```

## 📝 添加新翻译

### 1. 添加新页面翻译

1. 在 `src/locales/` 下创建新的页面文件夹
2. 创建英文翻译文件（作为类型定义）
3. 创建其他语言的翻译文件
4. 在 `src/locales/index.ts` 中导出新的翻译函数

### 2. 添加新语言

1. 在每个翻译文件夹中添加新语言文件
2. 更新 `src/locales/index.ts` 中的翻译映射
3. 在 `src/i18n/config.ts` 中添加语言配置

### 示例：添加法语支持

```typescript
// src/locales/shared/fr.ts
import type { ISharedTranslations } from './en';

export const sharedFr: ISharedTranslations = {
  nav: {
    home: 'Accueil',
    guide: 'Guide d\'auto-assistance',
    // ...
  },
  // ...
};
```

## 🔍 翻译键查找机制

翻译函数按以下优先级查找翻译内容：

1. **页面特定翻译** - 首先查找当前页面的翻译
2. **公共翻译** - 如果页面翻译中没有，查找公共翻译
3. **返回键名** - 如果都没找到，返回键名并发出警告

这种机制确保了：
- 页面可以覆盖公共翻译
- 新添加的翻译键不会导致页面错误
- 开发时容易发现缺失的翻译

## 🛠️ 开发工具

### 类型检查
所有翻译接口都有完整的 TypeScript 类型定义，编译时会检查：
- 翻译结构完整性
- 必需字段是否缺失
- 类型匹配性

### 运行时警告
开发模式下，如果翻译键不存在，会在控制台显示警告：
```
Translation key "hero.title" not found
```

### 测试页面
访问 `/i18n-test` 和 `/zh/i18n-test` 可以测试所有翻译函数的工作情况。

## 🚀 最佳实践

1. **保持翻译键简短有意义**
   ```typescript
   // ✅ 好的
   hero: { title: string }
   
   // ❌ 避免
   heroSectionMainTitleText: string
   ```

2. **使用嵌套结构组织相关翻译**
   ```typescript
   // ✅ 好的
   nav: {
     home: string;
     about: string;
   }
   
   // ❌ 避免
   navHome: string;
   navAbout: string;
   ```

3. **为新语言提供回退**
   ```typescript
   // 确保新语言有基本的翻译，至少是英文内容
   ```

4. **定期检查翻译完整性**
   - 确保所有支持的语言都有对应的翻译文件
   - 确保新添加的翻译键在所有语言中都有对应

## 📈 迁移指南

从旧的 `ui.ts` 结构迁移到新结构：

1. 识别翻译内容的归属页面
2. 将页面特定的翻译移动到对应的页面文件夹
3. 将公共翻译移动到 `shared` 文件夹
4. 更新页面中的翻译函数调用
5. 测试所有页面的翻译功能

这个新架构为项目的国际化提供了更好的扩展性和维护性，同时保持了类型安全和开发体验。
