# 🎨 DynamicTable 插槽 (Slot) 使用指南

本文档介绍如何在 `DynamicTable` 组件中使用动态插槽来渲染复杂的列内容（如标签、按钮等）。

## 1. 核心原理

`DynamicTable` 内部通过 `v-for` 遍历 `columns` 配置。当检测到列配置中包含 `slot` 字段时，它会通过 `<slot>` 标签将渲染权转发给父组件。

### 核心代码段 (DynamicTable/index.vue)

```vue
<!-- 自定义列模板 (Slot) 转发机制 -->
<template v-else-if="col.slot && col.type !== 'selection' && col.type !== 'index'" #default="scope">
  <slot :name="col.slot" :row="scope.row" :index="scope.$index"></slot>
</template>
```

- **`:name="col.slot"`**: 动态绑定父组件提供的插槽名称。
- **`:row="scope.row"`**: 将当前行的数据对象传递给父组件。
- **`:index="scope.$index"`**: 将当前行的索引传递给父组件。

---

## 2. 使用方法

### 第一步：在 `columns` 中定义插槽名

在你的页面（父组件）中，为需要自定义渲染的列指定一个唯一的 `slot` 名称。

```javascript
const columns = ref([
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', width: 120 },
  { 
    prop: 'status', 
    label: '状态', 
    width: 100,
    slot: 'statusSlot' // 👈 定义插槽名称
  }
])
```

### 第二步：在页面模板中实现插槽内容

使用 `v-slot` (简写为 `#`) 配合你在配置中定义的名称。

```vue
<dynamic-table :columns="columns" :data="dataList">
  
  <!-- 使用 #statusSlot 接收子组件传递的 row 数据 -->
  <template #statusSlot="{ row }">
    <el-tag :type="row.status === 1 ? 'success' : 'danger'">
      {{ row.status === 1 ? '启用' : '禁用' }}
    </el-tag>
  </template>

</dynamic-table>
```

---

## 3. 注意事项

1. **名称唯一性**：请确保同一表格内的 `slot` 名称不冲突。
2. **特殊列跳过**：`type="selection"` 和 `type="index"` 类型的列由组件内部自动处理，不支持自定义 Slot 覆盖。
3. **数据访问**：父组件可以通过解构赋值 `{ row, index }` 轻松获取当前行数据，无需手动维护。
