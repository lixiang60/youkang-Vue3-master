<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Plus" @click="handleAdd">添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Edit" :disabled="single" @click="handleUpdate"
          >编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Coin" @click="handleOrderPayment">订单款项</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Delete" @click="handleOrderClear">订单清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="PriceTag" @click="handleInvoice">开票</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Notebook" @click="handleWeeklyReport">周报</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Management" @click="handleGroupConfirmation"
          >课题组客户确认单</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="ShoppingCart" @click="handleDeliveryNote">送货单</el-button>
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

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" width="900px" append-to-body top="8vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">{{ title }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderId">
              <el-input v-model="form.orderId" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户ID" prop="customerId">
              <el-input v-model="form.customerId" placeholder="请输入客户ID" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户地址" prop="customerAddress">
              <el-input v-model="form.customerAddress" placeholder="请输入客户地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课题组" prop="groupName">
              <el-input v-model="form.groupName" placeholder="请输入课题组" />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户等级" prop="customerLevel">
              <el-input v-model="form.customerLevel" placeholder="请输入客户等级" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试测" prop="isTest">
              <el-input v-model="form.isTest" placeholder="请输入试测状态" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="信息不全" prop="incompleteInfo">
              <el-select v-model="form.incompleteInfo" placeholder="请选择信息完整性" style="width: 100%">
                <el-option label="信息完整" value="完整" />
                <el-option label="信息缺失" value="缺失" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="订单信息" prop="orderInfo">
              <el-input v-model="form.orderInfo" placeholder="请输入数据..." />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加急" prop="isUrgent">
              <el-radio-group v-model="form.isUrgent">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="送样时间" prop="deliveryTime">
              <el-date-picker
                v-model="form.deliveryTime"
                type="datetime"
                placeholder="请选择日期时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 订单款项弹窗 -->
    <el-dialog v-model="showPaymentDialog" title="订单收费" width="1000px" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button size="small" type="success" plain icon="Plus" @click="handleAddFee">添加</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button size="small" type="primary" plain icon="Edit" :disabled="paymentSingle" @click="handleUpdateFee"
            >编辑</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button size="small" type="danger" plain icon="Delete" :disabled="paymentMultiple" @click="handleDeleteFee"
            >删除</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button size="small" type="info" plain icon="Printer" @click="handlePrintPayment">打印</el-button>
        </el-col>
      </el-row>

      <el-table
        v-loading="paymentLoading"
        :data="paymentList"
        border
        size="small"
        @selection-change="handlePaymentSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="样品编号" align="center" prop="sampleId" width="120" />
        <el-table-column label="订单号" align="center" prop="orderId" width="150" />
        <el-table-column label="测序项目" align="center" prop="project" min-width="120" show-overflow-tooltip />
        <el-table-column label="样品类型" align="center" prop="sampleType" width="100" />
        <el-table-column label="片段大小" align="center" prop="fragmentSize" width="90" />
        <el-table-column label="质粒长度" align="center" prop="plasmidLength" width="90" />
        <el-table-column label="数量" align="center" prop="quantity" width="70" />
        <el-table-column label="单价" align="center" prop="unitPrice" width="90" />
        <el-table-column label="合计费用" align="center" prop="totalPrice" width="100" />
        <el-table-column label="添加时间" align="center" prop="createTime" width="150" />
      </el-table>

      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="showPaymentDialog = false">确定</el-button>
          <el-button type="danger" :icon="Close" @click="showPaymentDialog = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 打印预览弹窗 -->
    <print-dialog v-model="showPrintDialog" title="送货单预览" print-id="printDeliveryNote">
      <delivery-note-content :data="printData" :list="paymentList" />
    </print-dialog>

    <!-- 周报报表预览弹窗 -->
    <weekly-report-dialog v-model="showWeeklyReportDialog" />

    <!-- 课题组客户确认单弹窗 -->
    <group-confirmation-dialog v-model="showGroupConfirmDialog" />

    <!-- 批量打印送货单弹窗 -->
    <batch-delivery-note-dialog v-model="showBatchDeliveryDialog" />

    <!-- 手工添加费用弹窗 -->
    <el-dialog v-model="showAddFeeDialog" :title="feeTitle" width="700px" append-to-body>
      <div class="well-form">
        <el-form :model="feeForm" label-width="0px">
          <div class="form-row">
            <div class="form-label">订单号：</div>
            <div class="form-content">
              <el-input v-model="feeForm.orderId" disabled />
            </div>
            <div class="form-label">名称：</div>
            <div class="form-content">
              <el-input v-model="feeForm.project" placeholder="请输入名称" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">单位：</div>
            <div class="form-content">
              <el-input v-model="feeForm.quantityType" placeholder="请输入单位" />
            </div>
            <div class="form-label">数量：</div>
            <div class="form-content">
              <el-input-number
                v-model="feeForm.quantity"
                :precision="0"
                controls-position="right"
                style="width: 100%"
                @change="calcFee"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">单价：</div>
            <div class="form-content">
              <el-input-number
                v-model="feeForm.unitPrice"
                :precision="2"
                controls-position="right"
                style="width: 100%"
                @change="calcFee"
              />
            </div>
            <div class="form-label">费用：</div>
            <div class="form-content">
              <el-input-number
                v-model="feeForm.totalPrice"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitFeeForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="showAddFeeDialog = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SynthesisOrderOut">
