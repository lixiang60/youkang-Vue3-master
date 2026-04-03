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
        <el-button
          v-hasPermi="['sequencing:return:export']"
          size="small"
          type="success"
          plain
          icon="Download"
          @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['sequencing:return:remove']"
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
        <el-button size="small" type="primary" plain icon="ShoppingCart" @click="handleDeliveryDetails"
          >发货明细</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Promotion" @click="handleArrangeReturn">安排返还</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="CollectionTag" @click="handleReturnLabel"
          >返还标签</el-button
        >
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
      @selection-change="handleSelectionChange"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" :title="title" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="well-form">
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
        <div class="form-row border-bottom" style="height: 120px">
          <div class="form-label" style="height: 100%">备注：</div>
          <div class="form-content" style="height: 100%">
            <el-form-item prop="remark" label-width="0" style="height: 100%">
              <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入内容" />
            </el-form-item>
          </div>
        </div>
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

<script setup name="Return">
import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import { listReturn, getReturn, confirmReturn, delReturn } from '@/api/sequencing/return'

// 临时占位，待后端实现
const addReturn = () => {
  return Promise.reject('新增功能开发中...')
}
const updateReturn = () => {
  return Promise.reject('修改功能开发中...')
}

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
  { type: 'selection', key: 'selection', minWidth: 50, fixed: true, visible: true },
  { key: 'id', label: 'ID', minWidth: 80, fixed: true, sortable: true, visible: true },
  { key: 'customerName', label: '客户姓名', minWidth: 110, visible: true },
  { key: 'orderId', label: '订单号', minWidth: 150, visible: true },
  { key: 'scheduleTime', label: '排版时间', minWidth: 180, visible: true },
  { key: 'scheduler', label: '排版人', minWidth: 110, visible: true },
  {
    key: 'reimburseType',
    label: '返还类型',
    minWidth: 150,
    showOverflowTooltip: true,
    visible: true
  },
  { key: 'reimburseCount', label: '返还数量', minWidth: 100, visible: true },
  { key: 'produceIds', label: '生产编号', minWidth: 180, showOverflowTooltip: true, visible: true },
  { key: 'status', label: '状态', minWidth: 110, visible: true },
  { key: 'reimburseTime', label: '返还时间', minWidth: 180, visible: true },
  { key: 'reimburser', label: '返还人', minWidth: 110, visible: true },
  {
    key: 'belongCompany',
    label: '所属公司',
    minWidth: 140,
    showOverflowTooltip: true,
    visible: true
  },
  {
    key: 'produceCompany',
    label: '生产公司',
    minWidth: 140,
    showOverflowTooltip: true,
    visible: true
  },
  { key: 'createUser', label: '创建人', minWidth: 110, visible: true },
  { key: 'createTime', label: '创建时间', minWidth: 180, visible: true }
])

// 检索配置
const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'status', label: '状态', type: 'input' }
])

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    customerName: undefined,
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
  listReturn(queryParams.value)
    .then(response => {
      // 兼容多种返回结构
      const res = response.data || response
      if (res.rows) {
        dataList.value = res.rows
        total.value = res.total
      } else if (res.data && res.data.rows) {
        dataList.value = res.data.rows
        total.value = res.data.total
      }
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
const selectedRows = ref([])
function handleSelectionChange(selection) {
  selectedRows.value = selection
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加返还管理'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getReturn(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改返还管理'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateReturn(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addReturn(form.value).then(response => {
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
  const idList = row.id ? [row.id] : ids.value
  proxy.$modal
    .confirm('是否确认删除编号为"' + idList + '"的数据项？')
    .then(function () {
      const req = {
        reimburseConfirmReqs: idList.map(id => ({ id }))
      }
      return delReturn(req)
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
    '/order/reimburse/export',
    {
      ...queryParams.value
    },
    `return_${new Date().getTime()}.xlsx`
  )
}

// 占位方法
// 功能实现
function handleDeliveryDetails() {
  proxy.$modal.msg('发货明细查询开发中...')
}

function handleArrangeReturn(row) {
  const rows = row.id ? [row] : selectedRows.value
  if (rows.length === 0) return

  proxy.$modal
    .confirm('是否确认对选中的 ' + rows.length + ' 条记录进行安排返还？')
    .then(function () {
      const req = {
        reimburseConfirmReqs: rows.map(item => ({
          id: item.id,
          produceIds: item.produceIds,
          reimburseType: '安排返还'
        }))
      }
      return confirmReturn(req)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('安排成功')
    })
}

function handleReturnLabel() {
  proxy.$modal.msg('返还标签生成开发中...')
}

// 4. 生命周期
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
