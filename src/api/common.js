import request from '@/utils/request'

// 查询客户列表
export function listCustomerOption(query) {
  return request({
    url: '/customer/info/customerSelector',
    method: 'get',
    params: query
  })
}

// 查询课题组列表
export function listSubjectGroupOption(query) {
  return request({
    url: '/customer/info/subjectGroupSelector',
    method: 'get',
    params: query
  })
}

// 通用选择器列表
// type: paymentMethod, invoiceType, antibioticType,sampleType
export function listSelectorOption(type, query) {
  return request({
    url: '/common/selector/list',
    method: 'get',
    params: { type, ...query }
  })
}
