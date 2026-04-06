<template>
  <div class="app-container">
    <dynamic-search ref="searchRef" v-model="queryParams" :fields="searchFields" @search="handleQuery" />

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button size="small" plain icon="Search" @click="toggleSearchPanel">查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Refresh" @click="handleRefresh">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          size="small"
          type="primary"
          plain
          icon="EditPen"
          :disabled="multiple"
          @click="handleOriginConcentration"
          >原浓度</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="success" plain icon="Finished" :disabled="multiple" @click="handleTemplateStatus"
          >模板状态</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="danger" plain icon="RefreshLeft" :disabled="multiple" @click="handleSendBack"
          >退回</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" type="info" plain icon="Histogram" @click="handlePcrGelCut">PCR切胶</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="List" @click="handleResampleList">重抽操作表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button size="small" plain icon="Camera" @click="handleImageSetting">图像设置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" :columns="columns" @query-table="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <dynamic-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      v-loading="loading"
      size="small"
      :header-cell-style="{ fontSize: '12px' }"
      :data="dataList"
      :columns="columns"
      :total="total"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog v-model="open" width="900px" append-to-body top="8vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <EditPen />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">{{ title }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产编号" prop="productionNo">
              <el-input v-model="form.productionNo" placeholder="请输入生产编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="form.orderNo" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitForm">确定</el-button>
          <el-button type="danger" :icon="Close" @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 步骤1：确认生产编号对话框 (仿制截图样式) -->
    <el-dialog v-model="statusConfirmOpen" width="900px" append-to-body top="8vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #409eff; font-size: 20px">
            <List />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">样品备注确认</span>
        </div>
      </template>
      <div style="border: 1px solid #dcdfe6; border-radius: 4px">
        <div
          style="
            background: #f5f7fa;
            padding: 10px;
            border-bottom: 1px solid #dcdfe6;
            font-weight: bold;
            font-size: 14px;
            display: flex;
            align-items: center;
          "
        >
          <el-icon style="margin-right: 5px; color: #409eff">
            <List />
          </el-icon>
          数据列表
        </div>
        <el-table :data="selectedRows" stripe border size="small" style="width: 100%" height="400">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="produceId" label="生产编号" header-align="center" align="left" />
          <el-table-column
            prop="remark"
            label="备注"
            header-align="center"
            align="left"
            min-width="200"
            show-overflow-tooltip
          />
        </el-table>
        <div
          style="
            background: #f5f7fa;
            padding: 5px 15px;
            border-top: 1px solid #dcdfe6;
            font-size: 12px;
            color: #606266;
            text-align: right;
          "
        >
          共 1 页 &gt;&gt; 100 &lt;&lt; 1 - {{ selectedRows.length }} 共 {{ selectedRows.length }} 条
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="proceedToStatusConfig">确定</el-button>
          <el-button type="danger" :icon="Close" @click="statusConfirmOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 步骤2：设置模板状态对话框 (仿制截图样式) -->
    <el-dialog v-model="statusOpen" width="750px" append-to-body top="10vh">
      <template #header>
        <div style="display: flex; align-items: center; padding: 10px 0">
          <el-icon style="margin-right: 8px; color: #67c23a; font-size: 20px">
            <Finished />
          </el-icon>
          <span style="font-weight: bold; font-size: 16px">设置模板状态</span>
        </div>
      </template>
      <el-form :model="statusForm" label-width="120px" class="well-form">
        <!-- 生产编号 -->
        <div class="form-row border-top">
          <div class="form-label" style="width: 140px">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px">{{ selectedProduceIds.join(',') }}</span>
          </div>
        </div>
        <!-- 模板状态 -->
        <div class="form-row">
          <div class="form-label" style="width: 140px">模板状态：</div>
          <div class="form-content">
            <el-form-item label-width="0">
              <el-select v-model="statusForm.returnState" placeholder="请选择" style="width: 250px">
                <el-option label="模板成功" value="模板成功" />
                <el-option label="模板失败" value="模板失败" />
                <el-option label="模板重抽" value="模板重抽" />
                <el-option label="模板重切" value="模板重切" />
              </el-select>
              <el-icon style="margin-left: 10px; color: #f56c6c; font-size: 18px; vertical-align: middle">
                <Warning />
              </el-icon>
            </el-form-item>
          </div>
        </div>
        <!-- 备注 -->
        <div class="form-row border-bottom" style="height: 150px">
          <div class="form-label" style="width: 140px; height: 100%">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center">
            <el-input v-model="statusForm.remark" type="textarea" :rows="5" placeholder="请输入备注内容" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitStatus">确定</el-button>
          <el-button type="danger" :icon="Close" @click="statusOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置原浓度对话框 (仿制截图样式) -->
    <el-dialog v-model="concOpen" title="设置原浓度" width="750px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center">
          <el-icon style="margin-right: 8px; color: #409eff">
            <EditPen />
          </el-icon>
          <span>设置原浓度</span>
        </div>
      </template>
      <el-form ref="concFormRef" :model="concForm" :rules="concRules" label-width="120px" class="well-form">
        <!-- 生产编号展示 -->
        <div class="form-row border-top">
          <div class="form-label" style="width: 140px">生产编号：</div>
          <div class="form-content">
            <span style="font-size: 13px"
              >选中数量：<span style="color: #409eff; font-weight: bold">{{ selectedRows.length }}</span
              >，选中生产编号：{{ selectedProduceIds.join(', ') }}</span
            >
          </div>
        </div>
        <!-- 原浓度输入 -->
        <div class="form-row">
          <div class="form-label" style="width: 140px">原浓度：</div>
          <div class="form-content">
            <el-form-item prop="originConcentration" label-width="0">
              <el-select
                v-model="concForm.originConcentration"
                placeholder="请选择或输入原浓度"
                filterable
                allow-create
                style="width: 250px"
              >
                <el-option label="0.3" value="0.3" />
                <el-option label="0.5" value="0.5" />
                <el-option label="0.7" value="0.7" />
                <el-option label="1.0" value="1.0" />
                <el-option label="1.5" value="1.5" />
                <el-option label="2.0" value="2.0" />
                <el-option label="3.0" value="3.0" />
                <el-option label="5.0" value="5.0" />
              </el-select>
              <el-icon style="margin-left: 10px; color: #f56c6c; font-size: 18px; vertical-align: middle">
                <Warning />
              </el-icon>
            </el-form-item>
          </div>
        </div>
        <!-- 机器类型 -->
        <div class="form-row">
          <div class="form-label" style="width: 140px">机器类型：</div>
          <div class="form-content">
            <el-radio-group v-model="concForm.machineType">
              <el-radio label="192">192</el-radio>
            </el-radio-group>
          </div>
        </div>
        <!-- 排版方式 -->
        <div class="form-row">
          <div class="form-label" style="width: 140px">排版方式：</div>
          <div class="form-content">
            <el-radio-group v-model="concForm.templateStype">
              <el-radio label="横排">横排</el-radio>
              <el-radio label="竖排">竖排</el-radio>
              <el-radio label="机器竖排">机器竖排</el-radio>
            </el-radio-group>
          </div>
        </div>
        <!-- 板号 -->
        <div class="form-row">
          <div class="form-label" style="width: 140px">板号：</div>
          <div class="form-content">
            <el-form-item prop="plateNo" label-width="0">
              <el-input v-model="concForm.plateNo" placeholder="请输入板号" style="width: 250px" />
            </el-form-item>
          </div>
        </div>
        <!-- 备注 -->
        <div class="form-row border-bottom" style="height: 150px">
          <div class="form-label" style="width: 140px; height: 100%">备注：</div>
          <div class="form-content" style="height: 100%; padding: 10px; display: flex; align-items: center">
            <el-input v-model="concForm.remark" type="textarea" :rows="5" placeholder="请输入备注内容" />
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitConc">确定</el-button>
          <el-button type="danger" :icon="Close" @click="concOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- PCR切胶设置对话框 -->
    <el-dialog v-model="pcrOpen" title="PCR切胶" width="800px" append-to-body>
      <template #header>
        <div style="display: flex; align-items: center">
          <el-icon style="margin-right: 8px; color: #67c23a">
            <Plus />
          </el-icon>
          <span>PCR切胶</span>
        </div>
      </template>
      <el-form :model="pcrForm" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">起始订单：</div>
          <div class="form-content">
            <el-input v-model="pcrForm.startOrderNo" placeholder="请输入起始订单" style="width: 200px" />
          </div>
          <div class="form-label" style="border-left: 1px solid #ebeef5">结束订单：</div>
          <div class="form-content">
            <el-input v-model="pcrForm.endOrderNo" placeholder="请输入结束订单" style="width: 200px" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">所属公司：</div>
          <div class="form-content">
            <el-select v-model="pcrForm.belongCompany" placeholder="请选择" style="width: 200px" clearable>
              <el-option label="有康科技" value="有康科技" />
              <el-option label="深圳有康" value="深圳有康" />
              <el-option label="杭州有康" value="杭州有康" />
            </el-select>
          </div>
          <div class="form-label" style="border-left: 1px solid #ebeef5"></div>
          <div class="form-content"></div>
        </div>
        <div class="form-row border-bottom" style="justify-content: center; height: 60px">
          <el-button type="default" icon="Printer" style="border-radius: 20px" @click="handlePrintPcr">
            打印PCR切胶
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="pcrOpen = false">确定</el-button>
          <el-button type="danger" :icon="Close" @click="pcrOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- PCR切胶报表预览对话框 -->
    <el-dialog v-model="pcrReportOpen" title="PCR切胶报表预览" width="1000px" append-to-body>
      <div id="pcrPrintArea" class="pcr-report-container">
        <el-row :gutter="20">
          <el-col v-for="index in 2" :key="index" :span="12">
            <table class="report-table">
              <thead>
                <tr>
                  <th>客户姓名</th>
                  <th>生产编号</th>
                  <th>样品编号</th>
                  <th>片段大小</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pcrDataList.slice((index - 1) * 15, index * 15)" :key="row.produceId">
                  <td>{{ row.customerName }}</td>
                  <td>{{ row.produceId }}</td>
                  <td>{{ row.sampleId }}</td>
                  <td>{{ row.fragmentSize }}</td>
                </tr>
              </tbody>
            </table>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button v-print="'#pcrPrintArea'" type="success" :icon="Printer">立即打印</el-button>
          <el-button type="danger" :icon="Close" @click="pcrReportOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重抽操作表设置对话框 -->
    <el-dialog v-model="resampleOpen" width="750px" append-to-body top="10vh">
      <template #header>
        <div style="display: flex; align-items: center">
          <el-icon style="margin-right: 8px; color: #409eff">
            <Plus />
          </el-icon>
          <span>重抽操作表</span>
        </div>
      </template>
      <el-form :model="resampleForm" label-width="120px" class="well-form">
        <div class="form-row border-top">
          <div class="form-label">模板板号：</div>
          <div class="form-content">
            <el-input v-model="resampleForm.templatePlateNos" placeholder="请输入模板板号" style="width: 300px" />
            <span style="margin-left: 10px; color: #909399; font-size: 12px">多个板号之间用逗号隔开</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-label">所属实验室：</div>
          <div class="form-content">
            <el-select v-model="resampleForm.belongLab" placeholder="请选择" style="width: 200px" clearable>
              <el-option label="厦门实验室" value="厦门实验室" />
              <el-option label="上海实验室" value="上海实验室" />
              <el-option label="北京实验室" value="北京实验室" />
            </el-select>
          </div>
          <div class="form-label" style="border-left: 1px solid #ebeef5">报表类型：</div>
          <div class="form-content">
            <el-radio-group v-model="resampleForm.reportType">
              <el-radio label="重抽操作表">重抽操作表</el-radio>
              <el-radio label="重抽标签">重抽标签</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="submitResample">确定</el-button>
          <el-button type="danger" :icon="Close" @click="resampleOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重抽操作表预览对话框 -->
    <el-dialog v-model="resampleReportOpen" title="重抽操作表预览" width="1200px" append-to-body>
      <div id="resamplePrintArea" class="pcr-report-container">
        <div style="text-align: center; margin-bottom: 20px">
          <h2 style="margin: 0; font-size: 20px">铂尚生物技术（上海）有限公司</h2>
          <div style="font-size: 14px; margin-top: 5px; font-weight: bold">模板重抽接菌记录</div>
          <div style="text-align: right; color: #f56c6c; font-size: 14px; margin-top: -20px">锐浪报表工具6</div>
        </div>
        <table class="report-table">
          <thead>
            <tr>
              <th>生产编号</th>
              <th>原孔号</th>
              <th>客户姓名</th>
              <th>返回状态</th>
              <th>样本类型</th>
              <th>样品编号</th>
              <th>载体名称</th>
              <th>抗生素类型</th>
              <th>样品位置</th>
              <th>样品备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in resampleDataList" :key="index">
              <td>{{ row.produceId }}</td>
              <td>{{ row.originHoleNo }}</td>
              <td>{{ row.customerName }}</td>
              <td>{{ row.returnState }}</td>
              <td>{{ row.sampleType }}</td>
              <td>{{ row.sampleId }}</td>
              <td>{{ row.carrierName }}</td>
              <td>{{ row.antibioticType }}</td>
              <td>{{ row.samplePosition }}</td>
              <td>{{ row.remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button v-print="'#resamplePrintArea'" type="success" :icon="Printer">立即打印</el-button>
          <el-button type="danger" :icon="Close" @click="resampleReportOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 模板状态快速设置 (图像设置) -->
    <el-dialog v-model="imageSettingOpen" title="模板状态快速设置" width="1120px" append-to-body>
      <div class="quick-setting-wrap">
        <div class="top-ops">
          <div class="op-item">
            <span>填写板号：</span>
            <el-input v-model="quickPlateNo" placeholder="请输入板号" style="width: 180px" clearable />
            <el-button icon="Search" class="ml10" @click="handleSearchPlate">查 询</el-button>
            <el-button icon="Grid" class="ml10" @click="handleFullSelect">全 选</el-button>
            <el-button icon="CircleClose" class="ml10" @click="handleFullDeselect">取消全选</el-button>
          </div>
        </div>

        <div class="plate-title">查询结果：</div>

        <div class="plate-table-container">
          <table class="plate-table">
            <thead>
              <tr>
                <th width="80">模板状态</th>
                <th v-for="c in 12" :key="c">{{ c }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']" :key="r">
                <td class="row-label">{{ r }}</td>
                <td v-for="c in 12" :key="c" :class="getWellClass(r, c)" @click="toggleWellSelect(r, c)">
                  <div class="well-cell">
                    <span v-if="plateHoleMap[r + c]" class="well-id">
                      {{ plateHoleMap[r + c].produceId ? plateHoleMap[r + c].produceId.toString().slice(-4) : '' }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bottom-batch-form">
          <div class="batch-row">
            <div class="batch-item">
              <span>模板状态：</span>
              <el-select v-model="quickForm.returnState" placeholder="请选择" style="width: 140px">
                <el-option label="模板成功" value="模板成功" />
                <el-option label="模板失败" value="模板失败" />
                <el-option label="模板重抽" value="模板重抽" />
                <el-option label="模板重切" value="模板重切" />
              </el-select>
            </div>
            <div class="batch-item">
              <span>原浓度：</span>
              <el-select v-model="quickForm.originConcentration" placeholder="请选择" style="width: 140px">
                <el-option label="0.3" value="0.3" />
                <el-option label="0.5" value="0.5" />
                <el-option label="1.0" value="1.0" />
                <el-option label="2.0" value="2.0" />
              </el-select>
            </div>
            <div class="batch-item flex-fill">
              <span>备注：</span>
              <el-input v-model="quickForm.remark" placeholder="备注内容" style="width: 100%" />
            </div>
            <el-button type="success" :icon="Check" style="height: 32.5px" @click="handleBatchSubmit">提 交</el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="success" :icon="Check" @click="imageSettingOpen = false">确定</el-button>
          <el-button type="danger" :icon="Close" @click="imageSettingOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Production">
import { ref, reactive, toRefs, computed, watch, onMounted, onActivated, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import { Check, Close } from '@element-plus/icons-vue'
import {
  listProduceList,
  getProduction,
  addProduction,
  updateProduction,
  delProduction,
  updateProduceTempStatus,
  updateProduceOriginConcentration,
  sendBackProduce,
  getResampleList,
  getUserTemplateHole
} from '@/api/sequencing/production'
import { queryByRange } from '@/api/sequencing/order'
import DynamicTable from '@/components/DynamicTable/index.vue'
import DynamicSearch from '@/components/DynamicSearch/index.vue'

// --- 1. Constants & Config ---
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')
const route = useRoute()
const cacheKey = 'sequencing_production_columns_visible'

const columns = ref([
  { type: 'selection', minWidth: 50, fixed: true, visible: true },
  { key: 'produceId', label: '生产编号', minWidth: 120, fixed: true, sortable: true, visible: true },
  { key: 'orderId', label: '订单号', minWidth: 150, fixed: true, sortable: true, visible: true },
  { key: 'customerName', label: '客户姓名', minWidth: 110, fixed: true, visible: true },
  { key: 'customerAddress', label: '客户地址', minWidth: 180, showOverflowTooltip: true, visible: true },
  { key: 'customerLevel', label: '客户等级', minWidth: 90, visible: true },
  { key: 'groupName', label: '课题组', minWidth: 140, showOverflowTooltip: true, visible: true },
  { key: 'samplePosition', label: '样品对应号', minWidth: 110, visible: true },
  { key: 'sampleId', label: '样品编号', minWidth: 130, visible: true },
  { key: 'primer', label: '测序引物', minWidth: 110, visible: true },
  { key: 'primerConcentration', label: '引物浓度', minWidth: 90, visible: true },
  { key: 'sampleType', label: '样品类型', minWidth: 100, visible: true },
  { key: 'carrierName', label: '载体名称', minWidth: 120, visible: true },
  { key: 'antibioticType', label: '抗生素类型', minWidth: 110, visible: true },
  { key: 'templatePlateNo', label: '模板板号', minWidth: 110, visible: true },
  { key: 'templateHoleNo', label: '模板孔号', minWidth: 100, visible: true },
  { key: 'returnState', label: '返回状态', minWidth: 110, visible: true },
  { key: 'originHoleNo', label: '原孔号', minWidth: 100, visible: true },
  { key: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true, visible: true }
])

const searchFields = ref([
  { prop: 'templateNo', label: '板号', type: 'input' },
  { prop: 'orderId', label: '订单号', type: 'input' },
  { prop: 'customerName', label: '客户姓名', type: 'input' },
  { prop: 'sampleId', label: '样品编号', type: 'input' }
])

const concRules = {
  originConcentration: [{ required: true, message: '请输入或选择原浓度', trigger: 'change' }]
}

// --- 2. State & Forms ---
const searchRef = ref(null)
const dataList = ref([])
const total = ref(0)
const loading = ref(true)
const showSearch = ref(true)
const open = ref(false)
const title = ref('')
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const selectedRows = ref([])

// 弹窗状态控制器
const imageSettingOpen = ref(false)
const statusConfirmOpen = ref(false)
const statusOpen = ref(false)
const concOpen = ref(false)
const pcrOpen = ref(false)
const pcrReportOpen = ref(false)
const resampleOpen = ref(false)
const resampleReportOpen = ref(false)

// 表单数据
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateNo: undefined,
    orderId: undefined,
    customerName: undefined,
    sampleId: undefined,
    sampleType: undefined,
    createUser: undefined
  },
  rules: {
    productionNo: [{ required: true, message: '生产编号不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

const statusForm = ref({})
const concForm = ref({})
const pcrForm = ref({})
const resampleForm = ref({})

// 报表与图像设置数据
const pcrDataList = ref([])
const resampleDataList = ref([])
const quickPlateNo = ref('')
const plateHoleMap = ref({}) // 孔位数据映射 { 'A1': row }
const selectedWells = ref(new Set())
const quickForm = reactive({
  returnState: '模板成功',
  originConcentration: '',
  remark: ''
})

const reportMeta = reactive({
  user: 'ADMIN',
  time: ''
})

// 初始化列显隐缓存
const savedColumns = localStorage.getItem(cacheKey)
if (savedColumns) {
  try {
    const cache = JSON.parse(savedColumns)
    columns.value.forEach(col => {
      const key = col.key || col.prop || col.type
      if (key && cache[key] !== undefined) col.visible = cache[key]
    })
  } catch (e) {}
}

// --- 3. Computed ---
const selectedProduceIds = computed(() => selectedRows.value.map(r => r.produceId))

// --- 4. Methods ---

/** 查询列表 */
function getList() {
  loading.value = true
  listProduceList(queryParams.value)
    .then(response => {
      const res = response.data || response
      const finalData = res.data && res.data.rows ? res.data : res
      dataList.value = finalData.rows || []
      total.value = finalData.total || 0
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

/** 搜索 & 通用操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

function toggleSearchPanel() {
  searchRef.value?.toggleCollapse()
}

function handleSelectionChange(selection) {
  selectedRows.value = selection
  ids.value = selection.map(item => item.produceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 基础 CRUD */
function reset() {
  form.value = {
    id: undefined,
    productionNo: undefined,
    orderNo: undefined,
    remark: undefined
  }
  proxy.resetForm('formRef')
}

function cancel() {
  open.value = false
  reset()
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '添加模板生产'
}

function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getProduction(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改模板生产'
  })
}

function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateProduction(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addProduction(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  const idList = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除编号为"' + idList + '"的数据项？')
    .then(() => {
      return delProduction(idList)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

function handleExport() {
  proxy.download(
    'sequencing/production/export',
    {
      ...queryParams.value
    },
    `production_${new Date().getTime()}.xlsx`
  )
}

/** 业务操作 - 原浓度设置 */
function handleOriginConcentration() {
  if (ids.value.length === 0) return
  concForm.value = {
    produceIdList: ids.value,
    originConcentration: '',
    machineType: '192',
    templateStype: '横排',
    plateNo: '',
    remark: ''
  }
  concOpen.value = true
}

function submitConc() {
  proxy.$refs['concFormRef'].validate(valid => {
    if (valid) {
      updateProduceOriginConcentration(concForm.value).then(() => {
        proxy.$modal.msgSuccess('设置成功')
        concOpen.value = false
        getList()
      })
    }
  })
}

/** 业务操作 - 模板状态 */
function handleTemplateStatus() {
  if (ids.value.length === 0) return
  statusConfirmOpen.value = true
}

function proceedToStatusConfig() {
  statusConfirmOpen.value = false
  statusForm.value = {
    produceIdList: ids.value,
    returnState: '模板成功',
    remark: undefined
  }
  statusOpen.value = true
}

function submitStatus() {
  updateProduceTempStatus(statusForm.value).then(() => {
    proxy.$modal.msgSuccess('设置成功')
    statusOpen.value = false
    getList()
  })
}

/** 业务操作 - 退回 */
function handleSendBack() {
  if (ids.value.length === 0) {
    proxy.$modal.msgWarning('请选择需要操作的样品')
    return
  }
  proxy.$modal
    .confirm('注意：确认退回后，所选样品的模板板号将被清空。确认退回吗？')
    .then(() => {
      loading.value = true
      sendBackProduce({
        produceIdList: ids.value,
        returnState: '模板退回',
        remark: '质量问题退回'
      })
        .then(() => {
          proxy.$modal.msgSuccess('退回成功')
          getList()
        })
        .catch(() => {
          loading.value = false
        })
    })
    .catch(() => {})
}

/** 业务操作 - PCR切胶 */
function handlePcrGelCut() {
  pcrForm.value = {
    startOrderNo: undefined,
    endOrderNo: undefined,
    belongCompany: ''
  }
  pcrOpen.value = true
}

function handlePrintPcr() {
  proxy.$modal.loading('请求中...')
  const params = {
    startOrderId: pcrForm.value.startOrderNo,
    endOrderId: pcrForm.value.endOrderNo,
    belongCompany: pcrForm.value.belongCompany,
    produceCompany: pcrForm.value.belongCompany // 保持同值以兼容后端
  }
  queryByRange(params)
    .then(response => {
      const res = response.data || response
      pcrDataList.value = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
      pcrReportOpen.value = true
      proxy.$modal.closeLoading()
    })
    .catch(() => {
      proxy.$modal.closeLoading()
    })
}

/** 业务操作 - 重抽操作表 */
function handleResampleList() {
  resampleForm.value = {
    templatePlateNos: undefined,
    belongLab: '实验室',
    reportType: '重抽操作表'
  }
  resampleOpen.value = true
}

function submitResample() {
  proxy.$modal.loading('请求中...')
  const params = {
    ...resampleForm.value,
    belongLab: ''
  }
  getResampleList(params)
    .then(response => {
      const res = response.data || response
      resampleDataList.value = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
      resampleReportOpen.value = true
      proxy.$modal.closeLoading()
    })
    .catch(() => {
      proxy.$modal.closeLoading()
    })
}

/** 业务操作 - 图像设置 (快速状态设置) */
function handleImageSetting() {
  imageSettingOpen.value = true
  quickPlateNo.value = ''
  plateHoleMap.value = {}
  selectedWells.value = new Set()
}

function handleSearchPlate() {
  if (!quickPlateNo.value) {
    proxy.$modal.msgWarning('请填写板号')
    return
  }
  loading.value = true
  getUserTemplateHole({ templatePlateNo: quickPlateNo.value })
    .then(response => {
      const data = response.data || response || []
      const map = {}
      data.forEach(item => {
        if (item.templateHoleNo) map[item.templateHoleNo] = item
      })
      plateHoleMap.value = map
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

function toggleWellSelect(r, c) {
  const addr = r + c
  if (!plateHoleMap.value[addr]) return
  const newSet = new Set(selectedWells.value)
  if (newSet.has(addr)) newSet.delete(addr)
  else newSet.add(addr)
  selectedWells.value = newSet
}

function getWellClass(r, c) {
  const addr = r + c
  return {
    'well-td': true,
    'has-data': !!plateHoleMap.value[addr],
    'is-selected': selectedWells.value.has(addr)
  }
}

function handleFullSelect() {
  const newSet = new Set()
  Object.keys(plateHoleMap.value).forEach(addr => newSet.add(addr))
  selectedWells.value = newSet
}

function handleFullDeselect() {
  selectedWells.value = new Set()
}

function handleBatchSubmit() {
  if (selectedWells.value.size === 0) {
    proxy.$modal.msgWarning('请选择需要设置的孔位')
    return
  }
  const produceIds = Array.from(selectedWells.value).map(addr => plateHoleMap.value[addr].produceId)
  proxy.$modal.loading('提交中...')
  const p1 = updateProduceTempStatus({
    produceIdList: produceIds,
    returnState: quickForm.returnState,
    remark: quickForm.remark
  })
  let p2 = Promise.resolve()
  if (quickForm.originConcentration) {
    p2 = updateProduceOriginConcentration({
      produceIdList: produceIds,
      originConcentration: quickForm.originConcentration,
      remark: quickForm.remark
    })
  }
  Promise.all([p1, p2])
    .then(() => {
      proxy.$modal.msgSuccess('批量设置成功')
      proxy.$modal.closeLoading()
      handleSearchPlate()
      getList()
    })
    .catch(() => {
      proxy.$modal.closeLoading()
    })
}

// --- 5. Lifecycle Hooks ---
let isInitialActivated = true
onMounted(() => {
  getList()
})

onActivated(() => {
  if (!isInitialActivated) {
    getList()
  }
  isInitialActivated = false
})

// --- 6. Watchers ---
watch(
  columns,
  newVal => {
    const cache = {}
    newVal.forEach(col => {
      if (col.key || col.prop) cache[col.key || col.prop] = col.visible
    })
    localStorage.setItem(cacheKey, JSON.stringify(cache))
  },
  { deep: true }
)
</script>

<style scoped>
:deep(.el-table .el-table__header-wrapper th) {
  font-size: 12px !important;
  color: #606266 !important;
}

.well-form {
  border: 1px solid #dcdfe6;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.form-label {
  width: 120px;
  padding: 10px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: bold;
  font-size: 13px;
  border-right: 1px solid #ebeef5;
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

:deep(.well-form .el-form-item) {
  margin-bottom: 0px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table th,
.report-table td {
  border: 1px solid #333;
  padding: 4px;
  text-align: center;
}

.report-table th {
  background-color: #f2f2f2;
}

.pcr-report-container {
  padding: 20px;
  background-color: #fff;
}

.quick-setting-wrap {
  padding: 10px;
}

.top-ops {
  margin-bottom: 20px;
  background: #fdfdfd;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.op-item {
  display: flex;
  align-items: center;
}

.plate-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 5px;
  border-left: 4px solid #409eff;
}

.plate-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.plate-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border: 2px solid #555;
}

.plate-table th,
.plate-table td {
  border: 1px solid #ccc;
  text-align: center;
  height: 45px;
}

.plate-table th {
  background: #f5f7fa;
  font-size: 14px;
}

.row-label {
  background: #f5f7fa;
  font-weight: bold;
}

.well-td {
  cursor: pointer;
  transition: all 0.2s;
}

.well-td.has-data {
  background: #f0f9eb;
}

.well-td.is-selected {
  background: #409eff !important;
  color: #fff;
}

.well-td:hover:not(.is-selected) {
  background: #ecf5ff;
}

.well-cell {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.well-id {
  font-size: 11px;
}

.bottom-batch-form {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background: #f8f9fa;
}

.batch-row {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.batch-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.flex-fill {
  flex: 1;
}

.ml10 {
  margin-left: 10px;
}
</style>
