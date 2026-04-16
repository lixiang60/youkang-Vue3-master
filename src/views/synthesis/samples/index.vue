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
        <el-button size="small" type="primary" plain :icon="Printer" @click="handleAction('标签打印')"
          >标签打印</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain :icon="DataLine" @click="handleAction('周报')">周报</el-button>
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

    <!-- 4. 修改对话框 (符合 component-rules.md 规范) -->
    <el-dialog v-model="visible" title="修改" width="1000px" append-to-body :close-on-click-modal="false">
      <div class="well-form">
        <el-form ref="formRef" :model="form" label-width="0">
          <!-- 栅格化表单结构 (参考 OrderEditDialog) -->
          <el-row class="form-row">
            <el-col :span="3" class="label">生产编号：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.produceId" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">订单号：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.orderId" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">客户ID：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.customerId" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">客户姓名：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.customerName" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">加急：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.isUrgent" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">客户等级：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.customerLevel" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">管数：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.tubeCount" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">引物名称：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.primerName" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">序列(5'-3')：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.sequence" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">碱基数：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.baseCount" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">U基数：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.uBase" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">i基数：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.iBase" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">OD总量：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.odTotal" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">OD/管：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.odPerTube" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">MV：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.mv" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">nmol：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.nmol" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">nmol/管：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.nmolPerTube" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">体积：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.volume" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">加水量：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.waterAmount" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">修饰：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.modification" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">基因名称：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.geneSample" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">纯化方式：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.purification" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">排版方式：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.layoutMethod" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">板号：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.plateNo" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">孔号：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.wellNo" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">孔号2：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.wellNo2" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row">
            <el-col :span="3" class="label">返还状态：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.returnStatus" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">返还原因：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.returnReason" size="small" />
            </el-col>
          </el-row>
          <el-row class="form-row no-border">
            <el-col :span="3" class="label">状态：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.status" size="small" />
            </el-col>
            <el-col :span="3" class="label border-left">样品模式：</el-col>
            <el-col :span="9" class="content">
              <el-input v-model="form.sampleMode" size="small" />
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" size="small" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" size="small" @click="open = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
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
  DataLine,
  Check,
  Close
} from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

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
  form: {}
})

const { loading, total, dataList, queryParams, ids, single, multiple, showSearch, open, form } = toRefs(data)

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
function handleAction(msg) {
  proxy.$modal.msgInfo(`${msg}功能开发中...`)
}
function handleClearAction(msg) {
  proxy.$modal.msgInfo(`清除${msg}功能开发中...`)
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

/* 3. Well-Form 标准样式同步 */
.well-form {
  border: 1px solid #dcdfe6;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
}

.form-row.no-border {
  border-bottom: none;
}

.label {
  background-color: #f8f9fb;
  padding: 8px 10px;
  text-align: right;
  border-right: 1px solid #dcdfe6;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 40px;
  color: #606266;
  font-weight: bold;
}

.label.border-left {
  border-left: 1px solid #dcdfe6;
}

.content {
  padding: 5px 15px;
  display: flex;
  align-items: center;
}

:deep(.el-form-item) {
  margin-bottom: 0px !important;
}

:deep(.el-dialog__header) {
  background-color: #f8f9fb;
  margin-right: 0;
  padding: 8px 20px;
}

:deep(.el-dialog__title) {
  font-size: 14px;
  font-weight: bold;
}
</style>
