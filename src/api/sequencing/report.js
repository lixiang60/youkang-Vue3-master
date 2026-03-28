import request from '@/utils/request'

// 查询报告生产列表
export function listReport(query) {
  return request({
    url: '/sequencing/report/list',
    method: 'get',
    params: query
  })
}

// 查询报告生产详细
export function getReport(id) {
  return request({
    url: '/sequencing/report/' + id,
    method: 'get'
  })
}

// 新增报告生产
export function addReport(data) {
  return request({
    url: '/sequencing/report',
    method: 'post',
    data: data
  })
}

// 修改报告生产
export function updateReport(data) {
  return request({
    url: '/sequencing/report',
    method: 'put',
    data: data
  })
}

// 删除报告生产
export function delReport(id) {
  return request({
    url: '/sequencing/report/' + id,
    method: 'delete'
  })
}

// 导出报告生产
export function exportReport(query) {
  return request({
    url: '/sequencing/report/export',
    method: 'get',
    params: query
  })
}
