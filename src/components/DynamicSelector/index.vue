<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :style="style"
    @update:model-value="handleChange"
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
import { listSelectorOption } from '@/api/common'

const props = defineProps({
  modelValue: [String, Number, Array],
  type: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  style: {
    type: Object,
    default: () => ({ width: '100%' })
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const options = ref([])

function getOptions() {
  listSelectorOption(props.type).then(response => {
    options.value = response.data
  })
}

function handleChange(val) {
  emit('update:modelValue', val)
  emit('change', val)
}

onMounted(() => {
  if (props.type) {
    getOptions()
  }
})
</script>
