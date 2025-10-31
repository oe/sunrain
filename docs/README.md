# Sunrain 项目文档

本目录包含 Sunrain 项目的核心技术文档。

## 核心文档

### 架构和设计

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 整体架构设计文档
  - 系统架构概览
  - 技术栈说明
  - 核心模块设计
  - 数据管理策略
  - 多语言系统
  - 性能优化

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - 项目当前状态
  - 已实现功能列表
  - 技术架构现状
  - 代码组织结构
  - 下一步计划

- **[QUESTIONNAIRE_SYSTEM_DESIGN.md](./QUESTIONNAIRE_SYSTEM_DESIGN.md)** - 问卷系统设计
  - 问卷数据结构
  - 问卷加载和验证
  - 评分和解读系统

### 开发指南

- **[state-management-guidelines.md](./state-management-guidelines.md)** - 状态管理指南
  - React 状态管理最佳实践
  - 组件状态设计原则
  - 常见模式和反模式

### 构建和性能

- **[turbo-caching.md](./turbo-caching.md)** - Turbo 构建缓存
  - Turbo 配置说明
  - 缓存策略
  - 性能优化技巧

- **[test-build-performance.sh](./test-build-performance.sh)** - 构建性能测试脚本
  - 自动化性能测试
  - 构建时间对比

## 文档导航

### 新手入门
1. 先阅读 [PROJECT_STATUS.md](./PROJECT_STATUS.md) 了解项目现状
2. 再阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) 理解整体架构
3. 根据需要查看具体模块的设计文档

### 开发者
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - 理解系统架构
2. [state-management-guidelines.md](./state-management-guidelines.md) - 状态管理规范
3. [turbo-caching.md](./turbo-caching.md) - 构建优化

### 贡献者
1. 查看项目根目录的 `README.md`
2. 阅读 [PROJECT_STATUS.md](./PROJECT_STATUS.md) 了解当前状态
3. 根据需要查看相关设计文档

## 文档维护

### 更新原则
- 重大架构变更时更新 ARCHITECTURE.md
- 功能实现后及时更新 PROJECT_STATUS.md
- 保持文档与代码同步
- 过时内容直接删除

## 相关资源

- **项目主页**: https://sunrain.fun
- **GitHub**: https://github.com/[your-org]/sunrain

## 贡献文档

如果你想贡献文档：

1. 遵循现有的文档格式和风格
2. 使用清晰的标题和结构
3. 添加代码示例和图表说明
4. 更新本 README 添加文档链接
5. 提交 PR 前确保 Markdown 格式正确

---

最后更新：2024-10-31
