<template>
  <div class="delivery-note-container">
    <!-- 页眉 -->
    <div class="note-header">
      <h1 class="company-name">有康生物技术有限公司</h1>
      <div class="company-sub">
        <span class="url">www.youkangbio.com</span>
        <span class="note-title">测序送货单</span>
      </div>
    </div>

    <!-- 基础信息 -->
    <div class="note-info-grid">
      <div class="info-item">
        <span class="label">客户姓名：</span>
        <span class="value border-bottom">{{ data.customerName }}</span>
      </div>
      <div class="info-item">
        <span class="label">订单号：</span>
        <span class="value">{{ data.orderId }}</span>
      </div>
      <div class="info-item">
        <span class="label">客户单位：</span>
        <span class="value border-bottom">{{ data.groupName }}</span>
      </div>
      <div class="info-item">
        <span class="label">送样日期：</span>
        <span class="value">{{ data.deliveryTime }}</span>
      </div>
      <div class="info-item">
        <span class="label">送货地址：</span>
        <span class="value border-bottom">{{ data.customerAddress }}</span>
      </div>
      <div class="info-item">
        <span class="label">地区：</span>
        <span class="value">{{ data.region || '北京市' }}</span>
      </div>
    </div>

    <!-- 表格主体 -->
    <table class="note-table">
      <thead>
        <tr>
          <th width="35%">样品类型</th>
          <th width="15%">计价单位</th>
          <th width="15%">数量</th>
          <th width="15%">单价</th>
          <th width="20%">金额</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in list" :key="index">
          <td>{{ item.project || item.sampleType || '测序' }}</td>
          <td align="center">{{ item.quantityType || '条' }}</td>
          <td align="center">{{ item.quantity }}</td>
          <td align="center">{{ item.unitPrice }}</td>
          <td align="center">{{ item.totalPrice }}</td>
        </tr>
        <!-- 补足空白行 -->
        <tr v-for="i in Math.max(0, 5 - list.length)" :key="'empty-' + i">
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      </tbody>
    </table>

    <!-- 页脚 -->
    <div class="note-footer">
      <div class="footer-row">
        <div class="footer-item flex-2">
          <span class="label">订单备注：</span>
          <span class="value">{{ data.remark || '无' }}</span>
        </div>
        <div class="footer-item">
          <span class="label">开单人：</span>
          <span class="value">{{ data.createBy || 'ADMIN' }}</span>
        </div>
        <div class="footer-item">
          <span class="label">合计金额：</span>
          <span class="value bold">{{ totalAmount }}</span>
        </div>
      </div>
      <div class="footer-row">
        <div class="footer-item flex-2">
          <span class="label">联系方式：</span>
          <span class="value">4000211456</span>
        </div>
        <div class="footer-item">
          <span class="label">送货人：</span>
          <span class="value"></span>
        </div>
        <div class="footer-item">
          <span class="label">客户签收：</span>
          <span class="value"></span>
        </div>
      </div>
      <div class="footer-row" style="margin-top: 5px">
        <div class="footer-item" style="width: 100%; text-align: left">
          <span class="label">销售员：</span>
          <span class="value">{{ data.salesman || '陈真真-南' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  list: {
    type: Array,
    default: () => []
  }
})

const totalAmount = computed(() => {
  return props.list.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0)
})
</script>

<style scoped>
.delivery-note-container {
  padding: 40px;
  background: #fff;
  color: #000;
  font-family: 'SimSun', 'Microsoft YaHei', serif;
  line-height: 1.6;
}

.note-header {
  text-align: center;
  margin-bottom: 20px;
}

.company-name {
  font-size: 28px;
  margin: 0;
  letter-spacing: 2px;
}

.company-sub {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 20px;
  margin-top: 5px;
}

.url {
  font-size: 14px;
}

.note-title {
  font-size: 18px;
  font-weight: bold;
}

.note-info-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 10px 40px;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-item {
  display: flex;
  align-items: baseline;
}

.info-item .label {
  white-space: nowrap;
}

.info-item .value {
  flex: 1;
  padding-bottom: 2px;
}

.info-item .border-bottom {
  border-bottom: 1px solid #000;
}

.note-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  border: 1px solid #000;
}

.note-table th,
.note-table td {
  border: 1px solid #000;
  padding: 8px;
  font-size: 14px;
  height: 30px;
}

.note-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.note-footer {
  margin-top: 20px;
  border-top: 1px solid #000;
  padding-top: 10px;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.footer-item {
  display: flex;
  align-items: baseline;
}

.flex-2 {
  flex: 1.5;
}

.bold {
  font-weight: bold;
}

@media print {
  .delivery-note-container {
    padding: 0;
    margin: 0;
  }
}
</style>
