import request from '@/utils/request'

// 查询返还管理列表
export function listReturn(query) {
  return request({
    url: '/sequencing/return/list',
    method: 'get',
    params: query
  })
}

// 查询返还管理详细
export function getReturn(id) {
  return request({
    url: '/sequencing/return/' + id,
    method: 'get'
  })
}

// 新增返还管理
export function addReturn(data) {
  return request({
    url: '/sequencing/return',
    method: 'post',
    data: data
  })
}

// 修改返还管理
export function updateReturn(data) {
  return request({
    url: '/sequencing/return',
    method: 'put',
    data: data
  })
}

// 删除返还管理
export function delReturn(id) {
  return request({
    url: '/sequencing/return/' + id,
    method: 'delete'
  })
}

// 导出返还管理
export function exportReturn(query) {
  return request({
    url: '/sequencing/return/export',
    method: 'get',
    params: query
  })
}
