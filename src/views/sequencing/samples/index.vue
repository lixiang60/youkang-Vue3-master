<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="Edit" :disabled="single" @click="handleUpdate">编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="EditPen" @click="handleOriginalConcentration">原浓度</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="primary" plain icon="DocumentCopy" @click="handleBatchEdit">批量编辑</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="Delete" :disabled="multiple"
          @click="handleDelete">删除</el-button>
      </el-col>

      <!-- 批量清理下拉 -->
      <el-col :span="1.5">
        <el-dropdown trigger="click">
          <el-button size="small" type="danger" plain icon="Brush">数据清理<el-icon
              class="el-icon--right"><arrow-down /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="CircleClose" @click="handleClearWellNo">清除孔号</el-dropdown-item>
              <el-dropdown-item icon="Delete" @click="handleClearConcentration">清空浓度</el-dropdown-item>
              <el-dropdown-item icon="DeleteFilled" @click="handleClearTemplate">清空模板</el-dropdown-item>
              <el-dropdown-item icon="DocumentDelete" @click="handleClearReport">清空报告</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>

      <!-- 流程操作下拉 -->
      <el-col :span="1.5">
        <el-dropdown trigger="click">
          <el-button size="small" type="success" plain icon="Operation">流程操作<el-icon
              class="el-icon--right"><arrow-down /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="Promotion" @click.stop="handleShowReturnDialog">安排返还</el-dropdown-item>
              <el-dropdown-item icon="ShoppingBag" @click="handleSelfProvidedPrimer">自备引物</el-dropdown-item>
              <el-dropdown-item icon="Link" @click="handleLinkPrimer">关联引物</el-dropdown-item>
              <el-dropdown-item icon="Key" @click="handleAddTest">加测</el-dropdown-item>
              <el-dropdown-item icon="CopyDocument" @click="handleAddTestTemplate">加测模板</el-dropdown-item>
              <el-dropdown-item icon="PriceTag" @click="handleSupplementLabel">补样标签</el-dropdown-item>
              <el-dropdown-item icon="CircleCheck" @click="handleReEnable">重新启用</el-dropdown-item>
              <el-dropdown-item icon="Plus" @click="handleAddPrimer">添加引物</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>

      <!-- 报表/监控下拉 -->
      <el-col :span="1.5">
        <el-dropdown trigger="click">
          <el-button size="small" type="info" plain icon="Monitor">统计/监控<el-icon
              class="el-icon--right"><arrow-down /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="DataLine" @click="handleWeeklyReport">周报</el-dropdown-item>
              <el-dropdown-item icon="Box" @click="handleTemplateVolumeMonitor">模板量监控</el-dropdown-item>
              <el-dropdown-item icon="Tickets" @click="handleSampleInfo">样品信息</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table size="small" :header-cell-style="{ fontSize: '12px' }" v-loading="loading" :data="dataList"
      :columns="columns" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" @selection-change="handleSelectionChange" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body top="10vh">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号：" prop="orderId">
              <el-input v-model="form.orderId" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户姓名：" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户地址：" prop="customerAddress">
              <el-input v-model="form.customerAddress" placeholder="请输入客户地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户等级：" prop="customerLevel">
              <el-input v-model="form.customerLevel" placeholder="请输入客户等级" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="试测：" prop="trial">
              <el-input v-model="form.trial" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加急：" prop="urgent">
              <el-input v-model="form.urgent" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">

          <el-col :span="12">
            <el-form-item label="样品编号：" prop="sampleId">
              <el-input v-model="form.sampleId" placeholder="请输入样品编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测序引物：" prop="primer">
              <el-input v-model="form.primer" placeholder="请输入测序引物" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="引物浓度：" prop="primerConcentration">
              <el-input v-model="form.primerConcentration" placeholder="请输入引物浓度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样品类型：" prop="sampleType">
              <el-select v-model="form.sampleType" placeholder="请选择" style="width: 100%">
                <el-option label="菌液" value="菌液" />
                <el-option label="质粒" value="质粒" />
                <el-option label="PCR产物" value="PCR产物" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="抗生素类型：" prop="antibioticType">
              <el-select v-model="form.antibioticType" placeholder="请选择" style="width: 100%">
                <el-option label="Amp" value="Amp" />
                <el-option label="Kan" value="Kan" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="载体名称：" prop="carrierName">
              <el-input v-model="form.carrierName" placeholder="请输入载体名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="片段大小：" prop="fragmentSize">
              <el-input v-model="form.fragmentSize" placeholder="请输入片段大小" />
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
            <el-form-item label="序列：" prop="seq">
              <el-input v-model="form.seq" placeholder="请输入序列" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测序项目：" prop="project">
              <el-input v-model="form.project" placeholder="请输入测序项目" />
            </el-form-item>
          </el-col>
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
        <div class="dialog-footer">
          <el-button type="success" @click="submitForm">确 定</el-button>
          <el-button type="danger" @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置原浓度对话框 (仿制截图样式) -->
    <el-dialog v-model="concOpen" width="750px" append-to-body top="10vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #409EFF; font-size: 20px;">
            <Edit />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">设置原浓度</span>
        </div>
      </template>
      <el-form ref="concFormRef" :model="concForm" :rules="concRules" label-width="0" class="well-form"
        style="min-height: 350px;">
        <!-- 生产编号展示 -->
        <div class="form-row border-top">
          <div class="form-label" style="width: 140px;">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 14px; color: #333;">{{ selectedProduceIds.length > 0 ? selectedProduceIds.join(', ')
              :
              '未选择'
            }}</span>
          </div>
        </div>
        <!-- 原浓度输入 -->
        <div class="form-row">
          <div class="form-label" style="width: 140px;">原浓度：</div>
          <div class="form-content">
            <el-form-item prop="originConcentration" label-width="0" style="margin-bottom: 0;">
              <el-select v-model="concForm.originConcentration" placeholder="请选择或输入原浓度" filterable allow-create
                style="width: 280px">
                <el-option label="0.3" value="0.3" />
                <el-option label="0.5" value="0.5" />
                <el-option label="0.7" value="0.7" />
                <el-option label="1.0" value="1.0" />
                <el-option label="1.5" value="1.5" />
                <el-option label="2.0" value="2.0" />
                <el-option label="3.0" value="3.0" />
                <el-option label="5.0" value="5.0" />
                <template #prefix>
                  <el-icon style="color: #E6A23C;">
                    <WarningFilled />
                  </el-icon>
                </template>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!-- 备注 -->
        <div class="form-row border-bottom" style="height: 180px;">
          <div class="form-label" style="width: 140px; height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center;">
            <el-input v-model="concForm.remark" type="textarea" :rows="6" placeholder="请输入备注内容" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="submitConcForm">确 定</el-button>
          <el-button type="danger" @click="concOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 安排样品返还对话框 (Doc 2.9 对接) -->
    <el-dialog v-model="returnOpen" width="700px" append-to-body top="10vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0;">
          <el-icon style="margin-right: 8px; color: #E6A23C; font-size: 20px;">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px;">安排样品返还</span>
        </div>
      </template>
      <el-form ref="returnFormRef" :model="returnForm" :rules="returnRules" label-width="0" class="well-form"
        style="min-height: 350px;">
        <!-- 生产编号 -->
        <div class="form-row border-top">
          <div class="form-label" style="width: 140px;">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px; color: #F56C6C;">
              选中数量：<span style="font-weight: bold;">{{ selectedProduceIds.length }}</span>，选中生产编号：{{
                selectedProduceIds.join(',') }}
            </span>
          </div>
        </div>
        <!-- 订单号 -->
        <div class="form-row">
          <div class="form-label" style="width: 140px;">订单号：</div>
          <div class="form-content">
            <span style="font-size: 13px; color: #F56C6C;">{{ returnForm.orderId }}</span>
          </div>
        </div>
        <!-- 返回类型 -->
        <div class="form-row border-bottom">
          <div class="form-label" style="width: 140px;">返回类型：</div>
          <div class="form-content">
            <el-form-item prop="reimburseType" label-width="0" style="margin-bottom: 0;">
              <el-select v-model="returnForm.reimburseType" placeholder="请选择" style="width: 250px">
                <el-option label="安排返质粒" value="安排返质粒" />
                <el-option label="安排返菌液" value="安排返菌液" />
                <el-option label="安排返质粒和菌液" value="安排返质粒和菌液" />
                <el-option label="安排返平板和质粒" value="安排返平板和质粒" />
                <el-option label="安排返平板和菌液" value="安排返平板和菌液" />
                <el-option label="安排返平板" value="安排返平板" />
                <el-option label="安排返平板和菌液和质粒" value="安排返平板和菌液和质粒" />
                <el-option label="安排返部分质粒" value="安排返部分质粒" />
                <el-option label="安排返引物" value="安排返引物" />
                <el-option label="安排返样品" value="安排返样品" />
                <el-option label="安排返已纯化产物" value="安排返已纯化产物" />
                <el-option label="安排返还部分菌液" value="安排返还部分菌液" />
                <el-option label="安排返还硅胶垫" value="安排返还硅胶垫" />
                <el-option label="安排返质粒菌液引物" value="安排返质粒菌液引物" />
                <template #prefix>
                  <el-icon style="color: #F56C6C;">
                    <WarningFilled />
                  </el-icon>
                </template>
              </el-select>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="success" @click="submitReturnForm">确 定</el-button>
          <el-button type="danger" @click="returnOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Samples">
