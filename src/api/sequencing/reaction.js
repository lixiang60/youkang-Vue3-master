import request from '@/utils/request'

// 查询反应生产列表
export function listReactionProduce(data) {
  return request({
    url: '/order/sample/template/produce/list',
    method: 'post',
    data: data
  })
}

// 设置原浓度
export function updateReactionOriginConcentration(data) {
  return request({
    url: '/order/sample/reactionProduce/originConcentration',
    method: 'post',
    data: data
  })
}

// 批量添加板号和孔号
export function updateReactionPlate(data) {
  return request({
    url: '/order/sample/reactionProduce/plate',
    method: 'post',
    data: data
  })
}

// 单个添加孔号
export function updateReactionHoleNo(data) {
  return request({
    url: '/order/sample/reactionProduce/holeNo',
    method: 'post',
    data: data
  })
}

// 测序BDT
export function getSequencingBDT(data) {
  return request({
    url: '/order/sample/reactionProduce/sequencingBDT',
    method: 'post',
    data: data
  })
}

// 反应停止
export function reactionStop(data) {
  return request({
    url: '/order/sample/reactionStop',
    method: 'post',
    data: data
  })
}

// 样品不足
export function sampleInsufficient(data) {
  return request({
    url: '/order/sample/sampleInsufficient',
    method: 'post',
    data: data
  })
}

// 重新做反应
export function reactionPre(data) {
  return request({
    url: '/order/sample/reactionPre',
    method: 'post',
    data: data
  })
}

// 反应预做退回
export function reactionPreSendBack(data) {
  return request({
    url: '/order/sample/reactionPreSendBack',
    method: 'post',
    data: data
  })
}

// 设置报告状态
export function updateReactionReportStatus(data) {
  return request({
    url: '/order/sample/reactionProduce/status',
    method: 'post',
    data: data
  })
}
