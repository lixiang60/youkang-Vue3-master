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
          type="success"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sequencing:schedule:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          plain
          icon="DocumentAdd"
          @click="handleAddPlateNo"
        >添加板号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="warning"
          plain
          icon="CirclePlus"
          @click="handleAddWellNo"
        >添加孔号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="success"
          plain
          icon="Notebook"
          @click="handleLayoutStrategy"
        >排版忽略</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small"
          type="info"
          plain
          icon="Printer"
          @click="handleTemplateBDT"
        >模板BDT</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
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

    <!-- 步骤1：确认生产编号对话框 (仿制用户截图样式) -->
    <el-dialog title="模板版号设置-样品备注" v-model="openConfirmPlate" width="800px" append-to-body>
      <div style="border: 1px solid #dcdfe6; border-radius: 4px;">
        <div style="background: #f5f7fa; padding: 10px; border-bottom: 1px solid #dcdfe6; font-weight: bold; font-size: 14px; display: flex; align-items: center;">
          <el-icon style="margin-right: 5px; color: #409EFF;"><List /></el-icon> 数据列表
        </div>
        <el-table :data="selectedRows" stripe border size="small" style="width: 100%" height="400">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="produceId" label="生产编号" header-align="center" align="left" />
          <el-table-column prop="remark" label="备注" header-align="center" align="left" min-width="200" show-overflow-tooltip />
        </el-table>
        <div style="background: #f5f7fa; padding: 5px 15px; border-top: 1px solid #dcdfe6; font-size: 12px; color: #606266; text-align: right;">
          共 1 页 >> 100 <<  1 - {{ selectedRows.length }}  共 {{ selectedRows.length }} 条
        </div>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px;">
          <el-button type="success" icon="Check" @click="proceedToPlateConfig" style="width: 100px; border-radius: 20px;"> 确 定 </el-button>
          <el-button type="info" icon="Close" @click="openConfirmPlate = false" style="width: 100px; border-radius: 20px;"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 步骤2：添加板号对话框 (采用与添加孔号一致的高级样式) -->
    <el-dialog title="第二步：添加模板板号" v-model="openPlate" width="600px" append-to-body>
      <el-form ref="plateFormRef" :model="plateForm" :rules="plateRules" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="color: #409EFF; font-weight: bold;">已锁定：{{ selectedRows.length }} 个样品</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">模板板号：</div>
          <div class="form-content">
            <el-form-item prop="templatePlateNo" label-width="0">
              <el-input v-model="plateForm.templatePlateNo" placeholder="请输入板号 (如: P1)" style="width: 200px" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">起始孔号：</div>
          <div class="form-content">
            <el-form-item prop="templateHoleNo" label-width="0">
              <el-input v-model="plateForm.templateHoleNo" placeholder="请输入起始孔号 (如: A1)" style="width: 200px" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label">排版方式：</div>
          <div class="form-content">
            <el-radio-group v-model="plateForm.templateStype">
              <el-radio label="横排">横排</el-radio>
              <el-radio label="竖排">竖排</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div style="margin-top: 15px; padding-left: 10px;">
          <el-input v-model="plateForm.remark" type="textarea" :rows="3" placeholder="添加备注信息..." />
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitPlateForm">确 定</el-button>
          <el-button @click="openPlate = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加孔号对话框 (手工直接添加模板孔号) -->
    <el-dialog title="手工直接添加模板孔号" v-model="openWell" width="600px" append-to-body>
      <el-form ref="wellFormRef" :model="wellForm" :rules="wellRules" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="color: #f56c6c; font-weight: bold;">选中生产编号：{{ selectedProduceIds.join(', ') }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">机器类型：</div>
          <div class="form-content">
            <el-radio-group v-model="wellForm.machineType">
              <el-radio label="192">192</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">排版方式：</div>
          <div class="form-content">
            <el-radio-group v-model="wellForm.templateStype">
              <el-radio label="横排">横排</el-radio>
              <el-radio label="竖排">竖排</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">是否合并：</div>
          <div class="form-content">
            <el-radio-group v-model="wellForm.mergeType">
              <el-radio label="合并">合并</el-radio>
              <el-radio label="单个">单个</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">板号：</div>
          <div class="form-content">
            <el-form-item prop="templatePlateNo" label-width="0">
              <el-input v-model="wellForm.templatePlateNo" placeholder="请输入板号" style="width: 200px" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label">孔号：</div>
          <div class="form-content">
            <el-form-item prop="templateHoleNo" label-width="0">
              <el-input v-model="wellForm.templateHoleNo" placeholder="请输入孔号" style="width: 200px" />
            </el-form-item>
          </div>
        </div>
        <div style="margin-top: 15px; padding-left: 10px;">
          <el-input v-model="wellForm.remark" type="textarea" :rows="3" placeholder="添加备注信息..." />
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitWellForm">确 定</el-button>
          <el-button @click="openWell = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 排版忽略对话框 -->
    <el-dialog title="排版忽略" v-model="openIgnore" width="600px" append-to-body>
      <el-form ref="ignoreFormRef" :model="ignoreForm" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="color: #f56c6c; font-weight: bold;">选中数量：{{ selectedRows.length }}，选中标示：{{ selectedProduceIds.join(',') }}</span>
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label">备注：</div>
          <div class="form-content">
            <el-input v-model="ignoreForm.remark" type="textarea" :rows="6" placeholder="请输入备注内容" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="display: flex; justify-content: center; gap: 20px;">
          <el-button type="success" icon="Check" @click="submitIgnoreForm" style="width: 100px; border-radius: 20px;"> 确 定 </el-button>
          <el-button type="info" icon="Close" @click="openIgnore = false" style="width: 100px; border-radius: 20px;"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 模板BDT表打印对话框 -->
    <el-dialog title="模板BDT表打印" v-model="openBDT" width="600px" append-to-body>
      <el-form ref="bdtFormRef" :model="bdtForm" label-width="120px" class="well-form">
        <div class="form-row border-top border-bottom">
          <div class="form-label">板号：</div>
          <div class="form-content">
            <el-input v-model="bdtForm.plateNo" placeholder="请输入板号" style="width: 250px" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="display: flex; justify-content: center; gap: 20px;">
          <el-button type="success" icon="Check" @click="submitBDTForm" style="width: 100px; border-radius: 20px;"> 确 定 </el-button>
          <el-button type="info" icon="Close" @click="openBDT = false" style="width: 100px; border-radius: 20px;"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Schedule">
import { listLayoutTemplate } from '@/api/sequencing/schedule'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const searchRef = ref(null)
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

const openConfirmPlate = ref(false)
const openPlate = ref(false)
const openWell = ref(false)
const openIgnore = ref(false)
const openBDT = ref(false)
const selectedRows = ref([])
const plateForm = reactive({
  templatePlateNo: '',
  templateHoleNo: 'A1',
  templateStype: '横排',
  remark: ''
})

const wellForm = reactive({
  machineType: '192',
  templateStype: '横排',
  mergeType: '合并',
  templatePlateNo: '',
  templateHoleNo: '',
  remark: ''
})

const ignoreForm = reactive({
  remark: ''
})

const bdtForm = reactive({
  plateNo: ''
})

const selectedProduceIds = computed(() => selectedRows.value.map(r => r.produceId))

const plateRules = {
  templatePlateNo: [{ required: true, message: '请输入模板板号', trigger: 'blur' }],
  templateHoleNo: [{ required: true, message: '请输入起始孔号', trigger: 'blur' }],
  templateStype: [{ required: true, message: '请选择排版方式', trigger: 'change' }]
}

const wellRules = {
  templatePlateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }],
  templateHoleNo: [{ required: true, message: '请输入孔号', trigger: 'blur' }]
}

