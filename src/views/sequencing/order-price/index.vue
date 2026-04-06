<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Plus" @click="handleAdd">添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Edit" :disabled="single" @click="handleUpdate"
          >编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
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
      @select="handleSelect"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" width="900px" append-to-body top="8vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">{{ title }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderId">
              <el-input v-model="form.orderId" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="请输入单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="form.quantity" placeholder="请输入数量" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单价" prop="price">
              <el-input-number v-model="form.price" placeholder="请输入单价" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="费用" prop="cost">
              <el-input-number v-model="form.cost" placeholder="请输入费用" style="width: 100%" />
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
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="OrderPrice">
import { ref, reactive, toRefs, onMounted, getCurrentInstance } from 'vue'
import { Check, Close, EditPen } from '@element-plus/icons-vue'
import { listOrder } from '@/api/sequencing/order'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const { proxy } = getCurrentInstance()

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { prop: 'id', label: 'ID', minWidth: 80, visible: true },
  { prop: 'orderId', label: '订单号', minWidth: 150, visible: true },
  { prop: 'name', label: '名称', minWidth: 120, visible: true },
  { prop: 'unit', label: '单位', minWidth: 80, visible: true },
  { prop: 'quantity', label: '数量', minWidth: 80, visible: true },
  { prop: 'price', label: '单价', minWidth: 100, visible: true },
  { prop: 'cost', label: '费用', minWidth: 100, visible: true },
  { prop: 'createBy', label: '添加人', minWidth: 100, visible: true },
  { prop: 'createTime', label: '时间', minWidth: 180, visible: true }
])

const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'name', label: '名称', type: 'input' }
])

const dataList = ref([])
const total = ref(0)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')
const open = ref(false)
const formRef = ref(null)
const searchRef = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    name: undefined
  },
  rules: {
    orderId: [{ required: true, message: '订单号不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listOrder(queryParams.value)
    .then(response => {
      dataList.value = response.data.rows
      total.value = response.data.total
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索 & 刷新 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

function handleSelect(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 基础 CRUD 手柄 */
function reset() {
  form.value = {
    id: undefined,
    orderId: undefined,
    name: undefined,
    unit: undefined,
    quantity: undefined,
    price: undefined,
    cost: undefined,
    remark: undefined
  }
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '添加订单价格'
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  form.value.id = id
  open.value = true
  title.value = '修改订单价格'
}

function handleDelete(row) {
  const deleteIds = row.id || ids.value
  proxy.$modal.confirm('是否确认删除订单价格编号为"' + deleteIds + '"的数据项？').then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    }
  })
}

function cancel() {
  open.value = false
  reset()
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
</style>
