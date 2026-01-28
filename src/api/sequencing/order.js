import request from '@/utils/request'

// 查询订单管理列表
export function listOrder(query) {
  return request({
    url: '/order/info/list',
    method: 'post',
    data: query
  })
}

// 查询订单管理详细
export function getOrder(id) {
  return request({
    url: '/sequencing/order/' + id,
    method: 'get'
  })
}

// 新增订单管理
export function addOrder(data) {
  return request({
    url: '/order/info/addOrder',
    method: 'post',
    data: data
  })
}

// 修改订单管理
export function updateOrder(data) {
  return request({
    url: '/sequencing/order',
    method: 'post',
    data: data
  })
}

// 删除订单管理
export function delOrder(id) {
  return request({
    url: '/sequencing/order/' + id,
    method: 'post'
  })
}


// 导出订单管理
export function exportOrder(query) {
  return request({
    url: '/sequencing/order/export',
    method: 'post',
    params: query
  })
}


// 批量添加订单
export function batchAddOrder(data) {
  return request({
    url: '/sequencing/order/importData',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 标签打印
export function printOrderLabel(data) {
  return request({
    url: '/sequencing/order/printLabel',
    method: 'post',
    data: data
  })
}
