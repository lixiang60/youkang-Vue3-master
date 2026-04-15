<template>
  <el-dialog v-model="visible" title="发货明细报表" width="600px" append-to-body :close-on-click-modal="false">
    <div class="filter-dialog-body">
      <el-row class="form-row">
        <el-col :span="4" class="label">开始时间：</el-col>
        <el-col :span="8" class="content">
          <el-date-picker
            v-model="form.startTime"
            type="date"
            placeholder="选择日期"
            size="small"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="4" class="label">截止时间：</el-col>
        <el-col :span="8" class="content">
          <el-date-picker v-model="form.endTime" type="date" placeholder="选择日期" size="small" style="width: 100%" />
        </el-col>
      </el-row>
      <el-row class="form-row">
        <el-col :span="4" class="label">所属公司：</el-col>
        <el-col :span="8" class="content">
          <el-select v-model="form.company" placeholder="请选择" size="small" style="width: 100%">
            <el-option label="总公司" value="main" />
            <el-option label="分公司" value="branch" />
          </el-select>
        </el-col>
        <el-col :span="12"></el-col>
      </el-row>
      <div class="action-row">
        <el-button size="small" type="info" plain :icon="Printer" @click="handleDetailPrint">发货明细表</el-button>
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
import { ref, computed } from 'vue'
import { Check, Close, Printer } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'print'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const form = ref({
  startTime: '',
  endTime: '',
  company: ''
})

function handleDetailPrint() {
  emit('print', { ...form.value })
}

function handleConfirm() {
  emit('print', { ...form.value })
  visible.value = false
}
</script>

<style scoped>
.filter-dialog-body {
  border: 1px solid #dcdfe6;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
}

.label {
  background-color: #f8f9fb;
  padding: 10px;
  text-align: center;
  border-right: 1px solid #dcdfe6;
  font-size: 13px;
}

.content {
  padding: 5px 10px;
  border-right: 1px solid #dcdfe6;
}

.content:last-child {
  border-right: none;
}

.action-row {
  text-align: center;
  padding: 15px;
}

:deep(.el-dialog__header) {
  background-color: #f8f9fb;
  margin-right: 0;
  padding: 10px 20px;
}

:deep(.el-dialog__title) {
  font-size: 14px;
  font-weight: bold;
}
</style>
