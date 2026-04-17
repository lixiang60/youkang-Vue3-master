<template>
  <el-dialog v-model="visible" title="合成分装表打印" width="600px" append-to-body @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 类似图1的排版 -->
      <el-row :gutter="20">
        <el-col :span="18">
          <el-form-item label="板号:" prop="plateNo">
            <el-input v-model="form.plateNo" placeholder="请输入板号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-button style="width: 100%" type="success" plain icon="Printer" @click="handlePrintPreview">
            分装打印
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="success" icon="Check" @click="handleConfirm">确 定</el-button>
        <el-button type="danger" icon="Close" @click="handleClose">取 消</el-button>
      </div>
    </template>

    <!-- 打印预览弹窗 -->
    <el-dialog v-model="showPrintDialog" title="合成分装表打印预览" width="1000px" append-to-body top="5vh">
      <div id="aliquotPrintGrid" class="print-container">
        <!-- 表头 -->
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

        <!-- 96孔方格区 (图2高度还原) -->
        <table class="report-table">
          <tbody>
            <tr v-for="(row, rowIndex) in gridData" :key="rowIndex">
              <td v-for="(cell, colIndex) in row" :key="colIndex" :class="{ 'empty-cell': !cell.wellNo }">
                <template v-if="cell.wellNo">
                  <div class="cell-well" style="background-color: #00ff00">{{ cell.wellNo }}</div>
                  <div class="cell-id">{{ cell.id }}</div>
                  <div class="cell-spec">{{ cell.spec }}</div>
                  <div class="cell-val" style="background-color: #ffff00">{{ cell.val }}</div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button v-print="'#aliquotPrintGrid'" type="success" icon="Printer">确认打印 / 导出</el-button>
          <el-button @click="showPrintDialog = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup name="AliquotPrintDialog">
import { ref, reactive, computed, getCurrentInstance, watch } from 'vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const showPrintDialog = ref(false)
const currentDateTime = ref('')

const formRef = ref(null)
const form = reactive({
  plateNo: 'yb336'
})

const rules = reactive({
  plateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }]
})

const gridData = ref([])

