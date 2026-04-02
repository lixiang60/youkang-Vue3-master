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
          v-hasPermi="['order:sample:reportStatus']"
          size="small"
          type="warning"
          plain
          icon="Message"
          :disabled="multiple"
          @click="handleReportStatus"
          >报告状态</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="TrendCharts" @click="handleNotImplemented"
          >清除孔号</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Document" @click="handleDbtQuery">DBT</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['order:sample:capillaryAdd']"
          size="small"
          type="primary"
          plain
          icon="Plus"
          @click="handleCapillary"
          >毛细管添加</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Monitor" @click="handleNotImplemented">订单量监控</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Picture" @click="handleNotImplemented">图像设置</el-button>
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

    <!-- 报告状态对话框 -->
    <el-dialog v-model="statusOpen" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #e6a23c; font-size: 20px">
            <Message />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">设置报告状态</span>
        </div>
      </template>
      <el-form :model="statusForm" label-width="0" class="well-form">
        <!-- 基础信息 -->
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px; color: #f56c6c">
              选中个数：<span style="font-weight: bold">{{ selectedProduceIds.length }}</span
              >，选中生产编号：{{ selectedProduceIds.join(',') }}
            </span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">报告状态：</div>
          <div class="form-content">
            <el-select v-model="statusForm.reportStatus" placeholder="请选择报告状态" style="width: 250px">
              <el-option label="报告成功" value="报告成功" />
              <el-option label="报告取消" value="报告取消" />
              <el-option label="报告重做" value="报告重做" />
              <el-option label="报告重抽" value="报告重抽" />
            </el-select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">原浓度：</div>
          <div class="form-content">
            <el-input v-model="statusForm.originConcentration" placeholder="请输入原浓度" style="width: 250px" />
          </div>
        </div>
        <!-- 异常原因 -->
        <div class="form-row" style="height: 100px">
          <div class="form-label" style="height: 100%">异常原因：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center">
            <el-input
              v-model="statusForm.reportErrorReason"
              type="textarea"
              :rows="3"
              placeholder="请输入报告异常原因"
            />
          </div>
        </div>
        <!-- 备注 -->
        <div class="form-row border-bottom" style="height: 100px">
          <div class="form-label" style="height: 100%">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center">
            <el-input v-model="statusForm.remark" type="textarea" :rows="3" placeholder="请输入备注内容" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitStatus">确定</el-button>
          <el-button type="danger" :icon="Close" @click="statusOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 毛细管添加对话框 -->
    <el-dialog v-model="capillaryOpen" width="800px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #67c23a; font-size: 20px">
            <CirclePlus />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">添加毛细管</span>
        </div>
      </template>
      <el-form :model="capillaryForm" label-width="0" class="well-form">
        <!-- 第一行：板号和机器号 -->
        <div class="form-row border-top">
          <div class="form-label" style="width: 100px">板号：</div>
          <div class="form-content">
            <el-input v-model="capillaryForm.plateNo" placeholder="请输入板号" />
          </div>
          <div class="form-label" style="width: 100px; border-left: 1px solid #ebeef5">机器号：</div>
          <div class="form-content">
            <el-select v-model="capillaryForm.machineNo" placeholder="请选择机器" style="width: 100%">
              <el-option label="3730-1" value="3730-1" />
              <el-option label="3730-2" value="3730-2" />
              <el-option label="3730-3" value="3730-3" />
            </el-select>
          </div>
        </div>
        <!-- 第二行：备注 -->
        <div class="form-row border-bottom" style="height: 150px">
          <div class="form-label" style="width: 100px; height: 100%">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px">
            <el-input
              v-model="capillaryForm.remark"
              type="textarea"
              :rows="5"
              placeholder="请输入备注内容"
              style="height: 100%"
            />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitCapillary">确定</el-button>
          <el-button type="danger" :icon="Close" @click="capillaryOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- DBT查询对话框 -->
    <el-dialog v-model="dbtOpen" title="测序DBT表" width="1000px" append-to-body>
      <el-form :inline="true" label-width="68px" @submit.prevent>
        <el-form-item label="板号">
          <el-input v-model="dbtQueryPlateNo" placeholder="请输入板号" clearable @keyup.enter="handlePrintDbt" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handlePrintDbt">查询</el-button>
        </el-form-item>
      </el-form>
      <div v-if="dbtList.length > 0" id="printReportDBT" class="report-container">
        <table class="report-table">
          <thead>
            <tr>
              <th>生产编号</th>
              <th>订单号</th>
              <th>样品编号</th>
              <th>板号</th>
              <th>孔号</th>
              <th>引物</th>
              <th>报告状态</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dbtList" :key="item.produceId">
              <td>{{ item.produceId }}</td>
              <td>{{ item.orderId }}</td>
              <td>{{ item.sampleId }}</td>
              <td>{{ item.plateNo }}</td>
              <td>{{ item.holeNo }}</td>
              <td>{{ item.primer }}</td>
              <td>{{ item.reportStatus }}</td>
              <td>{{ item.remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <el-empty v-else description="请输入板号查询数据" />
      <template #footer>
        <div class="dialog-footer">
          <el-button v-print="'#printReportDBT'" type="success" :disabled="dbtList.length === 0">打 印</el-button>
          <el-button type="danger" @click="dbtOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Report">
import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import { listReport, updateReportStatus, addCapillary } from '@/api/sequencing/report'
import { getSequencingBDT } from '@/api/sequencing/reaction'
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
const selectedProduceIds = computed(() => selectedRows.value.map(r => r.produceId))

// 列配置
const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'produceId', label: '生产编号', width: 120, fixed: true, sortable: true, visible: true },
  { key: 'orderId', label: '订单号', width: 160, fixed: true, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'sampleId', label: '样品编号', width: 120, visible: true },
  { key: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'originConcentration', label: '原浓度', width: 100, visible: true },
  { key: 'reportStatus', label: '报告状态', width: 100, visible: true },
  { key: 'returnState', label: '状态', width: 100, visible: true },
  { key: 'templatePlateNo', label: '模板板号', width: 120, visible: true },
  { key: 'templateHoleNo', label: '模板孔号', width: 80, visible: true },
  { key: 'plateNo', label: '反应板号', width: 120, visible: true },
  { key: 'holeNo', label: '反应孔号', width: 80, visible: true },
  { key: 'remark', label: '备注', width: 150, showOverflowTooltip: true, visible: true }
])

