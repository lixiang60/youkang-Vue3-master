<template>
  <div class="app-container">
    <!-- 1. 查询面板 (控制折叠显示) -->
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 2. 操作按钮区 (参考 order/index.vue 布局及样式) -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain :icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain :icon="Message" :disabled="multiple" @click="handleSendEmail">
          邮件发送
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          size="small"
          type="warning"
          plain
          :icon="CircleCheck"
          :disabled="multiple"
          @click="handleIgnoreEmail"
        >
          邮件忽略
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList" />
    </el-row>

    <!-- 3. 动态表格区 (保持简洁，遵循 order 模块规范) -->
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
    >
      <!-- 下载插槽 -->
      <template #download="{ row }">
        <el-link v-if="row.downloadUrl" type="primary" :underline="false" @click="handleDownload(row)"> 下载 </el-link>
        <span v-else>-</span>
      </template>
    </dynamic-table>

    <!-- 4. 报告邮件发送对话框 (根据新规范：原生宽绰表单) -->
    <el-dialog v-model="visible" width="700px" append-to-body top="10vh" :close-on-click-modal="false">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #67c23a; font-size: 20px">
            <Message />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">报告邮件发送</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="订单号">
              <span style="color: #f56c6c; font-weight: bold">
                选中数量：{{ ids.length }}，选中标示：{{ selectedOrderIds.join(', ') }}
              </span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="内容模板" prop="templateId">
              <el-select v-model="form.templateId" placeholder="请选择内容模板" style="width: 100%">
                <el-option v-for="item in templateOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入操作备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 5. 忽略报告邮件发送对话框 -->
    <el-dialog v-model="openIgnore" width="700px" append-to-body top="10vh" :close-on-click-modal="false">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #e6a23c; font-size: 20px">
            <Warning />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">忽略报告邮件发送</span>
        </div>
      </template>
      <el-form ref="ignoreFormRef" :model="ignoreForm" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="订单号">
              <span style="color: #f56c6c; font-weight: bold">
                选中数量：{{ ids.length }}，选中标示：{{ selectedOrderIds.join(', ') }}
              </span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="ignoreForm.remark" type="textarea" :rows="4" placeholder="请输入忽略原因/备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitIgnoreForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancelIgnore">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ReportEmail">
import { ref, reactive, toRefs, onMounted, getCurrentInstance, watch, computed } from 'vue'
import { Search, Refresh, Message, CircleCheck, Check, Close, Warning } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import { listReportEmailProduce } from '@/api/sequencing/email'

const { proxy } = getCurrentInstance()

// --- 1. Constants & Config ---
const columns = ref([
  { type: 'selection', width: 40, fixed: true, visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 150, sortable: true, fixed: true, visible: true },
  { prop: 'customerId', label: '客户ID', minWidth: 100, visible: true },
  { prop: 'customerName', label: '客户名', minWidth: 120, visible: true },
  { prop: 'customerAddress', label: '客户地址', minWidth: 200, showOverflowTooltip: true, visible: true },
  { prop: 'customerLevel', label: '客户等级', minWidth: 100, visible: true },
  { prop: 'teamName', label: '课题组', minWidth: 120, visible: true },
  { prop: 'orderTime', label: '订货日期', minWidth: 130, visible: true },
  { prop: 'isUrgent', label: '加急', minWidth: 80, visible: true },
  { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true, visible: true },
  { prop: 'createBy', label: '添加人', minWidth: 100, visible: true },
  { prop: 'createTime', label: '添加时间', minWidth: 160, visible: true },
  { prop: 'isEmailReply', label: '邮件回复', minWidth: 90, visible: true },
  { prop: 'replyBy', label: '回复人', minWidth: 100, visible: true },
  { prop: 'replyTime', label: '回复时间', minWidth: 160, visible: true },
  { prop: 'orderStatus', label: '订单状态', minWidth: 100, visible: true },
  { prop: 'paymentStatus', label: '付款状态', minWidth: 100, visible: true },
  { prop: 'paymentTime', label: '付款时间', minWidth: 160, visible: true },
  { prop: 'paidBy', label: '付款人', minWidth: 100, visible: true },
  { prop: 'printCount', label: '打印次数', minWidth: 90, visible: true },
  { prop: 'orderMode', label: '订单模式', minWidth: 100, visible: true },
  { prop: 'affiliatedCompany', label: '所属公司', minWidth: 100, visible: true },
  { prop: 'productionCompany', label: '生产公司', minWidth: 100, visible: true }
])

const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
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

const templateOptions = ref([
  { label: '标准报告邮件模板', value: '1' },
  { label: '加急通知模板', value: '2' }
])

const rules = {
  templateId: [{ required: true, message: '请选择内容模板', trigger: 'change' }],
  remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }]
}

