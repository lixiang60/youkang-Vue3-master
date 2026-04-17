<template>
  <el-dialog v-model="visible" title="设置分装状态" width="650px" append-to-body destroy-on-close>
    <!-- 头部图标增强 -->
    <template #header>
      <div style="display: flex; align-items: center">
        <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px"><EditPen /></el-icon>
        <span style="font-weight: bold; font-size: 16px">设置分装状态</span>
      </div>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 选中信息概览区 -->
      <div class="selection-info mb20">
        <el-icon style="margin-right: 4px; vertical-align: middle"><InfoFilled /></el-icon>
        <span>
          选中数量：<span class="highlight">{{ selectedItems.length }}</span
          >，选中生产编号：<span class="highlight">{{ productionNos }}</span>
        </span>
      </div>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="分装状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择分装状态" style="width: 100%">
              <el-option label="成功" value="成功" />
              <el-option label="重合" value="重合" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="返回原因" prop="returnReason">
            <el-input
              v-model="form.returnReason"
              type="textarea"
              :rows="3"
              placeholder="对于状态为'重合'的项，请填写返回原因"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="submitForm">确 定</el-button>
        <el-button type="danger" :icon="Close" @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="AliquotStatusDialog">
import { ref, reactive, computed, watch, getCurrentInstance } from 'vue'
import { EditPen, InfoFilled, Check, Close } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// ================= 1. State ==============================
const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const formRef = ref(null)
const form = reactive({
  status: undefined,
  remark: '',
  returnReason: ''
})

const rules = {
  status: [{ required: true, message: '该输入项为必输项', trigger: 'change' }]
}

// ================= 2. Computed ===========================
const productionNos = computed(() => {
  return props.selectedItems.map(item => item.productionNo).join(',')
})

// ================= 3. Methods ============================
function submitForm() {
  if (!formRef.value) return

  formRef.value.validate(valid => {
    if (valid) {
      // 根据业务规则提示
      if (form.status === '成功') {
        proxy.$modal.msgSuccess('操作成功，流转到合成烘干环节')
      } else {
        proxy.$modal.msgWarning('操作成功，退回到反应生产重新排版')
      }

      emit('success')
      visible.value = false
    }
  })
}

// 弹窗打开时重置
watch(visible, val => {
  if (val) {
    Object.assign(form, {
      status: undefined,
      remark: '',
      returnReason: ''
    })
    if (formRef.value) formRef.value.clearValidate()
  }
})
</script>

<style scoped>
.selection-info {
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  color: #e6a23c;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
}

.selection-info .highlight {
  color: #f56c6c;
  font-weight: bold;
  margin: 0 4px;
}

.mb20 {
  margin-bottom: 20px;
}
</style>