import { ref, reactive, toRefs, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { listSamples, getSamples, addSamples, updateSamples, delSamples, arrangeReturn } from '@/api/sequencing/samples'
import { updateProduceOriginConcentration } from '@/api/sequencing/production'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

const searchRef = ref(null)
const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_yes_no } = proxy.useDict('sys_normal_disable', 'sys_yes_no')

const dataList = ref([])
const columns = ref([
  { type: 'selection', width: 50, fixed: true, visible: true },
  { key: 'orderId', label: '订单号', width: 160, fixed: true, visible: true },
  { key: 'orderHistory', label: '历史订单', width: 120, visible: true },
  { key: 'sampleId', label: '样品编号', width: 120, fixed: true, visible: true },
  { key: 'sampleType', label: '样品类型', width: 80, visible: true },
  { key: 'samplePosition', label: '样品位置', width: 80, visible: true },
  { key: 'primer', label: '测序引物', width: 100, visible: true },
  { key: 'primerType', label: '引物类型', width: 80, visible: true },
  { key: 'primerPosition', label: '引物位置', width: 80, visible: true },
  { key: 'primerConcentration', label: '引物浓度', width: 80, visible: true },
  { key: 'seq', label: '序列', width: 100, showOverflowTooltip: true, visible: true },
  { key: 'project', label: '测序项目', width: 100, visible: true },
  { key: 'carrierName', label: '载体名称', width: 100, visible: true },
  { key: 'antibioticType', label: '抗生素类型', width: 100, visible: true },
  { key: 'plasmidLength', label: '质粒长度', width: 80, visible: true },
  { key: 'fragmentSize', label: '片段大小', width: 80, visible: true },
  { key: 'testResult', label: '是否测通', width: 80, visible: true },
  { key: 'originConcentration', label: '原浓度', width: 80, visible: true },
  { key: 'templatePlateNo', label: '模板板号', width: 80, visible: true },
  { key: 'templateHoleNo', label: '模板孔号', width: 80, visible: true },
  { key: 'performance', label: '完成情况', width: 80, visible: true },
  { key: 'returnState', label: '返回状态', width: 80, visible: true },
  { key: 'flowName', label: '流程名称', width: 100, visible: true },
  { key: 'plateNo', label: '板号', width: 80, visible: true },
  { key: 'holeNo', label: '孔号', width: 80, visible: true },
  { key: 'belongCompany', label: '所属公司', width: 120, visible: true },
  { key: 'produceCompany', label: '生产公司', width: 120, visible: true },
  { key: 'holeNumber', label: '孔号数量', width: 80, visible: true },
  { key: 'layout', label: '排版方式', width: 80, visible: true },
  { key: 'createUser', label: '创建人', width: 100, visible: true },
  { key: 'createTime', label: '完成时间', width: 160, visible: true },
  { key: 'produceId', label: '生产编号', width: 120, visible: false },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: true }
])

