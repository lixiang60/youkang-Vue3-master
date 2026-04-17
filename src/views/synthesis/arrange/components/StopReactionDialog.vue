<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    width="550px"
    append-to-body
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <!-- 提示信息区域 -->
      <div v-if="selectedItems && selectedItems.length > 0" class="selection-info">
        <span class="highlight">选中数量：{{ selectedItems.length }}</span
        >， 选中生产编号：
        <span class="id-list">{{ selectedProduceIds }}</span>
      </div>
      <div v-else class="selection-info-empty mb20">
        <el-alert title="请先在列表中选中需要停止反应的样品" type="warning" :closable="false" show-icon />
      </div>

      <!-- 表单输入区域 -->
      <el-row :gutter="20" class="mt20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="5" placeholder="请输入停止反应的原因或备注信息" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="danger" :disabled="!selectedItems || selectedItems.length === 0" @click="submitForm"
          >确 定</el-button
        >
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive, getCurrentInstance, watch } from 'vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '停止反应' },
  selectedItems: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'success'])

// --- State ---
const formRef = ref(null)
const form = reactive({
  remark: ''
})

const rules = {
  remark: [{ required: true, message: '请填写停止原因(备注)', trigger: 'blur' }]
}

// --- Computed ---
const selectedProduceIds = computed(() => {
  return props.selectedItems.map(item => item.produceId).join(', ')
})

// --- Watchers ---
watch(
  () => props.modelValue,
  val => {
    if (val) {
      resetForm()
    }
  }
)

// --- Methods ---
function resetForm() {
  form.remark = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (!props.selectedItems || props.selectedItems.length === 0) {
        proxy.$modal.msgWarning('没有选中的样品')
        return
      }
      // 真实后端API交互点
      proxy.$modal
        .confirm(`确认要将选中的 ${props.selectedItems.length} 个样品停止反应吗？此操作不可逆！`)
        .then(() => {
          // 模拟 API 请求成功
          proxy.$modal.msgSuccess('操作成功，已停止反应')
          emit('success')
          handleClose()
        })
        .catch(() => {})
    }
  })
}
</script>

<style scoped>
.selection-info {
  background-color: #fff1f0;
  padding: 12px 16px;
  border-radius: 4px;
  border-left: 4px solid #ff4d4f;
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
  word-break: break-all;
}

.selection-info .highlight {
  color: #ff4d4f;
  font-weight: bold;
}

.selection-info .id-list {
  color: #666;
  line-height: 1.5;
}

.mt20 {
  margin-top: 20px;
}
.mb20 {
  margin-bottom: 20px;
}
</style>
