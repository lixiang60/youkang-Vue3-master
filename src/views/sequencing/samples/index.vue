<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sequencing:samples:edit']"
        >编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sequencing:samples:remove']"
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
          icon="EditPen"
          @click="handleOriginalConcentration"
        >原浓度</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="CircleClose"
          @click="handleClearWellNo"
        >清除孔号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Delete"
          @click="handleClearConcentration"
        >清空浓度</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="DeleteFilled"
          @click="handleClearTemplate"
        >清空模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="DocumentDelete"
          @click="handleClearReport"
        >清空报告</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="DataLine"
          @click="handleWeeklyReport"
        >周报</el-button>
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
          icon="ShoppingBag"
          @click="handleSelfProvidedPrimer"
        >自备引物</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Box"
          @click="handleTemplateVolumeMonitor"
        >模板量监控</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="DocumentCopy"
          @click="handleBatchEdit"
        >批量编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Key"
          @click="handleAddTest"
        >加测</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Link"
          @click="handleLinkPrimer"
        >关联引物</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Files"
          @click="handleAddTestTemplate"
        >加测模板</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Timer"
          @click="handleSupplementLabel"
        >补样标签</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="CircleCheck"
          @click="handleReEnable"
        >重新启用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Camera"
          @click="handleAddPrimer"
        >添加引物</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="List"
          @click="handleSampleInfo"
        >样品信息</el-button>
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
      <el-table-column label="订单号" align="center" prop="orderId" width="120" fixed />
      <el-table-column label="历史订单" align="center" prop="orderHistory" width="120" />
      <el-table-column label="样品编号" align="center" prop="sampleId" width="120" fixed />
      <el-table-column label="样品类型" align="center" prop="sampleType" width="80" />
      <el-table-column label="样品位置" align="center" prop="samplePosition" width="80" />
      <el-table-column label="测序引物" align="center" prop="primer" width="100" />
      <el-table-column label="引物类型" align="center" prop="primerType" width="80" />
      <el-table-column label="引物位置" align="center" prop="primerPosition" width="80" />
      <el-table-column label="引物浓度" align="center" prop="primerConcentration" width="80" />
      <el-table-column label="序列" align="center" prop="seq" width="100" show-overflow-tooltip />
      <el-table-column label="测序项目" align="center" prop="project" width="100" />
      <el-table-column label="载体名称" align="center" prop="carrierName" width="100" />
      <el-table-column label="抗生素类型" align="center" prop="antibioticType" width="100" />
      <el-table-column label="质粒长度" align="center" prop="plasmidLength" width="80" />
      <el-table-column label="片段大小" align="center" prop="fragmentSize" width="80" />
      <el-table-column label="是否测通" align="center" prop="testResult" width="80" />
      <el-table-column label="原浓度" align="center" prop="originConcentration" width="80" />
      <el-table-column label="模板板号" align="center" prop="templatePlateNo" width="80" />
      <el-table-column label="模板孔号" align="center" prop="templateHoleNo" width="80" />
      <el-table-column label="完成情况" align="center" prop="performance" width="80" />
      <el-table-column label="返回状态" align="center" prop="returnState" width="80" />
      <el-table-column label="流程名称" align="center" prop="flowName" width="100" />
      <el-table-column label="板号" align="center" prop="plateNo" width="80" />
      <el-table-column label="孔号" align="center" prop="holeNo" width="80" />
      <el-table-column label="所属公司" align="center" prop="belongCompany" width="120" />
      <el-table-column label="生产公司" align="center" prop="produceCompany" width="120" />
      <el-table-column label="孔号数量" align="center" prop="holeNumber" width="80" />
      <el-table-column label="排版方式" align="center" prop="layout" width="80" />
      <el-table-column label="创建人" align="center" prop="createUser" width="100" />
      <el-table-column label="完成时间" align="center" prop="createTime" width="160" />
      <el-table-column label="备注" align="center" prop="remark" width="100" show-overflow-tooltip />
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号：" prop="orderId">
              <el-input v-model="form.orderId" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户ID：" prop="customerId">
              <el-input v-model="form.customerId" placeholder="请输入客户ID" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名：" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户地址：" prop="customerAddress">
              <el-input v-model="form.customerAddress" placeholder="请输入客户地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户等级：" prop="customerLevel">
              <el-input v-model="form.customerLevel" placeholder="请输入客户等级" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试测：" prop="trial">
              <el-input v-model="form.trial" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加急：" prop="urgent">
              <el-input v-model="form.urgent" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样品编号：" prop="sampleId">
              <el-input v-model="form.sampleId" placeholder="请输入样品编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测序引物：" prop="primer">
              <el-input v-model="form.primer" placeholder="请输入测序引物" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="引物浓度：" prop="primerConcentration">
              <el-input v-model="form.primerConcentration" placeholder="请输入引物浓度" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="样品类型：" prop="sampleType">
              <el-select v-model="form.sampleType" placeholder="请选择" style="width: 100%">
                <el-option label="菌液" value="菌液" />
                <el-option label="质粒" value="质粒" />
                <el-option label="PCR产物" value="PCR产物" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="抗生素类型：" prop="antibioticType">
              <el-select v-model="form.antibioticType" placeholder="请选择" style="width: 100%">
                <el-option label="Amp" value="Amp" />
                <el-option label="Kan" value="Kan" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="载体名称：" prop="carrierName">
              <el-input v-model="form.carrierName" placeholder="请输入载体名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="片段大小：" prop="fragmentSize">
              <el-input v-model="form.fragmentSize" placeholder="请输入片段大小" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板板号：" prop="templatePlateNo">
              <el-input v-model="form.templatePlateNo" placeholder="请输入模板板号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板孔号：" prop="templateHoleNo">
              <el-input v-model="form.templateHoleNo" placeholder="请输入模板孔号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否测通：" prop="testResult">
              <el-input v-model="form.testResult" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样品位置：" prop="samplePosition">
              <el-input v-model="form.samplePosition" placeholder="请输入样品位置" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="序列：" prop="seq">
              <el-input v-model="form.seq" placeholder="请输入序列" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测序项目：" prop="project">
              <el-input v-model="form.project" placeholder="请输入测序项目" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="质粒长度：" prop="plasmidLength">
              <el-input v-model="form.plasmidLength" placeholder="请输入质粒长度" />
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
          <el-button type="success" @click="submitForm">确 定</el-button>
          <el-button type="danger" @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Samples">