// 显隐列缓存加载
const cacheKey = 'sequencing_samples_columns_visible'
const savedColumns = localStorage.getItem(cacheKey)
if (savedColumns) {
  try {
    const cache = JSON.parse(savedColumns)
    columns.value.forEach(col => {
      const key = col.key || col.prop || col.type
      if (key && cache[key] !== undefined) {
        col.visible = cache[key]
      }
    })
  } catch (e) {
    console.warn('Failed to parse columns cache:', e)
  }
}

// 监听显隐列变化并缓存
watch(columns, (newVal) => {
  const cache = {}
  newVal.forEach(col => {
    const key = col.key || col.prop || col.type
    if (key) {
      cache[key] = col.visible
    }
  })
  localStorage.setItem(cacheKey, JSON.stringify(cache))
}, { deep: true })

// 检索条件字段配置
const searchFields = ref([
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' },
  {
    prop: 'sampleType',
    label: '样品类型',
    type: 'select',
    options: [
      { label: '菌液', value: '菌液' },
      { label: '质粒', value: '质粒' },
      { label: 'PCR产物', value: 'PCR产物' }
    ]
  },
  { prop: 'primer', label: '测序引物', type: 'input' },
  { prop: 'primerType', label: '引物类型', type: 'input' },
  { prop: 'project', label: '测序项目', type: 'input' },
  { prop: 'plateNo', label: '板号', type: 'input' }
])
const selectedRows = ref([])
const concOpen = ref(false)
const concForm = reactive({
  originConcentration: '',
  remark: ''
})
const concRules = {
  originConcentration: [{ required: true, message: '请选择或输入原浓度', trigger: 'change' }]
}
const selectedProduceIds = computed(() => selectedRows.value.map(r => r.produceId).filter(id => id))

