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
        <el-button size="small" type="warning" plain icon="Message" @click="handleReportStatus">报告状态</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="TrendCharts" @click="handleTestHole">测试孔号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Document" @click="handleBdt">DBT</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Plus" @click="handleCapillary">毛细管添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Monitor" @click="handleOrderMonitor">订单监控</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Picture" @click="handleImageSettings">图像设置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList"
      size="small" :header-cell-style="{ fontSize: '12px' }" v-loading="loading" :data="dataList" :columns="columns"
      :total="total" @selection-change="handleSelectionChange" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="well-form">
        <div class="form-row border-top border-bottom">
          <div class="form-label">备注：</div>
          <div class="form-content">
            <el-form-item prop="remark" label-width="0">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </div>
        </div>
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

<script setup name="Report">
import { listReport, getReport, addReport, updateReport, delReport } from '@/api/sequencing/report'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

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
const searchRef = ref(null)

// 列配置
const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'produceId', label: '生产编号', width: 120, fixed: true, sortable: true, visible: true },
  { key: 'orderId', label: '订单号', width: 160, fixed: true, visible: true },
  { key: 'orderType', label: '订单类型', width: 100, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 180, showOverflowTooltip: true, visible: true },
  { key: 'customerLevel', label: '客户等级', width: 100, visible: true },
  { key: 'topic', label: '课题组', width: 120, visible: true },
  { key: 'originHoleNo', label: '样品对应号', width: 100, visible: true },
  { key: 'sampleId', label: '样品编号', width: 120, visible: true },
  { key: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'primerConcentration', label: '引物浓度', width: 100, visible: true },
  { key: 'sampleType', label: '样品类型', width: 100, visible: true },
  { key: 'carrierName', label: '载体名称', width: 120, visible: true },
  { key: 'fragmentSize', label: '片段大小', width: 100, visible: true },
  { key: 'isFullLength', label: '是否测透', width: 100, visible: true },
  { key: 'originConcentration', label: '原浓度', width: 100, visible: true },
  { key: 'completionStatus', label: '完成情况', width: 100, visible: true },
  { key: 'returnState', label: '返回状态', width: 100, visible: true },
  { key: 'remark', label: '备注', width: 150, showOverflowTooltip: true, visible: true },
  { key: 'flowName', label: '流程名称', width: 100, visible: true },
  { key: 'plateNo', label: '板号', width: 100, visible: true },
  { key: 'holeNo', label: '孔号', width: 80, visible: true }
])

// 检索配置
const searchFields = ref([
  { prop: 'name', label: '名称', type: 'input' },
  { prop: 'status', label: '状态', type: 'select', options: [{ label: '正常', value: '0' }, { label: '停用', value: '1' }] }
])

// 列可见性缓存
const cacheKey = 'sequencing_report_columns_visible'
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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined
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
  listReport(queryParams.value).then(response => {
    dataList.value = response.rows
    total.value = response.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
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
  title.value = '添加报告生产'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getReport(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改报告生产'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateReport(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addReport(form.value).then(response => {
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
    return delReport(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/report/export', {
    ...queryParams.value
  }, `report_${new Date().getTime()}.xlsx`)
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
</style>
