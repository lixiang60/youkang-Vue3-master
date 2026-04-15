<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮区 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['synthesis:fee:payment']"
          type="warning"
          plain
          size="small"
          icon="Coin"
          @click="handleOrderPayment"
          >订单款项</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['synthesis:fee:clear']"
          type="danger"
          plain
          size="small"
          icon="Delete"
          @click="handleOrderClear"
          >订单清空</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['synthesis:fee:report']"
          type="info"
          plain
          size="small"
          icon="Document"
          @click="handleReport"
          >报告单</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['synthesis:fee:delivery-detail']"
          type="info"
          plain
          size="small"
          icon="List"
          @click="handleDeliveryDetail"
          >发货明细</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['synthesis:fee:delivery-note']"
          type="info"
          plain
          size="small"
          icon="Van"
          @click="handleDeliveryNote"
          >送货单</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['synthesis:fee:sequence-info']"
          type="info"
          plain
          size="small"
          icon="Connection"
          @click="handleSequenceInfo"
          >序列信息</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      size="small"
      :loading="loading"
      :data="feeList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    >
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime) }}</span>
      </template>
    </dynamic-table>

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

    <!-- 报告单预览弹窗 -->
    <print-dialog v-model="showReportDialog" title="报告单预览" print-id="synthesisReport">
      <synthesis-report-content :data="reportData" :list="reportList" />
    </print-dialog>

    <!-- 送货单打印选项弹窗 (图1) -->
    <delivery-note-print-dialog v-model="showDeliveryNoteDialog" @print="handleDoPrint" />

    <!-- 送货单预览弹窗 (图2) -->
    <print-dialog v-model="showDeliveryNotePreview" title="送货单预览" print-id="synthesisDeliveryNote">
      <synthesis-delivery-note-content :data="deliveryNoteData" :list="deliveryNoteList" />
    </print-dialog>

    <!-- 发货明细过滤弹窗 (图1) -->
    <delivery-detail-filter-dialog v-model="showDeliveryDetailDialog" @print="handleDoPrintDetail" />

    <!-- 发货明细预览弹窗 (图2) -->
    <print-dialog v-model="showDeliveryDetailPreview" title="发货明细报表预览" print-id="deliveryDetailReport">
      <delivery-detail-report-content :data="detailData" :list="detailList" />
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

    <!-- 打印预览弹窗 -->
    <print-dialog v-model="showPrintDialog" title="送货单预览" print-id="printDeliveryNote">
      <delivery-note-content :data="printData" :list="paymentList" />
    </print-dialog>
  </div>
</template>

<script setup name="SynthesisFee">
import { listFee, calcSynthesisPrice } from '@/api/synthesis/fee'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import PrintDialog from '@/components/PrintDialog/index.vue'
import DeliveryNoteContent from '../../sequencing/components/DeliveryNoteContent.vue'
import SynthesisReportContent from '../components/SynthesisReportContent.vue'
import SynthesisDeliveryNoteContent from '../components/SynthesisDeliveryNoteContent.vue'
import DeliveryNotePrintDialog from '../components/DeliveryNotePrintDialog.vue'
import DeliveryDetailFilterDialog from '../components/DeliveryDetailFilterDialog.vue'
import DeliveryDetailReportContent from '../components/DeliveryDetailReportContent.vue'
import { parseTime } from '@/utils/ruoyi'
import {
  Coin,
  Delete,
  Document,
  List,
  Van,
  Connection,
  Search,
  Refresh,
  Plus,
  Edit,
  Printer,
  Check,
  Close
} from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const feeList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const searchRef = ref(null)

// 订单款项相关
const showPaymentDialog = ref(false)
const paymentLoading = ref(false)
const paymentList = ref([])
const paymentIds = ref([])
const paymentSingle = ref(true)
const paymentMultiple = ref(true)

// 打印发货明细相关
const showDeliveryDetailDialog = ref(false)
const showDeliveryDetailPreview = ref(false)
const detailData = ref({})
const detailList = ref([])

