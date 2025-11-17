
// 客户暂存路由配置
// 将以下配置添加到 src/router/index.js 的 dynamicRoutes 数组中

{
  path: '/customer/stash',
  component: Layout,
  hidden: false,
  permissions: ['customer:stash:list'],
  children: [
    {
      path: 'index',
      component: () => import('@/views/customer/stash/index'),
      name: 'Stash',
      meta: { 
        title: '客户暂存', 
        icon: 'list',
        noCache: false
      }
    }
  ]
}
