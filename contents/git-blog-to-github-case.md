---
title: GitHub 同步手册：Next.js 博客
description: 企业级 GitHub 发布流程：SSH、PR、保护分支、CI 门禁、日常维护。
excerpt: 从首次上云到日常迭代，逐步完成 SSH、分支保护与 CI 门禁，保证换机 clone 后可构建与开发。
datetime: 2026-06-01T10:45:00.000Z
slug: git-blog-to-github-case
featured: false
category: Git
tags:
  - git
author: Ao
language: Chinese
toc: true
---

本手册是"将本 Next.js 博客同步到 GitHub"的完整实操记录，覆盖**首次上云 → PR 流程 → CI 门禁 → 日常维护**全链路。

命令默认以 **Windows PowerShell** 为准，均可逐行复制执行。占位符统一使用 `<you>`、`<repo>`、`<email>`，替换后再运行。

参考背景：[Git 从入门到实战](/blog/posts/git-workflow-guide)。

---

## 企业级约定（必读）

| 约定 | 规则 |
| --- | --- |
| 主干保护 | `main` 只允许 PR 合并；禁止直接 push；建议对管理员也生效 |
| 分支命名 | `feature/*` 新功能、`fix/*` 修复、`chore/*` 工程配置、`docs/*` 文档 |
| 提交规范 | Conventional Commits：`feat:`、`fix:`、`docs:`、`chore:` |
| 仓库洁净 | 不提交 `.next/`、`node_modules/`、`.env.local` |
| 合并方式 | PR 优先 **Squash merge**（保持 main 线性历史） |

---

## 分支职责一览

```
main                   ← 唯一稳定主干，只接受 PR 合并，不直接提交
  ↑ Squash merge
  feature/<name>       ← 新功能开发
  fix/<name>           ← bug 修复
  chore/<name>         ← 工程/配置类改动（CI、依赖、.gitignore 等）
  docs/<name>          ← 纯文档改动（README、博客文章等）
```

**哪些文件放在哪个分支：**

- **所有对源码/文档/配置的改动**都在功能分支上提交，经 PR → `main`
- **不允许**直接在 `main` 上写代码或 `git commit`
- `main` 永远是"最近一次合并后的可构建版本"

---

## 预设变量（建议执行一次）

```powershell
# 替换为你的实际 SSH 地址（示例：git@github.com:ladev-robot/Blog.git）
$RepoSshUrl = "git@github.com:<you>/<repo>.git"
```

---

## Step_00：收敛工作区（Clean Working Tree）

### 目的

确保提交历史与 PR diff 不被构建产物/本地配置污染；这是所有后续步骤的前提。

### 执行命令

```powershell
git status -sb    # -s: short 输出；-b: 显示当前分支与跟踪信息
```

### 关键点

- 输出里出现 `.next/`、`node_modules/`、`.env.local` 等属于异常（应被 `.gitignore` 过滤）。
- 只有"源码/文档/配置"类文件显示为 `M`（Modified）或 `??`（Untracked）才是正常待提交改动。

### 验证（通过标准）

输出里 **不包含**：`.next/`、`node_modules/`、`.env.local`

### 常见失败与处理

**构建产物被误追踪（已进入 Git 索引）**：

```powershell
git rm -r --cached .next    # --cached: 只从索引移除，保留本地文件
git add .gitignore
git commit -m "chore: stop tracking build artifacts"
```

### 回传命令

```powershell
git status -sb
```

---

## Step_01：规范提交（Atomic Commits）

### 目的

push 到远端前，把本地改动拆成可审计的最小单元，让 PR diff 清晰可读。

### 哪些文件应该提交

本仓库当前改动分三类，建议按类分 3 次 commit：

| commit | 文件 | type |
| --- | --- | --- |
| 文档 | `README.md`、`contents/*.md` | `docs:` |
| 工程配置 | `package.json`、`package-lock.json` | `chore:` |
| 代码修复 | `utils/api.ts`、`scripts/migrate-git-notes.mjs` | `fix:` |

### 执行命令

```powershell
# commit 1：文档
git add README.md contents/git-blog-to-github-case.md
git commit -m "docs: add GitHub sync manual"

# commit 2：工程配置（Node 版本约束）
git add package.json package-lock.json
git commit -m "chore: pin Node engine to 18.17+"

# commit 3：代码修复
git add utils/api.ts scripts/migrate-git-notes.mjs
git commit -m "fix: scope content reads to markdown files only"
```

### 参数说明

- `git add <path>`：只暂存指定文件；避免无关改动混入同一 commit。
- `-m "<type>: <subject>"`：type 让变更可机器分类；subject 说"做了什么"。

