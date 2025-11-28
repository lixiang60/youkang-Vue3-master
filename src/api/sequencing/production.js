import request from '@/utils/request'

// 查询模板生产列表
export function listProduction(query) {
  return request({
    url: '/sequencing/production/list',
    method: 'get',
    params: query
  })
}

// 查询模板生产详细
export function getProduction(id) {
  return request({
    url: '/sequencing/production/' + id,
    method: 'get'
  })
}

// 新增模板生产
export function addProduction(data) {
  return request({
    url: '/sequencing/production',
    method: 'post',
    data: data
  })
}

// 修改模板生产
export function updateProduction(data) {
  return request({
    url: '/sequencing/production',
    method: 'put',
    data: data
  })
}

// 删除模板生产
export function delProduction(id) {
  return request({
    url: '/sequencing/production/' + id,
    method: 'delete'
  })
}

// 导出模板生产
export function exportProduction(query) {
  return request({
    url: '/sequencing/production/export',
    method: 'get',
    params: query
  })
}
