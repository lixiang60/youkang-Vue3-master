<template>
  <el-dialog v-model="visible" title="批量添加合成样品" width="600px" append-to-body :close-on-click-modal="false">
    <div class="batch-add-container">
      <div class="file-row">
        <el-input v-model="form.fileName" readonly size="small" style="width: 250px" />
        <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleFileChange">
          <el-button size="small" style="margin-left: 10px">选择文件</el-button>
        </el-upload>
      </div>

      <div class="mode-box">
        <span class="mode-label">请选择模板模式：</span>
        <el-radio-group v-model="form.templateMode">
          <el-radio label="OD">OD模式</el-radio>
          <el-radio label="NMOL">NMOL模式</el-radio>
        </el-radio-group>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="handleSubmit">确定</el-button>
        <el-button type="danger" :icon="Close" @click="visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const form = ref({
  fileName: '',
  file: null,
  templateMode: 'OD'
})

function handleFileChange(file) {
  form.value.fileName = file.name
  form.value.file = file.raw
}

function handleSubmit() {
  emit('submit', { ...form.value })
  visible.value = false
}
</script>

<style scoped>
.batch-add-container {
  padding: 20px;
  min-height: 200px;
}

.file-row {
  display: flex;
  align-items: center;
  margin-bottom: 80px;
}

.mode-box {
  border: 1px solid #b3d8ff;
  background-color: #ecf5ff;
  padding: 15px;
  display: flex;
  align-items: center;
}

.mode-label {
  color: #f56c6c;
  font-weight: bold;
  margin-right: 20px;
}

:deep(.el-dialog__header) {
  background-color: #f8f9fb;
  margin-right: 0;
  padding: 10px 20px;
}

:deep(.el-dialog__title) {
  color: #409eff;
  font-size: 14px;
  font-weight: bold;
}
</style>
