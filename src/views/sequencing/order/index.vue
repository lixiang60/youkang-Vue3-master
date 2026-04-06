<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />
    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:order:add']"
          size="small"
          type="success"
          plain
          icon="Plus"
          @click="handleAdd"
          >添加</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:order:edit']"
          size="small"
          type="primary"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          >编辑</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Document" @click="handleSequencingOrder">测序订单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="DocumentCopy" @click="handleSequencingSample">测序样品</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Files" @click="handleBatchAdd">批量添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Printer" @click="handleLabelPrint">标签打印</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:order:remove']"
          size="small"
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Operation" @click="handleInternalOperation"
          >内部操作表</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="DataBoard" @click="handleDailyReport">业务员日报表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Monitor" @click="handleOrderMonitor">订单量监控</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Switch" @click="handleTransfer">调拨</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="List" @click="handleGeneSequencingOrder"
          >基因测序单</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="CollectionTag" @click="handleTemplateLabel"
          >模板标签</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button size="small" plain icon="RefreshRight" @click="handleSyncYoukang">同步康为</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :header-cell-style="{ fontSize: '12px' }"
      size="small"
      :loading="loading"
      :data="dataList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @select="handleSelect"
    >
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime) }}</span>
      </template>
    </dynamic-table>

    <!-- 添加对话框 -->
    <order-dialog
      v-model="open"
      :title="title"
      :order-row="currentOrderRow"
      :customer-options="customerOptions"
      @success="getList"
    />

    <!-- 修改对话框 -->
    <edit-order-dialog
      v-model="openEdit"
      :order-row="currentOrderRow"
      :customer-options="customerOptions"
      @success="getList"
    />

    <batch-add-order-dialog v-model="batchAddVisible" :customer-options="customerOptions" @success="getList" />

    <add-sequencing-sample-dialog
      v-model="sampleDialogVisible"
      :order-id="currentOrderId"
      :order-row="currentOrderRow"
      @success="getList"
    />

    <batch-add-sample-dialog
      v-model="batchSampleVisible"
      :order-id="currentOrderId"
      :order-no="currentOrderNo"
      @success="getList"
    />

    <label-print-dialog v-model="labelPrintVisible" :order-range="currentOrderRange" />
    <order-monitor-dialog v-model="orderMonitorVisible" />
    <internal-operation-dialog v-model="internalOpVisible" :order-id="currentOrderId" />
  </div>
</template>

<script setup name="Order">
import { ref, reactive, toRefs, computed, watch, onMounted, onActivated, getCurrentInstance } from 'vue'
import { listOrder, delOrder } from '@/api/sequencing/order'
import { listCustomerOption } from '@/api/common'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

import BatchAddOrderDialog from './components/BatchAddOrderDialog.vue'
import AddSequencingSampleDialog from './components/AddSequencingSampleDialog.vue'
import BatchAddSampleDialog from './components/BatchAddSampleDialog.vue'
import LabelPrintDialog from './components/LabelPrintDialog.vue'
import OrderDialog from './components/OrderDialog.vue'
import EditOrderDialog from './components/EditOrderDialog.vue'
import OrderMonitorDialog from './components/OrderMonitorDialog.vue'
import InternalOperationDialog from './components/InternalOperationDialog.vue'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { parseTime } from '../../../utils/ruoyi.js'

// --- 1. Constants & Config ---
const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_yes_no } = proxy.useDict('sys_normal_disable', 'sys_yes_no')
const cacheKey = 'sequencing_order_columns_visible'

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'orderId', label: '订单编号', minWidth: 150, fixed: true, sortable: true, visible: true },
  { prop: 'customerId', label: '客户ID', minWidth: 80, visible: true },
  { prop: 'customerName', label: '客户姓名', minWidth: 120, fixed: true, showOverflowTooltip: true, visible: true },
  { prop: 'customerAddress', label: '客户地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { prop: 'groupId', label: '课题组ID', minWidth: 80, visible: true },
  { prop: 'groupName', label: '课题组', minWidth: 140, showOverflowTooltip: true, visible: true },
  { prop: 'genNo', label: '基因编号', minWidth: 110, visible: true },
  { prop: 'generation', label: '代数', minWidth: 70, visible: true },
  { prop: 'orderType', label: '订单类型', minWidth: 110, visible: true },
  { prop: 'isAsync', label: '是否同步', minWidth: 90, visible: true },
  { prop: 'belongCompany', label: '所属公司', minWidth: 150, showOverflowTooltip: true, visible: true },
  { prop: 'produceCompany', label: '生产公司', minWidth: 150, showOverflowTooltip: true, visible: true },
  { prop: 'createBy', label: '创建人', minWidth: 100, visible: true },
  { prop: 'createTime', label: '创建时间', minWidth: 180, slot: 'createTime', visible: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true }
])

