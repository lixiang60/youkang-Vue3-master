<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮区 -->
    <el-row :gutter="10" class="mb8" align="middle" style="flex-wrap: wrap; row-gap: 10px">
      <el-col :span="1.5">
        <el-button size="small" plain :icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5" style="padding-left: 0; padding-right: 0; margin: 0 10px">
        <div style="border-right: 1px solid #dcdfe6; height: 16px"></div>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research_group:add']"
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
          v-hasPermi="['customer:research_group:edit']"
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
          v-hasPermi="['customer:research_group:remove']"
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
        <el-button size="small" type="info" plain :icon="Upload" @click="handleImport">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research_group:price']"
          size="small"
          type="warning"
          plain
          :icon="Money"
          @click="handleSetPrice"
          >设置价格</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research_group:reminder']"
          size="small"
          type="info"
          plain
          :icon="Bell"
          @click="handleReminderSettings"
          >提醒设置</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research_group:prepayment']"
          size="small"
          type="warning"
          plain
          :icon="Wallet"
          @click="handlePrepaymentSettings"
          >预付款设置</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research_group:batch']"
          size="small"
          type="primary"
          plain
          :icon="Document"
          @click="handleBatchEdit"
          >批量编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research_group:label']"
          size="small"
          plain
          :icon="Collection"
          @click="handleGeneLabel"
          >基因标签</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research_group:all_prices']"
          size="small"
          type="warning"
          plain
          :icon="Box"
          @click="handleAllPrices"
          >所有价格</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research_group:blank_price']"
          size="small"
          type="success"
          plain
          :icon="PriceTag"
          @click="handleBlankPrice"
          >空白价格</el-button
        >
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :loading="loading"
      size="small"
      :data="dataList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    >
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span>
      </template>
      <template #isEnabled="{ row }">
        <el-tag :type="row.status == 1 ? 'success' : 'danger'">
          {{ row.status == 1 ? '启用' : '停用' }}
        </el-tag>
      </template>
    </dynamic-table>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" :title="title" width="800px" append-to-body>
      <div class="well-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="0px">
          <div class="form-row">
            <div class="form-label">名称：</div>
            <div class="form-content">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </div>
            <div class="form-label">地区：</div>
            <div class="form-content">
              <el-input v-model="form.region" placeholder="请输入地区" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">业务员：</div>
            <div class="form-content">
              <el-input v-model="form.salesPerson" placeholder="请输入业务员" />
            </div>
            <div class="form-label">结算方式：</div>
            <div class="form-content">
              <el-select v-model="form.paymentMethod" placeholder="请选择结算方式" style="width: 100%">
                <el-option label="月结" value="月结" />
                <el-option label="现结" value="现结" />
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">发票抬头：</div>
            <div class="form-content">
              <el-input v-model="form.invoiceTitle" placeholder="请输入发票抬头" />
            </div>
            <div class="form-label">所属公司：</div>
            <div class="form-content">
              <el-input v-model="form.companyId" placeholder="请输入所属公司" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">联系人：</div>
            <div class="form-content">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
            </div>
            <div class="form-label">联系电话：</div>
            <div class="form-content">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">积分基数：</div>
            <div class="form-content">
              <el-input v-model="form.pointsBase" placeholder="请输入积分基数" />
            </div>
            <div class="form-label">积分金额：</div>
            <div class="form-content">
              <el-input v-model="form.pointsAmount" placeholder="请输入积分金额" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">联系地址：</div>
            <div class="form-content">
              <el-input v-model="form.contactAddress" placeholder="请输入联系地址" />
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

    <!-- 设置课题组费用弹窗 (图1) -->
    <el-dialog v-model="showPriceListDialog" title="设置课题组费用" width="1100px" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button size="small" type="success" plain icon="Plus" @click="handleAddPrice">添加</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button size="small" type="primary" plain icon="Edit" :disabled="priceSingle" @click="handleEditPrice"
            >编辑</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button size="small" type="danger" plain icon="Delete" :disabled="priceMultiple" @click="handleDeletePrice"
            >删除</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button size="small" type="warning" plain icon="Refresh" :disabled="priceSingle" @click="handleResetPrice"
            >重置</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button size="small" type="info" plain icon="Download" @click="handleAllPrices">所有价格</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button size="small" type="success" plain icon="Download" @click="handleBlankPrice">空白价格</el-button>
        </el-col>
      </el-row>

      <el-table
        v-loading="priceLoading"
        :data="priceList"
        border
        size="small"
        @selection-change="handlePriceSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="id" align="center" prop="id" width="80" />
        <el-table-column label="课题组ID" align="center" prop="groupId" width="100" />
        <el-table-column label="类别" align="center" prop="category" width="100" />
        <el-table-column label="收费名称" align="center" prop="chargeName" min-width="150" show-overflow-tooltip />
        <el-table-column label="价格" align="center" prop="unitPrice" width="100" />
        <el-table-column label="生效日期" align="center" prop="startDate" width="110" />
        <el-table-column label="失效日期" align="center" prop="endDate" width="110" />
        <el-table-column label="状态" align="center" prop="statusLabel" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态时间" align="center" prop="statusTime" width="150" />
        <el-table-column label="状态人" align="center" prop="statusBy" width="100" />
        <el-table-column label="添加人" align="center" prop="createBy" width="100" />
        <el-table-column label="添加时间" align="center" prop="createTime" width="150" />
      </el-table>

      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="showPriceListDialog = false">确定</el-button>
          <el-button type="danger" :icon="Close" @click="showPriceListDialog = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置客户费用弹窗 (图2) -->
    <el-dialog v-model="showAddPriceDialog" title="设置客户费用" width="700px" append-to-body>
      <div class="well-form">
        <el-form :model="priceForm" label-width="0px">
          <div class="form-row">
            <div class="form-label">收费名称：</div>
            <div class="form-content">
              <el-select v-model="priceForm.chargeName" placeholder="请选择收费名称" style="width: 100%">
                <el-option-group v-for="group in CHARGE_NAME_OPTIONS" :key="group.label" :label="group.label">
                  <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
                </el-option-group>
              </el-select>
            </div>
            <div class="form-label">价格：</div>
            <div class="form-content">
              <el-input v-model="priceForm.price" placeholder="请输入价格" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">生效日期：</div>
            <div class="form-content">
              <el-date-picker
                v-model="priceForm.startDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </div>
            <div class="form-label">失效日期：</div>
            <div class="form-content">
              <el-date-picker
                v-model="priceForm.endDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">备注：</div>
            <div class="form-content">
              <el-input v-model="priceForm.remark" type="textarea" :rows="4" placeholder="请输入备注内容" />
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitPriceForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="showAddPriceDialog = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置课题组提醒弹窗 -->
    <el-dialog v-model="showReminderDialog" title="设置课题组提醒" width="700px" append-to-body>
      <div class="well-form">
        <el-form :model="reminderForm" label-width="0px">
          <div class="form-row">
            <div class="form-label">课题组名称：</div>
            <div class="form-content">
              <el-input v-model="reminderForm.groupName" disabled />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">是否提醒：</div>
            <div class="form-content">
              <el-radio-group v-model="reminderForm.isReminder">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">提醒内容：</div>
            <div class="form-content">
              <el-input v-model="reminderForm.content" type="textarea" :rows="5" placeholder="请输入提醒内容" />
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitReminderForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="showReminderDialog = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 下载价格设置表弹窗 -->
    <el-dialog v-model="showExportPriceDialog" title="下载价格设置表" width="600px" append-to-body>
      <div class="well-form">
        <el-form :model="exportPriceForm" label-width="0px">
          <div class="form-row">
            <div class="form-label">导出类型：</div>
            <div class="form-content">
              <el-radio-group v-model="exportPriceForm.type">
                <el-radio label="all">全部价格</el-radio>
                <el-radio label="blank">未设置价格</el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitExportPriceForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="showExportPriceDialog = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入价格设置表弹窗 -->
    <el-dialog v-model="importOpen" title="导入价格设置表" width="600px" append-to-body :close-on-click-modal="false">
      <div class="well-form">
        <el-form label-width="0px">
          <div class="form-row">
            <div class="form-label">上传文件：</div>
            <div class="form-content">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :limit="1"
                accept=".xlsx, .xls"
                @on-change="handleFileChange"
              >
                <template #trigger>
                  <el-button type="primary">选择文件</el-button>
                </template>
                <template #tip>
                  <div class="el-upload__tip">请选择制作好的价格设置 Excel 表</div>
                </template>
              </el-upload>
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitImport">确定</el-button>
          <el-button type="danger" :icon="Close" @click="importOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Research_group">
