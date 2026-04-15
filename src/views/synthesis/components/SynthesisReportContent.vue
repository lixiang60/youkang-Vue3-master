<template>
  <div id="synthesisReport" class="synthesis-report-container">
    <div class="header">
      <div class="company-name">有康生物技术有限公司</div>
      <div class="report-title">合成引物（OD）报告单</div>
    </div>

    <div class="info-line">
      <div class="info-item">订单号：{{ data.orderId }}</div>
      <div class="info-item" style="margin-left: auto">订单日期：{{ data.orderDate }}</div>
    </div>
    <div class="info-line">
      <div class="info-item">客户姓名：{{ data.customerName }}</div>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th>生产编号</th>
          <th>引物名称</th>
          <th>Sequence ( 5' -> 3' )</th>
          <th>碱基数</th>
          <th>OD总量</th>
          <th>OD/tube</th>
          <th>MW</th>
          <th>Tm</th>
          <th>GC</th>
          <th>nmol/tube</th>
          <th>加水量ul</th>
          <th>纯化方式</th>
          <th>修饰类型</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in list" :key="index">
          <td>{{ item.productionId }}</td>
          <td>{{ item.primerName }}</td>
          <td class="sequence">{{ item.sequence }}</td>
          <td>{{ item.baseCount }}</td>
          <td>{{ item.totalOd }}</td>
          <td>{{ item.odPerTube }}</td>
          <td>{{ item.mw }}</td>
          <td>{{ item.tm }}</td>
          <td>{{ item.gc }}</td>
          <td>{{ item.nmolPerTube }}</td>
          <td>{{ item.waterVolume }}</td>
          <td>{{ item.purification }}</td>
          <td>{{ item.modification }}</td>
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
.synthesis-report-container {
  font-family: 'SimSun', serif;
  color: #000;
  padding: 20px;
  background: #fff;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.company-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.report-title {
  font-size: 18px;
  text-decoration: underline;
}

.info-line {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-item {
  margin-right: 40px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 12px;
}

.report-table th,
.report-table td {
  border: 1px solid #000;
  padding: 4px;
  text-align: center;
}

.report-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.sequence {
  text-align: left;
  word-break: break-all;
  min-width: 200px;
}

@media print {
  @page {
    size: auto;
    margin: 10mm;
  }
  .synthesis-report-container {
    padding: 0;
  }
}
</style>
