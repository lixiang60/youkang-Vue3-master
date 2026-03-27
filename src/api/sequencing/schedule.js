import request from '@/utils/request'

// 查询模板排版列表
export function listSchedule(query) {
  return request({
    url: '/sequencing/schedule/list',
    method: 'get',
    params: query
  })
}

// 查询模板排版详细
export function getSchedule(id) {
  return request({
    url: '/sequencing/schedule/' + id,
    method: 'get'
  })
}

// 新增模板排版
export function addSchedule(data) {
  return request({
    url: '/sequencing/schedule',
    method: 'post',
    data: data
  })
}

// 修改模板排版
export function updateSchedule(data) {
  return request({
    url: '/sequencing/schedule',
    method: 'put',
    data: data
  })
}

// 删除模板排版
export function delSchedule(id) {
  return request({
    url: '/sequencing/schedule/' + id,
    method: 'delete'
  })
}

// 导出模板排版
export function exportSchedule(query) {
  return request({
    url: '/sequencing/schedule/export',
    method: 'get',
    params: query
  })
}

// 查询模板列表 (对接 SampleInfoController.md)
export function listLayoutTemplate(data) {
  return request({
    url: '/order/sample/template/list',
    method: 'post',
    data: data
  })
}
// 添加模板板号和孔号
export function updateTemplateNo(data) {
  return request({
    url: '/order/sample/template/updateTemplateNo',
    method: 'post',
    data: data
  })
}

// 排版忽略
export function ignoreTemp(data) {
  return request({
    url: '/order/sample/template/ignoreTemp',
    method: 'get',
    data: data
  })
}

// 模板BDT
export function templateBDT(data) {
  return request({
    url: '/order/sample/template/templateBDT',
    method: 'post',
    data: data
  })
}
