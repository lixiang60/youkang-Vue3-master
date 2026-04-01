<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['sequencing:primer:edit']">编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['sequencing:primer:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Upload" @click="handleImport"
          v-hasPermi="['sequencing:primer:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="Collection" @click="handlePrimerTubeLabel">引物管标签</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="Picture" @click="handleImageSettings">图像设置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList"
      size="small" :header-cell-style="{ fontSize: '12px' }" v-loading="loading" :data="dataList" :columns="columns"
      :total="total" @selection-change="handleSelectionChange" />



    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="primer_id：" prop="id">
              <el-input v-model="form.id" placeholder="请输入primer_id" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="引物名称：" prop="name">
              <el-input v-model="form.name" placeholder="请输入引物名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="引物类别：" prop="type">
              <el-input v-model="form.type" placeholder="请输入引物类别" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item>
              <el-button type="info" plain icon="Edit" @click="handleEditPlateWell">编辑板号孔号</el-button>
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup name="Primer">
import { listPrimer, getPrimer, addPrimer, updatePrimer, delPrimer } from '@/api/sequencing/primer'

const searchRef = ref(null)
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

const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'id', label: 'primer_id', width: 100, fixed: true, sortable: true, visible: true },
  { key: 'name', label: '引物名称', width: 120, fixed: true, visible: true },
  { key: 'type', label: '引物类别', width: 80, visible: true },
  { key: 'researchGroupId', label: '课题组id', width: 80, visible: false },
  { key: 'researchGroupName', label: '课题组', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'customerId', label: '客户id', width: 80, visible: false },
  { key: 'customerName', label: '客户名', width: 100, showOverflowTooltip: true, visible: true },
  { key: 'plateNo', label: '板号', width: 80, visible: true },
  { key: 'wellNo', label: '孔号', width: 80, visible: true },
  { key: 'layoutType', label: '排版方式', width: 100, visible: true },
  { key: 'status', label: '状态', width: 80, visible: true },
  { key: 'createTime', label: '添加时间', width: 160, visible: true },
  { key: 'createBy', label: '添加人', width: 100, visible: true },
  { key: 'layoutBy', label: '排版人', width: 100, visible: true },
  { key: 'clearBy', label: '清板人', width: 100, visible: true }
])

const cacheKey = 'sequencing_primer_columns_visible'
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

// 检索配置
const searchFields = ref([
  { prop: 'name', label: '引物名称', type: 'input' },
  { prop: 'customerName', label: '客户名', type: 'input' }
])

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}


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
      { required: true, message: '引物名称不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listPrimer(queryParams.value).then(response => {
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
    name: undefined,
    type: undefined,
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
  title.value = '添加引物'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getPrimer(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改引物'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updatePrimer(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addPrimer(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function () {
    return delPrimer(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/primer/export', {
    ...queryParams.value
  }, `primer_${new Date().getTime()}.xlsx`)
}

// 占位方法
function handleImport() { proxy.$modal.msg('功能开发中...') }
function handlePrimerTubeLabel() { proxy.$modal.msg('功能开发中...') }
function handleImageSettings() { proxy.$modal.msg('功能开发中...') }
function handleEditPlateWell() { proxy.$modal.msg('功能开发中...') }

onMounted(() => {
  getList()
})
onActivated(() => {
  getList()
})
</script>
