import request from '@/utils/request'

// 查询课题组管理列表
export function listResearch_group(query) {
  return request({
    url: '/customer/subjectGroup/list',
    method: 'get',
    params: query
  })
}
// 根据课题组名称查询课题组信息
export function getResearch_groupByName(name) {
  return request({
    url: '/customer/subjectGroup/getByName',
    method: 'get',
    params: { name }
  })
}

// 查询课题组管理详细
export function getResearch_group(id) {
  return request({
    url: '/customer/subjectGroup/' + id,
    method: 'get'
  })
}

// 新增课题组管理
export function addResearch_group(data) {
  return request({
    url: '/customer/subjectGroup/add',
    method: 'post',
    data: data
  })
}

// 修改课题组管理
export function updateResearch_group(data) {
  return request({
    url: '/customer/subjectGroup/edit',
    method: 'put',
    data: data
  })
}

// 批量更新课题组
export function batchUpdateResearch_group(data) {
  return request({
    url: '/customer/subjectGroup/batch',
    method: 'post',
    data: data
  })
}

// 删除课题组管理
export function delResearch_group(id) {
  return request({
    url: '/customer/research_group/' + ids,
    method: 'delete'
  })
}

// 导出课题组管理
export function exportResearch_group(query) {
  return request({
    url: '/customer/subjectGroup/export',
    method: 'post',
    params: query
  })
}
// 统计各地区的课题组数量
export function countResearch_groupByRegion() {
  return request({
    url: '/customer/subjectGroup/countByRegion',
    method: 'get'
  })
}