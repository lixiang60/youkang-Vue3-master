<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          plain
          icon="Search"
          @click="toggleSearchPanel"
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
          type="warning"
          plain
          icon="Key"
          @click="handleAudit"
        >审核</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="DocumentAdd"
          @click="handleAddPlateNo"
        >添加板号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="SwitchButton"
          @click="handleReactionStop"
        >反应停止</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Resend">
import { listResend, getResend, addResend, updateResend, delResend } from '@/api/sequencing/resend'

const searchRef = ref(null)
const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_yes_no } = proxy.useDict('sys_normal_disable', 'sys_yes_no')

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
  { key: 'productionNo', label: '生产编号', width: 100, fixed: true, sortable: true, visible: true },
  { key: 'orderNo', label: '订单号', width: 160, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'customerLevel', label: '客户等级', width: 80, visible: true },
  { key: 'researchGroup', label: '课题组', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'sampleNo', label: '样品编号', width: 120, visible: true },
  { key: 'sequencingPrimer', label: '测序引物', width: 100, visible: true },
  { key: 'primerConcentration', label: '引物浓度', width: 80, visible: true },
  { key: 'sampleType', label: '样品类型', width: 80, visible: true },
  { key: 'vectorName', label: '载体名称', width: 100, visible: true },
  { key: 'fragmentSize', label: '片段大小', width: 80, visible: true },
  { key: 'isLiquid', label: '是否测通', width: 80, visible: true },
  { key: 'completionStatus', label: '完成情况', width: 80, visible: true }
])

const cacheKey = 'sequencing_resend_columns_visible'
const savedColumns = localStorage.getItem(cacheKey)
if (savedColumns) {
  try {
    const cache = JSON.parse(savedColumns)
    columns.value.forEach(col => {
      const key = col.key || col.prop || col.type
      if (key && cache[key] !== undefined) col.visible = cache[key]
    })
  } catch (e) {}
}
watch(columns, (newVal) => {
  const cache = {}
  newVal.forEach(col => { if (col.key) cache[col.key] = col.visible })
  localStorage.setItem(cacheKey, JSON.stringify(cache))
}, { deep: true })

// 检索配置
const searchFields = ref([
  { prop: 'orderNo', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' }
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
      { required: true, message: '名称不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listResend(queryParams.value).then(response => {
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
  title.value = '添加样品补送'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getResend(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改样品补送'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateResend(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addResend(form.value).then(response => {
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
    return delResend(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/resend/export', {
    ...queryParams.value
  }, `resend_${new Date().getTime()}.xlsx`)
}

// 占位方法
function handleAudit() { proxy.$modal.msgInfo('功能开发中...') }
function handleAddPlateNo() { proxy.$modal.msgInfo('功能开发中...') }
function handleReactionStop() { proxy.$modal.msgInfo('功能开发中...') }

onMounted(() => {
  // TODO: 等后端接口实现后再启用
  // getList()
  
  // 临时模拟数据
  loading.value = false
  dataList.value = []
  total.value = 0
})
</script>
