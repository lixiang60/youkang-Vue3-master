<template>
  <div class="app-container">
    <!-- 1. 查询面板 -->
    <el-collapse-transition>
      <div v-show="showSearch">
        <dynamic-search
          ref="searchRef"
          v-model="queryParams"
          :fields="searchFields"
          @search="handleQuery"
          @reset="resetQuery"
        />
      </div>
    </el-collapse-transition>

    <!-- 2. 操作按钮区 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="info" plain :icon="Search" size="small" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain :icon="Refresh" size="small" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain :icon="Edit" size="small" :disabled="multiple" @click="handleStatusUpdate"
          >纯化状态</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList" />
    </el-row>

    <!-- 3. 数据表格区 -->
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

    <!-- 4. 业务操作对话框 -->
    <purification-status-dialog v-model="showStatusDialog" :selected-ids="ids" @success="getList" />
  </div>
</template>

<script setup name="SynthesisPurification">
import { ref, reactive, onMounted, watch, getCurrentInstance } from 'vue'
import { Edit, Search, Refresh } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import PurificationStatusDialog from './components/PurificationStatusDialog.vue'

const { proxy } = getCurrentInstance()

// --- 1. Constants & Config (静态常量与配置) ---
const searchFields = ref([
  { prop: 'produceId', label: '生产编号', type: 'input' },
  { prop: 'orderNo', label: '订单号', type: 'input' },
  { prop: 'plateNo', label: '板号', type: 'input' }
])

const STORAGE_KEY = 'synthesis_purification_columns'
const savedColumns = localStorage.getItem(STORAGE_KEY)
const defaultColumns = [
  { type: 'selection', width: 55, align: 'center', fixed: 'left' },
  { label: '生产编号', prop: 'produceId', minWidth: 100, visible: true },
  { label: '订单号', prop: 'orderNo', minWidth: 160, visible: true },
  { label: '加急', prop: 'urgent', minWidth: 60, visible: true },
  { label: '修饰', prop: 'modification', minWidth: 100, visible: true },
  { label: '纯化方式', prop: 'purification', minWidth: 100, visible: true },
  { label: '板号', prop: 'plateNo', minWidth: 120, visible: true },
  { label: '孔号', prop: 'wellNo', minWidth: 80, visible: true },
  { label: '备注', prop: 'remark', minWidth: 150, visible: true }
]
const columns = ref(savedColumns ? JSON.parse(savedColumns) : defaultColumns)

// --- 2. State (响应式状态) ---
const loading = ref(false)
const total = ref(0)
const dataList = ref([])
const showSearch = ref(false)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

const showStatusDialog = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  produceId: '',
  orderNo: '',
  plateNo: ''
})

// --- 3. Computed (派生属性) ---

// --- 4. Methods (方法逻辑) ---
/** 初始化与查询 */
function getList() {
  loading.value = true
  setTimeout(() => {
    // 基于截图的真实感Mock
    dataList.value = [
      {
        produceId: '36198',
        orderNo: '20200423211438116',
        urgent: '否',
        modification: '-1',
        purification: 'PAGE',
        plateNo: '20200423-3A',
        wellNo: 'H02',
        remark: ''
      },
      {
        produceId: '36197',
        orderNo: '20200423211438116',
        urgent: '否',
        modification: '-1',
        purification: 'PAGE',
        plateNo: '20200423-3A',
        wellNo: 'G02',
        remark: ''
      }
    ]
    total.value = 2
    loading.value = false
  }, 400)
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

function resetQuery() {
  proxy.resetForm('searchRef')
  handleQuery()
}

/** 表格与选框交互 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.produceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 业务操作 */
function handleStatusUpdate() {
  showStatusDialog.value = true
}

// --- 5. Lifecycle (生命周期) ---
onMounted(() => {
  getList()
})

// --- 6. Watchers (侦听器) ---
watch(
  columns,
  val => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)
</script>

<style scoped></style>
