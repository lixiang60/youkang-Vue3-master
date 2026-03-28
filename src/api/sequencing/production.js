import request from '@/utils/request'

// 查询模板生产列表
export function listProduction(query) {
  return request({
    url: '/sequencing/production/list',
    method: 'get',
    params: query
  })
}

// 查询模板生产详细
export function getProduction(id) {
  return request({
    url: '/sequencing/production/' + id,
    method: 'get'
  })
}

// 新增模板生产
export function addProduction(data) {
  return request({
    url: '/sequencing/production',
    method: 'post',
    data: data
  })
}

// 修改模板生产
export function updateProduction(data) {
  return request({
    url: '/sequencing/production',
    method: 'put',
    data: data
  })
}

// 删除模板生产
export function delProduction(id) {
  return request({
    url: '/sequencing/production/' + id,
    method: 'delete'
  })
}

// 导出模板生产
export function exportProduction(query) {
  return request({
    url: '/sequencing/production/export',
    method: 'get',
    params: query
  })
}

// 查询模板生产列表 (对接 SampleInfoController.md)
export function listProduceTemplate(data) {
  return request({
    url: '/order/sample/template/produce/list',
    method: 'post',
    data: data
  })
}

// 设置模板状态
export function updateProduceTempStatus(data) {
  return request({
    url: '/order/sample/template/produce/tempStatus',
    method: 'post',
    data: data
  })
}

// 设置原浓度
export function updateProduceOriginConcentration(data) {
  return request({
    url: '/order/sample/template/produce/originConcentration',
    method: 'post',
    data: data
  })
}

// 模板生产退回
export function sendBackProduce(data) {
  return request({
    url: '/order/sample/template/produce/sendBack',
    method: 'post',
    data: data
  })
}

// PCR切胶查询
export function getPcrGelCutList(data) {
  return request({
    url: '/order/sample/template/produce/pcrGelCut',
    method: 'post',
    data: data
  })
}

// 查询重抽样品列表
export function getResampleList(data) {
  return request({
    url: '/order/sample/template/produce/resampleList',
    method: 'post',
    data: data
  })
}
