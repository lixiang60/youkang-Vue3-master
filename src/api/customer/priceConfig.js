import request from '@/utils/request'

// 查询课题组价格列表
export function listPriceConfig(groupId) {
  return request({
    url: '/customer/priceConfig/list/' + groupId,
    method: 'get'
  })
}

// 修改价格配置
export function updatePriceConfig(data) {
  return request({
    url: '/customer/priceConfig',
    method: 'put',
    data: data
  })
}

// 批量修改价格配置
export function batchUpdatePriceConfig(data) {
  return request({
    url: '/customer/priceConfig/batch',
    method: 'put',
    data: data
  })
}

// 重置价格配置
export function resetPriceConfig(id) {
  return request({
    url: '/customer/priceConfig/' + id,
    method: 'delete'
  })
}

// 导出价格配置
export function exportPriceConfig(query) {
  return request({
    url: '/customer/priceConfig/export',
    method: 'get',
    params: query
  })
}
