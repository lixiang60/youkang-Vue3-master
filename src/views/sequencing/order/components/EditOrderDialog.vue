<template>
  <el-dialog
    title="修改"
    :model-value="modelValue"
    width="1000px"
    append-to-body
    @update:model-value="handleUpdateVisible"
  >
    <!-- Use similar structure to Screenshot: grid placement -->
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单号：">
            <div style="display: flex; align-items: center; width: 100%">
              <el-input v-model="form.orderId" readonly style="width: 230px" />
              <el-button class="ml10 pill-btn" icon="Camera" circle title="补拍照" @click="handlePhotoUpload" />
              <el-button class="ml5 pill-btn" icon="Picture" circle title="补截图" @click="handleScreenshotUpload" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户ID：">
            <el-input v-model="form.customerId" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户姓名：">
            <el-input v-model="form.customerName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户地址：">
            <el-input v-model="form.customerAddress" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课题组：">
            <div style="display: flex; width: 100%">
              <el-input v-model="form.groupName" />
              <el-button class="ml5" icon="Plus" circle @click="handleAddGroup" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联基因号：">
            <div style="display: flex; width: 100%">
              <el-input v-model="form.genNo" />
              <el-button class="ml5" icon="Plus" circle @click="handleAddGen" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户等级：">
            <el-input v-model="form.customerLevel" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="试测：">
            <el-input v-model="form.trial" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="信息不全：">
            <el-select v-model="form.infoIncomplete" placeholder="请选择" style="width: 100%">
              <el-option label="是" value="1" />
              <el-option label="否" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单信息：">
            <el-input v-model="form.orderInfo" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="加急：">
            <el-radio-group v-model="form.urgent">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="送样时间：">
            <!-- Screenshot: 送样时间，使用时间选择器、或带秒 -->
            <el-date-picker
              v-model="form.createTime"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注：">
            <el-input v-model="form.remark" type="textarea" :rows="4" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属公司ID：">
            <el-input v-model="form.belongCompanyId" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属公司：">
            <el-input v-model="form.belongCompany" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
        <el-button type="danger" :icon="Close" @click="handleUpdateVisible(false)">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 嵌套的更新客户与课题组弹窗 -->
  <el-dialog v-model="groupDialogOpen" title="更新客户与课题组" width="600px" append-to-body>
    <div class="grid-table">
      <div class="grid-row border-top border-left border-right">
        <div class="grid-cell label-cell">订单号：</div>
        <div class="grid-cell value-cell">
          <el-input v-model="groupForm.orderId" readonly class="inner-input" />
        </div>
      </div>
      <div class="grid-row border-all">
        <div class="grid-cell label-cell">客户选择：</div>
        <div class="grid-cell value-cell">
          <el-select v-model="groupForm.customerId" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in customerOptions"
              :key="item.customerId"
              :label="`${item.customerId}-${item.customerName}-${item.customerUnit || ''}`"
              :value="item.customerId"
            />
          </el-select>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 15px">
      <el-button type="success" :icon="Check" @click="submitGroupUpdate">更新</el-button>
    </div>
  </el-dialog>

  <!-- 嵌套的更新基因号弹窗 -->
  <el-dialog v-model="genDialogOpen" title="更新基因号" width="600px" append-to-body>
    <div class="grid-table">
      <div class="grid-row border-top border-left border-right">
        <div class="grid-cell label-cell">订单号：</div>
        <div class="grid-cell value-cell">
          <el-input v-model="genForm.orderId" readonly class="inner-input" />
        </div>
      </div>
      <div class="grid-row border-all">
        <div class="grid-cell label-cell">关联基因号：</div>
        <div class="grid-cell value-cell">
          <el-input v-model="genForm.genNo" placeholder="请输入" class="inner-input" />
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 嵌套的拍照附件补齐弹窗 -->
  <el-dialog v-model="photoUploadOpen" title="补拍照附件" width="450px" append-to-body>
    <div style="display: flex; justify-content: center; padding: 20px">
      <image-upload v-model="form.photoAttachment" :limit="1" />
    </div>
  </el-dialog>

  <!-- 嵌套的截图附件补齐弹窗 -->
  <el-dialog v-model="screenshotUploadOpen" title="补截图附件" width="450px" append-to-body>
    <div style="display: flex; justify-content: center; padding: 20px">
      <file-upload v-model="form.sequencingTemplateAttachment" :limit="1" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, getCurrentInstance } from 'vue'
