<template>
  <el-dialog
    title="添加测序样品"
    :model-value="modelValue"
    width="900px"
    @update:model-value="handleUpdateVisible"
    append-to-body
  >
    <!-- Order Info Section -->
    <el-form :model="orderInfo" label-width="100px" class="order-info-form">
      <el-row>
        <el-col :span="12">
          <el-form-item label="订单号：">
            <el-input v-model="orderInfo.orderId" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户ID：">
            <el-input :value="orderInfo.customerInfo ? orderInfo.customerInfo.customerId : orderInfo.customerId" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="客户姓名：">
            <el-input :value="orderInfo.customerInfo ? orderInfo.customerInfo.customerName : orderInfo.customerName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户地址：">
            <el-input :value="orderInfo.customerInfo ? orderInfo.customerInfo.address : orderInfo.customerAddress" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="客户等级：">
            <el-input :value="orderInfo.customerInfo ? orderInfo.customerInfo.customerLevel : orderInfo.customerLevel" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="试测：">
             <!-- Assuming it's a boolean or string in orderInfo -->
            <el-input :value="orderInfo.trial === 1 ? '是' : '否'" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="加急：">
            <el-input :value="orderInfo.urgent === '1' ? '是' : '否'" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="引物浓度：">
            <el-input v-model="orderInfo.primerConcentration" readonly />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="divider"></div>

    <!-- Sample Form Section -->
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="sample-form">
      <el-form-item label="样品编号：" prop="sampleId">
        <el-input v-model="form.sampleId" placeholder="多个数据请用,分割">
           <template #suffix>
             <span class="input-hint">多个数据请用,分割</span>
           </template>
        </el-input>
      </el-form-item>

      <el-form-item label="测序引物：" prop="primer">
        <el-input v-model="form.primer" placeholder="多个数据请用,分割">
           <template #suffix>
             <span class="input-hint">多个数据请用,分割</span>
           </template>
        </el-input>
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="样品类型：" prop="sampleType">
            <SampleTypeSelect v-model="form.sampleType" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
           <el-form-item label="抗生素类型：" prop="antibioticType">
             <AntibioticTypeSelect v-model="form.antibioticType" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="载体名称：" prop="carrierName">
            <el-input v-model="form.carrierName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="片段大小：" prop="fragmentSize">
            <el-input v-model="form.fragmentSize" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="是否测通：" prop="isTestThrough">
        <el-radio-group v-model="form.isTestThrough">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注：" prop="remark">
         <el-input v-model="form.remark" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center;">
        <el-button type="success" @click="handleSubmit">确 定</el-button>
        <el-button type="danger" @click="handleCancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, getCurrentInstance } from 'vue'
// import SampleTypeSelect from './SampleTypeSelect.vue' // Global registered
// import AntibioticTypeSelect from './AntibioticTypeSelect.vue' // Global registered
import { getOrder } from '@/api/sequencing/order'
import { addSamples } from '@/api/sequencing/samples'
import { ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()
// Removed direct useDict usage as it's now inside the components
// const { sequencing_sample_type, sequencing_antibiotic } = proxy.useDict('sequencing_sample_type', 'sequencing_antibiotic')

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: [String, Number],
    default: null
  },
  orderRow: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref(null)
const orderInfo = ref({})
const form = reactive({
  sampleId: '',
  primer: '',
  sampleType: undefined,
  antibioticType: undefined,
  carrierName: '',
  fragmentSize: '',
  isTestThrough: 0,
  remark: ''
})

const rules = {
  // Add validation if needed, e.g. sampleId required?
}

watch(() => props.modelValue, (val) => {
  if (val && props.orderId) {
    console.log('Dialog Opening with Order ID:', props.orderId)
    loadOrderInfo()
    reset()
  } else {
    console.log('Dialog Opening but missing val or orderId', val, props.orderId)
  }
})

function loadOrderInfo() {
  if (props.orderRow && Object.keys(props.orderRow).length > 0) {
      console.log('Using passed orderRow:', props.orderRow)
      orderInfo.value = { ...props.orderRow }
      // Do not return, fetch full details to ensure all fields (like primerConcentration) are present
  }
  getOrder(props.orderId).then(response => {
    console.log('getOrder Response:', response)
    orderInfo.value = response.data || {}
    console.log('orderInfo value:', orderInfo.value)
  })
}

function reset() {
  form.sampleId = ''
  form.primer = ''
  form.sampleType = undefined
  form.antibioticType = undefined
  form.carrierName = ''
  form.fragmentSize = ''
  form.isTestThrough = 0
  form.remark = ''
  if (formRef.value) formRef.value.resetFields()
}

function handleUpdateVisible(val) {
  emit('update:modelValue', val)
}

function handleCancel() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      const submitData = {
        ...form,
        orderId: props.orderId
      }
      addSamples(submitData).then(response => {
        ElMessage.success('添加成功')
        emit('success')
        emit('update:modelValue', false)
      })
    }
  })
}
</script>

<style scoped>
/*
.order-info-form :deep(.el-form-item) {
  margin-bottom: 2px;
}
.order-info-form :deep(.el-input__inner) {
  border: 1px solid #dcdfe6; 
} */

.divider {
  height: 1px;
  background: #e6ebf5;
  margin: 10px 0 20px 0;
}

.input-hint {
  color: red;
  font-size: 12px;
  line-height: 32px;
  margin-right: 5px;
}
</style>
