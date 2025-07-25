# 文件结构说明

## 问题解释

### `scripts/src/content/resources/` 目录（已删除）

这个目录是由于配置错误而意外创建的：

**原因：**
- 内容获取脚本在 `scripts/` 目录下运行
- 配置中使用了相对路径 `src/content/resources/books.json`
- 相对路径从 `scripts/` 目录开始计算，变成了 `scripts/src/content/resources/`
- 导致文件被写入错误位置

**修复：**
- 将配置路径改为 `../src/content/resources/books.json`
- 删除了错误创建的 `scripts/src/` 目录

### `.backup.xxx` 文件的作用

这些备份文件是多语言同步系统的安全机制：

**功能：**
- 每次更新资源文件前自动创建备份
- 防止数据丢失和意外覆盖
- 支持版本回滚

**命名格式：**
```
原文件名.backup.时间戳
例如：books.json.backup.2025-07-24T17-35-43-766Z
```

**管理：**
- 自动创建：每次文件更新时
- 自动清理：可通过 `npm run i18n:cleanup` 清理7天前的备份
- 手动清理：可以安全删除不需要的备份文件

## 正确的文件结构

```
项目根目录/
├── src/content/resources/          # 网站资源文件（正确位置）
│   ├── books.json                  # 英文书籍资源
│   ├── books_zh.json              # 中文书籍资源
│   ├── books_es.json              # 西班牙语书籍资源
│   ├── books_fr.json              # 法语书籍资源
│   ├── music.json                 # 音乐资源
│   ├── movies.json                # 电影资源
│   └── *.backup.*                 # 备份文件
│
└── scripts/                       # 内容获取脚本
    ├── content-fetcher/           # 获取器代码
    ├── package.json              # 脚本依赖
    └── .env                      # API配置（需要创建）
```

## 配置修复

### 主要配置文件修复：

1. **`scripts/content-fetcher/config.ts`**
   ```typescript
   output: {
     booksPath: '../src/content/resources/books.json',    // 修复：添加 ../
     musicPath: '../src/content/resources/music.json',
     moviesPath: '../src/content/resources/movies.json'
   }
   ```

2. **`scripts/content-fetcher/i18n-cli.ts`**
   ```typescript
   const syncConfig: SyncConfig = {
     outputDir: '../src/content/resources',              // 修复：添加 ../
     // ...其他配置
   };
   ```

## 使用建议

### 备份文件管理：
```bash
# 查看备份文件
ls -la src/content/resources/*.backup.*

# 清理旧备份（7天前）
cd scripts && npm run i18n:cleanup

# 手动删除特定备份
rm src/content/resources/books.json.backup.2025-07-24T17-35-43-766Z
```

### 内容更新：
```bash
# 在scripts目录下运行
cd scripts

# 更新内容（会自动创建备份）
npm run fetch:all

# 同步多语言（会自动创建备份）
npm run i18n:sync
```

## 安全提示

1. **备份文件**：
   - 不要删除最近的备份文件
   - 定期清理旧备份以节省空间
   - 重要更新前可以手动创建备份

2. **路径配置**：
   - 确保所有路径配置正确指向 `../src/content/resources/`
   - 测试时使用 `--dry-run` 参数避免意外修改

3. **版本控制**：
   - 备份文件通常不需要提交到Git
   - 可以在 `.gitignore` 中添加 `*.backup.*` 规则