<template>
  <el-dialog
    v-bind="$attrs"
    :class="['base-dialog', customClass]"
    :close-on-click-modal="false"
    append-to-body
  >
    <slot></slot>
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.base-dialog {
  :deep(.el-dialog__body) {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  :deep(.el-form-item) {
    margin-bottom: 8px; /* Adjust as needed, default is usually 18px */
    
    &.el-form-item--default {
      margin-bottom: 12px;
    }
  }
}
</style>
