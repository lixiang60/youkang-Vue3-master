import request from '@/utils/request'

// 查询报告生产列表 (与反应生产接口一样)
export function listReport(data) {
  return request({
    url: '/order/sample/template/produce/list',
    method: 'post',
    data: {
      ...data,
      flowName: '报告生产'
    }
  })
}

// 修改报告状态 (6.1)
export function updateReportStatus(data) {
  return request({
    url: '/order/sample/reportStatus/update',
    method: 'post',
    data: data
  })
}

// 毛细管添加 (6.2)
export function addCapillary(data) {
  return request({
    url: '/order/sample/capillaryAdd',
    method: 'post',
    data: data
  })
}
