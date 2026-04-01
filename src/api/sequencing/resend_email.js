import request from '@/utils/request'

// 获取模板生产列表 (补送邮件共用此接口)
export function listResend_email(data) {
  return request({
    url: '/order/sample/template/produce/list',
    method: 'post',
    data: data
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
