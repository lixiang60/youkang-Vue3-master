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
  templateContent: ''
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

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const formData = new FormData()
      formData.append('orderId', props.orderId)
      formData.append('isEmail', form.isEmail)
      formData.append('templateStyle', form.templateStyle)
      
      if (form.templateStyle === 2) {
        if (!form.attachment) {
          ElMessage.error('请选择文件')
          return
        }
        formData.append('file', form.attachment)
      } else {
        if (!form.templateContent) {
           ElMessage.error('请输入模板内容')
           return
        }
        formData.append('templateContent', form.templateContent)
      }

      batchAddSample(formData).then(response => {
        ElMessage.success('批量添加成功')
        emit('success')
        emit('update:modelValue', false)
      })
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
