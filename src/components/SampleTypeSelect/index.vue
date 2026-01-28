<template>
  <el-select
    :model-value="modelValue"
    placeholder="请选择样品类型"
    clearable
    filterable
    @update:model-value="handleChange"
    style="width: 100%"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: [String, Number]
})

const emit = defineEmits(['update:modelValue'])

const options = ref([
  { label: '菌', value: 46 },
  { label: '板菌', value: 47 },
  { label: 'P未', value: 48 },
  { label: '质粒', value: 49 },
  { label: 'P已', value: 50 },
  { label: '克隆', value: 52 },
  { label: '胶块', value: 110 },
  { label: '直提菌', value: 115 },
  { label: '沉菌', value: 116 },
  { label: '管菌', value: 307 },
  { label: '96孔板菌液', value: 308 },
  { label: '划线菌', value: 317 },
  { label: '低拷贝菌', value: 396 },
  { label: '农杆菌', value: 741 }
])

function handleChange(val) {
  emit('update:modelValue', val)
}
</script>
