import request from '@/utils/request'

// 查询合成订单审核列表
export function listAudit(query) {
  return request({
    url: '/synthesis/audit/list',
    method: 'get',
    params: query
  })
}

// 审核通过/驳回
export function auditOrder(data) {
  return request({
    url: '/synthesis/audit/audit',
    method: 'post',
    data: data
  })
}
