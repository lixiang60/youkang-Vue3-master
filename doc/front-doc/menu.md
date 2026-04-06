## 新增菜单

/system/menu
请求方法
POST

```json
{
  "parentId": 2018,
  "menuName": "反应生产",
  "icon": "education",
  "menuType": "C",
  "orderNum": 12,
  "isFrame": "1",
  "isCache": "0",
  "visible": "0",
  "status": "0",
  "path": "reaction",
  "component": "sequencing/reaction/index",
  "perms": "sequencing:reaction:list"
}

  {
    "parentId": 2018,
    "menuName": "反应预做",
    "icon": "monitor",
    "menuType": "C",
    "orderNum": 13,
    "isFrame": "1",
    "isCache": "0",
    "visible": "0",
    "status": "0",
    "path": "prereaction",
    "component": "sequencing/prereaction/index",
    "perms": "sequencing:prereaction:list"
  }
```
