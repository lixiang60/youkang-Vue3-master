<template>
  <el-dialog v-model="visible" width="600px" append-to-body top="10vh" :close-on-click-modal="false">
    <template #header>
      <div style="display: flex; align-items: center; padding: 10px 0">
        <el-icon style="margin-right: 8px; color: #e6a23c; font-size: 20px">
          <FolderAdd />
        </el-icon>
        <span style="font-weight: bold; font-size: 16px">批量添加合成样品</span>
      </div>
    </template>

    <el-form :model="form" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="选择文件" prop="fileName">
            <div style="display: flex; gap: 10px; width: 100%">
              <el-input v-model="form.fileName" readonly placeholder="请上传模板文件" style="flex: 1" />
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="handleFileChange">
                <el-button type="primary" plain>选择文件</el-button>
              </el-upload>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="模板模式">
            <el-radio-group v-model="form.templateMode">
              <el-radio label="OD">OD模式</el-radio>
              <el-radio label="NMOL">NMOL模式</el-radio>
            </el-radio-group>
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
import { Check, Close, FolderAdd } from '@element-plus/icons-vue'

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
/* 移除多余的样式，使用标准的 el-form 渲染 */
</style>
