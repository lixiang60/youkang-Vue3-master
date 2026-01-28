import request from '@/utils/request'

// 查询测序样品列表
export function listSamples(query) {
  return request({
    url: '/sequencing/samples/list',
    method: 'get',
    params: query
  })
}

// 查询测序样品详细
export function getSamples(id) {
  return request({
    url: '/sequencing/samples/' + id,
    method: 'get'
  })
}

// 新增测序样品
export function addSamples(data) {
  return request({
    url: '/sequencing/samples',
    method: 'post',
    data: data
  })
}

// 修改测序样品
export function updateSamples(data) {
  return request({
    url: '/sequencing/samples',
    method: 'put',
    data: data
  })
}

// 删除测序样品
export function delSamples(id) {
  return request({
    url: '/sequencing/samples/' + id,
    method: 'delete'
  })
}


// 导出测序样品
export function exportSamples(query) {
  return request({
    url: '/sequencing/samples/export',
    method: 'get',
    params: query
  })
}

// 批量添加测序样品
export function batchAddSample(data) {
  return request({
    url: '/sequencing/samples/importData',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
