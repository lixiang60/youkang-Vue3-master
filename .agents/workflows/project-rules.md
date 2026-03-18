---
description: 项目开发规则和约定
---

# 优康项目开发规则

## 项目概述

这是一个基于 **RuoYi-Vue3** 框架的前端项目，使用以下技术栈：

- **Vue 3.5.16** - 渐进式 JavaScript 框架
- **Element Plus 2.10.7** - UI 组件库
- **Vite 6.3.5** - 构建工具
- **Vue Router 4.5.1** - 路由管理
- **Pinia 3.0.2** - 状态管理
- **Axios 1.9.0** - HTTP 客户端

## 目录结构

```
youkang-front/
├── src/
│   ├── api/              # API接口定义
│   │   ├── system/       # 系统模块API
│   │   ├── monitor/      # 监控模块API
│   │   └── tool/         # 工具模块API
│   ├── assets/           # 静态资源
│   │   └── styles/       # 样式文件
│   ├── components/       # 全局组件
│   │   ├── Pagination/   # 分页组件
│   │   ├── DictTag/      # 字典标签组件
│   │   ├── FileUpload/   # 文件上传组件
│   │   └── ...
│   ├── directive/        # 自定义指令
│   ├── layout/           # 布局组件
│   ├── plugins/          # 插件
│   ├── router/           # 路由配置
│   │   └── index.js      # 路由主文件
│   ├── store/            # Pinia状态管理
│   ├── utils/            # 工具函数
│   ├── views/            # 页面视图
│   │   ├── system/       # 系统管理页面
│   │   ├── monitor/      # 系统监控页面
│   │   └── tool/         # 系统工具页面
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   └── settings.js       # 全局配置
├── vite/                 # Vite配置
│   └── plugins/          # Vite插件配置
├── public/               # 公共静态资源
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── .env.staging          # 预发布环境变量
├── vite.config.js        # Vite配置文件
└── package.json          # 项目依赖
```

## 编码规范

### 1. 组件命名规范

- **全局组件**: 使用 PascalCase，如 `Pagination`, `DictTag`
- **页面组件**: 使用 PascalCase，文件名为 `index.vue`
- **组件 name 属性**: 使用 `<script setup name="ComponentName">` 定义

### 2. API 文件规范

每个 API 文件应导出相关的接口函数：

```javascript
import request from "@/utils/request";

// 查询列表
export function listXxx(query) {
  return request({
    url: "/system/xxx/list",
    method: "get",
    params: query,
  });
}

// 查询详细
export function getXxx(id) {
  return request({
    url: "/system/xxx/" + id,
    method: "get",
  });
}

// 新增
export function addXxx(data) {
  return request({
    url: "/system/xxx",
    method: "post",
    data: data,
  });
}

// 修改
export function updateXxx(data) {
  return request({
    url: "/system/xxx",
    method: "put",
    data: data,
  });
}

// 删除
export function delXxx(id) {
  return request({
    url: "/system/xxx/" + id,
    method: "delete",
  });
}
```

### 3. 路由配置规范

路由分为两类：

#### 静态路由 (constantRoutes)

- 不需要权限的公共路由
- 如登录、注册、404 等页面

#### 动态路由 (dynamicRoutes)

- 基于用户权限动态加载
- 使用 `permissions` 字段控制访问权限

路由配置示例：

```javascript
{
  path: '/system/user',
  component: Layout,
  hidden: false,
  permissions: ['system:user:list'],
  children: [
    {
      path: 'index',
      component: () => import('@/views/system/user/index'),
      name: 'User',
      meta: {
        title: '用户管理',
        icon: 'user',
        noCache: false
      }
    }
  ]
}
```

### 4. 页面组件规范

标准的 CRUD 页面应包含：

1. **查询表单区域**: 使用 `el-form` + `el-form-item`
2. **操作按钮区域**: 新增、修改、删除、导入、导出等
3. **数据表格区域**: 使用 `el-table`
4. **分页组件**: 使用全局 `Pagination` 组件
5. **对话框区域**: 新增/编辑表单使用 `el-dialog`

页面模板结构：

```vue
<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <!-- 查询字段 -->
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <!-- 其他按钮 -->
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="dataList">
      <!-- 表格列 -->
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open">
      <el-form :model="form" :rules="rules" ref="formRef">
        <!-- 表单字段 -->
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup name="ModuleName">
import { listXxx, getXxx, addXxx, updateXxx, delXxx } from "@/api/xxx";

// 响应式数据
const dataList = ref([]);
const open = ref(false);
const loading = ref(true);
const total = ref(0);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
});

const form = ref({});
const rules = ref({});

// 查询列表
function getList() {
  loading.value = true;
  listXxx(queryParams.value).then((res) => {
    dataList.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
}

// 生命周期
onMounted(() => {
  getList();
});
</script>
```

### 5. 状态管理规范

使用 Pinia 进行状态管理，store 文件位于 `src/store/modules/`

### 6. 样式规范

- 全局样式: `src/assets/styles/`
- 使用 SCSS 预处理器
- 组件样式使用 scoped

### 7. 权限控制

- 使用 `v-hasPermi` 指令控制按钮权限
- 示例: `v-hasPermi="['system:user:add']"`

### 8. 字典使用

使用 `useDict` 组合式函数获取字典数据：

```javascript
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");
```

## 开发命令

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 构建生产环境
yarn build:prod

# 构建预发布环境
yarn build:stage

# 预览构建结果
yarn preview
```

## 环境配置

- 开发环境: `.env.development`
- 生产环境: `.env.production`
- 预发布环境: `.env.staging`

## 全局组件

项目已注册以下全局组件，可直接使用：

- `DictTag` - 字典标签
- `Pagination` - 分页
- `FileUpload` - 文件上传
- `ImageUpload` - 图片上传
- `ImagePreview` - 图片预览
- `RightToolbar` - 右侧工具栏
- `Editor` - 富文本编辑器
- `svg-icon` - SVG 图标

## 全局方法

通过 `getCurrentInstance()` 的 `proxy` 访问：

- `useDict(dictTypes)` - 获取字典数据
- `download(url, params, filename)` - 下载文件
- `parseTime(time, pattern)` - 时间格式化
- `resetForm(refName)` - 重置表单
- `handleTree(data, id, parentId, children)` - 构造树形数据
- `addDateRange(params, dateRange)` - 添加日期范围参数
- `selectDictLabel(datas, value)` - 获取字典标签
