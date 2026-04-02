<template>
  <el-dialog
    title="标签打印"
    :model-value="modelValue"
    width="800px"
    append-to-body
    @update:model-value="handleUpdateVisible"
  >
    <el-form :model="form" label-width="0" class="well-form">
      <div class="form-row border-top">
        <div class="form-label" style="width: 120px">起始订单：</div>
        <div class="form-content">
          <el-input v-model="form.startOrderId" placeholder="请输入订单号" clearable style="width: 250px" />
        </div>
        <div class="form-label" style="width: 120px">结束订单：</div>
        <div class="form-content">
          <el-input v-model="form.endOrderId" placeholder="请输入订单号" clearable style="width: 250px" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-label" style="width: 120px">模板类型：</div>
        <div class="form-content" style="display: flex; align-items: center">
          <el-radio-group v-model="form.templateType">
            <el-radio :label="1">模板号不为空</el-radio>
            <el-radio :label="0">模板号为空</el-radio>
          </el-radio-group>
          <span class="form-tip" style="margin-left: 20px">(模板是否为空，可选可不选，但不能同时选择)</span>
        </div>
      </div>

      <div class="form-row border-bottom">
        <div class="form-label" style="width: 120px">所属公司：</div>
        <div class="form-content">
          <el-select v-model="form.belongCompany" placeholder="请选择" style="width: 250px">
            <el-option label="深圳有康" value="深圳有康" />
            <el-option label="杭州有康" value="杭州有康" />
          </el-select>
        </div>
        <div class="form-content" style="text-align: right">
          <el-button type="default" plain class="print-list-btn" @click="handlePrintAction">
            <el-icon><Printer /></el-icon> 标签预览
          </el-button>
        </div>
      </div>
    </el-form>

    <!-- 标签预览弹窗 -->
    <el-dialog v-model="showPreview" title="标签预览 (96孔)" width="1150px" append-to-body class="print-preview-dialog">
      <div id="print-area">
        <LabelSheet :labels="labels" :grid-mode="true" />
      </div>
      <template #footer>
        <el-button v-print="'#print-area'" type="success" :icon="Printer">打 印</el-button>
        <el-button type="danger" :icon="Close" @click="showPreview = false">关 闭</el-button>
      </template>
    </el-dialog>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="handleConfirm">确定</el-button>
        <el-button type="danger" :icon="Close" @click="handleCancel">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, getCurrentInstance } from 'vue'
import { getOrderWithSamplesRange } from '@/api/sequencing/order'
import { Check, Close, Printer } from '@element-plus/icons-vue'
import LabelSheet from './LabelSheet.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orderRange: {
    type: Object,
    default: () => ({ start: '', end: '' })
  }
})

const emit = defineEmits(['update:modelValue'])
const { proxy } = getCurrentInstance()

const showPreview = ref(false)
const labels = ref([])
const loading = ref(false)

const form = reactive({
  startOrderId: '',
  endOrderId: '',
  templateType: 1, // 1: 不为空, 0: 为空
  belongCompany: '',
  produceCompany: ''
})

watch(
  () => props.modelValue,
  val => {
    if (val) {
      reset()
      if (props.orderRange.start) {
        form.startOrderId = props.orderRange.start
        form.endOrderId = props.orderRange.end || props.orderRange.start
      }
    }
  }
)

function reset() {
  form.startOrderId = ''
  form.endOrderId = ''
  form.templateType = 1
  form.belongCompany = ''
  form.produceCompany = ''
  showPreview.value = false
  labels.value = []
}

function handleUpdateVisible(val) {
  emit('update:modelValue', val)
}

function handlePrintAction() {
  if (!form.startOrderId && !form.endOrderId) {
    proxy.$modal.msgWarning('请输入订单号范围')
    return
  }

  loading.value = true
  proxy.$modal.loading('数据加载中...')

  getOrderWithSamplesRange({
    startOrderId: form.startOrderId,
    endOrderId: form.endOrderId,
    belongCompany: form.belongCompany,
    produceCompany: form.produceCompany
  })
    .then(response => {
      proxy.$modal.closeLoading()
      loading.value = false

      if (!response.data || response.data.length === 0) {
        proxy.$modal.msgWarning('未查询到相关数据')
        return
      }

      // 提取所有样品的打印信息
      const allLabels = []
      response.data.forEach(order => {
        const samples = order.sampleList || []
        samples.forEach(sample => {
          // 过滤模板号逻辑 (模拟前端过滤，如果后端没做)
          if (form.templateType === 1 && !sample.templatePlateNo) return
          if (form.templateType === 0 && sample.templatePlateNo) return

          allLabels.push({
            id: sample.produceId || '',
            author: sample.customerName || '',
            code: sample.sampleId || '',
            size: sample.plasmidLength || sample.fragmentSize || '',
            qc: sample.testResult || '',
            // 简单的 MM/DD 格式化
            date: sample.createTime ? sample.createTime.substring(5, 10).replace('-', '/') : ''
          })
        })
      })

      if (allLabels.length === 0) {
        proxy.$modal.msgWarning('没有符合过滤条件的待打印标签')
        return
      }

      labels.value = allLabels
      showPreview.value = true
    })
    .catch(() => {
      proxy.$modal.closeLoading()
      loading.value = false
    })
}

function handleConfirm() {
  handlePrintAction()
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.well-form {
  border: 1px solid #dcdfe6;
}
.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}
.form-label {
  width: 120px;
  padding: 10px;
  background-color: #f8f9fa;
  font-weight: bold;
  border-right: 1px solid #ebeef5;
  font-size: 13px;
}
.form-content {
  flex: 1;
  padding: 10px 15px;
}
.border-top {
  border-top: 1px solid #ebeef5;
}
.border-bottom {
  border-bottom: 1px solid #ebeef5;
}

.form-tip {
  color: red;
  font-size: 12px;
}

.print-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}
</style>
