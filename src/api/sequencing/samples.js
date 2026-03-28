import request from '@/utils/request'

// 查询样品列表
export function listSamples(data) {
  return request({
    url: '/order/sample/list',
    method: 'post',
    data: data
  })
}

// 获取样品详情
export function getSamples(produceId) {
  return request({
    url: '/order/sample/' + produceId,
    method: 'get'
  })
}

// 新增样品
export function addSamples(data) {
  return request({
    url: '/order/sample',
    method: 'post',
    data: data
  })
}

// 修改样品
export function updateSamples(data) {
  return request({
    url: '/order/sample',
    method: 'put',
    data: data
  })
}

// 批量删除样品
export function delSamples(produceIds) {
  return request({
    url: '/order/sample/' + produceIds.toString(),
    method: 'delete'
  })
}

// 导出样品
export function exportSamples(data) {
  return request({
    url: '/order/sample/export',
    method: 'post',
    data: data
  })
}

// 导入样品
export function importSamples(data) {
  return request({
    url: '/order/sample/import',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
