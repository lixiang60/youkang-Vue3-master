<template>
  <el-table
    v-loading="loading"
    :data="data"
    :border="border"
    :stripe="stripe"
    style="width: 100%"
    @selection-change="handleSelectionChange"
  >
    <template v-for="(col, index) in columns" :key="col.key || col.prop || index">
      <!-- 显隐控制：如果 col.visible 为 undefined，默认显示；如果不为 undefined，则根据值判断 -->
      <el-table-column
        v-if="col.visible !== false"
        v-bind="col"
        :prop="col.key || col.prop"
        :align="col.align || 'center'"
        :width="col.width || defaultWidth"
      >
        <!-- 自定义列模板 (Slot) -->
        <template v-if="col.slot" #default="scope">
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
const props = defineProps({
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
  }
})

const emit = defineEmits(['selection-change', 'update:page', 'update:limit', 'pagination'])

function handleSelectionChange(selection) {
  emit('selection-change', selection)
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
