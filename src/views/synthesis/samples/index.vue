<template>
  <div class="app-container">
    <!-- 1. 查询面板 (标准配置驱动) -->
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 2. 操作按钮区 (size="small" 强压) -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain :icon="Edit" :disabled="single" @click="handleUpdate"
          >编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain :icon="Delete" :disabled="multiple" @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain :icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
      </el-col>
      <el-divider direction="vertical" />
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain :icon="Brush" @click="handleClearAction('孔号')"
          >清除孔号</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain :icon="Printer" @click="handleLabelPrint">标签打印</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain :icon="Notebook" @click="handleWeeklyReport">周报</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList" />
    </el-row>

    <!-- 3. 数据表格区 (High-Density) -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      v-loading="loading"
      size="small"
      border
      :data="dataList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    />

    <!-- 4. 修改对话框 (已应用舒适呼吸感排版) -->
    <el-dialog v-model="visible" width="900px" append-to-body top="6vh" :close-on-click-modal="false">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">修改合成样品信息</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产编号">
              <el-input v-model="form.produceId" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单号">
              <el-input v-model="form.orderId" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户ID">
              <el-input v-model="form.customerId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户姓名">
              <el-input v-model="form.customerName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加急">
              <el-input v-model="form.isUrgent" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户等级">
              <el-input v-model="form.customerLevel" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="管数">
              <el-input v-model="form.tubeCount" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="引物名称">
              <el-input v-model="form.primerName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="序列(5'-3')">
              <el-input v-model="form.sequence" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="碱基数">
              <el-input v-model="form.baseCount" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="U基数">
              <el-input v-model="form.uBase" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="i基数">
              <el-input v-model="form.iBase" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="OD总量">
              <el-input v-model="form.odTotal" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="OD/管">
              <el-input v-model="form.odPerTube" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="MV">
              <el-input v-model="form.mv" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="nmol">
              <el-input v-model="form.nmol" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="nmol/管">
              <el-input v-model="form.nmolPerTube" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体积">
              <el-input v-model="form.volume" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加水量">
              <el-input v-model="form.waterAmount" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="修饰">
              <el-input v-model="form.modification" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基因名称">
              <el-input v-model="form.geneSample" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纯化方式">
              <el-input v-model="form.purification" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排版方式">
              <el-input v-model="form.layoutMethod" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="板号">
              <el-input v-model="form.plateNo" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="孔号">
              <el-input v-model="form.wellNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="孔号2">
              <el-input v-model="form.wellNo2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="返还状态">
              <el-input v-model="form.returnStatus" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="返还原因">
              <el-input v-model="form.returnReason" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-input v-model="form.status" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样品模式">
              <el-input v-model="form.sampleMode" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="open = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 5. 合成周报报表预览弹窗 -->
    <weekly-report-dialog v-model="showWeeklyReportDialog" />

    <!-- 6. 标签打印配置及预览弹窗 -->
    <label-print-config-dialog v-model="showLabelPrintDialog" />
  </div>
</template>

<script setup name="SynthesisSamplesList">
import { ref, reactive, toRefs, onMounted, getCurrentInstance, computed } from 'vue'
import {
  Edit,
  Delete,
  Search,
  Refresh,
  Download,
  Brush,
  Printer,
  Check,
  Close,
  EditPen,
  Notebook
} from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import WeeklyReportDialog from './components/WeeklyReportDialog.vue'
import LabelPrintConfigDialog from './components/LabelPrintConfigDialog.vue'

// --- 1. Constants & Config ---
const { proxy } = getCurrentInstance()

const columns = ref([
  { type: 'selection', width: 40, fixed: true, visible: true },
  { prop: 'produceId', label: '生产编号', minWidth: 100, fixed: true, visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 120, fixed: true, visible: true },
  { prop: 'customerName', label: '客户姓名', minWidth: 100, visible: true },
  { prop: 'primerName', label: '引物名称', minWidth: 120, visible: true },
  { prop: 'sequence', label: "序列(5'-3')", minWidth: 200, showOverflowTooltip: true, visible: true },
  { prop: 'baseCount', label: '碱基数', minWidth: 70, visible: true },
  { prop: 'odTotal', label: 'OD总量', minWidth: 80, visible: true },
  { prop: 'purification', label: '纯化方式', minWidth: 100, visible: true },
  { prop: 'status', label: '状态', minWidth: 100, visible: true }
])

