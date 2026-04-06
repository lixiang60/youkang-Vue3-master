# 🛡️ Git Hooks & 代码规范约束指南

本项目集成了 **Husky** + **Lint-staged** + **ESLint** + **Prettier**，旨在通过自动化的方式确保团队代码风格统一且无低级错误。

---

## 1. 核心组件说明

- **Husky**: 管理 Git Hooks 的工具（如 `pre-commit`），在提交代码的不同阶段触发脚本。
- **Lint-staged**: 只针对 Git 暂存区（Staged）中的文件运行校验，提高检查效率。
- **ESLint**: JavaScript/Vue 代码静态分析工具，发现并修复潜在问题。
- **Prettier**: 代码格式化工具，统一样式。

---

## 2. 安装与启用 (Installation)

### 2.1 依赖安装
对于新拉取的项目或新成员，请确保在根目录下执行：
```bash
yarn install
```
> **注意**：执行 `yarn install` 后，脚本会自动运行 `husky install`（基于 `package.json` 中的 `prepare` 脚本），激活 Git 钩子。

### 2.2 验证是否启用
如果根目录下存在 `.husky/_` 目录，且具备可执行权限，则说明已成功激活。

### 2.3 背景原理 (Original Setup Principles)
本项目初始化该功能时的原始操作步骤与核心逻辑如下，旨在帮助您理解其实现机制：

1.  **项目初始化**：通过 `npx -y husky-init` 自动创建 `.husky` 文件夹并配置 `pre-commit` 模板。
2.  **Git Hooks 劫持**：运行 `husky install`。
    *   **核心原理**：Git 默认从 `.git/hooks` 查找钩子，但该目录无法被版本控制系统追踪。Husky 通过设置 Git 的 `core.hooksPath` 指向项目中的 `.husky` 目录，从而实现了钩子脚本的项目级共享。
3.  **精确任务调度**：集成 `lint-staged`。
    *   **核心原理**：`lint-staged` 会实时查询 Git 暂存区中发生变更的文件列表，并将这些文件作为参数直接传递给本地安装的 `eslint` 或 `prettier` 执行任务，确保校验的高效率（只针对受影响的文件）。
4.  **本地运行解耦**：将脚本从 `npx` 改为显式调用本地命令（如 `yarn lint-staged`）。
    *   **核心原理**：避免了 `npx` 在执行时可能产生的网络请求（检查更新或重新下载包），通过直接使用 `node_modules` 下的二进制程序，极大提升了本地 commit 时的执行效率。

---

## 3. 自动化约束流程 (Workflow)

当开发者在终端运行 `git commit` 时，系统将自动触发以下流程：

1.  **启动钩子**：触发 `.husky/pre-commit`。
2.  **触发校验**：运行 `yarn lint-staged`。
3.  **精确筛选**：`lint-staged` 筛选出本次 `git add` 的 `.js` 和 `.vue` 文件。
4.  **自动修复 & 强制校验**：
    -   运行 `eslint --fix`：自动修正代码风格和发现潜在逻辑隐患。
    -   运行 `prettier --write`：按照 `.prettierrc` 规则自动格式化。
5.  **提交结果**：
    -   **通过**：所有文件符合规范，完成 commit。
    -   **失败**：若存在不可自动修复的严重错误（如语法错误）， commit 将被**强行拦截**，开发者需修复后重试。

---

## 4. 常用操作命令

### 🛠️ 正常开发模式
您无需任何特殊操作，只需执行常规 Git 流程：
```bash
git add .
git commit -m "feat: xxx"  # 此时会自动触发校验与修复
```

### ⚡ 强制跳过 (不推荐)
若在某些紧急场景下必须跳过所有校验直接提交，可使用 `--no-verify` 参数：
```bash
git commit -m "chore: temp save" --no-verify
```

### 🧹 手动全局整理
如果您想一次性整理整个项目的所有代码：
```bash
# 执行 ESLint 自动修复
yarn lint:fix

# 执行 Prettier 全局格式化
yarn format
```

---

## 5. 关键配置文件

- **`.eslintrc.cjs`**: ESLint 校验规则配置。
- **`.prettierrc`**: Prettier 格式化偏好（单双引号、分号等）。
- **`package.json`**: 包含 `lint-staged` 的文件过滤逻辑。
- **`.husky/`**: Git 钩子脚本存放目录。

---

## 6. 注意事项
- 请确保本地开发环境已执行 `yarn install` 以安装必要的依赖。
- 建议安装 VSCode 的 **ESLint** 和 **Prettier** 插件，以便在编写过程中实时感知规范。
