<template>
  <el-dialog v-model="visible" :title="title" width="600px" append-to-body>
    <div class="filter-form">
      <el-form :model="queryParams" label-width="100px">
        <el-form-item label="课题组选择">
          <el-input v-model="queryParams.groupName" placeholder="请输入课题组" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="queryParams.startTime"
                type="date"
                placeholder="开始时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="queryParams.endTime"
                type="date"
                placeholder="结束时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="text-align: center; margin-top: 20px">
        <el-button type="primary" icon="Printer" @click="handleBatchPrint">打 印</el-button>
      </div>
    </div>

    <!-- 批量打印预览弹窗 -->
    <print-dialog v-model="showPrint" title="批量送货单预览" print-id="printBatchDelivery">
      <div class="batch-print-wrapper">
        <div v-for="(order, index) in orderList" :key="index" class="print-item-page">
          <delivery-note-content :data="order.info" :list="order.items" />
          <!-- 分页符 (仅在非最后一个元素后添加) -->
          <div v-if="index < orderList.length - 1" class="page-break"></div>
        </div>
      </div>
    </print-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import PrintDialog from '@/components/PrintDialog/index.vue'
import DeliveryNoteContent from './DeliveryNoteContent.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '批量打印送货单' }
})

const emit = defineEmits(['update:modelValue'])
const { proxy } = getCurrentInstance()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const showPrint = ref(false)
const queryParams = reactive({
  groupName: '',
  startTime: '',
  endTime: ''
})

const orderList = ref([])

function handleBatchPrint() {
  // 模拟批量获取订单数据
  proxy.$modal.loading('正在检索订单数据...')
  setTimeout(() => {
    orderList.value = generateMockOrders()
    proxy.$modal.closeLoading()
    showPrint.value = true
  }, 800)
}

function generateMockOrders() {
  return [
    {
      info: {
        customerName: '某某某',
        orderId: '20180611213609874',
        groupName: '刘某某',
        deliveryTime: '2018/6/11 21:36:09',
        customerAddress: '广州市',
        region: '广州市',
        remark: '无',
        createBy: 'ADMIN',
        salesman: '李海涛'
      },
      items: [{ project: '质粒', quantityType: '个', quantity: 6, unitPrice: 15, totalPrice: 90 }]
    },
    {
      info: {
        customerName: '另一客户',
        orderId: '20180614225837463',
        groupName: '课题组B',
        deliveryTime: '2018/6/14 22:58:37',
        customerAddress: '广州市',
        region: '广州市',
        remark: '无',
        createBy: 'ADMIN',
        salesman: '李海涛'
      },
      items: [{ project: '质粒', quantityType: '个', quantity: 2, unitPrice: 15, totalPrice: 30 }]
    }
  ]
}
</script>

<style scoped>
.batch-print-wrapper {
  background-color: #f0f2f5;
  padding: 20px;
}

.print-item-page {
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media print {
  .batch-print-wrapper {
    background-color: transparent;
    padding: 0;
  }
  .print-item-page {
    margin-bottom: 0;
    box-shadow: none;
  }
  .page-break {
    page-break-after: always;
    height: 0;
    overflow: hidden;
  }
}
</style>
