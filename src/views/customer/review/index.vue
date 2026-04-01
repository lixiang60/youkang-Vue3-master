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
          v-hasPermi="['customer:review:audit']"
          size="small"
          type="warning"
          plain
          icon="Key"
          @click="handleReview"
          >审核</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:review:save']"
          size="small"
          type="success"
          plain
          icon="FolderChecked"
          @click="handleSave"
          >暂存</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:review:remove']"
          size="small"
          type="danger"
          plain
          icon="Delete"
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
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span>
      </template>
    </dynamic-table>
  </div>
</template>

<script setup name="Review">
import { listReview, delReview } from '@/api/customer/review'
import DynamicSearch from '@/components/DynamicSearch/index.vue'
import DynamicTable from '@/components/DynamicTable/index.vue'

const { proxy } = getCurrentInstance()

const dataList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

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
  { key: 'customerId', label: '客户ID', width: 80, fixed: true, visible: true },
  { key: 'name', label: '姓名客户', width: 100, fixed: true, showOverflowTooltip: true, visible: true },
  { key: 'region', label: '地区', width: 100, visible: true },
  { key: 'address', label: '地址', width: 150, showOverflowTooltip: true, visible: true },
  { key: 'zipCode', label: '邮编', width: 100, visible: false },
  { key: 'phone', label: '电话', width: 120, visible: false },
  { key: 'mobile', label: '手机', width: 120, visible: true },
  { key: 'email', label: '邮箱', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'level', label: '等级', width: 80, visible: true },
  { key: 'status', label: '状态', width: 80, visible: true },
  { key: 'salesman', label: '销售员', width: 100, visible: true },
  { key: 'invoiceTitle', label: '发票抬头', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'paymentMethod', label: '结算方式', width: 100, visible: true },
  { key: 'invoiceType', label: '发票种类', width: 120, visible: false },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: false },
  { key: 'addedBy', label: '添加人', width: 100, visible: false },
  { key: 'createTime', label: '时间', width: 110, slot: 'createTime', visible: true },
  { key: 'totalPoints', label: '总积分', width: 80, visible: true },
  { key: 'availablePoints', label: '可用积分', width: 90, visible: true },
  { key: 'usedPoints', label: '已使用积分', width: 100, visible: false }
])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined
  }
})

const { queryParams } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listReview(queryParams.value)
    .then(response => {
      dataList.value = response.rows || (response.data && (response.data.rows || response.data.records)) || []
      total.value = response.total || (response.data && response.data.total) || 0
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
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

/** 审核按钮操作 */
function handleReview() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要审核的客户')
    return
  }
  proxy.$modal.msgInfo('审核功能开发中...')
}

/** 暂存按钮操作 */
function handleSave() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要暂存的客户')
    return
  }
  proxy.$modal.msgInfo('暂存功能开发中...')
}

/** 删除按钮操作 */
function handleDelete(row) {
  const idList = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除选中的客户数据？')
    .then(function () {
      return delReview(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
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
