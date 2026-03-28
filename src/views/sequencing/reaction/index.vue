<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="EditPen" @click="handleUpdate"
          :disabled="single">编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain @click="handleOriginConcentration" :disabled="multiple">
          <template #icon><el-icon>
              <EditPen />
            </el-icon></template>
          原浓度
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain @click="handleAddPlate" :disabled="multiple">
          <template #icon><el-icon>
              <Calendar />
            </el-icon></template>
          添加板号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Message" @click="handleReportStatus"
          :disabled="multiple">报告状态</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain @click="handleAddHole" :disabled="single">
          <template #icon><el-icon>
              <List />
            </el-icon></template>
          添加孔号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Document" @click="handleBdtQuery">测序BDT表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Grid" @click="handleNotImplemented">上机表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="CircleClose" @click="handleStop"
          :disabled="multiple">反应停止</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Histogram" @click="handleNotImplemented">新上基表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Warning" @click="handleInsufficient"
          :disabled="multiple">样品不足</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Compass" @click="handleNotImplemented">机器分装</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Files" @click="handleNotImplemented">批量编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Odometer" @click="handleNotImplemented">稀释</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="List" @click="handleNotImplemented">调整和加料明细</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="RefreshRight" @click="handlePreReaction"
          :disabled="multiple">反应预做</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Camera" @click="showSearch = !showSearch">图像设置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Files" @click="handleNotImplemented">添加引物</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList"
      size="small" :header-cell-style="{ fontSize: '12px' }" v-loading="loading" :data="dataList" :columns="columns"
      :total="total" @selection-change="handleSelectionChange" />

    <!-- 修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产编号" prop="produceId">
              <el-input v-model="form.produceId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderId">
              <el-input v-model="form.orderId" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="样品编号" prop="sampleId">
              <el-input v-model="form.sampleId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="form.customerName" disabled />
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
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置原浓度对话框 (仿制截图样式) -->
    <el-dialog v-model="concOpen" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #409EFF; font-size: 20px;">
            <Edit />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">设置原浓度</span>
        </div>
      </template>
      <el-form ref="concFormRef" :model="concForm" :rules="concRules" label-width="0" class="well-form">
        <!-- 生产编号展示 -->
        <div class="form-row border-top">
          <div class="form-label" style="width: 140px;">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 14px; color: #333;">{{ selectedProduceIds.length > 0 ? selectedProduceIds.join(', ')
              :
              '未选择' }}</span>
          </div>
        </div>
        <!-- 原浓度输入 -->
        <div class="form-row">
          <div class="form-label" style="width: 140px;">原浓度：</div>
          <div class="form-content">
            <el-form-item prop="originConcentration" label-width="0" style="margin-bottom: 0;">
              <el-select v-model="concForm.originConcentration" placeholder="请选择或输入原浓度" filterable allow-create
                style="width: 280px">
                <el-option label="0.3" value="0.3" />
                <el-option label="0.5" value="0.5" />
                <el-option label="0.7" value="0.7" />
                <el-option label="1.0" value="1.0" />
                <el-option label="1.5" value="1.5" />
                <el-option label="2.0" value="2.0" />
                <el-option label="3.0" value="3.0" />
                <el-option label="5.0" value="5.0" />
                <el-option label="高" value="高" />
                <el-option label="低" value="低" />
                <el-option label="加测" value="加测" />
                <template #prefix>
                  <el-icon style="color: #E6A23C;">
                    <WarningFilled />
                  </el-icon>
                </template>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!-- 备注 -->
        <div class="form-row border-bottom" style="height: 180px;">
          <div class="form-label" style="width: 140px; height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px;">
            <el-input v-model="concForm.remark" type="textarea" :rows="6" placeholder="请输入备注内容" style="height: 100%;" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 30px; padding: 10px 0;">
          <el-button @click="submitConc"
            style="height: 40px; width: 120px; border-radius: 20px; font-weight: bold; background-color: #f2f6fc; border-color: #dcdfe6; color: #333;">
            <template #icon>
              <el-icon style="color: #67C23A; font-size: 20px; margin-right: 5px;">
                <SuccessFilled />
              </el-icon>
            </template>
            确 定
          </el-button>
          <el-button @click="concOpen = false"
            style="height: 40px; width: 120px; border-radius: 20px; font-weight: bold; background-color: #f2f6fc; border-color: #dcdfe6; color: #333;">
            <template #icon>
              <el-icon style="color: #F56C6C; font-size: 20px; margin-right: 5px;">
                <CircleCloseFilled />
              </el-icon>
            </template>
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加板号对话框 -->
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

    <!-- 添加孔号对话框 -->
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
          <el-button type="primary" icon="Printer" :disabled="bdtList.length === 0" @click="bdtOpen = false">打
            印</el-button>
          <el-button @click="bdtOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Reaction">
