<template>
  <el-dialog
    title="标签打印"
    :model-value="modelValue"
    width="800px"
    @update:model-value="handleUpdateVisible"
    append-to-body
  >
    <el-form ref="formRef" :model="form" label-width="100px" class="label-print-form">
      <el-row>
        <el-col :span="12">
          <el-form-item label="起始订单：">
            <el-input v-model="form.startOrder" placeholder="" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束订单：">
            <el-input v-model="form.endOrder" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="模板类型：">
        <el-radio-group v-model="form.templateType">
          <el-radio :label="1">模板号不为空</el-radio>
          <el-radio :label="0">模板号为空</el-radio>
        </el-radio-group>
        <span class="form-tip">(模板是否为空，可选可不选，但不能同时选择)</span>
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="所属公司：">
            <el-select v-model="form.company" placeholder="请选择" style="width: 100%">
               <!-- Hardcoded options for now or empty -->
               <el-option label="深圳有康" value="深圳有康" />
               <el-option label="杭州有康" value="杭州有康" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单类型：">
            <el-radio-group v-model="form.orderType">
              <el-radio :label="1">公司录入和会员录入</el-radio>
              <el-radio :label="2">基因录入</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="print-action-area">
        <el-button type="default" class="print-btn" @click="handlePrintAction">
          <el-icon><Printer /></el-icon> 标签打印
        </el-button>
      </div>

    </el-form>

    <el-dialog
       v-model="showPreview"
       title="标签预览"
       width="900px"
       append-to-body
       class="print-preview-dialog"
    >
       <div id="print-area">
          <LabelSheet :labels="mockLabels" />
       </div>
       <template #footer>
          <el-button type="primary" v-print="'#print-area'">打 印</el-button>
          <el-button @click="showPreview = false">关 闭</el-button>
       </template>
    </el-dialog>

    <template #footer>
      <div class="dialog-footer" style="text-align: center;">
        <el-button type="success" @click="handleConfirm">确 定</el-button>
        <el-button type="danger" @click="handleCancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { printOrderLabel } from '@/api/sequencing/order'
import { ElMessage } from 'element-plus'

import LabelSheet from './LabelSheet.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const showPreview = ref(false)
const mockLabels = ref([])

const formRef = ref(null)
const form = reactive({
  startOrder: '',
  endOrder: '',
  templateType: null, // user might clear it? RadioGroup usually enforces one selection if clicked.
  company: '',
  orderType: 1
})

watch(() => props.modelValue, (val) => {
  if (val) {
    reset()
  }
})

function reset() {
  form.startOrder = ''
  form.endOrder = ''
  form.templateType = null
  form.company = ''
  form.orderType = 1
  showPreview.value = false
  mockLabels.value = []
}

function handleUpdateVisible(val) {
  emit('update:modelValue', val)
}

function handlePrintAction() {
  // Logic to print
  if (!form.startOrder && !form.endOrder) {
    // For mock purpose, allow empty to just show something? 
    // Or just generate defaults.
    // ElMessage.warning('请输入订单号范围')
    // return 
  }
  
  // MOCK DATA GENERATION
  const mocks = []
  const count = 30 // Generate 30 labels
  for(let i=0; i<count; i++) {
     mocks.push({
       id: '5875' + (541 + i),
       author: i % 2 === 0 ? '王强' : '李四',
       code: 'PLVX-LIMD1-' + (i < 10 ? '0'+i : i),
       size: (1000 + i*100),
       qc: i % 3 === 0 ? 'A+' : (i % 3 === 1 ? 'sp' : 'B'),
       date: '6/17'
     })
  }
  mockLabels.value = mocks
  showPreview.value = true

  /*
  printOrderLabel(form).then(response => {
    ElMessage.success('打印指令已发送')
  })
  */
}

function handleConfirm() {
  // Confirm might also print or just close? 
  // Screenshot has "Label Print" button prominently inside.
  handlePrintAction()
  // emit('update:modelValue', false) // Don't close immediately if printing?
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.label-print-form {
  padding: 10px;
}
.form-tip {
  color: red;
  margin-left: 10px;
  font-size: 12px;
}
.print-action-area {
  text-align: center;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
.print-btn {
  /* Style to look like the button in screenshot (gradient/silver look) - kept simple for now */
  padding: 10px 30px;
  font-weight: bold;
}
</style>
