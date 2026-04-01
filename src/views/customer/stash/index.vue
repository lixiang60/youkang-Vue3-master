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
        <el-button v-hasPermi="['customer:stash:add']" size="small" type="primary" plain icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:stash:edit']"
          size="small"
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:stash:remove']"
          size="small"
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:stash:export']"
          size="small"
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          >导出</el-button
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
      <template #status="{ row }">
        <dict-tag :options="sys_normal_disable" :value="row.status" />
      </template>
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime) }}</span>
      </template>
      <template #action="{ row }">
        <el-button v-hasPermi="['customer:stash:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)"
          >修改</el-button
        >
        <el-button v-hasPermi="['customer:stash:remove']" link type="primary" icon="Delete" @click="handleDelete(row)"
          >删除</el-button
        >
      </template>
    </dynamic-table>

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <div class="well-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="0px">
          <div class="form-row">
            <div class="form-label">名称：</div>
            <div class="form-content">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">状态：</div>
            <div class="form-content">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">备注：</div>
            <div class="form-content">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注内容" />
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px; padding: 10px 0">
          <el-button class="premium-btn premium-btn-confirm" @click="submitForm">
            <template #icon>
              <el-icon><SuccessFilled /></el-icon>
            </template>
            确 定
          </el-button>
          <el-button class="premium-btn premium-btn-cancel" @click="cancel">
            <template #icon>
              <el-icon><CircleCloseFilled /></el-icon>
            </template>
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Stash">
import { listStash, getStash, addStash, updateStash, delStash } from '@/api/customer/stash'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import DynamicTable from '@/components/DynamicTable/index.vue'

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
  { type: 'selection', width: 55, fixed: true, visible: true },
  { key: 'id', label: 'ID', width: 80, align: 'center', visible: true },
  { key: 'name', label: '名称', align: 'center', showOverflowTooltip: true, visible: true },
  { key: 'status', label: '状态', width: 100, align: 'center', slot: 'status', visible: true },
  { key: 'createTime', label: '创建时间', width: 180, align: 'center', slot: 'createTime', visible: true },
  { label: '操作', width: 150, fixed: 'right', slot: 'action', align: 'center', visible: true }
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
  listStash(queryParams.value).then(response => {
    dataList.value = response.rows || (response.data && (response.data.rows || response.data.records)) || []
    total.value = response.total || (response.data && response.data.total) || 0
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
    status: '0',
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
  title.value = '添加客户暂存'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getStash(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改客户暂存'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateStash(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addStash(form.value).then(response => {
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
      return delStash(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'customer/stash/export',
    {
      ...queryParams.value
    },
    `stash_${new Date().getTime()}.xlsx`
  )
}

onMounted(() => {
  getList()
})
</script>
