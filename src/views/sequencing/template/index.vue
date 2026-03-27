<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small"
          type="success"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['sequencing:template:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="primary"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sequencing:template:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sequencing:template:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          plain
          icon="Search"
          @click="toggleSearchPanel"
        >查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          plain
          icon="Refresh"
          @click="handleRefresh"
        >刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sequencing:template:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
      size="small"
      :header-cell-style="{ fontSize: '12px' }"
      v-loading="loading" 
      :data="dataList" 
      :columns="columns"
      :total="total"
      @selection-change="handleSelectionChange"
    />

    

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="模板排版号" prop="templateNumber">
              <el-input v-model="form.templateNumber" placeholder="请输入模板排版号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="订单号" prop="orderId">
              <el-input v-model="form.orderId" placeholder="请输入订单号" />
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
  </div>
</template>

<script setup name="Template">
import { listTemplate, getTemplate, addTemplate, updateTemplate, delTemplate } from '@/api/sequencing/template'

const searchRef = ref(null)
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const dataList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'orderId', label: '订单号', width: 160, fixed: true, visible: true },
  { key: 'templateNumber', label: '模板排版号', width: 120, fixed: true, sortable: true, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'sampleId', label: '样品编号', width: 120, fixed: true, visible: true },
  { key: 'sampleType', label: '样品类型', width: 80, visible: true },
  { key: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'primerConcentration', label: '引物浓度', width: 80, visible: true },
  { key: 'carrierName', label: '载体名称', width: 100, visible: true },
  { key: 'antibioticType', label: '抗生素类型', width: 100, visible: true },
  { key: 'fragmentSize', label: '片段大小', width: 80, visible: true },
  { key: 'testResult', label: '是否测通', width: 80, visible: true },
  { key: 'originConcentration', label: '原浓度', width: 80, visible: true },
  { key: 'templatePlateNo', label: '模板板号', width: 80, visible: true },
  { key: 'templateHoleNo', label: '模板孔号', width: 80, visible: true },
  { key: 'performance', label: '完成情况', width: 100, visible: true },
  { key: 'returnState', label: '返回状态', width: 80, visible: true },
  { key: 'flowName', label: '流程名称', width: 120, visible: true },
  { key: 'createUser', label: '创建人', width: 100, visible: true },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: false }
])

const cacheKey = 'sequencing_template_columns_visible'
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
watch(columns, (newVal) => {
  const cache = {}
  newVal.forEach(col => { if (col.key) cache[col.key] = col.visible })
  localStorage.setItem(cacheKey, JSON.stringify(cache))
}, { deep: true })

// 检索配置
const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' }
])

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    sampleId: undefined,
    customerName: undefined,
    returnState: undefined
  },
  rules: {
    templateNumber: [
      { required: true, message: '模板排版号不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listTemplate(queryParams.value).then(response => {
    dataList.value = response.data.rows
    total.value = response.data.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    templateNumber: undefined,
    orderId: undefined,
    remark: undefined
  }
  proxy.resetForm('formRef')
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
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加模板'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getTemplate(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改模板'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateTemplate(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addTemplate(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const idList = row.id || ids.value
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function() {
    return delTemplate(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/template/export', {
    ...queryParams.value
  }, `template_${new Date().getTime()}.xlsx`)
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

</style>
