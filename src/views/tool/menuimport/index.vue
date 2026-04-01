<template>
  <div class="app-container">
    <el-card shadow="never" header="菜单批量导入工具" style="border: none">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold; font-size: 16px">
            <i class="el-icon-document-add" style="margin-right: 8px"></i>
            菜单批量导入工具 (JSON Paste)
          </span>
          <el-button type="info" link @click="loadTemplate">加载示例模板</el-button>
        </div>
      </template>

      <el-alert
        title="快速导入指南"
        type="info"
        description="将你在 文档 或 聊天中 生成的 JSON 菜单配置直接粘贴到下方输入框中。支持单条记录或 [{}, {}] 格式的列表。"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form label-position="top">
        <el-form-item label="配置 JSON 内容">
          <el-input
            v-model="jsonContent"
            type="textarea"
            :rows="18"
            placeholder='请输入 JSON 内容，例如：
{
  "parentId": 2018,
  "menuName": "反应生产",
  "path": "reaction",
  "component": "sequencing/reaction/index"
}'
            style="font-family: monospace"
          />
        </el-form-item>

        <div style="margin-top: 20px; text-align: right">
          <el-button @click="reset">清空内容</el-button>
          <el-button type="primary" :loading="loading" icon="Upload" @click="handleImport"> 开始批量导入 </el-button>
        </div>
      </el-form>

      <!-- 导入结果状态栏 -->
      <div v-if="results.length > 0" style="margin-top: 30px">
        <h4 style="margin-bottom: 10px">执行结果</h4>
        <el-table :data="results" border stripe size="small" style="width: 100%">
          <el-table-column prop="menuName" label="菜单名称" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="消息描述" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup name="MenuImport">
import { addMenu } from '@/api/system/menu'

const { proxy } = getCurrentInstance()
const jsonContent = ref('')
const loading = ref(false)
const results = ref([])

function loadTemplate() {
  const template = [
    {
      parentId: 2018,
      menuName: '交接管理',
      icon: 'guide',
      menuType: 'C',
      orderNum: 13,
      path: 'handover',
      component: 'sequencing/handover/index',
      perms: 'sequencing:handover:list'
    }
  ]
  jsonContent.value = JSON.stringify(template, null, 2)
}

function reset() {
  jsonContent.value = ''
  results.value = []
}

async function handleImport() {
  if (!jsonContent.value.trim()) {
    proxy.$modal.msgError('内容不能为空')
    return
  }

  let data = []
  try {
    const parsed = JSON.parse(jsonContent.value)
    data = Array.isArray(parsed) ? parsed : [parsed]
  } catch (e) {
    proxy.$modal.msgError('JSON 格式错误，请检查语法')
    return
  }

  loading.value = true
  results.value = []

  for (const item of data) {
    try {
      await addMenu(item)
      results.value.push({
        menuName: item.menuName || '未知',
        status: '成功',
        message: '新增菜单成功'
      })
    } catch (err) {
      results.value.push({
        menuName: item.menuName || '未知',
        status: '失败',
        message: err.message || '请求后端失败'
      })
    }
  }

  loading.value = false
  proxy.$modal.msgSuccess('批量操作已结束')
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
