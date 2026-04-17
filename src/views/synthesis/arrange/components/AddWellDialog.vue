<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    width="600px"
    append-to-body
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 提示信息区域：展示选中生产编号统计 -->
      <div v-if="selectedItems && selectedItems.length > 0" class="selection-info">
        选中生产编号：
        <span class="highlight id-list">{{ selectedProduceIds }}</span>
      </div>
      <div v-else class="selection-info-empty mb20">
        <el-alert title="请先在列表中选中需要操作的样品" type="warning" :closable="false" show-icon />
      </div>

      <!-- 表单输入区域 -->
      <el-row :gutter="20" class="mt20">
        <el-col :span="24">
          <el-form-item label="板号" prop="plateNo">
            <el-input v-model="form.plateNo" placeholder="请输入板号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="孔号" prop="wellNo">
            <el-input v-model="form.wellNo" placeholder="请输入孔号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="排版方式" prop="arrangeType">
            <el-radio-group v-model="form.arrangeType">
              <el-radio label="horizontal">横排</el-radio>
              <el-radio label="vertical">竖排</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :disabled="!selectedItems || selectedItems.length === 0" @click="submitForm"
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
  title: { type: String, default: '手工直接添加板号' }, // 注：遵循截图上的原始文字，但解耦为prop
  selectedItems: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'success'])

// --- 2. State ---
const formRef = ref(null)
const form = reactive({
  plateNo: '',
  wellNo: '',
  arrangeType: 'horizontal',
  remark: ''
})

const rules = {
  plateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }],
  wellNo: [{ required: true, message: '请输入孔号', trigger: 'blur' }],
  arrangeType: [{ required: true, message: '请选择排版方式', trigger: 'change' }]
}

// --- 3. Computed ---
const selectedProduceIds = computed(() => {
  return props.selectedItems.map(item => item.produceId).join(', ')
})

// --- 6. Watchers ---
watch(
  () => props.modelValue,
  val => {
    if (val) {
      resetForm()
    }
  }
)

// --- 4. Methods ---
function resetForm() {
  form.plateNo = ''
  form.wellNo = ''
  form.arrangeType = 'horizontal'
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
      // 模拟 API 请求
      proxy.$modal.msgSuccess('手工添加板号及孔号成功！')
      emit('success')
      handleClose()
    }
  })
}
</script>

<style scoped>
.selection-info {
  background-color: #f8f8f9;
  padding: 12px 16px;
  border-radius: 4px;
  border-left: 4px solid #e6a23c;
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
  word-break: break-all;
}

.selection-info .highlight {
  color: #ff4949;
  font-weight: bold;
}

.mt20 {
  margin-top: 20px;
}
.mb20 {
  margin-bottom: 20px;
}
</style>
