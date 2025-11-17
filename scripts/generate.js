#!/usr/bin/env node

/**
 * 统一CLI工具 - 生成组件、页面和API
 * 使用方法: 
 *   npm run generate
 *   或 node scripts/generate.js [类型] [参数...]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 提示用户输入
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

// 转换为 PascalCase
function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// 组件模板
function getComponentTemplate(componentName) {
  return `<template>
  <div class="${componentName.toLowerCase()}-container">
    <h3>{{ title }}</h3>
    <!-- 组件内容 -->
  </div>
</template>

<script setup name="${componentName}">
import { ref } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '${componentName}'
  }
})

// Emits
const emit = defineEmits(['update'])

// 响应式数据
const data = ref(null)

// 方法
function handleUpdate() {
  emit('update', data.value)
}

// 生命周期
onMounted(() => {
  console.log('${componentName} mounted')
})
</script>

<style scoped lang="scss">
.${componentName.toLowerCase()}-container {
  padding: 20px;
  
  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
  }
}
</style>
`
}

// 组件 index.js 模板
function getComponentIndexTemplate(componentName) {
  return `import ${componentName} from './${componentName}.vue'

export default ${componentName}
`
}

// 页面模板
function getPageTemplate(moduleName, pageName, chineseName) {
  const PageName = toPascalCase(pageName)
  
  return `<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['${moduleName}:${pageName}:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['${moduleName}:${pageName}:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['${moduleName}:${pageName}:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Search"
          @click="handleQuery"
        >查询</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          plain
          icon="Refresh"
          @click="handleRefresh"
        >刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['${moduleName}:${pageName}:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table 
      v-loading="loading" 
      :data="dataList" 
      @selection-change="handleSelectionChange"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column type="selection" width="50" align="center" fixed />
      <el-table-column label="ID" align="center" prop="id" width="80" fixed sortable />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['${moduleName}:${pageName}:edit']"
          >修改</el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['${moduleName}:${pageName}:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
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
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="${PageName}">
import { list${PageName}, get${PageName}, add${PageName}, update${PageName}, del${PageName} } from '@/api/${moduleName}/${pageName}'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const dataList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined
  },
  rules: {
    name: [
      { required: true, message: '名称不能为空', trigger: 'blur' }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  list${PageName}(queryParams.value).then(response => {
    dataList.value = response.rows
    total.value = response.total
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    name: undefined,
    status: '0',
    remark: undefined
  }
  proxy.resetForm('formRef')
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 刷新按钮操作 */
function handleRefresh() {
  getList()
  proxy.$modal.msgSuccess('刷新成功')
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加${chineseName}'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  get${PageName}(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = '修改${chineseName}'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (valid) {
      if (form.value.id !== undefined) {
        update${PageName}(form.value).then(response => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        add${PageName}(form.value).then(response => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const idList = row.id || ids.value
  proxy.$modal.confirm('是否确认删除编号为"' + idList + '"的数据项？').then(function() {
    return del${PageName}(idList)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('${moduleName}/${pageName}/export', {
    ...queryParams.value
  }, \`${pageName}_\${new Date().getTime()}.xlsx\`)
}

onMounted(() => {
  getList()
})
</script>
`
}

// API 模板
function getApiTemplate(moduleName, resourceName, chineseName) {
  const ResourceName = toPascalCase(resourceName)
  
  return `import request from '@/utils/request'

// 查询${chineseName}列表
export function list${ResourceName}(query) {
  return request({
    url: '/${moduleName}/${resourceName}/list',
    method: 'get',
    params: query
  })
}

// 查询${chineseName}详细
export function get${ResourceName}(id) {
  return request({
    url: '/${moduleName}/${resourceName}/' + id,
    method: 'get'
  })
}

// 新增${chineseName}
export function add${ResourceName}(data) {
  return request({
    url: '/${moduleName}/${resourceName}',
    method: 'post',
    data: data
  })
}

// 修改${chineseName}
export function update${ResourceName}(data) {
  return request({
    url: '/${moduleName}/${resourceName}',
    method: 'put',
    data: data
  })
}

// 删除${chineseName}
export function del${ResourceName}(id) {
  return request({
    url: '/${moduleName}/${resourceName}/' + id,
    method: 'delete'
  })
}

// 导出${chineseName}
export function export${ResourceName}(query) {
  return request({
    url: '/${moduleName}/${resourceName}/export',
    method: 'get',
    params: query
  })
}
`
}

// 路由配置模板
function getRouteTemplate(moduleName, pageName, chineseName) {
  const PageName = toPascalCase(pageName)
  
  return `
// ${chineseName}路由配置
// 将以下配置添加到 src/router/index.js 的 dynamicRoutes 数组中

{
  path: '/${moduleName}/${pageName}',
  component: Layout,
  hidden: false,
  permissions: ['${moduleName}:${pageName}:list'],
  children: [
    {
      path: 'index',
      component: () => import('@/views/${moduleName}/${pageName}/index'),
      name: '${PageName}',
      meta: { 
        title: '${chineseName}', 
        icon: 'list',
        noCache: false
      }
    }
  ]
}
`
}

// 生成组件
async function generateComponent(componentName, targetDir) {
  const projectRoot = path.resolve(__dirname, '..')
  const componentDir = path.join(projectRoot, 'src', targetDir, componentName)

  try {
    // 创建目录
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true })
    }

    // 创建组件文件
    const componentFile = path.join(componentDir, `${componentName}.vue`)
    fs.writeFileSync(componentFile, getComponentTemplate(componentName))

    // 创建 index.js
    const indexFile = path.join(componentDir, 'index.js')
    fs.writeFileSync(indexFile, getComponentIndexTemplate(componentName))

    console.log('\n✅ 组件创建成功!')
    console.log(`📁 目录: ${componentDir}`)
    console.log(`📄 文件:`)
    console.log(`   - ${componentName}.vue`)
    console.log(`   - index.js`)
    console.log('')
    console.log('💡 使用方法:')
    console.log(`   import ${componentName} from '@/${targetDir}/${componentName}'`)

  } catch (error) {
    console.error('❌ 创建组件失败:', error.message)
  }
}

// 生成API
async function generateApi(moduleName, resourceName, chineseName) {
  const projectRoot = path.resolve(__dirname, '..')
  const apiDir = path.join(projectRoot, 'src', 'api', moduleName)

  try {
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true })
    }

    const apiFile = path.join(apiDir, `${resourceName}.js`)
    
    if (fs.existsSync(apiFile)) {
      console.warn('\n⚠️  警告: API 文件已存在')
      const overwrite = await prompt('是否覆盖? (y/n): ')
      if (overwrite.toLowerCase() !== 'y') {
        console.log('已取消')
        return
      }
    }

    fs.writeFileSync(apiFile, getApiTemplate(moduleName, resourceName, chineseName))

    const ResourceName = toPascalCase(resourceName)
    console.log('\n✅ API 文件创建成功!')
    console.log(`📁 文件: src/api/${moduleName}/${resourceName}.js`)
    console.log('')
    console.log('💡 使用方法:')
    console.log(`   import { list${ResourceName}, get${ResourceName}, add${ResourceName}, update${ResourceName}, del${ResourceName} } from '@/api/${moduleName}/${resourceName}'`)

  } catch (error) {
    console.error('❌ 创建API失败:', error.message)
  }
}