import { ref, reactive, toRefs, onMounted, onActivated, getCurrentInstance } from 'vue'
import {
  listResearch_group,
  getResearch_group,
  addResearch_group,
  updateResearch_group,
  delResearch_group
} from '@/api/customer/research_group'
import { listPriceConfig, updatePriceConfig, resetPriceConfig } from '@/api/customer/priceConfig'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import { CHARGE_NAME_OPTIONS } from '@/utils/constant'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Upload,
  Money,
  Bell,
  Wallet,
  Document,
  Collection,
  Box,
  PriceTag,
  Check,
  Close
} from '@element-plus/icons-vue'

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
const formRef = ref(null)
const searchRef = ref(null)
const currentGroupId = ref(null)

// 导入相关
const importOpen = ref(false)
const importFile = ref(null)
const uploadRef = ref(null)

// 课题组费用设置相关
const showPriceListDialog = ref(false)
const priceLoading = ref(false)
const priceList = ref([])
const priceIds = ref([])
const priceSingle = ref(true)
const priceMultiple = ref(true)

// 单个价格设置相关
const showAddPriceDialog = ref(false)
const priceForm = ref({
  id: undefined,
  groupId: undefined,
  chargeName: '',
  unitPrice: '',
  startDate: '',
  endDate: '',
  remark: ''
})

