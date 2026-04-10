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
    url: '/order/info/' + id,
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

// 通过订单新增单个样品
export function addSampleByOrder(data) {
  return request({
    url: '/order/info/addSample',
    method: 'post',
    data: data
  })
}

// 修改订单管理
export function updateOrder(data) {
  return request({
    url: '/order/info',
    method: 'put',
    data: data
  })
}

// 删除订单管理
export function delOrder(id) {
  return request({
    url: '/order/info/' + id,
    method: 'delete'
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

// 通过订单批量新增样品
export function batchAddSampleByOrder(data) {
  return request({
    url: '/order/info/batchAddSample',
    method: 'post',
    data: data
  })
}

// 范围查询订单
export function queryByRange(query) {
  return request({
    url: '/order/info/queryByRange',
    method: 'post',
    data: query
  })
}

// 查询订单及关联样品
export function getOrderWithSamples(orderId) {
  return request({
    url: '/order/info/withSamples/' + orderId,
    method: 'get'
  })
}

// 范围查询订单及样品
export function getOrderWithSamplesRange(data) {
  return request({
    url: '/order/info/withSamples/queryByRange',
    method: 'post',
    data: data
  })
}

// 计算订单价格
export function calcOrderPrice(orderId) {
  return request({
    url: '/order/info/calcPrice/' + orderId,
    method: 'get'
  })
}
