<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['synthesis:audit:audit']"
          type="warning"
          plain
          size="small"
          icon="CircleCheck"
          :disabled="multiple"
          @click="handleAudit"
          >审核</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      size="small"
      :loading="loading"
      :data="auditList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    >
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime) }}</span>
      </template>
    </dynamic-table>

    <!-- 审核对话框 -->
    <audit-dialog v-model="openAudit" :order-data="currentOrder" @success="handleQuery" />
  </div>
</template>

<script setup name="SynthesisAudit">
import { listAudit } from '@/api/synthesis/audit'
import AuditDialog from './components/AuditDialog.vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import { parseTime } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance()

const auditList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const openAudit = ref(false)
const currentOrder = ref({})
const searchRef = ref(null)

const columns = ref([
  { type: 'selection', width: 50, align: 'center', visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 150, align: 'center', visible: true },
  { prop: 'customerId', label: '客户ID', width: 80, align: 'center', visible: true },
  { prop: 'customerName', label: '客户名', width: 100, align: 'center', visible: true },
  {
    prop: 'customerAddress',
    label: '客户地址',
    minWidth: 200,
    align: 'center',
    showOverflowTooltip: true,
    visible: true
  },
  { prop: 'customerLevel', label: '客户等级', width: 80, align: 'center', visible: true },
  { prop: 'groupName', label: '课题组', width: 100, align: 'center', visible: true },
  { prop: 'orderDate', label: '订货日期', width: 100, align: 'center', visible: true },
  { prop: 'isUrgent', label: '加急', width: 60, align: 'center', visible: true },
  {
    prop: 'remark',
    label: '备注',
    minWidth: 150,
    align: 'center',
    showOverflowTooltip: true,
    visible: true
  },
  { prop: 'createBy', label: '添加人', width: 100, align: 'center', visible: true },
  { prop: 'createTime', label: '添加时间', width: 160, align: 'center', slot: 'createTime', visible: true },
  { prop: 'emailStatus', label: '邮件回复', width: 80, align: 'center', visible: true },
  { prop: 'replyBy', label: '回复人', width: 100, align: 'center', visible: true },
  { prop: 'replyTime', label: '回复时间', width: 160, align: 'center', visible: true },
  { prop: 'orderStatus', label: '订单状态', width: 100, align: 'center', visible: true },
  { prop: 'auditStatus', label: '审核状态', width: 100, align: 'center', visible: true },
  { prop: 'payStatus', label: '付款状态', width: 100, align: 'center', visible: true },
  { prop: 'payTime', label: '付款时间', width: 160, align: 'center', visible: true },
  { prop: 'payBy', label: '付款人', width: 100, align: 'center', visible: true },
  { prop: 'printCount', label: '打印次数', width: 80, align: 'center', visible: true },
  { prop: 'orderMode', label: '订单模式', width: 100, align: 'center', visible: true },
  { prop: 'geneOrderId', label: '基因关联订单', width: 120, align: 'center', visible: true }
])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    customerName: undefined
  }
})

const { queryParams } = toRefs(data)

const searchFields = computed(() => [
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户名', type: 'input' }
])

/** 查询审核列表 */
function getList() {
  loading.value = true
  listAudit(queryParams.value)
    .then(response => {
      auditList.value = response.rows
      total.value = response.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
      if (import.meta.env.DEV) {
        auditList.value = [
          {
            orderId: '202409232307',
            customerId: '35478',
            customerName: '陈建',
            customerAddress: '华南农业大学',
            customerLevel: '普1',
            groupName: '姜大刚',
            orderDate: '2024-09-23',
            isUrgent: '否',
            remark: '',
            createBy: '陈建',
            createTime: '2024-09-23 23:36:32',
            emailStatus: '否',
            replyBy: '',
            replyTime: '',
            orderStatus: '订单生成',
            auditStatus: '提交待审核',
            payStatus: '否',
            payTime: '',
            payBy: '',
            printCount: 0,
            orderMode: 'OD模式'
          }
        ]
        total.value = 1
      }
    })
}

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.orderId)
  multiple.value = !selection.length
}

/** 审核按钮操作 */
function handleAudit() {
  if (ids.value.length === 0) return
  const row = auditList.value.find(item => item.orderId === ids.value[0])
  if (row) {
    currentOrder.value = { ...row }
    openAudit.value = true
  }
}

onMounted(() => {
  getList()
})
</script>

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
