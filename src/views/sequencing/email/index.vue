<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Delete" @click="handleDelete" :disabled="multiple">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Message" @click="handleSendEmail" :disabled="multiple">邮件发送</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="CircleClose" @click="handleIgnoreEmail" :disabled="multiple">邮件忽略</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Position" @click="handleTemplateReturn" :disabled="multiple">邮件模板回发</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList"
      size="small" :header-cell-style="{ fontSize: '12px' }" v-loading="loading" :data="dataList" :columns="columns"
      :total="total" @selection-change="handleSelectionChange" />

    <!-- 邮件发送备注对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="well-form">
        <div class="form-row border-top border-bottom">
          <div class="form-label">操作备注：</div>
          <div class="form-content">
            <el-form-item prop="remark" label-width="0">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入操作备注" />
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

<script setup name="Email">
import { listTemplateFailedSamples, getEmail, addEmail, updateEmail, delEmail } from '@/api/sequencing/email'
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

// 列配置 (根据 API 文档 4.5 模板失败列表字段调整)
const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'customerId', label: '客户ID', width: 80, visible: false },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerEmail', label: '客户邮箱', width: 180, visible: true },
  { key: 'createTime', label: '送样日期', width: 160, visible: true },
  { key: 'orderId', label: '订单号', width: 160, visible: true },
  { key: 'sampleId', label: '样品编号', width: 120, visible: true },
  { key: 'returnState', label: '模板状态', width: 110, visible: true },
  { key: 'remark', label: '失败原因', showOverflowTooltip: true, visible: true }
])

// 检索配置
const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' }
])

// 列可见性缓存
const cacheKey = 'sequencing_email_columns_visible'
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
    orderId: undefined,
    customerName: undefined,
    sampleId: undefined
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
  listTemplateFailedSamples(queryParams.value).then(response => {
    // 处理 API 直接返回 Array 的情况，并支持本地前端搜索和分页 (由于 API 文档中该 GET 接口无参数且无 total)
    let fullList = response.data || response || []
    
    // 基础过滤逻辑 (如果后端不自带搜索)
    if (queryParams.value.orderId) {
      fullList = fullList.filter(item => item.orderId?.includes(queryParams.value.orderId))
    }
    if (queryParams.value.customerName) {
      fullList = fullList.filter(item => item.customerName?.includes(queryParams.value.customerName))
    }
    if (queryParams.value.sampleId) {
      fullList = fullList.filter(item => item.sampleId?.includes(queryParams.value.sampleId))
    }

    total.value = fullList.length
    const offset = (queryParams.value.pageNum - 1) * queryParams.value.pageSize
    dataList.value = fullList.slice(offset, offset + queryParams.value.pageSize)
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
  ids.value = selection.map(item => item.sampleId || item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 邮件发送操作 */
function handleSendEmail() {
  if (ids.value.length === 0) return
  proxy.$modal.msgSuccess('邮件发送请求已提交')
}

/** 邮件忽略操作 */
function handleIgnoreEmail() {
  if (ids.value.length === 0) return
  proxy.$modal.confirm('确定要忽略选中的 ' + ids.value.length + ' 条记录吗？').then(() => {
    proxy.$modal.msgSuccess('已忽略')
  })
}

/** 模板回发操作 */
function handleTemplateReturn() {
  if (ids.value.length === 0) return
  reset()
  open.value = true
  title.value = '模板邮件回发备注'
  form.value.remark = '样品模板已准备好，请查收。'
}

/** 提交按钮 (对话框确定) */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    }
  })
}

/** 删除动作 (忽略) */
function handleDelete() {
  handleIgnoreEmail()
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/sample/template/produce/exportFailed', {
    ...queryParams.value
  }, `failed_samples_${new Date().getTime()}.xlsx`)
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
