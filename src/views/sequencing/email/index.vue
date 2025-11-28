<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
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
          plain
          icon="Message"
          @click="handleSendEmail"
        >邮件发送</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="CircleClose"
          @click="handleIgnoreEmail"
        >邮件忽略</el-button>
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
      <el-table-column label="生产编号" align="center" prop="productionNo" width="100" fixed sortable />
      <el-table-column label="订单号" align="center" prop="orderNo" width="120" />
      <el-table-column label="客户姓名" align="center" prop="customerName" width="100" />
      <el-table-column label="客户地址" align="center" prop="customerAddress" width="150" show-overflow-tooltip />
      <el-table-column label="订单类型" align="center" prop="orderType" width="80" />
      <el-table-column label="客户等级" align="center" prop="customerLevel" width="80" />
      <el-table-column label="试测" align="center" prop="isTest" width="60">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.isTest" />
        </template>
      </el-table-column>
      <el-table-column label="加急" align="center" prop="isUrgent" width="60">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.isUrgent" />
        </template>
      </el-table-column>
      <el-table-column label="样品编号" align="center" prop="sampleNo" width="100" />
      <el-table-column label="测序引物" align="center" prop="sequencingPrimer" width="100" />
      <el-table-column label="引物浓度" align="center" prop="primerConcentration" width="80" />
      <el-table-column label="样品类型" align="center" prop="sampleType" width="80" />
      <el-table-column label="抗生素类型" align="center" prop="antibioticType" width="100" />
      <el-table-column label="是否测通" align="center" prop="isLiquid" width="80">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.isLiquid" />
        </template>
      </el-table-column>
      <el-table-column label="原浓度" align="center" prop="originalConcentration" width="80" />
      <el-table-column label="完成情况" align="center" prop="completionStatus" width="80" />
      <el-table-column label="返回状态" align="center" prop="returnStatus" width="80" />
      <el-table-column label="备注" align="center" prop="remark" width="100" show-overflow-tooltip />
      <el-table-column label="流程ID" align="center" prop="processId" width="80" />
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

<script setup name="Email">
import { listEmail, getEmail, addEmail, updateEmail, delEmail } from '@/api/sequencing/email'

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
  listEmail(queryParams.value).then(response => {
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
  title.value = '添加模板邮件'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getEmail(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改模板邮件'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateEmail(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addEmail(form.value).then(response => {
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
    return delEmail(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/email/export', {
    ...queryParams.value
  }, `email_${new Date().getTime()}.xlsx`)
}

// 占位方法
function handleSendEmail() { proxy.$modal.msgInfo('功能开发中...') }
function handleIgnoreEmail() { proxy.$modal.msgInfo('功能开发中...') }

onMounted(() => {
  // TODO: 等后端接口实现后再启用
  // getList()
  
  // 临时模拟数据
  loading.value = false
  dataList.value = []
  total.value = 0
})
</script>
