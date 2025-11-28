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
          v-hasPermi="['sequencing:return:remove']"
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
          type="success"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sequencing:return:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="ShoppingCart"
          @click="handleDeliveryDetails"
        >发货明细</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Promotion"
          @click="handleArrangeReturn"
        >安排返还</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="CollectionTag"
          @click="handleReturnLabel"
        >返还标签</el-button>
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
      <el-table-column label="客户姓名" align="center" prop="customerName" width="100" />
      <el-table-column label="订单号" align="center" prop="orderNo" width="120" />
      <el-table-column label="安排时间" align="center" prop="arrangeTime" width="160" />
      <el-table-column label="安排人" align="center" prop="arrangeBy" width="100" />
      <el-table-column label="返还类型" align="center" prop="returnType" width="120" show-overflow-tooltip />
      <el-table-column label="返还数量" align="center" prop="returnQuantity" width="80" />
      <el-table-column label="生产编号范围" align="center" prop="productionNoRange" width="150" show-overflow-tooltip />
      <el-table-column label="生产编号集" align="center" prop="productionNoSet" width="150" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" width="100" />
      <el-table-column label="返还时间" align="center" prop="returnTime" width="160" />
      <el-table-column label="返还人" align="center" prop="returnBy" width="100" />
      <el-table-column label="所属公司" align="center" prop="belongCompany" width="120" show-overflow-tooltip />
      <el-table-column label="生产公司" align="center" prop="productionCompany" width="120" show-overflow-tooltip />
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

<script setup name="Return">
import { listReturn, getReturn, addReturn, updateReturn, delReturn } from '@/api/sequencing/return'

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
    name: [
      { required: true, message: '名称不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listReturn(queryParams.value).then(response => {
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
  const idList = row.id || ids.value
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function() {
    return delReturn(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/return/export', {
    ...queryParams.value
  }, `return_${new Date().getTime()}.xlsx`)
}

// 占位方法
function handleDeliveryDetails() { proxy.$modal.msgInfo('功能开发中...') }
function handleArrangeReturn() { proxy.$modal.msgInfo('功能开发中...') }
function handleReturnLabel() { proxy.$modal.msgInfo('功能开发中...') }

onMounted(() => {
  // TODO: 等后端接口实现后再启用
  // getList()
  
  // 临时模拟数据
  loading.value = false
  dataList.value = []
  total.value = 0
})
</script>
