---
trigger: always_on
description: 工具与编辑器行为规范
---

# 🛠 开发辅助工具规范

## 1. 验证文档行为

- **不要自动打开 walkthrough**：生成、保存或更新验证文档（如 `walkthrough.md`）后，**不应自动打开** 或引导编辑器（如 VSCode/Cursor）弹出预览该文档，以避免分散开发注意力。

## 2. 任务执行规范

- **交互占位规范**：当功能按钮已在 UI 中展现，但具体的交互逻辑（如弹窗展示、页面跳转等）尚未编写时，应统一通过 `proxy.$modal.msgInfo('功能开发中...')` 给出明确反馈。
- **接口占位规范**：在一个功能模块的交互（如弹窗已弹出）已完成，但核心业务 API 尚未接入到确定（submit）动作时，应统一通过 `proxy.$modal.msgWarning('API接入中...')` 指明进度。

# 🎨 样式与编码规范

## 1. 全局样式优先规则

- **强依赖全局样式**：项目中高度复用了全局 SCSS 变量、Mixins 和 Utility 组件样式（参见 `src/assets/styles/` 目录）。
- **优先使用element原生样式**：优先使用element原生类，样式保持代码简洁，截图只是layout实现
- **禁止随意添加私有样式**：在 Vue 组件中，**杜绝**无理由添加与全局视觉设计不一致的随意样式定义。绝大多数基础样式（边距、颜色、字体、按钮样式）应引用全局系统。
- **图标使用规范**：所有图标必须使用 `element-plus/icons-vue` 库，并推荐采用组件导入方式（如 `:icon="Search"`），以保持样式规范及类型安全。
- **对话框按钮规范**：确定按钮统一使用 `type="success" :icon="Check"`，标签为 `确定`（无空格）；取消按钮统一使用 `type="danger" :icon="Close"`，标签为 `取消`（无空格）。底部容器需使用 `<div class="dialog-footer" style="text-align: center">`。
- **Scoped 约束**：由于是公共/后台系统，组件内部自定义样式必须使用 `<style scoped>`，防止样式污染全局或其他组件。

## 2. 页面样式代码结构风格

- Imports (导入)：统一放在最顶部。
- Constants & Config (常量与配置)：包括 columns 定义、searchFields、验证规则 rules 等静态配置。
- State (响应式状态)：集中定义所有 ref 和 reactive（如 loading、分页数据、弹窗控制开关、表单对象等）。
- Computed (计算属性)：如 selectedProduceIds。
- Methods (方法)：按照逻辑功能分组（查询、基础 CRUD、业务操作、辅助工具函数）。
- Lifecycle Hooks (生命周期)：onMounted 和 onActivated 放在方法之后。
- Watchers (监听器)：如列显隐的 watch。
