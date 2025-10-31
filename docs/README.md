# Sunrain 文档中心

欢迎来到 Sunrain 项目文档中心！这里包含项目的技术文档、设计决策和开发指南。

## 📚 文档目录

### 架构和设计

- **[架构设计](./ARCHITECTURE.md)** ⭐
  - 系统整体架构
  - 技术栈说明
  - 核心模块设计
  - 数据管理策略
  - 性能优化方案

- **[项目状态](./PROJECT_STATUS.md)**
  - 当前实现状态
  - 已完成功能
  - 进行中的工作
  - 未来规划

- **[项目路线图](./ROADMAP.md)** ⭐
  - MVP 上线计划
  - 版本迭代规划
  - 里程碑时间表
  - 关键指标定义

- **[MVP 上线检查清单](./MVP_CHECKLIST.md)** ⭐
  - 详细任务清单
  - 分周计划
  - 验收标准
  - 进度追踪

- **[问卷系统设计](./QUESTIONNAIRE_SYSTEM_DESIGN.md)**
  - 问卷数据结构
  - 加载和管理机制
  - 多语言支持
  - 验证规则

### 开发指南

- **[迁移指南](./MIGRATION_GUIDE.md)**
  - 从 Monorepo 到单仓库的迁移
  - 技术债务清理
  - 历史决策记录

- **[状态管理指南](./state-management-guidelines.md)**
  - 状态管理最佳实践
  - React hooks使用规范
  - 数据流设计

- **[迁移完成清单](./MIGRATION_COMPLETION_CHECKLIST.md)**
  - 迁移任务检查列表
  - 验证步骤

### 技术细节

- **[暗色主题修复](./DARK_THEME_FIXES.md)**
  - 暗色模式实现
  - 主题切换逻辑
  - 样式适配

- **[构建性能](./turbo-caching.md)**
  - 构建优化策略
  - 缓存配置
  - 性能指标

### 测试和质量保证

- **[E2E 测试报告](./E2E-TESTING.md)** ⭐
  - Playwright E2E 测试结果
  - 测试覆盖率报告
  - 已知问题和修复建议
  - MVP 上线测试清单

- **[跨浏览器测试报告](./CROSS_BROWSER_TESTING.md)** ⭐
  - Chrome/Firefox/Safari 兼容性测试
  - 93% 总体通过率
  - 浏览器特性对比
  - 已知问题分析

- **[测试构建脚本](./test-build-performance.sh)**
  - 构建性能测试
  - 自动化测试脚本

## 🗂️ 文档分类

### 按读者分类

#### 新手开发者
1. 阅读 [架构设计](./ARCHITECTURE.md) 了解系统概况
2. 查看 [项目状态](./PROJECT_STATUS.md) 了解当前进度
3. 参考 [状态管理指南](./state-management-guidelines.md) 学习代码规范

#### 核心贡献者
1. [问卷系统设计](./QUESTIONNAIRE_SYSTEM_DESIGN.md) - 深入了解核心功能
2. [迁移指南](./MIGRATION_GUIDE.md) - 了解架构演进历史
3. [构建性能](./turbo-caching.md) - 优化构建流程

#### 内容贡献者
1. [问卷系统设计](./QUESTIONNAIRE_SYSTEM_DESIGN.md) - 学习如何添加问卷
2. [架构设计](./ARCHITECTURE.md) 的"核心模块"部分 - 了解数据结构

### 按主题分类

#### 🏗️ 架构和设计
- [架构设计](./ARCHITECTURE.md)
- [项目状态](./PROJECT_STATUS.md)
- [项目路线图](./ROADMAP.md)
- [MVP 上线检查清单](./MVP_CHECKLIST.md)
- [问卷系统设计](./QUESTIONNAIRE_SYSTEM_DESIGN.md)

#### 💻 开发实践
- [状态管理指南](./state-management-guidelines.md)
- [迁移指南](./MIGRATION_GUIDE.md)

