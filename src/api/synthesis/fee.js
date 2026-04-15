import request from '@/utils/request'

// 查询合成费用列表
export function listFee(query) {
  return request({
    url: '/synthesis/fee/list',
    method: 'get',
    params: query
  })
}

// 订单款项处理
export function handleOrderPaymentApi(data) {
  return request({
    url: '/synthesis/fee/payment',
    method: 'post',
    data: data
  })
}

// 计算/获取订单款项详细
export function calcSynthesisPrice(orderId) {
  return request({
    url: '/synthesis/fee/calcPrice/' + orderId,
    method: 'get'
  })
}
