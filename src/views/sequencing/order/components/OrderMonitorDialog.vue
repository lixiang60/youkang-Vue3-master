<template>
  <el-dialog
    title="订单量查询"
    :model-value="modelValue"
    width="740px"
    append-to-body
    @update:model-value="val => emit('update:modelValue', val)"
  >
    <el-form :model="form" label-width="0" class="well-form">
      <div class="form-row border-top">
        <div class="form-label" style="width: 100px">开始时间：</div>
        <div class="form-content">
          <el-date-picker
            v-model="form.startTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择"
            style="width: 230px"
          />
        </div>
        <div class="form-label" style="width: 100px">结束时间：</div>
        <div class="form-content">
          <el-date-picker
            v-model="form.endTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择"
            style="width: 230px"
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-label" style="width: 100px">模板类型：</div>
        <div class="form-content">
          <el-radio-group v-model="form.type">
            <el-radio label="所属公司查询">所属公司查询</el-radio>
            <el-radio label="生产公司查询">生产公司查询</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="form-row border-bottom no-hover" style="justify-content: center; padding: 15px">
        <el-button type="default" plain class="print-list-btn" @click="handlePrintPreview">
          <el-icon><Printer /></el-icon> 打印清单
        </el-button>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" :icon="Check" @click="handleConfirm">确定</el-button>
        <el-button type="danger" :icon="Close" @click="emit('update:modelValue', false)">取消</el-button>
      </div>
    </template>

    <!-- 2. 报表预览弹窗 -->
    <el-dialog v-model="showReport" title="订单量明细报表" width="1200px" append-to-body top="5vh">
      <div id="printMonitorReport" class="report-style-wrap">
        <table class="report-table-bordered">
          <thead>
            <tr>
              <th width="120">所属公司</th>
              <th width="100">录入人</th>
              <th width="160">订单编号</th>
              <th width="120">客户姓名</th>
              <th width="120">课题组</th>
              <th width="150">录入时间</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in reportList" :key="index">
              <td>{{ item.belongCompany }}</td>
              <td>{{ item.createBy }}</td>
              <td>{{ item.orderId }}</td>
              <td>{{ item.customerName }}</td>
              <td>{{ item.groupName }}</td>
              <td>{{ item.createTime }}</td>
              <td>{{ item.remark || '' }}</td>
            </tr>
            <tr v-if="reportList.length === 0" class="empty-row">
              <td colspan="7" style="text-align: center">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button v-print="'#printMonitorReport'" type="success" :icon="Printer">打 印</el-button>
          <el-button type="danger" :icon="Close" @click="showReport = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch } from 'vue'
import { queryByRange } from '@/api/sequencing/order'
import { Check, Close, Printer } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const { proxy } = getCurrentInstance()

const form = reactive({
  startTime: '',
  endTime: '',
  type: '所属公司查询'
})

const showReport = ref(false)
const reportList = ref([])

// 监听弹窗打开，初始化默认时间范围（最近两天）
watch(
  () => props.modelValue,
  val => {
    if (val) {
      if (!form.startTime || !form.endTime) {
        const now = new Date()
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        form.startTime = proxy.parseTime(lastMonth, '{y}-{m}-{d}')
        form.endTime = proxy.parseTime(now, '{y}-{m}-{d}')
      }
    }
  }
)

function handlePrintPreview() {
  if (!form.startTime || !form.endTime) {
    proxy.$modal.msgWarning('请选择时间范围')
    return
  }

  proxy.$modal.loading('数据查询中...')

  const query = {
    startTime: form.startTime + 'T00:00:00',
    endTime: form.endTime + 'T23:59:59'
  }

  // 对接文档 9. 范围查询订单 (queryByRange)
  queryByRange(query)
    .then(response => {
      proxy.$modal.closeLoading()
      reportList.value = response.data || []

      if (reportList.value.length === 0) {
        proxy.$modal.msgWarning('当前范围下无订单数据')
      }
      showReport.value = true
    })
    .catch(() => {
      proxy.$modal.closeLoading()
    })
}

function handleConfirm() {
  handlePrintPreview()
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
  padding: 10px;
  background-color: #f8f9fa;
  font-weight: bold;
  border-right: 1px solid #ebeef5;
  font-size: 13px;
}
.form-content {
  flex: 1;
  padding: 10px 15px;
  display: flex;
  align-items: center;
}
.border-top {
  border-top: 1px solid #ebeef5;
}
.border-bottom {
  border-bottom: 1px solid #ebeef5;
}
.no-border {
  border: none !important;
}

.report-style-wrap {
  padding: 20px;
  background: #fff;
}

.report-table-bordered {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.report-table-bordered th,
.report-table-bordered td {
  border: 1px solid #333;
  padding: 8px 4px;
  text-align: center;
  font-size: 13px;
  word-break: break-all;
}

.report-table-bordered th {
  background-color: #fff;
  font-weight: normal;
}
</style>
