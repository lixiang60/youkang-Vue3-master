<template>
  <el-dialog v-model="visible" width="1100px" append-to-body top="5vh" class="print-preview-dialog">
    <template #header>
      <div style="display: flex; align-items: center; padding: 10px 0">
        <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
          <Printer />
        </el-icon>
        <span style="font-weight: bold; font-size: 16px">内部操作表预览</span>
      </div>
    </template>
    <div id="printInternalOperation" class="report-container">
      <!-- 报表头部 -->
      <div class="report-header">
        <div class="header-left">
          <svg id="order-barcode"></svg>
          <div class="order-id-text">{{ orderData.orderInfo?.orderId }}</div>
        </div>
        <div class="header-center">
          <div class="company-name">睿博兴科生物技术有限公司</div>
          <div class="company-site">www.ruibiotech.com</div>
          <div class="report-title">测序明细表</div>
        </div>
        <div class="header-right">
          <!-- 占位，保持平衡 -->
        </div>
      </div>

      <!-- 订单基本信息 -->
      <div class="order-info-grid">
        <div class="info-row">
          <div class="info-item"><span>订单号：</span>{{ orderData.orderInfo?.orderId }}</div>
          <div class="info-item">
            <span>送样日期：</span>{{ parseTime(orderData.orderInfo?.createTime, '{y}/{m}/{d}') }}
          </div>
          <div class="info-item"><span>录单人：</span>{{ orderData.orderInfo?.createBy }}</div>
        </div>
        <div class="info-row">
          <div class="info-item"><span>客户姓名：</span>{{ orderData.orderInfo?.customerName }}</div>
          <div class="info-item"><span>客户单位：</span>{{ orderData.orderInfo?.customerAddress }}</div>
          <div class="info-item"><span>Email：</span>{{ orderData.orderInfo?.customerEmail || '' }}</div>
        </div>
        <div class="info-row">
          <div class="info-item"><span>订单备注：</span>{{ orderData.orderInfo?.remark }}</div>
          <div class="info-item"><span>基因关联号：</span>{{ orderData.orderInfo?.genNo || '0' }}</div>
        </div>
      </div>

      <!-- 样品明细列表 -->
      <table class="detail-table">
        <thead>
          <tr>
            <th width="80">生产编号</th>
            <th width="100">样品编号</th>
            <th width="120">测序引物</th>
            <th>载体名称</th>
            <th width="60">引物浓度</th>
            <th width="80">样品类型</th>
            <th width="60">抗生素</th>
            <th width="60">片段大小</th>
            <th width="40">测通</th>
            <th>样品备注</th>
            <th width="80">样品对应号</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sample, index) in orderData.sampleList" :key="index">
            <td>{{ sample.produceId }}</td>
            <td>{{ sample.sampleId }}</td>
            <td>{{ sample.primer }}</td>
            <td>{{ sample.carrierName }}</td>
            <td>{{ sample.primerConcentration }}</td>
            <td>{{ sample.sampleType }}</td>
            <td>{{ sample.antibioticType }}</td>
            <td>{{ sample.fragmentSize }}</td>
            <td>{{ sample.testResult === '是' ? '是' : '否' }}</td>
            <td>{{ sample.remark }}</td>
            <td>{{ sample.sampleCorrespondId }}</td>
          </tr>
          <tr v-if="!orderData.sampleList?.length">
            <td colspan="11" class="text-center">暂无样品数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button v-print="'#printInternalOperation'" type="success" :icon="Printer">打 印</el-button>
        <el-button type="danger" :icon="Close" @click="visible = false">关 闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, getCurrentInstance, nextTick } from 'vue'
import { getOrderWithSamples } from '@/api/sequencing/order'
import { Printer, Close } from '@element-plus/icons-vue'
import JsBarcode from 'jsbarcode'

const props = defineProps({
  modelValue: Boolean,
  orderId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
const { proxy } = getCurrentInstance()

const visible = ref(false)
const orderData = ref({
  orderInfo: {},
  sampleList: []
})

watch(
  () => props.modelValue,
  val => {
    visible.value = val
    if (val && props.orderId) {
      loadData()
    }
  }
)

watch(visible, val => {
  emit('update:modelValue', val)
})

function loadData() {
  proxy.$modal.loading('正在加载报表数据...')
  getOrderWithSamples(props.orderId)
    .then(res => {
      orderData.value = res.data || { orderInfo: {}, sampleList: [] }
      proxy.$modal.closeLoading()

      // 生成条形码
      nextTick(() => {
        if (orderData.value.orderInfo?.orderId) {
          JsBarcode('#order-barcode', orderData.value.orderInfo.orderId, {
            format: 'CODE128',
            displayValue: false,
            height: 40,
            margin: 0,
            width: 1.2
          })
        }
      })
    })
    .catch(() => {
      proxy.$modal.closeLoading()
    })
}
</script>

<style scoped>
.report-container {
  padding: 20px;
  background-color: #fff;
  color: #000;
  font-family: 'SimSun', serif;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left,
.header-right {
  flex: 1; /* Both sides take equal space to push center to the middle */
  min-width: 0;
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.order-id-text {
  font-size: 13px;
  margin-top: 2px;
}

.header-center {
  flex: 2; /* Center block takes more space and stays in middle */
  text-align: center;
}

.company-name {
  font-size: 24px;
  font-weight: bold;
}

.company-site {
  font-size: 14px;
  margin: 5px 0;
}

.report-title {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 5px;
  margin-top: 10px;
}

.order-info-grid {
  border: 1px solid #000;
  border-bottom: none;
  font-size: 13px;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #000;
}

.info-item {
  flex: 1;
  padding: 5px 10px;
  border-right: 1px solid #000;
}

.info-item:last-child {
  border-right: none;
}

.info-item span {
  font-weight: bold;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  table-layout: fixed;
}

.detail-table th,
.detail-table td {
  border: 1px solid #000;
  padding: 4px 2px;
  font-size: 12px;
  text-align: center;
  word-break: break-all;
}

.detail-table th {
  background-color: #e0e0e0;
}

@media print {
  .print-preview-dialog :deep(.el-dialog__header),
  .print-preview-dialog :deep(.el-dialog__footer) {
    display: none !important;
  }
}
</style>
