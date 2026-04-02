# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

本文件为 Claude Code (claude.ai/code) 提供项目指导。

## 项目概述

这是"有康管理系统"，基于若依(RuoYi-Vue3)框架的 Vue 3 + SpringBoot 前后端分离企业ERP系统。

**技术栈：**
- Vue 3 (Composition API + `<script setup>`)
- Vite 6
- Element Plus 2.10
- Pinia (状态管理)
- Vue Router 4
- Axios (HTTP 请求)
- SCSS

## 开发命令

```bash
# 安装依赖
yarn --registry=https://registry.npmmirror.com

# 启动开发服务器（端口 5173）
yarn dev

# 生产环境构建
yarn build:prod

# 预发布环境构建
yarn build:stage

# 交互式代码生成器
yarn generate
# 或: node scripts/generate.js

# 代码检查与格式化
yarn lint:fix    # ESLint 自动修复
yarn format      # Prettier 格式化
```

## 代码风格

项目使用 Prettier 和 ESLint 进行代码规范：

- **分号**: 不使用分号 (`semi: false`)
- **引号**: 使用单引号 (`singleQuote: true`)
- **行宽**: 120 字符
- **尾逗号**: 不使用 (`trailingComma: 'none'`)
- **箭头函数参数**: 单参数省略括号 (`arrowParens: 'avoid'`)

Pre-commit 钩子（husky + lint-staged）会自动对 `.js` 和 `.vue` 文件执行 ESLint 修复和 Prettier 格式化。

## 架构说明

### 目录结构

```
src/
├── api/              # API 接口模块，按业务域划分
│   ├── customer/     # 客户相关接口
│   ├── sequencing/   # 测序/生产相关接口
│   ├── system/       # 系统管理接口
│   ├── monitor/      # 监控相关接口
│   └── common.js     # 通用接口工具
├── assets/           # 静态资源（图片、样式、图标）
├── components/       # 可复用组件
│   ├── Pagination/   # 标准分页组件
│   ├── Editor/       # 富文本编辑器（Quill）
│   ├── FileUpload/   # 文件上传组件
│   ├── ImageUpload/  # 图片上传组件
│   ├── DictTag/      # 字典值显示标签
│   ├── Crontab/      # Cron 表达式构建器
│   └── SvgIcon/      # SVG 图标组件
├── directive/        # 自定义 Vue 指令
│   ├── permission/   # v-hasPermi、v-hasRole 权限指令
│   └── common/       # v-copyText 复制指令
├── layout/           # 应用布局组件
│   ├── components/   # 侧边栏、导航栏、标签页等
│   └── index.vue     # 主布局
├── plugins/          # Vue 插件（auth、cache、modal、download）
├── router/           # Vue Router 配置
├── store/            # Pinia 状态管理
│   └── modules/      # app、user、permission、settings、tagsView、dict
├── utils/            # 工具函数
│   ├── request.js    # Axios 实例及拦截器
│   ├── auth.js       # Token 管理
│   ├── dict.js       # 字典工具
│   └── ruoyi.js      # 通用辅助函数
├── views/            # 页面组件（按模块划分）
│   ├── customer/     # 客户管理
│   ├── sequencing/   # 测序管理
│   ├── system/       # 系统管理
│   ├── monitor/      # 系统监控
│   └── tool/         # 系统工具
├── App.vue           # 根组件
├── main.js           # 应用入口
└── permission.js     # 路由权限控制
```

### 路由架构

应用采用基于用户权限的**动态路由**：
- **constantRoutes**：公共路由（登录、404、首页）
- **dynamicRoutes**：权限控制路由（在 `router/index.js` 中定义）
- **后端路由**：通过 `getRouters()` API 从服务器获取

路由根据用户的角色/权限动态加载。`permission.js` 文件负责路由守卫，在允许访问前加载用户信息。

### 状态管理 (Pinia)

核心 Store：
- `user`：认证状态、用户信息、角色、权限
- `permission`：动态路由生成、侧边栏路由
- `app`：侧边栏状态、设备类型、主题尺寸
- `settings`：主题设置
- `tagsView`：访问页面缓存
- `dict`：字典数据缓存

### API 编写规范

API 统一放在 `src/api/` 目录下，遵循以下模式：
```javascript
import request from '@/utils/request'

// 查询列表
export function listResource(query) {
  return request({
    url: '/module/resource/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getResource(id) {
  return request({
    url: '/module/resource/' + id,
    method: 'get'
  })
}

// 新增
export function addResource(data) {
  return request({
    url: '/module/resource',
    method: 'post',
    data: data
  })
}

// 修改
export function updateResource(data) {
  return request({
    url: '/module/resource',
    method: 'put',
    data: data
  })
}

// 删除
export function delResource(id) {
  return request({
    url: '/module/resource/' + id,
    method: 'delete'
  })
}
```

### 组件规范

1. **使用 `<script setup>`** 并显式指定 `name`：
   ```vue
   <script setup name="组件名称">
   ```

2. **全局组件**（在 `main.js` 中自动注册）：
   - `Pagination` - 标准列表分页
   - `RightToolbar` - 表格工具栏（搜索/刷新）
   - `Editor` - Quill 富文本编辑器
   - `FileUpload` / `ImageUpload` - 文件处理
   - `DictTag` - 字典值显示
   - `SampleTypeSelect` / `AntibioticTypeSelect` - 业务专用选择器

3. **权限指令**：
   - `v-hasPermi="['permission:key']"` - 按权限控制元素显示
   - `v-hasRole="['admin']"` - 按角色控制元素显示
   - `v-copyText` - 复制文本到剪贴板

### 请求/响应处理

Axios 实例（`utils/request.js`）包含：
- **请求拦截器**：添加 Bearer token，防止重复提交
- **响应拦截器**：处理标准错误码（401=认证过期，500=服务器错误，601=警告）
- **基础 URL**：`/dev-api`（开发环境代理到后端）

### 业务模块

系统管理**测序/生产**工作流：
- `sequencing/order` - 测序订单
- `sequencing/samples` - 样本管理
- `sequencing/production` - 生产跟踪
- `sequencing/schedule` - 生产排程
- `sequencing/primer` - 引物管理
- `sequencing/email` - 邮件通信
- `sequencing/handover` - 交接班
- `sequencing/return` - 样本退回
- `sequencing/resend` - 重发管理
- `sequencing/template` - 模板管理

### 代码生成器

运行 `yarn generate` 启动交互式 CLI，可生成：
1. **组件** - PascalCase 命名的 Vue 组件
2. **页面** - 完整 CRUD 页面（含表格、对话框、API 文件、路由配置）
3. **接口** - API 模块文件

使用方法：
```bash
# 生成页面
node scripts/generate.js page <模块名> <页面名> [中文名]

# 生成组件
node scripts/generate.js component <组件名> [目录]
```

### 环境配置

后端 API 地址在 `vite.config.js` 中配置：
```javascript
const baseUrl = 'http://127.0.0.1:3564' // 本地后端地址
```

环境文件：
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.staging` - 预发布环境配置

### 常用工具函数

通过 `app.config.globalProperties` 全局可用：
- `useDict()` - 加载字典数据
- `download()` - 下载文件
- `parseTime()` - 格式化时间戳
- `resetForm()` - 重置表单
- `handleTree()` - 列表转树形结构
- `addDateRange()` - 添加日期范围到查询参数
- `selectDictLabel()` - 根据值获取字典标签

插件（通过 `$plugin` 在模板中访问）：
- `$tab` - 标签页/视图操作
- `$auth` - 权限检查
- `$cache` - 缓存操作
- `$modal` - 模态框
- `$download` - 文件下载