// 打印送货单相关
const showDeliveryNoteDialog = ref(false)
const showDeliveryNotePreview = ref(false)
const deliveryNoteData = ref({})
const deliveryNoteList = ref([])

// 打印相关
const showPrintDialog = ref(false)
const printData = ref({})

// 报告单相关
const showReportDialog = ref(false)
const reportData = ref({})
const reportList = ref([])

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
  { prop: 'orderType', label: '订单类型', width: 100, align: 'center', visible: true },
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
  { prop: 'payStatus', label: '付款状态', width: 100, align: 'center', visible: true },
  { prop: 'payTime', label: '付款时间', width: 160, align: 'center', visible: true },
  { prop: 'payBy', label: '付款人', width: 100, align: 'center', visible: true },
  { prop: 'scoreCalc', label: '积分计算', width: 100, align: 'center', visible: true },
  { prop: 'scoreTime', label: '积分时间', width: 160, align: 'center', visible: true },
  { prop: 'orderMode', label: '订单模式', width: 100, align: 'center', visible: true },
  { prop: 'companyName', label: '所属公司', width: 120, align: 'center', visible: true }
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

/** 查询收费列表 */
function getList() {
  loading.value = true
  listFee(queryParams.value)
    .then(response => {
      feeList.value = response.rows
      total.value = response.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
      if (import.meta.env.DEV) {
        feeList.value = [
          {
            orderId: '202604152251',
            customerId: '76473',
            customerName: '卢春彤',
            customerAddress: '石河子大学',
            customerLevel: '普1',
            groupName: '王远忠',
            orderType: '公司录入',
            orderDate: '2026-04-15',
            isUrgent: '否',
            remark: 'I',
            createBy: '吴晓峰',
            createTime: '2026-04-15 22:51:00',
            emailStatus: '否',
            replyBy: '',
            replyTime: '',
            orderStatus: '订单生成|手动',
            payStatus: '否',
            payTime: '',
            payBy: '',
            scoreCalc: 0,
            scoreTime: '',
            orderMode: 'OD模式',
            companyName: '某某公司'
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

/** 订单款项展示详细相关逻辑 */
function handleOrderPayment() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择一条订单')
    return
  }
  showPaymentDialog.value = true
  const orderId = ids.value[0]
  paymentLoading.value = true

  // 调用计算价格接口 渲染数据
  calcSynthesisPrice(orderId)
    .then(response => {
      paymentList.value = (response.data || []).map(item => ({
        ...item,
        id: item.sampleId
      }))
      paymentLoading.value = false
    })
    .catch(() => {
      paymentLoading.value = false
      if (import.meta.env.DEV) {
        paymentList.value = [
          {
            id: 'S001',
            sampleId: 'S001',
            orderId: orderId,
            project: '合成项目A',
            sampleType: 'DNA',
            fragmentSize: '500bp',
            plasmidLength: '-',
            quantity: 1,
            unitPrice: 50.0,
            totalPrice: 50.0,
            createTime: '2026-04-15 23:00:00'
          }
        ]
      }
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
  // 获取当前选中的订单基本信息
  const currentOrder = feeList.value.find(item => item.orderId === ids.value[0]) || {}
  printData.value = {
    ...currentOrder,
    deliveryTime: currentOrder.endTime || proxy.parseTime(new Date(), '{y}/{m}/{d}'),
    remark: currentOrder.remark || '合成费用',
    salesman: '业务员'
  }
  showPrintDialog.value = true
}

/** 订单清空按钮操作 */
function handleOrderClear() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要清空的订单')
    return
  }
  proxy.$modal.confirm('确定要清空所选订单吗？').then(() => {
    proxy.$modal.msgSuccess('清空完成')
  })
}

/** 报告单按钮操作 */
function handleReport() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择一条订单')
    return
  }
  const currentOrder = feeList.value.find(item => item.orderId === ids.value[0]) || {}
  reportData.value = {
    orderId: currentOrder.orderId,
    orderDate: currentOrder.orderDate || parseTime(new Date(), '{y}-{m}-{d}'),
    customerName: currentOrder.customerName
  }

  // 模拟列表数据，对齐图片中的列
  reportList.value = [
    {
      productionId: '1136459',
      primerName: '143CE-dCas9 F.2',
      sequence: 'ACGCATTCTGCGCCGCTCGATCGCCCAACAGAAGAGCCGAACCT GCCACC',
      baseCount: 48,
      totalOd: 2,
      odPerTube: 2,
      mw: '14918.78',
      tm: '75.11',
      gc: '62.50',
      nmolPerTube: '4.42',
      waterVolume: '44.2',
      purification: 'PAGE',
      modification: '-1'
    },
    {
      productionId: '1136460',
      primerName: '144CE-dCas9 F.2',
      sequence: 'TTCCTACCGCCGGATATCTAGGCCACCATGCCCAAGAGAAGCC GCAAGCCTCGGACC',
      baseCount: 55,
      totalOd: 2,
      odPerTube: 2,
      mw: '16965.15',
      tm: '74.66',
      gc: '58.18',
      nmolPerTube: '3.89',
      waterVolume: '38.9',
      purification: 'PAGE',
      modification: '-1'
    }
  ]

  showReportDialog.value = true
}

/** 发货明细按钮操作 */
function handleDeliveryDetail() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要查看发货明细的订单')
    return
  }
  showDeliveryDetailDialog.value = true
}