const searchFields = ref([
  { prop: 'produceId', label: '生产编号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' }
])

// --- 2. State (响应式状态集中定义) ---
const data = reactive({
  loading: true,
  total: 0,
  dataList: [],
  queryParams: { pageNum: 1, pageSize: 20 },
  ids: [],
  single: true,
  multiple: true,
  showSearch: false,
  open: false,
  showWeeklyReportDialog: false,
  showLabelPrintDialog: false,
  form: {}
})

const {
  loading,
  total,
  dataList,
  queryParams,
  ids,
  single,
  multiple,
  showSearch,
  open,
  showWeeklyReportDialog,
  showLabelPrintDialog,
  form
} = toRefs(data)

// --- 3. Computed (派生状态) ---
const visible = computed({
  get: () => open.value,
  set: val => (open.value = val)
})

// --- 4. Methods (生命周期之前的方法分组) ---

/** 查询逻辑 */
function getList() {
  loading.value = true
  setTimeout(() => {
    dataList.value = [
      {
        produceId: '1136660',
        orderId: '20180620215631602',
        customerId: '13432',
        customerName: '常晨',
        isUrgent: '否',
        customerLevel: '普通客户',
        tubeCount: '2',
        primerName: 'ku80upHpfAA-2F',
        sequence: 'AAGGAGTTCGTTGATCGA',
        baseCount: '45',
        uBase: '0',
        iBase: '0',
        odTotal: '2',
        odPerTube: '1',
        mv: '13963.17',
        nmol: '4.72',
        nmolPerTube: '2.36',
        volume: '-1',
        waterAmount: '23.6',
        modification: '-1',
        geneSample: '',
        purification: 'OPC',
        layoutMethod: '',
        plateNo: '-1',
        wellNo: '0',
        wellNo2: '0',
        returnStatus: '-1',
        returnReason: '',
        status: '-1',
        sampleMode: 'OD模式'
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
function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('数据已刷新')
}
function toggleSearchPanel() {
  proxy.$refs.searchRef?.toggleCollapse()
}

/** 基础 CRUD 操作 */
function handleSelectionChange(val) {
  ids.value = val.map(item => item.produceId)
  single.value = val.length !== 1
  multiple.value = !val.length
  if (val.length === 1) {
    form.value = { ...val[0] }
  }
}

function handleUpdate() {
  if (ids.value.length === 0) return
  open.value = true
}

function submitForm() {
  proxy.$modal.msgWarning('API接入中...')
  open.value = false
  getList()
}

function handleDelete() {
  if (ids.value.length === 0) return
  proxy.$modal
    .confirm('确认要删除此条记录吗？')
    .then(() => {
      proxy.$modal.msgSuccess('删除成功')
      getList()
    })
    .catch(() => {})
}

/** 辅助工具函数 */
function handleExport() {
  proxy.$modal.msgInfo('导出中...')
}
function handleWeeklyReport() {
  showWeeklyReportDialog.value = true
}
function handleLabelPrint() {
  showLabelPrintDialog.value = true
}

// --- 5. Lifecycle Hooks ---
onMounted(() => {
  getList()
})
</script>

<style scoped>
/* 1. 强力压缩表头高度并控小字体 (遵循 table-style.md) */
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
  padding: 4px 0 !important;
}

/* 2. 压缩行内列间距保持高密度 */
:deep(.el-table--small .cell) {
  padding-left: 4px !important;
  padding-right: 4px !important;
}

.mb8 {
  margin-bottom: 8px;
}

/* 原有的 well-form 紧凑样式已移除，使用原生 el-form 呼吸感布局 */
</style>