### 验证（通过标准）

```powershell
git log --oneline -5    # 能看到刚才的 3 条提交
git status -sb          # 工作区干净（无待提交行）
```

### 常见失败与处理

**`cannot pull with rebase: You have unstaged changes`**：

```powershell
git stash -u            # -u: 包含未跟踪文件；临时储藏
git pull --rebase
git stash pop           # 恢复储藏的改动
```

### 回传命令

```powershell
git log --oneline -5
git status -sb
```

---

## Step_02：创建 GitHub 空仓库（Remote Repository）

### 目的

建立远端作为备份与协作入口；空仓库可避免首次 push 产生历史冲突。

### 执行操作（GitHub 网页）

1. GitHub → **New repository**
2. 可见性：先选 **Private**
3. **不要**勾选"Add a README / .gitignore / License"（本地已有历史）
4. 创建后复制 SSH 地址（形如 `git@github.com:<you>/<repo>.git`）→ 填入本文末尾"记录区"

### 验证（通过标准）

- 仓库存在，且为空（无任何 commit）

### 回传信息

- 你的仓库 SSH 地址

---

## Step_03：配置 SSH（Authentication）

### 目的

企业默认推荐 SSH 作为开发机鉴权；一次配置，长期可用，不经 HTTPS 明文传输凭据。

### 执行命令

```powershell
# 检查是否已有密钥
Get-ChildItem "$HOME/.ssh"

# 若无 id_ed25519，生成密钥对
ssh-keygen -t ed25519 -C "<email>"
# -t ed25519: 算法，比 RSA 更短更安全
# -C "<email>": 注释，方便在 GitHub 识别用途

# 复制公钥内容（粘贴到 GitHub）
Get-Content "$HOME/.ssh/id_ed25519.pub"

# 验证 SSH 连通性
ssh -T git@github.com
# 期望输出：Hi <username>! You've successfully authenticated...
```

### 关键点

- `ssh -T`：只测试认证；GitHub 不提供 shell，成功时会说"no shell access"，这是正常的。
- 私钥 `id_ed25519` 保留在本机；公钥 `id_ed25519.pub` 粘贴到 GitHub。

### GitHub 侧操作

GitHub → **Settings** → **SSH and GPG keys** → **New SSH key** → 粘贴公钥内容 → 保存。

### 常见失败与处理

- **`Permission denied (publickey)`**：公钥未添加到 GitHub，或 SSH agent 未加载私钥：

```powershell
ssh-add "$HOME/.ssh/id_ed25519"    # 向 agent 注册私钥
ssh -T git@github.com
```

### 回传命令

```powershell
ssh -T git@github.com
```

---

## Step_04：绑定远程并首次 push（Set Upstream）

### 目的

建立本地 `main` 与远端 `origin/main` 的跟踪关系，后续 `git push` / `git pull` 可省略分支名。

### 执行命令

```powershell
git remote add origin $RepoSshUrl    # 给远端地址起别名 origin
git remote -v                        # -v: 查看 fetch/push 地址（核对正确）
git push -u origin main
# -u (--set-upstream): 设置跟踪关系
# origin: 推到哪个远端
# main: 推本地哪个分支
```

### 验证（通过标准）

```powershell
git remote -v
git status -sb    # 期望看到 ## main...origin/main
```

### 常见失败与处理

**`error: remote origin already exists`**：

```powershell
git remote set-url origin $RepoSshUrl    # 更新已有 origin 的地址
```

### 回传命令

```powershell
git remote -v
git status -sb
```

---

## Step_05：保护 main 分支（Branch Protection）

### 目的

把"主干稳定"变成系统门禁：未经 PR 不允许进入 `main`，防止误操作破坏可构建状态。

### 注意：Rulesets vs Branch protection

- **个人私有仓库（GitHub Free）**：Rulesets 不强制执行（会看到警告提示），应使用 **Branch protection rules**。
- **组织/Team 仓库**：可优先用 Rulesets，但 Branch protection 兼容性更广。

### 执行操作（GitHub 网页）

**Settings** → **Branches** → **Branch protection rules** → **Add rule**：

| 选项 | 设置 |
| --- | --- |
| Branch name pattern | `main` |
| Require a pull request before merging | 勾选 |
| Required approvals | 个人项目设 `0`；团队建议 `1` |
| Restrict deletions | 勾选（防止意外删除 main） |
| Allow force pushes | 不勾（禁止强推） |
| Include administrators | 建议勾选（管理员也受限） |
| Require status checks | **先不开**（等 Step_06 CI 跑通后再选 `lint`/`build`） |

