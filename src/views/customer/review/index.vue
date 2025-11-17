<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['customer:review:remove']"
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
          type="warning"
          plain
          icon="Key"
          @click="handleReview"
          v-hasPermi="['customer:review:audit']"
        >审核</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="FolderChecked"
          @click="handleSave"
          v-hasPermi="['customer:review:save']"
        >暂存</el-button>
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
      <el-table-column label="客户ID" align="center" prop="customerId" width="80" fixed />
      <el-table-column label="姓名客户" align="center" prop="name" width="100" fixed show-overflow-tooltip />
      <el-table-column label="地区" align="center" prop="region" width="100" />
      <el-table-column label="地址" align="center" prop="address" width="150" show-overflow-tooltip />
      <el-table-column label="邮编" align="center" prop="zipCode" width="100" />
      <el-table-column label="电话" align="center" prop="phone" width="120" />
      <el-table-column label="手机" align="center" prop="mobile" width="120" />
      <el-table-column label="邮箱" align="center" prop="email" width="120" show-overflow-tooltip />
      <el-table-column label="等级" align="center" prop="level" width="80" />
      <el-table-column label="状态" align="center" prop="status" width="80" />
      <el-table-column label="销售员" align="center" prop="salesman" width="100" />
      <el-table-column label="发票抬头" align="center" prop="invoiceTitle" width="150" show-overflow-tooltip />
      <el-table-column label="结算方式" align="center" prop="paymentMethod" width="100" />
      <el-table-column label="发票种类" align="center" prop="invoiceType" width="120" />
      <el-table-column label="备注" align="center" prop="remark" width="100" show-overflow-tooltip />
      <el-table-column label="添加人" align="center" prop="addedBy" width="100" />
      <el-table-column label="时间" align="center" prop="createTime" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总积分" align="center" prop="totalPoints" width="80" />
      <el-table-column label="可用积分" align="center" prop="availablePoints" width="90" />
      <el-table-column label="已使用积分" align="center" prop="usedPoints" width="100" />
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup name="Review">
import { listReview, delReview } from '@/api/customer/review'

const { proxy } = getCurrentInstance()

const dataList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

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
  listReview(queryParams.value).then(response => {
    dataList.value = response.rows
    total.value = response.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
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
  proxy.$modal.confirm('是否确认删除选中的客户数据？').then(function() {
    return delReview(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
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