#### ⚡ 性能和优化
- [暗色主题修复](./DARK_THEME_FIXES.md)

#### ✅ 测试和验证
- [E2E 测试报告](./E2E-TESTING.md)
- [跨浏览器测试报告](./CROSS_BROWSER_TESTING.md)
- [迁移完成清单](./MIGRATION_COMPLETION_CHECKLIST.md)
- [测试构建脚本](./test-build-performance.sh)

## 🔍 快速查找

### 我想了解...

| 问题 | 查看文档 |
|------|---------|
| 项目整体架构是什么？ | [架构设计](./ARCHITECTURE.md) |
| 项目下一步做什么？ | [项目路线图](./ROADMAP.md) |
| MVP 上线需要做什么？ | [MVP 检查清单](./MVP_CHECKLIST.md) |
| 当前实现了哪些功能？ | [项目状态](./PROJECT_STATUS.md) |
| 如何添加新问卷？ | [问卷系统设计](./QUESTIONNAIRE_SYSTEM_DESIGN.md) |
| 如何管理组件状态？ | [状态管理指南](./state-management-guidelines.md) |
| 为什么从 Monorepo 改为单仓库？ | [迁移指南](./MIGRATION_GUIDE.md) |
| 暗色模式如何实现？ | [暗色主题修复](./DARK_THEME_FIXES.md) |

## 📝 文档维护规范

### 文档类型

1. **设计文档** - 记录技术决策和架构设计
2. **指南文档** - 提供操作步骤和最佳实践
3. **状态文档** - 追踪项目进度和任务状态

### 更新规则

- ✅ **保持更新** - 代码变更后及时更新相关文档
- ✅ **版本标记** - 重要变更记录版本号和日期
- ✅ **清晰简洁** - 使用清晰的标题和结构
- ✅ **代码示例** - 提供实际代码示例
- ❌ **避免重复** - 不重复其他文档的内容，而是链接引用
- ❌ **不要总结** - 不创建AI对话的总结文档（Git已提供版本控制）

### 文档格式

```markdown
# 文档标题

版本：x.x  
最后更新：YYYY-MM-DD

## 概述
[简短描述文档内容和目的]

## 目录
[可选：对于长文档提供目录]

## 主要内容
[详细内容]

## 相关文档
[链接到相关文档]

---
文档维护：[维护说明]  
最后审查：YYYY-MM-DD
```

## 🚀 快速开始

如果你是第一次接触本项目，建议按以下顺序阅读：

1. **[../README.md](../README.md)** - 项目概览和快速开始
2. **[ROADMAP.md](./ROADMAP.md)** - 了解项目规划
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 理解系统架构
4. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - 了解当前状态
5. **[state-management-guidelines.md](./state-management-guidelines.md)** - 学习代码规范

然后根据你的兴趣选择其他文档深入学习。

## 📊 文档统计

| 类型 | 数量 |
|------|------|
| 架构设计文档 | 5 |
| 开发指南 | 3 |
| 测试报告 | 2 |
| 技术细节 | 1 |
| 脚本和工具 | 1 |
| **总计** | **12** |

## 💡 贡献文档

如果你发现文档有误或需要补充：

1. 在相关文档直接修改
2. 遵循上述文档格式规范
3. 更新"最后更新"日期
4. 提交 Pull Request

对于新增文档：

1. 确认不与现有文档重复
2. 遵循命名规范（使用英文，小写+连字符）
3. 在本 README 中添加索引
4. 提供清晰的文档结构

## 🔗 外部资源

### 技术文档
- [Astro 文档](https://docs.astro.build)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs)

### 心理健康评估
- [PHQ-9](https://www.phqscreeners.com/)
- [GAD-7](https://www.phqscreeners.com/)

## 📞 需要帮助？

- 查看 [GitHub Issues](https://github.com/yourusername/sunrain/issues)
- 阅读 [FAQ](../README.md#faq)（待添加）
- 联系维护者

---

**文档持续更新中**  
最后更新：2024-10-31  
版本：2.0
