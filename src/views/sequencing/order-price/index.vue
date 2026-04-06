<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="success" plain icon="Plus" size="small" @click="handleAdd">添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Edit" size="small" :disabled="single" @click="handleUpdate"
          >编辑</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" size="small" :disabled="multiple" @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Search" size="small" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Refresh" size="small" @click="handleRefresh">刷新</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      v-loading="loading"
      :data="dataList"
      :columns="columns"
      :total="total"
      size="small"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" width="600px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center">
          <el-icon style="margin-right: 8px; color: #409eff">
            <EditPen v-if="form.id" />
            <Plus v-else />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">{{ title }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="订单号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="请输入单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="count">
              <el-input-number v-model="form.count" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单价" prop="price">
              <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="费用" prop="fee">
              <el-input-number v-model="form.fee" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
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
import { Plus, Edit, Delete, Search, Refresh, EditPen, Check, Close } from '@element-plus/icons-vue'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const { proxy } = getCurrentInstance()

const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dataList = ref([])
const title = ref('')
const open = ref(false)
const searchRef = ref(null)

const columns = ref([
  { type: 'selection', width: 55, align: 'center', visible: true },
  { key: 'id', label: 'ID', minWidth: 80, visible: true },
  { key: 'orderId', label: '订单号', minWidth: 120, visible: true },
  { key: 'name', label: '名称', minWidth: 150, visible: true },
  { key: 'unit', label: '单位', minWidth: 80, visible: true },
  { key: 'count', label: '数量', minWidth: 80, visible: true },
  { key: 'price', label: '单价', minWidth: 100, visible: true },
  { key: 'fee', label: '费用', minWidth: 100, visible: true },
  { key: 'createBy', label: '添加人', minWidth: 100, visible: true },
  { key: 'createTime', label: '时间', minWidth: 160, visible: true }
])

const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'name', label: '名称', type: 'input' }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    name: undefined
  },
  rules: {
    orderId: [{ required: true, message: '订单号不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  // 由于用户要求不扫描接口，这里模拟一个加载成功
  // 实际对接时需引入相应的 API 函数
  setTimeout(() => {
    dataList.value = []
    total.value = 0
    loading.value = false
  }, 500)
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

/** 切换搜索面板 */
function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 重置表单 */
function reset() {
  form.value = {
    id: undefined,
    orderId: undefined,
    name: undefined,
    unit: undefined,
    count: 0,
    price: 0,
    fee: 0,
    remark: undefined
  }
  proxy.resetForm('formRef')
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 添加按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加订单价格'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value[0]
  // 模拟获取详情
  form.value = { id, orderId: 'ORD001', name: '测试服务', unit: '个', count: 1, price: 100, fee: 100 }
  open.value = true
  title.value = '修改订单价格'
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deleteIds = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除数据项？')
    .then(() => {
      proxy.$modal.msgSuccess('删除成功')
      getList()
    })
    .catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
