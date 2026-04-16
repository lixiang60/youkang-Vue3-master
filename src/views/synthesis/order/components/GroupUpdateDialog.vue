<template>
  <el-dialog v-model="visible" width="600px" append-to-body top="10vh" :close-on-click-modal="false">
    <template #header>
      <div style="display: flex; align-items: center; padding: 10px 0">
        <el-icon style="margin-right: 8px; color: #67c23a; font-size: 20px">
          <User />
        </el-icon>
        <span style="font-weight: bold; font-size: 16px">更新课题组</span>
      </div>
    </template>

    <el-form :model="form" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="订单号">
            <el-input v-model="form.orderId" readonly placeholder="订单号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="客户选择">
            <el-select
              v-model="form.groupName"
              placeholder="请输入课题组关键字选择"
              filterable
              remote
              :remote-method="remoteGroupSearch"
              :loading="loading"
              style="width: 100%"
            >
              <el-option v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="handleUpdate">确定</el-button>
        <el-button type="danger" :icon="Close" @click="visible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { User, Check, Close } from '@element-plus/icons-vue'

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
/* 原有的 well-form 紧凑样式已移除，使用原生 el-form 提供更好的呼吸感 */
</style>
