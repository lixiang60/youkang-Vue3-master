import request from '@/utils/request'

// 查询引物管理列表
export function listPrimer(query) {
  return request({
    url: '/sequencing/primer/list',
    method: 'get',
    params: query
  })
}

// 查询引物管理详细
export function getPrimer(id) {
  return request({
    url: '/sequencing/primer/' + id,
    method: 'get'
  })
}

// 新增引物管理
export function addPrimer(data) {
  return request({
    url: '/sequencing/primer',
    method: 'post',
    data: data
  })
}

// 修改引物管理
export function updatePrimer(data) {
  return request({
    url: '/sequencing/primer',
    method: 'put',
    data: data
  })
}

// 删除引物管理
export function delPrimer(id) {
  return request({
    url: '/sequencing/primer/' + id,
    method: 'delete'
  })
}

// 导出引物管理
export function exportPrimer(query) {
  return request({
    url: '/sequencing/primer/export',
    method: 'get',
    params: query
  })
}
