import request from '@/utils/request'

// 查询客户管理列表
export function listManage(query) {
  return request({
    url: '/customer/info/list',
    method: 'get',
    params: query
  })
}

// 查询客户管理详细
export function getManage(id) {
  return request({
    url: '/customer/info/' + id,
    method: 'get'
  })
}

// 新增客户管理
export function addManage(data) {
  return request({
    url: '/customer/info/add',
    method: 'post',
    data: data
  })
}

// 修改客户管理
export function updateManage(data) {
  return request({
    url: '/customer/info/edit',
    method: 'put',
    data: data
  })
}

// 删除客户管理
export function delManage(id) {
  return request({
    url: '/customer/info/' + id,
    method: 'delete'
  })
}

// 导出客户管理
export function exportManage(query) {
  return request({
    url: '/customer/info/export',
    method: 'post',
    params: query
  })
}
    
