<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮区 -->
    <el-row :gutter="10" class="mb8" align="middle" style="flex-wrap: wrap; row-gap: 10px">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:manage:add']"
          size="small"
          type="primary"
          plain
          :icon="Plus"
          @click="handleAdd"
          >添加</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:manage:password']"
          size="small"
          type="warning"
          plain
          :icon="Key"
          :disabled="single"
          @click="handleResetPassword"
          >修改密码</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:manage:edit']"
          size="small"
          type="success"
          plain
          :icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          >编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:manage:remove']"
          size="small"
          type="danger"
          plain
          :icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain :icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:manage:gift']"
          size="small"
          type="info"
          plain
          :icon="ShoppingCart"
          @click="handlePurchaseGift"
          >购买礼品</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:manage:points']"
          size="small"
          type="primary"
          plain
          :icon="Medal"
          @click="handleExchangePoints"
          >转变积分</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:manage:reminder']"
          size="small"
          type="warning"
          plain
          :icon="Bell"
          @click="handleCustomerReminder"
          >提醒设置</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      size="small"
      :loading="loading"
      :data="dataList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    >
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span>
      </template>
      <template #status="{ row }">
        <el-tag :type="(row.status ?? '1') == 1 ? 'success' : 'danger'">
          {{ (row.status ?? '1') == 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
      <template #actions="{ row }">
        <el-button
          v-hasPermi="['customer:manage:password']"
          link
          type="primary"
          :icon="Key"
          @click="handleResetPassword(row)"
          >修改密码</el-button
        >
        <el-button v-hasPermi="['customer:manage:edit']" link type="primary" :icon="Edit" @click="handleUpdate(row)"
          >编辑</el-button
        >
      </template>
    </dynamic-table>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" :title="title" width="900px" append-to-body>
      <div class="well-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="0px" size="small">
          <div class="form-row">
            <div class="form-label">姓名客户：</div>
            <div class="form-content">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名"></el-input>
            </div>
            <div class="form-label">所属公司：</div>
            <div class="form-content">
              <el-select v-model="form.company" placeholder="请选择所属公司" style="width: 100%">
                <el-option
                  v-for="item in COMPANY_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">地区：</div>
            <div class="form-content">
              <el-select v-model="form.region" placeholder="请选择地区" style="width: 100%">
                <el-option
                  v-for="item in REGION_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
            <div class="form-label">地址：</div>
            <div class="form-content">
              <el-input v-model="form.address" placeholder="请输入详细地址"></el-input>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">课题组：</div>
            <div class="form-content">
              <div style="display: flex; gap: 10px">
                <el-input v-model="form.subjectGroupName" placeholder="请输入课题组" readonly></el-input>
                <el-button icon="Search" circle @click="openSubjectGroupSelector"></el-button>
              </div>
            </div>
            <div class="form-label">手机：</div>
            <div class="form-content">
              <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11"></el-input>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">邮箱：</div>
            <div class="form-content">
              <el-input v-model="form.email" placeholder="请输入邮箱地址"></el-input>
            </div>
            <div class="form-label">微信ID：</div>
            <div class="form-content">
              <el-input v-model="form.wechatId" placeholder="请输入微信ID"></el-input>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">等级：</div>
            <div class="form-content">
              <el-select v-model="form.customerLevel" placeholder="请选择等级" style="width: 100%">
                <el-option label="普通" value="普通"></el-option>
                <el-option label="VIP1" value="VIP1"></el-option>
                <el-option label="VIP2" value="VIP2"></el-option>
                <el-option label="VIP3" value="VIP3"></el-option>
              </el-select>
            </div>
            <div class="form-label">状态：</div>
            <div class="form-content">
              <el-radio-group v-model="form.status">
                <el-radio label="1">启用</el-radio>
                <el-radio label="0">禁用</el-radio>
              </el-radio-group>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">销售员：</div>
            <div class="form-content">
              <div style="display: flex; gap: 10px">
                <el-input v-model="form.salesPerson" placeholder="请输入销售员"></el-input>
                <el-button icon="Search" circle @click="openSalesPersonSelector"></el-button>
              </div>
            </div>
            <div class="form-label">客户单位：</div>
            <div class="form-content">
              <el-input v-model="form.customerUnit" placeholder="请输入客户单位"></el-input>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">结算方式：</div>
            <div class="form-content">
              <dynamic-selector
                v-model="form.paymentMethod"
                type="paymentMethod"
                placeholder="请选择结算方式"
              ></dynamic-selector>
            </div>
            <div class="form-label">发票种类：</div>
            <div class="form-content">
              <dynamic-selector
                v-model="form.invoiceType"
                type="invoiceType"
                placeholder="请选择发票种类"
              ></dynamic-selector>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">备注：</div>
            <div class="form-content">
              <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 课题组选择组件 -->
    <subject-group-selector
      v-model="showSubjectGroupSelector"
      :selected-id="form.subjectGroupId"
      @confirm="handleSubjectGroupSelect"
    />

    <!-- 销售员选择组件 -->
    <sales-person-selector
      v-model="showSalesPersonSelector"
      :selected-name="form.salesPerson"
      @confirm="handleSalesPersonSelect"
    />

    <el-dialog v-model="resetPwdOpen" width="400px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; gap: 5px">
          <el-icon><Key /></el-icon>
          <span>修改密码</span>
        </div>
      </template>
      <div class="well-form">
        <el-form ref="resetPwdFormRef" :model="resetPwdForm" :rules="resetPwdRules" label-width="0px" size="small">
          <div class="form-row">
            <div class="form-label">登录名：</div>
            <div class="form-content">
              <span>{{ resetPwdForm.loginName }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">新密码：</div>
            <div class="form-content">
              <el-input
                v-model="resetPwdForm.password"
                type="password"
                placeholder="请输入新密码"
                show-password
              ></el-input>
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitResetPassword">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancelResetPassword">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Manage">
import { listManage, getManage, addManage, updateManage, delManage } from '@/api/customer/manage'
import { ref, reactive, toRefs, onMounted, onActivated, getCurrentInstance } from 'vue'
import { COMPANY_OPTIONS, REGION_OPTIONS } from '@/utils/constant'
import SubjectGroupSelector from '@/views/customer/components/SubjectGroupSelector.vue'
import SalesPersonSelector from '@/views/customer/components/SalesPersonSelector.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import DynamicSelector from '@/components/DynamicSelector/index.vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  ShoppingCart,
  Medal,
  Bell,
  Key,
  Check,
  Close
} from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const dataList = ref([])
const open = ref(false)
const showSubjectGroupSelector = ref(false)
const showSalesPersonSelector = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const formRef = ref(null)
const searchRef = ref(null)
const resetPwdFormRef = ref(null)

const resetPwdOpen = ref(false)
const resetPwdForm = reactive({
  id: undefined,
  loginName: '',
  password: ''
})
const resetPwdRules = reactive({
  password: [{ required: true, message: '新密码不能为空', trigger: 'blur' }]
})

const searchFields = ref([
  { prop: 'customerName', label: '客户名称', type: 'input' },
  { prop: 'phone', label: '手机号', type: 'input' },
  { prop: 'company', label: '所属公司', type: 'select', options: COMPANY_OPTIONS },
  { prop: 'region', label: '地区', type: 'select', options: REGION_OPTIONS },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' }
    ]
  }
])

