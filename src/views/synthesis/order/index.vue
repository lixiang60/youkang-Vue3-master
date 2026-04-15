<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮区 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Plus" @click="handleAdd">添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          >编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Printer" @click="handleLabelPrint">标签打印</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Plus" @click="handleAddSynthesis">添加合成</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Document" @click="handleReport">报告单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Coin" @click="handleFeeSettlement">费用结算</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Monitor" @click="handleOrderMonitor">订单量监控</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Connection" @click="handleAllocation">调拨</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      size="small"
      :loading="loading"
      :data="orderList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    >
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime) }}</span>
      </template>
    </dynamic-table>

    <!-- 订单批量导入弹窗 (图1) -->
    <order-import-dialog v-model="showImportDialog" @submit="handleImportSubmit" />

    <!-- 订单修改弹窗 (图1) -->
    <order-edit-dialog v-model="showEditDialog" :data="editData" @confirm="handleEditConfirm" />

    <!-- 批量添加合成样品弹窗 (图2) -->
    <sample-batch-add-dialog v-model="showBatchAddDialog" @submit="handleBatchAddSubmit" />
  </div>
</template>

<script setup name="SynthesisOrder">
import { ref, reactive, onMounted, getCurrentInstance, watch } from 'vue'
import {
  Plus,
  Edit,
  Delete,
  Search,
  Refresh,
  Printer,
  Document,
  Coin,
  Monitor,
  Connection
} from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import OrderImportDialog from './components/OrderImportDialog.vue'
import OrderEditDialog from './components/OrderEditDialog.vue'
import SampleBatchAddDialog from './components/SampleBatchAddDialog.vue'
import { parseTime } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance()

const orderList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const searchRef = ref(null)

const showImportDialog = ref(false)
const showEditDialog = ref(false)
const showBatchAddDialog = ref(false)
const editData = ref({})

const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
  orderId: undefined,
  customerName: undefined
})

const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 150, fixed: true, sortable: true, visible: true },
  { prop: 'customerId', label: '客户ID', minWidth: 80, visible: true },
  { prop: 'customerName', label: '客户名', minWidth: 100, visible: true },
  { prop: 'region', label: '地区', minWidth: 80, visible: true },
  { prop: 'customerAddress', label: '客户地址', minWidth: 180, visible: true, showOverflowTooltip: true },
  { prop: 'customerLevel', label: '客户等级', minWidth: 90, visible: true },
  { prop: 'groupId', label: '课题组ID', minWidth: 90, visible: true },
  { prop: 'groupName', label: '课题组', minWidth: 100, visible: true },
  { prop: 'orderType', label: '订单类型', minWidth: 100, visible: true },
  { prop: 'geneRelationNo', label: '基因关联号', minWidth: 110, visible: true },
  { prop: 'orderDate', label: '订货日期', minWidth: 100, visible: true },
  { prop: 'isUrgent', label: '加急', minWidth: 70, visible: true },
  { prop: 'remark', label: '备注', minWidth: 150, visible: true, showOverflowTooltip: true },
  { prop: 'createBy', label: '添加人', minWidth: 90, visible: true },
  { prop: 'isTransfer', label: '转单', minWidth: 70, visible: true },
  { prop: 'createTime', label: '添加时间', minWidth: 150, visible: true },
  { prop: 'emailStatus', label: '邮件回复', minWidth: 90, visible: true },
  { prop: 'replyBy', label: '回复人', minWidth: 90, visible: true },
  { prop: 'replyTime', label: '回复时间', minWidth: 150, visible: true },
  { prop: 'orderStatus', label: '订单状态', minWidth: 110, visible: true },
  { prop: 'payStatus', label: '付款状态', minWidth: 90, visible: true },
  { prop: 'payTime', label: '付款时间', minWidth: 150, visible: true },
  { prop: 'payBy', label: '付款人', minWidth: 90, visible: true },
  { prop: 'printCount', label: '打印次数', minWidth: 90, visible: true },
  { prop: 'orderMode', label: '订单模式', minWidth: 100, visible: true },
  { prop: 'affiliatedCompany', label: '所属公司', minWidth: 100, visible: true },
  { prop: 'productionCompany', label: '生产公司', minWidth: 100, visible: true }
])

