<template>
  <el-dialog v-model="visible" title="选择销售员" width="900px" append-to-body @close="cancel">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :span="6">
        <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="Search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            ref="deptRef"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!-- 用户列表 -->
      <el-col :span="18">
        <el-form ref="queryRef" :model="queryParams" :inline="true" size="small">
          <el-form-item label="姓名" prop="nickName">
            <el-input
              v-model="queryParams.nickName"
              placeholder="请输入姓名"
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
          border
          stripe
          height="400"
          style="width: 100%"
          @current-change="handleCurrentChange"
          @row-dblclick="confirm"
        >
          <el-table-column type="index" width="55" align="center" label="序号" />
          <el-table-column label="姓名" align="center" prop="nickName" />
          <el-table-column label="账号" align="center" prop="userName" />
          <el-table-column label="部门" align="center" prop="dept.deptName" show-overflow-tooltip />
          <el-table-column label="手机号" align="center" prop="phonenumber" width="120" />
        </el-table>

        <pagination
          v-show="total > 0"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :disabled="!currentRow" @click="confirm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { listUser, deptTreeSelect } from '@/api/system/user'
import { ref, reactive, computed, watch, nextTick, getCurrentInstance } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const currentRow = ref(null)
const tableRef = ref(null)
const deptRef = ref(null)
const deptOptions = ref([])
const deptName = ref('')

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  nickName: undefined,
  deptId: undefined,
  status: '0' // Only show active users
})

const { proxy } = getCurrentInstance()

/** 查询部门树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data
  })
}

/** 过滤节点 */
function filterNode(value, data) {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}

/** 部门节点单击事件 */
function handleNodeClick(data) {
  queryParams.deptId = data.id
  handleQuery()
}

/** 查询用户列表 */
function getList() {
  loading.value = true
  listUser(queryParams).then(response => {
    dataList.value = response.rows || []
    total.value = parseInt(response.total) || 0
    loading.value = false

    // Pre-select row if selectedName exists
    if (props.selectedName) {
      nextTick(() => {
        const row = dataList.value.find(item => item.nickName === props.selectedName)
        if (row && tableRef.value) {
          tableRef.value.setCurrentRow(row)
          currentRow.value = row
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
  deptRef.value?.setCurrentKey(null)
  queryParams.deptId = undefined
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleCurrentChange(val) {
  currentRow.value = val
}

function confirm() {
  if (currentRow.value) {
    emit('confirm', currentRow.value)
    visible.value = false
  }
}

function cancel() {
  visible.value = false
}

// 节点过滤监听
watch(deptName, val => {
  deptRef.value.filter(val)
})

// Watch for visible changes to reload data
watch(
  () => props.modelValue,
  val => {
    if (val) {
      getDeptTree()
      getList()
    }
  }
)
</script>

<style scoped>
.head-container {
  margin-bottom: 5px;
}
</style>
