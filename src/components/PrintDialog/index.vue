<template>
  <el-dialog v-model="visible" :title="title" :width="width" append-to-body :top="top" custom-class="print-dialog">
    <div :id="printId" class="print-content-wrapper">
      <slot></slot>
    </div>
    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button v-print="printSelector" type="success" :icon="Printer">立即打印</el-button>
        <el-button type="danger" :icon="Close" @click="visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Printer, Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: '打印预览'
  },
  width: {
    type: String,
    default: '1000px'
  },
  top: {
    type: String,
    default: '5vh'
  },
  printId: {
    type: String,
    default: 'printContent'
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const printSelector = computed(() => `#${props.printId}`)
</script>

<style scoped>
.print-content-wrapper {
  background: #fff;
  padding: 10px;
}

@media print {
  .print-dialog {
    :deep(.el-dialog__header),
    :deep(.el-dialog__footer) {
      display: none !important;
    }
  }
}
</style>
