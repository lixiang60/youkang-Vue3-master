<template>
  <el-dialog v-model="visible" title="修改" width="900px" append-to-body :close-on-click-modal="false">
    <div class="well-form">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
        <el-row class="form-row">
          <el-col :span="3" class="label">订单号：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.orderId" readonly size="small" />
          </el-col>
          <el-col :span="3" class="label">客户ID：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.customerId" size="small" />
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="3" class="label">客户名：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.customerName" size="small" />
          </el-col>
          <el-col :span="3" class="label">客户地址：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.customerAddress" size="small" />
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="3" class="label">客户等级：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.customerLevel" size="small" />
          </el-col>
          <el-col :span="3" class="label">订单状态：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.orderStatus" size="small" />
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="3" class="label">订单类型：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.orderType" size="small" />
          </el-col>
          <el-col :span="3" class="label">基因关联号：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.geneRelationNo" size="small" style="width: 80%" />
            <el-button size="small" :icon="Search" circle style="margin-left: 5px" />
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="3" class="label">订货日期：</el-col>
          <el-col :span="9" class="content">
            <el-date-picker
              v-model="form.orderDate"
              type="datetime"
              placeholder="选择时间"
              size="small"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="3" class="label">加急：</el-col>
          <el-col :span="9" class="content">
            <el-radio-group v-model="form.isUrgent">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="3" class="label">课题组：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.groupName" size="small" style="width: 80%" />
            <el-button size="small" :icon="Plus" circle style="margin-left: 5px" @click="handleAddGroup" />
          </el-col>
          <el-col :span="3" class="label">订单模式：</el-col>
          <el-col :span="9" class="content">
            <el-select v-model="form.orderMode" placeholder="请选择" size="small" style="width: 100%">
              <el-option label="OD模式" value="OD模式" />
              <el-option label="其他模式" value="其他模式" />
            </el-select>
          </el-col>
        </el-row>
        <el-row class="form-row" style="height: 120px">
          <el-col :span="3" class="label" style="height: 120px">备注：</el-col>
          <el-col :span="21" class="content" style="height: 120px">
            <el-input v-model="form.remark" type="textarea" :rows="4" size="small" />
          </el-col>
        </el-row>
        <el-row class="form-row">
          <el-col :span="3" class="label">添加人：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.createBy" size="small" />
          </el-col>
          <el-col :span="3" class="label">添加时间：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.createTime" readonly size="small" />
          </el-col>
        </el-row>
        <el-row class="form-row no-border">
          <el-col :span="3" class="label">邮件回复：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.emailStatus" size="small" />
          </el-col>
          <el-col :span="3" class="label">回复人：</el-col>
          <el-col :span="9" class="content">
            <el-input v-model="form.replyBy" size="small" />
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="handleConfirm">确定</el-button>
        <el-button type="danger" :icon="Close" @click="visible = false">取消</el-button>
      </div>
    </template>

    <!-- 更新课题组弹窗 -->
    <group-update-dialog v-model="showGroupDialog" :order-id="form.orderId" @success="handleGroupSuccess" />
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { Search, Plus, Check, Close } from '@element-plus/icons-vue'
import GroupUpdateDialog from './GroupUpdateDialog.vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: Boolean,
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const form = ref({})
const showGroupDialog = ref(false)

const rules = {}

watch(
  () => props.data,
  val => {
    form.value = { ...val }
  },
  { immediate: true }
)

function handleAddGroup() {
  showGroupDialog.value = true
}

function handleGroupSuccess(groupName) {
  form.value.groupName = groupName
  proxy.$modal.msgSuccess('课题组更新成功')
}

function handleConfirm() {
  emit('confirm', { ...form.value })
  visible.value = false
}
</script>

<style scoped>
.well-form {
  border: 1px solid #dcdfe6;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
}

.form-row.no-border {
  border-bottom: none;
}

.label {
  background-color: #f8f9fb;
  padding: 10px;
  text-align: center;
  border-right: 1px solid #dcdfe6;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.content {
  padding: 5px 10px;
  display: flex;
  align-items: center;
  border-right: 1px solid #dcdfe6;
}

.content:last-child {
  border-right: none;
}

:deep(.el-dialog__header) {
  background-color: #f8f9fb;
  margin-right: 0;
  padding: 10px 20px;
}

:deep(.el-dialog__title) {
  font-size: 14px;
  font-weight: bold;
}
</style>
