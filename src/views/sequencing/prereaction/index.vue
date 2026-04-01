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
        <el-button size="small" type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['sequencing:prereaction:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain @click="handleBatchPlate" :disabled="multiple"
          v-hasPermi="['order:sample:reactionProduce']">
          添加板号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain @click="handleActiveHole" :disabled="single"
          v-hasPermi="['order:sample:reactionProduce']">
          添加孔号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Document" @click="handleBdtQuery"
          v-hasPermi="['order:sample:reactionProduce']">测序BDT表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Warning" @click="handleInsufficient" :disabled="multiple"
          v-hasPermi="['order:sample:sampleInsufficient']">样品不足</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Back" @click="handleSendBack" :disabled="multiple"
          v-hasPermi="['order:sample:reactionPreSendBack']">退回</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList"
      size="small" :header-cell-style="{ fontSize: '12px' }" v-loading="loading" :data="dataList" :columns="columns"
      :total="total" @selection-change="handleSelectionChange" />

    <!-- 活跃板号对话框 -->
    <el-dialog v-model="plateOpen" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #409EFF; font-size: 20px;">
            <Edit />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">设置模板板号</span>
        </div>
      </template>
      <el-form ref="plateFormRef" :model="plateForm" :rules="plateRules" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px;">选中数量：<span style="color: #F56C6C; font-weight: bold;">{{ ids.length
            }}</span>，选中生产编号：{{ ids.join(', ') }}</span>
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
        <div class="form-row border-bottom" style="height: 150px;">
          <div class="form-label" style="height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center;">
            <el-input v-model="plateForm.remark" type="textarea" :rows="5" placeholder="添加备注信息..." />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="submitPlate">确 定</el-button>
          <el-button type="danger" @click="plateOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 活跃孔号对话框 -->
    <el-dialog v-model="holeOpen" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #409EFF; font-size: 20px;">
            <Setting />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">手工直接添加模板孔号</span>
        </div>
      </template>
      <el-form ref="holeFormRef" :model="holeForm" :rules="holeRules" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px;">选中数量：<span style="color: #409EFF; font-weight: bold;">1</span>，选中生产编号：{{
              holeForm.produceId }}</span>
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
          <div class="form-content" style="display: flex; align-items: center; gap: 10px;">
            <el-form-item prop="plateNo" label-width="0" style="margin-bottom: 0;">
              <el-input v-model="holeForm.plateNo" placeholder="板号" style="width: 150px" />
            </el-form-item>
            <span style="color: #dcdfe6;">/</span>
            <el-form-item prop="holeNo" label-width="0" style="margin-bottom: 0;">
              <el-input v-model="holeForm.holeNo" placeholder="孔号" style="width: 150px" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row border-bottom" style="height: 150px;">
          <div class="form-label" style="height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center;">
            <el-input v-model="holeForm.remark" type="textarea" :rows="5" placeholder="添加备注信息..." />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="submitHole">确 定</el-button>
          <el-button type="danger" @click="holeOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- BDT查询对话框 -->
    <el-dialog title="测序BDT表" v-model="bdtOpen" width="1000px" append-to-body>
      <el-form :inline="true" label-width="68px" @submit.prevent>
        <el-form-item label="板号">
          <el-input v-model="bdtQueryPlateNo" placeholder="请输入板号" clearable @keyup.enter="handlePrintBdt" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handlePrintBdt">查询</el-button>
        </el-form-item>
      </el-form>

      <div v-if="bdtList.length > 0" class="report-container">
        <table class="report-table">
          <thead>
            <tr>
              <th>生产编号</th>
              <th>板号</th>
              <th>孔号</th>
              <th>客户姓名</th>
              <th>样品编号</th>
              <th>载体</th>
              <th>引物</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in bdtList" :key="item.produceId">
              <td>{{ item.produceId }}</td>
              <td>{{ item.plateNo }}</td>
              <td>{{ item.holeNo }}</td>
              <td>{{ item.customerName }}</td>
              <td>{{ item.sampleId }}</td>
              <td>{{ item.carrierName }}</td>
              <td>{{ item.primer }}</td>
              <td>{{ item.remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <el-empty v-else description="请输入板号查询数据" />

      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" :disabled="bdtList.length === 0" v-print="'#printPrereactionBDT'">打 印</el-button>
          <el-button type="danger" @click="bdtOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 退回理由对话框 (仿制截图样式) -->
    <el-dialog v-model="sendBackOpen" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #F56C6C; font-size: 20px;">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">反应预做退回设置</span>
        </div>
      </template>
      <el-form :model="sendBackForm" label-width="0" class="well-form">
        <!-- 生产编号 -->
        <div class="form-row border-top">
          <div class="form-label" style="width: 140px;">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px; color: #F56C6C;">
              选中个数：<span style="font-weight: bold;">{{ ids.length }}</span>，选中生产编号：{{
                ids.join(',') }}
            </span>
          </div>
        </div>
        <!-- 退回理由 -->
        <div class="form-row border-bottom" style="height: 150px;">
          <div class="form-label" style="width: 140px; height: 100%;">退回理由：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center;">
            <el-input v-model="sendBackForm.remark" type="textarea" :rows="5" placeholder="请输入退回原因" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="submitSendBack">确 定</el-button>
          <el-button type="danger" @click="sendBackOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Prereaction">
import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from 'vue'
import {
  listPrereaction,
  reactionPreSendBack
} from '@/api/sequencing/prereaction'
import {
  updateReactionPlate,
  updateReactionHoleNo,
  getSequencingBDT,
  sampleInsufficient
} from '@/api/sequencing/reaction'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const { proxy } = getCurrentInstance()

const dataList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const searchRef = ref(null)
const selectedRows = ref([])

// 列配置
const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'sampleId', label: '样品编号', width: 120, fixed: true, visible: true },
  { key: 'primer', label: '测序引物', width: 120, visible: true },
  { key: 'primerName', label: '引物', width: 100, visible: true },
  { key: 'primerPosition', label: '引物位置', width: 100, visible: true },
  { key: 'remark', label: '备注', width: 150, showOverflowTooltip: true, visible: true },
  { key: 'originConcentration', label: '原浓度', width: 100, visible: true },
  { key: 'plateNo', label: '模板板号', width: 120, visible: true },
  { key: 'holeNo', label: '模板孔号', width: 100, visible: true },
  { key: 'carrierName', label: '载体名称', width: 120, visible: true },
  { key: 'produceId', label: '生产编号', width: 120, sortable: true, visible: true },
  { key: 'orderId', label: '订单号', width: 160, visible: true },
  { key: 'sampleType', label: '样品类型', width: 100, visible: true },
  { key: 'fragmentSize', label: '片段大小', width: 100, visible: true },
  { key: 'completionStatus', label: '是否测通', width: 100, visible: true },
  { key: 'prevPlateNo', label: '上一版号', width: 120, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 200, showOverflowTooltip: true, visible: true },
  { key: 'topic', label: '课题组', width: 120, visible: true },
  { key: 'priority', label: '加急', width: 80, visible: true },
  { key: 'primerConcentration', label: '引物浓度', width: 100, visible: true },
  { key: 'returnState', label: '返回状态', width: 100, visible: true },
  { key: 'createBy', label: '添加人', width: 100, visible: true }
])

