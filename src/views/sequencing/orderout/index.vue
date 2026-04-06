<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Plus" @click="handleAdd">添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Edit" :disabled="single" @click="handleUpdate"
          >编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Coin" @click="handleOrderPayment">订单款项</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Delete" @click="handleOrderClear">订单清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="PriceTag" @click="handleInvoice">开票</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Notebook" @click="handleWeeklyReport">周报</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Management" @click="handleGroupConfirmation"
          >课题组客户确认单</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="ShoppingCart" @click="handleDeliveryNote">送货单</el-button>
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
      @select="handleSelect"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" width="900px" append-to-body top="8vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">{{ title }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderId">
              <el-input v-model="form.orderId" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户ID" prop="customerId">
              <el-input v-model="form.customerId" placeholder="请输入客户ID" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户地址" prop="customerAddress">
              <el-input v-model="form.customerAddress" placeholder="请输入客户地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课题组" prop="groupName">
              <el-input v-model="form.groupName" placeholder="请输入课题组" />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户等级" prop="customerLevel">
              <el-input v-model="form.customerLevel" placeholder="请输入客户等级" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试测" prop="isTest">
              <el-input v-model="form.isTest" placeholder="请输入试测状态" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="信息不全" prop="incompleteInfo">
              <el-select v-model="form.incompleteInfo" placeholder="请选择信息完整性" style="width: 100%">
                <el-option label="信息完整" value="完整" />
                <el-option label="信息缺失" value="缺失" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="订单信息" prop="orderInfo">
              <el-input v-model="form.orderInfo" placeholder="请输入数据..." />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加急" prop="isUrgent">
              <el-radio-group v-model="form.isUrgent">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="送样时间" prop="deliveryTime">
              <el-date-picker
                v-model="form.deliveryTime"
                type="datetime"
                placeholder="请选择日期时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注内容" />
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
  </div>
</template>

<script setup name="OrderOut">
import { ref, reactive, toRefs, onMounted, getCurrentInstance } from 'vue'
import { Check, Close, EditPen } from '@element-plus/icons-vue'
import { listOrder } from '@/api/sequencing/order'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const { proxy } = getCurrentInstance()

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 150, fixed: true, sortable: true, visible: true },
  { prop: 'customerId', label: '客户ID', minWidth: 80, visible: true },
  { prop: 'customerName', label: '客户姓名', minWidth: 120, fixed: true, showOverflowTooltip: true, visible: true },
  { prop: 'customerAddress', label: '客户地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { prop: 'generation', label: '测序代数', minWidth: 90, visible: true },
  { prop: 'groupId', label: '课题组ID', minWidth: 80, visible: true },
  { prop: 'groupName', label: '课题组', minWidth: 140, showOverflowTooltip: true, visible: true },
  { prop: 'orderType', label: '订单类型', minWidth: 110, visible: true },
  { prop: 'endTime', label: '结束时间', minWidth: 180, visible: true },
  { prop: 'orderInfo', label: '订单信息', minWidth: 150, visible: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true },
  { prop: 'orderStatus', label: '订单状态', minWidth: 100, visible: true },
  { prop: 'createBy', label: '添加人', minWidth: 100, visible: true }
])

const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'createBy', label: '添加人', type: 'input' },
  {
    prop: 'orderStatus',
    label: '订单状态',
    type: 'select',
    options: [
      { label: '订单生成', value: '订单生成' },
      { label: '订单出库', value: '订单出库' },
      { label: '订单完成', value: '订单完成' }
    ]
  }
])

const dataList = ref([])
const total = ref(0)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const open = ref(false)
const formRef = ref(null)
const searchRef = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    customerName: undefined,
    createBy: undefined,
    orderStatus: undefined
  },
  rules: {
    orderId: [{ required: true, message: '订单号不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listOrder(queryParams.value)
    .then(response => {
      dataList.value = response.data.rows
      total.value = response.data.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索 & 刷新 */
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

function handleSelect(selection) {
  ids.value = selection.map(item => item.orderId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 基础 CRUD 手柄 */
function reset() {
  form.value = {
    orderId: undefined,
    customerId: undefined,
    customerName: undefined,
    customerAddress: undefined,
    groupName: undefined,
    customerLevel: undefined,
    isTest: undefined,
    incompleteInfo: undefined,
    orderInfo: undefined,
    isUrgent: '0',
    deliveryTime: undefined,
    remark: undefined
  }
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '添加订单出库'
}

function handleUpdate(row) {
  reset()
  const id = row.orderId || ids.value[0]
  // 这里可以调用接口获取详情
  form.value.orderId = id
  open.value = true
  title.value = '修改订单出库'
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    }
  })
}

function cancel() {
  open.value = false
  reset()
}

/** 业务扩展手柄 */
function handleOrderPayment() {
  proxy.$modal.msg('订单款项功能开发中...')
}

function handleOrderClear() {
  proxy.$modal.msg('订单清空功能开发中...')
}

function handleInvoice() {
  proxy.$modal.msg('开票功能开发中...')
}

function handleWeeklyReport() {
  proxy.$modal.msg('周报功能开发中...')
}

function handleGroupConfirmation() {
  proxy.$modal.msg('课题组客户确认单功能开发中...')
}

function handleDeliveryNote() {
  proxy.$modal.msg('送货单功能开发中...')
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
