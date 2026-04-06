<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:prereaction:export']"
          size="small"
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['order:sample:reactionProduce']"
          size="small"
          type="success"
          plain
          :disabled="multiple"
          @click="handleBatchPlate"
        >
          添加板号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['order:sample:reactionProduce']"
          size="small"
          type="success"
          plain
          :disabled="single"
          @click="handleActiveHole"
        >
          添加孔号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['order:sample:reactionProduce']"
          size="small"
          type="info"
          plain
          icon="Document"
          @click="handleBdtQuery"
          >测序BDT表</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['order:sample:sampleInsufficient']"
          size="small"
          type="warning"
          plain
          icon="Warning"
          :disabled="multiple"
          @click="handleInsufficient"
          >样品不足</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['order:sample:reactionPreSendBack']"
          size="small"
          type="danger"
          plain
          icon="Back"
          :disabled="multiple"
          @click="handleSendBack"
          >退回</el-button
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
      @selection-change="handleSelectionChange"
    />

    <!-- 活跃板号对话框 -->
    <el-dialog v-model="plateOpen" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <Edit />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">设置模板板号</span>
        </div>
      </template>
      <el-form ref="plateFormRef" :model="plateForm" :rules="plateRules" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px"
              >选中数量：<span style="color: #f56c6c; font-weight: bold">{{ ids.length }}</span
              >，选中生产编号：{{ ids.join(', ') }}</span
            >
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">机器类型：</div>
          <div class="form-content">
            <el-radio-group v-model="plateForm.machineType">
              <el-radio label="192">192</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">板号：</div>
          <div class="form-content">
            <el-form-item prop="plateNo" label-width="0">
              <el-input v-model="plateForm.plateNo" placeholder="请输入板号" style="width: 250px" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">排版方式：</div>
          <div class="form-content">
            <el-radio-group v-model="plateForm.layout">
              <el-radio label="横排">横排</el-radio>
              <el-radio label="竖排">竖排</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label" style="height: 100%">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center">
            <el-input v-model="plateForm.remark" type="textarea" :rows="4" placeholder="添加备注信息..." />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitPlate">确定</el-button>
          <el-button type="danger" :icon="Close" @click="plateOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 活跃孔号对话框 -->
    <el-dialog v-model="holeOpen" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <Setting />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">手工直接添加模板孔号</span>
        </div>
      </template>
      <el-form ref="holeFormRef" :model="holeForm" :rules="holeRules" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px">
              选中数量：<span style="color: #409eff; font-weight: bold">1</span>，选中生产编号：{{ holeForm.produceId }}
            </span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">机器类型：</div>
          <div class="form-content">
            <el-radio-group v-model="holeForm.machineType">
              <el-radio label="192">192</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">排版方式：</div>
          <div class="form-content">
            <el-radio-group v-model="holeForm.layout">
              <el-radio label="横排">横排</el-radio>
              <el-radio label="竖排">竖排</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">板号/孔号：</div>
          <div class="form-content" style="display: flex; align-items: center; gap: 10px">
            <el-form-item prop="plateNo" label-width="0" style="margin-bottom: 0">
              <el-input v-model="holeForm.plateNo" placeholder="板号" style="width: 150px" />
            </el-form-item>
            <span style="color: #dcdfe6">/</span>
            <el-form-item prop="holeNo" label-width="0" style="margin-bottom: 0">
              <el-input v-model="holeForm.holeNo" placeholder="孔号" style="width: 150px" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label">备注：</div>
          <div class="form-content" style="padding: 10px">
            <el-input v-model="holeForm.remark" type="textarea" :rows="4" placeholder="添加备注信息..." />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitHole">确定</el-button>
          <el-button type="danger" :icon="Close" @click="holeOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 测序 BDT 表查询打印公共组件 -->
    <BDTPrintDialog v-model="bdtOpen" :fetch-api="getSequencingBDT" />

    <!-- 退回理由对话框 -->
    <el-dialog v-model="sendBackOpen" title="反应预做退回设置" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #f56c6c; font-size: 20px">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">反应预做退回设置</span>
        </div>
      </template>
      <el-form :model="sendBackForm" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label" style="width: 140px">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px; color: #f56c6c">
              选中个数：<span style="font-weight: bold">{{ ids.length }}</span
              >，选中生产编号：{{ ids.join(',') }}
            </span>
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label" style="width: 140px">退回理由：</div>
          <div class="form-content">
            <el-input v-model="sendBackForm.remark" type="textarea" :rows="4" placeholder="请输入退回原因" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitSendBack">确定</el-button>
          <el-button type="danger" :icon="Close" @click="sendBackOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Prereaction">
