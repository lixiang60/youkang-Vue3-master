---
trigger: always_on
description: 研发总纲 - 工具行为、占位规范、全局样式基调与规则路由矩阵
---

# 📜 后台研发总纲 (General Development Guidelines)

本指南作为前端开发的核心总纲，全局且始终生效。它定义了全局样式基调、代码骨架原则以及对其他专业级规范的“路由指引”。

## 1. 🏗 代码物理结构原则 (Golden Pattern)

- **Vue 页面/组件骨架约束**：开发复杂业务场景（例如 `index.vue`）时，强制要求具有清晰的“物理分块（6~7大基础块）”。即：引入库 -> `Constants & Config` -> `State (响应式数据)` -> `Computed (派生数据)` -> `Methods (业务逻辑与 API)` -> `Lifecycle (生命周期)` -> `Watchers (监听器)`。
- **目标**：杜绝将响应式变量和杂乱函数像面条一样堆叠。

## 2. 🎨 全局视觉基调 (Global UI Aesthetics)

- **主推现代清爽留白 ("呼吸感"布局)**：弹窗内部表单及模块布局，必须优先使用 Element 原生 `el-form-item` 搭配 `el-row :gutter="20"`，留出充足且舒适的空间。
- **禁绝生硬强排版**：严禁在常规 CRUD 弹窗中使用类 Excel 的 `.well-form` 硬编码网格边框布局。带边框的密集排版只允许出现在“打印参数设定”或高密度财务报表显示等受限业务中。
- **头部强视觉导向**：复杂弹窗要求使用 `<template #header>` 配合对应的功能图标（如 `<EditPen />`、`<DocumentAdd />` 等）与加粗标题，以提高用户的注意力聚焦。
- **Scoped 强约束**：自定义样式必须使用 `<style scoped>`，严禁污染全局，强依赖于 `src/assets/styles/` 中的核心公用样式。

## 3. 🛠 占位与反馈逻辑 (Placeholder Logic)

- **功能级占位**：按钮存在但尚未实现细节链路时，统一调用 `proxy.$modal.msgInfo('xxx功能开发中...')`。
- **接口级占位**：前端骨架与表单逻辑编写已完备，但等待后端提供 API 时，统一调用 `proxy.$modal.msgWarning('API接入中...')`。

## 4. 🧭 专项规范矩阵 (Rule Routing Matrix)

作为 Agent，在执行当前业务指令时，如果涉及以下场景，**必须主动去阅读对应的专业规约文件**：

| 如果您的任务涉及... | MUST READ: 必读指令文件 | 核心控制域 |
| :--- | :--- | :--- |
| **数据展示列表 / 顶部搜索面板** | [table-style.md](file:///root/www/youkang/youkang-front/.agents/rules/table-style.md) | `DynamicTable`使用规范、高密度CSS压层覆盖、列名动态本地记忆、搜索面板折叠态控制。 |
| **新建、重构 Vue 弹窗组件** | [component-rules.md](file:///root/www/youkang/youkang-front/.agents/rules/component-rules.md) | 业务组件设计、对话框 `v-model` 数据反向透传模式、破坏性操作的二次防呆确认、**打印页面及报表**处理专篇。 |
| **新建 API 请求 / 调试与 Java 对接** | [api-rules.md](file:///root/www/youkang/youkang-front/.agents/rules/api-rules.md) | axios 请求方法设定 (`GET/POST` 及 payload )、后端 DTO 字段对齐规范。 |

---

> [!IMPORTANT]
> - 开发过程中，避免用工具自动唤起或强行预览新生成的 markdown 跟踪文档（如 `walkthrough.md`），以防止打断开发流。
> - 每次进行相关模块开发时，通过本矩阵精准索引专项规则，以此维系系统长期的整洁度。