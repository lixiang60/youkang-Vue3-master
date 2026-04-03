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
        <el-button
          v-hasPermi="['customer:research_group:import']"
          size="small"
          type="info"
          plain
          :icon="Upload"
          @click="handleImport"
          >导入</el-button
        >
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
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
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
  { key: 'id', label: 'ID', minWidth: 80, fixed: true, sortable: true, visible: true },
  { key: 'name', label: '名称', minWidth: 140, fixed: true, showOverflowTooltip: true, visible: true },
  { key: 'status', label: '状态', minWidth: 90, slot: 'isEnabled', visible: true },
  { key: 'region', label: '地区', minWidth: 100, visible: true },
  { key: 'salesPerson', label: '业务员', minWidth: 100, visible: true },
  { key: 'paymentMethod', label: '结算方式', minWidth: 110, visible: true },
  { key: 'invoiceTitle', label: '发票抬头', minWidth: 160, showOverflowTooltip: true, visible: true },
  { key: 'companyName', label: '所属公司', minWidth: 140, showOverflowTooltip: true, visible: true },
  { key: 'companyId', label: '所属公司ID', minWidth: 100, visible: true },
  { key: 'contactPerson', label: '联系人', minWidth: 110, visible: true },
  { key: 'contactPhone', label: '联系电话', minWidth: 130, visible: true },
  { key: 'prepaymentSubject', label: '预付款课题', minWidth: 140, showOverflowTooltip: true, visible: true },
  { key: 'contactAddress', label: '联系地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { key: 'createTime', label: '添加时间', minWidth: 130, slot: 'createTime', visible: true },
  { key: 'addedBy', label: '添加人', minWidth: 110, visible: true },
  { key: 'pointsBase', label: '积分基数', minWidth: 100, visible: true },
  { key: 'pointsAmount', label: '积分金额', minWidth: 100, visible: true },
  { key: 'isReminder', label: '是否提醒', minWidth: 100, visible: true },
  { key: 'reminderContent', label: '提醒内容', minWidth: 160, showOverflowTooltip: true, visible: true },
  { key: 'geneLabelType', label: '基因标签类型', minWidth: 120, visible: true }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined
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
  proxy.$modal.msgInfo('导入功能开发中...')
}

/** 设置价格按钮操作 */
function handleSetPrice() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置价格的课题组')
    return
  }
  proxy.$modal.msgInfo('设置价格功能开发中...')
}

/** 提醒设置按钮操作 */
function handleReminderSettings() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置提醒的课题组')
    return
  }
  proxy.$modal.msgInfo('提醒设置功能开发中...')
}

/** 预付款设置按钮操作 */
function handlePrepaymentSettings() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置预付款的课题组')
    return
  }
  proxy.$modal.msgInfo('预付款设置功能开发中...')
}

/** 批量编辑按钮操作 */
function handleBatchEdit() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要批量编辑的课题组')
    return
  }
  proxy.$modal.msgInfo('批量编辑功能开发中...')
}

/** 基因标签按钮操作 */
function handleGeneLabel() {
  proxy.$modal.msgInfo('基因标签功能开发中...')
}

/** 所有价格按钮操作 */
function handleAllPrices() {
  proxy.$modal.msgInfo('所有价格功能开发中...')
}

/** 空白价格按钮操作 */
function handleBlankPrice() {
  proxy.$modal.msgInfo('空白价格功能开发中...')
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        const updateData = {
          ...form.value
        }
        updateResearch_group(updateData).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addResearch_group(form.value).then(response => {
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