import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { listPrereaction, reactionPreSendBack } from '@/api/sequencing/prereaction'
import { Check, Close } from '@element-plus/icons-vue'
import {
  updateReactionPlate,
  updateReactionHoleNo,
  getSequencingBDT,
  sampleInsufficient
} from '@/api/sequencing/reaction'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import BDTPrintDialog from '../components/BDTPrintDialog.vue'

// --- 1. Constants & Config ---
const { proxy } = getCurrentInstance()
const cacheKey = 'sequencing_prereaction_columns_visible'

// 列配置
const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'sampleId', label: '样品编号', minWidth: 130, fixed: true, sortable: true, visible: true },
  { prop: 'primer', label: '测序引物', minWidth: 130, visible: true },
  { prop: 'primerName', label: '引物', minWidth: 100, visible: true },
  { prop: 'primerPosition', label: '引物位置', minWidth: 100, visible: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true },
  { prop: 'originConcentration', label: '原浓度', minWidth: 100, visible: true },
  { prop: 'plateNo', label: '模板板号', minWidth: 130, visible: true },
  { prop: 'holeNo', label: '模板孔号', minWidth: 110, visible: true },
  { prop: 'carrierName', label: '载体名称', minWidth: 120, visible: true },
  { prop: 'produceId', label: '生产编号', minWidth: 120, sortable: true, visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 150, sortable: true, visible: true },
  { prop: 'sampleType', label: '样品类型', minWidth: 100, visible: true },
  { prop: 'fragmentSize', label: '片段大小', minWidth: 100, visible: true },
  { prop: 'completionStatus', label: '是否测通', minWidth: 110, visible: true },
  { prop: 'prevPlateNo', label: '上一版号', minWidth: 130, visible: true },
  { prop: 'customerName', label: '客户姓名', minWidth: 110, visible: true },
  { prop: 'customerAddress', label: '客户地址', minWidth: 220, showOverflowTooltip: true, visible: true },
  { prop: 'topic', label: '课题组', minWidth: 140, visible: true },
  { prop: 'priority', label: '加急', minWidth: 80, visible: true },
  { prop: 'primerConcentration', label: '引物浓度', minWidth: 100, visible: true },
  { prop: 'returnState', label: '返回状态', minWidth: 110, visible: true },
  { prop: 'createBy', label: '添加人', minWidth: 100, visible: true }
])

// 检索配置
const searchFields = ref([
  { prop: 'plateNo', label: '板号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' }
])

const plateRules = {
  plateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }],
  layout: [{ required: true, message: '请选择排版方式', trigger: 'change' }]
}

const holeRules = {
  plateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }],
  holeNo: [{ required: true, message: '请输入孔号', trigger: 'blur' }]
}

// --- 2. State ---
const dataList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const searchRef = ref(null)
const selectedRows = ref([])

const bdtOpen = ref(false)
const plateOpen = ref(false)
const holeOpen = ref(false)
const sendBackOpen = ref(false)

const plateForm = ref({
  produceIdList: [],
  plateNo: undefined,
  machineType: '192',
  layout: '横排',
  remark: undefined
})

const holeForm = ref({
  produceId: undefined,
  plateNo: undefined,
  holeNo: undefined,
  machineType: '192',
  layout: '横排',
  remark: ''
})

const sendBackForm = ref({
  produceIdList: [],
  remark: ''
})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    plateNo: undefined,
    orderId: undefined,
    customerName: undefined,
    sampleId: undefined
  }
})