const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户名', type: 'input' },
  { prop: 'orderStatus', label: '订单状态', type: 'select', options: [] },
  { prop: 'orderDateRange', label: '订货日期', type: 'daterange' }
])

// 状态持久化
watch(
  columns,
  val => {
    localStorage.setItem('synthesis-order-columns', JSON.stringify(val))
  },
  { deep: true }
)

onMounted(() => {
  const savedColumns = localStorage.getItem('synthesis-order-columns')
  if (savedColumns) {
    columns.value = JSON.parse(savedColumns)
  }
  getList()
})

function getList() {
  loading.value = true
  // TODO: listSynthesisOrder(queryParams.value).then(...)
  setTimeout(() => {
    orderList.value = [
      {
        orderId: '202604152345',
        customerId: '39124',
        customerName: '郑家瑞',
        region: '广州',
        customerAddress: '中山大学B703',
        customerLevel: '普1',
        groupId: '9066',
        groupName: '刘俊',
        orderType: '公司录入',
        geneRelationNo: '0',
        orderDate: '2026-04-15',
        isUrgent: '否',
        remark: '',
        createBy: '杨当法',
        isTransfer: '否',
        createTime: '2026-04-15 23:45:00',
        emailStatus: '否',
        replyBy: '',
        replyTime: '',
        orderStatus: '订单生成',
        payStatus: '否',
        payTime: '',
        payBy: '',
        printCount: 0,
        orderMode: 'OD模式'
      }
    ]
    total.value = 1
    loading.value = false
  }, 500)
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function toggleSearchPanel() {
  searchRef.value.toggle()
}

function handleRefresh() {
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.orderId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  showImportDialog.value = true
}

function handleImportSubmit(formData) {
  console.log('提交订单导入数据:', formData)
  proxy.$modal.msgSuccess('订单及样品添加成功')
  showImportDialog.value = false
  getList()
}

function handleUpdate() {
  const row = orderList.value.find(item => item.orderId === ids.value[0])
  if (row) {
    editData.value = { ...row }
    showEditDialog.value = true
  }
}

function handleEditConfirm(formData) {
  console.log('更新订单数据:', formData)
  proxy.$modal.msgSuccess('修改成功')
  showEditDialog.value = false
  getList()
}

function handleDelete() {
  const orderIds = ids.value
  proxy.$modal
    .confirm('确认要删除此条记录吗？')
    .then(function () {
      // TODO: delSynthesisOrder(orderIds)
      proxy.$modal.msgSuccess('删除成功')
      getList()
    })
    .catch(() => {})
}
function handleLabelPrint() {
  proxy.$modal.msgInfo('功能开发中...')
}
function handleAddSynthesis() {
  showBatchAddDialog.value = true
}

function handleBatchAddSubmit(formData) {
  console.log('提交批量添加样品数据:', formData)
  proxy.$modal.msgSuccess('批量添加成功')
  showBatchAddDialog.value = false
  getList()
}
function handleReport() {
  proxy.$modal.msgInfo('功能开发中...')
}
function handleFeeSettlement() {
  const orderIds = ids.value
  if (!orderIds.length) {
    proxy.$modal.msgWarning('请选择需要结算的订单')
    return
  }
  proxy.$modal
    .confirm('确认要结算订单吗？')
    .then(function () {
      // TODO: settleSynthesisOrder(orderIds)
      proxy.$modal.msgSuccess('结算提交成功')
      getList()
    })
    .catch(() => {})
}
function handleOrderMonitor() {
  proxy.$modal.msgInfo('功能开发中...')
}
function handleAllocation() {
  proxy.$modal.msgInfo('功能开发中...')
}
</script>

<style scoped>
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
  padding: 4px 0 !important;
}

:deep(.el-table--small .cell) {
  padding-left: 6px !important;
  padding-right: 6px !important;
}
</style>
