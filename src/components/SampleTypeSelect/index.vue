<template>
  <el-select
    :model-value="modelValue"
    placeholder="请选择样品类型"
    clearable
    filterable
    style="width: 100%"
    @update:model-value="handleChange"
  >
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: [String, Number]
})

const emit = defineEmits(['update:modelValue'])

const options = ref([
  { label: '菌', value: '菌' },
  { label: '板菌', value: '板菌' },
  { label: 'P未', value: 'P未' },
  { label: '质粒', value: '质粒' },
  { label: 'P已', value: 'P已' },
  { label: '克隆', value: '克隆' },
  { label: '胶块', value: '胶块' },
  { label: '直提菌', value: '直提菌' },
  { label: '沉菌', value: '沉菌' },
  { label: '管菌', value: '管菌' },
  { label: '96孔板菌液', value: '96孔板菌液' },
  { label: '划线菌', value: '划线菌' },
  { label: '低拷贝菌', value: '低拷贝菌' },
  { label: '农杆菌', value: '农杆菌' }
])

function handleChange(val) {
  emit('update:modelValue', val)
}
</script>