import { ref, reactive, toRefs, onMounted, computed, getCurrentInstance } from 'vue'
import { Check, Close, EditPen } from '@element-plus/icons-vue'
import { listOrder, calcOrderPrice } from '@/api/sequencing/order'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import PrintDialog from '@/components/PrintDialog/index.vue'
import DeliveryNoteContent from '../components/DeliveryNoteContent.vue'
import WeeklyReportDialog from '../components/WeeklyReportDialog.vue'
import GroupConfirmationDialog from '../components/GroupConfirmationDialog.vue'
import BatchDeliveryNoteDialog from '../components/BatchDeliveryNoteDialog.vue'

const { proxy } = getCurrentInstance()

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 150, fixed: true, sortable: true, visible: true },
  { prop: 'customerId', label: '客户ID', minWidth: 80, visible: true },
  { prop: 'customerName', label: '客户姓名', minWidth: 120, fixed: true, showOverflowTooltip: true, visible: true },
  { prop: 'customerAddress', label: '客户地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { prop: 'generation', label: '测序代数', minWidth: 90, visible: true },
  { prop: 'groupId', label: '课题组ID', minWidth: 80, visible: true },
  { prop: 'groupName', label: '课题组', minWidth: 140, showOverflowTooltip: true, visible: true },
  { prop: 'orderType', label: '订单类型', minWidth: 110, visible: true },
  { prop: 'endTime', label: '结束时间', minWidth: 180, visible: true },
  { prop: 'orderInfo', label: '订单信息', minWidth: 150, visible: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true },
  { prop: 'orderStatus', label: '订单状态', minWidth: 100, visible: true },
  { prop: 'createBy', label: '添加人', minWidth: 100, visible: true }
])

const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'createBy', label: '添加人', type: 'input' },
  {
    prop: 'orderStatus',
    label: '订单状态',
    type: 'select',
    options: [
      { label: '订单生成', value: '订单生成' },
      { label: '订单出库', value: '订单出库' },
      { label: '订单完成', value: '订单完成' }
    ]
  }
])

const dataList = ref([])
const total = ref(0)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const open = ref(false)
const formRef = ref(null)
const searchRef = ref(null)

// 订单款项相关
const showPaymentDialog = ref(false)
const paymentLoading = ref(false)
const paymentList = ref([])
const paymentIds = ref([])
const paymentSingle = ref(true)
const paymentMultiple = ref(true)

// 打印相关
const showPrintDialog = ref(false)
const showWeeklyReportDialog = ref(false)
const showGroupConfirmDialog = ref(false)
const showBatchDeliveryDialog = ref(false)
const printData = ref({})

