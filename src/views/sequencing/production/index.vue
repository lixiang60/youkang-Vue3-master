<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small"
          plain
          icon="Search"
          @click="toggleSearchPanel"
        >查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          plain
          icon="Refresh"
          @click="handleRefresh"
        >刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="primary"
          plain
          icon="EditPen"
          @click="handleOriginConcentration"
          :disabled="multiple"
        >原浓度</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="success"
          plain
          icon="Finished"
          @click="handleTemplateStatus"
          :disabled="multiple"
        >模板状态</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="danger"
          plain
          icon="RefreshLeft"
          @click="handleSendBack"
          :disabled="multiple"
        >退回</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="info"
          plain
          icon="Histogram"
          @click="handlePcrGelCut"
        >PCR切胶</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          plain
          icon="List"
          @click="handleResampleList"
        >重抽操作表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          plain
          icon="Camera"
          @click="showSearch = !showSearch"
        >图像设置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
      size="small"
      :header-cell-style="{ fontSize: '12px' }"
      v-loading="loading" 
      :data="dataList" 
      :columns="columns"
      :total="total"
      @selection-change="handleSelectionChange"
    />

    

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产编号" prop="productionNo">
              <el-input v-model="form.productionNo" placeholder="请输入生产编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="form.orderNo" placeholder="请输入订单号" />
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

    <!-- 设置模板状态对话框 -->
    <el-dialog title="设置模板状态" v-model="statusOpen" width="450px" append-to-body>
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="返回状态">
          <el-select v-model="statusForm.returnState" placeholder="请选择" style="width: 100%">
            <el-option label="模板成功" value="模板成功" />
            <el-option label="模板失败" value="模板失败" />
            <el-option label="模板重抽" value="模板重抽" />
            <el-option label="模板重切" value="模板重切" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="statusForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitStatus">确 定</el-button>
          <el-button @click="statusOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置原浓度对话框 -->
    <el-dialog title="设置原浓度" v-model="concOpen" width="500px" append-to-body>
      <el-form :model="concForm" label-width="100px">
        <el-form-item label="原浓度">
          <el-input v-model="concForm.originConcentration" placeholder="请输入原浓度" />
        </el-form-item>
        <el-form-item label="排版方式">
          <el-radio-group v-model="concForm.templateStype">
            <el-radio label="横排">横排</el-radio>
            <el-radio label="竖排">竖排</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="板号">
          <el-input v-model="concForm.plateNo" placeholder="请输入板号 (有值则流转到反应生产)" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="concForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitConc">确 定</el-button>
          <el-button @click="concOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 退回备注对话框 -->
    <el-dialog title="模板生产退回" v-model="sendBackOpen" width="450px" append-to-body>
      <el-form :model="sendBackForm" label-width="80px">
        <el-form-item label="备注">
          <el-input v-model="sendBackForm.remark" type="textarea" placeholder="请输入退回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitSendBack">确 定</el-button>
          <el-button @click="sendBackOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Production">
import { listProduceTemplate, updateProduceTempStatus, updateProduceOriginConcentration, sendBackProduce } from '@/api/sequencing/production'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const searchRef = ref(null)
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

const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'produceId', label: '生产编号', width: 120, fixed: true, sortable: true, visible: true },
  { key: 'orderId', label: '订单号', width: 160, fixed: true, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, fixed: true, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'customerLevel', label: '客户等级', width: 80, visible: true },
  { key: 'groupName', label: '课题组', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'samplePosition', label: '样品对应号', width: 100, visible: true },
  { key: 'sampleId', label: '样品编号', width: 120, visible: true },
  { key: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'primerConcentration', label: '引物浓度', width: 80, visible: true },
  { key: 'sampleType', label: '样品类型', width: 80, visible: true },
  { key: 'carrierName', label: '载体名称', width: 100, visible: true },
  { key: 'antibioticType', label: '抗生素类型', width: 100, visible: true },
  { key: 'templatePlateNo', label: '模板板号', width: 80, visible: true },
  { key: 'templateHoleNo', label: '模板孔号', width: 80, visible: true },
  { key: 'returnState', label: '返回状态', width: 80, visible: true },
  { key: 'originHoleNo', label: '原孔号', width: 80, visible: true },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: true }
])

const cacheKey = 'sequencing_production_columns_visible'
const savedColumns = localStorage.getItem(cacheKey)
if (savedColumns) {
  try {
    const cache = JSON.parse(savedColumns)
    columns.value.forEach(col => {
      const key = col.key || col.prop || col.type
      if (key && cache[key] !== undefined) col.visible = cache[key]
    })
  } catch (e) {}
}
watch(columns, (newVal) => {
  const cache = {}
  newVal.forEach(col => { if (col.key) cache[col.key] = col.visible })
  localStorage.setItem(cacheKey, JSON.stringify(cache))
}, { deep: true })

// 检索配置
const searchFields = ref([
  { prop: 'templateNo', label: '板号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' }
])

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateNo: undefined,
    orderId: undefined,
    customerName: undefined,
    sampleId: undefined,
    sampleType: undefined,
    createUser: undefined
  },
  rules: {
    productionNo: [
      { required: true, message: '生产编号不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listProduceTemplate(queryParams.value).then(response => {
    dataList.value = response.data ? response.data.rows : response.rows
    total.value = response.data ? response.data.total : response.total
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
    productionNo: undefined,
    orderNo: undefined,
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
  ids.value = selection.map(item => item.produceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加模板生产'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getProduction(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改模板生产'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateProduction(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addProduction(form.value).then(response => {
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
    return delProduction(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/production/export', {
    ...queryParams.value
  }, `production_${new Date().getTime()}.xlsx`)
}

// 业务逻辑方法
function handleOriginConcentration() {
  if (ids.value.length === 0) return
  concForm.value = {
    produceIdList: ids.value,
    originConcentration: undefined,
    templateStype: '横排',
    plateNo: undefined,
    remark: undefined
  }
  concOpen.value = true
}

function submitConc() {
  updateProduceOriginConcentration(concForm.value).then(() => {
    proxy.$modal.msgSuccess('设置成功')
    concOpen.value = false
    getList()
  })
}

function handleTemplateStatus() {
  if (ids.value.length === 0) return
  statusForm.value = {
    produceIdList: ids.value,
    returnState: '模板成功',
    remark: undefined
  }
  statusOpen.value = true
}

function submitStatus() {
  updateProduceTempStatus(statusForm.value).then(() => {
    proxy.$modal.msgSuccess('设置成功')
    statusOpen.value = false
    getList()
  })
}

function handleSendBack() {
  if (ids.value.length === 0) return
  sendBackForm.value = {
    produceIdList: ids.value,
    remark: undefined
  }
  sendBackOpen.value = true
}

function submitSendBack() {
  sendBackProduce(sendBackForm.value).then(() => {
    proxy.$modal.msgSuccess('退回成功')
    sendBackOpen.value = false
    getList()
  })
}

function handlePcrGelCut() {
  proxy.$modal.msgInfo('功能开发中...')
}

function handleResampleList() {
  proxy.$modal.msgInfo('功能开发中...')
}

const statusOpen = ref(false)
const statusForm = ref({})
const concOpen = ref(false)
const concForm = ref({})
const sendBackOpen = ref(false)
const sendBackForm = ref({})

onMounted(() => {
  getList()
})
</script>

<style scoped>

:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
}

</style>
