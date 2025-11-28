import request from '@/utils/request'

// 查询模板邮件列表
export function listEmail(query) {
  return request({
    url: '/sequencing/email/list',
    method: 'get',
    params: query
  })
}

// 查询模板邮件详细
export function getEmail(id) {
  return request({
    url: '/sequencing/email/' + id,
    method: 'get'
  })
}

// 新增模板邮件
export function addEmail(data) {
  return request({
    url: '/sequencing/email',
    method: 'post',
    data: data
  })
}

// 修改模板邮件
export function updateEmail(data) {
  return request({
    url: '/sequencing/email',
    method: 'put',
    data: data
  })
}

// 删除模板邮件
export function delEmail(id) {
  return request({
    url: '/sequencing/email/' + id,
    method: 'delete'
  })
}

// 导出模板邮件
export function exportEmail(query) {
  return request({
    url: '/sequencing/email/export',
    method: 'get',
    params: query
  })
}
