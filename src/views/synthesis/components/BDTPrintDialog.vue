<template>
  <div>
    <!-- 1. 查询弹窗 -->
    <el-dialog v-model="visible" :title="title" width="600px" append-to-body>
      <el-form :model="form" label-width="0" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">板号：</div>
          <div class="form-content">
            <el-input v-model="form.plateNo" placeholder="请输入板号" clearable style="width: 250px" />
          </div>
        </div>
        <div class="form-row border-bottom">
          <div class="form-label">报表类型：</div>
          <div class="form-content" style="display: flex; align-items: center; justify-content: space-between">
            <el-radio-group v-model="form.reportType">
              <el-radio label="BDT表">BDT表</el-radio>
              <el-radio label="模板BDT表">模板BDT表</el-radio>
            </el-radio-group>
            <el-button type="default" plain class="print-list-btn" @click="handleOpenGridPreview">
              <el-icon><Printer /></el-icon> 标签预览
            </el-button>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="handleOpenGridPreview">确定</el-button>
          <el-button type="danger" :icon="Close" @click="visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 2. 96孔图形预览弹窗 -->
    <el-dialog v-model="showGrid" title="BDT表预览打印" width="1150px" append-to-body top="5vh">
      <div id="printBDTGrid" class="report-print-wrap">
        <div class="report-header">
          <div class="meta-row" style="font-weight: bold; font-family: 'SimSun', serif">
            <span>板号：{{ form.plateNo }} 操作人：{{ meta.user }}</span>
            <span style="flex: 1; text-align: center">
              加急<span class="checkbox-mock"></span> 试做<span class="checkbox-mock"></span>
            </span>
            <span>打印时间：{{ meta.time }} 第 1 页 共 1 页</span>
          </div>
        </div>

        <table class="bdt-report-table">
          <tbody>
            <tr v-for="r in ['A', 'B', 'C', 'D', 'E', 'F']" :key="r">
              <td v-for="c in 12" :key="c" class="well-cell-bdt">
                <div v-if="getWellData(r, c).produceId" class="well-cell-inner">
                  <div class="cell-row-top">
                    <span class="well-pos-blue">{{ r }}{{ c < 10 ? '0' + c : c }}</span>
                    <span class="well-status-small">{{ getWellData(r, c).returnState || '进行中' }}</span>
                  </div>
                  <div class="cell-row-order">{{ getWellData(r, c).produceId }}</div>
                  <div class="cell-row-mid-bold">{{ getWellData(r, c).sampleId }}</div>
                  <div class="cell-row-meta">
                    {{ getWellData(r, c).carrierName || getWellData(r, c).fragmentSize || '' }}
                  </div>
                  <div class="cell-row-bottom-blue">
                    {{ getWellData(r, c).customerName }} {{ getWellData(r, c).templateNumber || '' }}
                  </div>
                </div>
                <div v-else class="well-cell-inner">
                  <div class="cell-row-top">
                    <span class="well-pos-blue" style="color: #ccc">{{ r }}{{ c < 10 ? '0' + c : c }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button v-print="'#printBDTGrid'" type="success" :icon="Printer">打 印</el-button>
          <el-button type="danger" :icon="Close" @click="showGrid = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, getCurrentInstance } from 'vue'
import { Check, Close, Printer } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '测序 BDT 表查询' },
  plateNo: { type: String, default: '' },
  fetchApi: { type: Function, required: true }
})

const emit = defineEmits(['update:modelValue'])
const { proxy } = getCurrentInstance()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const form = reactive({
  plateNo: props.plateNo,
  reportType: 'BDT表'
})

const dataList = ref([])
const showGrid = ref(false)
const meta = reactive({
  user: 'ADMIN',
  time: ''
})

watch(
  () => props.plateNo,
  val => {
    form.plateNo = val
  }
)

async function fetchData() {
  if (!form.plateNo) {
    proxy.$modal.msgWarning('请输入板号')
    return false
  }
  proxy.$modal.loading('查询中...')
  try {
    const response = await props.fetchApi({ plateNo: form.plateNo, templateNo: form.plateNo })
    dataList.value = response.data || []
    meta.time = proxy.parseTime(new Date(), '{y}/{m}/{d}')
    if (!dataList.value.length) {
      proxy.$modal.msgWarning('未查询到相关数据')
      return false
    }
    return true
  } catch (e) {
    return false
  } finally {
    proxy.$modal.closeLoading()
  }
}

async function handleOpenGridPreview() {
  if (await fetchData()) {
    showGrid.value = true
  }
}

function getWellData(r, c) {
  const pos1 = r + c
  const pos2 = r + (c < 10 ? '0' + c : c)
  return (
    dataList.value.find(
      item =>
        item.holeNo === pos1 || item.holeNo === pos2 || item.templateHoleNo === pos1 || item.templateHoleNo === pos2
    ) || {}
  )
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
  width: 100px;
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

.report-print-wrap {
  background: #fff;
  padding: 15px;
  color: #000;
}
.report-header {
  font-size: 13px;
  margin-bottom: 5px;
}
.meta-row {
  display: flex;
  justify-content: space-between;
}
.checkbox-mock {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 1px solid #000;
  vertical-align: middle;
  margin-left: 4px;
  margin-right: 10px;
}
.bdt-report-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.well-cell-bdt {
  border: 1px solid #333;
  width: 8.33%;
  height: 95px;
  vertical-align: top;
  padding: 2px;
  font-family: 'SimSun', serif;
}
.well-cell-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 11px;
}
.cell-row-top {
  display: flex;
  justify-content: space-between;
  line-height: 1.2;
}
.well-pos-blue {
  color: blue;
  font-weight: bold;
  font-size: 13px;
}
.well-status-small {
  font-size: 10px;
  transform: scale(0.85);
  color: #666;
}
.cell-row-order {
  font-size: 10px;
  margin-top: 1px;
  color: #333;
}
.cell-row-mid-bold {
  font-weight: bold;
  background-color: #ffff00;
  padding: 1px 0;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
.cell-row-meta {
  color: #000;
  font-size: 10px;
  flex: 1;
  word-break: break-all;
}
.cell-row-bottom-blue {
  color: blue;
  font-size: 10px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
