# Mental Health Content Fetcher

自动化内容获取系统，用于从各种API获取心理健康相关的书籍、电影和音乐资源。

## 功能特性

- **模块化架构**: 基于接口的设计，易于扩展和维护
- **多资源支持**: 支持书籍、电影、音乐三种资源类型
- **内容验证**: 自动验证内容质量和心理健康相关性
- **错误处理**: 完善的错误处理和日志记录系统
- **配置管理**: 灵活的配置系统支持多种API
- **重试机制**: 内置指数退避重试机制

## 目录结构

```
content-fetcher/
├── types.ts          # 类型定义
├── config.ts         # 配置管理
├── logger.ts         # 日志系统
├── errors.ts         # 错误处理
├── validator.ts      # 内容验证
├── base-fetcher.ts   # 基础获取器类
├── cli.ts           # 命令行接口
├── index.ts         # 主入口文件
└── README.md        # 文档
```

## 配置

系统通过环境变量配置API密钥：

```bash
# Goodreads API (用于书籍)
GOODREADS_API_KEY=your_goodreads_api_key

# Spotify API (用于音乐)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# TMDB API (用于电影)
TMDB_API_KEY=your_tmdb_api_key
```

## 使用方法

### 命令行界面

```bash
# 获取所有类型的内容
npm run fetch:all

# 获取特定类型的内容
npm run fetch:books
npm run fetch:movies
npm run fetch:music

# 干运行（不更新文件）
tsx content-fetcher/cli.ts --type all --dry-run

# 详细日志
tsx content-fetcher/cli.ts --verbose
```

### 编程接口

```typescript
import { BaseContentFetcher, loadConfig } from './content-fetcher/index.js';

const config = loadConfig();
const fetcher = new MyContentFetcher(config);

// 获取并更新所有资源
const books = await fetcher.fetchBooks();
const movies = await fetcher.fetchMovies();
const music = await fetcher.fetchMusic();

await fetcher.updateResourceFiles({ books, movies, music });
```

## 内容验证

系统会自动验证获取的内容：

1. **必填字段检查**: 确保标题和描述等必填字段存在
2. **描述长度**: 确保描述足够详细（默认最少50字符）
3. **心理健康相关性**: 检查内容是否包含心理健康相关关键词
4. **数据完整性**: 验证特定资源类型的必要字段

## 错误处理

系统提供多层错误处理：

- `ContentFetcherError`: 基础错误类
- `APIError`: API调用错误
- `ValidationError`: 内容验证错误
- `ConfigurationError`: 配置错误

所有错误都会被记录到日志系统中，便于调试和监控。

## 扩展指南

要添加新的资源类型或API集成：

1. 在 `types.ts` 中定义新的接口
2. 在 `config.ts` 中添加相应的配置
3. 创建继承自 `BaseContentFetcher` 的具体实现类
4. 在 `validator.ts` 中添加特定的验证逻辑

## 后续开发

此基础架构为后续子任务提供了框架：

- **2.2**: 实现书籍资源自动获取 (Goodreads API)
- **2.3**: 实现音乐资源自动获取 (Spotify API)
- **2.4**: 实现电影资源自动获取 (TMDB API)
- **2.5**: 设置GitHub Actions自动化工作流
- **2.6**: 实现多语言内容同步机制