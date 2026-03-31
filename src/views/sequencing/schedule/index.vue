<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Download" @click="handleExport"
          v-hasPermi="['sequencing:schedule:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="DocumentAdd" @click="handleAddPlateNo">添加板号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="warning" plain icon="CirclePlus" @click="handleAddWellNo">添加孔号</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Notebook" @click="handleLayoutStrategy">排版忽略</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Printer" @click="handleTemplateBDT">模板BDT</el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList"
      size="small" :header-cell-style="{ fontSize: '12px' }" v-loading="loading" :data="dataList" :columns="columns"
      :total="total" @selection-change="handleSelectionChange" />



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
        <div style="display: flex; justify-content: center; gap: 20px; padding: 10px 0;">
          <el-button @click="submitForm" class="premium-btn premium-btn-confirm">
            <template #icon>
              <el-icon>
                <SuccessFilled />
              </el-icon>
            </template>
            确 定
          </el-button>
          <el-button @click="cancel" class="premium-btn premium-btn-cancel">
            <template #icon>
              <el-icon>
                <CircleCloseFilled />
              </el-icon>
            </template>
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 步骤1：确认生产编号对话框 (仿制用户截图样式) -->
    <el-dialog title="模板版号设置-样品备注" v-model="openConfirmPlate" width="800px" append-to-body>
      <div style="border: 1px solid #dcdfe6; border-radius: 4px;">
        <div
          style="background: #f5f7fa; padding: 10px; border-bottom: 1px solid #dcdfe6; font-weight: bold; font-size: 14px; display: flex; align-items: center;">
          <el-icon style="margin-right: 5px; color: #409EFF;">
            <List />
          </el-icon> 数据列表
        </div>
        <el-table :data="selectedRows" stripe border size="small" style="width: 100%" height="400">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="produceId" label="生产编号" header-align="center" align="left" />
          <el-table-column prop="remark" label="备注" header-align="center" align="left" min-width="200"
            show-overflow-tooltip />
        </el-table>
        <div
          style="background: #f5f7fa; padding: 5px 15px; border-top: 1px solid #dcdfe6; font-size: 12px; color: #606266; text-align: right;">
          共 1 页 &gt;&gt; 100 &lt;&lt; 1 - {{ selectedRows.length }} 共 {{ selectedRows.length }} 条 </div>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px; padding: 10px 0;">
          <el-button @click="proceedToPlateConfig" class="premium-btn premium-btn-confirm">
            <template #icon>
              <el-icon>
                <SuccessFilled />
              </el-icon>
            </template>
            确 定
          </el-button>
          <el-button @click="openConfirmPlate = false" class="premium-btn premium-btn-cancel">
            <template #icon>
              <el-icon>
                <CircleCloseFilled />
              </el-icon>
            </template>
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 步骤2：添加板号对话框 -->
    <el-dialog v-model="openPlate" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #409EFF; font-size: 20px;">
            <Edit />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">设置模板板号</span>
        </div>
      </template>
      <el-form ref="plateFormRef" :model="plateForm" :rules="plateRules" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px;">选中数量：<span style="color: #F56C6C; font-weight: bold;">{{ selectedRows.length
            }}</span>，选中生产编号：{{ selectedProduceIds.join(', ') }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">板号：</div>
          <div class="form-content">
            <el-form-item prop="templatePlateNo" label-width="0">
              <el-input v-model="plateForm.templatePlateNo" placeholder="请输入板号" style="width: 250px" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">机器类型：</div>
          <div class="form-content">
            <el-radio-group v-model="plateForm.machineType">
              <el-radio label="192">192</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">排版方式：</div>
          <div class="form-content">
            <el-radio-group v-model="plateForm.templateStype">
              <el-radio label="横排">横排</el-radio>
              <el-radio label="机器竖排">竖排</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row border-bottom" style="height: 180px;">
          <div class="form-label" style="height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center;">
            <el-input v-model="plateForm.remark" type="textarea" :rows="6" placeholder="添加备注信息..." />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px; padding: 10px 0;">
          <el-button @click="submitPlateForm" class="premium-btn premium-btn-confirm">
            <template #icon>
              <el-icon>
                <SuccessFilled />
              </el-icon>
            </template>
            确 定
          </el-button>
          <el-button @click="openPlate = false" class="premium-btn premium-btn-cancel">
            <template #icon>
              <el-icon>
                <CircleCloseFilled />
              </el-icon>
            </template>
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加孔号对话框 -->
    <el-dialog v-model="openWell" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #409EFF; font-size: 20px;">
            <Setting />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">手工直接添加模板孔号</span>
        </div>
      </template>
      <el-form ref="wellFormRef" :model="wellForm" :rules="wellRules" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px;">选中数量：<span style="color: #409EFF; font-weight: bold;">{{ selectedRows.length
            }}</span>，选中生产编号：{{ selectedProduceIds.join(', ') }}</span>
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
              <el-radio label="机器竖排">机器竖排</el-radio>
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
          <div class="form-label">板号/孔号：</div>
          <div class="form-content" style="display: flex; align-items: center; gap: 10px;">
            <el-form-item prop="templatePlateNo" label-width="0">
              <el-input v-model="wellForm.templatePlateNo" placeholder="板号" style="width: 150px" />
            </el-form-item>
            <span style="color: #dcdfe6;">/</span>
            <el-form-item prop="templateHoleNo" label-width="0">
              <el-input v-model="wellForm.templateHoleNo" placeholder="孔号" style="width: 150px" />
            </el-form-item>
          </div>
        </div>
        <div class="form-row border-bottom" style="height: 180px;">
          <div class="form-label" style="height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center;">
            <el-input v-model="wellForm.remark" type="textarea" :rows="6" placeholder="添加备注信息..." />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px; padding: 10px 0;">
          <el-button @click="submitWellForm" class="premium-btn premium-btn-confirm">
            <template #icon>
              <el-icon>
                <SuccessFilled />
              </el-icon>
            </template>
            确 定
          </el-button>
          <el-button @click="openWell = false" class="premium-btn premium-btn-cancel">
            <template #icon>
              <el-icon>
                <CircleCloseFilled />
              </el-icon>
            </template>
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 排版忽略对话框 -->
    <el-dialog v-model="openIgnore" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #E6A23C; font-size: 20px;">
            <WarningFilled />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">排版忽略</span>
        </div>
      </template>
      <el-form ref="ignoreFormRef" :model="ignoreForm" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label" style="width: 140px;">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px;">选中数量：<span style="color: #F56C6C; font-weight: bold;">{{ selectedRows.length
            }}</span>，选中生产编号：{{ selectedProduceIds.join(', ') }}</span>
          </div>
        </div>
        <div class="form-row border-bottom" style="height: 180px;">
          <div class="form-label" style="width: 140px; height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center;">
            <el-input v-model="ignoreForm.remark" type="textarea" :rows="6" placeholder="请输入备注原因" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px; padding: 10px 0;">
          <el-button @click="submitIgnoreForm" class="premium-btn premium-btn-confirm">
            <template #icon>
              <el-icon>
                <SuccessFilled />
              </el-icon>
            </template>
            确 定
          </el-button>
          <el-button @click="openIgnore = false" class="premium-btn premium-btn-cancel">
            <template #icon>
              <el-icon>
                <CircleCloseFilled />
              </el-icon>
            </template>
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 模板BDT表打印对话框 (图1) -->
    <el-dialog title="模板BDT表打印" v-model="openBDT" width="600px" append-to-body top="10vh">
      <el-form ref="bdtFormRef" :model="bdtForm" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label" style="width: 120px;">板号：</div>
          <div class="form-content">
            <el-input v-model="bdtForm.plateNo" placeholder="请输入板号" style="width: 250px" />
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label" style="width: 120px;"></div>
          <div class="form-content" style="display: flex; justify-content: center;">
            <el-button @click="handleLabelPrint" class="premium-btn premium-btn-confirm" style="height: 32px;">
              <template #icon>
                <el-icon>
                  <Printer />
                </el-icon>
              </template>
              标签打印
            </el-button>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="submitBDTForm">确 定</el-button>
          <el-button type="danger" @click="openBDT = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 报表打印弹窗 (图2) -->
    <el-dialog title="报表排版打印" v-model="openReport" width="1120px" append-to-body top="5vh">
      <div id="printArea" class="report-print-wrap">
        <div class="report-header">
          <div class="meta-row" style="font-weight: bold; font-family: 'SimSun', serif;">
            <span>模板版号：{{ bdtForm.plateNo }} 操作人：{{ reportMeta.user }}</span>
            <span style="flex: 1; text-align: center;">
              加急<span class="checkbox-mock"></span>
              试做<span class="checkbox-mock"></span>
            </span>
            <span>打印时间：{{ reportMeta.time }} 第 1 页 共 1 页</span>
          </div>
        </div>

        <table class="bdt-report-table">
          <tbody>
            <tr v-for="r in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']" :key="r">
              <td v-for="c in 12" :key="c" class="well-cell-bdt">
                <div class="well-cell-inner" v-if="getWellData(r, c).sampleId">
                  <div class="cell-row-top">
                    <span class="well-pos-blue">{{ r }}{{ c < 10 ? '0' + c : c }}</span>
                        <span class="well-status-small">{{ getWellData(r, c).returnState || '成功' }}</span>
                  </div>
                  <div class="cell-row-order">{{ getWellData(r, c).produceId }}</div>
                  <div class="cell-row-mid-bold">{{ getWellData(r, c).sampleId }}</div>
                  <div class="cell-row-meta">{{ getWellData(r, c).fragmentSize }}</div>
                  <div class="cell-row-bottom-blue">
                    {{ getWellData(r, c).customerName }} {{ getWellData(r, c).templateNumber }}
                  </div>
                </div>
                <div class="well-cell-inner" v-else>
                  <div class="cell-row-top">
                    <span class="well-pos-blue" style="color: #ccc;">{{ r }}{{ c < 10 ? '0' + c : c }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-print="'#printArea'" type="primary">打 印</el-button>
          <el-button @click="openReport = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script setup name="Schedule">
import { ref, reactive, toRefs, computed, watch, onMounted, onActivated, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
import { listLayoutTemplate, updateTemplateNo, ignoreTemp, templateBDT } from '@/api/sequencing/schedule'

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
const plateForm = ref({
  templatePlateNo: '',
  templateHoleNo: 'A1',
  templateStype: '横排',
  machineType: '192',
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

const openReport = ref(false)
const reportData = ref([])
const reportMeta = reactive({
  user: 'ADMIN',
  time: ''
})

const bdtForm = reactive({
  plateNo: ''
})

const getWellData = (r, c) => {
  const pos1 = r + c
  const pos2 = r + (c < 10 ? '0' + c : c)
  return reportData.value.find(item => item.templateHoleNo === pos1 || item.templateHoleNo === pos2) || {}
}

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
  } catch (e) { }
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
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function () {
    return delSchedule(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequencing/schedule/export', {
    ...queryParams.value
  }, `schedule_${new Date().getTime()}.xlsx`)
}


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
  plateForm.value.templatePlateNo = ''
  plateForm.value.templateHoleNo = 'A1'
  plateForm.value.templateStype = '横排'
  plateForm.value.machineType = '192'
  plateForm.value.remark = ''
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
          produceId: item.produceId
        })),
        machineType: plateForm.value.machineType,
        templateStype: plateForm.value.templateStype,
        templatePlateNo: plateForm.value.templatePlateNo,
        templateHoleNo: plateForm.value.templateHoleNo,
        remark: plateForm.value.remark
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
          produceId: item.produceId
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
      produceId: item.produceId
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
  handleLabelPrint()
}

