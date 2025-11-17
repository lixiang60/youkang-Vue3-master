import request from '@/utils/request'

// 查询客户审核列表
export function listReview(query) {
  return request({
    url: '/customer/review/list',
    method: 'get',
    params: query
  })
}

// 查询客户审核详细
export function getReview(id) {
  return request({
    url: '/customer/review/' + id,
    method: 'get'
  })
}

// 新增客户审核
export function addReview(data) {
  return request({
    url: '/customer/review',
    method: 'post',
    data: data
  })
}

// 修改客户审核
export function updateReview(data) {
  return request({
    url: '/customer/review',
    method: 'put',
    data: data
  })
}

// 删除客户审核
export function delReview(id) {
  return request({
    url: '/customer/review/' + id,
    method: 'delete'
  })
}

// 导出客户审核
export function exportReview(query) {
  return request({
    url: '/customer/review/export',
    method: 'get',
    params: query
  })
}
