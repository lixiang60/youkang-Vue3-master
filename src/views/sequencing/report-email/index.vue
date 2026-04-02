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
        <el-button size="small" type="success" plain icon="Message" :disabled="multiple" @click="handleSendEmail">
          邮件发送
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="CircleClose" :disabled="multiple" @click="handleIgnoreEmail">
          邮件忽略
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          size="small"
          type="success"
          plain
          icon="Promotion"
          :disabled="multiple"
          @click="handleTemplateReturn"
        >
          邮件模板回发
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">
          删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
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
    >
      <template #download="{ row }">
        <el-link v-if="row.downloadUrl" type="primary" :underline="false" @click="handleDownload(row)"> 下载 </el-link>
        <span v-else>-</span>
      </template>
    </dynamic-table>

    <!-- 邮件发送备注对话框 -->
    <el-dialog v-model="open" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">{{ title }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="well-form">
        <div class="form-row border-top border-bottom">
          <div class="form-label">操作备注：</div>
          <div class="form-content">
            <el-form-item prop="remark" label-width="0">
              <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入操作备注" />
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

<script setup name="ReportEmail">
import { ref, reactive, toRefs, onMounted, getCurrentInstance, onActivated } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import { listReportEmailProduce } from '@/api/sequencing/email'

const { proxy } = getCurrentInstance()

// --- 1. Constants & Config ---
const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'id', label: '标示', minWidth: 100, fixed: true, visible: true },
  { key: 'salesman', label: '销售员', minWidth: 100, visible: true },
  { key: 'customerId', label: '客户ID', minWidth: 100, visible: true },
  { key: 'customerName', label: '客户姓名', minWidth: 100, visible: true },
  { key: 'orderId', label: '订单号', minWidth: 150, visible: true },
  { key: 'plateNo', label: '版号', minWidth: 120, visible: true },
  { key: 'emailTitle', label: '邮件标题', minWidth: 200, showOverflowTooltip: true, visible: true },
  { key: 'fileSize', label: '文件大小', minWidth: 100, visible: true },
  { key: 'attachUrl', label: '附件地址', minWidth: 150, showOverflowTooltip: true, visible: true },
  { key: 'isSend', label: '是否发送', minWidth: 100, visible: true },
  { key: 'remark', label: '备注', minWidth: 120, showOverflowTooltip: true, visible: true },
  { key: 'createBy', label: '添加人', minWidth: 100, visible: true },
  { key: 'createTime', label: '添加时间', minWidth: 160, visible: true },
  { key: 'downloadUrl', label: '下载', minWidth: 80, slot: 'download', visible: true },
  { key: 'sendBy', label: '发送人', minWidth: 100, visible: true },
  { key: 'sendTime', label: '发送时间', minWidth: 160, visible: true },
  { key: 'sendResult', label: '发送结果', minWidth: 100, visible: true },
  { key: 'failureReason', label: '失败原因', minWidth: 150, showOverflowTooltip: true, visible: true },
  { key: 'companyName', label: '所属公司', minWidth: 150, visible: true }
])

const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'plateNo', label: '版号', type: 'input' },
  {
    prop: 'isSend',
    label: '是否发送',
    type: 'select',
    options: [
      { label: '是', value: '1' },
      { label: '否', value: '0' }
    ]
  }
])

const rules = {
  remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
}

// --- 2. State ---
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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    customerName: undefined,
    plateNo: undefined,
    isSend: undefined
  }
})

const { queryParams, form } = toRefs(data)

// --- 3. Methods ---
/** 查询列表 */
function getList() {
  loading.value = true
  listReportEmailProduce(queryParams.value)
    .then(response => {
      const res = response.data || response
      dataList.value = res.rows || []
      total.value = res.total || 0
      loading.value = false
    })
    .catch(() => {
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
    remark: undefined
  }
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
  ids.value = selection.map(item => item.produceId || item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 报告发送操作 */
function handleSendEmail() {
  if (ids.value.length === 0) return
  title.value = '报告邮件发送确认'
  form.value.remark = '报告已生成，请在附件中查收。'
  open.value = true
}

/** 邮件忽略操作 */
function handleIgnoreEmail() {
  if (ids.value.length === 0) return
  proxy.$modal.confirm('确定要忽略选中的 ' + ids.value.length + ' 条记录吗？').then(() => {
    proxy.$modal.msgSuccess('操作成功')
  })
}

/** 邮件模板回发操作 */
function handleTemplateReturn() {
  if (ids.value.length === 0) return
  const currentId = ids.value[0]
  reset()
  open.value = true
  title.value = '邮件模板已准备好，请查收'
  form.value.id = currentId
  form.value.remark = '样品模板已准备好，请查收。'
}

/** 删除操作 */
function handleDelete() {
  const selectionIds = ids.value
  if (!selectionIds.length) return
  proxy.$modal.confirm('确定要删除选中的 ' + selectionIds.length + ' 条记录吗？').then(() => {
    proxy.$modal.msgSuccess('删除成功')
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    }
  })
}

/** 下载操作 */
function handleDownload(row) {
  if (!row.downloadUrl) return
  // 使用通用下载工具或直接跳转
  window.open(row.downloadUrl, '_blank')
}

// --- 4. Lifecycle ---
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
  width: 140px;
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
  padding: 10px;
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