/** 执行打印发货明细报表 */
function handleDoPrintDetail(filters) {
  detailData.value = {
    printTime: parseTime(new Date(), '{y}/{m}/{d}'),
    ...filters
  }

  // 模拟发货明细数据 (对齐图 2)
  detailList.value = [
    { customerName: '伊洁', address: '北京协和医院检验科细菌室', salesman: '王飞', orderId: '20180605114249096' },
    { customerName: '郑向东', address: '清华大学医学科学楼C225', salesman: '史强', orderId: '20180605164636339' },
    { customerName: '郑向东', address: '清华大学医学科学楼C225', salesman: '史强', orderId: '20180601090210325' },
    { customerName: '郑向东', address: '清华大学医学科学楼C225', salesman: '史强', orderId: '20180603210412575' },
    { customerName: '尹亚飞', address: '清华大学医学院D108', salesman: '史强', orderId: '201806191230552890' },
    {
      customerName: '王威',
      address: '中国科学院遗传与发育生物学研究所',
      salesman: '朱旭',
      orderId: '20180613134731268'
    }
  ]

  showDeliveryDetailPreview.value = true
}

/** 送货单按钮操作 */
function handleDeliveryNote() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要打印送货单的订单')
    return
  }
  showDeliveryNoteDialog.value = true
}

/** 执行打印送货单预览 */
function handleDoPrint(options) {
  const currentOrder = feeList.value.find(item => item.orderId === ids.value[0]) || {}

  deliveryNoteData.value = {
    customerName: currentOrder.customerName,
    orderId: currentOrder.orderId,
    customerAddress: currentOrder.customerAddress || '北京市海淀区学院路1号',
    totalCount: 32,
    orderDate: currentOrder.orderDate || '2018/06/20 21:09:15',
    remark: currentOrder.remark || '无',
    sequenceRange: '1136481-1136512',
    deliveryDate: parseTime(new Date(), '{y}/{m}/{d}'),
    salesman: '刘克',
    creator: 'ADMIN',
    totalAmount: '381.6'
  }

  deliveryNoteList.value = [
    {
      sampleType: '16-59bp-PAGE_10D',
      priceUnit: 'BP',
      quantity: 636,
      unitPrice: 0.6,
      totalPrice: 381.6
    }
  ]

  showDeliveryNotePreview.value = true
}

/** 序列信息按钮操作 */
function handleSequenceInfo() {
  proxy.$modal.msgInfo('功能开发中...')
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

.well-form {
  border: 1px solid #dcdfe6;
  margin-bottom: 20px;
}
</style>
