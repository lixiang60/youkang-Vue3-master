<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
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
          type="success"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sequencing:schedule:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          plain
          icon="DocumentAdd"
          @click="handleAddPlateNo"
        >添加板号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="warning"
          plain
          icon="CirclePlus"
          @click="handleAddWellNo"
        >添加孔号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="success"
          plain
          icon="Notebook"
          @click="handleLayoutStrategy"
        >排版忽略</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="info"
          plain
          icon="Printer"
          @click="handleTemplateBDT"
        >模板BDT</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      size="small"
      :header-cell-style="{ fontSize: '12px' }"
      v-loading="loading" 
      :data="dataList" 
      :columns="columns"
      :total="total"
      @selection-change="handleSelectionChange"
    />

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
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

<script setup name="Schedule">
import { listLayoutTemplate } from '@/api/sequencing/schedule'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const searchRef = ref(null)
const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_yes_no } = proxy.useDict('sys_normal_disable', 'sys_yes_no')

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
  { key: 'produceId', label: '生产编号', width: 100, fixed: true, sortable: true, visible: true },
  { key: 'templateNumber', label: '个数', width: 60, visible: true },
  { key: 'orderId', label: '订单号', width: 160, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'sampleId', label: '样品编号', width: 120, visible: true },
  { key: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'primerConcentration', label: '引物浓度', width: 80, visible: true },
  { key: 'sampleType', label: '样品类型', width: 80, visible: true },
  { key: 'carrierName', label: '载体名称', width: 100, visible: true },
  { key: 'antibioticType', label: '抗生素类型', width: 100, visible: true },
  { key: 'fragmentSize', label: '片段大小', width: 80, visible: true },
  { key: 'testResult', label: '是否测通', width: 80, visible: true },
  { key: 'performance', label: '完成情况', width: 80, visible: true },
  { key: 'returnState', label: '返回状态', width: 80, visible: true },
  { key: 'templatePlateNo', label: '模板板号', width: 80, visible: true },
  { key: 'templateHoleNo', label: '模板孔号', width: 80, visible: true },
  { key: 'originConcentration', label: '原浓度', width: 80, visible: true },
  { key: 'flowName', label: '流程名称', width: 100, visible: true },
  { key: 'createUser', label: '创建人', width: 100, visible: true },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: false }
])

const cacheKey = 'sequencing_schedule_columns_visible'
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
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' },
  { prop: 'returnState', label: '返回状态', type: 'input' }
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
    name: [
      { required: true, message: '名称不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listLayoutTemplate(queryParams.value).then(response => {
    dataList.value = response.data ? response.data.rows : response.rows
    total.value = response.data ? response.data.total : response.total
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
    name: undefined,
    status: '0',
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
  title.value = '添加模板排版'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getSchedule(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改模板排版'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateSchedule(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addSchedule(form.value).then(response => {
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
    return delSchedule(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/schedule/export', {
    ...queryParams.value
  }, `schedule_${new Date().getTime()}.xlsx`)
}

// 占位方法
function handleAddPlateNo() { proxy.$modal.msgInfo('功能开发中...') }
function handleAddWellNo() { proxy.$modal.msgInfo('功能开发中...') }
function handleLayoutStrategy() { proxy.$modal.msgInfo('功能开发中...') }
function handleTemplateBDT() { proxy.$modal.msgInfo('功能开发中...') }

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