const { queryParams } = toRefs(data)

// --- 3. Watchers ---
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

watch(
  columns,
  newVal => {
    const cache = {}
    newVal.forEach(col => {
      if (col.key) cache[col.key] = col.visible
    })
    localStorage.setItem(cacheKey, JSON.stringify(cache))
  },
  { deep: true }
)

// --- 4. Methods ---
/** 查询列表 */
function getList() {
  loading.value = true
  listPrereaction(queryParams.value)
    .then(response => {
      const res = response.data || response // 兼容不同包装格式
      dataList.value = res.rows || []
      total.value = res.total || 0
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 刷新按钮操作 */
function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  selectedRows.value = selection
  ids.value = selection.map(item => item.produceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'order/sample/export',
    {
      ...queryParams.value,
      flowName: '反应预做'
    },
    `prereaction_${new Date().getTime()}.xlsx`
  )
}

function handleBatchPlate() {
  plateForm.value = {
    produceIdList: ids.value,
    plateNo: undefined,
    machineType: '192',
    layout: '横排',
    remark: undefined
  }
  plateOpen.value = true
}

function submitPlate() {
  proxy.$refs['plateFormRef'].validate(valid => {
    if (valid) {
      updateReactionPlate(plateForm.value).then(() => {
        proxy.$modal.msgSuccess('添加板号成功')
        plateOpen.value = false
        getList()
      })
    }
  })
}

function handleActiveHole() {
  const row = selectedRows.value[0]
  holeForm.value = {
    produceId: row.produceId,
    plateNo: row.plateNo,
    holeNo: row.holeNo,
    machineType: '192',
    layout: '横排',
    remark: ''
  }
  holeOpen.value = true
}

function submitHole() {
  proxy.$refs['holeFormRef'].validate(valid => {
    if (valid) {
      updateReactionHoleNo(holeForm.value).then(() => {
        proxy.$modal.msgSuccess('添加孔号成功')
        holeOpen.value = false
        getList()
      })
    }
  })
}

function handleBdtQuery() {
  bdtOpen.value = true
}

function handleInsufficient() {
  proxy.$modal
    .confirm('是否确认标记选中样品为样品不足？')
    .then(() => {
      return sampleInsufficient({ produceIdList: ids.value })
    })
    .then(() => {
      proxy.$modal.msgSuccess('操作成功')
      getList()
    })
    .catch(() => {})
}

function handleSendBack() {
  sendBackForm.value = {
    produceIdList: ids.value,
    remark: ''
  }
  sendBackOpen.value = true
}

function submitSendBack() {
  proxy.$modal
    .confirm('是否确认退回选中的样品？')
    .then(() => {
      return reactionPreSendBack(sendBackForm.value)
    })
    .then(() => {
      proxy.$modal.msgSuccess('退回成功')
      sendBackOpen.value = false
      getList()
    })
    .catch(() => {})
}

// --- 5. Lifecycle Hooks ---
let isInitialActivated = true
onMounted(() => {
  getList()
})

onActivated(() => {
  if (!isInitialActivated) {
    getList()
  }
  isInitialActivated = false
})
</script>

<style scoped>
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
}

.well-form {
  border: 1px solid #dcdfe6;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.form-label {
  width: 100px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: bold;
  font-size: 13px;
  border-right: 1px solid #ebeef5;
  background-color: #f8f9fa;
}

.form-content {
  flex: 1;
  padding: 10px 15px;
}

.border-top {
  border-top: 1px solid #ebeef5;
}

.border-bottom {
  border-bottom: 1px solid #ebeef5;
}

:deep(.well-form .el-form-item) {
  margin-bottom: 0px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table th,
.report-table td {
  border: 1px solid #dfe6ec;
  padding: 8px;
  text-align: center;
}

.report-table th {
  background-color: #f8f8f9;
}

.report-container {
  max-height: 500px;
  overflow-y: auto;
}

.print-action-area {
  text-align: center;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.print-btn {
  padding: 10px 40px;
  font-weight: bold;
  border-radius: 4px;
}
</style>
