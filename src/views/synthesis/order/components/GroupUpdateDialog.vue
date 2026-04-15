<template>
  <el-dialog v-model="visible" title="更新课题组" width="600px" append-to-body :close-on-click-modal="false">
    <div class="well-form">
      <el-form :model="form" label-width="0">
        <el-row class="form-row">
          <el-col :span="4" class="label">订单号：</el-col>
          <el-col :span="20" class="content">
            <el-input v-model="form.orderId" readonly size="small" />
          </el-col>
        </el-row>
        <el-row class="form-row no-border">
          <el-col :span="4" class="label">客户选择：</el-col>
          <el-col :span="20" class="content">
            <el-select
              v-model="form.groupName"
              placeholder="请输入课题组关键字选择"
              filterable
              remote
              :remote-method="remoteGroupSearch"
              :loading="loading"
              size="small"
              style="width: 100%"
            >
              <el-option v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="primary" size="small" @click="handleUpdate">更新</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  orderId: String
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const form = ref({
  orderId: '',
  groupName: ''
})

const loading = ref(false)
const groupOptions = ref([
  { label: '何爱彬', value: '何爱彬' },
  { label: '张建斌', value: '张建斌' },
  { label: '李科研', value: '李科研' }
])

watch(
  () => props.orderId,
  val => {
    form.value.orderId = val
  },
  { immediate: true }
)

function remoteGroupSearch(query) {
  if (query) {
    loading.value = true
    // 模拟模糊查询
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
}

function handleUpdate() {
  emit('success', form.value.groupName)
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
