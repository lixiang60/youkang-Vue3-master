---
trigger: always_on
description: 工具与编辑器行为规范
---

# 🛠 开发辅助工具规范

## 1. 验证文档行为

- **不要自动打开 walkthrough**：生成、保存或更新验证文档（如 `walkthrough.md`）后，**不应自动打开** 或引导编辑器（如 VSCode/Cursor）弹出预览该文档，以避免分散开发注意力。

## 2. 任务执行规范

- **简单任务免确认**：对于简单的、无风险的单点修改（如更新文档、修改简单规则/文件等），在生成计划时应充分利用 `ShouldAutoProceed: true` 支持工作流自动流转，或对于极简任务直接进入执行，避免通过 `notify_user` 阻塞等待用户手动输入 `continue` 确认。

# 🎨 样式与编码规范

## 1. 全局样式优先规则

- **强依赖全局样式**：项目中高度复用了全局 SCSS 变量、Mixins 和 Utility 组件样式（参见 `src/assets/styles/` 目录）。
- **优先使用element原生样式**：优先使用element原生类，样式保持代码简洁，截图只是layout实现
- **禁止随意添加私有样式**：在 Vue 组件中，**杜绝**无理由添加与全局视觉设计不一致的随意样式定义。绝大多数基础样式（边距、颜色、字体、按钮样式）应引用全局系统。
- **图标使用规范**：所有图标必须使用 `element-plus/icons-vue` 库，并推荐采用组件导入方式（如 `:icon="Search"`），以保持样式规范及类型安全。
- **Scoped 约束**：由于是公共/后台系统，组件内部自定义样式必须使用 `<style scoped>`，防止样式污染全局或其他组件。

## 2. 页面样式代码结构风格

- Imports (导入)：统一放在最顶部。
- Constants & Config (常量与配置)：包括 columns 定义、searchFields、验证规则 rules 等静态配置。
- State (响应式状态)：集中定义所有 ref 和 reactive（如 loading、分页数据、弹窗控制开关、表单对象等）。
- Computed (计算属性)：如 selectedProduceIds。
- Methods (方法)：按照逻辑功能分组（查询、基础 CRUD、业务操作、辅助工具函数）。
- Lifecycle Hooks (生命周期)：onMounted 和 onActivated 放在方法之后。
- Watchers (监听器)：如列显隐的 watch。
