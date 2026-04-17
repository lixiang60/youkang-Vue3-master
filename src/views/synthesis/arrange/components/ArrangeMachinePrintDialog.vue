<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    width="600px"
    append-to-body
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 提示信息区域 -->
      <div v-if="selectedItems && selectedItems.length > 0" class="selection-info">
        已选中 <span class="highlight">{{ selectedItems.length }}</span> 个排版记录
      </div>
      <div v-else class="selection-info-empty mb20">
        <el-alert title="请先在列表中选中需要操作的记录" type="warning" :closable="false" show-icon />
      </div>

      <!-- 表单输入区域 -->
      <el-row :gutter="20" class="mt20">
        <el-col :span="24">
          <el-form-item label="板号" prop="plateNo">
            <el-input v-model="form.plateNo" placeholder="请输入板号" clearable style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所属公司" prop="company">
            <el-select v-model="form.company" placeholder="请选择所属分公司" style="width: 100%">
              <el-option label="北京分公司" value="北京分公司" />
              <el-option label="上海分公司" value="上海分公司" />
              <el-option label="广州分公司" value="广州分公司" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :disabled="!selectedItems || selectedItems.length === 0" @click="handleConfirm"
          >上机表打印预览</el-button
        >
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>

    <!-- 打印预览弹窗 -->
    <el-dialog v-model="showPrintDialog" title="上机表打印预览" width="900px" append-to-body>
      <div id="machinePrintGrid" class="print-container">
        <!-- 表头信息区 -->
        <div class="report-header">
          <div class="header-left">
            <span>板号：{{ form.plateNo || 'yb336' }}</span>
            <span style="margin-left: 15px">操作人：ADMIN</span>
          </div>
          <div class="header-center">
            <h3>睿博兴科生物技术有限公司</h3>
          </div>
          <div class="header-right">
            <span>打印时间：{{ currentDateTime }}</span>
            <span style="margin-left: 10px">第 1 页 共 1 页</span>
          </div>
        </div>

        <!-- 详细数据表格 -->
        <table class="report-table">
          <thead>
            <tr>
              <th width="40">序号</th>
              <th width="40">柱号</th>
              <th width="70">引物编号</th>
              <th>序列</th>
              <th width="50">碱基数</th>
              <th width="60">合成规格</th>
              <th width="60">纯化方式</th>
              <th width="50">端5修饰</th>
              <th width="50">端3修饰</th>
              <th width="60">中间修饰</th>
              <th width="40">硫代</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in mockData" :key="index">
              <td class="text-center">{{ index + 2 }}</td>
              <td class="text-center">{{ item.wellNo }}</td>
              <td class="text-center">{{ item.primerId }}</td>
              <td class="seq-font">{{ item.sequence }}</td>
              <td class="text-center">{{ item.baseCount }}</td>
              <td class="text-center">{{ item.spec }}</td>
              <td class="text-center">{{ item.purification }}</td>
              <td class="text-center">{{ item.mod5 }}</td>
              <td class="text-center">{{ item.mod3 }}</td>
              <td class="text-center">{{ item.modInner }}</td>
              <td class="text-center">{{ item.thio }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-print="'#machinePrintGrid'" type="success" icon="Printer">上机表打印</el-button>
          <el-button @click="showPrintDialog = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch } from 'vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '合成上机表打印' },
  selectedItems: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const showPrintDialog = ref(false)
const formRef = ref(null)
const form = reactive({
  plateNo: 'yb336',
  company: '北京分公司'
})

const rules = {
  plateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }],
  company: [{ required: true, message: '请选择所属公司', trigger: 'change' }]
}

// 打印数据占位
const mockData = ref([])
const currentDateTime = ref('')

watch(
  () => props.modelValue,
  val => {
    if (val) {
      resetForm()
      const now = new Date()
      currentDateTime.value = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`
    }
  }
)

function resetForm() {
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}

function handleConfirm() {
  formRef.value.validate(valid => {
    if (valid) {
      proxy.$modal.msg('正在拉取上机表数据，生成预览...')
      setTimeout(() => {
        mockData.value = generateMockData()
        showPrintDialog.value = true
      }, 300)
    }
  })
}

function generateMockData() {
  const data = [
    {
      wellNo: 'B1',
      primerId: '944692',
      sequence: 'AATTCGAGCAGTCGTCAAGTGAGAT',
      baseCount: 25,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'C1',
      primerId: '944693',
      sequence: 'GCTTTTATGGTCGTTTGCGAGTTTTGC',
      baseCount: 26,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'D1',
      primerId: '944711',
      sequence: 'TCAGTTTCCTTGGCTACCAGA',
      baseCount: 21,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'E1',
      primerId: '944712',
      sequence: 'TTCCATTACAGTCACTCCAGATGT',
      baseCount: 24,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'F1',
      primerId: '944713',
      sequence: 'TGCCTGCTCTTTACTGAAGG',
      baseCount: 20,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'G1',
      primerId: '944809',
      sequence: 'GAAGAGGTGAGCTCCCCT',
      baseCount: 18,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'H1',
      primerId: '944810',
      sequence: 'GAATTCCTTCTCGTCGTCC',
      baseCount: 19,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'A2',
      primerId: '944811',
      sequence: 'CGGGGAAGAGACGGATGATG',
      baseCount: 20,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'B2',
      primerId: '944812',
      sequence: 'CGCAGCGGGAAATCAATCTG',
      baseCount: 20,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'C2',
      primerId: '944813',
      sequence: 'GGACCGAAGGGAAGAAGCTG',
      baseCount: 20,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'D2',
      primerId: '944814',
      sequence: 'GTTTCGATGGCCTTCATCGC',
      baseCount: 20,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'E2',
      primerId: '944815',
      sequence: 'CAAAGGAGCCGGAAAATTCAAAT',
      baseCount: 23,
      spec: '50',
      purification: 'DSL'
    },
    {
      wellNo: 'F2',
      primerId: '944816',
      sequence: 'CGTCTCACTCTCGGTGTTCA',
      baseCount: 20,
      spec: '50',
      purification: 'DSL'
    }
  ]

  return data.map(item => ({
    ...item,
    mod5: '',
    mod3: '',
    modInner: '',
    thio: ''
  }))
}
</script>

<style scoped>
.selection-info {
  background-color: #f8f8f9;
  padding: 12px 16px;
  border-radius: 4px;
  border-left: 4px solid #67c23a;
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
}

.selection-info .highlight {
  color: #ff4949;
  font-weight: bold;
}

.mt20 {
  margin-top: 20px;
}
.mb20 {
  margin-bottom: 20px;
}

/* ======== 打印专属样式 ======== */
.print-container {
  font-family: 'SimSun', serif;
  width: 100%;
  color: #000;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px dashed #000;
  padding-bottom: 5px;
  margin-bottom: 5px;
}

.header-center h3 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 2px;
}

.header-left,
.header-right {
  font-size: 13px;
  white-space: nowrap;
}

/* 高密度报表表格 */
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed; /* 强制列宽控制 */
}

.report-table th,
.report-table td {
  border: 1px solid #000;
  padding: 4px;
  word-break: break-all;
}

.report-table th {
  background-color: transparent !important;
  font-weight: bold;
  text-align: center;
}

.text-center {
  text-align: center;
}

/* 序列字体适当缩小以适应 */
.seq-font {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  letter-spacing: 0.5px;
}
</style>
