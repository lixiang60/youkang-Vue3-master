<template>
  <el-select
    :model-value="modelValue"
    placeholder="请选择抗生素类型"
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

// Placeholder IDs - User to confirm
const options = ref([
  { label: 'AMP+', value: 'AMP+' },
  { label: 'kana', value: 'kana' },
  { label: '四环素', value: '四环素' },
  { label: '氯霉素', value: '氯霉素' }
])

function handleChange(val) {
  emit('update:modelValue', val)
}
</script>
