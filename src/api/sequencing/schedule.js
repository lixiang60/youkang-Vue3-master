import request from '@/utils/request'

// 查询模板排版列表
export function listSchedule(query) {
  return request({
    url: '/sequencing/schedule/list',
    method: 'get',
    params: query
  })
}

// 查询模板排版详细
export function getSchedule(id) {
  return request({
    url: '/sequencing/schedule/' + id,
    method: 'get'
  })
}

// 新增模板排版
export function addSchedule(data) {
  return request({
    url: '/sequencing/schedule',
    method: 'post',
    data: data
  })
}

// 修改模板排版
export function updateSchedule(data) {
  return request({
    url: '/sequencing/schedule',
    method: 'put',
    data: data
  })
}

// 删除模板排版
export function delSchedule(id) {
  return request({
    url: '/sequencing/schedule/' + id,
    method: 'delete'
  })
}

// 导出模板排版
export function exportSchedule(query) {
  return request({
    url: '/sequencing/schedule/export',
    method: 'get',
    params: query
  })
}
