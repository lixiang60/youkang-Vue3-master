<template>
  <div id="synthesisDeliveryNote" class="synthesis-delivery-note">
    <div class="header">
      <div class="company-name">睿博兴科生物技术有限公司</div>
      <div class="subtitle">www.ruibiotech.com 合成送货单</div>
    </div>

    <div class="metadata">
      <div class="meta-row">
        <div class="meta-item">客户姓名：{{ data.customerName }}</div>
        <div class="meta-item">订单号：{{ data.orderId }}</div>
      </div>
      <div class="meta-row">
        <div class="meta-item">送货地址：{{ data.customerAddress }}</div>
        <div class="meta-item">总条数：{{ data.totalCount }}</div>
        <div class="meta-item">送样日期：{{ data.orderDate }}</div>
      </div>
      <div class="meta-row">
        <div class="meta-item">订单备注：{{ data.remark }}</div>
        <div class="meta-item">序列范围：{{ data.sequenceRange }}</div>
        <div class="meta-item">发货日期：{{ data.deliveryDate }}</div>
      </div>
    </div>

    <table class="delivery-table">
      <thead>
        <tr>
          <th>样品类型</th>
          <th>计价单位</th>
          <th>数量</th>
          <th>单价</th>
          <th>金额</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in list" :key="index">
          <td>{{ item.sampleType || '16-59bp-PAGE_10D' }}</td>
          <td>{{ item.priceUnit || 'BP' }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.unitPrice }}</td>
          <td>{{ item.totalPrice }}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <div class="barcode-container">
        <div class="barcode-bars">
          <div
            v-for="i in 60"
            :key="i"
            class="bar"
            :style="{ width: i % 3 === 0 ? '2px' : '1px', marginLeft: i % 5 === 0 ? '2px' : '1px' }"
          ></div>
        </div>
        <div class="barcode-text">{{ data.orderId }}</div>
      </div>
      <div class="notice">
        客户须知：由于DNA合成的化学特性，产品可能出现替换缺失等情况，公司承诺免费重合，但不承担连带责任。
      </div>
      <div class="footer-info">
        <div class="info-item">销售员：{{ data.salesman || '刘克' }}</div>
        <div class="info-item">开单人：{{ data.creator || 'ADMIN' }}</div>
        <div class="info-item">合计金额：{{ data.totalAmount }}</div>
        <div class="info-item">客户签收：</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  list: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.synthesis-delivery-note {
  font-family: 'SimSun', serif;
  color: #000;
  padding: 10px;
  background: #fff;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 10px;
  border-bottom: 2px solid #000;
  padding-bottom: 5px;
}

.company-name {
  font-size: 20px;
  font-weight: bold;
}

.subtitle {
  font-size: 14px;
}

.metadata {
  font-size: 12px;
  margin-bottom: 10px;
}

.meta-row {
  display: flex;
  margin-bottom: 2px;
}

.meta-item {
  flex: 1;
}

.delivery-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 12px;
  margin-bottom: 10px;
}

.delivery-table th,
.delivery-table td {
  border: 1px solid #000;
  padding: 4px;
  text-align: center;
}

.delivery-table th {
  font-weight: bold;
}

.footer {
  font-size: 12px;
  border-top: 1px dotted #000;
  padding-top: 5px;
}

.barcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 5px;
}

.barcode-bars {
  display: flex;
  height: 30px;
  align-items: flex-end;
}

.bar {
  background-color: #000;
  height: 100%;
}

.barcode-text {
  font-size: 10px;
  margin-top: 2px;
}

.notice {
  font-size: 10px;
  margin-bottom: 5px;
  font-weight: bold;
}

.footer-info {
  display: flex;
  justify-content: space-between;
}

@media print {
  .synthesis-delivery-note {
    padding: 0;
  }
}
</style>
