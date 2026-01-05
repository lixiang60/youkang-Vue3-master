<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="启用" value="启用" />
          <el-option label="停用" value="停用" />
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
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['customer:manage:add']"
        >添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['customer:manage:edit']"
        >修改设置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Edit"
          @click="handleEdit"
        >编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['customer:manage:remove']"
        >删除</el-button>
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
          icon="ShoppingCart"
          @click="handlePurchase"
        >购买其他</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Star"
          @click="handleTransferPoints"
        >转至积分</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Setting"
          @click="handleContinueSetting"
        >继续设置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      :loading="loading"
      :data="dataList"
      :columns="columns"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    >
      <template #createTime="{ row }">
        <span>{{ parseTime(row.createTime, '{y}-{m}-{d}') }}</span>
      </template>

      <template #action="{ row }">
        <el-button
          link
          type="primary"
          icon="Edit"
          @click="handleUpdate(row)"
          v-hasPermi="['customer:manage:edit']"
        >修改</el-button>
        <el-button
          link
          type="primary"
          icon="Delete"
          @click="handleDelete(row)"
          v-hasPermi="['customer:manage:remove']"
        >删除</el-button>
      </template>
    </dynamic-table>



    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名客户：" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="所属公司：" prop="company">
              <el-select v-model="form.company" placeholder="请选择所属公司" style="width: 100%">
                <el-option label="杭州有康" value="杭州有康" />
                <el-option label="北京分公司" value="北京分公司" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地区：" prop="region">
              <el-select v-model="form.region" placeholder="请选择地区" style="width: 100%">
                <el-option label="华东" value="华东" />
                <el-option label="华北" value="华北" />
                <el-option label="华南" value="华南" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址：" prop="address">
              <el-input v-model="form.address" placeholder="请输入详细地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课题组：" prop="subjectGroupId">
              <el-input v-model="form.subjectGroupName" placeholder="请输入课题组" style="width: 280px" readonly />
              <el-button icon="Search" circle style="margin-left: 10px" @click="openSubjectGroupSelector"></el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="手机：" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11">
                <template #suffix>
                  <el-icon><More /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱：" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="微信ID：" prop="wechatId">
              <el-input v-model="form.wechatId" placeholder="请输入微信ID" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="等级：" prop="customerLevel">
              <el-select v-model="form.customerLevel" placeholder="请选择等级" style="width: 100%">
                <el-option label="普通" value="普通" />
                <el-option label="VIP1" value="VIP1" />
                <el-option label="VIP2" value="VIP2" />
                <el-option label="VIP3" value="VIP3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态：" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="1">启用</el-radio>
                <el-radio label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售员：" prop="salesPerson">
              <el-input v-model="form.salesPerson" placeholder="请输入销售员" style="width: 280px" />
              <el-button icon="Search" circle style="margin-left: 10px"></el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户单位：" prop="customerUnit">
              <el-input v-model="form.customerUnit" placeholder="请输入客户单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结算方式：" prop="paymentMethod">
              <dynamic-selector v-model="form.paymentMethod" type="paymentMethod" placeholder="请选择结算方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票种类：" prop="invoiceType">
              <dynamic-selector v-model="form.invoiceType" type="invoiceType" placeholder="请选择发票种类" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注：" prop="remarks">
              <el-input v-model="form.remarks" type="textarea" :rows="4" placeholder="请输入备注信息" />
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

    <!-- 课题组选择组件 -->
    <subject-group-selector
      v-model="showSubjectGroupSelector"
      :selected-id="form.subjectGroupId"
      @confirm="handleSubjectGroupSelect"
    />
  </div>
</template>

<script setup name="Manage">
import { listManage, getManage, addManage, updateManage, delManage } from '@/api/customer/manage'
import SubjectGroupSelector from '@/views/customer/components/SubjectGroupSelector.vue'
import DynamicSelector from '@/components/DynamicSelector/index.vue'
import DynamicTable from '@/components/DynamicTable/index.vue'

const { proxy } = getCurrentInstance()

const dataList = ref([])
const open = ref(false)
const showSubjectGroupSelector = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

// 列信息
const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'id', label: '客户ID', width: 80, fixed: true, visible: true },
  { key: 'customerName', label: '姓名昵称', width: 100, fixed: true, showOverflowTooltip: true, visible: true },
  { key: 'subjectGroupName', label: '课题组', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'region', label: '地区', width: 100, visible: true },
  { key: 'address', label: '地址', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'phone', label: '手机', width: 130, visible: true },
  { key: 'email', label: '邮箱', width: 100, visible: true },
  { key: 'wechatId', label: '微信ID', width: 100, visible: false },
  { key: 'customerLevel', label: '等级', width: 80, visible: false },
  { key: 'status', label: '状态', width: 80, visible: true },
  { key: 'salesPerson', label: '销售员', width: 100, visible: true },
  { key: 'customerUnit', label: '客户单位', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'invoiceType', label: '发票种类', width: 120, visible: false },
  { key: 'remarks', label: '备注', width: 100, showOverflowTooltip: true, visible: false },
  { key: 'createBy', label: '添加人', width: 100, visible: false },
  { key: 'createTime', label: '时间', width: 110, visible: false, slot: 'createTime' },
  { key: 'totalPoints', label: '总积分', width: 80, visible: true },
  { key: 'availablePoints', label: '可用积分', width: 90, visible: true },
  { key: 'usedPoints', label: '已使用积分', width: 100, visible: false },
  { key: 'frozenPoints', label: '冻结积分', width: 90, visible: false },
  { key: 'company', label: '所属公司', width: 90, visible: false },
  { label: '操作', width: 150, fixed: 'right', slot: 'action', align: 'center', visible: true }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: undefined,
    phone: undefined,
    status: undefined
  },
  rules: {
    customerName: [
      { required: true, message: '客户名称不能为空', trigger: 'blur' }
    ],
    phone: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    email: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listManage(queryParams.value).then(response => {
    dataList.value = response.data.rows
    total.value = response.data.total
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
    customerId: undefined,
    customerName: '',
    region: '',
    company: '杭州有康',
    address: '',
    subjectGroupId: '',
    subjectGroupName: '',
    phone: '',
    email: '',
    wechatId: '',
    customerLevel: '普通',
    status: '启用',
    salesPerson: '',
    customerUnit: '',
    paymentMethod: '',
    invoiceType: '',
    remarks: ''
  }
  proxy.resetForm('formRef')
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
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
  title.value = '添加客户'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getManage(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改客户信息'
  })
}

/** 编辑按钮操作 */
function handleEdit() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要编辑的客户')
    return
  }
  handleUpdate()
}

/** 刷新按钮操作 */
function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

/** 购买其他按钮操作 */
function handlePurchase() {
  proxy.$modal.msgInfo('购买其他功能开发中...')
}

/** 转至积分按钮操作 */
function handleTransferPoints() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择要转积分的客户')
    return
  }
  proxy.$modal.msgInfo('转至积分功能开发中...')
}

/** 继续设置按钮操作 */
function handleContinueSetting() {
  proxy.$modal.msgInfo('继续设置功能开发中...')
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateManage(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addManage(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除选中的客户数据？').then(function() {
    return delManage(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('customer/manage/export', {
    ...queryParams.value
  }, `customer_${new Date().getTime()}.xlsx`)
}

/** 打开课题组选择弹窗 */
function openSubjectGroupSelector() {
  showSubjectGroupSelector.value = true
}

/** 课题组选择回调 */
function handleSubjectGroupSelect(group) {
  form.value.subjectGroupId = group.id
  form.value.subjectGroupName = group.name
}

onMounted(() => {
  getList()
})
</script>

