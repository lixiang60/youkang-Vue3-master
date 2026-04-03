<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:resend_email:add']"
          size="small"
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:resend_email:edit']"
          size="small"
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:resend_email:remove']"
          size="small"
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:resend_email:export']"
          size="small"
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @query-table="getList"></right-toolbar>
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

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">名称：</div>
          <div class="form-content">
            <el-form-item prop="name" label-width="0">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">状态：</div>
          <div class="form-content">
            <el-form-item prop="status" label-width="0">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
        <div class="form-row border-bottom" style="height: 120px">
          <div class="form-label" style="height: 100%">备注：</div>
          <div class="form-content" style="height: 100%">
            <el-form-item prop="remark" label-width="0" style="height: 100%">
              <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入内容" />
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Resend_email">
import { ref, reactive, toRefs, watch, onMounted, onActivated, getCurrentInstance } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import {
  listResend_email,
  getResend_email,
  addResend_email,
  updateResend_email,
  delResend_email
} from '@/api/sequencing/resend_email'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

// --- 1. Constants & Config ---
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')
const cacheKey = 'sequencing_resend_email_columns_visible'

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { key: 'productionNo', label: '生产编号', minWidth: 120, fixed: true, sortable: true, visible: true },
  { key: 'orderId', label: '订单号', minWidth: 150, fixed: true, sortable: true, visible: true },
  { key: 'customerName', label: '客户姓名', minWidth: 110, visible: true },
  { key: 'customerAddress', label: '客户地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { key: 'customerLevel', label: '客户等级', minWidth: 100, visible: true },
  { key: 'researchGroup', label: '课题组', minWidth: 140, showOverflowTooltip: true, visible: true },
  { key: 'sampleId', label: '样品编号', minWidth: 130, visible: true },
  { key: 'primer', label: '测序引物', minWidth: 120, visible: true },
  { key: 'primerConcentration', label: '引物浓度', minWidth: 100, visible: true },
  { key: 'sampleType', label: '样品类型', minWidth: 100, visible: true },
  { key: 'carrierName', label: '载体名称', minWidth: 120, visible: true },
  { key: 'fragmentSize', label: '片段大小', minWidth: 100, visible: true },
  { key: 'testResult', label: '是否测通', minWidth: 100, visible: true },
  { key: 'performance', label: '完成情况', minWidth: 110, visible: true },
  { key: 'returnState', label: '返回状态', minWidth: 110, visible: true },
  { key: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true },
  { key: 'flowName', label: '流程名称', minWidth: 130, visible: true },
  { key: 'templatePlateNo', label: '板号', minWidth: 110, visible: true },
  { key: 'templateHoleNo', label: '孔号', minWidth: 100, visible: true },
  { key: 'createUser', label: '添加人', minWidth: 110, visible: true }
])

const searchFields = ref([
  { prop: 'templateNo', label: '任务板号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' },
  { prop: 'sampleType', label: '样品类型', type: 'input' }
])

// --- 2. State ---
const searchRef = ref(null)
const dataList = ref([])
const total = ref(0)
const loading = ref(true)
const showSearch = ref(true)
const open = ref(false)
const title = ref('')
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    templateNo: undefined,
    customerName: undefined,
    sampleId: undefined,
    sampleType: undefined
  },
  rules: {
    remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

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

// --- 3. Methods ---

/** 查询列表 */
function getList() {
  loading.value = true
  listResend_email(queryParams.value)
    .then(response => {
      dataList.value = response.rows
      total.value = response.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索 & 操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 基础 CRUD */
function reset() {
  form.value = {
    id: undefined,
    name: undefined,
    status: '0',
    remark: undefined
  }
  proxy.resetForm('formRef')
}

function cancel() {
  open.value = false
  reset()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '添加样品补送邮件'
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getResend_email(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改样品补送邮件'
  })
}

function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateResend_email(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addResend_email(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const idList = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除编号为"' + idList + '"的数据项？')
    .then(() => {
      return delResend_email(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

function handleExport() {
  proxy.download(
    'sequencing/resend_email/export',
    {
      ...queryParams.value
    },
    `resend_email_${new Date().getTime()}.xlsx`
  )
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

// --- 5. Watchers ---
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
</script>

<style scoped>
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
}
</style>