// 提醒设置相关
const showReminderDialog = ref(false)
const reminderForm = ref({
  groupId: undefined,
  groupName: '',
  isReminder: '0',
  content: ''
})

// 导出价格相关
const showExportPriceDialog = ref(false)
const exportPriceForm = ref({
  type: 'all'
})

const searchFields = ref([
  { prop: 'name', label: '名称', type: 'input' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '启用', value: '1' },
      { label: '停用', value: '0' }
    ]
  }
])

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'id', label: 'ID', minWidth: 80, fixed: true, sortable: true, visible: true },
  { prop: 'name', label: '名称', minWidth: 140, fixed: true, showOverflowTooltip: true, visible: true },
  { prop: 'region', label: '地区', minWidth: 100, visible: true },
  { prop: 'salesPerson', label: '业务员', minWidth: 100, visible: true },
  { prop: 'paymentMethod', label: '结算方式', minWidth: 110, visible: true },
  { prop: 'invoiceTitle', label: '发票抬头', minWidth: 160, showOverflowTooltip: true, visible: true },
  { prop: 'companyName', label: '所属公司', minWidth: 140, showOverflowTooltip: true, visible: true },
  { prop: 'companyId', label: '所属公司ID', minWidth: 100, visible: true },
  { prop: 'contactPerson', label: '联系人', minWidth: 110, visible: true },
  { prop: 'contactPhone', label: '联系电话', minWidth: 130, visible: true },
  { prop: 'prepaymentSubject', label: '预付款课题', minWidth: 140, showOverflowTooltip: true, visible: true },
  { prop: 'contactAddress', label: '联系地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { prop: 'createTime', label: '添加时间', minWidth: 130, slot: 'createTime', visible: true },
  { prop: 'addedBy', label: '添加人', minWidth: 110, visible: true },
  { prop: 'pointsBase', label: '积分基数', minWidth: 100, visible: true },
  { prop: 'pointsAmount', label: '积分金额', minWidth: 100, visible: true },
  { prop: 'isReminder', label: '是否提醒', minWidth: 100, visible: true },
  { prop: 'reminderContent', label: '提醒内容', minWidth: 160, showOverflowTooltip: true, visible: true },
  { prop: 'geneLabelType', label: '基因标签类型', minWidth: 120, visible: true },
  { prop: 'labelTemplate', label: '标签模板', minWidth: 120, visible: true }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: '1'
  },
  rules: {
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listResearch_group(queryParams.value)
    .then(response => {
      dataList.value = response.rows || (response.data && (response.data.rows || response.data.records)) || []
      total.value = response.total || (response.data && response.data.total) || 0
      loading.value = false
    })
    .catch(() => {
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
    region: undefined,
    salesPerson: undefined,
    paymentMethod: undefined,
    invoiceTitle: undefined,
    companyId: undefined,
    contactPerson: undefined,
    contactPhone: undefined,
    contactAddress: undefined,
    status: '1',
    remark: undefined
  }
  proxy.resetForm('formRef')
}

/** 切换搜索面板 */
function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
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
  title.value = '添加课题组'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getResearch_group(id).then(response => {
    form.value = {
      ...response.data
    }
    open.value = true
    title.value = '修改课题组'
  })
}

/** 导入按钮操作 */
function handleImport() {
  importFile.value = null
  importOpen.value = true
}

function handleFileChange(file) {
  importFile.value = file
}

function submitImport() {
  if (!importFile.value) {
    proxy.$modal.msgWarning('请先选择要上传的文件')
    return
  }
  proxy.$modal.msgWarning('待接入后台导入API')
  importOpen.value = false
}

