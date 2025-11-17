import request from '@/utils/request'

// 查询课题组管理列表
export function listResearch_group(query) {
  return request({
    url: '/customer/research_group/list',
    method: 'get',
    params: query
  })
}

// 查询课题组管理详细
export function getResearch_group(id) {
  return request({
    url: '/customer/research_group/' + id,
    method: 'get'
  })
}

// 新增课题组管理
export function addResearch_group(data) {
  return request({
    url: '/customer/research_group',
    method: 'post',
    data: data
  })
}

// 修改课题组管理
export function updateResearch_group(data) {
  return request({
    url: '/customer/research_group',
    method: 'put',
    data: data
  })
}

// 删除课题组管理
export function delResearch_group(id) {
  return request({
    url: '/customer/research_group/' + id,
    method: 'delete'
  })
}

// 导出课题组管理
export function exportResearch_group(query) {
  return request({
    url: '/customer/research_group/export',
    method: 'get',
    params: query
  })
}
