<template>
  <div class="app-container">
    <!-- 1. 查询面板 (占位演示) -->
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
        <el-button type="primary" :icon="Upload" size="small" @click="handleOpenImportDialog">导入</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList" />
    </el-row>

    <!-- 3. 数据表格区 (用于显示导入后的样品展示) -->
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

    <!-- 4. Excel导入对话框 (高度还原旧版逻辑但做了现代化升级) -->
    <aliquot-import-dialog v-model="showImportDialog" @success="getList" />
  </div>
</template>

<script setup name="SynthesisAliquotValue">
import { ref, reactive, onMounted, watch, getCurrentInstance } from 'vue'
import { Upload, Search, Refresh } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import AliquotImportDialog from './components/AliquotImportDialog.vue'

const { proxy } = getCurrentInstance()

// --- 1. Constants & Config ---
const searchFields = ref([
  { prop: 'plateNo', label: '源板号', type: 'input' },
  { prop: 'wellNo', label: '孔号', type: 'input' }
])

const STORAGE_KEY = 'synthesis_aliquot_value_columns'
const savedColumns = localStorage.getItem(STORAGE_KEY)
// 展示一些分装的特征列，具体可按真实 API 返回为准
const defaultColumns = [
  { type: 'selection', width: 55, align: 'center', fixed: 'left' },
  { label: '生产编号', prop: 'produceId', minWidth: 100, visible: true },
  { label: '订单号', prop: 'orderNo', minWidth: 160, visible: true },
  { label: '加急', prop: 'urgent', minWidth: 60, visible: true },
  { label: '课题组', prop: 'researchGroup', minWidth: 100, visible: true },
  { label: '修饰', prop: 'modification', minWidth: 100, visible: true },
  { label: '纯化方式', prop: 'purification', minWidth: 100, visible: true },
  { label: '板号', prop: 'plateNo', minWidth: 120, visible: true },
  { label: '孔号', prop: 'wellNo', minWidth: 80, visible: true },
  { label: '备注', prop: 'remark', minWidth: 150, visible: true }
]
const columns = ref(savedColumns ? JSON.parse(savedColumns) : defaultColumns)

// --- 2. State ---
const loading = ref(false)
const total = ref(0)
const dataList = ref([])
const showSearch = ref(false)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

const showImportDialog = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  plateNo: '',
  wellNo: ''
})

// --- 4. Methods ---
function getList() {
  loading.value = true
  setTimeout(() => {
    // 模拟列表中刚被导入的数据
    dataList.value = [
      {
        produceId: '37098',
        orderNo: '20200428235629565',
        urgent: '否',
        researchGroup: '温光文',
        modification: '-1',
        purification: 'PAGE',
        plateNo: '20200428-3A',
        wellNo: 'E09',
        remark: ''
      }
    ]
    total.value = 1
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

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.produceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleOpenImportDialog() {
  showImportDialog.value = true
}

// --- 5. Lifecycle ---
onMounted(() => {
  getList()
})

// --- 6. Watchers ---
watch(
  columns,
  val => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)
</script>

<style scoped></style>
