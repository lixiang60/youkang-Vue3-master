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
        <span style="font-weight: bold; font-size: 16px">设置纯化状态</span>
      </div>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 提示信息区域 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-alert type="info" :closable="false" style="margin-bottom: 20px; background-color: #f4f4f5">
            <template #title>
              <span style="color: #606266">
                选中数量：<strong style="color: #f56c6c">{{ selectedIds.length }}</strong
                >， 选中生产编号：<strong style="color: #f56c6c">{{ selectedIds.join(',') }}</strong>
              </span>
            </template>
          </el-alert>
        </el-col>
      </el-row>

      <!-- 状态选择 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="纯化状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择纯化状态" clearable style="width: 100%">
              <el-option label="成功" value="success" />
              <el-option label="重合" value="remake" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 备注 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 返回原因 (动态显示或必填逻辑) -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="返回原因" prop="returnReason" :required="form.status === 'remake'">
            <el-input
              v-model="form.returnReason"
              type="textarea"
              :rows="3"
              placeholder="请输入返回原因 (重合退回时必填)"
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
  status: [{ required: true, message: '请选择纯化状态', trigger: 'change' }],
  returnReason: [
    {
      validator: (rule, value, callback) => {
        if (form.status === 'remake' && !value) {
          callback(new Error('重合状态下必须填写返回原因'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

function handleClose() {
  form.status = ''
  form.remark = ''
  form.returnReason = ''
  if (formRef.value) {
    formRef.value.resetFields()
  }
  visible.value = false
}

function handleSubmit() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      const msg =
        form.status === 'success'
          ? '成功的项将流转到下一环节，模拟提交成功！'
          : '失败（重合）的项将退回反应生产重新安排，模拟提交成功！'
      proxy.$modal.msgWarning(msg)
      emit('success')
      handleClose()
    }
  })
}
</script>

<style scoped></style>
