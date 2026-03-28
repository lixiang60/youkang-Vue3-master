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
        <el-button size="small" type="primary" plain icon="EditPen" @click="handleOriginConcentration"
          :disabled="multiple">原浓度</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Finished" @click="handleTemplateStatus"
          :disabled="multiple">模板状态</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="RefreshLeft" @click="handleSendBack"
          :disabled="multiple">退回</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Histogram" @click="handlePcrGelCut">PCR切胶</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="List" @click="handleResampleList">重抽操作表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Camera" @click="showSearch = !showSearch">图像设置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
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

    <!-- 步骤1：确认生产编号对话框 (仿制截图样式) -->
    <el-dialog title="样品备注" v-model="statusConfirmOpen" width="800px" append-to-body>
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
          <el-button type="success" icon="Check" @click="proceedToStatusConfig" style="width: 100px; border-radius: 20px;"> 确 定 </el-button>
          <el-button type="info" icon="Close" @click="statusConfirmOpen = false" style="width: 100px; border-radius: 20px;"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 步骤2：设置模板状态对话框 (仿制截图样式) -->
    <el-dialog title="设置模板" v-model="statusOpen" width="750px" append-to-body>
      <el-form :model="statusForm" label-width="120px" class="well-form">
        <!-- 生产编号 -->
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px;">{{ selectedProduceIds.join(',') }}</span>
          </div>
        </div>
        <!-- 模板状态 -->
        <div class="form-row">
          <div class="form-label">模板状态：</div>
          <div class="form-content">
            <el-form-item label-width="0">
              <el-select v-model="statusForm.returnState" placeholder="请选择" style="width: 250px">
                <el-option label="模板成功" value="模板成功" />
                <el-option label="模板失败" value="模板失败" />
                <el-option label="模板重抽" value="模板重抽" />
                <el-option label="模板重切" value="模板重切" />
              </el-select>
              <el-icon style="margin-left: 10px; color: #F56C6C; font-size: 18px; vertical-align: middle;"><Warning /></el-icon>
            </el-form-item>
          </div>
        </div>
        <!-- 备注 -->
        <div class="form-row border-bottom" style="height: 150px;">
          <div class="form-label" style="height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px;">
            <el-input v-model="statusForm.remark" type="textarea" :rows="5" placeholder="请输入备注内容" style="height: 100%;" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px;">
          <el-button type="success" icon="Check" @click="submitStatus" style="width: 100px; border-radius: 20px;"> 确 定 </el-button>
          <el-button type="info" icon="Close" @click="statusOpen = false" style="width: 100px; border-radius: 20px;"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置原浓度对话框 (仿制截图样式) -->
    <el-dialog title="设置原浓度" v-model="concOpen" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center;">
          <el-icon style="margin-right: 8px; color: #409EFF;">
            <EditPen />
          </el-icon>
          <span>设置原浓度</span>
        </div>
      </template>
      <el-form ref="concFormRef" :model="concForm" :rules="concRules" label-width="120px" class="well-form">
        <!-- 生产编号展示 -->
        <div class="form-row border-top">
          <div class="form-label">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px;">选中数量：<span style="color: #409EFF; font-weight: bold;">{{ selectedRows.length
            }}</span>，选中生产编号：{{ selectedProduceIds.join(', ') }}</span>
          </div>
        </div>
        <!-- 原浓度输入 -->
        <div class="form-row">
          <div class="form-label">原浓度：</div>
          <div class="form-content">
            <el-form-item prop="originConcentration" label-width="0">
              <el-select v-model="concForm.originConcentration" placeholder="请选择或输入原浓度" filterable allow-create
                style="width: 250px">
                <el-option label="0.3" value="0.3" />
                <el-option label="0.5" value="0.5" />
                <el-option label="0.7" value="0.7" />
                <el-option label="1.0" value="1.0" />
                <el-option label="1.5" value="1.5" />
                <el-option label="2.0" value="2.0" />
                <el-option label="3.0" value="3.0" />
                <el-option label="5.0" value="5.0" />
                <el-option label="高" value="高" />
                <el-option label="低" value="低" />
                <el-option label="加测" value="加测" />
              </el-select>
              <el-icon style="margin-left: 10px; color: #F56C6C; font-size: 18px; vertical-align: middle;">
                <Warning />
              </el-icon>
            </el-form-item>
          </div>
        </div>
        <!-- 机器类型 -->
        <div class="form-row">
          <div class="form-label">机器类型：</div>
          <div class="form-content">
            <el-radio-group v-model="concForm.machineType">
              <el-radio label="192">192</el-radio>
            </el-radio-group>
          </div>
        </div>
        <!-- 排版方式 -->
        <div class="form-row">
          <div class="form-label">排版方式：</div>
          <div class="form-content">
            <el-radio-group v-model="concForm.templateStype">
              <el-radio label="横排">横排</el-radio>
              <el-radio label="竖排">竖排</el-radio>
              <el-radio label="机器竖排">机器竖排</el-radio>
            </el-radio-group>
          </div>
        </div>
        <!-- 板号 -->
        <div class="form-row">
          <div class="form-label">板号：</div>
          <div class="form-content">
            <el-form-item prop="plateNo" label-width="0">
              <el-input v-model="concForm.plateNo" placeholder="请输入板号" style="width: 250px" />
            </el-form-item>
          </div>
        </div>
        <!-- 备注 -->
        <div class="form-row border-bottom" style="height: 150px;">
          <div class="form-label" style="height: 100%;">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px;">
            <el-input v-model="concForm.remark" type="textarea" :rows="5" placeholder="请输入备注内容" style="height: 100%;" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px;">
          <el-button type="success" icon="Check" @click="submitConc" style="width: 100px; border-radius: 20px;"> 确 定
          </el-button>
          <el-button type="info" icon="Close" @click="concOpen = false" style="width: 100px; border-radius: 20px;"> 取 消
          </el-button>
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

    <!-- PCR切胶设置对话框 -->
    <el-dialog title="PCR切胶" v-model="pcrOpen" width="800px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center;">
          <el-icon style="margin-right: 8px; color: #67C23A;"><Plus /></el-icon>
          <span>PCR切胶</span>
        </div>
      </template>
      <el-form :model="pcrForm" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">起始订单：</div>
          <div class="form-content">
            <el-input v-model="pcrForm.startOrder" placeholder="请输入起始订单" style="width: 200px" />
          </div>
          <div class="form-label" style="border-left: 1px solid #ebeef5;">结束订单：</div>
          <div class="form-content">
            <el-input v-model="pcrForm.endOrder" placeholder="请输入结束订单" style="width: 200px" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">所属公司：</div>
          <div class="form-content">
            <el-select v-model="pcrForm.branch" placeholder="请选择" style="width: 200px">
              <el-option label="上海实验室" value="上海实验室" />
              <el-option label="北京实验室" value="北京实验室" />
              <el-option label="广州实验室" value="广州实验室" />
            </el-select>
          </div>
          <div class="form-label" style="border-left: 1px solid #ebeef5;"></div>
          <div class="form-content"></div>
        </div>
        <div class="form-row border-bottom" style="justify-content: center; height: 60px;">
          <el-button type="default" icon="Printer" @click="handlePrintPcr" style="border-radius: 20px;"> 打印PCR切胶 </el-button>
        </div>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px;">
          <el-button type="success" icon="Check" @click="pcrOpen = false" style="width: 100px; border-radius: 20px;"> 确 定 </el-button>
          <el-button type="danger" icon="Close" @click="pcrOpen = false" style="width: 100px; border-radius: 20px;"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- PCR切胶报表预览对话框 -->
    <el-dialog title="PCR切胶报表预览" v-model="pcrReportOpen" width="1000px" append-to-body>
      <div class="pcr-report-container">
        <el-row :gutter="20">
          <el-col :span="12" v-for="index in 2" :key="index">
            <table class="report-table">
              <thead>
                <tr>
                  <th>客户姓名</th>
                  <th>生产编号</th>
                  <th>样品编号</th>
                  <th>片段大小</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pcrMockData.slice((index-1)*15, index*15)" :key="row.produceId">
                  <td>{{ row.customerName }}</td>
                  <td>{{ row.produceId }}</td>
                  <td>{{ row.sampleId }}</td>
                  <td>{{ row.fragmentSize }}</td>
                </tr>
              </tbody>
            </table>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: center;">
          <el-button type="primary" icon="Printer" @click="pcrReportOpen = false"> 立即打印 </el-button>
          <el-button @click="pcrReportOpen = false"> 关闭 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重抽操作表设置对话框 -->
    <el-dialog title="重抽操作表" v-model="resampleOpen" width="800px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center;">
          <el-icon style="margin-right: 8px; color: #409EFF;"><Plus /></el-icon>
          <span>重抽操作表</span>
        </div>
      </template>
      <el-form :model="resampleForm" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">模板板号：</div>
          <div class="form-content">
            <el-input v-model="resampleForm.plateNo" placeholder="请输入模板板号" style="width: 300px" />
            <span style="margin-left: 10px; color: #909399; font-size: 12px;">多个板号之间用逗号隔开</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">所属实验室：</div>
          <div class="form-content">
            <el-select v-model="resampleForm.lab" placeholder="请选择" style="width: 200px">
              <el-option label="厦门实验室" value="厦门实验室" />
              <el-option label="上海实验室" value="上海实验室" />
              <el-option label="北京实验室" value="北京实验室" />
            </el-select>
          </div>
          <div class="form-label" style="border-left: 1px solid #ebeef5;">报表类型：</div>
          <div class="form-content">
            <el-radio-group v-model="resampleForm.reportType">
              <el-radio label="重抽操作表">重抽操作表</el-radio>
              <el-radio label="重抽标签">重抽标签</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px;">
          <el-button type="success" icon="Check" @click="submitResample" style="width: 100px; border-radius: 20px;"> 确 定 </el-button>
          <el-button type="danger" icon="Close" @click="resampleOpen = false" style="width: 100px; border-radius: 20px;"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重抽操作表预览对话框 -->
    <el-dialog title="重抽操作表预览" v-model="resampleReportOpen" width="1200px" append-to-body>
      <div class="pcr-report-container">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">铂尚生物技术（上海）有限公司</h2>
          <div style="font-size: 14px; margin-top: 5px; font-weight: bold;">模板重抽接菌记录</div>
          <div style="text-align: right; color: #f56c6c; font-size: 14px; margin-top: -20px;">锐浪报表工具6</div>
        </div>
        <table class="report-table">
          <thead>
            <tr>
              <th>流水号</th>
              <th>是否微量</th>
              <th>原孔号</th>
              <th>客户姓名</th>
              <th>返回状态</th>
              <th>样本类型</th>
              <th>样品编号</th>
              <th>载体名称</th>
              <th>抗生素类型</th>
              <th>样品位置</th>
              <th>样品备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in resampleMockData" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ row.isTrace }}</td>
              <td>{{ row.originHoleNo }}</td>
              <td>{{ row.customerName }}</td>
              <td>{{ row.returnState }}</td>
              <td>{{ row.sampleType }}</td>
              <td>{{ row.sampleId }}</td>
              <td>{{ row.carrierName }}</td>
              <td>{{ row.antibioticType }}</td>
              <td>{{ row.samplePosition }}</td>
              <td>{{ row.remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: center;">
          <el-button type="primary" icon="Printer" @click="resampleReportOpen = false"> 立即打印 </el-button>
          <el-button @click="resampleReportOpen = false"> 关闭 </el-button>
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
const selectedRows = ref([])
const selectedProduceIds = computed(() => selectedRows.value.map(r => r.produceId))

const concRules = {
  originConcentration: [{ required: true, message: '请输入或选择原浓度', trigger: 'change' }]
}

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
  } catch (e) { }
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
  selectedRows.value = selection
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
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function () {
    return delProduction(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => { })
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
    originConcentration: '',
    machineType: '192',
    templateStype: '横排',
    plateNo: '',
    remark: ''
  }
  concOpen.value = true
}