import { getOrder, updateOrder } from '@/api/sequencing/order'
import { Check, Close, Camera, Picture, Plus } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orderRow: {
    type: Object,
    default: () => ({})
  },
  customerOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref(null)

const form = ref({
  orderId: undefined,
  customerId: undefined,
  customerName: undefined,
  customerAddress: undefined,
  groupId: undefined,
  groupName: undefined,
  genNo: undefined,
  customerLevel: undefined,
  trial: undefined,
  infoIncomplete: undefined,
  orderInfo: undefined,
  urgent: '0',
  sampleDeliveryDate: undefined,
  remark: undefined,
  belongCompanyId: undefined,
  belongCompany: undefined
})

const rules = {}

const groupDialogOpen = ref(false)
const groupForm = ref({
  orderId: undefined,
  customerId: undefined
})

const genDialogOpen = ref(false)
const genForm = ref({
  orderId: undefined,
  genNo: undefined
})

const photoUploadOpen = ref(false)
const screenshotUploadOpen = ref(false)

watch(
  () => props.modelValue,
  val => {
    if (val) {
      reset()
      if (props.orderRow && props.orderRow.orderId) {
        console.log('EditOrderDialog Loading Data:', props.orderRow)
        getOrder(props.orderRow.orderId).then(response => {
          console.log('EditOrderDialog Final response Data:', response)
          const data = response.data
          form.value = { ...form.value, ...data }
        })
      }
    }
  }
)

function reset() {
  form.value = {
    orderId: undefined,
    customerId: undefined,
    customerName: undefined,
    customerAddress: undefined,
    groupId: undefined,
    groupName: undefined,
    genNo: undefined,
    customerLevel: undefined,
    trial: undefined,
    infoIncomplete: undefined,
    orderInfo: undefined,
    urgent: '0',
    createTime: undefined,
    remark: undefined,
    belongCompanyId: undefined,
    belongCompany: undefined
  }
  if (formRef.value) formRef.value.resetFields()
}

function handleUpdateVisible(val) {
  emit('update:modelValue', val)
}

function handleAddGroup() {
  groupForm.value.orderId = form.value.orderId
  groupForm.value.customerId = form.value.customerId
  groupDialogOpen.value = true
}

function submitGroupUpdate() {
  if (groupForm.value.customerId) {
    const found = props.customerOptions.find(item => item.customerId == groupForm.value.customerId)
    if (found) {
      form.value.customerId = found.customerId
      form.value.customerName = found.customerName
      form.value.customerAddress = found.address
    }
  }
  groupDialogOpen.value = false
  proxy.$modal.msgSuccess('更新成功')
}

function handleAddGen() {
  genForm.value.orderId = form.value.orderId
  genForm.value.genNo = form.value.genNo
  genDialogOpen.value = true
}

function submitGenUpdate() {
  form.value.genNo = genForm.value.genNo
  genDialogOpen.value = false
  proxy.$modal.msgSuccess('更新成功')
}

function handlePhotoUpload() {
  photoUploadOpen.value = true
}

function handleScreenshotUpload() {
  screenshotUploadOpen.value = true
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      const submitData = { ...form.value }
      updateOrder(submitData).then(response => {
        proxy.$modal.msgSuccess('修改成功')
        emit('update:modelValue', false)
        emit('success')
      })
    }
  })
}
</script>

<style scoped>
.ml5 {
  margin-left: 5px;
}
.grid-table {
  width: 100%;
}
.grid-row {
  display: flex;
}
.grid-cell {
  padding: 8px 12px;
  display: flex;
  align-items: center;
}
.label-cell {
  width: 110px;
  background-color: #f7fbff;
  border-right: 1px solid #b3d4fc;
}
.value-cell {
  flex: 1;
}
.border-top {
  border-top: 1px solid #b3d4fc;
}
.border-left {
  border-left: 1px solid #b3d4fc;
}
.border-right {
  border-right: 1px solid #b3d4fc;
}
.border-all {
  border: 1px solid #b3d4fc;
}
.inner-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  background: transparent;
}
.pill-btn {
  background: #fdfdfd !important;
  border: 1px solid #c8e0ff !important;
}
.pill-btn:hover {
  background: #f0f7ff !important;
  border-color: #a0cfff !important;
}
</style>
