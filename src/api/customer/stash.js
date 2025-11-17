import request from '@/utils/request'

// 查询客户暂存列表
export function listStash(query) {
  return request({
    url: '/customer/stash/list',
    method: 'get',
    params: query
  })
}

// 查询客户暂存详细
export function getStash(id) {
  return request({
    url: '/customer/stash/' + id,
    method: 'get'
  })
}

// 新增客户暂存
export function addStash(data) {
  return request({
    url: '/customer/stash',
    method: 'post',
    data: data
  })
}

// 修改客户暂存
export function updateStash(data) {
  return request({
    url: '/customer/stash',
    method: 'put',
    data: data
  })
}

// 删除客户暂存
export function delStash(id) {
  return request({
    url: '/customer/stash/' + id,
    method: 'delete'
  })
}

// 导出客户暂存
export function exportStash(query) {
  return request({
    url: '/customer/stash/export',
    method: 'get',
    params: query
  })
}
