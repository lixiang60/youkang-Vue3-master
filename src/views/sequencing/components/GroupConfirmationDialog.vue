<template>
  <el-dialog v-model="visible" :title="title" width="600px" append-to-body>
    <div class="filter-form">
      <el-form :model="queryParams" label-width="80px">
        <el-form-item label="课题组">
          <el-input v-model="queryParams.groupName" placeholder="请输入课题组" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="queryParams.startTime"
                type="date"
                placeholder="开始时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间">
              <el-date-picker
                v-model="queryParams.endTime"
                type="date"
                placeholder="截止时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="text-align: center; margin-top: 20px">
        <el-button type="primary" icon="Printer" @click="handlePrintPreview">打印课题组确认清单</el-button>
      </div>
    </div>

    <!-- 打印预览包装 -->
    <print-dialog v-model="showPrint" title="课题组确认清单打印预览" print-id="printGroupConfirm">
      <div class="confirm-report-container">
        <div class="report-header">
          <h1 class="company-name">有康生物技术有限公司</h1>
          <h2 class="report-title">测序费用明细</h2>
        </div>

        <div class="report-meta">
          <div class="meta-row">
            <div class="meta-item">
              单 位：<span class="underline">{{ printData.unit }}</span>
            </div>
            <div class="meta-item">
              客户姓名：<span class="underline">{{ printData.customerName }}</span>
            </div>
          </div>
          <div class="meta-row">
            <div class="meta-item">
              课题组：<span class="underline">{{ queryParams.groupName }}</span>
            </div>
          </div>
        </div>

        <table class="report-table">
          <thead>
            <tr>
              <th>送样日期</th>
              <th>订单号</th>
              <th>品名</th>
              <th>规格</th>
              <th>数量</th>
              <th>单价</th>
              <th>金额</th>
              <th>结束日期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in dataList" :key="index">
              <td align="center">{{ item.deliveryTime }}</td>
              <td align="center">{{ item.orderId }}</td>
              <td align="center">{{ item.productName }}</td>
              <td align="center">{{ item.spec }}</td>
              <td align="center">{{ item.quantity }}</td>
              <td align="center">{{ item.unitPrice }}</td>
              <td align="center">{{ item.totalPrice }}</td>
              <td align="center">{{ item.endTime }}</td>
            </tr>
            <!-- 补足空白行 -->
            <tr v-for="i in Math.max(0, 5 - dataList.length)" :key="'empty-' + i">
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          </tbody>
        </table>

        <div class="report-footer">
          <div class="footer-item">客户确认：____________________</div>
          <div class="footer-item">
            金额汇总：<span class="bold">{{ totalAmount }}</span>
          </div>
        </div>
      </div>
    </print-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import PrintDialog from '@/components/PrintDialog/index.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '课题组确认清单' }
})

const emit = defineEmits(['update:modelValue'])
const { proxy } = getCurrentInstance()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const showPrint = ref(false)
const queryParams = reactive({
  groupName: '刘建忠',
  startTime: '2018-06-01',
  endTime: '2018-06-20'
})

const printData = reactive({
  unit: '清华大学',
  customerName: '刘建忠'
})

const dataList = ref([])

const totalAmount = computed(() => {
  return dataList.value.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0)
})

function handlePrintPreview() {
  if (!queryParams.groupName) {
    proxy.$modal.msgWarning('请输入课题组')
    return
  }
  // 模拟数据加载
  dataList.value = [
    {
      deliveryTime: '2018/06/09',
      orderId: '20180609210936388',
      productName: 'CR纯化',
      spec: '条',
      quantity: 3,
      unitPrice: 0,
      totalPrice: 0,
      endTime: '2018/06/11'
    },
    {
      deliveryTime: '2018/06/09',
      orderId: '20180609210936388',
      productName: 'PCR单一',
      spec: '个',
      quantity: 3,
      unitPrice: 15,
      totalPrice: 45,
      endTime: '2018/06/11'
    },
    {
      deliveryTime: '2018/06/03',
      orderId: '20180603213622798',
      productName: '质粒',
      spec: '个',
      quantity: 2,
      unitPrice: 15,
      totalPrice: 30,
      endTime: '2018/06/04'
    },
    {
      deliveryTime: '2018/06/15',
      orderId: '20180615221248070',
      productName: '质粒',
      spec: '个',
      quantity: 1,
      unitPrice: 15,
      totalPrice: 0,
      endTime: '2018/06/16'
    },
    {
      deliveryTime: '2018/06/19',
      orderId: '20180619204323810',
      productName: '质粒',
      spec: '个',
      quantity: 4,
      unitPrice: 15,
      totalPrice: 0,
      endTime: '2018/06/20'
    }
  ]
  showPrint.value = true
}
</script>

<style scoped>
.confirm-report-container {
  padding: 30px;
  background: #fff;
  color: #000;
  font-family: 'SimSun', serif;
}

.report-header {
  text-align: center;
  margin-bottom: 20px;
}

.company-name {
  font-size: 22px;
  margin: 0;
}

.report-title {
  font-size: 18px;
  margin: 5px 0;
}

.report-meta {
  margin-bottom: 10px;
  font-size: 14px;
}

.meta-row {
  display: flex;
  margin-bottom: 5px;
}

.meta-item {
  flex: 1;
}

.underline {
  border-bottom: 1px solid #000;
  padding: 0 10px;
  min-width: 100px;
  display: inline-block;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
}

.report-table th,
.report-table td {
  border: 1px solid #000;
  padding: 5px;
  font-size: 12px;
  height: 25px;
}

.report-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
  font-size: 14px;
}

.bold {
  font-weight: bold;
}
</style>
