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
        <span>{{ parseTime(row.createTime) }}</span>
      </template>
    </dynamic-table>

    <!-- 添加或修改对话框 -->
    <base-dialog :title="title" v-model="open" width="1000px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" label-position="left">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="客户选择" prop="customerInfo.customerId">
              <el-select v-model="selectedCustomer" placeholder="请选择客户" filterable clearable style="width: 92%" value-key="customerId" @change="handleCustomerChange">
                <el-option
                  v-for="item in customerOptions"
                  :key="item.customerId"
                  :label="`${item.customerId}-${item.customerName}-${item.address || ''}-${item.email || ''}-${item.phone || ''}-${item.customerUnit || ''}`"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮件是否发送：" prop="isEmail">
              <el-radio-group v-model="form.isEmail">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
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
              <el-select v-model="form.sequencingLab" placeholder="请选择" style="width: 80%">
                <el-option label="合肥有康" value="A" />
                <el-option label="杭州有康" value="B" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合成生产实验室：" prop="synthesisLab">
              <el-select v-model="form.synthesisLab" placeholder="请选择" style="width: 80%">
                <el-option label="合肥有康" value="A" />
                <el-option label="杭州有康" value="B" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="信息不全：" prop="infoIncomplete">
              <el-select v-model="form.infoIncomplete" placeholder="请选择" style="width: 80%">
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
                style="width: 80%"
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
            <el-form-item label="模板样式：" prop="templateType">
              <el-radio-group v-model="form.templateType">
                <el-radio :label="1">复制excel模式(无格式)</el-radio>
                <el-radio :label="2">EXCEL模板</el-radio>
              </el-radio-group>
              <el-checkbox v-if="form.templateType == '1'" v-model="retainFormat" class="ml10">保留格式(智能解析)</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="测序级别：" prop="generation">
              <el-radio-group v-model="form.generation">
                <el-radio :label="1">一代</el-radio>
                <el-radio :label="4">四代</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="模板内容：" prop="templateContent">
               <editor v-model="form.templateContent" />
               <div class="mt5">
                <el-button type="text" @click="handleTemplateParse">解析模板</el-button>
                <span class="ml10 text-gray" v-if="form.sampleInfoList && form.sampleInfoList.length > 0">
                  已解析 {{ form.sampleInfoList.length }} 条数据
                </span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测序模板附件：" prop="sequencingTemplateAttachment">
              <file-upload v-model="form.sequencingTemplateAttachment" :limit="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加测合成模板附件：" prop="synthesisTemplateAttachment">
              <file-upload v-model="form.synthesisTemplateAttachment" :limit="1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="拍照附件：" prop="photoAttachment">
              <image-upload v-model="form.photoAttachment" :limit="1" width="80px" height="80px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联基因样品编号：" prop="genNo">
              <div style="display: flex; width: 100%">
                <el-input v-model="form.genNo" />
                <span class="ml10" style="white-space: nowrap">(非必填项目)</span>
              </div>
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
    </base-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, addOrder, updateOrder, delOrder } from '@/api/sequencing/order'
import { listCustomerOption } from '@/api/common'
import DynamicTable from '@/components/DynamicTable/index.vue'
import ImageUpload from '@/components/ImageUpload/index.vue'
import FileUpload from '@/components/FileUpload/index.vue'
import BaseDialog from '@/components/BaseDialog/index.vue'

const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_yes_no } = proxy.useDict('sys_normal_disable', 'sys_yes_no')

const dataList = ref([])
const customerOptions = ref([])
const selectedCustomer = ref(null)
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
  { key: 'orderId', label: '订单编号', width: 150, fixed: true, sortable: true, visible: true },
  { key: 'customerId', label: '客户ID', width: 80, visible: true },
  { key: 'customerName', label: '客户姓名', width: 100, fixed: true, showOverflowTooltip: true, visible: true },
  { key: 'customerAddress', label: '客户地址', width: 150, showOverflowTooltip: true, visible: false },
  { key: 'groupId', label: '课题组ID', width: 80, visible: true },
  { key: 'groupName', label: '课题组', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'genNo', label: '基因编号', width: 100, visible: true },
  { key: 'generation', label: '代数', width: 60, visible: true },
  { key: 'orderType', label: '订单类型', width: 100, visible: true },
  { key: 'isAsync', label: '是否同步', width: 80, visible: false },
  { key: 'belongCompany', label: '所属公司', width: 120, showOverflowTooltip: true, visible: true },
  { key: 'produceCompany', label: '生产公司', width: 120, showOverflowTooltip: true, visible: false },
  { key: 'createBy', label: '创建人', width: 100, visible: false },
  { key: 'createTime', label: '创建时间', width: 160, slot: 'createTime', visible: true },
  { key: 'remark', label: '备注', width: 100, showOverflowTooltip: true, visible: false }
])

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
    dataList.value = response.data.rows
    total.value = response.data.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function reset() {
  form.value = {
    id: undefined,
    customerInfo: {
      customerId: undefined,
      customerName: undefined,
      subjectGroupId: undefined,
      subjectGroupName: undefined,
      address: undefined,
      email: undefined,
      phone: undefined,
      customerUnit: undefined
    },
    isEmail: 1,
    generation: 1,
    belongCompany: '深圳有康',
    produceCompany: '杭州有康',
    templateType: 2,
    sampleInfoList: [],
    genNo: undefined,
    remark: undefined,
    // Keep internal UI fields if needed, or map them to new structure if possible
    templateArrangement: '1',
    sequencingLab: undefined,
    synthesisLab: undefined,
    infoIncomplete: undefined,
    sampleDeliveryDate: new Date().toISOString().split('T')[0],
    urgent: '0',
    templateContent: undefined,
    sequencingTemplateAttachment: undefined,
    synthesisTemplateAttachment: undefined,
    photoAttachment: undefined,
  }
  selectedCustomer.value = null
  proxy.resetForm('formRef')
}