// 检索配置
const searchFields = ref([
  { prop: 'plateNo', label: '板号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' }
])

// 统一 getList 处理
function getList() {
  loading.value = true
  listReport(queryParams.value)
    .then(response => {
      const res = response.data || response
      dataList.value = res.rows || []
      total.value = res.total || 0
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

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

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
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
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 业务逻辑
const statusOpen = ref(false)
const statusForm = ref({})
function handleReportStatus() {
  if (multiple.value) {
    proxy.$modal.msgWarning('请选择需要设置状态的样品')
    return
  }
  const savedStatus = localStorage.getItem('report_status_memory')
  statusForm.value = {
    produceIdList: selectedProduceIds.value,
    reportStatus: savedStatus || '报告成功',
    originConcentration: undefined,
    reportErrorReason: undefined,
    remark: undefined
  }
  statusOpen.value = true
}

function submitStatus() {
  updateReportStatus(statusForm.value).then(() => {
    localStorage.setItem('report_status_memory', statusForm.value.reportStatus)
    proxy.$modal.msgSuccess('设置成功')
    statusOpen.value = false
    getList()
  })
}

const capillaryOpen = ref(false)
const capillaryForm = ref({})
function handleCapillary() {
  capillaryForm.value = {
    plateNo: undefined,
    machineNo: undefined,
    remark: undefined
  }
  capillaryOpen.value = true
}

function submitCapillary() {
  if (!capillaryForm.value.plateNo) return proxy.$modal.msgError('请输入板号')
  if (!capillaryForm.value.machineNo) return proxy.$modal.msgError('请选择机器号')
  addCapillary(capillaryForm.value).then(() => {
    proxy.$modal.msgSuccess('操作成功')
    capillaryOpen.value = false
    getList()
  })
}

const dbtOpen = ref(false)
const dbtQueryPlateNo = ref('')
const dbtList = ref([])
function handleDbtQuery() {
  dbtQueryPlateNo.value = ''
  dbtList.value = []
  dbtOpen.value = true
}

function handlePrintDbt() {
  if (!dbtQueryPlateNo.value) return proxy.$modal.msgError('请输入板号')
  getSequencingBDT({ plateNo: dbtQueryPlateNo.value }).then(response => {
    dbtList.value = response.data || []
  })
}

function handleNotImplemented() {
  proxy.$modal.msg('功能开发中...')
}

// --- 4. Lifecycle Hooks ---
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
</style>