const open = ref(false)
const returnOpen = ref(false)
const returnForm = reactive({
  orderId: '',
  reimburseType: ''
})
const returnRules = {
  reimburseType: [{ required: true, message: '请选择返回类型', trigger: 'change' }]
}
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
    produceId: undefined,
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
  selectedRows.value = selection
  ids.value = selection.map(item => item.produceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加测序样品'
}

// 暂位方法或者是事件定义
function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const produceId = row.produceId || ids.value
  getSamples(produceId).then(response => {
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
  const idList = row.produceId || ids.value
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function () {
    return delSamples(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/sample/export', {
    ...queryParams.value
  }, `samples_${new Date().getTime()}.xlsx`)
}

// 占位方法
/** 原浓度按钮操作 */
function handleOriginalConcentration() {
  if (multiple.value) {
    proxy.$modal.msgWarning('请先勾选需要操作的样品')
    return
  }
  concForm.originConcentration = ''
  concForm.remark = ''
  concOpen.value = true
}

/** 提交原浓度表单 */
function submitConcForm() {
  proxy.$refs['concFormRef'].validate(valid => {
    if (valid) {
      const data = {
        produceIdList: selectedProduceIds.value,
        originConcentration: concForm.originConcentration,
        remark: concForm.remark
      }
      updateProduceOriginConcentration(data).then(response => {
        proxy.$modal.msgSuccess('设置成功')
        concOpen.value = false
        getList()
      })
    }
  })
}
function handleClearWellNo() { proxy.$modal.msg('功能开发中...') }
function handleClearConcentration() { proxy.$modal.msg('功能开发中...') }
function handleClearTemplate() { proxy.$modal.msg('功能开发中...') }
function handleClearReport() { proxy.$modal.msg('功能开发中...') }
function handleWeeklyReport() { proxy.$modal.msg('功能开发中...') }
function handleShowReturnDialog() {
  if (selectedRows.value.length === 0) {
    proxy.$modal.msgWarning('请选择需要操作的样品')
    return
  }
  returnForm.orderId = selectedRows.value[0]?.orderId || ''
  returnForm.reimburseType = ''
  returnOpen.value = true
}

/** 提交安排返还表单 (Doc 2.9) */
function submitReturnForm() {
  proxy.$refs['returnFormRef'].validate(valid => {
    if (valid) {
      // 校验：只能传同一 orderId 下的样品
      const orderIds = new Set(selectedRows.value.map(row => row.orderId))
      if (orderIds.size > 1) {
        proxy.$modal.msgError('只能安排同一订单号下的样品返还，请重新选择')
        return
      }

      const data = {
        orderId: returnForm.orderId,
        produceIdList: selectedProduceIds.value,
        reimburseType: returnForm.reimburseType
      }
      
      arrangeReturn(data).then(response => {
        proxy.$modal.msgSuccess('安排成功')
        returnOpen.value = false
        getList()
      })
    }
  })
}
function handleSelfProvidedPrimer() { proxy.$modal.msg('功能开发中...') }
function handleTemplateVolumeMonitor() { proxy.$modal.msg('功能开发中...') }
function handleBatchEdit() { proxy.$modal.msg('功能开发中...') }
function handleAddTest() { proxy.$modal.msg('功能开发中...') }
function handleLinkPrimer() { proxy.$modal.msg('功能开发中...') }
function handleAddTestTemplate() { proxy.$modal.msg('功能开发中...') }
function handleSupplementLabel() { proxy.$modal.msg('功能开发中...') }
function handleReEnable() { proxy.$modal.msg('功能开发中...') }
function handleAddPrimer() { proxy.$modal.msg('功能开发中...') }
function handleSampleInfo() { proxy.$modal.msg('功能开发中...') }
onMounted(() => {
  getList()
})
</script>

<style scoped>
:deep(.well-form .el-form-item) {
  margin-bottom: 0px;
}

:deep(.el-table--small .el-table__header-wrapper th) {
  padding: 4px 0 !important;
}

:deep(.el-table--small .cell) {
  padding-left: 6px !important;
  padding-right: 6px !important;
  font-size: 12px;
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
</style>
