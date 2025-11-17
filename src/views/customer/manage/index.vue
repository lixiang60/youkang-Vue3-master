<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="客户名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入客户名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
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
      <el-table-column label="姓名昵称" align="center" prop="name" width="100" fixed show-overflow-tooltip />
      <el-table-column label="拼音" align="center" prop="pinyin" width="80" />
      <el-table-column label="地区" align="center" prop="region" width="100" />
      <el-table-column label="地址" align="center" prop="address" width="150" show-overflow-tooltip />
      <el-table-column label="邮编" align="center" prop="zipCode" width="100" />
      <el-table-column label="电话" align="center" prop="phone" width="130" />
      <el-table-column label="手机" align="center" prop="mobile" width="130" />
      <el-table-column label="邮箱" align="center" prop="email" width="100" />
      <el-table-column label="微信ID" align="center" prop="wechatId" width="100" />
      <el-table-column label="等级" align="center" prop="level" width="80" />
      <el-table-column label="状态" align="center" prop="status" width="80" />
      <el-table-column label="销售员" align="center" prop="salesman" width="100" />
      <el-table-column label="客户单位" align="center" prop="company" width="150" show-overflow-tooltip />
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
      <el-table-column label="冻结积分" align="center" prop="frozenPoints" width="90" />
      <el-table-column label="所属公司" align="center" prop="belongCompany" width="90" />
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['customer:manage:edit']"
          >修改</el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['customer:manage:remove']"
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
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名客户：" prop="name">
              <el-input v-model="form.name" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名拼音：" prop="pinyin">
              <el-input v-model="form.pinyin" placeholder="请输入姓名拼音" />
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
            <el-form-item label="所属公司：" prop="belongCompany">
              <el-select v-model="form.belongCompany" placeholder="请选择所属公司" style="width: 100%">
                <el-option label="杭州有康" value="杭州有康" />
                <el-option label="北京分公司" value="北京分公司" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地址：" prop="address">
              <el-input v-model="form.address" placeholder="请输入详细地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课题组：" prop="researchGroup">
              <el-input v-model="form.researchGroup" placeholder="请输入课题组" style="width: 280px" />
              <el-button icon="Search" circle style="margin-left: 10px"></el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮编：" prop="zipCode">
              <el-input v-model="form.zipCode" placeholder="请输入邮编" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话：" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入固定电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机：" prop="mobile">
              <el-input v-model="form.mobile" placeholder="请输入手机号码" maxlength="11">
                <template #suffix>
                  <el-icon><More /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱：" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="新客户：" prop="isNew">
              <el-radio-group v-model="form.isNew">
                <el-radio label="是">是</el-radio>
                <el-radio label="否">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试测：" prop="isTest">
              <el-radio-group v-model="form.isTest">
                <el-radio label="是">是</el-radio>
                <el-radio label="否">否</el-radio>
              </el-radio-group>
              <span style="margin-left: 10px; color: #999; font-size: 12px">注：如需试测，请选择</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="等级：" prop="level">
              <el-select v-model="form.level" placeholder="请选择等级" style="width: 100%">
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
                <el-radio label="启用">启用</el-radio>
                <el-radio label="禁用">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售员：" prop="salesman">
              <el-input v-model="form.salesman" placeholder="请输入销售员" style="width: 280px" />
              <el-button icon="Search" circle style="margin-left: 10px"></el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户单位：" prop="company">
              <el-input v-model="form.company" placeholder="请输入客户单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结算方式：" prop="paymentMethod">
              <el-select v-model="form.paymentMethod" placeholder="请选择结算方式" style="width: 100%">
                <el-option label="月结" value="月结" />
                <el-option label="现结" value="现结" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票种类：" prop="invoiceType">
              <el-select v-model="form.invoiceType" placeholder="请选择发票种类" style="width: 100%">
                <el-option label="普通发票" value="普通发票" />
                <el-option label="增值税专用发票" value="增值税专用发票" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注：" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
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

<script setup name="Manage">
import { listManage, getManage, addManage, updateManage, delManage } from '@/api/customer/manage'

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
    mobile: undefined,
    status: undefined
  },
  rules: {
    name: [
      { required: true, message: '客户名称不能为空', trigger: 'blur' }
    ],
    mobile: [
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
    customerId: undefined,
    name: undefined,
    pinyin: undefined,
    region: undefined,
    belongCompany: '杭州有康',
    address: undefined,
    researchGroup: undefined,
    zipCode: undefined,
    phone: undefined,
    mobile: undefined,
    email: undefined,
    wechatId: undefined,
    isNew: '是',
    isTest: '否',
    level: '普通',
    status: '启用',
    salesman: undefined,
    company: undefined,
    paymentMethod: undefined,
    invoiceType: undefined,
    deliveryAddress: undefined,
    remark: undefined
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

onMounted(() => {
  // TODO: 等后端接口实现后再启用
  // getList()
  
  // 临时模拟数据，方便查看页面效果
  loading.value = false
  dataList.value = []
  total.value = 0
})
</script>