/** 处理客户选择变更 */
function handleCustomerChange(val) {
  if (val) {
    form.value.customerInfo = { ...val }
  } else {
    form.value.customerInfo = {}
  }
}

/** 处理模板内容变更/解析 */
function handleTemplateChange() {
  // Parsing is now manual or could be debounced, but explicit button is safer for Rich Text
}

function handleTemplateParse() {
  if (!form.value.templateContent) {
    form.value.sampleInfoList = []
    return
  }

  try {
    // Parse HTML content from Editor
    const div = document.createElement('div')
    div.innerHTML = form.value.templateContent
    const table = div.querySelector('table')
    
    // Helper to get text content from cell, respecting internal newlines if any
    const getCellText = (cell) => (cell.innerText || cell.textContent || '').trim()

    if (table) {
       const rows = table.rows
       if (rows.length < 2) return

       // Parse headers
       const headers = Array.from(rows[0].cells).map(cell => getCellText(cell))
       
       const headerMap = {
          '样品编号': 'sampleId', '引物类型': 'primerType','样品类型': 'sampleType', '样品位置': 'samplePosition',
          '引物名称': 'primer', '引物位置': 'primerPosition',
          '引物浓度': 'primerConcentration', '序列': 'seq', '项目号': 'project',
          '载体名称': 'carrierName', '抗性': 'antibioticType', '质粒长度': 'plasmidLength',
          '片段大小': 'fragmentSize', '测序结果': 'testResult', '原浓度': 'originConcentration',
          '模板板号': 'templatePlateNo', '模板孔号': 'templateHoleNo', '完成状态': 'performance',
          '退回状态': 'returnState', '流程名称': 'flowName', '板号': 'plateNo',
          '孔号': 'holeNo', '所属公司': 'belongCompany', '生产公司': 'produceCompany',
          '孔数': 'holeNumber', '排版方式': 'layout', '备注': 'remark'
       }
       
       const getKey = (header) => headerMap[header] || header
       const validKeys = headers.map(getKey)
       
       const data = []
       for (let i = 1; i < rows.length; i++) {
         const cells = rows[i].cells
         const item = {}
         let hasData = false
         validKeys.forEach((key, index) => {
           if (index < cells.length) {
             const val = getCellText(cells[index])
             if (val) hasData = true
             if (key) item[key] = val
           }
         })
         if (hasData) {
           data.push(item)
         }
       }
       
       form.value.sampleInfoList = data
       proxy.$modal.msgSuccess(`成功解析 ${data.length} 条数据`)

    } else {
      // Fallback: If no table, try to parse as plain text (e.g. user pasted text into editor but it didn't form a table)
      // Editor might wrap lines in <p>.
      // Let's grab innerText and try TSV parse
      const text = div.innerText.trim()
      const rows = text.split('\n').map(r => r.trim()).filter(r => r)
      if (rows.length < 2) {
          proxy.$modal.msgWarning('未能识别表格数据，请确保粘贴了Excel表格内容')
          return
      }
      
      const headers = rows[0].split('\t').map(h => h.trim())
      // ... Reuse TSV logic logic? 
      // Simplified TSV fallback:
       const headerMap = {
          '样品编号': 'sampleId', '引物类型': 'primerType','样品类型': 'sampleType', '样品位置': 'samplePosition',
          '引物名称': 'primer', '引物位置': 'primerPosition',
          '引物浓度': 'primerConcentration', '序列': 'seq', '项目号': 'project',
          '载体名称': 'carrierName', '抗性': 'antibioticType', '质粒长度': 'plasmidLength',
          '片段大小': 'fragmentSize', '测序结果': 'testResult', '原浓度': 'originConcentration',
          '模板板号': 'templatePlateNo', '模板孔号': 'templateHoleNo', '完成状态': 'performance',
          '退回状态': 'returnState', '流程名称': 'flowName', '板号': 'plateNo',
          '孔号': 'holeNo', '所属公司': 'belongCompany', '生产公司': 'produceCompany',
          '孔数': 'holeNumber', '排版方式': 'layout', '备注': 'remark'
       }
       const getKey = (header) => headerMap[header] || header
       const validKeys = headers.map(getKey)
       const data = []
       for (let i = 1; i < rows.length; i++) {
         const cells = rows[i].split('\t')
         const item = {}
         validKeys.forEach((key, index) => {
            if (key && index < cells.length) item[key] = cells[index]?.trim()
         })
         data.push(item)
       }
       form.value.sampleInfoList = data
       proxy.$modal.msgSuccess(`成功解析 ${data.length} 条数据 (纯文本模式)`)
    }

  } catch (error) {
    console.error('Template parsing error:', error)
    proxy.$modal.msgError('解析失败，请检查格式')
  }
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
    if (form.value.customerId) {
      selectedCustomer.value = customerOptions.value.find(item => item.customerId === form.value.customerId) || null
    }
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
  getList()
  listCustomerOption().then(response => {
    console.log('Customer Options Response:', response)
    customerOptions.value = response.data.records
  })
})
</script>


