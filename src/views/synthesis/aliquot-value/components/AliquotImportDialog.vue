<template>
  <el-dialog
    v-model="visible"
    width="750px"
    append-to-body
    top="10vh"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div style="display: flex; align-items: center; padding: 10px 0">
        <el-icon style="margin-right: 8px; color: #67c23a; font-size: 20px">
          <Upload />
        </el-icon>
        <span style="font-weight: bold; font-size: 16px">合成测值导入</span>
      </div>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 1. 文件上传区: 采用更现代的拖拽上传替代旧版简陋的选择按钮 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="Excel模板" required>
            <el-upload
              ref="uploadRef"
              class="upload-demo"
              drag
              action="#"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              accept=".xls,.xlsx"
              style="width: 100%"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">拖拽基于标准的 96 孔 Excel 分装值模板至此，或 <em>点击选择文件</em></div>
              <template #tip>
                <div class="el-upload__tip text-center">仅支持 .xls / .xlsx 格式的数据模板文件</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 2. 导入参数配置区 -->
      <el-row :gutter="20" style="margin-top: 15px">
        <el-col :span="24">
          <el-form-item label="导入板号" prop="plateNo">
            <el-input v-model="form.plateNo" placeholder="请输入目标导入板号" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="稀释倍数" prop="dilutionFactor">
            <el-select v-model="form.dilutionFactor" placeholder="请选择稀释倍数" style="width: 100%" clearable>
              <el-option label="10" value="10" />
              <el-option label="50" value="50" />
              <el-option label="100" value="100" />
              <el-option label="200" value="200" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" :loading="uploading" @click="handleSubmit">确 定</el-button>
        <el-button type="danger" :icon="Close" @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive, getCurrentInstance } from 'vue'
import { Check, Close, Upload, UploadFilled } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const formRef = ref(null)
const uploadRef = ref(null)
const uploading = ref(false)
const selectedFile = ref(null)

const form = reactive({
  plateNo: '',
  dilutionFactor: '10' // 默认值
})

const rules = reactive({
  plateNo: [{ required: true, message: '请输入对应的导入板号', trigger: 'blur' }],
  dilutionFactor: [{ required: true, message: '请选择稀释倍数', trigger: 'change' }]
})

function handleFileChange(file) {
  selectedFile.value = file.raw
}

function handleFileRemove() {
  selectedFile.value = null
}

function handleClose() {
  form.plateNo = ''
  form.dilutionFactor = '10'
  selectedFile.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
  visible.value = false
}

function handleSubmit() {
  if (!selectedFile.value) {
    proxy.$modal.msgError('请先选择要导入的 Excel 分装值测值文件')
    return
  }

  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      uploading.value = true

      // 模拟文件解析与接口提交过程
      setTimeout(() => {
        proxy.$modal.msgSuccess(`根据板号 ${form.plateNo} 更新数值成功！样品已流转到合成分装环节。`)
        uploading.value = false
        emit('success')
        handleClose()
      }, 1500)
    }
  })
}
</script>

<style scoped></style>
