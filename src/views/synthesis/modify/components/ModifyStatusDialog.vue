<template>
  <el-dialog
    v-model="visible"
    width="750px"
    append-to-body
    top="6vh"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div style="display: flex; align-items: center; padding: 10px 0">
        <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
          <EditPen />
        </el-icon>
        <span style="font-weight: bold; font-size: 16px">{{ title }}</span>
      </div>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 提示信息区域 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="生产编号" class="highlight-info">
            <span style="color: #f56c6c">
              选中数量：{{ selectedIds?.length || 0 }}， 选中生产编号：{{ (selectedIds || []).join(',') }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 表单区域 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="修饰状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择修饰状态" style="width: 100%" clearable>
              <el-option label="成功" value="success" />
              <el-option label="重合" value="remake" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="返回原因" prop="returnReason">
            <el-input
              v-model="form.returnReason"
              type="textarea"
              :rows="3"
              placeholder="请输入返还原因（如修饰状态选重合则必填）"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="handleSubmit">确 定</el-button>
        <el-button type="danger" :icon="Close" @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive, getCurrentInstance } from 'vue'
import { Check, Close, EditPen } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '设置修饰状态'
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const formRef = ref(null)
const form = reactive({
  status: '',
  remark: '',
  returnReason: ''
})

const rules = reactive({
  status: [{ required: true, message: '请选择修饰状态', trigger: 'change' }]
})

function resetForm() {
  form.status = ''
  form.remark = ''
  form.returnReason = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function handleClose() {
  resetForm()
  visible.value = false
}

function handleSubmit() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.status === 'remake' && !form.returnReason.trim()) {
        proxy.$modal.msgError('修饰状态为"重合"时，请填写返回原因')
        return
      }

      proxy.$modal.msg('执行中...')
      setTimeout(() => {
        proxy.$modal.msgSuccess('设置修饰状态成功')
        emit('success')
        handleClose()
      }, 500)
    }
  })
}
</script>

<style scoped>
.highlight-info :deep(.el-form-item__content) {
  width: 100%;
  word-break: break-all;
}
</style>