// --- 2. State ---
const data = reactive({
  loading: true,
  ids: [],
  selectedOrderIds: [],
  multiple: true,
  total: 0,
  dataList: [],
  open: false,
  openIgnore: false,
  showSearch: false,
  queryParams: { pageNum: 1, pageSize: 20 },
  form: {},
  ignoreForm: {}
})

const {
  loading,
  dataList,
  total,
  queryParams,
  ids,
  selectedOrderIds,
  multiple,
  open,
  openIgnore,
  form,
  ignoreForm,
  showSearch
} = toRefs(data)

// 双向绑定 visible (参照 order 模块)
const visible = computed({
  get: () => open.value,
  set: val => (open.value = val)
})

// --- 3. Methods ---
function getList() {
  loading.value = true
  listReportEmailProduce(queryParams.value)
    .then(res => {
      dataList.value = res.rows
      total.value = res.total
      loading.value = false
    })
    .catch(() => {
      // 模拟数据填充
      setTimeout(() => {
        dataList.value = [
          {
            id: 1,
            orderId: '2026041700100',
            customerId: '61068',
            customerName: '伍义',
            customerAddress: '交大生科4B419',
            customerLevel: '普1',
            teamName: '刘天明',
            orderTime: '2026-04-17 00:15',
            isUrgent: '否',
            remark: '',
            createBy: '邵海洋',
            createTime: '2026-04-17 00:15',
            isEmailReply: '否',
            replyBy: '',
            replyTime: '',
            orderStatus: '订单生成',
            paymentStatus: '否',
            paymentTime: '',
            paidBy: '',
            printCount: 0,
            orderMode: 'OD模式',
            affiliatedCompany: '有康科技',
            productionCompany: '有康生产部'
          },
          {
            id: 2,
            orderId: '2026041700101',
            customerId: '61070',
            customerName: '李华',
            customerAddress: '清华大学实验楼',
            customerLevel: '优2',
            teamName: '陈教授',
            orderTime: '2026-04-17 01:20',
            isUrgent: '是',
            remark: '急件',
            createBy: '王小二',
            createTime: '2026-04-17 01:20',
            isEmailReply: '是',
            replyBy: '张三',
            replyTime: '2026-04-17 01:30',
            orderStatus: '已回复',
            paymentStatus: '是',
            paymentTime: '2026-04-17 01:25',
            paidBy: '李华',
            printCount: 2,
            orderMode: '标准模式',
            affiliatedCompany: '有康科技',
            productionCompany: '有康生产部'
          }
        ]
        total.value = 2
        loading.value = false
      }, 500)
    })
}

function toggleSearchPanel() {
  proxy.$refs.searchRef?.toggleCollapse()
}
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('数据已刷新')
}
function handleSelectionChange(val) {
  ids.value = val.map(i => i.id)
  selectedOrderIds.value = val.map(i => i.orderId)
  multiple.value = !val.length
}

function handleSendEmail() {
  if (ids.value.length === 0) return
  reset()
  open.value = true
}

function handleIgnoreEmail() {
  if (ids.value.length === 0) return
  resetIgnore()
  openIgnore.value = true
}

function resetIgnore() {
  ignoreForm.value = { remark: undefined }
  if (proxy.$refs.ignoreFormRef) proxy.$refs.ignoreFormRef.resetFields()
}

function submitIgnoreForm() {
  proxy.$refs.ignoreFormRef.validate(valid => {
    if (valid) {
      proxy.$modal.msgWarning('API接入中...')
      openIgnore.value = false
      getList()
    }
  })
}

function cancelIgnore() {
  openIgnore.value = false
}

function reset() {
  form.value = { templateId: undefined, remark: undefined }
  if (proxy.$refs.formRef) proxy.$refs.formRef.resetFields()
}

function submitForm() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      proxy.$modal.msgWarning('API接入中...')
      open.value = false
      getList()
    }
  })
}

function cancel() {
  open.value = false
}
function handleDownload(row) {
  if (row.downloadUrl) window.open(row.downloadUrl, '_blank')
}

// --- 4. Lifecycle ---
onMounted(() => {
  const stored = localStorage.getItem('report-email-columns')
  if (stored) {
    const parsed = JSON.parse(stored)
    columns.value.forEach((col, i) => {
      if (parsed[i] && parsed[i].prop === col.prop) col.visible = parsed[i].visible
    })
  }
  getList()
})

// --- 5. Watchers ---
watch(
  columns,
  val => {
    localStorage.setItem('report-email-columns', JSON.stringify(val))
  },
  { deep: true }
)
</script>

<style scoped>
/* 1. 表格风格压制 (参照 order/index.vue) */
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
  padding: 4px 0 !important;
}

:deep(.el-table--small .cell) {
  padding-left: 6px !important;
  padding-right: 6px !important;
}

.mb8 {
  margin-bottom: 8px;
}

/* 废弃的 well-form 样式已清除，使用原生 el-form 呼吸感布局 */
</style>