import { listSamples, getSamples, addSamples, updateSamples, delSamples } from '@/api/sequencing/samples'

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
    orderId: undefined,
    sampleId: undefined,
    sampleType: undefined,
    primer: undefined,
    primerType: undefined,
    project: undefined,
    plateNo: undefined
  },
  rules: {
    orderId: [
      { required: true, message: '订单号不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listSamples(queryParams.value).then(response => {
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
    orderId: undefined,
    customerId: undefined,
    customerName: undefined,
    customerAddress: undefined,
    customerLevel: undefined,
    trial: undefined,
    urgent: undefined,
    sampleId: undefined,
    primer: undefined,
    primerConcentration: undefined,
    sampleType: undefined,
    antibioticType: undefined,
    carrierName: undefined,
    fragmentSize: undefined,
    templatePlateNo: undefined,
    templateHoleNo: undefined,
    testResult: undefined,
    samplePosition: undefined,
    seq: undefined,
    project: undefined,
    plasmidLength: undefined,
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
  ids.value = selection.map(item => item.sampleId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加测序样品'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const sampleId = row.sampleId || ids.value
  getSamples(sampleId).then(response => {
    form.value = response.data
    form.value._isEdit = true
    open.value = true
    title.value = '修改测序样品'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value._isEdit) {
        updateSamples(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addSamples(form.value).then(response => {
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
  const idList = row.sampleId || ids.value
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function() {
    return delSamples(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/samples/export', {
    ...queryParams.value
  }, `samples_${new Date().getTime()}.xlsx`)
}

// 占位方法
function handleOriginalConcentration() { proxy.$modal.msgInfo('功能开发中...') }
function handleClearWellNo() { proxy.$modal.msgInfo('功能开发中...') }
function handleClearConcentration() { proxy.$modal.msgInfo('功能开发中...') }
function handleClearTemplate() { proxy.$modal.msgInfo('功能开发中...') }
function handleClearReport() { proxy.$modal.msgInfo('功能开发中...') }
function handleWeeklyReport() { proxy.$modal.msgInfo('功能开发中...') }
function handleArrangeReturn() { proxy.$modal.msgInfo('功能开发中...') }
function handleSelfProvidedPrimer() { proxy.$modal.msgInfo('功能开发中...') }
function handleTemplateVolumeMonitor() { proxy.$modal.msgInfo('功能开发中...') }
function handleBatchEdit() { proxy.$modal.msgInfo('功能开发中...') }
function handleAddTest() { proxy.$modal.msgInfo('功能开发中...') }
function handleLinkPrimer() { proxy.$modal.msgInfo('功能开发中...') }
function handleAddTestTemplate() { proxy.$modal.msgInfo('功能开发中...') }
function handleSupplementLabel() { proxy.$modal.msgInfo('功能开发中...') }
function handleReEnable() { proxy.$modal.msgInfo('功能开发中...') }
function handleAddPrimer() { proxy.$modal.msgInfo('功能开发中...') }
function handleSampleInfo() { proxy.$modal.msgInfo('功能开发中...') }

onMounted(() => {
  getList()
})
</script>
