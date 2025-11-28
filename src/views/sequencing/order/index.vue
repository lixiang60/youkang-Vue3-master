<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['sequencing:order:add']"
        >添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sequencing:order:edit']"
        >编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sequencing:order:remove']"
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
          icon="Document"
          @click="handleSequencingOrder"
        >测序订单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="DocumentCopy"
          @click="handleSequencingSample"
        >测序样品</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Files"
          @click="handleBatchAdd"
        >批量添加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Printer"
          @click="handleLabelPrint"
        >标签打印</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Operation"
          @click="handleInternalOperation"
        >内部操作表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="DataBoard"
          @click="handleDailyReport"
        >业务员日报表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Monitor"
          @click="handleOrderMonitor"
        >订单量监控</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Switch"
          @click="handleTransfer"
        >调拨</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="List"
          @click="handleGeneSequencingOrder"
        >基因测序单</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="CollectionTag"
          @click="handleTemplateLabel"
        >模板标签</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="RefreshRight"
          @click="handleSyncYoukang"
        >同步康为</el-button>
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
      <el-table-column label="订单号" align="center" prop="orderNo" width="120" fixed sortable />
      <el-table-column label="客户ID" align="center" prop="customerId" width="80" fixed />
      <el-table-column label="客户姓名" align="center" prop="customerName" width="100" fixed show-overflow-tooltip />
      <el-table-column label="客户地址" align="center" prop="customerAddress" width="150" show-overflow-tooltip />
      <el-table-column label="课题组ID" align="center" prop="researchGroupId" width="80" />
      <el-table-column label="课题组" align="center" prop="researchGroupName" width="120" show-overflow-tooltip />
      <el-table-column label="订单类型" align="center" prop="orderType" width="100" />
      <el-table-column label="测序代数" align="center" prop="sequencingCodeNum" width="80" />
      <el-table-column label="订单信息" align="center" prop="orderInfo" width="120" show-overflow-tooltip />
      <el-table-column label="备注" align="center" prop="remark" width="100" show-overflow-tooltip />
      <el-table-column label="同步康为" align="center" prop="syncYoukang" width="80">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.syncYoukang" />
        </template>
      </el-table-column>
      <el-table-column label="添加时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加人" align="center" prop="createBy" width="100" />
      <el-table-column label="审核人" align="center" prop="auditor" width="100" />
      <el-table-column label="当日订单号" align="center" prop="dailyOrderNo" width="100" />
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
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="客户选择：" prop="customerId">
              <el-input v-model="form.customerId" placeholder="请选择客户" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮件是否发送：" prop="sendEmail">
              <el-radio-group v-model="form.sendEmail">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否模板排版：" prop="templateArrangement">
              <el-radio-group v-model="form.templateArrangement">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测序生产实验室：" prop="sequencingLab">
              <el-select v-model="form.sequencingLab" placeholder="请选择" style="width: 100%">
                <el-option label="实验室A" value="A" />
                <el-option label="实验室B" value="B" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合成生产实验室：" prop="synthesisLab">
              <el-select v-model="form.synthesisLab" placeholder="请选择" style="width: 100%">
                <el-option label="实验室A" value="A" />
                <el-option label="实验室B" value="B" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="信息不全：" prop="infoIncomplete">
              <el-select v-model="form.infoIncomplete" placeholder="请选择" style="width: 100%">
                <el-option label="是" value="1" />
                <el-option label="否" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="送样日期：" prop="sampleDeliveryDate">
              <el-date-picker
                v-model="form.sampleDeliveryDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加急：" prop="urgent">
              <el-radio-group v-model="form.urgent">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板样式：" prop="templateStyle">
              <el-radio-group v-model="form.templateStyle">
                <el-radio label="1">复制excel模式</el-radio>
                <el-radio label="2">EXCEL模板</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="测序级别：" prop="sequencingLevel">
              <el-radio-group v-model="form.sequencingLevel">
                <el-radio label="1">一代</el-radio>
                <el-radio label="4">四代</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="模板内容：" prop="templateContent">
              <el-input v-model="form.templateContent" type="textarea" :rows="5" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测序模板附件：" prop="sequencingTemplateAttachment">
              <div style="display: flex; width: 100%">
                <el-input v-model="form.sequencingTemplateAttachment" readonly />
                <el-button type="info" plain class="ml10">选择文件</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加测合成模板附件：" prop="synthesisTemplateAttachment">
              <div style="display: flex; width: 100%">
                <el-input v-model="form.synthesisTemplateAttachment" readonly />
                <el-button type="info" plain class="ml10">选择文件</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="拍照附件：" prop="photoAttachment">
              <div style="display: flex; width: 100%">
                <el-input v-model="form.photoAttachment" readonly />
                <el-button type="info" plain class="ml10">拍照</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联基因样品编号：" prop="linkedGeneSampleNo">
              <div style="display: flex; width: 100%">
                <el-input v-model="form.linkedGeneSampleNo" />
                <span class="ml10" style="white-space: nowrap">(非必填项目)</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item>
              <el-button>上传截图</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注：" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="primary" @click="submitForm">添 加</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, addOrder, updateOrder, delOrder } from '@/api/sequencing/order'

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
    customerId: [
      { required: true, message: '客户不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listOrder(queryParams.value).then(response => {
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
    sendEmail: '1',
    templateArrangement: '1',
    sequencingLab: undefined,
    synthesisLab: undefined,
    infoIncomplete: undefined,
    sampleDeliveryDate: new Date().toISOString().split('T')[0],
    urgent: '0',
    templateStyle: '1',
    sequencingLevel: '1',
    templateContent: undefined,
    sequencingTemplateAttachment: undefined,
    synthesisTemplateAttachment: undefined,
    photoAttachment: undefined,
    linkedGeneSampleNo: undefined,
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
  title.value = '添加订单'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getOrder(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改订单'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateOrder(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addOrder(form.value).then(response => {
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
    return delOrder(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

// 占位方法
function handleSequencingOrder() { proxy.$modal.msgInfo('功能开发中...') }
function handleSequencingSample() { proxy.$modal.msgInfo('功能开发中...') }
function handleBatchAdd() { proxy.$modal.msgInfo('功能开发中...') }
function handleLabelPrint() { proxy.$modal.msgInfo('功能开发中...') }
function handleInternalOperation() { proxy.$modal.msgInfo('功能开发中...') }
function handleDailyReport() { proxy.$modal.msgInfo('功能开发中...') }
function handleOrderMonitor() { proxy.$modal.msgInfo('功能开发中...') }
function handleTransfer() { proxy.$modal.msgInfo('功能开发中...') }
function handleGeneSequencingOrder() { proxy.$modal.msgInfo('功能开发中...') }
function handleTemplateLabel() { proxy.$modal.msgInfo('功能开发中...') }
function handleSyncYoukang() { proxy.$modal.msgInfo('功能开发中...') }

onMounted(() => {
  // TODO: 等后端接口实现后再启用
  // getList()
  
  // 临时模拟数据
  loading.value = false
  dataList.value = []
  total.value = 0
})
</script>