import {
  listReactionProduce,
  updateReactionOriginConcentration,
  updateReactionPlate,
  updateReactionHoleNo,
  getSequencingBDT,
  reactionStop,
  sampleInsufficient,
  reactionPre
} from '@/api/sequencing/reaction'
import { getProduction, updateProduction } from '@/api/sequencing/production'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const searchRef = ref(null)
const { proxy } = getCurrentInstance()

const dataList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const selectedRows = ref([])
const selectedProduceIds = computed(() => selectedRows.value.map(r => r.produceId))

const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'produceId', label: '生产编号', width: 120, fixed: true, sortable: true, visible: true },
  { key: 'orderId', label: '订单号', width: 160, fixed: true, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, fixed: true, visible: true },
  { key: 'sampleId', label: '样品编号', width: 120, visible: true },
  { key: 'originHoleNo', label: '原孔号', width: 80, visible: true },
  { key: 'samplePosition', label: '样品位置', width: 100, visible: true },
  { key: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'originConcentration', label: '原浓度', width: 80, visible: true },
  { key: 'templatePlateNo', label: '板号', width: 100, visible: true },
  { key: 'templateHoleNo', label: '孔号', width: 80, visible: true },
  { key: 'returnState', label: '状态', width: 100, visible: true },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: true }
])

// 缓存列设置
const cacheKey = 'sequencing_reaction_columns_visible'
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

// 检索配置
const searchFields = ref([
  { prop: 'templateNo', label: '板号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' }
])

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateNo: undefined,
    orderId: undefined,
    customerName: undefined,
    sampleId: undefined,
    flowName: '反应生产'
  },
  rules: {}
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listReactionProduce(queryParams.value).then(response => {
    const res = response.data || response // 兼容不同包装格式
    dataList.value = res.rows || []
    total.value = res.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

function handleSelectionChange(selection) {
  selectedRows.value = selection
  ids.value = selection.map(item => item.produceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 修改按钮操作 */
function handleUpdate() {
  reset()
  const produceId = ids.value[0]
  getProduction(produceId).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改反应生产'
  })
}

function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      updateProduction(form.value).then(() => {
        proxy.$modal.msgSuccess('修改成功')
        open.value = false
        getList()
      })
    }
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = {
    produceId: undefined,
    orderId: undefined,
    sampleId: undefined,
    customerName: undefined,
    remark: undefined
  }
}

// 业务方法
const concOpen = ref(false)
const concForm = ref({})
const concRules = {
  originConcentration: [{ required: true, message: '请选择或输入原浓度', trigger: 'change' }]
}

function handleOriginConcentration() {
  concForm.value = {
    produceIdList: ids.value,
    originConcentration: undefined,
    remark: undefined
  }
  concOpen.value = true
}

function submitConc() {
  proxy.$refs['concFormRef'].validate(valid => {
    if (valid) {
      updateReactionOriginConcentration(concForm.value).then(() => {
        proxy.$modal.msgSuccess('设置成功')
        concOpen.value = false
        getList()
      })
    }
  })
}

const plateOpen = ref(false)
const plateForm = ref({})
function handleAddPlate() {
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
    proxy.$modal.msgSuccess('活跃板号设置成功')
    plateOpen.value = false
    getList()
  })
}

const holeOpen = ref(false)
const holeForm = ref({})
function handleAddHole() {
  const row = selectedRows.value[0]
  holeForm.value = {
    produceId: row.produceId,
    plateNo: row.templatePlateNo,
    holeNo: row.templateHoleNo
  }
  holeOpen.value = true
}

function submitHole() {
  updateReactionHoleNo(holeForm.value).then(() => {
    proxy.$modal.msgSuccess('活跃孔号设置成功')
    holeOpen.value = false
    getList()
  })
}

function handleReportStatus() {
  proxy.$modal.msg('报告状态功能暂无对应API')
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

function handleStop() {
  proxy.$modal.confirm('是否确认停止选中的反应？').then(() => {
    return reactionStop({ produceIdList: ids.value })
  }).then(() => {
    proxy.$modal.msgSuccess('操作成功')
    getList()
  }).catch(() => { })
}

function handleInsufficient() {
  proxy.$modal.confirm('是否确认标记选中样品为样品不足？').then(() => {
    return sampleInsufficient({ produceIdList: ids.value })
  }).then(() => {
    proxy.$modal.msgSuccess('操作成功')
    getList()
  }).catch(() => { })
}

function handlePreReaction() {
  proxy.$modal.confirm('是否确认对选中样品进行反应预做？').then(() => {
    return reactionPre({ produceIdList: ids.value })
  }).then(() => {
    proxy.$modal.msgSuccess('操作成功')
    getList()
  }).catch(() => { })
}

function handleNotImplemented() {
  proxy.$modal.msg('功能开发中...')
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

.report-table th,
.report-table td {
  border: 1px solid #dfe6ec;
  padding: 8px;
  text-align: center;
}

.report-table th {
  background-color: #f8f8f9;
}
</style>
