<template>
  <div class="app-container">
    <!-- 1. 查询参数区 -->
    <el-collapse-transition>
      <div v-show="showSearch">
        <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />
      </div>
    </el-collapse-transition>

    <!-- 2. 操作按钮区 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="info" plain size="small" :icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain size="small" :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain size="small" :icon="Edit" :disabled="single" @click="handleUpdate">
          编辑
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain size="small" :icon="Printer" :disabled="multiple" @click="handlePrint">
          打印
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain size="small" :icon="Delete" :disabled="multiple" @click="handleClearValue">
          清空分装值
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain size="small" :icon="Setting" :disabled="multiple" @click="handleStatusConfig">
          分装状态
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" :icon="Cpu" :disabled="multiple" @click="handleMachineAliquot">
          机器分装
        </el-button>
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
    >
      <!-- 加急列自定义渲染 -->
      <template #isUrgent="{ row }">
        <span :style="{ color: row.isUrgent === '是' ? 'red' : 'inherit' }">
          {{ row.isUrgent }}
        </span>
      </template>
    </dynamic-table>

    <!-- 分页 -->
    <pagination
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <!-- 8. 机器分装打印弹窗 -->
    <AliquotMachineDialog v-model="showMachineDialog" />

    <!-- 7. 设置分装状态弹窗 -->
    <AliquotStatusDialog v-model="showStatusDialog" :selected-items="selectedRows" @success="getList" />

    <!-- 6. 打印配置及预览弹窗 -->
    <AliquotPrintDialog v-model="showPrintDialog" />
  </div>
</template>

<script setup name="SynthesisAliquot">
import { ref, reactive, onMounted, getCurrentInstance, watch } from 'vue'
import { Search, Refresh, Edit, Printer, Delete, Setting, Cpu } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import AliquotPrintDialog from './components/AliquotPrintDialog.vue'
import AliquotStatusDialog from './components/AliquotStatusDialog.vue'
import AliquotMachineDialog from './components/AliquotMachineDialog.vue'

const { proxy } = getCurrentInstance()

// ================= 1. Constants & Config =================
const searchFields = ref([
  { prop: 'productionNo', label: '生产编号', type: 'input' },
  { prop: 'orderNo', label: '订单号', type: 'input' },
  { prop: 'researchGroup', label: '课题组', type: 'input' }
])

// ================= 2. State ==============================
const loading = ref(false)
const total = ref(0)
const dataList = ref([])
const showSearch = ref(false) // 默认隐藏
const showPrintDialog = ref(false)
const showStatusDialog = ref(false)
const showMachineDialog = ref(false)

const ids = ref([])
const selectedRows = ref([])
const single = ref(true)
const multiple = ref(true)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  productionNo: undefined,
  orderNo: undefined,
  researchGroup: undefined
})

// === 表格列显隐控制 (持久化) ===
const storageKey = 'aliquot_columns_v1'
const savedColumns = localStorage.getItem(storageKey)
const columns = ref(
  savedColumns
    ? JSON.parse(savedColumns)
    : [
        { type: 'selection', width: 50, fixed: true, visible: true },
        { prop: 'productionNo', label: '生产编号', minWidth: 100, fixed: true, visible: true },
        { prop: 'orderNo', label: '订单号', minWidth: 150, visible: true },
        { prop: 'isUrgent', label: '加急', minWidth: 70, slot: 'isUrgent', visible: true },
        { prop: 'researchGroup', label: '课题组', minWidth: 100, visible: true },
        { prop: 'modification', label: '修饰', minWidth: 80, visible: true },
        { prop: 'purification', label: '纯化方式', minWidth: 100, visible: true },
        { prop: 'wellNo', label: '孔号', minWidth: 80, visible: true },
        { prop: 'wellNo2', label: '孔号2', minWidth: 80, visible: true },
        { prop: 'remark', label: '备注', minWidth: 180, showOverflowTooltip: true, visible: true }
      ]
)

watch(
  columns,
  val => {
    localStorage.setItem(storageKey, JSON.stringify(val))
  },
  { deep: true }
)

// ================= 3. Computed ===========================
// =========================================================

// ================= 4. Methods ============================
function getList() {
  loading.value = true

  // 模拟图2的数据
  setTimeout(() => {
    dataList.value = [
      {
        id: 1,
        productionNo: '29600',
        orderNo: '20200106231956612',
        isUrgent: '否',
        researchGroup: '任海燕',
        modification: '-1',
        purification: 'OPC',
        wellNo: 'E02',
        wellNo2: '13',
        remark: ''
      }
    ]
    total.value = 1
    loading.value = false
  }, 300)
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('数据已刷新')
}

function toggleSearchPanel() {
  proxy.$refs.searchRef?.toggleCollapse()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 占位功能演示
function handleUpdate() {
  proxy.$modal.msgInfo('编辑功能开发中...')
}

function handlePrint() {
  showPrintDialog.value = true
}

function handleClearValue() {
  proxy.$modal
    .confirm('是否确认清空选中数据的分装值?')
    .then(() => {
      proxy.$modal.msgSuccess('清空成功')
    })
    .catch(() => {})
}

function handleStatusConfig() {
  if (selectedRows.value.length === 0) {
    proxy.$modal.msgWarning('请至少选中一项进行操作')
    return
  }
  showStatusDialog.value = true
}

function handleMachineAliquot() {
  showMachineDialog.value = true
}

// ================= 5. Lifecycle ==========================
onMounted(() => {
  getList()
})
// =========================================================
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>
