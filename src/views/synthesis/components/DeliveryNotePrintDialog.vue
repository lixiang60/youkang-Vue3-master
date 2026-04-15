<template>
  <el-dialog v-model="visible" title="送货单打印" width="500px" append-to-body :close-on-click-modal="false">
    <div class="print-dialog-body">
      <div class="form-item">
        <span class="label">报表类型：</span>
        <el-radio-group v-model="reportType">
          <el-radio label="standard">标准式</el-radio>
          <el-radio label="qingdao">青岛式</el-radio>
        </el-radio-group>
        <el-button size="small" type="info" plain :icon="Printer" style="margin-left: 20px" @click="handleLabelPrint">
          标签打印
        </el-button>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="handleConfirm">确定</el-button>
        <el-button type="danger" :icon="Close" @click="visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Check, Close, Printer } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'print'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const reportType = ref('standard')

function handleLabelPrint() {
  emit('print', { type: reportType.value, mode: 'label' })
}

function handleConfirm() {
  emit('print', { type: reportType.value, mode: 'confirm' })
  visible.value = false
}
</script>

<style scoped>
.print-dialog-body {
  padding: 10px 0;
  border: 1px solid #dcdfe6;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.label {
  padding: 10px;
  border-right: 1px solid #dcdfe6;
  margin-right: 20px;
  width: 100px;
  text-align: center;
  background-color: #f8f9fb;
}

:deep(.el-dialog__header) {
  background-color: #f8f9fb;
  margin-right: 0;
  padding: 10px 20px;
}

:deep(.el-dialog__title) {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}
</style>
