<template>
  <el-dialog
    title="批量添加测序样品"
    :model-value="modelValue"
    width="900px"
    @update:model-value="handleUpdateVisible"
    append-to-body
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="batch-sample-form">
      <el-row>
        <el-col :span="12">
          <el-form-item label="订单号：">
            <el-input v-model="orderNoLocal" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发送邮件：" prop="isEmail">
            <el-radio-group v-model="form.isEmail">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="模板样式：" prop="templateStyle">
            <el-radio-group v-model="form.templateStyle">
              <el-radio :label="1">复制excel模式</el-radio>
              <el-radio :label="2">EXCEL模板</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.templateStyle === 2">
          <el-form-item label="测序模板附件：" prop="attachment">
             <div class="upload-flex">
               <el-input v-model="fileName" readonly style="flex:1; margin-right: 5px;" />
               <el-upload
                 ref="uploadRef"
                 action="#"
                 :show-file-list="false"
                 :auto-upload="false"
                 :on-change="handleFileChange"
                 accept=".xls,.xlsx"
               >
                 <el-button>选择文件</el-button>
               </el-upload>
             </div>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="divider"></div>

      <el-form-item label="模板内容：" prop="templateContent" v-if="form.templateStyle === 1">
        <Editor
          v-model="form.templateContent"
          :minHeight="200"
          :toolbar="false"
          style="width: 100%;"
          @paste-analyze="handlePasteAnalyze"
        />
      </el-form-item>
      
      <!-- Placeholder for layout if Style 2 is selected, maybe empty or simple text -->
      <div v-if="form.templateStyle === 2" style="height: 100px; text-align: center; color: #999; line-height: 100px;">
        请上传Excel模板文件
      </div>

    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center;">
        <el-button type="success" @click="handleSubmit">确 定</el-button>
        <el-button type="danger" @click="handleCancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { batchAddSample } from '@/api/sequencing/samples'
import { batchAddSampleByOrder } from '@/api/sequencing/order'
import { ElMessage } from 'element-plus'
import Editor from '@/components/Editor/index.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: [String, Number],
    default: null
  },
  orderNo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref(null)
const orderNoLocal = ref('')
const fileName = ref('')
const form = reactive({
  isEmail: 0,
  templateStyle: 1, // 1: Copy Excel, 2: Excel Template
  attachment: null,
  templateContent: '',
  sampleInfoList: []
})

const rules = {
  // Add validation rules if necessary
}

watch(() => props.modelValue, (val) => {
  if (val) {
    orderNoLocal.value = props.orderNo
    reset()
  }
})

function reset() {
  form.isEmail = 0
  form.templateStyle = 1
  form.attachment = null
  form.templateContent = ''
  form.sampleInfoList = []
  fileName.value = ''
  if (formRef.value) formRef.value.resetFields()
}

function handleUpdateVisible(val) {
  emit('update:modelValue', val)
}

function handleFileChange(file) {
  form.attachment = file.raw
  fileName.value = file.name
}

function handleCancel() {
  emit('update:modelValue', false)
}

function handlePasteAnalyze(content) {
  autoParseTemplate(content)
}

function autoParseTemplate(rawContent) {
  const contentToParse = rawContent || form.templateContent
  
  if (!contentToParse) {
    return
  }
  try {
    const div = document.createElement('div')
    div.innerHTML = contentToParse
    const table = div.querySelector('table')
    
    const getCellText = (cell) => (cell.innerText || cell.textContent || '').trim()
    
    let data = []
    
    const defaultKeys = [
      'sampleId', 'primer', 'primerConcentration', 'primerType', 
      'sampleType', 'antibioticType', 'carrierName', 'fragmentSize', 
      'testResult', 'returnState', 'returnType', 'remark'
    ]

    const headerMap = {
      '样品编号': 'sampleId', '测序引物': 'primer', '引物名称': 'primer', 
      '引物浓度': 'primerConcentration', '引物类型': 'primerType',
      '样品类型': 'sampleType', '抗生素类': 'antibioticType', '抗性': 'antibioticType',
      '载体名称': 'carrierName', '片段大小': 'fragmentSize', 
      '是否测通': 'testResult', '测序结果': 'testResult',
      '是否返还': 'returnState', '退回状态': 'returnState',
      '返还类型': 'returnType', 
      '样品备注': 'remark', '备注': 'remark',
      
      '样品位置': 'samplePosition', '引物位置': 'primerPosition',
      '序列': 'seq', '项目号': 'project', '质粒长度': 'plasmidLength',
      '原浓度': 'originConcentration', '模板板号': 'templatePlateNo', 
      '模板孔号': 'templateHoleNo', '完成状态': 'performance', 
      '流程名称': 'flowName', '板号': 'plateNo',
      '孔号': 'holeNo', '所属公司': 'belongCompany', '生产公司': 'produceCompany',
      '孔数': 'holeNumber', '排版方式': 'layout'
    }

    if (table) {
       const rows = table.rows
       if (rows.length < 1) return

       const firstRowTexts = Array.from(rows[0].cells).map(cell => getCellText(cell))
       const getKey = (header) => headerMap[header] || header
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
      const text = div.innerText.trim()
      const rows = text.split('\n').map(r => r.trim()).filter(r => r)
      if (rows.length < 1) return
      
      const firstRowParts = rows[0].split('\t').map(h => h.trim())
      const getKey = (header) => headerMap[header] || header
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
       form.sampleInfoList = data
    }

  } catch (error) {
    console.warn('Auto parse failed:', error)
  }
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.templateStyle === 1) {
        if (!form.templateContent) {
           ElMessage.error('请输入模板内容')
           return
        }
        if (!form.sampleInfoList || form.sampleInfoList.length === 0) {
           autoParseTemplate()
        }
        if (!form.sampleInfoList || form.sampleInfoList.length === 0) {
           ElMessage.error('解析失败或没有数据')
           return
        }
        
        const sampleList = form.sampleInfoList.map(item => ({
          ...item,
          orderId: props.orderId
        }))

        batchAddSampleByOrder({ sampleList }).then(response => {
          ElMessage.success('批量添加成功')
          emit('success')
          emit('update:modelValue', false)
        })
      } else {
        if (!form.attachment) {
          ElMessage.error('请选择文件')
          return
        }
        const formData = new FormData()
        formData.append('orderId', props.orderId)
        formData.append('isEmail', form.isEmail)
        formData.append('templateStyle', form.templateStyle)
        formData.append('file', form.attachment)

        batchAddSample(formData).then(response => {
          ElMessage.success('批量添加成功')
          emit('success')
          emit('update:modelValue', false)
        })
      }
    }
  })
}

</script>

<style scoped>
.batch-sample-form {
  padding: 10px;
}
.upload-flex {
  display: flex;
  align-items: center;
}
.divider {
  border-top: 1px solid #dcdfe6; /* Using simple border line instead of hr */
  margin: 0 -10px 10px -10px; /* Stretch across padding */
}
/* Match blue background from screenshot if desired, but user asked to remove custom styles previously. 
   Keeping it clean/default for now as per previous instruction context. */
</style>
