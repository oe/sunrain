# 翻译验证工具

简单的翻译完整性和质量检查工具。

## 文件说明

### 核心脚本

- **`check-translations.ts`** - 翻译完整性检查，检测缺失的翻译项
- **`validate-translation-quality.ts`** - 翻译质量验证，检查术语一致性、格式完整性等

### 配置文件

- **`terminology-dictionary.ts`** - 专业术语词典，定义翻译规则和标准

## 使用方法

```bash
# 检查翻译完整性
pnpm check-translations

# 验证翻译质量
pnpm validate-translations
```

> 📁 **注意**: 脚本会自动创建 `reports/` 目录来保存报告文件。

## 术语词典 (terminology-dictionary.ts)

### 作用

- 🎯 **统一术语管理** - 集中管理所有专业术语的翻译规则
- 🔍 **翻译一致性保证** - 确保同一术语在不同语言中的翻译保持一致
- ⚙️ **质量验证支持** - 为翻译质量验证脚本提供术语检查规则

### 术语分类

1. **技术术语** (不应翻译)
   - API, GitHub, JavaScript, TypeScript, React 等

2. **品牌名称** (不应翻译)
   - Spotify, YouTube, Amazon, Goodreads 等

3. **心理健康术语** (应该翻译)
   - Assessment, Anxiety, Depression, Mindfulness 等

4. **通用UI术语** (应该翻译)
   - Error, Loading, Success, Cancel 等

### 添加新术语

在 `TERMINOLOGY_DICTIONARY` 中添加新条目：

```typescript
'NewTerm': {
  shouldTranslate: true, // 或 false
  translations: {
    zh: '新术语',
    es: 'Nuevo Término',
    ja: '新しい用語',
    ko: '새로운 용어',
    hi: 'नया शब्द',
    ar: 'مصطلح جديد'
  },
  description: '术语说明',
  context: ['category1', 'category2']
}
```

## 报告文件

验证脚本会在 `reports/` 目录下生成报告：

- `translation-report.json` - 翻译完整性报告
- `translation-quality-report.json` - 翻译质量报告

## 持续集成

建议在CI/CD流程中集成检查：

```yaml
- name: Check Translations
  run: pnpm check-translations && pnpm validate-translations
```