// 添加费用相关
const showAddFeeDialog = ref(false)
const feeTitle = ref('')
const feeForm = ref({
  orderId: '',
  project: '',
  quantityType: '个',
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0
})

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    customerName: undefined,
    createBy: undefined,
    orderStatus: undefined
  },
  rules: {
    orderId: [{ required: true, message: '订单号不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

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
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 基础 CRUD 手柄 */
function reset() {
  form.value = {
    orderId: undefined,
    customerId: undefined,
    customerName: undefined,
    customerAddress: undefined,
    groupName: undefined,
    customerLevel: undefined,
    isTest: undefined,
    incompleteInfo: undefined,
    orderInfo: undefined,
    isUrgent: '0',
    deliveryTime: undefined,
    remark: undefined
  }
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '添加订单出库'
}

function handleUpdate(row) {
  reset()
  const id = row.orderId || ids.value[0]
  // 这里可以调用接口获取详情
  form.value.orderId = id
  open.value = true
  title.value = '修改订单出库'
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    }
  })
}

function cancel() {
  open.value = false
  reset()
}

/** 业务扩展手柄 */
function handleInvoice() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要开票的订单')
    return
  }
  proxy.$modal
    .confirm('确认付款打印发票吗？')
    .then(() => {
      proxy.$modal.msgSuccess('开票完成')
    })
    .catch(() => {})
}

function handleOrderClear() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要清空的订单')
    return
  }
  proxy.$modal
    .confirm('确定要清空所选订单吗？')
    .then(() => {
      proxy.$modal.msgSuccess('清空完成')
    })
    .catch(() => {})
}

function handleWeeklyReport() {
  showWeeklyReportDialog.value = true
}

function handleGroupConfirmation() {
  showGroupConfirmDialog.value = true
}

function handleDeliveryNote() {
  showBatchDeliveryDialog.value = true
}

/** 订单款项 (收费) 相关逻辑 */
function handleOrderPayment() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择一条订单')
    return
  }
  showPaymentDialog.value = true
  const orderId = ids.value[0]
  paymentLoading.value = true

  // 恢复为：弹窗打开时直接调用 9.1 计算价格接口 渲染数据
  calcOrderPrice(orderId)
    .then(response => {
      // 必须映射 id 字段，否则多选框和编辑逻辑无法正确定位行数据
      paymentList.value = (response.data || []).map(item => ({
        ...item,
        id: item.sampleId
      }))
      paymentLoading.value = false
    })
    .catch(() => {
      paymentLoading.value = false
    })
}

function handlePaymentSelectionChange(selection) {
  paymentIds.value = selection.map(item => item.id)
  paymentSingle.value = selection.length !== 1
  paymentMultiple.value = !selection.length
}

function handleAddFee() {
  feeTitle.value = '手工添加费用'
  feeForm.value = {
    orderId: ids.value[0],
    project: '',
    quantityType: '个',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0
  }
  showAddFeeDialog.value = true
}

function handleUpdateFee() {
  const selectRow = paymentList.value.find(item => item.id === paymentIds.value[0])
  if (selectRow) {
    feeTitle.value = '修改费用'
    // 恢复为：直接使用编辑时传入的 row 数据
    feeForm.value = { ...selectRow }
    showAddFeeDialog.value = true
  }
}

function handleDeleteFee() {
  proxy.$modal.confirm('确定要删除选中的费用吗？').then(() => {
    proxy.$modal.msgSuccess('删除成功')
  })
}

function submitFeeForm() {
  proxy.$modal.msgSuccess('提交成功')
  showAddFeeDialog.value = false
}

function calcFee() {
  feeForm.value.totalPrice = (feeForm.value.quantity || 0) * (feeForm.value.unitPrice || 0)
}

function handlePrintPayment() {
  if (paymentList.value.length === 0) {
    proxy.$modal.msgWarning('没有可打印的款项信息')
    return
  }
  // 获取当前选中的订单基本信息
  const currentOrder = dataList.value.find(item => item.orderId === ids.value[0]) || {}
  printData.value = {
    ...currentOrder,
    deliveryTime: currentOrder.endTime || proxy.parseTime(new Date(), '{y}/{m}/{d}'),
    remark: currentOrder.orderInfo || '收扩增费',
    salesman: '陈真真-南'
  }
  showPrintDialog.value = true
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