### 验证（必须做）

用"直接 push main"确认门禁生效：

```powershell
echo "branch-protection-test" >> .protection-test.txt
git add .protection-test.txt
git commit -m "chore: branch protection test"
git push origin main    # 期望：被拒绝
```

期望输出包含：`remote: error: GH006: Protected branch update failed` 或类似拒绝信息。

### 常见失败与处理

- push 仍成功 → 检查以下三项：
  1. 规则的 Branch name pattern 是否精确匹配 `main`
  2. 是否未勾选 **Include administrators**（管理员绕过）
  3. 是否未勾选 **Require a pull request before merging**

### 回传信息

- `git push origin main` 的完整终端输出（成功/失败均粘贴）

---

## Step_06：第一个 PR（完整流程演练）

### 目的

演练完整的 PR 工作流：建分支 → 提交文件 → push → 创建 PR → CI 检查 → 合并回 main → 本地同步。

### 6.1 新建功能分支

```powershell
git switch main                      # 确保从最新 main 切出
git pull --rebase origin main        # 拉取最新（若有多台机器）
git switch -c chore/clone-ready      # -c: 新建并切换分支
```

### 6.2 补齐 Clone 就绪文件

在分支上确认/补充以下文件（缺哪个补哪个）：

| 文件 | 作用 | 操作 |
| --- | --- | --- |
| `package-lock.json` | 锁定依赖版本，`npm ci` 的前提 | 应已存在 |
| `.env.example` | 环境变量模板（无真实密钥） | 应已存在 |
| `README.md` | Prerequisites + Quick start | 应已存在 |
| `.nvmrc` | 固定 Node 版本（内容：`18`） | 如无则新建 |
| `.github/workflows/ci.yml` | PR 自动 lint + build | 如无则新建（见下方模板） |

**`.github/workflows/ci.yml` 最小模板：**

```yaml
name: CI
on:
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

### 6.3 提交并推送到功能分支

```powershell
git add .
git commit -m "chore: add CI and clone-ready tooling"
git push -u origin chore/clone-ready
# -u: 首次推送时设置跟踪关系
```

### 6.4 创建 PR（GitHub 网页）

1. GitHub 会显示"Compare & pull request"提示，点击创建
2. **Base**：`main`，**Compare**：`chore/clone-ready`
3. 填写 PR 标题（建议与 commit message 保持一致）
4. 等待 CI（GitHub Actions）运行：绿色 ✓ 才允许合并

### 6.5 合并 PR

CI 通过后，选择 **Squash and merge**（将分支所有提交压缩为一个 commit 进入 main）：

- 使用 Squash merge 的原因：保持 `main` 历史线性整洁，每个功能对应一条 commit。

### 6.6 合并后本地同步

```powershell
git switch main
git pull --rebase origin main        # 拉取合并后的最新 main
git branch -d chore/clone-ready      # -d: 删除已合并的本地分支（可选）
```

### 验证（通过标准）

```powershell
git log --oneline -5    # 能看到刚才 squash 进来的 commit
git branch              # chore/clone-ready 已删除（若执行了 -d）
```

### 回传信息

- PR 链接
- `git log --oneline -5` 输出

---

## Step_07：启用 Status Checks 门禁

### 目的

CI 跑通之后，把"必须 CI 通过"加进分支保护，让合并门禁有自动化质量保障。

### 执行操作（GitHub 网页）

回到 Step_05 配置的分支保护规则，编辑：

1. 勾选 **Require status checks to pass before merging**
2. 点击 **Add checks** → 搜索并选择 `build`（即 ci.yml 中的 job 名称）
3. 保存

### 验证（通过标准）

在一个测试 PR 里，CI 未通过时合并按钮应变为灰色/不可用。

---

## Step_08：打 tag（可选，Release Point）

### 目的

标记可回滚的里程碑，便于后续对齐版本与快速定位发布点。

### 执行命令

```powershell
git switch main
git pull --rebase origin main        # 确保 tag 打在最新 main 上
git tag -a v0.1.0 -m "initial public release"
# -a: annotated tag（包含作者、日期、说明）
# -m: tag 说明
git push origin v0.1.0              # 把 tag 推到远端
```

### 验证

```powershell
git tag                              # 本地查看所有 tag
```

GitHub → Repository → **Tags** 页面也能看到。

---

## Step_09：换机 Clone 验收（Clone-and-Build）

### 目的

在全新环境验证"仓库具备可移植性"：clone 后能直接安装依赖并构建，不依赖任何本机特有配置。

### 执行命令

```powershell
# 在全新目录（不是原项目目录）执行
git clone $RepoSshUrl blog-test
cd blog-test

