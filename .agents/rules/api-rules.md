---
trigger: model_decision
description: 后端接口文档与源码路径规则
---

# 📖 后端接口研发指南

## 1. 接口文档目录

本项目后端接口文档通过软连接关联在当前前端项目目录：

- **静态路径**：`doc/backend-doc下的相关接口文档`
- **使用建议**：在开发新功能或对接口存在疑问时，优先查阅此目录。

## 2. 后端源码参考 (Java)

只有当明确接口对接时 且 当接口文档描述不明确、缺失或需追查底层逻辑时，才扫描后端源码：

- **仓库根路径**：`/root/www/youkang/youkang-backend`
- **模块主路径**：`/root/www/youkang/youkang-backend/youkang-admin/src/main/java/com/youkang`
- **检索贴士**：
  - 加载全局搜索 `@RequestMapping("[接口路径]")` 或 `@GetMapping` 即可快速定位对应的 `Controller` 文件。
  - 参考 DTO/VO 类规范，对比前端接口传递的 JSON Key 是否与后端字段名保持一致，避免因名称不对称而导致请求异常。

## 3. 接口对接确定性原则

- **禁止盲目对接**：在开发过程中，若未得到明确的后端接口对接指示，**严禁**随意选定接口进行接入。
- **强制占位反馈**：在 API 未明确阶段，必须严格遵守 `dev-rules.md` 中的“接口占位规范”，通过 `proxy.$modal.msgWarning('API接入中...')` 告知用户。
- **数据驱动视图调整**：一旦明确目标接口，应立即根据接口定义的 DTO/VO 字段，同步调整前端页面的表单结构、表格列名及其数据映射逻辑，确保前后端字段严格对齐。