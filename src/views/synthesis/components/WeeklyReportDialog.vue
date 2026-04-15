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
          <el-table-column label="订单号" align="center" prop="orderId" width="150" />
          <el-table-column label="订单状态" align="center" prop="orderStatus" width="90" />
          <el-table-column label="单类" align="center" prop="orderType" width="80" />
          <el-table-column label="客户ID" align="center" prop="customerId" width="80" />
          <el-table-column label="客户姓名" align="center" prop="customerName" width="100" />
          <el-table-column label="客户单位" align="center" prop="groupName" width="150" show-overflow-tooltip />
          <el-table-column label="客户等级" align="center" prop="customerLevel" width="90" />
          <el-table-column label="课题组" align="center" prop="groupName" width="120" show-overflow-tooltip />
          <el-table-column label="计价单位" align="center" prop="quantityType" width="80" />
          <el-table-column label="单价" align="center" prop="unitPrice" width="80" />
          <el-table-column label="数量" align="center" prop="quantity" width="70" />
          <el-table-column label="金额" align="center" prop="totalPrice" width="90" />
          <el-table-column label="结算方式" align="center" prop="paymentMethod" width="100" />
          <el-table-column label="销售员" align="center" prop="salesman" width="100" />
          <el-table-column label="地区" align="center" prop="region" width="80" />
          <el-table-column label="编号" align="center" prop="serialNo" width="120" />
          <el-table-column label="产品" align="center" prop="product" width="120" />
          <el-table-column label="发票" align="center" prop="invoice" width="100" />
          <el-table-column label="email" align="center" prop="email" width="150" show-overflow-tooltip />
          <el-table-column label="结束时间" align="center" prop="endTime" width="160" />
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '时间段报表打印/导出' }
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
    // 实际项目中会调用通用下载方法
    // proxy.download('sequencing/report/weekly/export', queryParams, `weekly_report_${new Date().getTime()}.xlsx`)
  })
}

/** 生成模拟数据 */
function generateMockData() {
  const names = ['姚园园', '李爱琴', '郑向阳', '陈真真', '张三', '李四']
  const groups = ['北京工业大学', '中国林科院', '清华大学', '中科院遗传所']
  const products = ['PCR纯化', 'PCR扩增', '质粒测序', '菌体测序']

  return Array.from({ length: 15 }, (_, i) => ({
    deliveryTime: '2018-06-17',
    orderId: '2018061717465717' + (100 + i),
    orderStatus: i % 2 === 0 ? '完成' : '发单',
    orderType: i % 3 === 0 ? '公司' : '个人',
    customerId: 200 + i,
    customerName: names[i % names.length],
    customerUnit: groups[i % groups.length],
    customerLevel: '0',
    groupName: groups[i % groups.length],
    quantityType: i % 2 === 0 ? '条' : '个',
    unitPrice: 15,
    quantity: 20 - i,
    totalPrice: (20 - i) * 15,
    paymentMethod: i % 2 === 0 ? '预付' : '课题组结算',
    salesman: '王飞',
    region: '北京',
    serialNo: 'PCR-' + (1000 + i),
    product: products[i % products.length],
    invoice: '清华发票',
    email: 'test' + i + '@rbiotech.com',
    endTime: '2018-06-17 17:46:57'
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
