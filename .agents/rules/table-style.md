---
trigger: always_on
---

# 📋 数据列表与表格设计规范 (Table & List Guidelines)

本项目为了处理**超多列、超高信息密度**的后台视界展示，在 `samples/index.vue` 中沉淀了一套紧凑型、体验友好的列表看板规范。后续所有新增或改造的列式看板**必须完全参照此规范执行**。

## 1. 🔍 查询条件区 (DynamicSearch)
为了避免厚重的表单把表格挤下视窗，初始状态不允许外露所有查询项。

- **组件引用**：使用统一配置驱动型组件 `<dynamic-search>`。
- **默认机制**：查询区域**默认完全隐藏（无 Collapser 面板外框）**，仅当玩家点击顶部工具栏的 `[查询]` 按钮时展开。
- **动效约束**：由于是动态显隐，必须配套 `<el-collapse-transition>`，实现推拉式软过渡，防止画面抖动生硬。
- **基本形式**：
  ```html
  <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />
  ```
- **视图层配置**：
  ```javascript
  const searchFields = ref([
    { prop: 'orderId', label: '订单号', type: 'input' },
    { prop: 'sampleType', label: '类型', type: 'select', options: [...] }
  ])
  ```

## 2. 🧮 动态表格组件 (DynamicTable)
普通列表禁止直接平铺 `<el-table>`。

- **显隐列支持**：采用 `<dynamic-table>` 并挂载 `:columns="columns"` 传导给 `<right-toolbar>`。
- **状态持久化**：必须在视图层增加 `watch(columns, ..., { deep: true })` 将设置好的 visible 矩阵塞入 `localStorage`，并在 `setup` 阶段还原，实现刷新不重置。
- **表格高边距**：一律追加 `size="small"`，极限压缩单元格行内撑离度。
- **核心列宽控准**：如 “订单号” 这种长字符串参数，基础宽度标准定为 `160px` 以上，严禁在首屏折行。

## 3. 🛠️ 顶部操作按钮 (Toolbar)
- **统调尺寸**：`<el-row class="mb8">` 内部所有的 `<el-button>` 级联必须补充 `size="small"`，缓解高密度工具下的视觉留白多导致的屏宽挤占。

## 4. 📐 隐藏层展开机制 (Expand Slot)
如果列数超过 12 列以上，建议将非高频列移入展开槽中，解放主表视界负担。

- **行展开**：在 columns 设置 `{ type: 'expand', slot: 'expand', width: 50, fixed: true }`。
- **面板承载**：使用 `<template #expand="scope">` 渲染 `<el-descriptions :column="4" size="small" border>` 用于折叠冗余备注、时间戳等附属字段。

## 5. 🎨 强制样式覆写 (Local Style Scoped)
为了防止 Element Plus 默认撑距松散，需在视图层底部强制追加强压制：
```css
<style scoped>
/* 1. 强力压缩表头高度并控小字体 */
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
  padding: 4px 0 !important;
}
/* 2. 压缩行内列间距保持高密度 */
:deep(.el-table--small .cell) {
  padding-left: 6px !important;
  padding-right: 6px !important;
}
</style>
```