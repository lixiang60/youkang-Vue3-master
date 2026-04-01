<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" :icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['customer:research:add']" size="small" type="primary" :icon="Plus" @click="handleAdd"
          >添加</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:research:remove']"
          size="small"
          type="danger"
          :icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
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
      <template #isEnabled="{ row }">
        <dict-tag :options="sys_normal_disable" :value="row.status" />
      </template>
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span>
      </template>
    </dynamic-table>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" :title="title" width="800px" append-to-body>
      <div class="well-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="0px">
          <div class="form-row">
            <div class="form-label">客户选择：</div>
            <div class="form-content">
              <el-select v-model="form.customerId" placeholder="请选择客户" filterable clearable style="width: 100%">
                <el-option
                  v-for="item in customerOptions"
                  :key="item.customerId"
                  :label="`${item.customerId}-${item.customerName}-${item.address || ''}-${item.email || ''}-${item.phone || ''}-${item.customerUnit || ''}`"
                  :value="item.customerId"
                />
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">课题组选择：</div>
            <div class="form-content">
              <el-select
                v-model="form.subjectGroupId"
                placeholder="请选择课题组"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in subjectGroupOptions"
                  :key="item.id"
                  :label="`${item.id}-${item.name}-${item.contactAddress || ''}`"
                  :value="item.id"
                />
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">备注：</div>
            <div class="form-content">
              <el-input v-model="form.remark" type="textarea" :rows="5" placeholder="请输入备注信息" />
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">{{ form.id ? '修 改' : '添 加' }}</el-button>
          <el-button type="danger" :icon="Close" @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Research">
import { listResearch, getResearch, addResearch, updateResearch, delResearch } from '@/api/customer/research'
import { listCustomerOption, listSubjectGroupOption } from '@/api/common'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import { Search, Refresh, Plus, Delete, Check, Close } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const dataList = ref([])
const customerOptions = ref([])
const subjectGroupOptions = ref([])
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
      { label: '正常', value: '0' },
      { label: '停用', value: '1' }
    ]
  }
])

const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'id', label: 'id', width: 80, fixed: true, sortable: true, visible: true },
  { key: 'customerId', label: '客户ID', width: 80, fixed: true, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, fixed: true, showOverflowTooltip: true, visible: true },
  { key: 'region', label: '地区', width: 80, visible: true },
  { key: 'subjectGroupId', label: '课题组ID', width: 100, visible: true },
  { key: 'subjectGroupName', label: '课题组', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'status', label: '是否启用', width: 80, slot: 'isEnabled', visible: true },
  { key: 'paymentMethod', label: '结算方式', width: 100, visible: false },
  { key: 'salesPerson', label: '业务员', width: 100, visible: false },
  { key: 'customerAddress', label: '客户地址', width: 150, showOverflowTooltip: true, visible: true },
  { key: 'createUser', label: '添加人', width: 100, visible: false },
  { key: 'createTime', label: '添加时间', width: 110, slot: 'createTime', visible: true },
  { key: 'customerPhone', label: '客户电话', width: 120, visible: true },
  { key: 'customerEmail', label: 'E_MAIL', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: false },
  { key: 'company', label: '所属公司', width: 120, showOverflowTooltip: true, visible: true }
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
    customerId: [{ required: true, message: '客户不能为空', trigger: 'blur' }],
    subjectGroupId: [{ required: true, message: '课题组不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listResearch(queryParams.value)
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
    customerId: undefined,
    subjectGroupId: undefined,
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
  title.value = '客户课题组设置'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getResearch(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改客户课题组'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateResearch(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addResearch(form.value).then(response => {
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
      return delResearch(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

onMounted(() => {
  getList()
  listCustomerOption().then(response => {
    customerOptions.value = response.data.records
  })
  listSubjectGroupOption().then(response => {
    subjectGroupOptions.value = response.data.records
  })
})
</script>
