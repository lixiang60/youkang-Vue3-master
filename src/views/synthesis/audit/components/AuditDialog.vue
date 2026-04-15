<template>
  <el-dialog v-model="visible" title="审核" width="800px" append-to-body>
    <div class="well-form">
      <div class="form-row">
        <div class="form-label">订单号:</div>
        <div class="form-content">
          <el-input v-model="form.orderId" disabled size="small" />
        </div>
        <div class="form-label">客户ID:</div>
        <div class="form-content">
          <el-input v-model="form.customerId" size="small" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-label">客户名:</div>
        <div class="form-content">
          <el-input v-model="form.customerName" size="small" />
        </div>
        <div class="form-label">客户地址:</div>
        <div class="form-content">
          <el-input v-model="form.customerAddress" size="small" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-label">客户等级:</div>
        <div class="form-content">
          <el-input v-model="form.customerLevel" size="small" />
        </div>
        <div class="form-label"></div>
        <div class="form-content">
          <el-button :icon="Search" type="primary" @click="handleCheckSamples">审核订单样品</el-button>
        </div>
      </div>

      <div class="form-row">
        <div class="form-label">订货日期:</div>
        <div class="form-content">
          <el-date-picker
            v-model="form.orderDate"
            type="datetime"
            size="small"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </div>
        <div class="form-label">加急:</div>
        <div class="form-content">
          <el-radio-group v-model="form.isUrgent">
            <el-radio label="是">是</el-radio>
            <el-radio label="否">否</el-radio>
          </el-radio-group>
        </div>
      </div>

      <div class="form-row">
        <div class="form-label">课题组:</div>
        <div class="form-content">
          <el-input v-model="form.groupName" size="small" />
        </div>
        <div class="form-label">订单模式:</div>
        <div class="form-content">
          <el-select v-model="form.orderMode" placeholder="请选择" size="small" style="width: 100%">
            <el-option label="OD模式" value="OD模式" />
            <el-option label="其他模式" value="其他" />
          </el-select>
        </div>
      </div>

      <div class="form-row border-bottom">
        <div class="form-label">备注:</div>
        <div class="form-content">
          <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注内容" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
        <el-button type="danger" :icon="Close" @click="cancel">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="AuditDialog">
import { computed, ref, watch, getCurrentInstance } from 'vue'
import { Search, Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  orderData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const { proxy } = getCurrentInstance()
const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const form = ref({})

watch(
  () => props.orderData,
  val => {
    if (val) {
      form.value = { ...val }
    }
  },
  { immediate: true }
)

function handleCheckSamples() {
  proxy.$modal.msgInfo('功能开发中...')
}

function submitForm() {
  proxy.$modal.msgWarning('API接入中...')
  visible.value = false
  emit('success')
}

function cancel() {
  visible.value = false
}
</script>

<style scoped lang="scss">
.well-form {
  border: 1px solid #dcdfe6;
  margin-bottom: 20px;
}
</style>
