<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    width="700px"
    append-to-body
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="板号" prop="plateNo">
            <div style="display: flex; gap: 10px; width: 100%">
              <el-input v-model="form.plateNo" placeholder="请输入或选择板号" clearable style="width: 100%" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="报表类型" prop="reportType">
            <el-radio-group v-model="form.reportType">
              <el-radio label="label">标签式</el-radio>
              <el-radio label="list">清单式(开发中)</el-radio>
              <el-radio label="circle">圆标签式</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="稀释类型" prop="dilutionType">
            <el-radio-group v-model="form.dilutionType">
              <el-radio label="normal">普通版</el-radio>
              <el-radio label="diluted">稀释版</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="活动类型" prop="activityType">
            <el-radio-group v-model="form.activityType">
              <el-radio label="regular">常规版</el-radio>
              <el-radio label="bonus">赠送1管1OD版</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">标签打印预览</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>

    <!-- 打印数据预览弹窗 -->
    <el-dialog v-model="showPrintDialog" :title="printPreviewTitle" width="1100px" append-to-body>
      <div id="arrangePrintGrid" class="print-container">
        <!-- 标签式 (图2样式：6列宽标签) -->
        <div v-if="form.reportType === 'label'" class="labels-grid type-label">
          <div v-for="(item, index) in mockData" :key="index" class="label-item-square">
            <div class="row-flex">
              <span>{{ item.produceId }}</span>
              <span>{{ item.tubeInfo }}</span>
            </div>
            <div class="row-flex">
              <span class="primer-name">{{ item.primerName }}</span>
            </div>
            <div class="row-flex">
              <span>订: {{ item.orderNo }}</span>
              <span>{{ item.nmol }}</span>
            </div>
            <div class="row-flex">
              <span>加水量: {{ item.waterVolume }}</span>
              <span>TM: {{ item.tm }}</span>
            </div>
          </div>
        </div>

        <!-- 圆标签式 (图3样式：8列紧密阵列) -->
        <div v-if="form.reportType === 'circle'" class="labels-grid type-circle">
          <div v-for="(item, index) in mockData" :key="'circle-' + index" class="label-item-circle">
            <div class="well-no">{{ item.wellNo }}</div>
            <div class="primer-name-circle">{{ item.primerNameLine1 }}</div>
            <div class="primer-name-circle">{{ item.primerNameLine2 }}</div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-print="'#arrangePrintGrid'" type="success" icon="Printer">标签打印</el-button>
          <el-button @click="showPrintDialog = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive, getCurrentInstance, watch } from 'vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '合成标签打印' },
  selectedItems: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const showPrintDialog = ref(false)
const formRef = ref(null)
const form = reactive({
  plateNo: '',
  reportType: 'label',
  dilutionType: 'normal',
  activityType: 'regular'
})

// 打印数据占位
const mockData = ref([])

const printPreviewTitle = computed(() => {
  return form.reportType === 'circle' ? '圆标签式打印预览' : '标签式打印预览'
})

watch(
  () => props.modelValue,
  val => {
    if (val) {
      resetForm()
    }
  }
)

function resetForm() {
  form.plateNo = ''
  form.reportType = 'label'
  form.dilutionType = 'normal'
  form.activityType = 'regular'
  mockData.value = []
}

function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}

function handleConfirm() {
  if (form.reportType === 'list') {
    proxy.$modal.msgWarning('清单式报表正在开发中')
    return
  }

  proxy.$modal.msg('正在拉取标签数据，正在排版...')

  setTimeout(() => {
    mockData.value = generateMockLabels()
    showPrintDialog.value = true
  }, 400)
}

function generateMockLabels() {
  const names = ['1-α-E上引', '2-α-H下引', 'Nlrp3-WT-F-PCR', 'Nlrp3-Common-PCR', 'IGF2BP2-Y-F', 'IGF2BP2-R']
  const ids = ['RB944692', 'RB944693', 'RB944711', 'RB944712', 'RB944713', 'RB944714']
  const wells = ['B01', 'C01', 'D01', 'E01', 'G01', 'H01']

  return Array.from({ length: 30 }, (_, i) => {
    const pName = names[i % names.length]
    // 为了模拟图3的断行显示
    const nameParts = pName.split('-')

    return {
      produceId: ids[i % ids.length],
      tubeInfo: i % 2 === 0 ? '1OD(2)' : '1OD(4)',
      primerName: pName,
      primerNameLine1: nameParts.slice(0, 2).join('-'),
      primerNameLine2: nameParts.slice(2).join('-') || pName,
      orderNo: '20180228092210992',
      nmol: (3.0 + (i % 3)).toFixed(2) + 'nmol',
      waterVolume: (30.0 + (i % 5)).toFixed(1) + 'ul',
      tm: (60.0 + (i % 5)).toFixed(2) + '℃',
      wellNo: wells[i % wells.length]
    }
  })
}
</script>

<style scoped>
/* 打印相关核心布局 */
@media print {
  @page {
    margin: 5mm;
  }
}

.print-container {
  font-family: 'SimSun', serif;
  width: 100%;
  box-sizing: border-box;
}

.labels-grid {
  display: grid;
  justify-items: center;
  width: 100%;
}

/* 标签式 (图2: 六列) */
.type-label {
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

/* 圆标签式 (图3: 八列) */
.type-circle {
  grid-template-columns: repeat(8, 1fr);
  gap: 15px 10px;
}

.label-item-square {
  width: 100%;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  font-size: 11px;
  line-height: 1.4;
  border: 1px dashed #999;
  border-radius: 4px;
  padding: 6px 8px;
  box-sizing: border-box;
  overflow: hidden;
}

.label-item-square span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.label-item-circle {
  width: 100%;
  text-align: center;
  font-size: 14px;
  line-height: 1.2;
  border: 1px dashed #999;
  border-radius: 50%; /* 模拟圆形外观 */
  padding: 10px;
  aspect-ratio: 1; /* 保持正方形/圆形 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.row-flex {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  gap: 4px;
}
.row-flex span:first-child {
  flex-shrink: 1;
}
.row-flex span:last-child {
  flex-shrink: 0;
}

.primer-name {
  font-weight: bold;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.well-no {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 4px;
}

.primer-name-circle {
  font-size: 12px;
  word-break: break-all;
}
</style>