function submitConc() {
  proxy.$refs['concFormRef'].validate(valid => {
    if (valid) {
      updateProduceOriginConcentration(concForm.value).then(() => {
        proxy.$modal.msgSuccess('设置成功')
        concOpen.value = false
        getList()
      })
    }
  })
}

function handleTemplateStatus() {
  if (ids.value.length === 0) return
  statusConfirmOpen.value = true
}

function proceedToStatusConfig() {
  statusConfirmOpen.value = false
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
  proxy.$modal.confirm('退回自动清空模板板号，确认要退回吗？').then(() => {
    sendBackForm.value = {
      produceIdList: ids.value,
      remark: undefined
    }
    sendBackOpen.value = true
  }).catch(() => { })
}

function submitSendBack() {
  sendBackProduce(sendBackForm.value).then(() => {
    proxy.$modal.msgSuccess('退回成功')
    sendBackOpen.value = false
    getList()
  })
}

function handlePcrGelCut() {
  pcrForm.value = {
    startOrder: '20190310215422282',
    endOrder: '20190413215422282',
    branch: '上海实验室'
  }
  pcrOpen.value = true
}

const pcrMockData = ref([
  { customerName: '陈亚璇', produceId: '708192', sampleId: '2A-300-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708193', sampleId: '2A-301-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708194', sampleId: '2A-302-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708195', sampleId: '2A-303-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708196', sampleId: '2A-304-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708197', sampleId: '2A-305-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708198', sampleId: '2A-306-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708199', sampleId: '2A-307-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708200', sampleId: '2A-308-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708201', sampleId: '2A-309-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708202', sampleId: '2A-310-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708203', sampleId: '2A-311-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708204', sampleId: '2A-312-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708205', sampleId: '2A-313-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708206', sampleId: '2A-314-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708207', sampleId: '2A-315-mArnt1', fragmentSize: '300' },
  // Column 2
  { customerName: '陈亚璇', produceId: '708231', sampleId: '2A-339-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708232', sampleId: '2A-340-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708233', sampleId: '2A-341-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708234', sampleId: '2A-342-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708235', sampleId: '2A-343-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708236', sampleId: '2A-344-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708237', sampleId: '2A-345-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708238', sampleId: '2A-346-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708239', sampleId: '2A-347-mArnt1', fragmentSize: '300' },
  { customerName: '陈亚璇', produceId: '708240', sampleId: '4-V-KO-240-R4', fragmentSize: '500' },
  { customerName: '陈亚璇', produceId: '708241', sampleId: '4-V-KO-241-R4', fragmentSize: '500' },
  { customerName: '陈亚璇', produceId: '708242', sampleId: '4-V-KO-242-R4', fragmentSize: '500' },
  { customerName: '陈亚璇', produceId: '708243', sampleId: '4-V-KO-243-R4', fragmentSize: '500' },
  { customerName: '陈亚璇', produceId: '708244', sampleId: '4-V-KO-244-R4', fragmentSize: '500' },
  { customerName: '陈亚璇', produceId: '708245', sampleId: '4-V-KO-245-R4', fragmentSize: '500' }
])

