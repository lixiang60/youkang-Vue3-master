---
trigger: always_on
description: 研发总纲 - 工具行为、占位规范与全局约束
---

# 📜 后台研发总纲 (General Development Guidelines)

本指南作为前端开发的核心总纲，定义了工具链行为、应急交互逻辑及全局样式底座。具体的页面、表格、接口规范请查阅各专项文档。

## 1. 🛠 开发辅助工具规范

### 1.1 验证文档行为
- **不要自动打开 walkthrough**：生成、保存或更新验证文档（如 `walkthrough.md`）后，**不应自动打开** 或引导编辑器弹出预览，以避免分散注意力。

### 1.2 任务执行占位规范
- **功能占位**：按钮已呈现但交互逻辑未编写时，统一调用 `proxy.$modal.msgInfo('功能开发中...')`。
- **接口占位**：交互已完成但 API 尚未接入时，统一调用 `proxy.$modal.msgWarning('API接入中...')`。

## 2. 🎨 全局样式与底座

- **强依赖全局样式**：优先复用全局 SCSS 变量、Mixins 和 Utility 组件样式（参见 `src/assets/styles/`）。
- **Element Plus 优先**：优先使用 Element 原生类设计，样式保持简洁。
- **Scoped 强约束**：自定义样式必须使用 `<style scoped>`，严禁无理由添加。

## 3. 📖 专项规范索引 (Rule Index)

在进行具体功能开发前，必须阅读并严格遵守以下相关专项规范：

| 模块 | 规范文件 | 核心关注点 |
| :--- | :--- | :--- |
| **数据列表/表格** | [table-style.md](file:///root/www/youkang/youkang-front/.agents/rules/table-style.md) | 高密度布局、动态显隐列、`DynamicTable` 使用、强压制样式。 |
| **组件/编码风格** | [component-rules.md](file:///root/www/youkang/youkang-front/.agents/rules/component-rules.md) | 代码结构顺序、对话框按钮标准、图标库使用、Form 布局。 |
| **后端接口对接** | [api-rules.md](file:///root/www/youkang/youkang-front/.agents/rules/api-rules.md) | 接口文档目录、后端 Java 源码参考、DTO/VO 字段命名对齐。 |
| **打印/报表规范** | [component-rules.md](file:///root/www/youkang/youkang-front/.agents/rules/component-rules.md)#4 | 打印组件复用、`v-print` 使用、宋体强制约束。 |

## 4. 🖨 报表与打印规范

- **组件化抽离**：复杂的打印布局（如送货单、确认单）必须抽离为独立的 Content 组件（如 `DeliveryNoteContent.vue`），严禁在业务页面直接编写大段打印 HTML。
- **通用容器**：优先使用通用 `PrintDialog` 组件作为预览包装，保持“预览 -> 确认 -> 打印”的交互一致性。
- **标准指令**：强一致性使用 `v-print` 指令触发打印，禁止直接调用原生 `window.print()`。
- **视觉约束**：
    - **字体**：正式报表强制使用 `font-family: 'SimSun', serif;`（宋体）。
    - **分页**：批量打印必须处理 `@media print` 下的分页符 (`page-break-after: always`)。
    - **精简**：打印样式中必须隐藏对话框页眉、页脚及所有非纸质内容。


---

> [!IMPORTANT]
> 每一个新页面的开发都应首先检视其是否符合 `table-style.md` 中定义的“高密度、体验友好”的列表看板规范。