const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'produceId', label: '生产编号', width: 100, fixed: true, sortable: true, visible: true },
  { key: 'templateNumber', label: '个数', width: 60, visible: true },
  { key: 'orderId', label: '订单号', width: 160, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'sampleId', label: '样品编号', width: 120, visible: true },
  { key: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'primerConcentration', label: '引物浓度', width: 80, visible: true },
  { key: 'sampleType', label: '样品类型', width: 80, visible: true },
  { key: 'carrierName', label: '载体名称', width: 100, visible: true },
  { key: 'antibioticType', label: '抗生素类型', width: 100, visible: true },
  { key: 'fragmentSize', label: '片段大小', width: 80, visible: true },
  { key: 'testResult', label: '是否测通', width: 80, visible: true },
  { key: 'performance', label: '完成情况', width: 80, visible: true },
  { key: 'returnState', label: '返回状态', width: 80, visible: true },
  { key: 'templatePlateNo', label: '模板板号', width: 80, visible: true },
  { key: 'templateHoleNo', label: '模板孔号', width: 80, visible: true },
  { key: 'originConcentration', label: '原浓度', width: 80, visible: true },
  { key: 'flowName', label: '流程名称', width: 100, visible: true },
  { key: 'createUser', label: '创建人', width: 100, visible: true },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: false }
])

