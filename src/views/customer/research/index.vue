<template>
  <div class="app-container">
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
          icon="Search"
          @click="handleQuery"
        >查询</el-button>
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table 
      v-loading="loading" 
      :data="dataList" 
      @selection-change="handleSelectionChange"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column type="selection" width="50" align="center" fixed />
      <el-table-column label="id" align="center" prop="id" width="80" fixed sortable />
      <el-table-column label="客户ID" align="center" prop="customerId" width="80" fixed />
      <el-table-column label="客户姓名" align="center" prop="customerName" width="100" fixed show-overflow-tooltip />
      <el-table-column label="姓名拼音" align="center" prop="pinyin" width="100" />
      <el-table-column label="地区" align="center" prop="region" width="80" />
      <el-table-column label="课题组ID" align="center" prop="researchGroupId" width="100" />
      <el-table-column label="课题组" align="center" prop="researchGroupName" width="120" show-overflow-tooltip />
      <el-table-column label="是否启用" align="center" prop="isEnabled" width="80">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.isEnabled" />
        </template>
      </el-table-column>
      <el-table-column label="结算方式" align="center" prop="paymentMethod" width="100" />
      <el-table-column label="业务员" align="center" prop="salesman" width="100" />
      <el-table-column label="客户地址" align="center" prop="address" width="150" show-overflow-tooltip />
      <el-table-column label="添加人" align="center" prop="addedBy" width="100" />
      <el-table-column label="添加时间" align="center" prop="createTime" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户电话" align="center" prop="phone" width="120" />
      <el-table-column label="手机" align="center" prop="mobile" width="120" />
      <el-table-column label="E_MAIL" align="center" prop="email" width="120" show-overflow-tooltip />
      <el-table-column label="备注" align="center" prop="remark" width="100" show-overflow-tooltip />
      <el-table-column label="所属公司ID" align="center" prop="belongCompanyId" width="100" />
      <el-table-column label="所属公司" align="center" prop="belongCompany" width="120" show-overflow-tooltip />
      <el-table-column label="总积分" align="center" prop="totalPoints" width="80" />
      <el-table-column label="可用积分" align="center" prop="availablePoints" width="90" />
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="客户选择" prop="customerId">
              <el-input v-model="form.customerId" placeholder="请选择客户" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="课题组选择" prop="researchGroupId">
              <el-input v-model="form.researchGroupId" placeholder="请选择课题组" />
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

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const dataList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

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
    researchGroupId: [
      { required: true, message: '课题组不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listResearch(queryParams.value).then(response => {
    dataList.value = response.rows
    total.value = response.total
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
    researchGroupId: undefined,
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
  // TODO: 等后端接口实现后再启用
  // getList()
  
  // 临时模拟数据
  loading.value = false
  dataList.value = []
  total.value = 0
})
</script>
