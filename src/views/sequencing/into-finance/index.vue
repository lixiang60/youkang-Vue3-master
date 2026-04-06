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

<script setup name="IntoFinance">
import { ref, reactive, toRefs, onMounted, getCurrentInstance } from 'vue'
import { listOrder } from '@/api/sequencing/order'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const { proxy } = getCurrentInstance()

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { key: 'orderId', label: '订单号', minWidth: 150, fixed: true, sortable: true, visible: true },
  { key: 'customerId', label: '客户ID', minWidth: 80, visible: true },
  { key: 'customerName', label: '客户姓名', minWidth: 120, fixed: true, showOverflowTooltip: true, visible: true },
  { key: 'customerAddress', label: '客户地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { key: 'groupId', label: '课题组ID', minWidth: 80, visible: true },
  { key: 'groupName', label: '课题组', minWidth: 140, showOverflowTooltip: true, visible: true },
  { key: 'orderType', label: '订单类型', minWidth: 110, visible: true },
  { key: 'endTime', label: '结束时间', minWidth: 180, visible: true },
  { key: 'orderInfo', label: '订单信息', minWidth: 150, visible: true },
  { key: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true },
  { key: 'orderStatus', label: '订单状态', minWidth: 100, visible: true },
  { key: 'paymentStatus', label: '付款状态', minWidth: 100, visible: true },
  { key: 'pointCalculation', label: '积分计算', minWidth: 100, visible: true }
])

const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' }
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
    orderId: undefined,
    customerName: undefined
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
  ids.value = selection.map(item => item.orderId)
  multiple.value = !selection.length
}

/** 业务扩展手柄 */
function handleOrderPayment() {
  proxy.$modal.msg('订单款项功能开发中...')
}

function handleReturn() {
  const returnIds = ids.value
  proxy.$modal.confirm('是否确认退回选中的订单编号为 "' + returnIds.join(',') + '" 的数据项？').then(() => {
    proxy.$modal.msgSuccess('退回成功')
    getList()
  })
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
