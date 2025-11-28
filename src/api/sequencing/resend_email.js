import request from '@/utils/request'

// 查询样品补送邮件列表
export function listResend_email(query) {
  return request({
    url: '/sequencing/resend_email/list',
    method: 'get',
    params: query
  })
}

// 查询样品补送邮件详细
export function getResend_email(id) {
  return request({
    url: '/sequencing/resend_email/' + id,
    method: 'get'
  })
}

// 新增样品补送邮件
export function addResend_email(data) {
  return request({
    url: '/sequencing/resend_email',
    method: 'post',
    data: data
  })
}

// 修改样品补送邮件
export function updateResend_email(data) {
  return request({
    url: '/sequencing/resend_email',
    method: 'put',
    data: data
  })
}

// 删除样品补送邮件
export function delResend_email(id) {
  return request({
    url: '/sequencing/resend_email/' + id,
    method: 'delete'
  })
}

// 导出样品补送邮件
export function exportResend_email(query) {
  return request({
    url: '/sequencing/resend_email/export',
    method: 'get',
    params: query
  })
}
