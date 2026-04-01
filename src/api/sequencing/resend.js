import request from '@/utils/request'

// 获取模板生产列表 (获取补送列表共用此接口，根据参数区分)
export function listResend(data) {
  return request({
    url: '/order/sample/template/produce/list',
    method: 'post',
    data: data
  })
}

// 查询样品补送详细
export function getResend(id) {
  return request({
    url: '/sequencing/resend/' + id,
    method: 'get'
  })
}

// 新增样品补送
export function addResend(data) {
  return request({
    url: '/sequencing/resend',
    method: 'post',
    data: data
  })
}

// 修改样品补送
export function updateResend(data) {
  return request({
    url: '/sequencing/resend',
    method: 'put',
    data: data
  })
}

// 删除样品补送
export function delResend(id) {
  return request({
    url: '/sequencing/resend/' + id,
    method: 'delete'
  })
}

// 导出样品补送
export function exportResend(query) {
  return request({
    url: '/sequencing/resend/export',
    method: 'get',
    params: query
  })
}
