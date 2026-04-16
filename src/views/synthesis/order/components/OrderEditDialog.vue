<template>
  <el-dialog v-model="visible" width="900px" append-to-body top="8vh" :close-on-click-modal="false">
    <template #header>
      <div style="display: flex; align-items: center; padding: 10px 0">
        <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
          <EditPen />
        </el-icon>
        <span style="font-weight: bold; font-size: 16px">修改订单</span>
      </div>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单号" prop="orderId">
            <el-input v-model="form.orderId" readonly placeholder="请输入订单号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户ID" prop="customerId">
            <el-input v-model="form.customerId" placeholder="请输入客户ID" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名" prop="customerName">
            <el-input v-model="form.customerName" placeholder="请输入客户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户地址" prop="customerAddress">
            <el-input v-model="form.customerAddress" placeholder="请输入客户地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户等级" prop="customerLevel">
            <el-input v-model="form.customerLevel" placeholder="请输入客户等级" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单状态" prop="orderStatus">
            <el-input v-model="form.orderStatus" placeholder="请输入订单状态" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单类型" prop="orderType">
            <el-input v-model="form.orderType" placeholder="请输入订单类型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="基因关联号" prop="geneRelationNo">
            <div style="display: flex; gap: 10px; width: 100%">
              <el-input v-model="form.geneRelationNo" style="flex: 1" placeholder="请关联基因" />
              <el-button :icon="Search" circle type="primary" plain />
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订货日期" prop="orderDate">
            <el-date-picker v-model="form.orderDate" type="datetime" placeholder="选择时间" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="加急" prop="isUrgent">
            <el-radio-group v-model="form.isUrgent">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课题组" prop="groupName">
            <div style="display: flex; gap: 10px; width: 100%">
              <el-input v-model="form.groupName" style="flex: 1" placeholder="请输入或选择课题组" />
              <el-button :icon="Plus" circle type="success" plain @click="handleAddGroup" />
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单模式" prop="orderMode">
            <el-select v-model="form.orderMode" placeholder="请选择" style="width: 100%">
              <el-option label="OD模式" value="OD模式" />
              <el-option label="其他模式" value="其他模式" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="添加备注信息..." />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="添加人" prop="createBy">
            <el-input v-model="form.createBy" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="添加时间" prop="createTime">
            <el-input v-model="form.createTime" readonly />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮件回复" prop="emailStatus">
            <el-input v-model="form.emailStatus" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="回复人" prop="replyBy">
            <el-input v-model="form.replyBy" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

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
import { Search, Plus, Check, Close, EditPen } from '@element-plus/icons-vue'
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
/* 原有的 well-form 紧凑样式已移除，使用原生 el-form 提供更好的呼吸感 */
</style>
