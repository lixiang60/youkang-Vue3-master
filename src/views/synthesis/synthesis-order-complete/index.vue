<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
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
        <el-button size="small" type="success" plain icon="ShoppingCart" @click="handleSalesCollection"
          >销售回款</el-button
        >
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
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测序代数" prop="generation">
              <el-input v-model="form.generation" placeholder="请输入测序代数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态" prop="orderStatus">
              <el-select v-model="form.orderStatus" placeholder="请选择订单状态" style="width: 100%">
                <el-option label="已出库" value="1" />
                <el-option label="未出库" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="SynthesisOrderComplete">
import { ref, reactive, toRefs, computed, onMounted, getCurrentInstance } from 'vue'
import { Check, Close, EditPen } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import PrintDialog from '@/components/PrintDialog/index.vue'
import DeliveryNoteContent from '../components/DeliveryNoteContent.vue'
import { listOrder, calcOrderPrice } from '@/api/sequencing/order'

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
  { prop: 'paymentStatus', label: '付款状态', minWidth: 100, visible: true },
  { prop: 'pointCalculation', label: '积分计算', minWidth: 100, visible: true }
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
    customerName: undefined
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
    customerName: undefined,
    generation: undefined,
    orderStatus: undefined,
    remark: undefined
  }
}

function handleUpdate(row) {
  reset()
  const id = row.orderId || ids.value[0]
  form.value.orderId = id
  open.value = true
  title.value = '修改订单完成'
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
function handleOrderPayment() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择一条订单')
    return
  }
  showPaymentDialog.value = true
  const orderId = ids.value[0]
  paymentLoading.value = true

  calcOrderPrice(orderId)
    .then(response => {
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
  const currentOrder = dataList.value.find(item => item.orderId === ids.value[0]) || {}
  printData.value = {
    ...currentOrder,
    deliveryTime: currentOrder.endTime || proxy.parseTime(new Date(), '{y}/{m}/{d}'),
    remark: currentOrder.orderInfo || '收扩增费',
    salesman: '陈真真-南'
  }
  showPrintDialog.value = true
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

function handleSalesCollection() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要进行回款处理的订单')
    return
  }
  proxy.$modal
    .confirm(`是否确认对订单 [${ids.value.join(',')}] 进行销售回款处理？`)
    .then(() => {
      proxy.$modal.msgWarning('API接入中...')
    })
    .catch(() => {})
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
