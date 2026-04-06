<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain :icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain :icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      v-loading="loading"
      size="small"
      :header-cell-style="{ fontSize: '12px' }"
      :data="dataList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @select="handleSelect"
    />
  </div>
</template>

<script setup name="CapillaryTracking">
import { ref, reactive, toRefs, onMounted, getCurrentInstance } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { listOrder } from '@/api/sequencing/order'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const { proxy } = getCurrentInstance()

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'id', label: 'id', minWidth: 80, visible: true },
  { prop: 'plateNo', label: '板号', minWidth: 150, visible: true },
  { prop: 'machineNo', label: '机器号', minWidth: 120, visible: true },
  { prop: 'createBy', label: '添加人', minWidth: 100, visible: true },
  { prop: 'createTime', label: '添加时间', minWidth: 180, visible: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true }
])

const searchFields = ref([
  { prop: 'plateNo', label: '板号', type: 'input' },
  { prop: 'machineNo', label: '机器号', type: 'input' }
])

const dataList = ref([])
const total = ref(0)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const searchRef = ref(null)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    plateNo: undefined,
    machineNo: undefined
  }
})

const { queryParams } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listOrder(queryParams.value)
    .then(response => {
      dataList.value = response.data.rows
      total.value = response.data.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索 & 刷新 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

function handleSelect(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

/** 业务扩展手柄 */
function handleExport() {
  proxy.$modal.msg('导出功能开发中...')
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
}
</style>
