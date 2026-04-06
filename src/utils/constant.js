/**
 * 公共常量定义
 */

// 所属公司列表 (分支机构)
export const COMPANY_OPTIONS = [
  { label: '杭州有康', value: '杭州有康' },
  { label: '北京有康', value: '北京有康' },
  { label: '上海有康', value: '上海有康' },
  { label: '广州有康', value: '广州有康' },
  { label: '深圳有康', value: '深圳有康' },
  { label: '成都有康', value: '成都有康' },
  { label: '武汉有康', value: '武汉有康' },
  { label: '西安有康', value: '西安有康' },
  { label: '福州有康', value: '福州有康' },
  { label: '长沙有康', value: '长沙有康' },
  { label: '昆明有康', value: '昆明有康' },
  { label: '南昌有康', value: '南昌有康' },
  { label: '郑州有康', value: '郑州有康' },
  { label: '青岛有康', value: '青岛有康' },
  { label: '天津有康', value: '天津有康' },
  { label: '合肥有康', value: '合肥有康' },
  { label: '新疆有康', value: '新疆有康' }
]

// 地区列表
export const REGION_OPTIONS = [
  { label: '杭州', value: '杭州' },
  { label: '成都', value: '成都' },
  { label: '新疆', value: '新疆' },
  { label: '合肥', value: '合肥' },
  { label: '广州', value: '广州' },
  { label: '长沙', value: '长沙' },
  { label: '郑州', value: '郑州' },
  { label: '南京', value: '南京' },
  { label: '武汉', value: '武汉' },
  { label: '青岛', value: '青岛' },
  { label: '天津', value: '天津' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '西安', value: '西安' },
  { label: '福州', value: '福州' },
  { label: '昆明', value: '昆明' },
  { label: '南昌', value: '南昌' },
  { label: '深圳', value: '深圳' }
]

// 结算方式选项
export const PAYMENT_METHOD_OPTIONS = [
  { label: '现金结算', value: '现金结算' },
  { label: '支票结算', value: '支票结算' },
  { label: '转账汇款', value: '转账汇款' },
  { label: '月结', value: '月结' },
  { label: '预付款', value: '预付款' },
  { label: '内部结算', value: '内部结算' }
]

// 收费名称选项 (分级)
export const CHARGE_NAME_OPTIONS = [
  {
    label: '测序',
    value: '测序',
    options: [
      { label: '测序单价', value: '测序单价' },
      { label: 'PCR扩增', value: 'PCR扩增' },
      { label: '克隆', value: '克隆' },
      { label: '四代价格', value: '四代价格' }
    ]
  },
  {
    label: '合成',
    value: '合成',
    options: [
      { label: '10-59bp-OPC', value: '10-59bp-OPC' },
      { label: '10-59bp-PAGE', value: '10-59bp-PAGE' },
      { label: '60-79bp-OPC', value: '60-79bp-OPC' },
      { label: '测序引物', value: '测序引物' },
      { label: '大干89bp-PA', value: '大干89bp-PA' },
      { label: '小干16bp-HP', value: '小干16bp-HP' },
      { label: 'CY3', value: 'CY3' },
      { label: 'CY5', value: 'CY5' }
    ]
  }
]