watch(visible, val => {
  if (val) {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    form.plateNo = 'yb336'

    const now = new Date()
    currentDateTime.value = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`
  }
})

function handleClose() {
  visible.value = false
}

function handleConfirm() {
  proxy.$modal.msgSuccess('板号设定已记录')
  handleClose()
}

function handlePrintPreview() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      // 生成图2的高保真占位数据
      generateMockGrid()
      showPrintDialog.value = true
    }
  })
}

// 模拟生成 12列 x n行 的二维数组数据
function generateMockGrid() {
  const mockFlatData = [
    // Row 1
    { wellNo: 'B01', id: '944692', spec: '1*2', val: '8.8' },
    { wellNo: 'C01', id: '944693', spec: '1*2', val: '8.5' },
    { wellNo: 'D01', id: '944711', spec: '1*4', val: '13.3' },
    { wellNo: 'E01', id: '944712', spec: '1*4', val: '11.6' },
    { wellNo: 'F01', id: '944713', spec: '1*4', val: '14.4' },
    { wellNo: 'G01', id: '944809', spec: '1*2', val: '15.1' },
    { wellNo: 'H01', id: '944810', spec: '1*2', val: '15.6' },
    { wellNo: 'A02', id: '944811', spec: '1*2', val: '13.6' },
    { wellNo: 'B02', id: '944812', spec: '1*2', val: '11.4' },
    { wellNo: 'C02', id: '944813', spec: '1*2', val: '12.2' },
    { wellNo: 'D02', id: '944814', spec: '1*2', val: '15' },
    { wellNo: 'E02', id: '944815', spec: '1*2', val: '10' },
    // Row 2
    { wellNo: 'F02', id: '944816', spec: '1*2', val: '13.9' },
    { wellNo: 'G02', id: '944817', spec: '1*2', val: '13.3' },
    { wellNo: 'H02', id: '944818', spec: '1*2', val: '13.2' },
    { wellNo: 'A03', id: '944819', spec: '1*2', val: '14.5' },
    { wellNo: 'B03', id: '944820', spec: '1*2', val: '14.9' },
    { wellNo: 'C03', id: '944877', spec: '1*2', val: '14.3' },
    { wellNo: 'D03', id: '944886', spec: '2*1', val: '22.1' },
    { wellNo: 'E03', id: '944887', spec: '2*1', val: '17' },
    { wellNo: 'F03', id: '944888', spec: '2*1', val: '25.9' },
    { wellNo: 'G03', id: '944889', spec: '2*1', val: '25.3' },
    { wellNo: 'H03', id: '944900', spec: '2*1', val: '18.8' },
    { wellNo: 'A04', id: '944901', spec: '2*1', val: '21.6' },
    // Row 3
    { wellNo: 'B04', id: '944902', spec: '2*1', val: '18.7' },
    { wellNo: 'C04', id: '944903', spec: '2*1', val: '19.8' },
    { wellNo: 'D04', id: '944904', spec: '2*1', val: '25.9' },
    { wellNo: 'E04', id: '944905', spec: '2*1', val: '24.5' },
    { wellNo: 'F04', id: '944906', spec: '2*1', val: '25.7' },
    { wellNo: 'G04', id: '944907', spec: '2*1', val: '24.5' },
    { wellNo: 'A05', id: '944948', spec: '4*1', val: '27.7' },
    { wellNo: 'B05', id: '944949', spec: '4*1', val: '56.8' },
    { wellNo: 'C05', id: '944950', spec: '4*1', val: '35.3' },
    { wellNo: 'D05', id: '944951', spec: '4*1', val: '26' },
    { wellNo: 'E05', id: '944958', spec: '4*1', val: '26' },
    { wellNo: 'F05', id: '944959', spec: '4*1', val: '28.3' },
    // Row 4
    { wellNo: 'G05', id: '944960', spec: '4*1', val: '31.3' },
    { wellNo: 'H05', id: '944995', spec: '2*2', val: '21.4' },
    { wellNo: 'A06', id: '944999', spec: '1*2', val: '14.5' },
    { wellNo: 'B06', id: '945013', spec: '1*2', val: '14.3' },
    { wellNo: 'C06', id: '945245', spec: '1*5', val: '13.7' },
    { wellNo: 'D06', id: '945246', spec: '1*5', val: '14.3' },
    { wellNo: 'E06', id: '945247', spec: '1*5', val: '12.8' },
    { wellNo: 'F06', id: '945248', spec: '1*5', val: '12.4' },
    { wellNo: 'G06', id: '945249', spec: '1*5', val: '14.2' },
    { wellNo: 'H06', id: '945250', spec: '1*5', val: '12.5' },
    { wellNo: '', id: '', spec: '', val: '' },
    { wellNo: '', id: '', spec: '', val: '' }
  ]

  // 按12列分割为二维数组
  const cols = 12
  const matrix = []
  for (let i = 0; i < mockFlatData.length; i += cols) {
    matrix.push(mockFlatData.slice(i, i + cols))
  }
  gridData.value = matrix
}
</script>

<style scoped>
/* ======== 打印专属样式 ======== */
.print-container {
  font-family: 'SimSun', serif;
  width: 100%;
  color: #000;
  padding: 10px;
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

/* 高密度报表方块区 */
.report-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 强制等宽列控制 */
  border: 1px solid #000;
}

.report-table td {
  border: 1px solid #000;
  padding: 0;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  font-family: 'Arial', sans-serif;
  vertical-align: top;
}

.report-table .empty-cell {
  background-color: #fff;
}

/* 单元格内的四个分层 */
.cell-well {
  padding: 2px 0;
  border-bottom: 1px solid #000;
}
.cell-id {
  padding: 2px 0;
  font-size: 11px;
}
.cell-spec {
  padding: 2px 0;
  font-size: 11px;
}
.cell-val {
  padding: 2px 0;
  border-top: 1px solid #000;
}
</style>
