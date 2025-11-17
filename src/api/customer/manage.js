import request from '@/utils/request'

// 查询客户管理列表
export function listManage(query) {
  return request({
    url: '/customer/manage/list',
    method: 'get',
    params: query
  })
}

// 查询客户管理详细
export function getManage(id) {
  return request({
    url: '/customer/manage/' + id,
    method: 'get'
  })
}

// 新增客户管理
export function addManage(data) {
  return request({
    url: '/customer/manage',
    method: 'post',
    data: data
  })
}

// 修改客户管理
export function updateManage(data) {
  return request({
    url: '/customer/manage',
    method: 'put',
    data: data
  })
}

// 删除客户管理
export function delManage(id) {
  return request({
    url: '/customer/manage/' + id,
    method: 'delete'
  })
}

// 导出客户管理
export function exportManage(query) {
  return request({
    url: '/customer/manage/export',
    method: 'get',
    params: query
  })
}
