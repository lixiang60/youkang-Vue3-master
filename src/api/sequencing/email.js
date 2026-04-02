import request from '@/utils/request'

// 查询报告邮件列表
export function listEmail(query) {
  return request({
    url: '/sequencing/email/list',
    method: 'get',
    params: query
  })
}

// 查询报告邮件详细
export function getEmail(id) {
  return request({
    url: '/sequencing/email/' + id,
    method: 'get'
  })
}

// 新增报告邮件
export function addEmail(data) {
  return request({
    url: '/sequencing/email',
    method: 'post',
    data: data
  })
}

// 修改报告邮件
export function updateEmail(data) {
  return request({
    url: '/sequencing/email',
    method: 'put',
    data: data
  })
}

// 删除报告邮件
export function delEmail(id) {
  return request({
    url: '/sequencing/email/' + id,
    method: 'delete'
  })
}

// 查询模板失败样品列表
export function listTemplateFailedSamples() {
  return request({
    url: '/order/sample/template/produce/templateFailedList',
    method: 'get'
  })
}

// 导出报告邮件
export function exportEmail(query) {
  return request({
    url: '/sequencing/email/export',
    method: 'get',
    params: query
  })
}

// 查询模板邮件列表 (对接模板生产接口)
export function listEmailProduce(data) {
  return request({
    url: '/order/sample/template/produce/list',
    method: 'post',
    data: {
      ...data,
      flowName: '模板邮件'
    }
  })
}

// 查询报告邮件列表
export function listReportEmailProduce(data) {
  return request({
    url: '/order/sample/template/produce/list',
    method: 'post',
    data: {
      ...data,
      flowName: '报告邮件'
    }
  })
}
