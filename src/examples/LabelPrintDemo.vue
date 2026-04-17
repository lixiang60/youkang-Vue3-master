<template>
  <div class="label-print-demo" style="padding: 20px">
    <h2>高密度标签打印 Demo (Figure 2 Style)</h2>
    <p>这个Demo演示了如何利用 CSS Grid 与宋体排版，生成类似合成测序引物那样的高密度标签纸阵列。</p>

    <div style="margin-bottom: 20px">
      <el-button v-print="'#print-labels'" type="primary">🖨️ 一键唤起浏览器打印</el-button>
    </div>

    <div
      style="
        border: 1px solid #ccc;
        padding: 20px;
        background: #fff;
        width: 1000px;
        margin: 0 auto;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      "
    >
      <div id="print-labels" class="print-container">
        <!-- 使用 CSS Grid 实现等宽 5 列阵列 -->
        <div class="labels-grid">
          <div v-for="(item, index) in mockData" :key="index" class="label-item">
            <div class="row-1">{{ item.primerName }}</div>
            <div class="row-2">
              <span>{{ item.date }}</span>
              <span>{{ item.produceId }}</span>
            </div>
            <div class="row-3">
              <span>{{ item.customerName }}</span>
              <span>{{ item.spec }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mockData = ref(
  Array.from({ length: 30 }, (_, i) => ({
    primerName: i % 2 === 0 ? `GENE-F${i + 1}-LONG-NAME` : `V2-2-W1CR`,
    date: '2018/06/01',
    produceId: `11022${70 + i}`,
    customerName: ['肖霆', '杜平州', '张家琪', '吴娇'][i % 4],
    spec: '3.2P'
  }))
)
</script>

<style scoped>
/* 打印强制约束 */
@media print {
  @page {
    /* 缩小边距以利用更多纸面空间 */
    margin: 5mm;
  }
  .print-container {
    padding: 0 !important;
  }
}

.print-container {
  /* 严格遵循打印规约，强制衬线字体（宋体等效） */
  font-family: 'SimSun', serif;
  width: 100%;
}

.labels-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 严格 5 列均分布局 */
  gap: 20px 10px; /* 行列间距调整，适配热敏打印纸 */
  justify-items: center;
}

.label-item {
  width: 100%;
  max-width: 180px;
  text-align: center;
  font-size: 13px;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  border: 1px dashed #999; /* 增加线框，方便区分每个独立标签 */
  border-radius: 4px; /* 轻微的倒角，使其更现代和柔和 */
  padding: 4px;
  box-sizing: border-box;
}

.row-1 {
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.row-2,
.row-3 {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
}
</style>
