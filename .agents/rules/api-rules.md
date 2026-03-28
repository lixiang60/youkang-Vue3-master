---
trigger: always_on
description: 后端接口文档与源码路径规则
---

# 📖 后端接口研发指南

## 1. 接口文档目录

本项目后端接口文档通过软连接关联在当前前端项目目录：

- **静态路径**：`doc/API-订单管理接口文档.md`
- **实际指向**：`/root/www/youkang/youkang-backend/docs/API-订单管理接口文档.md`
- **使用建议**：在开发新功能或对接口存在疑问时，优先查阅此目录。

## 2. 后端源码参考 (Java)

当接口文档描述不明确、缺失或需追查底层逻辑时，可直接参考后端源码：

- **仓库根路径**：`/root/www/youkang/youkang-backend`
- **模块主路径**：`/root/www/youkang/youkang-backend/youkang-admin/src/main/java/com/youkang`
- **检索贴士**：
  - 加载全局搜索 `@RequestMapping("[接口路径]")` 或 `@GetMapping` 即可快速定位对应的 `Controller` 文件。
  - 参考 DTO/VO 类规范，对比前端接口传递的 JSON Key 是否与后端字段名保持一致，避免因名称不对称而导致请求异常。
