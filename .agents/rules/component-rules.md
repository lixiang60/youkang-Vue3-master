---
trigger: always_on
---

# 🧩 组件与页面编码规范 (Component & Coding Guidelines)

本规范定义了 Vue 组件开发中的结构、交互及按钮样式标准，以确保全站视觉与逻辑的一致性。

## 1. 📂 页面代码结构规范

为了提高代码的可维护性和一致性，Vue 组件内部代码应按以下顺序排列：

- **Imports (导入)**：统一放在最顶部。
- **Constants & Config (静态配置)**：包括 `columns` 定义、searchFields、验证规则 `rules` 等。
- **State (响应式状态)**：集中定义所有 `ref` 和 `reactive`（如 `loading`、分页数据、弹窗开关、表单对象等）。
- **Computed (计算属性)**：如 `selectedIds` 等派生状态。
- **Methods (方法)**：按照逻辑功能分组（查询、基础 CRUD、业务操作、辅助工具函数）。
- **Lifecycle Hooks (生命周期)**：`onMounted` 和 `onActivated` 等放在方法之后。
- **Watchers (监听器)**：如对分页跳转、列显隐的监听。

## 2. 💬 对话框 (Dialog) 规范

- **宽度与层级**：统一使用 `append-to-body`，避免层级遮挡。宽度根据复杂度建议使用 `600px` - `1000px` 或百分比。
- **按钮规范**：
    - **确定按钮**：统一使用 `type="success" :icon="Check"`，标签为 `确定`（无空格）。
    - **取消按钮**：统一使用 `type="danger" :icon="Close"`，标签为 `取消`（无空格）。
- **底部容器**：必须使用 `<div class="dialog-footer" style="text-align: center">` 包裹操作按钮。

## 3. 🔘 按钮与图标规范

- **图标使用**：所有图标必须使用 `element-plus/icons-vue` 库。
- **配置方式**：推荐采用组件/变量导入方式（如 `:icon="Search"`），而非字符串形式，以保证类型安全和样式规范。
- **按钮尺寸**：在表格工具栏及弹窗页脚中，统一使用 `size="small"` 以维持紧凑布局。

## 4. 📝 表单与校验规范

- **Scoped 约束**：由于是公共/后台系统，组件内部自定义样式必须使用 `<style scoped>`，严禁污染全局。
- **布局一致性**：表单内部推荐使用项目沉淀的 `.well-form` 或 `.form-row` 类来实现整齐的标签与输入框对齐方式（参考 `src/assets/styles/`）。

## 5. ⚠️ 业务确认与反馈规范

- **核心动作确认**：涉及删除、结算、批量修改等具有破坏性或流程转折性的操作，必须使用 `proxy.$modal.confirm('确认消息')` 弹出提示，严禁静默执行。
- **状态反馈**：异步操作执行中需挂载 `v-loading`；执行完成后需调用 `proxy.$modal.msgSuccess()` 给出明确反馈。

## 6. 🖨 报表与打印规范

- **字体约束**：正式报表、送货单、报告单必须强制使用 `font-family: 'SimSun', serif;`（宋体），确保打印预览与纸质输出的一致性。
- **布局抽离**：复杂的打印 HTML 片段必须抽离为业务对应的独立组件，通过 `v-print` 指令或 `PrintDialog` 触发。
- **视觉一致性**：打印容器样式必须处理 `@media print` 下的分页符 (`page-break-after: always`) 并隐藏所有非打印 UI 元素（如按钮、背景区）。