/** 标签打印 (图2 报表触发) */
function handleLabelPrint() {
  if (!bdtForm.plateNo) {
    proxy.$modal.msgWarning('请输入板号')
    return
  }
  proxy.$modal.loading('数据加载中...')
  templateBDT({ templateNo: bdtForm.plateNo }).then(response => {
    proxy.$modal.closeLoading()
    reportData.value = response.data || []
    reportMeta.time = proxy.parseTime(new Date(), '{y}/{m}/{d}')
    reportMeta.user = userStore.name || 'ADMIN'
    openReport.value = true
  }).catch(() => {
    proxy.$modal.closeLoading()
  })
}



onMounted(() => {
  getList()
})

// onActivated(() => {
//   getList()
// })

// 监听路由变化，确保菜单点击时强制刷新
watch(() => route.path, (newPath) => {
  if (newPath === '/sequencing/schedule') {
    getList()
  }
})
</script>

<style scoped>
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
}

:deep(.well-form) {
  border: 1px solid #dcdfe6;
}

.report-print-wrap {
  padding: 10px;
  background: #fff;
  color: #333;
  font-family: Arial, sans-serif;
}

.report-header {
  border-bottom: 2px solid #333;
  padding-bottom: 5px;
  margin-bottom: 5px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.bdt-report-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.well-cell-bdt {
  border: 1px solid #333;
  height: 95px;
  vertical-align: top;
  padding: 2px;
}

.well-cell-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cell-top {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 2px;
}

.well-pos {
  color: blue;
}

.well-status {
  font-size: 10px;
}

.cell-id {
  font-size: 12px;
  font-weight: bold;
}

.cell-desc,
.cell-flow,
.cell-conc {
  font-size: 10px;
  line-height: 1.2;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.form-label {
  width: 140px;
  background-color: #f8f9fa;
  padding: 10px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
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

.well-pos-blue {
  color: blue;
  font-weight: bold;
}

.well-status-small {
  font-size: 10px;
}

.cell-row-top {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.cell-row-mid-bold {
  font-weight: bold;
  font-size: 13px;
  margin: 1px 0;
}

.cell-row-order,
.cell-row-meta {
  font-size: 11px;
  line-height: 1.1;
  color: #333;
}

.cell-row-bottom-blue {
  color: blue;
  font-size: 11px;
  margin-top: auto;
}

.checkbox-mock {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 1px solid #333;
  margin-left: 4px;
  margin-right: 15px;
  vertical-align: middle;
}

@media print {
  .report-print-wrap {
    padding: 0;
  }
}
</style>
