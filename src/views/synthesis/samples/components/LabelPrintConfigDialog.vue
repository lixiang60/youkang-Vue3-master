<template>
  <el-dialog v-model="visible" :title="title" width="650px" append-to-body top="10vh">
    <el-form :model="form" label-width="100px">
      <!-- 根据图1的配置界面重构为现代呼吸感表单 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="起始时间：">
            <el-date-picker
              v-model="form.startTime"
              type="date"
              placeholder="请选择起始时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间：">
            <el-date-picker
              v-model="form.endTime"
              type="date"
              placeholder="请选择结束时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属公司：">
            <el-select v-model="form.company" placeholder="请选择所属分公司" style="width: 100%">
              <el-option label="北京分公司" value="北京分公司" />
              <el-option label="广州分公司" value="广州分公司" />
              <el-option label="上海分公司" value="上海分公司" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 特殊强化：中间的核心大按钮 (匹配图1中的“标签打印”设计) -->
      <div class="print-action-box">
        <el-button type="primary" size="large" icon="Printer" class="print-large-btn" @click="handleOpenPrintPreview">
          生成排版标签
        </el-button>
        <div class="print-tips">配置好时间和公司后，点击此按钮可预览并打印标签池 (如图2)</div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" icon="Check" @click="visible = false">确定</el-button>
        <el-button type="danger" icon="Close" @click="visible = false">取消</el-button>
      </div>
    </template>

    <!-- 内层：实际标签排版打印预览弹窗 -->
    <print-dialog v-model="showPrintDialog" title="合成标签打印预览" print-id="synthesisLabelPrintGrid">
      <div id="synthesisLabelPrintGrid" class="print-container">
        <div class="labels-grid">
          <div v-for="(item, index) in printData" :key="index" class="label-item">
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
    </print-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import PrintDialog from '@/components/PrintDialog/index.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '合成测序引物标签打印配置' }
})

const emit = defineEmits(['update:modelValue'])
const { proxy } = getCurrentInstance()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const form = ref({
  startTime: '2018-06-01',
  endTime: '',
  company: ''
})

const showPrintDialog = ref(false)
const printData = ref([])

function handleOpenPrintPreview() {
  if (!form.value.startTime || !form.value.endTime || !form.value.company) {
    proxy.$modal.msgWarning('请将起始时间、结束时间及所属公司填写完整~')
    return
  }

  // 模拟从接口获取的需打印数据
  proxy.$modal.msg('正在拉取标签数据，排版较密请稍候...')
  setTimeout(() => {
    printData.value = generateMockLabels()
    showPrintDialog.value = true
  }, 600)
}

function generateMockLabels() {
  const names = ['肖霆', '毛远坤', '陈斯红', '姚佳', '张家琪', '王文静', '杜平州', '于家家', '吴娇']
  const primers = [
    'XX0601',
    'V2-2-W1CR',
    '2BCB-4-26-W2F',
    'A-MHC-D9-W1R',
    'HEMOLYSIN-1-W4F',
    '306-LAT52-FH5-CFP-W1F',
    'seq-eGFP-F',
    'PHR-seq-YXY-Fw'
  ]

  return Array.from({ length: 25 }, (_, i) => ({
    primerName: primers[i % primers.length],
    date: '2018/06/01',
    produceId: `11022${71 + i}`,
    customerName: names[i % names.length],
    spec: '3.2P'
  }))
}
</script>

<style scoped>
.print-action-box {
  margin: 30px 20px 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #c0c4cc;
}

.print-large-btn {
  width: 220px;
  font-size: 16px;
  font-weight: bold;
}

.print-tips {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}

/* 打印相关核心布局 - 图2完全复刻 */
@media print {
  @page {
    margin: 5mm;
  }
}

.print-container {
  font-family: 'SimSun', serif;
  width: 100%;
}

.labels-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 25px 15px;
  justify-items: center;
}

.label-item {
  width: 100%;
  max-width: 170px;
  text-align: center;
  font-size: 13px;
  line-height: 1.4;
  border: 1px dashed #999; /* 增加线框进行视觉区分 */
  border-radius: 4px; /* 微倒角过渡 */
  padding: 4px;
  box-sizing: border-box;
}

.row-1 {
  font-weight: bold;
  height: 18px;
  overflow: hidden;
  margin-bottom: 2px;
}

.row-2,
.row-3 {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}
</style>
