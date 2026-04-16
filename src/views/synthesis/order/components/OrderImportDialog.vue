<template>
  <el-dialog v-model="visible" width="700px" append-to-body top="8vh" :close-on-click-modal="false">
    <template #header>
      <div style="display: flex; align-items: center; padding: 10px 0">
        <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
          <DocumentAdd />
        </el-icon>
        <span style="font-weight: bold; font-size: 16px">添加合成订单样品</span>
      </div>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="客户选择" prop="customerName">
            <el-input v-model="form.customerName" placeholder="点击选择客户" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="订单模式" prop="orderMode">
            <el-select v-model="form.orderMode" placeholder="请选择" style="width: 100%">
              <el-option label="OD模式" value="OD" />
              <el-option label="其他模式" value="Other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="加急" prop="isUrgent">
            <el-radio-group v-model="form.isUrgent">
              <el-radio :label="'1'">是</el-radio>
              <el-radio :label="'0'">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="附件" prop="fileName">
            <div style="display: flex; gap: 10px; width: 100%">
              <el-input v-model="form.fileName" readonly placeholder="未选择文件" style="flex: 1" />
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleFileChange">
                <el-button type="primary" plain>选择文件</el-button>
              </el-upload>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="关联基因样品编号" prop="geneRelationNo">
            <div style="display: flex; gap: 10px; align-items: center; width: 100%">
              <el-input v-model="form.geneRelationNo" placeholder="请输入关联基因样品编号" style="flex: 1" />
              <span class="required-tip" style="color: #909399; font-size: 13px">（非必填项目）</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

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
import { Check, Close, DocumentAdd } from '@element-plus/icons-vue'

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
/* 原有的 well-form 紧凑样式已移除，使用原生 el-form 提供更好的呼吸感 */
</style>
