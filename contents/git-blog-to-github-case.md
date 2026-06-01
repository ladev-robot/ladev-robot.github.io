---
title: Case Study: Publish This Blog to GitHub (Enterprise Workflow)
description: A step-by-step, enterprise-style Git workflow to publish this Next.js blog to GitHub using SSH, protected main, feature branches, and pull requests.
excerpt: Push a local repo to GitHub with SSH, then run a complete PR-based workflow with branch protection and conventional commits.
datetime: 2026-06-01T10:45:00.000Z
slug: git-blog-to-github-case
featured: false
category: Git
tags:
  - git
  - workflow
  - case-study
author: Ao
language: Chinese
toc: true
---

本实战案例把「把本地博客系统托管到 GitHub」这件事，按公司常见流程跑通一次：**SSH 认证 → 远端仓库 → 保护 main → feature 分支 → PR 合并**。你后续维护博客，就按本文流程循环执行。

---

## 0. 约定与原则（企业级）

- **主干受保护**：`main` 不允许直接 push，只能通过 PR 合并。
- **分支命名清晰**：`feature/*`、`fix/*`、`chore/*`、`docs/*`。
- **提交可审计**：采用 Conventional Commits（如 `feat:`、`fix:`、`docs:`、`chore:`）。
- **仓库干净**：禁止提交构建产物（`.next/`）、依赖（`node_modules/`）、敏感信息（`.env*`）。

---

## Step_00：收敛工作区（让仓库可提交）

### 你要做什么

1. 在项目根目录运行：

```bash
git status -sb
```

2. 确认 `.gitignore` 至少包含：

```gitignore
/.next/
/node_modules
.env.local
.env.*.local
```

3. 如果发现“已经被追踪的产物文件”（例如误提交过的构建目录），需要取消追踪（保留本地文件）：\n
```bash
git rm -r --cached .next
git add .gitignore
git commit -m "chore: ignore build artifacts"
```

### 必要性（一句话）

企业流程的 Code Review 基于干净的 diff；构建产物/临时文件会污染历史并拖慢协作。

### 完成标准

- `git status -sb` 最终显示：`working tree clean`（或至少没有不该提交的产物/敏感文件）

---

## Step_01：做一次规范提交（Conventional Commits）

### 你要做什么

把当前应该提交的改动分组提交（示例）：

```bash
git add .
git commit -m "docs(git): update git guide and add case study"
```

### 必要性（一句话）

规范提交信息能提升可读性与可追溯性，便于回滚、审计、生成变更记录。

### 完成标准

- `git log --oneline -3` 能看到你刚刚的提交
- `git status -sb` 更接近干净状态

---

## Step_02：在 GitHub 创建空仓库

### 你要做什么（GitHub 网页）

1. 新建仓库（建议：不勾选初始化 README / .gitignore / License）
2. 记录以下信息（写到本文末尾“记录区”）：
   - 仓库名
   - 公有/私有
   - 默认分支（main）

### 必要性（一句话）

远端仓库是协作与备份的统一入口，也是启用分支保护与 PR 流程的前提。

---

## Step_03：配置 SSH Key 并验证连通性（Windows）

### 你要做什么

1. 生成 SSH Key（如你还没有）：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. 复制公钥内容（通常在 `~/.ssh/id_ed25519.pub`），添加到 GitHub：\n
GitHub → Settings → SSH and GPG keys → New SSH key

3. 验证：

```bash
ssh -T git@github.com
```

### 必要性（一句话）

企业通常禁用账号密码推送；SSH 能减少凭据泄露风险并提升日常操作效率。

---

## Step_04：绑定远程并首次推送（main）

### 你要做什么

将 `<you>`、`<repo>` 替换为你的 GitHub 信息：

```bash
git remote add origin git@github.com:<you>/<repo>.git
git remote -v
git push -u origin main
```

### 必要性（一句话）

首次 push 建立本地分支与远端的跟踪关系，后续 `git push` / `git pull` 更简单。

---

## Step_05：开启 main 分支保护（Branch Protection）

### 你要做什么（GitHub 网页）

Settings → Branches → Add branch protection rule：

- Branch name pattern：`main`
- 勾选：**Require a pull request before merging**
- （可选）勾选：**Require approvals**
- （建议）禁止 force push、禁止删除分支

### 必要性（一句话）

保护主干是企业协作的底线，防止误操作直接破坏稳定分支。

---

## Step_06：跑通一次完整 PR（feature → PR → merge）

### 你要做什么

1. 建分支并做一个很小的改动（例如改 README 一行）：

```bash
git switch -c feature/first-pr
```

2. 提交并 push：

```bash
git add .
git commit -m "docs: update readme"
git push -u origin feature/first-pr
```

3. 在 GitHub 创建 PR（base: `main`），合并（推荐 Squash merge 或 Merge commit，二选一团队统一即可）。
4. 合并后本地回到 main 并同步：

```bash
git switch main
git pull --rebase origin main
```

### 必要性（一句话）

PR 是企业协作的核心载体：代码评审、自动化检查、讨论与可追溯记录都依赖它。

---

## Step_07：可选：打 tag 标记发布点

```bash
git tag v0.1.0
git push origin v0.1.0
```

### 必要性（一句话）

tag 用来标记稳定可回滚的里程碑节点，便于发布、回退与对齐版本。

---

## 记录区（你填）

- GitHub 仓库：`git@github.com:<you>/<repo>.git`
- 分支保护规则：main 仅 PR 合并（是/否）
- 第一个 PR：`<PR URL>`

