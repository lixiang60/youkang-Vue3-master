<template>
  <div class="app-container">
    <!-- 1. 查询面板 -->
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="生产编号" prop="produceId">
        <el-input
          v-model="queryParams.produceId"
          placeholder="请输入生产编号"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 2. 操作按钮区 (按照图1严格排列) -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="info" plain icon="Search" size="small" @click="handleAction('查询')">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Refresh" size="small" @click="getList">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="DocumentChecked" size="small" @click="handleAction('审核')">
          审核
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="DocumentAdd" size="small" @click="handleAction('添加板号')">
          添加板号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="CirclePlus" size="small" @click="handleAction('添加孔号')">
          添加孔号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Printer" size="small" @click="handleAction('标签打印')">
          标签打印
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Grid" size="small" @click="handleAction('上机表')">上机表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="CircleClose" size="small" @click="handleAction('反应停止')">
          反应停止
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="default" plain icon="Document" size="small" @click="handleAction('操作单')">操作单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Scissor" size="small" @click="handleAction('合成拆单')">
          合成拆单
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Picture" size="small" @click="handleAction('图像设置')">图像设置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList" />
    </el-row>

    <!-- 3. 数据表格区 (按照图2字段严格配置) -->
    <dynamic-table
      ref="tableRef"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      @selection-change="handleSelectionChange"
    />

    <!-- 4. 分页 -->
    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
    <!-- 弹窗：设置板号 -->
    <AddPlateDialog v-model="showAddPlateDialog" title="设置板号" :selected-items="selectedRows" @success="getList" />

    <!-- 弹窗：手工添加孔号 -->
    <AddWellDialog
      v-model="showAddWellDialog"
      title="手工直接添加板号"
      :selected-items="selectedRows"
      @success="getList"
    />

    <!-- 弹窗：安排合成 - 标签打印 -->
    <ArrangeLabelPrintDialog v-model="showArrangePrintDialog" title="合成标签打印" :selected-items="selectedRows" />

    <!-- 弹窗：安排合成 - 上机表打印 -->
    <ArrangeMachinePrintDialog v-model="showMachinePrintDialog" title="合成上机表打印" :selected-items="selectedRows" />

    <!-- 弹窗：安排合成 - 反应停止 -->
    <StopReactionDialog
      v-model="showStopReactionDialog"
      title="停止反应"
      :selected-items="selectedRows"
      @success="getList"
    />
  </div>
</template>

<script setup name="SynthesisArrange">
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import AddPlateDialog from './components/AddPlateDialog.vue'
import AddWellDialog from './components/AddWellDialog.vue'
import ArrangeLabelPrintDialog from './components/ArrangeLabelPrintDialog.vue'
import ArrangeMachinePrintDialog from './components/ArrangeMachinePrintDialog.vue'
import StopReactionDialog from './components/StopReactionDialog.vue'

// --- 1. Constants & Config ---
const { proxy } = getCurrentInstance()

const columns = ref([
  { type: 'selection', width: 40, fixed: true, visible: true },
  { label: '生产编号', key: 'produceId', prop: 'produceId', width: 100, visible: true },
  { label: '订单号', key: 'orderId', prop: 'orderId', width: 140, visible: true },
  { label: '客户姓名', key: 'customerName', prop: 'customerName', width: 90, visible: true },
  { label: '地区', key: 'region', prop: 'region', width: 80, visible: true },
  { label: '拆单来源', key: 'splitSource', prop: 'splitSource', width: 100, visible: true },
  { label: '加急', key: 'urgent', prop: 'urgent', width: 80, visible: true },
  { label: '课题组', key: 'groupName', prop: 'groupName', width: 120, visible: true },
  { label: '碱基数', key: 'baseCount', prop: 'baseCount', width: 80, visible: true },
  { label: '备注', key: 'remark', prop: 'remark', width: 150, visible: true },
  { label: 'U', key: 'uValue', prop: 'uValue', width: 60, visible: true },
  { label: 'I', key: 'iValue', prop: 'iValue', width: 60, visible: true },
  { label: 'OD总量', key: 'odTotal', prop: 'odTotal', width: 80, visible: true },
  { label: 'OD/管', key: 'odPerTube', prop: 'odPerTube', width: 80, visible: true },
  { label: '修饰', key: 'modification', prop: 'modification', width: 100, visible: true },
  { label: '纯化方式', key: 'purification', prop: 'purification', width: 100, visible: true },
  { label: '返还状态', key: 'returnStatus', prop: 'returnStatus', width: 90, visible: true },
  { label: '返还原因', key: 'returnReason', prop: 'returnReason', width: 120, visible: true }
])

