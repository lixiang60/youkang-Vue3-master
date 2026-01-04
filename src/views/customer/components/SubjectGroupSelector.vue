<template>
  <el-dialog title="选择课题组" v-model="visible" width="800px" append-to-body @close="cancel">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table 
      ref="tableRef"
      v-loading="loading" 
      :data="dataList" 
      highlight-current-row
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @row-dblclick="confirm"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="名称" align="center" prop="name" width="150" show-overflow-tooltip />
      <el-table-column label="地区" align="center" prop="region" width="100" />
      <el-table-column label="业务员" align="center" prop="salesPerson" width="100" />
      <el-table-column label="联系人" align="center" prop="contactPerson" width="100" />
      <el-table-column label="所属公司" align="center" prop="companyName" show-overflow-tooltip />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="confirm" :disabled="!currentRow">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { listResearch_group } from '@/api/customer/research_group'
import { ref, reactive, computed, watch, nextTick, getCurrentInstance } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(true)
const dataList = ref([])
const total = ref(0)
const currentRow = ref(null)
const tableRef = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  status: '0' // Only show active groups
})

const { proxy } = getCurrentInstance()

function getList() {
  loading.value = true
  listResearch_group(queryParams.value).then(response => {
    dataList.value = response.data.rows
    total.value = response.data.total
    loading.value = false
    
    // Pre-select row if selectedId exists provided
    if (props.selectedId) {
      nextTick(() => {
        const row = dataList.value.find(item => item.id == props.selectedId)
        if (row && tableRef.value) {
          tableRef.value.setCurrentRow(row)
          handleCurrentChange(row) // Manually trigger change to update currentRow state
        }
      })
    }
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleCurrentChange(val) {
  currentRow.value = val
  // Sync selection box
  if (val) {
    tableRef.value.clearSelection()
    tableRef.value.toggleRowSelection(val, true)
  }
}

function handleSelectionChange(selection) {
  if (selection.length > 1) {
    const lastRow = selection[selection.length - 1]
    tableRef.value.clearSelection()
    tableRef.value.toggleRowSelection(lastRow, true)
    currentRow.value = lastRow
  } else {
    currentRow.value = selection.length === 1 ? selection[0] : null
  }
}

function handleRowClick(row) {
  tableRef.value.clearSelection()
  tableRef.value.toggleRowSelection(row, true)
  currentRow.value = row
}

function confirm() {
  if (currentRow.value) {
    emit('confirm', currentRow.value)
    visible.value = false
  } else if (props.selectedId) {
     // If nothing selected but we have a selectedId prop, maybe we should return that? 
     // But strictly speaking, the user must select something.
     // Let's rely on currentRow.
  }
}

function cancel() {
  visible.value = false
}

// Watch for visible changes to reload data
watch(() => props.modelValue, (val) => {
  if (val) {
    getList()
  }
})
</script>