// 生成页面
async function generatePage(moduleName, pageName, chineseName) {
  const projectRoot = path.resolve(__dirname, '..')

  try {
    // 1. 创建页面文件
    const viewDir = path.join(projectRoot, 'src', 'views', moduleName, pageName)
    if (!fs.existsSync(viewDir)) {
      fs.mkdirSync(viewDir, { recursive: true })
    }
    const viewFile = path.join(viewDir, 'index.vue')
    fs.writeFileSync(viewFile, getPageTemplate(moduleName, pageName, chineseName))

    // 2. 创建 API 文件
    const apiDir = path.join(projectRoot, 'src', 'api', moduleName)
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true })
    }
    const apiFile = path.join(apiDir, `${pageName}.js`)
    fs.writeFileSync(apiFile, getApiTemplate(moduleName, pageName, chineseName))

    // 3. 创建路由配置说明文件
    // const routeFile = path.join(viewDir, 'route-config.js')
    // fs.writeFileSync(routeFile, getRouteTemplate(moduleName, pageName, chineseName))

    console.log('\n✅ 页面生成成功!')
    console.log('')
    console.log('📁 创建的文件:')
    console.log(`   ✓ 页面: src/views/${moduleName}/${pageName}/index.vue`)
    console.log(`   ✓ API: src/api/${moduleName}/${pageName}.js`)
    console.log(`   ✓ 路由配置: src/views/${moduleName}/${pageName}/route-config.js`)
    console.log('')
    console.log('📝 下一步操作:')
    console.log('   1. 打开 src/router/index.js')
    console.log('   2. 将 route-config.js 中的路由配置添加到 dynamicRoutes 数组')
    console.log('   3. 根据实际需求修改页面和API')
    console.log('')
    console.log('💡 权限标识:')
    console.log(`   - 查看: ${moduleName}:${pageName}:list`)
    console.log(`   - 新增: ${moduleName}:${pageName}:add`)
    console.log(`   - 修改: ${moduleName}:${pageName}:edit`)
    console.log(`   - 删除: ${moduleName}:${pageName}:remove`)
    console.log(`   - 导出: ${moduleName}:${pageName}:export`)

  } catch (error) {
    console.error('❌ 生成失败:', error.message)
  }
}

