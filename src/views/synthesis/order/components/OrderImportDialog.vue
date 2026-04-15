<template>
  <el-dialog v-model="visible" title="添加合成订单样品" width="700px" append-to-body :close-on-click-modal="false">
    <div class="well-form">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
        <el-row class="form-row">
          <el-col :span="4" class="label">客户选择：</el-col>
          <el-col :span="20" class="content">
            <el-input v-model="form.customerName" placeholder="点击选择客户" size="small" />
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="4" class="label">订单模式：</el-col>
          <el-col :span="20" class="content">
            <el-select v-model="form.orderMode" placeholder="请选择" size="small" style="width: 100%">
              <el-option label="OD模式" value="OD" />
              <el-option label="其他模式" value="Other" />
            </el-select>
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="4" class="label">加急：</el-col>
          <el-col :span="20" class="content">
            <el-radio-group v-model="form.isUrgent">
              <el-radio :label="'1'">是</el-radio>
              <el-radio :label="'0'">否</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="4" class="label">附件：</el-col>
          <el-col :span="16" class="content">
            <el-input v-model="form.fileName" readonly size="small" />
          </el-col>
          <el-col :span="4" class="content" style="text-align: center">
            <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleFileChange">
              <el-button size="small">选择文件</el-button>
            </el-upload>
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="4" class="label">关联基因样品编号：</el-col>
          <el-col :span="20" class="content">
            <el-input
              v-model="form.geneRelationNo"
              placeholder="请输入关联基因样品编号"
              size="small"
              style="width: 80%"
            />
            <span class="required-tip">（非必填项目）</span>
          </el-col>
        </el-row>
        <el-row class="form-row no-border">
          <el-col :span="4" class="label" style="height: 120px">备注：</el-col>
          <el-col :span="20" class="content" style="height: 120px">
            <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注" size="small" />
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" size="small" @click="handleSubmit">确定</el-button>
        <el-button type="danger" :icon="Close" size="small" @click="visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const form = ref({
  customerName: '',
  orderMode: 'OD',
  isUrgent: '0',
  fileName: '',
  file: null,
  geneRelationNo: '',
  remark: ''
})

const rules = {
  customerName: [{ required: true, message: '请选择客户', trigger: 'change' }]
}

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
.well-form {
  border: 1px solid #dcdfe6;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
}

.form-row.no-border {
  border-bottom: none;
}

.label {
  background-color: #f8f9fb;
  padding: 10px;
  text-align: center;
  border-right: 1px solid #dcdfe6;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.content {
  padding: 5px 15px;
  display: flex;
  align-items: center;
}

.required-tip {
  color: #606266;
  font-size: 12px;
  margin-left: 10px;
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