/** 设置价格按钮操作 */
function handleSetPrice() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置价格的课题组')
    return
  }
  currentGroupId.value = ids.value[0]
  showPriceListDialog.value = true
  // 调用真实接口
  priceLoading.value = true
  listPriceConfig(currentGroupId.value)
    .then(response => {
      // 映射字段以支持 UI
      priceList.value = (response.data || []).map(item => ({
        ...item,
        id: item.customId || item.templateId, // 统一使用 ID
        statusLabel: item.status === 1 ? '在用' : '停用'
      }))
      priceLoading.value = false
    })
    .catch(() => {
      priceLoading.value = false
    })
}

function handlePriceSelectionChange(selection) {
  priceIds.value = selection.map(item => item.id)
  priceSingle.value = selection.length !== 1
  priceMultiple.value = !selection.length
}

function handleAddPrice() {
  priceForm.value = {
    id: undefined,
    groupId: ids.value[0],
    chargeName: '',
    unitPrice: '',
    startDate: '',
    endDate: '',
    remark: ''
  }
  showAddPriceDialog.value = true
}

function handleEditPrice() {
  const selectRow = priceList.value.find(item => item.id === priceIds.value[0])
  if (selectRow) {
    priceForm.value = { ...selectRow }
    showAddPriceDialog.value = true
  }
}

function handleDeletePrice() {
  proxy.$modal.confirm('确定要删除选中的费用配置吗？').then(() => {
    proxy.$modal.msgSuccess('删除成功')
  })
}

/** 重置价格配置 (恢复模板默认值) */
function handleResetPrice() {
  const selectRow = priceList.value.find(item => item.id === priceIds.value[0])
  if (!selectRow || !selectRow.customId) {
    proxy.$modal.msgWarning('该配置已是模板默认值，无需重置')
    return
  }
  proxy.$modal.confirm('确定要重置该配置并恢复为模板默认值吗？').then(() => {
    resetPriceConfig(selectRow.customId).then(() => {
      proxy.$modal.msgSuccess('重置成功')
      handleSetPrice() // 刷新列表
    })
  })
}

function submitPriceForm() {
  // 按照后端接口规范处理 ID
  // 如果是由于修改模板生成的自定义价格，后端会自动处理 customId 的创建
  const postData = {
    ...priceForm.value,
    id: priceForm.value.customId || null // customId 存在则修改，不存在则新增自定义
  }
  updatePriceConfig(postData).then(() => {
    proxy.$modal.msgSuccess('保存成功')
    showAddPriceDialog.value = false
    handleSetPrice() // 刷新列表
  })
}

/** 提醒设置按钮操作 */
function handleReminderSettings() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置提醒的课题组')
    return
  }
  const selectRow = dataList.value.find(item => item.id === ids.value[0])
  reminderForm.value = {
    groupId: ids.value[0],
    groupName: selectRow ? selectRow.name : '',
    isReminder: '0',
    content: ''
  }
  showReminderDialog.value = true
}

function submitReminderForm() {
  proxy.$modal.msgWarning('待接入API')
  showReminderDialog.value = false
}

/** 预付款设置按钮操作 */
function handlePrepaymentSettings() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置预付款的课题组')
    return
  }
  proxy.$modal.msgWarning('待接入API')
}

/** 批量编辑按钮操作 */
function handleBatchEdit() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要批量编辑的课题组')
    return
  }
  proxy.$modal.msgWarning('待接入API')
}

/** 基因标签按钮操作 */
function handleGeneLabel() {
  proxy.$modal.msgWarning('功能开发中')
}

/** 所有价格按钮操作 */
function handleAllPrices() {
  exportPriceForm.value.type = 'all'
  showExportPriceDialog.value = true
}

/** 空白价格按钮操作 */
function handleBlankPrice() {
  exportPriceForm.value.type = 'blank'
  showExportPriceDialog.value = true
}

function submitExportPriceForm() {
  const query = {
    groupId: currentGroupId.value,
    type: exportPriceForm.value.type
  }
  // 核心逻辑：增加字段价格 (unitPrice) 的导出处理
  proxy.download('customer/priceConfig/export', query, '价格设置表_' + new Date().getTime() + '.xlsx')
  showExportPriceDialog.value = false
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        const updateData = {
          ...form.value
        }
        updateResearch_group(updateData).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addResearch_group(form.value).then(() => {
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
  proxy.$modal
    .confirm('是否确认删除编号为"' + idList + '"的数据项？')
    .then(function () {
      return delResearch_group(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
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