// 显示菜单
function showMenu() {
  console.log('\n╔════════════════════════════════════════╗')
  console.log('║     优康项目代码生成器 v1.0           ║')
  console.log('╚════════════════════════════════════════╝')
  console.log('\n请选择要生成的类型:')
  console.log('  1. 组件 (Component)')
  console.log('  2. 页面 (Page + API + Route)')
  console.log('  3. API (仅API文件)')
  console.log('  0. 退出')
  console.log('')
}

// 主函数
async function main() {
  const args = process.argv.slice(2)

  // 如果有命令行参数，直接执行
  if (args.length > 0) {
    const type = args[0]
    
    if (type === 'component' || type === 'c') {
      const componentName = args[1]
      const targetDir = args[2] || 'components'
      
      if (!componentName) {
        console.error('❌ 错误: 请提供组件名称')
        console.log('使用方法: npm run generate component <组件名> [目录]')
        process.exit(1)
      }
      
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
        console.error('❌ 错误: 组件名称必须使用 PascalCase 格式')
        process.exit(1)
      }
      
      await generateComponent(componentName, targetDir)
      rl.close()
      return
    }
    
    if (type === 'page' || type === 'p') {
      const moduleName = args[1]
      const pageName = args[2]
      const chineseName = args[3] || pageName
      
      if (!moduleName || !pageName) {
        console.error('❌ 错误: 请提供模块名和页面名')
        console.log('使用方法: npm run generate page <模块名> <页面名> [中文名]')
        process.exit(1)
      }
      
      await generatePage(moduleName, pageName, chineseName)
      rl.close()
      return
    }
    
    if (type === 'api' || type === 'a') {
      const moduleName = args[1]
      const resourceName = args[2]
      const chineseName = args[3] || resourceName
      
      if (!moduleName || !resourceName) {
        console.error('❌ 错误: 请提供模块名和资源名')
        console.log('使用方法: npm run generate api <模块名> <资源名> [中文名]')
        process.exit(1)
      }
      
      await generateApi(moduleName, resourceName, chineseName)
      rl.close()
      return
    }
  }

  // 交互式模式
  while (true) {
    showMenu()
    const choice = await prompt('请输入选项 (0-3): ')

    if (choice === '0') {
      console.log('\n👋 再见!')
      rl.close()
      break
    }

    if (choice === '1') {
      // 生成组件
      console.log('\n=== 生成组件 ===')
      const componentName = await prompt('组件名称 (PascalCase, 如: UserCard): ')
      
      if (!componentName) {
        console.log('❌ 组件名称不能为空')
        continue
      }
      
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
        console.log('❌ 组件名称必须使用 PascalCase 格式')
        continue
      }
      
      const targetDir = await prompt('目标目录 (默认: components): ') || 'components'
      
      await generateComponent(componentName, targetDir)
      
    } else if (choice === '2') {
      // 生成页面
      console.log('\n=== 生成页面 ===')
      const moduleName = await prompt('模块名 (如: system, business): ')
      
      if (!moduleName) {
        console.log('❌ 模块名不能为空')
        continue
      }
      
      const pageName = await prompt('页面名 (如: product, order): ')
      
      if (!pageName) {
        console.log('❌ 页面名不能为空')
        continue
      }
      
      const chineseName = await prompt('中文名称 (如: 产品管理): ') || pageName
      
      await generatePage(moduleName, pageName, chineseName)
      
    } else if (choice === '3') {
      // 生成API
      console.log('\n=== 生成API ===')
      const moduleName = await prompt('模块名 (如: system, business): ')
      
      if (!moduleName) {
        console.log('❌ 模块名不能为空')
        continue
      }
      
      const resourceName = await prompt('资源名 (如: product, order): ')
      
      if (!resourceName) {
        console.log('❌ 资源名不能为空')
        continue
      }
      
      const chineseName = await prompt('中文名称 (如: 产品): ') || resourceName
      
      await generateApi(moduleName, resourceName, chineseName)
      
    } else {
      console.log('❌ 无效的选项，请重新选择')
    }

    const continueGen = await prompt('\n是否继续生成? (y/n): ')
    if (continueGen.toLowerCase() !== 'y') {
      console.log('\n👋 再见!')
      rl.close()
      break
    }
  }
}

// 运行主函数
main().catch(error => {
  console.error('发生错误:', error)
  rl.close()
  process.exit(1)
})
