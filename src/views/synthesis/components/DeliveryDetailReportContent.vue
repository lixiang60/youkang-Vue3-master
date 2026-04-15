<template>
  <div id="deliveryDetailReport" class="delivery-detail-report">
    <div class="header">
      <div class="company-name">睿博兴科生物技术有限公司</div>
      <div class="header-info">
        <span>打印时间：{{ data.printTime }}</span>
        <span style="margin-left: 20px">第1页 共1页</span>
      </div>
    </div>

    <table class="detail-table">
      <thead>
        <tr>
          <th width="15%">客户姓名</th>
          <th width="45%">客户地址</th>
          <th width="10%">销售员</th>
          <th width="20%">订单号</th>
          <th width="10%">签名</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in list" :key="index">
          <td>{{ item.customerName }}</td>
          <td class="address">{{ item.address }}</td>
          <td>{{ item.salesman }}</td>
          <td>{{ item.orderId }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
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
.delivery-detail-report {
  font-family: 'SimSun', serif;
  color: #000;
  padding: 20px;
  background: #fff;
}

.header {
  text-align: center;
  margin-bottom: 10px;
  position: relative;
  border-bottom: 2px solid #000;
  padding-bottom: 5px;
}

.company-name {
  font-size: 22px;
  font-weight: bold;
}

.header-info {
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  margin-top: 5px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 13px;
}

.detail-table th,
.detail-table td {
  border: 1px solid #000;
  padding: 6px 4px;
  text-align: center;
}

.detail-table th {
  font-weight: bold;
  background-color: #f2f2f2;
}

.address {
  text-align: left;
}

@media print {
  @page {
    size: A4 landscape;
    margin: 10mm;
  }
  .delivery-detail-report {
    padding: 0;
  }
}
</style>
