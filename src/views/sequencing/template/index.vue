<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:template:add']"
          size="small"
          type="success"
          plain
          icon="Plus"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:template:edit']"
          size="small"
          type="primary"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:template:remove']"
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
          v-hasPermi="['sequencing:template:export']"
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
    <el-dialog v-model="open" width="750px" append-to-body top="10vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">{{ title }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">模板排版号：</div>
          <div class="form-content">
            <el-form-item prop="templateNumber" label-width="0">
              <el-input v-model="form.templateNumber" placeholder="请输入模板排版号" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">订单号：</div>
          <div class="form-content">
            <el-form-item prop="orderId" label-width="0">
              <el-input v-model="form.orderId" placeholder="请输入订单号" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label">备注：</div>
          <div class="form-content">
            <el-form-item prop="remark" label-width="0">
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

<script setup name="Template">
import { ref, reactive, toRefs, watch, onMounted, onActivated, getCurrentInstance } from 'vue'
import { listTemplate, getTemplate, addTemplate, updateTemplate, delTemplate } from '@/api/sequencing/template'
import { Check, Close } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

// --- 1. Constants & Config ---
const { proxy } = getCurrentInstance()
const cacheKey = 'sequencing_template_columns_visible'

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'templateNumber', label: '模板排版号', minWidth: 180, fixed: true, sortable: true, visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 150, sortable: true, visible: true },
  { prop: 'plateType', label: '板子类型', minWidth: 120, visible: true },
  { prop: 'plateLayout', label: '板孔布局', minWidth: 120, visible: true },
  { prop: 'createTime', label: '创建时间', minWidth: 180, visible: true }
])

const searchFields = ref([
  { prop: 'templateNumber', label: '模板排版号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' }
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
    templateNumber: undefined,
    orderId: undefined
  },
  rules: {
    templateNumber: [{ required: true, message: '模板排版号不能为空', trigger: 'blur' }]
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
  listTemplate(queryParams.value)
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
    templateNumber: undefined,
    orderId: undefined,
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
  title.value = '添加模板'
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getTemplate(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改模板'
  })
}

function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateTemplate(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addTemplate(form.value).then(() => {
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
      return delTemplate(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

function handleExport() {
  proxy.download(
    'sequencing/template/export',
    {
      ...queryParams.value
    },
    `template_${new Date().getTime()}.xlsx`
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
