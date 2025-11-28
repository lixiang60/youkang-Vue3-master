import request from '@/utils/request'

// 查询模板管理列表
export function listTemplate(query) {
  return request({
    url: '/sequencing/template/list',
    method: 'get',
    params: query
  })
}

// 查询模板管理详细
export function getTemplate(id) {
  return request({
    url: '/sequencing/template/' + id,
    method: 'get'
  })
}

// 新增模板管理
export function addTemplate(data) {
  return request({
    url: '/sequencing/template',
    method: 'post',
    data: data
  })
}

// 修改模板管理
export function updateTemplate(data) {
  return request({
    url: '/sequencing/template',
    method: 'put',
    data: data
  })
}

// 删除模板管理
export function delTemplate(id) {
  return request({
    url: '/sequencing/template/' + id,
    method: 'delete'
  })
}

// 导出模板管理
export function exportTemplate(query) {
  return request({
    url: '/sequencing/template/export',
    method: 'get',
    params: query
  })
}
