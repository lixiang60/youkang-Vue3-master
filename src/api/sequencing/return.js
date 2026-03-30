import request from '@/utils/request'

// 查询返还管理列表 (Doc 7.1)
export function listReturn(data) {
  return request({
    url: '/order/reimburse/list',
    method: 'post',
    data: data
  })
}

// 查询返还管理详细 (Doc 7.2)
export function getReturn(id) {
  return request({
    url: '/order/reimburse/' + id,
    method: 'get'
  })
}

// 确认返还 (Doc 7.3)
export function confirmReturn(data) {
  return request({
    url: '/order/reimburse/confirm',
    method: 'post',
    data: data
  })
}

// 删除返还管理 (Doc 7.4)
export function delReturn(data) {
  return request({
    url: '/order/reimburse/remove',
    method: 'post',
    data: data
  })
}

// 导出返还管理
export function exportReturn(data) {
  return request({
    url: '/order/reimburse/export',
    method: 'post',
    data: data
  })
}
