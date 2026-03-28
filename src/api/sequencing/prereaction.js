import request from '@/utils/request'

// 查询反应预做列表
export function listPrereaction(data) {
  return request({
    url: '/order/sample/list',
    method: 'post',
    data: {
      ...data,
      flowName: '反应预做'
    }
  })
}

// 查询反应预做详细
export function getPrereaction(produceId) {
  return request({
    url: '/order/sample/' + produceId,
    method: 'get'
  })
}

// 新增反应预做
export function addPrereaction(data) {
  return request({
    url: '/order/sample',
    method: 'post',
    data: data
  })
}

// 修改反应预做
export function updatePrereaction(data) {
  return request({
    url: '/order/sample',
    method: 'put',
    data: data
  })
}

// 删除反应预做
export function delPrereaction(produceIdList) {
  return request({
    url: '/order/sample/' + produceIdList,
    method: 'delete'
  })
}

// 确认反应预做
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