const cacheKey = 'sequencing_schedule_columns_visible'
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
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' },
  { prop: 'returnState', label: '返回状态', type: 'input' }
])

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    sampleId: undefined,
    customerName: undefined,
    returnState: undefined
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
  listLayoutTemplate(queryParams.value).then(response => {
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
  selectedRows.value = selection
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加模板排版'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getSchedule(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改模板排版'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateSchedule(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addSchedule(form.value).then(response => {
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
    return delSchedule(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/schedule/export', {
    ...queryParams.value
  }, `schedule_${new Date().getTime()}.xlsx`)
}

import { updateTemplateNo, ignoreTemp, templateBDT } from '@/api/sequencing/schedule'

/** 添加板号按钮操作 (两步流程) */
function handleAddPlateNo() {
  if (multiple.value) {
    proxy.$modal.msgWarning('请先勾选需要操作的样品')
    return
  }
  openConfirmPlate.value = true
}

/** 确认生产编号后进入配置页 */
function proceedToPlateConfig() {
  openConfirmPlate.value = false
  plateForm.templatePlateNo = ''
  plateForm.templateHoleNo = 'A1'
  plateForm.templateStype = '横排'
  plateForm.remark = ''
  openPlate.value = true
}

/** 提交版号表单 */
function submitPlateForm() {
  proxy.$refs['plateFormRef'].validate(valid => {
    if (valid) {
      const data = {
        templateInfo: selectedRows.value.map(item => ({
          orderId: item.orderId,
          sampleId: item.sampleId,
          id: item.id
        })),
        templateStype: plateForm.templateStype,
        templatePlateNo: plateForm.templatePlateNo,
        templateHoleNo: plateForm.templateHoleNo,
        remark: plateForm.remark
      }
      updateTemplateNo(data).then(response => {
        proxy.$modal.msgSuccess('添加版号成功')
        openPlate.value = false
        getList()
      })
    }
  })
}

/** 添加孔号按钮操作 */
function handleAddWellNo() {
  if (multiple.value) {
    proxy.$modal.msgWarning('请先勾选需要操作的样品')
    return
  }
  wellForm.templatePlateNo = ''
  wellForm.templateHoleNo = ''
  wellForm.machineType = '192'
  wellForm.templateStype = '横排'
  wellForm.mergeType = '合并'
  wellForm.remark = ''
  openWell.value = true
}

/** 提交孔号表单 */
function submitWellForm() {
  proxy.$refs['wellFormRef'].validate(valid => {
    if (valid) {
      const data = {
        templateInfo: selectedRows.value.map(item => ({
          orderId: item.orderId,
          sampleId: item.sampleId,
          id: item.id
        })),
        templateStype: wellForm.templateStype,
        templatePlateNo: wellForm.templatePlateNo,
        templateHoleNo: wellForm.templateHoleNo,
        remark: wellForm.remark
      }
      updateTemplateNo(data).then(response => {
        proxy.$modal.msgSuccess('添加孔号成功')
        openWell.value = false
        getList()
      })
    }
  })
}
/** 排版忽略按钮操作 */
function handleLayoutStrategy() {
  if (multiple.value) {
    proxy.$modal.msgWarning('请先勾选需要操作的样品')
    return
  }
  ignoreForm.remark = ''
  openIgnore.value = true
}

/** 提交忽略表单 */
function submitIgnoreForm() {
  const data = {
    templateInfo: selectedRows.value.map(item => ({
      orderId: item.orderId,
      sampleId: item.sampleId,
      id: item.id
    })),
    remark: ignoreForm.remark
  }
  ignoreTemp(data).then(response => {
    proxy.$modal.msgSuccess('操作成功')
    openIgnore.value = false
    getList()
  })
}

/** 模板BDT打印按钮操作 */
function handleTemplateBDT() {
  bdtForm.plateNo = ''
  openBDT.value = true
}

/** 提交模板BDT表单 */
function submitBDTForm() {
  if (!bdtForm.plateNo) {
    proxy.$modal.msgWarning('请输入板号')
    return
  }
  templateBDT({ templateNo: bdtForm.plateNo }).then(response => {
    proxy.$modal.msgSuccess('打印成功')
    openBDT.value = false
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>

:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
}

.well-form {
  border: 1px solid #dcdfe6;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.form-label {
  width: 120px;
  background-color: #f5f7fa;
  padding: 10px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: bold;
  font-size: 13px;
  border-right: 1px solid #ebeef5;
}

.form-content {
  flex: 1;
  padding: 10px 15px;
}

.border-top {
  border-top: 1px solid #ebeef5;
}

.border-bottom {
  border-bottom: 1px solid #ebeef5;
}

:deep(.well-form .el-form-item) {
  margin-bottom: 0px;
}

</style>
