# 📂 测序业务模块（Sequencing Module）结构说明

本项目测序业务主要包含在 `src/views/sequencing/` 目录下，采用功能模块化的目录结构，每个子目录代表一个具体的业务环节。

## 1. 核心业务目录索引

| 目录路径 | 组件名称 | 功能描述 |
| :--- | :--- | :--- |
| `src/views/sequencing/order/` | `Order` | **测序订单管理**：处理原始订单录入、解析 Excel 模板及客户信息关联。 |
| `src/views/sequencing/samples/` | `Samples` | **测序样品管理**：生产编号维度的样品详情，包含清除数据、设置备注及加测反应等操作。 |
| `src/views/sequencing/template/` | `Template` | **模板排版管理**：管理物理板号与排版记录。 |
| `src/views/sequencing/production/` | `Production` | **模板生产管理**：设置模板状态（成功/失败/重抽）、原浓度设置及 PCR 切胶报表。 |
| `src/views/sequencing/reaction/` | `Reaction` | **反应生产管理**：核心流水线步骤。涉及添加板号/孔号、设置报告状态、机器分装及上机表预览。 |
| `src/views/sequencing/schedule/` | `Schedule` | **测序排列表/方案**：样品的排版方案规划与导出。 |
| `src/views/sequencing/report/` | `Report` | **报告结果管理**：最终测序报表的产出、状态追踪与导出。 |
| `src/views/sequencing/return/` | `Return` | **样品返还管理**：记录需返还给客户的质粒、菌液、引物等样品状态。 |
| `src/views/sequencing/primer/` | `Primer` | **测序引物管理**：管理测序所需的通用及特异性引物库。 |
| `src/views/sequencing/resend/` | `Resend` | **重发任务管理**：处理测序失败或其他原因导致的重测/重发逻辑。 |

## 2. 辅助/日志模块

| 目录路径 | 组件名称 | 功能描述 |
| :--- | :--- | :--- |
| `src/views/sequencing/email/` | `Email` | **邮件发送记录**：业务系统自动外发邮件的日志查询。 |
| `src/views/sequencing/file/` | `File` | **测序文件管理**：管理与测序订单相关的原始数据及附件。 |
| `src/views/sequencing/handover/` | `Handover` | **实验交接单**：记录不同实验环节间的样品移交信息。 |
| `src/views/sequencing/prereaction/` | `Prereaction` | **反应预做管理**：测序反应前的预实验或前置处理。 |
| `src/views/sequencing/resend_email/` | `Resend_email` | **重发邮件日志**：重发场景下的邮件交互记录。 |

## 3. 设计规范说明（2026/04/02 优化方案）

- **弹窗尺寸**：
  - 主体大表单：`900px` 或 `1000px`。
  - 二级业务操作弹窗：统一为 `750px`。
- **弹窗头部**：必须包含业务对应的 `el-icon` 图标。
- **样式统一**：所有业务弹窗内部统一使用 `.well-form` 网格布局类，确保输入标签对齐一致。
- **自适应**：备注框不再设置硬编码高度，确保在不同内容量下都能紧凑排列，避免出现大幅空白区。