// 列信息
const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'id', label: '客户ID', minWidth: 80, fixed: true, visible: true },
  { prop: 'customerName', label: '姓名昵称', minWidth: 120, fixed: true, showOverflowTooltip: true, visible: true },
  { prop: 'subjectGroupName', label: '课题组', minWidth: 140, showOverflowTooltip: true, visible: true },
  { prop: 'region', label: '地区', minWidth: 100, visible: true },
  { prop: 'address', label: '地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { prop: 'phone', label: '手机', minWidth: 130, visible: true },
  { prop: 'email', label: '邮箱', minWidth: 180, showOverflowTooltip: true, visible: true },
  { prop: 'wechatId', label: '微信ID', minWidth: 120, visible: true },
  { prop: 'customerLevel', label: '等级', minWidth: 100, visible: true },
  { prop: 'status', label: '状态', minWidth: 90, visible: true, slot: 'status', defaultValue: '1' },
  { prop: 'salesPerson', label: '销售员', minWidth: 110, visible: true },
  { prop: 'customerUnit', label: '客户单位', minWidth: 160, showOverflowTooltip: true, visible: true },
  { prop: 'invoiceType', label: '发票种类', minWidth: 160, visible: true },
  { prop: 'remarks', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true },
  { prop: 'createBy', label: '添加人', minWidth: 110, visible: true },
  { prop: 'createTime', label: '时间', minWidth: 130, visible: true, slot: 'createTime' },
  { prop: 'totalPoints', label: '总积分', minWidth: 100, visible: true },
  { prop: 'availablePoints', label: '可用积分', minWidth: 100, visible: true },
  { prop: 'usedPoints', label: '已使用积分', minWidth: 110, visible: true },
  { prop: 'frozenPoints', label: '冻结积分', minWidth: 100, visible: true },
  { prop: 'company', label: '所属公司', minWidth: 110, visible: true }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: undefined,
    phone: undefined,
    status: undefined
  },
  rules: {
    customerName: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listManage(queryParams.value)
    .then(response => {
      dataList.value = response.rows || (response.data && (response.data.rows || response.data.records)) || []
      total.value = response.total || (response.data && response.data.total) || 0
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    customerId: undefined,
    customerName: '',
    region: '',
    company: COMPANY_OPTIONS[0].value,
    address: '',
    subjectGroupId: '',
    subjectGroupName: '',
    phone: '',
    email: '',
    wechatId: '',
    customerLevel: '普通',
    status: '1',
    salesPerson: '',
    customerUnit: '',
    paymentMethod: '',
    invoiceType: '',
    remarks: ''
  }
  proxy.resetForm('formRef')
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

const selectedRows = ref([])

// --- 操作按钮对应函数 (同步自 UI 顺序) ---

/** 1. 添加按钮 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加客户'
}

/** 2. 修改密码按钮 */
function handleResetPassword(row) {
  // 优先直接使用传入的行数据，否则使用选中项
  const targetRow = row?.id ? row : selectedRows.value[0]
  if (!targetRow) {
    return
  }
  resetPwdForm.id = targetRow.id
  resetPwdForm.loginName = `${targetRow.customerName} | ${targetRow.region || ''}`
  resetPwdForm.password = ''
  resetPwdOpen.value = true
}

/** 提交修改密码 */
function submitResetPassword() {
  resetPwdFormRef.value.validate(valid => {
    if (valid) {
      proxy.$modal.msgWarning('API接入中...')
      // resetPwdOpen.value = false
    }
  })
}

/** 取消修改密码 */
function cancelResetPassword() {
  resetPwdOpen.value = false
  resetPwdForm.password = ''
}

/** 3. 修改/编辑按钮 */
function handleUpdate(row) {
  reset()
  const id = row?.id || ids.value[0]
  getManage(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改客户信息'
  })
}

/** 4. 删除按钮 */
function handleDelete(row) {
  const idList = row?.id || ids.value
  proxy.$modal
    .confirm('是否确认删除选中的客户数据？')
    .then(function () {
      return delManage(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 5. 查询逻辑 (搜索面板联动) */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

/** 6. 刷新按钮 */
function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

/** 7. 购买礼品按钮 */
function handlePurchaseGift() {
  proxy.$modal.msgInfo('功能开发中...')
}

/** 8. 转变积分按钮 */
function handleExchangePoints() {
  proxy.$modal.msgInfo('功能开发中...')
}

/** 9. 提醒设置按钮 */
function handleCustomerReminder() {
  proxy.$modal.msgInfo('功能开发中...')
}

// --- 业务逻辑回调 ---

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateManage(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addManage(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 课题组操作 */
function openSubjectGroupSelector() {
  showSubjectGroupSelector.value = true
}

function handleSubjectGroupSelect(group) {
  form.value.subjectGroupId = group.id
  form.value.subjectGroupName = group.name
}

/** 销售员操作 */
function openSalesPersonSelector() {
  showSalesPersonSelector.value = true
}

function handleSalesPersonSelect(user) {
  form.value.salesPerson = user.nickName
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
</style>