// --- 2. State (响应式状态) ---
const data = reactive({
  loading: false,
  total: 0,
  dataList: [],
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    produceId: ''
  },
  ids: [],
  selectedRows: [],
  single: true,
  multiple: true,
  showSearch: false,
  showAddPlateDialog: false,
  showAddWellDialog: false,
  showArrangePrintDialog: false,
  showMachinePrintDialog: false,
  showStopReactionDialog: false
})

const {
  loading,
  total,
  dataList,
  queryParams,
  ids,
  selectedRows,
  single,
  multiple,
  showSearch,
  showAddPlateDialog,
  showAddWellDialog,
  showArrangePrintDialog,
  showMachinePrintDialog,
  showStopReactionDialog
} = toRefs(data)

// --- 3. Computed (派生属性) ---

// --- 4. Methods (方法与逻辑) ---

/** 查询列表 (Mock) */
function getList() {
  loading.value = true
  setTimeout(() => {
    dataList.value = [
      {
        produceId: '2002379',
        orderId: '',
        customerName: '',
        region: '',
        splitSource: '',
        urgent: '',
        groupName: '',
        baseCount: 0,
        remark: '',
        uValue: 0,
        iValue: 0,
        odTotal: '',
        odPerTube: '',
        modification: '-1',
        purification: '-1',
        returnStatus: '',
        returnReason: ''
      },
      {
        produceId: '2002217',
        orderId: '',
        customerName: '',
        region: '',
        splitSource: '',
        urgent: '',
        groupName: '',
        baseCount: 0,
        remark: '',
        uValue: 0,
        iValue: 0,
        odTotal: '',
        odPerTube: '',
        modification: '-1',
        purification: '-1',
        returnStatus: '',
        returnReason: ''
      }
    ]
    total.value = 2
    loading.value = false
  }, 200)
}

/** 操作占位/路由分发 */
function handleAction(msg) {
  if (msg === '添加板号') {
    if (ids.value.length === 0) {
      proxy.$modal.msgWarning('请先选择要添加板号的数据')
      return
    }
    showAddPlateDialog.value = true
  } else if (msg === '添加孔号') {
    if (ids.value.length === 0) {
      proxy.$modal.msgWarning('请先选择要添加孔号的数据')
      return
    }
    showAddWellDialog.value = true
  } else if (msg === '标签打印') {
    if (ids.value.length === 0) {
      proxy.$modal.msgWarning('请先选择要排版打印的数据')
      return
    }
    showArrangePrintDialog.value = true
  } else if (msg === '上机表') {
    if (ids.value.length === 0) {
      proxy.$modal.msgWarning('请先选择要排版打印的上机数据')
      return
    }
    showMachinePrintDialog.value = true
  } else if (msg === '反应停止') {
    if (ids.value.length === 0) {
      proxy.$modal.msgWarning('请先选择要停止反应的数据')
      return
    }
    showStopReactionDialog.value = true
  } else {
    proxy.$modal.msgInfo(`[${msg}] 功能接入中...`)
  }
}

/** 快捷查询 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置查询 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选操作拦截 */
function handleSelectionChange(selection) {
  selectedRows.value = selection
  ids.value = selection.map(item => item.produceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// --- 5. Lifecycle (生命周期) ---
onMounted(() => {
  getList()
})

// --- 6. Watchers (侦听器) ---
</script>

<style scoped>
/* 扩展安全边距 */
.app-container {
  padding: 20px;
}
</style>
