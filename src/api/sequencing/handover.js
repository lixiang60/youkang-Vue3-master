import request from '@/utils/request'

// 查询测序交接列表
export function listHandover(query) {
  return request({
    url: '/sequencing/handover/list',
    method: 'get',
    params: query
  })
}

// 查询测序交接详细
export function getHandover(id) {
  return request({
    url: '/sequencing/handover/' + id,
    method: 'get'
  })
}

// 新增测序交接
export function addHandover(data) {
  return request({
    url: '/sequencing/handover',
    method: 'post',
    data: data
  })
}

// 修改测序交接
export function updateHandover(data) {
  return request({
    url: '/sequencing/handover',
    method: 'put',
    data: data
  })
}

// 删除测序交接
export function delHandover(id) {
  return request({
    url: '/sequencing/handover/' + id,
    method: 'delete'
  })
}

// 导出测序交接
export function exportHandover(query) {
  return request({
    url: '/sequencing/handover/export',
    method: 'get',
    params: query
  })
}
