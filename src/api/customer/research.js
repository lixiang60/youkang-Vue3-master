import request from '@/utils/request'

// 查询客户课题组列表
export function listResearch(query) {
  return request({
    url: '/customerSubject/query',
    method: 'post',
    params: query,
    data: {}
  })
}

// 查询客户课题组详细
export function getResearch(id) {
  return request({
    url: '/customerSubject/' + id,
    method: 'get'
  })
}

// 新增客户课题组
export function addResearch(data) {
  return request({
    url: '/customerSubject/add',
    method: 'post',
    data: data
  })
}

// 修改客户课题组
export function updateResearch(data) {
  return request({
    url: '/customerSubject/update',
    method: 'post',
    data: data
  })
}

// 删除客户课题组
export function delResearch(id) {
  return request({
    url: '/customerSubject/' + id,
    method: 'post'
  })
}

// 导出客户课题组
export function exportResearch(query) {
  return request({
    url: '/customerSubject/export',
    method: 'get',
    params: query
  })
}