copy .env.example .env.local         # 复制模板为本地配置（不提交）
npm ci                               # 基于 package-lock.json 的确定性安装
npm run dev                          # 开发服务器：http://localhost:3000
npm run build                        # 生产构建验收
```

### 关键点

- `npm ci`（而非 `npm install`）：严格依据 `package-lock.json`，确保依赖版本与 CI 完全一致。
- 构建成功是"clone 就绪"的最终验收标准。

### 验证（通过标准）

- `npm ci` 无报错
- `npm run build` 成功完成，无 Error

### 回传信息

```powershell
node -v
npm -v
```

以及 `npm run build` 末尾输出（或截图）。

---

## 日常维护循环（上线后每次改动的标准流程）

每次对博客进行任何改动（写新文章、修 bug、更新依赖等），都按此循环执行：

```
1. 拉取最新 main
2. 建功能分支
3. 改动 → 分组提交
4. push 功能分支
5. 创建 PR
6. CI 通过 → Squash merge
7. 本地同步 main + 删除功能分支
8. 循环
```

### 详细命令（完整可复制版本）

```powershell
# ── 1. 确保本地 main 最新 ──────────────────────────
git switch main
git pull --rebase origin main

# ── 2. 新建功能分支 ────────────────────────────────
git switch -c docs/new-post-title    # 按类型+简述命名

# ── 3. 开发/写作，完成后按逻辑分组提交 ────────────
git add contents/new-post.md
git commit -m "docs: add new-post-title"

# ── 4. push 功能分支 ───────────────────────────────
git push -u origin docs/new-post-title

# ── 5. GitHub 创建 PR ──────────────────────────────
# 在 GitHub 页面操作（base: main）

# ── 6. CI 通过后 Squash merge（GitHub 网页操作） ───

# ── 7. 本地同步 ────────────────────────────────────
git switch main
git pull --rebase origin main        # 同步 squash 进来的 commit
git branch -d docs/new-post-title    # 删除本地已合并分支
```

### 分支命名速查

| 类型 | 命名示例 |
| --- | --- |
| 新文章 / 文档 | `docs/add-typescript-guide` |
| 新功能 | `feature/dark-mode-toggle` |
| bug 修复 | `fix/broken-toc-links` |
| 依赖/工程 | `chore/upgrade-next-14` |

---

## 附录 A：Clone 就绪清单

### 必须提交到 Git（换机可构建的最小集）

| 类别 | 路径 |
| --- | --- |
| 源码/内容 | `pages/`、`components/`、`sections/`、`styles/`、`utils/`、`public/`、`contents/`、`scripts/` |
| 依赖锁定 | `package.json`、`package-lock.json` |
| 环境变量模板 | `.env.example` |
| 工程配置 | `tsconfig.json`、`tailwind.config.js`、`next.config.js`（若有） |
| Node 版本 | `.nvmrc` |
| CI | `.github/workflows/ci.yml` |
| 文档 | `README.md` |

### 必须忽略（不提交）

| 文件/目录 | 原因 |
| --- | --- |
| `node_modules/` | 可由 `npm ci` 重建 |
| `.next/`、`out/` | 构建产物，可由 `npm run build` 重建 |
| `.env.local` | 含本机/环境特有密钥 |
| `.env.*.local` | 同上 |

---

## 附录 B：术语表（Glossary）

| 术语 | 含义 |
| --- | --- |
| `origin` | 远端仓库别名；通常指你最常 push/pull 的那个远端 |
| `upstream` | 本地分支默认跟踪的远端分支（例如本地 `main` 跟踪 `origin/main`） |
| `slug` | 文章/页面的稳定标识符，用于生成 URL（如 `/blog/posts/<slug>`）和站点索引；`slug` 变更会导致旧链接 404，应保持稳定 |
| `Squash merge` | 把 PR 分支的多个 commit 压缩成一个再并入 main；保持主干历史线性整洁 |
| `npm ci` | 严格按 `package-lock.json` 安装；比 `npm install` 更确定性，适合 CI 与换机场景 |
| `Branch protection` | GitHub 分支保护规则；个人私有仓库用这个，而非 Rulesets |

---

## 记录区（你填）

- GitHub 仓库 SSH：`git@github.com:<you>/<repo>.git`
- main 分支保护：已启用 / 未启用
- 第一个 PR：
- CI 首次通过日期：
- Clone 验收日期：
