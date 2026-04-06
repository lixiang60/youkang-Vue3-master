<template>
  <el-table
    v-loading="loading"
    v-bind="$attrs"
    :data="data"
    :border="border"
    :stripe="stripe"
    :height="height"
    style="width: 100%"
    @selection-change="handleSelectionChange"
    @select="handleSelect"
  >
    <template v-for="(col, index) in columns" :key="col.key || col.prop || index">
      <!-- 显隐控制：如果 col.visible 为 undefined，默认显示；如果不为 undefined，则根据值判断 -->
      <el-table-column
        v-if="col.visible !== false"
        v-bind="col"
        :prop="col.prop"
        :align="col.align || 'center'"
        :width="null"
        :min-width="col.width || col.minWidth"
      >
        <!-- 默认渲染：支持 defaultValue 配置 -->
        <template v-if="!col.slot && col.type !== 'selection' && col.type !== 'index'" #default="scope">
          <span>{{
            scope.row[col.prop] !== null && scope.row[col.prop] !== undefined
              ? scope.row[col.prop]
              : col.defaultValue !== undefined
                ? col.defaultValue
                : ''
          }}</span>
        </template>

        <!-- 自定义列模板 (Slot) -->
        <template v-else-if="col.slot && col.type !== 'selection' && col.type !== 'index'" #default="scope">
          <slot :name="col.slot" :row="scope.row" :index="scope.$index"></slot>
        </template>
      </el-table-column>
    </template>
  </el-table>

  <!-- 分页 -->
  <pagination
    v-show="total > 0"
    :total="total"
    :page="page"
    :limit="limit"
    @update:page="handlePageUpdate"
    @update:limit="handleLimitUpdate"
    @pagination="handlePagination"
  />
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: true
  },
  defaultWidth: {
    type: [String, Number],
    default: undefined
  },
  // 分页相关
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  },
  height: {
    type: [String, Number],
    default: undefined
  }
})

const emit = defineEmits(['selection-change', 'select', 'update:page', 'update:limit', 'pagination'])

function handleSelectionChange(selection) {
  emit('selection-change', selection)
}

function handleSelect(selection, row) {
  emit('select', selection, row)
}

function handlePageUpdate(val) {
  emit('update:page', val)
}

function handleLimitUpdate(val) {
  emit('update:limit', val)
}

function handlePagination(val) {
  emit('pagination', val)
}
</script>

<style scoped>
:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-table .cell) {
  padding: 4px 8px;
  font-size: 12px;
}

:deep(.el-table th.el-table__cell) {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
  font-size: 12px;
}

:deep(.el-table .el-table__body-wrapper .el-table__cell) {
  padding: 4px 0;
}
</style>
