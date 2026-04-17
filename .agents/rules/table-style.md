---
trigger:
  - patterns: ["**/src/views/**/index.vue"]
  - keywords: ["DynamicTable", "表格", "列表", "查询面板", "搜索面板"]
description: 当开发、重构或修改 Vue 列表数据页面 (通常是 index.vue) 以及涉及 DynamicTable 样式、高密度排版或顶部搜索面板时，必须遵循此规约。
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
- **统调尺寸**：`<el-row class="mb8">` 内部所有的 `<el-button>` 级联必须补充 `size="small"`。
- **布局一致性**：操作栏容器使用 `.mb8` 类主要用于控制下边距（通常为 8px-12px）。**除非是门户型仪表盘，否则严禁在局部强加白色背景与内边距**，以避免在已具备 Padding 的 `app-container` 中产生“框中框”或“空格边框”的视觉残留。

## 4. 📐 状态持久化 (Persistence)
- **列显隐记录**：必须在视图层增加针对 `columns` 的深度监听，将其 visible 矩阵塞入 `localStorage`，并在 `setup` 阶段还原。
  ```javascript
  const storageKey = 'unique_page_key'
  const savedColumns = localStorage.getItem(storageKey)
  const columns = ref(savedColumns ? JSON.parse(savedColumns) : [...])

  watch(columns, (val) => {
    localStorage.setItem(storageKey, JSON.stringify(val))
  }, { deep: true })
  ```

## 5. 🎨 局部样式建议 (Local Style Scoped)
为了防止 Element Plus 默认撑距过于松散，建议在视图层底部进行轻量压制。**注意：不再强制要求设置固定的背景色，以适配全局主题。**
```css
<style scoped>
/* 1. 紧凑型表头 (遵循高密度原则) */
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  padding: 4px 0 !important;
  font-weight: 600;
}
/* 2. 压缩单元格内间距 */
:deep(.el-table--small .cell) {
  padding-left: 8px !important;
  padding-right: 8px !important;
}
.mb8 {
  margin-bottom: 8px;
}
</style>
```