function handlePrintPcr() {
  pcrReportOpen.value = true
}

function handleResampleList() {
  resampleForm.value = {
    plateNo: 'Z111',
    lab: '厦门实验室',
    reportType: '重抽操作表'
  }
  resampleOpen.value = true
}

function submitResample() {
  resampleReportOpen.value = true
}

const resampleMockData = ref([
  { 
    isTrace: '', 
    originHoleNo: '2397_206', 
    customerName: '赵亚林', 
    returnState: '模板重抽', 
    sampleType: '菌皮', 
    sampleId: '1', 
    carrierName: 'PUC', 
    antibioticType: '', 
    samplePosition: 'Z111A1', 
    remark: '第一次抽提未成功，已重新抽提' 
  }
])

const statusConfirmOpen = ref(false)
const statusOpen = ref(false)
const statusForm = ref({})
const concOpen = ref(false)
const concForm = ref({})
const sendBackOpen = ref(false)
const sendBackForm = ref({})
const pcrOpen = ref(false)
const pcrReportOpen = ref(false)
const pcrForm = ref({})
const resampleOpen = ref(false)
const resampleReportOpen = ref(false)
const resampleForm = ref({})

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

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table th, .report-table td {
  border: 1px solid #333;
  padding: 4px;
  text-align: center;
}

.report-table th {
  background-color: #f2f2f2;
}

.pcr-report-container {
  padding: 20px;
  background-color: #fff;
}
</style>
