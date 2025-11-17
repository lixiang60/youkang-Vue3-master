---
description: CLI工具使用指南 - 快速生成组件、页面和API
---

# CLI 工具使用指南

本项目提供了一个统一的 CLI 工具 `npm run generate`，用于快速生成组件、页面和 API 文件，提高开发效率。

## 快速开始

```bash
npm run generate
```

运行上述命令后，将进入交互式菜单，您可以选择要生成的类型：

```
╔════════════════════════════════════════╗
║     优康项目代码生成器 v1.0           ║
╚════════════════════════════════════════╝

请选择要生成的类型:
  1. 组件 (Component)
  2. 页面 (Page + API + Route)
  3. API (仅API文件)
  0. 退出
```

---

## 命令行模式

除了交互式模式，您也可以直接通过命令行参数使用：

### 1. 生成组件

```bash
npm run generate component <组件名称> [目录]
# 简写
npm run generate c <组件名称> [目录]
```

**示例**:

```bash
# 在 components 目录下创建 UserCard 组件
npm run generate c UserCard

# 在 components/business 目录下创建 ProductList 组件
npm run generate c ProductList business
```

### 2. 生成页面

```bash
npm run generate page <模块名> <页面名> [中文名称]
# 简写
npm run generate p <模块名> <页面名> [中文名称]
```

**示例**:

```bash
# 生成系统模块的产品管理页面
npm run generate p system product 产品管理
```

生成的资源包括：

- `src/views/system/product/index.vue` (页面文件)
- `src/api/system/product.js` (API 文件)
- `src/views/system/product/route-config.js` (路由配置片段)

### 3. 生成 API

```bash
npm run generate api <模块名> <资源名> [中文名称]
# 简写
npm run generate a <模块名> <资源名> [中文名称]
```

**示例**:

```bash
# 生成产品 API
npm run generate a system product 产品
```

---

## 生成文件说明

### 组件 (Component)

- 路径: `src/components/[目录]/[组件名]/`
- 包含: `.vue` 文件和 `index.js` 导出文件
- 模板: 包含基础的 props, emits 和样式结构

### 页面 (Page)

- 路径: `src/views/[模块]/[页面]/index.vue`
- 特性:
  - 完整的 CRUD 结构 (查询、新增、修改、删除、导出)
  - 自动集成权限标识 (如 `system:user:add`)
  - 包含分页、字典、日期选择等常用功能

### API

- 路径: `src/api/[模块]/[资源].js`
- 包含: list, get, add, update, del, export 等标准接口

---

## 注意事项

1. **命名规范**: 组件名称请使用 PascalCase (如 `UserCard`)，页面和模块名使用 camelCase (如 `user`, `system`)。
2. **路由配置**: 生成页面后，CLI 会生成一个 `route-config.js` 文件，您需要手动将其中的配置添加到 `src/router/index.js` 中。
3. **文件覆盖**: 如果目标文件已存在，CLI 会提示是否覆盖。
