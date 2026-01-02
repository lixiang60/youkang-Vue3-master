<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['customer:research_group:add']"
        >添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['customer:research_group:edit']"
        >编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['customer:research_group:remove']"
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
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['customer:research_group:import']"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Money"
          @click="handleSetPrice"
          v-hasPermi="['customer:research_group:price']"
        >设置价格</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Bell"
          @click="handleReminderSettings"
          v-hasPermi="['customer:research_group:reminder']"
        >提醒设置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Wallet"
          @click="handlePrepaymentSettings"
          v-hasPermi="['customer:research_group:prepayment']"
        >预付款设置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Document"
          @click="handleBatchEdit"
          v-hasPermi="['customer:research_group:batch']"
        >批量编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Collection"
          @click="handleGeneLabel"
          v-hasPermi="['customer:research_group:label']"
        >基因标签</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Box"
          @click="handleAllPrices"
          v-hasPermi="['customer:research_group:all_prices']"
        >所有价格</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="PriceTag"
          @click="handleBlankPrice"
          v-hasPermi="['customer:research_group:blank_price']"
        >空白价格</el-button>
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
      <el-table-column label="ID" align="center" prop="id" width="80" fixed sortable />
      <el-table-column label="名称" align="center" prop="name" width="120" fixed show-overflow-tooltip />
      <el-table-column label="地区" align="center" prop="region" width="80" />
      <el-table-column label="业务员" align="center" prop="salesman" width="100" />
      <el-table-column label="结算方式" align="center" prop="paymentMethod" width="100" />
      <el-table-column label="发票抬头" align="center" prop="invoiceTitle" width="150" show-overflow-tooltip />
      <el-table-column label="所属公司" align="center" prop="belongCompany" width="120" show-overflow-tooltip />
      <el-table-column label="所属公司ID" align="center" prop="belongCompanyId" width="100" />
      <el-table-column label="联系人" align="center" prop="contactPerson" width="100" />
      <el-table-column label="联系电话" align="center" prop="contactPhone" width="120" />
      <el-table-column label="预付款课题" align="center" prop="prepaymentSubject" width="120" show-overflow-tooltip />
      <el-table-column label="联系地址" align="center" prop="contactAddress" width="150" show-overflow-tooltip />
      <el-table-column label="添加时间" align="center" prop="createTime" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加人" align="center" prop="addedBy" width="100" />
      <el-table-column label="积分基数" align="center" prop="pointsBase" width="80" />
      <el-table-column label="积分金额" align="center" prop="pointsAmount" width="80" />
      <el-table-column label="是否提醒" align="center" prop="isReminder" width="80" />
      <el-table-column label="提醒内容" align="center" prop="reminderContent" width="120" show-overflow-tooltip />
      <el-table-column label="基因标签类型" align="center" prop="geneLabelType" width="120" />
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['customer:research_group:edit']"
          >修改</el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['customer:research_group:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地区" prop="region">
              <el-input v-model="form.region" placeholder="请输入地区" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务员" prop="salesPerson">
              <el-input v-model="form.salesPerson" placeholder="请输入业务员" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算方式" prop="paymentMethod">
              <el-select v-model="form.paymentMethod" placeholder="请选择结算方式">
                <el-option label="月结" value="月结" />
                <el-option label="现结" value="现结" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票抬头" prop="invoiceTitle">
              <el-input v-model="form.invoiceTitle" placeholder="请输入发票抬头" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属公司" prop="companyId">
              <el-input v-model="form.companyId" placeholder="请输入所属公司" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="积分基数" prop="pointsBase">
              <el-input v-model="form.pointsBase" placeholder="请输入积分基数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="积分金额" prop="pointsAmount">
              <el-input v-model="form.pointsAmount" placeholder="请输入积分金额" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="联系地址" prop="contactAddress">
              <el-input v-model="form.contactAddress" placeholder="请输入联系地址" />
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

<script setup name="Research_group">
import { listResearch_group, getResearch_group, addResearch_group, updateResearch_group, delResearch_group } from '@/api/customer/research_group'

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
  listResearch_group(queryParams.value).then(response => {
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
    region: undefined,
    salesPerson: undefined,
    paymentMethod: undefined,
    invoiceTitle: undefined,
    companyId: undefined,
    contactPerson: undefined,
    contactPhone: undefined,
    contactAddress: undefined,
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
  title.value = '添加课题组'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getResearch_group(id).then(response => {
    form.value = {
      ...response.data,
      salesPerson: response.data.salesman, // Map old field to new field
      companyId: response.data.belongCompany // Map old field to new field (adjust if belongCompanyId is correct)
    }
    open.value = true
    title.value = '修改课题组'
  })
}

/** 导入按钮操作 */
function handleImport() {
  proxy.$modal.msgInfo('导入功能开发中...')
}

/** 设置价格按钮操作 */
function handleSetPrice() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置价格的课题组')
    return
  }
  proxy.$modal.msgInfo('设置价格功能开发中...')
}

/** 提醒设置按钮操作 */
function handleReminderSettings() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置提醒的课题组')
    return
  }
  proxy.$modal.msgInfo('提醒设置功能开发中...')
}

/** 预付款设置按钮操作 */
function handlePrepaymentSettings() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要设置预付款的课题组')
    return
  }
  proxy.$modal.msgInfo('预付款设置功能开发中...')
}

/** 批量编辑按钮操作 */
function handleBatchEdit() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要批量编辑的课题组')
    return
  }
  proxy.$modal.msgInfo('批量编辑功能开发中...')
}

/** 基因标签按钮操作 */
function handleGeneLabel() {
  proxy.$modal.msgInfo('基因标签功能开发中...')
}

/** 所有价格按钮操作 */
function handleAllPrices() {
  proxy.$modal.msgInfo('所有价格功能开发中...')
}

/** 空白价格按钮操作 */
function handleBlankPrice() {
  proxy.$modal.msgInfo('空白价格功能开发中...')
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        const updateData = {
          ...form.value,
          salesman: form.value.salesPerson, // Map new field back to old field
          belongCompany: form.value.companyId // Map new field back to old field
        }
        updateResearch_group(updateData).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addResearch_group(form.value).then(response => {
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
    return delResearch_group(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('customer/research_group/export', {
    ...queryParams.value
  }, `research_group_${new Date().getTime()}.xlsx`)
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
