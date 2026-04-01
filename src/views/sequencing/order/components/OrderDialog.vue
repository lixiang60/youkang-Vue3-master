<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    width="1000px"
    append-to-body
    @update:model-value="handleUpdateVisible"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" label-position="left">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="客户选择" prop="customerInfo.customerId">
            <el-select
              v-model="form.customerInfo.customerId"
              placeholder="请选择客户"
              filterable
              clearable
              style="width: 92%"
              @change="handleCustomerChange"
            >
              <el-option
                v-for="item in localCustomerOptions"
                :key="item.customerId"
                :label="`${item.customerId}-${item.customerName}-${item.address || ''}-${item.email || ''}-${item.phone || ''}-${item.customerUnit || ''}`"
                :value="item.customerId"
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
            <Editor
              v-model="form.templateContent"
              :toolbar="false"
              :min-height="150"
              style="width: 100%"
              type="base64"
              @paste-analyze="handlePasteAnalyze"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.sampleInfoList && form.sampleInfoList.length > 0" :gutter="20">
        <el-col :span="24">
          <el-form-item label="样品列表：">
            <div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between">
              <span class="text-info">共解析出 {{ form.sampleInfoList.length }} 条样品数据</span>
              <el-button type="danger" link @click="form.sampleInfoList = []">清空列表</el-button>
            </div>
            <el-table :data="form.sampleInfoList" border size="small" style="width: 100%" max-height="300">
              <el-table-column prop="sampleId" label="样品编号" width="150" show-overflow-tooltip />
              <el-table-column prop="sampleType" label="样品类型" width="100" />
              <el-table-column prop="primer" label="引物" width="150" show-overflow-tooltip />
              <el-table-column prop="project" label="项目" width="150" show-overflow-tooltip />
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                  <el-button
                    type="danger"
                    link
                    icon="Delete"
                    @click="form.sampleInfoList.splice(scope.$index, 1)"
                  ></el-button>
                </template>
              </el-table-column>
            </el-table>
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
        <el-button type="success" :icon="Check" @click="submitForm">{{ isEdit ? '修改' : '添加' }}</el-button>
        <el-button type="danger" :icon="Close" @click="handleUpdateVisible(false)">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, getCurrentInstance, computed } from 'vue'
import { getOrder, addOrder, updateOrder } from '@/api/sequencing/order'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'

// Global components usually don't need imports if main.js registers them
// If not, they are assumed imported where used as per setup templates.
// import Editor from '@/components/Editor/index.vue'
// import ImageUpload from '@/components/ImageUpload/index.vue'
// import FileUpload from '@/components/FileUpload/index.vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '添加订单'
  },
  orderRow: {
    type: Object,
    default: () => ({})
  },
  customerOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref(null)

const form = ref({
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
  isEmail: 0,
  generation: 1,
  belongCompany: '深圳有康',
  produceCompany: '杭州有康',
  templateType: 1,
  sampleInfoList: [],
  genNo: '',
  remark: undefined,
  templateArrangement: '1',
  sequencingLab: undefined,
  synthesisLab: undefined,
  infoIncomplete: undefined,
  sampleDeliveryDate: new Date().toISOString().split('T')[0],
  urgent: '0',
  templateContent: undefined,
  sequencingTemplateAttachment: undefined,
  synthesisTemplateAttachment: undefined,
  photoAttachment: undefined
})

const rules = {
  // Can expand rules as needed
  'customerInfo.customerId': [{ required: true, message: '客户不能为空', trigger: 'blur' }]
}

const isEdit = computed(() => !!form.value.orderId)

// 🟢 解决下拉选项可能不在当前页导致回现空白的 Computed 逻辑
const localCustomerOptions = computed(() => {
  const list = [...props.customerOptions]
  if (form.value.customerId) {
    const found = list.find(item => item.customerId == form.value.customerId)
    if (!found) {
      list.push({
        customerId: form.value.customerId,
        customerName: form.value.customerName,
        address: form.value.customerAddress
      })
    }
  }
  return list
})

watch(
  () => props.modelValue,
  val => {
    if (val) {
      reset()
      if (props.orderRow && props.orderRow.orderId) {
        console.log('OrderDialog Fetching Details for:', props.orderRow.orderId)
        getOrder(props.orderRow.orderId).then(response => {
          const data = response.data
          // 1. 保留 reset() 赋予的默认字段值，避免被后端缺失的字段覆盖为 undefined
          form.value = { ...form.value, ...data }

          // 2. 补救后端返回的扁平字段到 nested 结构 customerInfo 中
          if (data.customerId) {
            form.value.customerInfo = {
              customerId: data.customerId,
              customerName: data.customerName,
              address: data.customerAddress
            }

            const found = localCustomerOptions.value.find(item => item.customerId == data.customerId)
            if (found) {
              form.value.customerInfo = { ...form.value.customerInfo, ...found }
            }
          }
        })
      }
    }
  }
)

const localContent = ref('')
const parseTimer = ref(null)

