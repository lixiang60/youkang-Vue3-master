<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          plain
          icon="Search"
          size="small"
          @click="toggleSearchPanel"
        >查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Refresh"
          size="small"
          @click="handleRefresh"
        >刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['sequencing:file:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Edit"
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sequencing:file:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          size="small"
          @click="handleExport"
          v-hasPermi="['sequencing:file:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sequencing:file:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table 
      v-model:page="queryParams.pageNum" 
      v-model:limit="queryParams.pageSize" 
      @pagination="getList"
      size="small" 
      :header-cell-style="{ fontSize: '12px' }" 
      v-loading="loading" 
      :data="dataList" 
      :columns="columns"
      :total="total" 
      @selection-change="handleSelectionChange" 
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">名称：</div>
          <div class="form-content">
            <el-form-item prop="name" label-width="0">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">状态：</div>
          <div class="form-content">
            <el-form-item prop="status" label-width="0">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label">备注：</div>
          <div class="form-content">
            <el-form-item prop="remark" label-width="0">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="File">
import { listFile, getFile, addFile, updateFile, delFile } from '@/api/sequencing/file'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

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

// 列配置
const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'id', label: 'ID', width: 80, fixed: true, sortable: true, visible: true },
  { key: 'name', label: '名称', visible: true },
  { key: 'status', label: '状态', visible: true },
  { key: 'createTime', label: '创建时间', width: 180, visible: true },
  { key: 'remark', label: '备注', showOverflowTooltip: true, visible: true }
])

// 检索配置
const searchFields = ref([
  { prop: 'name', label: '名称', type: 'input' },
  { prop: 'status', label: '状态', type: 'select', options: [{ label: '正常', value: '0' }, { label: '停用', value: '1' }] }
])

// 列可见性缓存
const cacheKey = 'sequencing_file_columns_visible'
const savedColumns = localStorage.getItem(cacheKey)
if (savedColumns) {
  try {
    const cache = JSON.parse(savedColumns)
    columns.value.forEach(col => {
      const key = col.key || col.prop || col.type
      if (key && cache[key] !== undefined) col.visible = cache[key]
    })
  } catch (e) { }
}
watch(columns, (newVal) => {
  const cache = {}
  newVal.forEach(col => { if (col.key) cache[col.key] = col.visible })
  localStorage.setItem(cacheKey, JSON.stringify(cache))
}, { deep: true })

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined
  },
  rules: {
    name: [
      { required: true, message: '名称不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listFile(queryParams.value).then(response => {
    dataList.value = response.rows
    total.value = response.total
    loading.value = false
  }).catch(() => {
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
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加测序文件'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getFile(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改测序文件'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateFile(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addFile(form.value).then(response => {
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
    return delFile(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/file/export', {
    ...queryParams.value
  }, `file_${new Date().getTime()}.xlsx`)
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
</style>
