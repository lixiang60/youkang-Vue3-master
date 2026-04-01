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
        <el-button size="small" type="success" plain icon="Message" :disabled="multiple" @click="handleSendEmail"
          >邮件发送</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="CircleClose" :disabled="multiple" @click="handleIgnoreEmail"
          >邮件忽略</el-button
        >
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
    />

    <!-- 邮件发送备注对话框 -->
    <el-dialog v-model="open" :title="title" width="500px" append-to-body>
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
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Email">
import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import { listEmailProduce, addEmail, updateEmail, delEmail } from '@/api/sequencing/email'

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

// 列配置 (根据截图及标准生产字段调整)
const columns = ref([
  { type: 'selection', key: 'selection', width: 50, fixed: true, visible: true },
  { key: 'produceId', prop: 'produceId', label: '生产编号', width: 120, fixed: true, visible: true },
  { key: 'orderId', prop: 'orderId', label: '订单号', width: 160, fixed: true, visible: true },
  { key: 'customerName', prop: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerAddress', prop: 'customerAddress', label: '客户地址', width: 150, visible: true },
  { key: 'orderType', prop: 'orderType', label: '订单类型', width: 100, visible: true },
  { key: 'customerLevel', prop: 'customerLevel', label: '客户等级', width: 80, visible: true },
  { key: 'reagent', prop: 'reagent', label: '试剂', width: 100, visible: true },
  { key: 'urgent', prop: 'urgent', label: '加急', width: 80, visible: true },
  { key: 'sampleId', prop: 'sampleId', label: '样品编号', width: 120, visible: true },
  { key: 'primer', prop: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'primerConcentration', prop: 'primerConcentration', label: '引物浓度', width: 80, visible: true },
  { key: 'sampleType', prop: 'sampleType', label: '样品类型', width: 80, visible: true },
  { key: 'antibioticType', prop: 'antibioticType', label: '抗生素类型', width: 100, visible: true },
  { key: 'isAsync', prop: 'isAsync', label: '是否测试', width: 80, visible: true },
  { key: 'originConcentration', prop: 'originConcentration', label: '原浓度', width: 100, visible: true },
  { key: 'produceStatus', prop: 'produceStatus', label: '完成情况', width: 100, visible: true },
  { key: 'returnState', prop: 'returnState', label: '退回状态', width: 100, visible: true },
  { key: 'remark', prop: 'remark', label: '备注', width: 150, showOverflowTooltip: true, visible: true },
  { key: 'flowId', prop: 'flowId', label: '流程ID', width: 100, visible: true },
  { key: 'flowName', prop: 'flowName', label: '流程名称', width: 100, visible: true }
])

// 检索配置
const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' }
])

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
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listEmailProduce(queryParams.value)
    .then(response => {
      const res = response.data || response
      const finalData = res.data && res.data.rows ? res.data : res
      dataList.value = finalData.rows || []
      total.value = finalData.total || 0
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
  proxy.download(
    'order/sample/template/produce/exportFailed',
    {
      ...queryParams.value
    },
    `failed_samples_${new Date().getTime()}.xlsx`
  )
}

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

.table-header-bar {
  background: #f5f7fa;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-top: 10px;
  color: #333;
}

:deep(.el-table) {
  border: 1px solid #dcdfe6;
}
</style>