watch(
  () => form.value.templateContent,
  v => {
    if (v !== localContent.value) {
      localContent.value = v === undefined ? '<p></p>' : v
    }
    if (parseTimer.value) clearTimeout(parseTimer.value)
    parseTimer.value = setTimeout(() => {
      autoParseTemplate()
    }, 500)
  },
  { immediate: true }
)

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
    templateType: 1,
    sampleInfoList: [],
    genNo: 'TEST001',
    remark: undefined,
    templateArrangement: '1',
    sequencingLab: undefined,
    synthesisLab: undefined,
    infoIncomplete: undefined,
    sampleDeliveryDate: new Date().toISOString().split('T')[0],
    urgent: '0',
    templateContent: undefined,
    sequencingTemplateAttachment: undefined,
    synthesisTemplateAttachment: undefined,
    photoAttachment: undefined
  }
  if (formRef.value) formRef.value.resetFields()
}

function handleUpdateVisible(val) {
  emit('update:modelValue', val)
}

function handleCustomerChange(id) {
  const val = localCustomerOptions.value.find(item => item.customerId == id)
  if (val) {
    form.value.customerInfo = { ...val }
    form.value.customerId = id
    form.value.customerName = val.customerName
  } else {
    form.value.customerInfo = { customerId: undefined }
    form.value.customerId = undefined
    form.value.customerName = undefined
  }
}

function handlePasteAnalyze(content) {
  autoParseTemplate(content)
}

function autoParseTemplate(rawContent) {
  const contentToParse = rawContent || form.value.templateContent
  if (!contentToParse) return

  try {
    const div = document.createElement('div')
    div.innerHTML = contentToParse
    const table = div.querySelector('table')
    const getCellText = cell => (cell.innerText || cell.textContent || '').trim()
    let data = []

    const defaultKeys = [
      'sampleId',
      'primer',
      'primerConcentration',
      'primerType',
      'sampleType',
      'antibioticType',
      'carrierName',
      'fragmentSize',
      'testResult',
      'returnState',
      'returnType',
      'remark'
    ]

    const headerMap = {
      样品编号: 'sampleId',
      测序引物: 'primer',
      引物名称: 'primer',
      引物浓度: 'primerConcentration',
      引物类型: 'primerType',
      样品类型: 'sampleType',
      抗生素类: 'antibioticType',
      抗性: 'antibioticType',
      载体名称: 'carrierName',
      片段大小: 'fragmentSize',
      是否测通: 'testResult',
      测序结果: 'testResult',
      是否返还: 'returnState',
      退回状态: 'returnState',
      返还类型: 'returnType',
      样品备注: 'remark',
      备注: 'remark',
      样品位置: 'samplePosition',
      引物位置: 'primerPosition',
      序列: 'seq',
      项目号: 'project',
      测序项目: 'project',
      项目: 'project',
      质粒长度: 'plasmidLength',
      原浓度: 'originConcentration',
      模板板号: 'templatePlateNo',
      模板孔号: 'templateHoleNo',
      完成状态: 'performance',
      完成情况: 'performance',
      流程名称: 'flowName',
      板号: 'plateNo',
      孔号: 'holeNo',
      所属公司: 'belongCompany',
      生产公司: 'produceCompany',
      孔数: 'holeNumber',
      孔号数量: 'holeNumber',
      排版方式: 'layout'
    }

    if (table) {
      const rows = table.rows
      if (rows.length < 1) return
      const firstRowTexts = Array.from(rows[0].cells).map(cell => getCellText(cell))
      const getKey = header => headerMap[header] || header
      let validKeys = firstRowTexts.map(getKey)
      const knownKeysCount = validKeys.filter(k => Object.values(headerMap).includes(k)).length
      let startRow = 1
      if (knownKeysCount === 0) {
        validKeys = defaultKeys
        startRow = 0
      }

      for (let i = startRow; i < rows.length; i++) {
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
        if (hasData) data.push(item)
      }
    } else {
      // Plain text / TSV fallback
      const text = div.innerText.trim()
      const rows = text
        .split('\n')
        .map(r => r.trim())
        .filter(r => r)
      if (rows.length < 1) return

      const firstRowParts = rows[0].split('\t').map(h => h.trim())
      const getKey = header => headerMap[header] || header
      let validKeys = firstRowParts.map(getKey)

      const knownKeysCount = validKeys.filter(k => Object.values(headerMap).includes(k)).length

      let startRow = 1
      if (knownKeysCount === 0) {
        validKeys = defaultKeys
        startRow = 0
      }

      for (let i = startRow; i < rows.length; i++) {
        const cells = rows[i].split('\t')
        const item = {}
        validKeys.forEach((key, index) => {
          if (key && index < cells.length) item[key] = cells[index]?.trim()
        })
        data.push(item)
      }
    }
    if (data.length > 0) {
      form.value.sampleInfoList = data
    }
  } catch (error) {
    console.warn('Auto parse failed:', error)
  }
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      const submitData = { ...form.value }
      delete submitData.templateContent

      if (isEdit.value) {
        updateOrder(submitData).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          emit('update:modelValue', false)
          emit('success')
        })
      } else {
        addOrder(submitData).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          emit('update:modelValue', false)
          emit('success')
        })
      }
    }
  })
}
</script>

<style>
/* Same scoping tricks as index.vue for Editor */
</style>
