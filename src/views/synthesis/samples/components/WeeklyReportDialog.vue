<template>
  <el-dialog v-model="visible" :title="title" width="1200px" append-to-body top="5vh">
    <div class="weekly-report-container">
      <!-- 过滤表单 -->
      <div class="filter-section card-box">
        <el-form ref="queryRef" :model="queryParams" :inline="true" label-width="80px">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="queryParams.startTime"
              type="date"
              placeholder="开始日期"
              value-format="YYYY-MM-DD"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="截止时间" prop="endTime">
            <el-date-picker
              v-model="queryParams.endTime"
              type="date"
              placeholder="截止日期"
              value-format="YYYY-MM-DD"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="所属公司" prop="company">
            <el-select v-model="queryParams.company" placeholder="请选择公司" style="width: 180px">
              <el-option label="北京分公司" value="北京分公司" />
              <el-option label="广州分公司" value="广州分公司" />
              <el-option label="上海分公司" value="上海分公司" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">查询数据预览</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            <el-button type="warning" icon="Download" :disabled="!dataList.length" @click="handleExport"
              >导出 Excel</el-button
            >
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据预览表格 -->
      <div class="table-section mt10">
        <el-table v-loading="loading" :data="dataList" border stripe size="small" height="500px">
          <el-table-column label="送样日期" align="center" prop="deliveryTime" width="100" />
          <el-table-column label="生产编号" align="center" prop="produceId" width="120" />
          <el-table-column label="订单号" align="center" prop="orderId" width="150" />
          <el-table-column label="客户姓名" align="center" prop="customerName" width="100" />
          <el-table-column label="引物名称" align="center" prop="primerName" width="120" />
          <el-table-column label="序列(5'-3')" align="center" prop="sequence" width="200" show-overflow-tooltip />
          <el-table-column label="碱基数" align="center" prop="baseCount" width="70" />
          <el-table-column label="OD总量" align="center" prop="odTotal" width="80" />
          <el-table-column label="金额" align="center" prop="totalPrice" width="90" />
          <el-table-column label="结算方式" align="center" prop="paymentMethod" width="100" />
          <el-table-column label="纯化方式" align="center" prop="purification" width="100" />
          <el-table-column label="状态" align="center" prop="status" width="100" />
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '合成周报打印/导出' }
})

const emit = defineEmits(['update:modelValue'])
const { proxy } = getCurrentInstance()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const loading = ref(false)
const dataList = ref([])
const queryParams = reactive({
  startTime: '2018-06-01',
  endTime: '2018-06-20',
  company: '北京分公司'
})

/** 查询数据 (Mock) */
function handleQuery() {
  loading.value = true
  // 模拟接口延迟
  setTimeout(() => {
    dataList.value = generateMockData()
    loading.value = false
    proxy.$modal.msgSuccess('查询成功，共 ' + dataList.value.length + ' 条数据')
  }, 500)
}

/** 重置查询 */
function resetQuery() {
  queryParams.startTime = ''
  queryParams.endTime = ''
  queryParams.company = ''
  dataList.value = []
}

/** 导出 Excel (Mock) */
function handleExport() {
  proxy.$modal.confirm('确定导出当前预览的周报数据吗？').then(() => {
    proxy.$modal.msg('功能接入中...')
    // proxy.download('synthesis/report/weekly/export', queryParams, `synthesis_weekly_report_${new Date().getTime()}.xlsx`)
  })
}

/** 生成模拟数据 */
function generateMockData() {
  const names = ['姚园园', '李爱琴', '郑向阳', '陈真真', '张三', '李四']

  return Array.from({ length: 15 }, (_, i) => ({
    deliveryTime: '2018-06-17',
    produceId: '11366' + (60 + i),
    orderId: '201806202156316' + (10 + i),
    customerName: names[i % names.length],
    primerName: 'ku80upHpfAA-' + i,
    sequence: 'AAGGAGTTCGTTGATCGA',
    baseCount: 45 + i,
    odTotal: 2,
    totalPrice: (20 - i) * 15,
    paymentMethod: i % 2 === 0 ? '预付' : '课题组结算',
    purification: 'OPC',
    status: '-1'
  }))
}
</script>

<style scoped>
.weekly-report-container {
  padding: 10px;
}
.filter-section {
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.mt10 {
  margin-top: 10px;
}
.card-box {
  margin-bottom: 10px;
}
</style>
