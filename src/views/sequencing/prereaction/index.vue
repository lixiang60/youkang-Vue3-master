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
        <el-button size="small" type="success" plain @click="handleBatchPlate" :disabled="multiple">
          <template #icon><el-icon><Calendar /></el-icon></template>
          添加板号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain @click="handleActiveHole" :disabled="single">
          <template #icon><el-icon><List /></el-icon></template>
          添加孔号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Document" @click="handleBdtQuery">测序BDT表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Warning" @click="handleInsufficient" :disabled="multiple">样品不足</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Back" @click="handleSendBack" :disabled="multiple">退回</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList"
      size="small" :header-cell-style="{ fontSize: '12px' }" v-loading="loading" :data="dataList" :columns="columns"
      :total="total" @selection-change="handleSelectionChange" />

    <!-- 活跃板号对话框 -->
    <el-dialog title="添加板号" v-model="plateOpen" width="750px" append-to-body>
      <el-form ref="plateFormRef" :model="plateForm" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">板号：</div>
          <div class="form-content">
            <el-input v-model="plateForm.plateNo" placeholder="请输入板号" style="width: 250px" />
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
          <div class="form-label">备注：</div>
          <div class="form-content">
            <el-input v-model="plateForm.remark" type="textarea" placeholder="请输入备注内容" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitPlate">确 定</el-button>
          <el-button @click="plateOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 活跃孔号对话框 -->
    <el-dialog title="添加孔号" v-model="holeOpen" width="500px" append-to-body>
      <el-form :model="holeForm" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">{{ holeForm.produceId }}</div>
        </div>
        <div class="form-row">
          <div class="form-label">板号：</div>
          <div class="form-content">
            <el-input v-model="holeForm.plateNo" placeholder="请输入板号" />
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label">孔号：</div>
          <div class="form-content">
            <el-input v-model="holeForm.holeNo" placeholder="请输入孔号 ( e.g. A01 )" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitHole">确 定</el-button>
          <el-button @click="holeOpen = false">取 消</el-button>
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
          <el-button type="primary" icon="Printer" :disabled="bdtList.length === 0" @click="bdtOpen = false">打 印</el-button>
          <el-button @click="bdtOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 退回理由对话框 -->
    <el-dialog title="反应预做退回" v-model="sendBackOpen" width="500px" append-to-body>
      <el-form :model="sendBackForm" label-width="100px" class="well-form">
        <div class="form-row border-top border-bottom">
          <div class="form-label">退回理由：</div>
          <div class="form-content">
            <el-form-item label-width="0">
              <el-input v-model="sendBackForm.remark" type="textarea" placeholder="请输入退回理由" />
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitSendBack">确 定</el-button>
          <el-button @click="sendBackOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Prereaction">
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
  { key: 'originConcentration', label: '原浓', width: 80, visible: true },
  { key: 'plateNo', label: '排板板号', width: 120, visible: true },
  { key: 'holeNo', label: '排版', width: 80, visible: true },
  { key: 'carrierName', label: '载体名称', width: 120, visible: true },
  { key: 'produceId', label: '生产编号', width: 120, sortable: true, visible: true },
  { key: 'orderId', label: '订单号', width: 160, visible: true },
  { key: 'sampleType', label: '样品', width: 100, visible: true },
  { key: 'fragmentSize', label: '片段', width: 80, visible: true },
  { key: 'prevPlateNo', label: '上一版号', width: 120, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 200, showOverflowTooltip: true, visible: true },
  { key: 'topic', label: '课题组', width: 120, visible: true },
  { key: 'priority', label: '加急', width: 80, visible: true },
  { key: 'completionStatus', label: '完成情况', width: 100, visible: true },
  { key: 'returnState', label: '返回状态', width: 100, visible: true },
  { key: 'createBy', label: '添加人', width: 100, visible: true }
])

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
    dataList.value = response.rows || []
    total.value = response.total || 0
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
    layout: '横排',
    remark: undefined
  }
  plateOpen.value = true
}

function submitPlate() {
  updateReactionPlate(plateForm.value).then(() => {
    proxy.$modal.msgSuccess('添加板号成功')
    plateOpen.value = false
    getList()
  })
}

const holeOpen = ref(false)
const holeForm = ref({})
function handleActiveHole() {
  const row = selectedRows.value[0]
  holeForm.value = {
    produceId: row.produceId,
    plateNo: row.plateNo,
    holeNo: row.holeNo
  }
  holeOpen.value = true
}

function submitHole() {
  updateReactionHoleNo(holeForm.value).then(() => {
    proxy.$modal.msgSuccess('添加孔号成功')
    holeOpen.value = false
    getList()
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
  }).catch(() => {})
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
  reactionPreSendBack(sendBackForm.value).then(() => {
    proxy.$modal.msgSuccess('退回成功')
    sendBackOpen.value = false
    getList()
  })
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

.well-form {
  border: 1px solid #dcdfe6;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.form-label {
  width: 120px;
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

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table th, .report-table td {
  border: 1px solid #dfe6ec;
  padding: 8px;
  text-align: center;
}

.report-table th {
  background-color: #f8f8f9;
}
</style>
