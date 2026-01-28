<template>
  <div class="label-sheet">
     <div v-for="(label, index) in labels" :key="index" class="label-item">
        <div class="label-top">
           <span class="label-id">{{ label.id }}</span>
           <span class="label-author">{{ label.author }}</span>
        </div>
        <div class="label-barcode">
           <svg :id="'barcode-' + index"></svg>
        </div>
        <div class="label-code">
           {{ label.code }}
        </div>
        <div class="label-info">
           <span>{{ label.size }}</span>
           <span :class="{'text-green': label.qc === 'A+', 'text-blue': label.qc === 'sp'}">{{ label.qc }}</span>
           <span>{{ label.date }}</span>
           <span class="label-status">质检</span>
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
       try {
         JsBarcode('#barcode-' + index, label.code, {
           format: "CODE128",
           displayValue: false,
           height: 25,
           margin: 0,
           width: 1.5
         })
       } catch (e) {
         console.warn('Barcode gen failed', e)
       }
    })
  })
}

onMounted(() => {
  generateBarcodes()
})

watch(() => props.labels, () => {
    generateBarcodes()
}, { deep: true })
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
  width: 33%; /* 3 columns approx */
  padding: 5px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  font-size: 12px;
  margin-bottom: 10px;
  page-break-inside: avoid;
}

.label-top {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.label-barcode {
  text-align: left; /* Screenshot shows barcode aligned left/center? actually fills width */
  height: 30px;
  overflow: hidden;
  margin: 2px 0;
}

.label-code {
  background-color: yellow;
  font-weight: bold;
  padding: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.label-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-top: 2px;
}

.text-green { color: green; font-weight: bold; }
.text-blue { color: blue; font-weight: bold; }
.label-status { font-weight: bold; }

@media print {
  .label-sheet {
    padding: 0;
  }
  .label-item {
    border: none; /* remove borders if present */
  }
}
</style>
