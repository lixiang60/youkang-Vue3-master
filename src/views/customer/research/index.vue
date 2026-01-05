<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['customer:research:add']"
        >添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['customer:research:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Refresh"
          @click="handleRefresh"
        >刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Document"
          @click="handleBatchEdit"
          v-hasPermi="['customer:research:batch']"
        >批量编辑</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      :loading="loading"
      :data="dataList"
      :columns="columns"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
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
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="客户选择" prop="customerId">
              <el-select v-model="form.customerId" placeholder="请选择客户" filterable clearable>
                <el-option
                  v-for="item in customerOptions"
                  :key="item.customerId"
                  :label="`${item.customerId}-${item.customerName}-${item.address || ''}-${item.email || ''}-${item.phone || ''}-${item.customerUnit || ''}`"
                  :value="item.customerId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="课题组选择" prop="subjectGroupId">
              <el-select v-model="form.subjectGroupId" placeholder="请选择课题组" filterable clearable>
                <el-option
                  v-for="item in subjectGroupOptions"
                  :key="item.id"
                  :label="`${item.id}-${item.name}-${item.contactAddress || ''}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="5" placeholder="请输入备注信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">添 加</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Research">
import { listResearch, getResearch, addResearch, updateResearch, delResearch } from '@/api/customer/research'
import { listCustomerOption, listSubjectGroupOption } from '@/api/common'
import DynamicTable from '@/components/DynamicTable/index.vue'

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

const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'id', label: 'id', width: 80, fixed: true, sortable: true, visible: true  },
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
    customerId: [
      { required: true, message: '客户不能为空', trigger: 'blur' }
    ],
    subjectGroupId: [
      { required: true, message: '课题组不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listResearch(queryParams.value).then(response => {
    dataList.value = response.data.records
    total.value = response.data.total
    loading.value = false
  }).catch(() => {
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

/** 批量编辑按钮操作 */
function handleBatchEdit() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要批量编辑的记录')
    return
  }
  proxy.$modal.msgInfo('批量编辑功能开发中...')
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
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function() {
    return delResearch(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('customer/research/export', {
    ...queryParams.value
  }, `research_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList()
  listCustomerOption().then(response => {
    console.log('Customer Options Response:', response)
    customerOptions.value = response.data.records
  })
  listSubjectGroupOption().then(response => {
    subjectGroupOptions.value = response.data.records
  })
})

</script>
