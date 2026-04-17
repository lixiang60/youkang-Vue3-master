<template>
  <el-dialog v-model="visible" title="合成机器分装表打印" width="600px" append-to-body @close="handleClose">
    <!-- 1. 输入表单区 -->
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-row :gutter="20" align="middle">
        <el-col :span="14">
          <el-form-item label="板号:" prop="plateNo">
            <el-input v-model="form.plateNo" placeholder="请输入板号" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-button style="width: 100%" type="primary" plain icon="Printer" @click="handlePrintPreview">
            机器分装表打印
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

    <!-- 2. 隐藏的打印预览区 (高度还原图2样式) -->
    <el-dialog
      v-model="showPrintDialog"
      title="机器分装报表预览"
      width="900px"
      append-to-body
      class="print-preview-dialog"
    >
      <div id="machineAliquotPrintArea" class="print-container">
        <h2 style="text-align: center; margin-bottom: 20px">机器分装报表 ({{ form.plateNo }})</h2>
        <table class="machine-report-table">
          <thead>
            <tr>
              <th width="80">孔号</th>
              <th>引物名称</th>
              <th width="100">分装管数</th>
              <th width="100">分装体积</th>
              <th width="120">基因名称</th>
              <th width="100">加水量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in reportData" :key="index">
              <td align="center">{{ item.wellNo }}</td>
              <td>{{ item.primerName }}</td>
              <td align="center">{{ item.tubes }}</td>
              <td align="center">{{ item.volume }}</td>
              <td>{{ item.geneName }}</td>
              <td>{{ item.water }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button v-print="'#machineAliquotPrintArea'" type="success" icon="Printer">确认打印 / 导出</el-button>
          <el-button @click="showPrintDialog = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup name="AliquotMachineDialog">
import { ref, reactive, watch, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// ================= 1. State ==============================
const visible = ref(false)
const showPrintDialog = ref(false)
const formRef = ref(null)

const form = reactive({
  plateNo: ''
})

const rules = reactive({
  plateNo: [{ required: true, message: '请输入板号', trigger: 'blur' }]
})

const reportData = ref([])

// ================= 2. Watchers ===========================
watch(
  () => props.modelValue,
  val => {
    visible.value = val
    if (val) {
      form.plateNo = 'yb336' // 默认值演示
    }
  }
)

watch(visible, val => {
  emit('update:modelValue', val)
})

// ================= 3. Methods ============================
function handleClose() {
  visible.value = false
}

function handleConfirm() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      visible.value = false
    }
  })
}

function handlePrintPreview() {
  proxy.$refs.formRef.validate(valid => {
    if (valid) {
      // 模拟图2的数据
      reportData.value = [
        { wellNo: 'B01', primerName: '1-alpha-H上引', tubes: '2', volume: '8.8', geneName: '', water: '' },
        { wellNo: 'C01', primerName: '2-alpha-H下引', tubes: '2', volume: '8.5', geneName: '', water: '' },
        { wellNo: 'D01', primerName: 'Nlrp3-WT-F-PCR', tubes: '4', volume: '13.3', geneName: '', water: '' },
        { wellNo: 'E01', primerName: 'Nlrp3-Common-PCR', tubes: '4', volume: '11.6', geneName: '', water: '' },
        { wellNo: 'F01', primerName: 'Nlrp3-Mut-F-PCR', tubes: '4', volume: '14.4', geneName: '', water: '' },
        { wellNo: 'G01', primerName: 'IGF2BP2-Y-F', tubes: '2', volume: '15.1', geneName: '', water: '' },
        { wellNo: 'H01', primerName: 'IGF2BP2-Y-R', tubes: '2', volume: '15.6', geneName: '', water: '' },
        { wellNo: 'A02', primerName: 'IGF2BP2-F', tubes: '2', volume: '13.6', geneName: '', water: '' },
        { wellNo: 'B02', primerName: 'IGF2BP2-R', tubes: '2', volume: '11.4', geneName: '', water: '' },
        { wellNo: 'C02', primerName: 'IGF2BP1-F', tubes: '2', volume: '12.2', geneName: '', water: '' },
        { wellNo: 'D02', primerName: 'IGF2BP1-R', tubes: '2', volume: '15', geneName: '', water: '' },
        { wellNo: 'E02', primerName: 'IGF2BP1-miR124-F', tubes: '2', volume: '10', geneName: '', water: '' }
      ]
      showPrintDialog.value = true
    }
  })
}
</script>

<style scoped>
.print-container {
  padding: 20px;
  background-color: #fff;
  color: #000;
}

.machine-report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.machine-report-table th,
.machine-report-table td {
  border: 1px solid #000;
  padding: 8px;
  min-height: 30px;
}

.machine-report-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

@media print {
  .print-container {
    padding: 0;
  }
  .machine-report-table {
    border: 2px solid #000;
  }
}
</style>