const editorOptions = ref({
  theme: 'snow',
  bounds: document.body,
  debug: 'warn',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  },
  placeholder: '请输入内容',
  readOnly: false
})

// --- 2. State & Forms ---
const searchRef = ref(null)
const dataList = ref([])
const customerOptions = ref([])
const total = ref(0)
const loading = ref(true)
const showSearch = ref(true)

// 弹窗状态
const open = ref(false)
const openEdit = ref(false)
const batchAddVisible = ref(false)
const sampleDialogVisible = ref(false)
const batchSampleVisible = ref(false)
const labelPrintVisible = ref(false)
const orderMonitorVisible = ref(false)
const internalOpVisible = ref(false)

// 当前操作状态
const currentOrderId = ref(null)
const currentOrderNo = ref('')
const currentOrderRow = ref({})
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    genNo: undefined,
    createBy: undefined,
    customerId: undefined
  }
})

const { queryParams } = toRefs(data)

// 初始化列显隐缓存
const savedColumns = localStorage.getItem(cacheKey)
if (savedColumns) {
  try {
    const cache = JSON.parse(savedColumns)
    columns.value.forEach(col => {
      const key = col.key || col.prop || col.type
      if (key && cache[key] !== undefined) col.visible = cache[key]
    })
  } catch (e) {}
}

// --- 3. Computed ---
const searchFields = computed(() => [
  { prop: 'orderId', label: '订单编号', type: 'input' },
  {
    prop: 'customerId',
    label: '客户姓名',
    type: 'select',
    options: customerOptions.value.map(c => ({
      label: c.customerName || c.name,
      value: c.id || c.customerId
    }))
  }
])

const currentOrderRange = computed(() => {
  if (ids.value.length === 0) return { start: '', end: '' }
  const sorted = [...ids.value].sort()
  return {
    start: String(sorted[0]),
    end: String(sorted[sorted.length - 1])
  }
})

// --- 4. Methods ---

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

/** 搜索 & 操作 */
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

