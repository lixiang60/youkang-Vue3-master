<template>
  <div class="label-sheet">
    <div v-for="(label, index) in labels" :key="index" class="label-item">
      <div v-if="label.id" class="label-content">
        <!-- Left: Vertical Barcode -->
        <div class="label-barcode-side">
          <svg :id="'barcode-' + index" class="vertical-barcode"></svg>
        </div>

        <!-- Right: Data Content -->
        <div class="label-data-side">
          <div class="data-row row-top">
            <span class="label-id">{{ label.id }}</span>
            <span class="label-author">{{ label.author }}</span>
          </div>
          <div class="data-row row-mid">
            <div class="label-code-tag">
              {{ label.code }}
            </div>
          </div>
          <div class="data-row row-bottom">
            <div class="bottom-left">
              <span>{{ label.size }}</span>
              <span :class="['qc-tag', { 'text-green': label.qc === 'A+', 'text-blue': label.qc === 'sp' }]">{{
                label.qc
              }}</span>
              <span>{{ label.date }}</span>
            </div>
            <span class="label-status">质检</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, nextTick, watch } from 'vue'
import JsBarcode from 'jsbarcode'

const props = defineProps({
  labels: {
    type: Array,
    default: () => []
  }
})

function generateBarcodes() {
  nextTick(() => {
    props.labels.forEach((label, index) => {
      if (label.code) {
        try {
          JsBarcode('#barcode-' + index, label.code, {
            format: 'CODE128',
            displayValue: false,
            height: 40, // Height is actually width in vertical mode
            margin: 0,
            width: 1.0
          })
        } catch (e) {
          console.warn('Barcode gen failed', e)
        }
      }
    })
  })
}

onMounted(() => {
  generateBarcodes()
})

watch(
  () => props.labels,
  () => {
    generateBarcodes()
  },
  { deep: true }
)
</script>

<style scoped>
.label-sheet {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  background: white;
  padding: 10px;
}

.label-item {
  width: 20%; /* 5 labels per row */
  padding: 4px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  page-break-inside: avoid;
  background: #fff;
}

.label-content {
  display: flex;
  height: 55px; /* Adjust height based on content */
  align-items: center;
  overflow: hidden;
}

.label-barcode-side {
  width: 25px; /* Width for rotated barcode */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.vertical-barcode {
  transform: rotate(-90deg);
  transform-origin: center;
}

.label-data-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 4px;
  height: 100%;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.row-top {
  font-weight: bold;
  font-size: 13px;
  line-height: normal;
}

.row-mid {
  margin: 2px 0;
}

.label-code-tag {
  width: 100%;
  background-color: #ffff00;
  font-weight: bold;
  padding: 1px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
  color: #000;
  text-align: left;
}

.row-bottom {
  font-size: 10px;
  font-weight: bold;
}

.bottom-left {
  display: flex;
  gap: 5px;
}

.qc-tag {
  font-weight: bold;
}

.text-green {
  color: #008000;
}
.text-blue {
  color: #0000ff;
}
.label-status {
  font-weight: bold;
}

@media print {
  .label-sheet {
    padding: 0;
  }
  .label-item {
    padding: 2px;
  }
}
</style>
