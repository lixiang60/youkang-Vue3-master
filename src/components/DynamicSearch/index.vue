<template>
  <el-collapse-transition>
    <div v-show="visible" class="mb15">
      <div class="search-panel">
        <el-form :model="modelValue" :inline="true" label-width="80px" size="small" class="compact-form">
          <el-row :gutter="10">
            <template v-for="item in fields" :key="item.prop">
              <el-col :span="6">
                <el-form-item :label="item.label" :prop="item.prop" style="width: 100%">
                  <el-input 
                    v-if="item.type === 'input'" 
                    v-model="modelValue[item.prop]" 
                    :placeholder="'请输入' + item.label" 
                    clearable 
                    @keyup.enter="handleSearch"
                  />
                  <el-select 
                    v-else-if="item.type === 'select'" 
                    v-model="modelValue[item.prop]" 
                    :placeholder="'请选择'" 
                    clearable 
                    style="width: 100%"
                  >
                    <el-option 
                      v-for="opt in item.options" 
                      :key="opt.value" 
                      :label="opt.label" 
                      :value="opt.value" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </template>
            <el-col :span="6" style="text-align: right; padding-top: 4px;">
              <el-button type="primary" icon="Search" size="small" @click="handleSearch">查询</el-button>
              <el-button icon="Refresh" size="small" @click="handleReset">重置</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  fields: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const visible = ref(false)

function toggleCollapse() {
  visible.value = !visible.value
}

function handleSearch() {
  emit('search')
}

function handleReset() {
  Object.keys(props.modelValue).forEach(key => {
    if (key !== 'pageNum' && key !== 'pageSize') {
      props.modelValue[key] = undefined
    }
  })
  emit('reset')
}

defineExpose({ toggleCollapse })
</script>

<style scoped>
.search-panel {
  padding: 15px 15px 5px 15px;
  background: #fdfdfd;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.mb15 {
  margin-bottom: 15px;
}
:deep(.el-form-item) {
  margin-bottom: 12px;
}
</style>