function handleSelect(selection, row) {
  ids.value = selection.map(item => item.id || item.orderId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
  if (selection.find(r => r.orderId === row.orderId)) {
    currentOrderRow.value = row
  } else {
    if (currentOrderRow.value.orderId === row.orderId) {
      currentOrderRow.value = selection.length > 0 ? selection[selection.length - 1] : {}
    }
  }
}

/** 基础 CRUD */
function handleAdd() {
  currentOrderRow.value = {}
  open.value = true
  title.value = '添加订单'
}

function handleUpdate(row) {
  const listRow = row.orderId ? row : currentOrderRow.value
  if (listRow && listRow.orderId) {
    currentOrderRow.value = { ...listRow }
    openEdit.value = true
  } else {
    proxy.$modal.msgWarning('获取订单数据失败')
  }
}

function handleDelete(row) {
  const idList = row.orderId || ids.value.join(',')
  proxy.$modal
    .confirm('是否确认删除编号为"' + idList + '"的数据项？')
    .then(() => {
      return delOrder(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 业务操作 - 订单处理 */
function handleSequencingOrder() {
  batchAddVisible.value = true
}

function handleSequencingSample() {
  if (ids.value.length !== 1) {
    proxy.$modal.msgWarning('请选择一条订单数据')
    return
  }
  currentOrderId.value = ids.value[0]
  currentOrderRow.value = currentOrderRow.value || {}
  sampleDialogVisible.value = true
}

function handleBatchAdd() {
  if (ids.value.length !== 1) {
    proxy.$modal.msgWarning('请选择一条订单数据')
    return
  }
  const row = dataList.value.find(r => r.orderId === ids.value[0])
  currentOrderId.value = ids.value[0]
  currentOrderNo.value = row ? row.orderId : ''
  batchSampleVisible.value = true
}

function handleLabelPrint() {
  labelPrintVisible.value = true
}

/** 辅助方法 - 模板解析 */
function handlePasteAnalyze(content) {
  autoParseTemplate(content)
}

function autoParseTemplate(rawContent) {
  const contentToParse = rawContent || form.value.templateContent
  if (!contentToParse) return
  try {
    const div = document.createElement('div')
    div.innerHTML = contentToParse
    const table = div.querySelector('table')
    const getCellText = cell => (cell.innerText || cell.textContent || '').trim()
    let data = []
    const defaultKeys = [
      'sampleId',
      'primer',
      'primerConcentration',
      'primerType',
      'sampleType',
      'antibioticType',
      'carrierName',
      'fragmentSize',
      'testResult',
      'returnState',
      'returnType',
      'remark'
    ]
    const headerMap = {
      样品编号: 'sampleId',
      测序引物: 'primer',
      引物名称: 'primer',
      引物浓度: 'primerConcentration',
      引物类型: 'primerType',
      样品类型: 'sampleType',
      抗生素类: 'antibioticType',
      抗性: 'antibioticType',
      载体名称: 'carrierName',
      片段大小: 'fragmentSize',
      是否测通: 'testResult',
      测序结果: 'testResult',
      是否返还: 'returnState',
      退回状态: 'returnState',
      返还类型: 'returnType',
      样品备注: 'remark',
      备注: 'remark'
    }

    if (table) {
      const rows = table.rows
      if (rows.length < 1) return
      const firstRowTexts = Array.from(rows[0].cells).map(cell => getCellText(cell))
      let validKeys = firstRowTexts.map(h => headerMap[h] || h)
      let startRow = 1
      if (validKeys.filter(k => Object.values(headerMap).includes(k)).length === 0) {
        validKeys = defaultKeys
        startRow = 0
      }
      for (let i = startRow; i < rows.length; i++) {
        const cells = rows[i].cells
        const item = {}
        validKeys.forEach((key, idx) => {
          if (idx < cells.length) item[key] = getCellText(cells[idx])
        })
        if (Object.values(item).some(v => v)) data.push(item)
      }
    }
    if (data.length > 0) form.value.sampleInfoList = data
  } catch (error) {
    console.warn('Auto parse failed:', error)
  }
}

/** 占位操作 */
function handleInternalOperation() {
  if (ids.value.length !== 1) {
    proxy.$modal.msgWarning('请选择一条订单数据')
    return
  }
  currentOrderId.value = String(ids.value[0])
  internalOpVisible.value = true
}
function handleDailyReport() {
  proxy.$modal.msg('功能开发中...')
}
function handleOrderMonitor() {
  orderMonitorVisible.value = true
}
function handleTransfer() {
  proxy.$modal.msg('功能开发中...')
}
function handleGeneSequencingOrder() {
  proxy.$modal.msg('功能开发中...')
}
function handleTemplateLabel() {
  proxy.$modal.msg('功能开发中...')
}

// --- 5. Lifecycle Hooks ---
let isInitialActivated = true
onMounted(() => {
  getList()
  listCustomerOption().then(response => {
    customerOptions.value = response.data.records
  })
})

onActivated(() => {
  if (!isInitialActivated) {
    getList()
  }
  isInitialActivated = false
})

// --- 6. Watchers ---
watch(
  columns,
  newVal => {
    const cache = {}
    newVal.forEach(col => {
      const key = col.key || col.prop || col.type
      if (key) cache[key] = col.visible
    })
    localStorage.setItem(cacheKey, JSON.stringify(cache))
  },
  { deep: true }
)
</script>

<style>
.editor-global-fix .ql-editor {
  white-space: pre-wrap !important;
  line-height: normal !important;
}

.editor-global-fix .ql-container {
  white-space: pre-wrap !important;
}

:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
}
</style>

<style scoped>
/* Fix for preserving whitespace in Excel paste */
.editor-style-fix ::v-deep .ql-editor {
  white-space: pre-wrap !important;
  line-height: normal !important;
}

.editor-style-fix ::v-deep .ql-container {
  white-space: pre-wrap !important;
}

:deep(.ql-toolbar.ql-snow + .ql-container.ql-snow) {
  border-top: 1px solid #cdd0d6 !important;
}

:deep(.ql-editor table) {
  border-collapse: collapse;
  width: 100%;
}

:deep(.ql-editor table td),
:deep(.ql-editor table th) {
  border: 1px solid #dcdfe6;
  padding: 5px;
}
</style>
