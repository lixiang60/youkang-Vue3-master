<template>
  <el-dialog
    title="基因测序订单批量添加"
    :model-value="modelValue"
    width="800px"
    @update:model-value="handleUpdateVisible"
    append-to-body
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="batch-add-form">
      <el-form-item label="客户选择：" prop="customerId">
        <el-select
          v-model="form.customerId"
          placeholder="请选择"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in customerOptions"
            :key="item.customerId"
            :label="`${item.customerName}-${item.address || ''}-${item.email || ''}-${item.phone || ''}-${item.customerUnit || ''}`"
            :value="item.customerId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="加急：" prop="urgent">
        <el-radio-group v-model="form.urgent">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="加测：" prop="additionalTest">
        <el-radio-group v-model="form.additionalTest">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="模板模式：" prop="templateMode">
        <el-radio-group v-model="form.templateMode">
          <el-radio :label="1">普通</el-radio>
          <el-radio :label="2">自动增加</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="附件：" prop="attachment">
        <div class="upload-wrapper">
           <el-input v-model="fileName" readonly placeholder="请选择文件" style="flex: 1; margin-right: 10px;" />
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

      <el-form-item label="备注：" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="6"
          placeholder=""
        />
      </el-form-item>

      <div class="form-footer-action">
        <el-button type="default" @click="handleSubmit">添加</el-button>
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
import { batchAddOrder } from '@/api/sequencing/order'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  customerOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref(null)
const uploadRef = ref(null)
const fileName = ref('')
const form = reactive({
  customerId: undefined,
  urgent: 0,
  additionalTest: 0,
  templateMode: 1,
  attachment: null,
  remark: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  attachment: [{ required: true, message: '请选择附件', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    reset()
  }
})

function reset() {
  form.customerId = undefined
  form.urgent = 0
  form.additionalTest = 0
  form.templateMode = 1
  form.attachment = null
  form.remark = ''
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
      if (!form.attachment) {
        ElMessage.error('请选择附件')
        return
      }
      
      const formData = new FormData()
      formData.append('customerId', form.customerId)
      formData.append('urgent', form.urgent)
      formData.append('additionalTest', form.additionalTest)
      formData.append('templateMode', form.templateMode)
      formData.append('file', form.attachment)
      formData.append('remark', form.remark)

      batchAddOrder(formData).then(response => {
        ElMessage.success('添加成功')
        emit('success')
        emit('update:modelValue', false)
      })
    }
  })
}
</script>

<style scoped>
/* Removing custom background/border as requested */
/* .batch-add-form {
  border: 1px solid #aadeff;
  padding: 20px;
  background-color: #f0f8ff; 
} */

/* Override input styles to match screenshot mostly white with borders */
:deep(.el-form-item__label) {
  font-weight: bold;
  color: #333;
}

.upload-wrapper {
  display: flex;
  width: 100%;
  align-items: center;
}

.form-footer-action {
  text-align: center;
  margin-top: 20px;
  border-top: 1px solid #e6e6e6;
  padding-top: 10px;
}
</style>
