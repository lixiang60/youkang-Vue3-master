import request from '@/utils/request'

// 查询测序文件列表
export function listFile(query) {
  return request({
    url: '/sequencing/file/list',
    method: 'get',
    params: query
  })
}

// 查询测序文件详细
export function getFile(id) {
  return request({
    url: '/sequencing/file/' + id,
    method: 'get'
  })
}

// 新增测序文件
export function addFile(data) {
  return request({
    url: '/sequencing/file',
    method: 'post',
    data: data
  })
}

// 修改测序文件
export function updateFile(data) {
  return request({
    url: '/sequencing/file',
    method: 'put',
    data: data
  })
}

// 删除测序文件
export function delFile(id) {
  return request({
    url: '/sequencing/file/' + id,
    method: 'delete'
  })
}

// 导出测序文件
export function exportFile(query) {
  return request({
    url: '/sequencing/file/export',
    method: 'get',
    params: query
  })
}