const plateRules = {
  plateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }],
  layout: [{ required: true, message: '请选择排版方式', trigger: 'change' }]
}

const holeRules = {
  plateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }],
  holeNo: [{ required: true, message: '请输入孔号', trigger: 'blur' }]
}

// 检索配置
const searchFields = ref([
  { prop: 'plateNo', label: '板号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' }
])

// 列可见性缓存
const cacheKey = 'sequencing_prereaction_columns_visible'
const savedColumns = localStorage.getItem(cacheKey)
if (savedColumns) {
  try {
    const cache = JSON.parse(savedColumns)
    columns.value.forEach(col => {
      const key = col.key || col.prop || col.type
      if (key && cache[key] !== undefined) col.visible = cache[key]
    })
  } catch (e) { }
}
watch(columns, (newVal) => {
  const cache = {}
  newVal.forEach(col => { if (col.key) cache[col.key] = col.visible })
  localStorage.setItem(cacheKey, JSON.stringify(cache))
}, { deep: true })

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

/** 查询列表 */
function getList() {
  loading.value = true
  listPrereaction(queryParams.value).then(response => {
    const res = response.data || response // 兼容不同包装格式
    dataList.value = res.rows || []
    total.value = res.total || 0
    loading.value = false
  }).catch(() => {
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
  proxy.download('order/sample/export', {
    ...queryParams.value,
    flowName: '反应预做'
  }, `prereaction_${new Date().getTime()}.xlsx`)
}

// 业务方法
const plateOpen = ref(false)
const plateForm = ref({})
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

const holeOpen = ref(false)
const holeForm = ref({})
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

const bdtOpen = ref(false)
const bdtQueryPlateNo = ref('')
const bdtList = ref([])
function handleBdtQuery() {
  bdtQueryPlateNo.value = ''
  bdtList.value = []
  bdtOpen.value = true
}

function handlePrintBdt() {
  if (!bdtQueryPlateNo.value) return proxy.$modal.msgError('请输入板号')
  getSequencingBDT({ plateNo: bdtQueryPlateNo.value }).then(response => {
    bdtList.value = response.data || []
  })
}

function handleInsufficient() {
  proxy.$modal.confirm('是否确认标记选中样品为样品不足？').then(() => {
    return sampleInsufficient({ produceIdList: ids.value })
  }).then(() => {
    proxy.$modal.msgSuccess('操作成功')
    getList()
  }).catch(() => { })
}

const sendBackOpen = ref(false)
const sendBackForm = ref({
  produceIdList: [],
  remark: ''
})

function handleSendBack() {
  sendBackForm.value = {
    produceIdList: ids.value,
    remark: ''
  }
  sendBackOpen.value = true
}

function submitSendBack() {
  proxy.$modal.confirm('是否确认退回选中的样品？').then(() => {
    return reactionPreSendBack(sendBackForm.value)
  }).then(() => {
    proxy.$modal.msgSuccess('退回成功')
    sendBackOpen.value = false
    getList()
  }).catch(() => { })
}

onMounted(() => {
  getList()
})

onActivated(() => {
  getList()
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
  width: 140px;
  padding: 10px;
  height: 100%;
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

.report-table th {
  background-color: #f8f8f9;
}
</style>
