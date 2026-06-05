---
title: Git-Guide
description: A practical Git guide covering repositories, branches, remotes, and a command cheat sheet.
excerpt: From local commits to pushing remote, master the core Git workflow in this article.
datetime: 2026-05-30T10:00:00.000Z
slug: git-workflow-guide
featured: true
category: Git
tags:
  - git
  - tutorial
author: Ao
language: Chinese
toc: true
---
命令速查与常见场景见文末 [附录：命令速查与实战场景](#7-附录命令速查与实战场景)。

## 0. 安装与环境准备

> 更新：2026-03-24

---

### 安装 Git

#### macOS

```bash
# 方式一：Homebrew（推荐）
brew install git

# 方式二：Xcode Command Line Tools（系统自带触发安装）
xcode-select --install
```

#### Linux

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install git

# Fedora / RHEL
sudo dnf install git

# Arch
sudo pacman -S git
```

#### Windows

前往 [https://git-scm.com/download/win](https://git-scm.com/download/win) 下载安装包，安装时推荐勾选 **Git Bash**，后续命令均在 Git Bash 中运行。

也可通过 winget 安装：

```powershell
winget install --id Git.Git
```

#### 验证安装

```bash
git --version
# 输出示例：git version 2.44.0
```

---

### 基础概念

当使用 `git init` 初始化本地仓库时，当前文件夹会出现 `.git` 文件夹，里面的内容如下：

```
HEAD        ← 文本文件，当前在哪个分支上
config      ← 当前仓库的配置（远程地址、用户名等）
description ← 仓库的描述文字
hooks/*     ← 自动运行的脚本
info/*      ← 额外信息（如本仓库专用的忽略规则）
objects/*   ← 所有文件、历史记录等真实数据（Important!!）
refs/*      ← 所有分支、标签的指针
```

> HEAD + refs 告诉你“当前在哪”，objects 存数据，config/hooks/info 实现配置和自动化，description 是小备注。

#### Git 的使用流程

Git 将版本管理拆分为四个层次：**工作区 → 暂存区 → 本地仓库 → 远程仓库**，每一步都有明确的职责。

```
Working Directory → git add → Staging Area → git commit → Local Repo → git push → Remote
```

**各阶段的作用：**

- **Working Directory（工作区）**：你在编辑器里直接看到和修改的文件，所有改动最初都发生在这里。
- **Staging Area（暂存区）**：执行 `git add` 后，改动进入暂存区等待提交。暂存区的存在让你可以把多个文件的改动分批组织成一个有意义的提交，而不是把所有改动一股脑提交。
- **Repository（本地仓库）**：执行 `git commit` 后，暂存区的内容被永久记录到本地仓库，生成一个唯一的 commit id，即便断网也能正常工作。
- **Remote（远程仓库）**：执行 `git push` 后，本地的提交被推送到 GitHub 等远程平台，实现备份与多人协作。

> **为什么要有暂存区？** 开发中你可能同时改了 5 个文件，但只有 2 个属于同一个功能。通过 `git add` 可以只暂存这 2 个文件，`git commit` 提交一个干净的功能单元，其余改动留在工作区继续开发。这是 Git 区别于 SVN 最重要的设计之一。

---

### 初始化配置

#### 全局配置（只需一次）

```bash
git config --global user.name "你的名字"
git config --global user.email "your@email.com"
```

#### 新建仓库

```bash
# 在现有目录初始化
cd ~/workspace/project-a
git init

# 克隆远端仓库
git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git        # SSH 方式（推荐）
```

---

## 1. 创建版本库

### 初始化仓库

#### 场景

在本地新建一个目录，把它变成 Git 可以管理的版本库，从零开始追踪文件变化。

#### 实操

**新建空目录并初始化**

```bash
# 创建项目目录
mkdir learngit
cd learngit

# 初始化 Git 仓库
git init
# Initialized empty Git repository in /Users/yourname/learngit/.git/
```

初始化成功后，目录下会多出一个隐藏的 `.git` 文件夹：

```bash
ls -a
# .  ..  .git

# 查看 .git 目录结构
ls .git
# HEAD    config    description    hooks    info    objects    refs
```

**也可以在已有内容的目录中初始化**

```bash
cd ~/workspace/my-project   # 已有项目的目录
git init                    # 同样可以初始化，原有文件不受影响
```

---

### 添加文件到版本库

#### 场景

仓库建好后，新建一个文件并提交到版本库，完成第一次 commit。

#### 实操

**第一步：创建文件**

```bash
# 在 learngit 目录下创建 readme.txt
echo "Git is a version control system." > readme.txt
echo "Git is free software." >> readme.txt

cat readme.txt
# Git is a version control system.
# Git is free software.
```

> 注意：文件必须放在 Git 仓库目录下（子目录也行），放在其他地方 Git 无法追踪到。

**第二步：git add — 把文件放入暂存区**

```bash
git add readme.txt

# 一次 add 多个文件
git add file1.txt file2.txt

# add 当前目录下所有文件
git add .
```

执行后没有任何输出，这是正常的。

**第三步：git commit — 把暂存区内容提交到版本库**

```bash
git commit -m "wrote a readme file"
# [master (root-commit) eaadf4e] wrote a readme file
#  1 file changed, 2 insertions(+)
#  create mode 100644 readme.txt
```

输出说明：

- `1 file changed`：1 个文件发生了变化
- `2 insertions(+)`：新增了 2 行内容
- `eaadf4e`：本次 commit 的唯一 ID（SHA-1 哈希前 7 位）

**验证提交成功**

```bash
git status
# On branch master
# nothing to commit, working tree clean   ← 工作区干净，说明提交成功

git log
# commit eaadf4e4e8d2b3b5c... (HEAD -> master)
# Author: yourname <your@email.com>
# Date:   Mon Mar 24 10:00:00 2026
#
#     wrote a readme file
```

**为什么要分 add 和 commit 两步？**

`commit` 可以一次提交多个文件，所以可以先多次 `add` 不同的文件，再统一 `commit`：

```bash
git add file1.txt
git add file2.txt
git add file3.txt
git commit -m "add 3 files"
```

这样一个 commit 就包含了三个文件的改动，逻辑上是一个完整的工作单元。

---

### 常见错误排查

#### 错误 1：`fatal: not a git repository`

```bash
git add readme.txt
# fatal: not a git repository (or any of the parent directories): .git
```

原因：当前目录不在 Git 仓库内，Git 命令必须在仓库目录（或其子目录）中执行。

```bash
# 解决：先切到仓库目录
cd ~/learngit
git add readme.txt
```

#### 错误 2：`pathspec 'xxx' did not match any files`

```bash
git add readme.txt
# fatal: pathspec 'readme.txt' did not match any files
```

原因：文件名拼写错误，或文件不在当前目录下。

```bash
ls                  # 确认文件存在
git add readme.txt  # 确认文件名正确
```

#### 错误 3：commit message 写错了

```bash
# 修改最近一次的 commit message（只限未 push 的情况）
git commit --amend -m "正确的提交说明"
```

---

#### 文件类型说明

Git 只能有效追踪**文本文件**的内容变化：

|文件类型|Git 能否追踪内容|说明|
|---|---|---|
|`.txt`、`.md`、代码文件|能|可以看到每次改了哪行|
|图片、视频、`.zip`|只能追踪大小变化|无法看到具体改动内容|
|`.docx`（Word）|只能追踪大小变化|Word 是二进制格式|

> 因此写文档建议用 Markdown（`.md`），用 Git 管理可以精确追踪每次修改了哪些内容。

---

---

## 2. 版本回退

> 更新：2026-03-25

---

### 查看文件状态与差异

#### 场景

修改了 `readme.txt`，但还没有提交。你想知道：**当前仓库的状态如何？修改了哪些内容？**

#### 实操

**当修改了文件内容后，可以用 `git status` 查看当前状态**

```bash
$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   readme.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

`git status` 告诉我们 `readme.txt` 被修改过了，但还没有 add 到暂存区。

**用 `git diff` 查看具体改动了什么**

```bash
$ git diff readme.txt
diff --git a/readme.txt b/readme.txt
index 46d49bf..9247db6 100644
--- a/readme.txt
+++ b/readme.txt
@@ -1,2 +1,2 @@
-Git is a version control system.
+Git is a distributed version control system.
 Git is free software.
```

`-` 表示删除的行，`+` 表示新增的行。从上面可以看出，第一行加了一个单词 `distributed`。

**确认无误后，提交修改**

```bash
$ git add readme.txt
$ git status          # 再看一次，确认进入暂存区
$ git commit -m "add distributed"
```

提交后再看状态：

```bash
$ git status
On branch master
nothing to commit, working tree clean   ← 工作区干净，提交成功
```

#### 小结

| 命令 | 作用 |
| --- | --- |
| `git status` | 随时查看工作区的状态 |
| `git diff <file>` | 查看文件的具体改动（未暂存时）|
| `git diff --staged` | 查看已暂存但未提交的改动 |

---

### 版本回退

#### 场景

你对 `readme.md` 已经做了 2 次提交，现在想**回退到上一个版本**，或者**找回一个被 reset 掉的版本**。

```
版本1：wrote a readme file
版本2：add v2
```

#### 实操

**查看提交历史**

```bash
$ git log
commit 1094adb7b9b3807259d8cb349e7df1d4d6477073 (HEAD -> master)
    append GPL

commit e475afc93c209a690c39c13a46716e8fa000c366
    add distributed

commit eaadf4e385e865d25c48e7ca9c8395c3f7dfaef0
    wrote a readme file
```

简洁版：

```bash
$ git log --pretty=oneline
1094adb... (HEAD -> master) append GPL
e475afc... add distributed
eaadf4e... wrote a readme file
```

`HEAD` 表示当前版本，`HEAD^` 是上一个，`HEAD^^` 是上上个，`HEAD~100` 表示往前 100 个。

**回退到上一个版本**

```bash
$ git reset --hard HEAD^
HEAD is now at e475afc add distributed
```

`--hard` 参数说明：

| 参数        | 行为                                       |
| --------- | ---------------------------------------- |
| `--hard`  | 回退到上个版本的已提交状态（工作区也随之改变），也就是清除所有的改动       |
| `--soft`  | 回退到上个版本的未提交状态（改动保留在暂存区），保存改动但未commit到工作区 |
| `--mixed` | 回退到上个版本已 add 但未 commit 的状态，保存改动但未add到暂存区 |

**回到"未来"版本：用 commit id 跳转**

如果你回退后后悔了，想重新回到改动后的版本：

```bash
# 方法一：窗口没关，找到之前显示的 commit id
$ git reset --hard 1094a    # 只需前几位，Git 自动匹配

# 方法二：用 git reflog 查找所有操作记录（窗口关掉了也没关系）
$ git reflog
e475afc HEAD@{1}: reset: moving to HEAD^
1094adb (HEAD -> master) HEAD@{2}: commit: append GPL
e475afc HEAD@{3}: commit: add distributed
eaadf4e HEAD@{4}: commit (initial): wrote a readme file

$ git reset --hard 1094adb   # 通过 reflog 找到 id 后跳回
```

#### HEAD 指针原理

```
回退前：
HEAD → master → add v2 → wrote a readme file

回退后：
HEAD → master →  wrote a readme file
（append GPL 的提交还在，只是 HEAD 指针移走了）
```

#### 小结

- `git log` 查看提交历史，确定要回退到哪个版本
- `git reset --hard <commit_id>` 跳转到指定版本
- `git reflog` 查看所有操作记录，找回任意版本的 commit id

---

### 工作区与暂存区

#### 概念图

```
工作区（Working Directory）
    │  git add
    ▼
暂存区（Stage / Index）      ← .git 内部
    │  git commit
    ▼
版本库 master 分支           ← .git 内部
```

Git 和 SVN 最重要的区别之一就是有**暂存区**。

#### 场景

你修改了 `readme.txt`，同时新建了一个 `LICENSE` 文件，想把这两个文件一起提交。

#### 实操

```bash
# 当前状态
$ git status
On branch master
Changes not staged for commit:
	modified:   readme.txt

Untracked files:
	LICENSE
```

`Untracked` 表示 `LICENSE` 是新文件，从未被 Git 追踪过。

```bash
# 把两个文件都加入暂存区
$ git add readme.txt
$ git add LICENSE

# 确认暂存区状态
$ git status
On branch master
Changes to be committed:
	new file:   LICENSE
	modified:   readme.txt
```

```bash
# 一次性提交暂存区的所有内容
$ git commit -m "understand how stage works"
[master e43a48b] understand how stage works
 2 files changed, 2 insertions(+)
```

提交后工作区又干净了：

```bash
$ git status
On branch master
nothing to commit, working tree clean
```

#### 小结

- `git add` 把改动从工作区放入暂存区
- `git commit` 把暂存区的全部内容提交到当前分支
- 可以多次 `add` 不同文件，再一次性 `commit`

---

### 管理修改：为什么要先 add

#### 场景

你对 `readme.md` 做了**第一次修改**，`git add` 后，又做了**第二次修改**，然后直接 `git commit`。你发现第二次修改没有进版本库——这是为什么？

#### 实操

```bash
# 第一次修改
$ echo "Git tracks changes." >> readme.md
$ git add readme.md        # 第一次修改进入暂存区

# 第二次修改（直接改文件，没有 git add）
$ echo "Git tracks changes of files." > temp && mv temp readme.md
# （模拟修改了最后一行内容）

# 直接提交 
$ git commit -m "git tracks changes"
[master 519219b] git tracks changes
 1 file changed, 1 insertion(+)
```

提交后查看状态：

```bash
$ git status
On branch master
Changes not staged for commit:
	modified:   readme.txt    ← 第二次修改没有被提交！
```

用 `git diff HEAD -- readme.txt` 可以确认：

```bash
$ git diff HEAD -- readme.txt
-Git tracks changes.
+Git tracks changes of files.
```

#### 原因

```
第一次修改 → git add → [进入暂存区]
第二次修改 →           [留在工作区，没有 add]
                  ↓ git commit
        只提交了暂存区，第二次修改丢失
```

**Git 管理的是修改，而不是文件。** 每次修改，只有 `git add` 后才会进入下一次 commit。

#### 正确做法

```bash
# 每次修改都记得 add
第一次修改 → git add → 第二次修改 → git add → git commit
```

或者用 `git add .` 一次性把所有改动加进暂存区，再 commit。

---

### 撤销修改

#### 场景一：工作区改错了，还没有 add

你在 `readme.txt` 里写了一段不该写的内容，还没有 `git add`，想直接丢弃工作区的修改。

```bash
$ git restore readme.txt          # 推荐（Git 2.23+）
# 或
$ git checkout -- readme.txt      # 旧版命令
```

这会让文件回到最近一次 `git add` 或 `git commit` 时的状态。

#### 场景二：已经 add 到暂存区，想撤回来

```bash
# 第一步：把暂存区的修改退回到工作区
$ git restore --staged readme.txt
# 或
$ git reset HEAD readme.txt

# 第二步：再丢弃工作区的修改（同场景一）
$ git restore readme.txt
```

执行流程：

```
暂存区的修改 → git restore --staged → 退回到工作区
工作区的修改 → git restore           → 彻底丢弃
```

#### 场景三：已经 commit，但还没有 push 到远程

参考 版本回退 用 `git reset --hard HEAD^` 回退到上一个版本。

> 如果已经推送到远程，就无法通过本地 reset 解决，需要 `git revert`。

#### 小结

| 情况 | 命令 |
| --- | --- |
| 工作区改错，未 add | `git restore <file>` |
| 已 add，想退回工作区 | `git restore --staged <file>` |
| 已 commit，未 push | `git reset --hard HEAD^` |

---

### 删除文件

#### 场景

你提交了一个 `test.txt` 文件，后来发现不需要了，想从版本库中删除它。

#### 实操

**先添加并提交文件**

```bash
$ git add test.txt
$ git commit -m "add test.txt"
```

**在工作区删除文件**

```bash
$ rm test.txt   # 或在文件管理器里删除
```

Git 立刻感知到删除操作：

```bash
$ git status
On branch master
Changes not staged for commit:
	deleted:    test.txt
```

**情况一：确认要删除，从版本库中也删掉**

```bash
$ git rm test.txt
$ git commit -m "remove test.txt"
```

> `git rm` 后接 `git commit` 就把文件从版本库中彻底删除了。

**情况二：删错了，想恢复**

```bash
$ git restore test.txt   # 从版本库恢复到工作区
# 或
$ git checkout -- test.txt
```

> 注意：只能恢复到最近一次 commit 的状态，最近一次 commit 之后做的修改会丢失。从来没有被 commit 过的文件无法恢复。

#### 小结

- `git rm <file>` + `git commit` 从版本库删除文件
- `git restore <file>` 恢复被误删的文件（前提是已经 commit 过）

---

---

## 3. 远程仓库

> 更新：2026-03-26

---

### 本地仓库与远程仓库
#### 你在做什么

Git 可以在**只有本机**的情况下完整工作（提交、历史、分支都在 `.git` 里）。  
**远程仓库**（如 GitHub 上的仓库）多承担几件事：**备份**、**协作**、**在其他机器上拉同一份历史**。

```
本机 .git（完整历史）  ←——push/pull——→  远程 bare 仓库（大家共享的“中枢”）
```

- **本地**：你日常 `add` / `commit` 的地方，改的是工作区 + 本地版本库。
- **远程**：通常不放“工作区”，只放可被 fetch/push 的对象；别人 `clone` 下来再各自开发。

#### 几个名字先记清

| 概念 | 含义 |
| --- | --- |
| `origin` | 约定俗成的**远程别名**，指向你最常推送的那一个地址（可以叫别的名字） |
| `upstream` / `-u` | **上游分支**：本地某分支默认跟踪远程哪条分支，之后 `git push` / `git pull` 可以少写参数 |
| `fetch` | 把远程的提交**下载到本地**，不自动改你当前分支所指（可再 `merge` / `rebase`） |
| `pull` | 通常是 **fetch + merge**（或配置了 rebase 则是 fetch + rebase），会动你当前工作分支 |

后面各节按「先能连上 → 能推上去 → 能拉下来 → 日常怎么同步」的顺序走。

---

### 配置 SSH 密钥（前置准备）

#### 场景

你要用 **SSH 地址**（`git@github.com:...`）和 GitHub 通信，希望**配置一次**，之后推送不再反复输密码。

#### 实操

**检查是否已有密钥**

```bash
ls ~/.ssh
# 常见：id_ed25519 / id_ed25519.pub 或 id_rsa / id_rsa.pub
```

**生成密钥对（没有再来）**

```bash
# 推荐 Ed25519（较新、较短）
ssh-keygen -t ed25519 -C "your@email.com"
# 一路回车即可；默认私钥 ~/.ssh/id_ed25519，公钥 ~/.ssh/id_ed25519.pub

# 若环境较老仍用 RSA，可用：
# ssh-keygen -t rsa -b 4096 -C "your@email.com"
```

**把公钥内容拷出来**

```bash
cat ~/.ssh/id_ed25519.pub
# Windows PowerShell 也可用：Get-Content ~/.ssh/id_ed25519.pub
# 复制整行，以 ssh-ed25519 或 ssh-rsa 开头
```

**加到 GitHub**

登录 GitHub → **Settings** → **SSH and GPG keys** → **New SSH key** → 粘贴公钥 → 保存。

**测一下是否通**

```bash
$ ssh -T git@github.com
Hi yourname! You've successfully authenticated, but GitHub does not provide shell access.
```

看到 `Hi yourname!` 就说明 SSH 侧 OK。若SSH配置有问题参考

#### 小结

| 步骤 | 作用 |
| --- | --- |
| `ssh-keygen` | 生成本机密钥对 |
| 把 `.pub` 加到 GitHub | 让 GitHub 认你的机器 |
| `ssh -T git@github.com` | 验证链路 |

---

### 场景一：本地已有仓库，推送到 GitHub

#### 场景

你在本机已经有一个 Git 仓库（例如 `learngit`），里面有若干 `commit`，现在想**备份到 GitHub**，并和团队（或另一台电脑）共享同一条历史。

#### 实操

**第一步：在 GitHub 上建一个空仓库**

- New repository → 仓库名填 `learngit` → Create。
- **重要**：若本地已有提交过的文件（如 `README`），GitHub 上**不要**再勾选 “Add a README” 等初始化选项，否则你第一次 `push` 时往往在历史上“对不齐”，要先拉再合或强推（新手先避免）。

**第二步：在本地登记远程地址**

用 GitHub 给的 **SSH** 地址（页面上的 SSH 一栏），在本仓库根目录执行：

```bash
cd /path/to/learngit
git remote add origin git@github.com:your-username/learngit.git
```

**看一眼是否登记成功：**

```bash
$ git remote -v
origin  git@github.com:your-username/learngit.git (fetch)
origin  git@github.com:your-username/learngit.git (push)
```

**第三步：首次推上去并设上游**

GitHub 新建仓库的**默认分支**可能是 `main`，而你本地可能是 `master`。先看清自己当前分支名：

```bash
git branch
```

- 若本地是 `master`，远程也是 `master`：

```bash
git push -u origin master
```

- 若远程默认是 `main`，你希望本地 `master` 推上去变成远程的 `main`：

```bash
git push -u origin master:main
```

`-u`（`--set-upstream`）的作用：把**当前本地分支**和**远程对应分支**记下来，以后在该分支上可直接：

```bash
git push
git pull
```

**首次成功时类似输出：**

```bash
$ git push -u origin master
Counting objects: 20, done.
Writing objects: 100% (20/20), 1.64 KiB | 560.00 KiB/s, done.
To github.com:your-username/learngit.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

**之后日常工作流**

```bash
# 本地改完、提交后
git push          # 已设过 upstream 时
# 或显式写远程与分支
git push origin master
```

#### 小结

| 命令 | 作用 |
| --- | --- |
| `git remote add origin <url>` | 把别名为 `origin` 的远程指向该 URL |
| `git remote -v` | 查看 fetch/push 用的地址 |
| `git push -u origin <branch>` | 首次推送并设置上游跟踪 |
| `git push` | 在已设置上游的分支上，推送到默认远程分支 |

---

### 场景二：从远程克隆到本地

#### 场景

同事已在 GitHub 建好项目 `gitskills`，你要**从零拿一份完整仓库**到本机开发，而不是自己 `git init` 再关联。

#### 实操

**克隆（SSH，推荐日常开发）**

```bash
$ git clone git@github.com:your-username/gitskills.git
Cloning into 'gitskills'...
remote: Total 3 (delta 0), reused 0 (delta 0)
Receiving objects: 100% (3/3), done.
```

- 会在当前目录下出现 **`gitskills/`** 文件夹，里面既有工作区文件，也有完整 `.git` 历史。
- `git clone` 会自动加上名为 `origin` 的远程，并 **checkout** 远程默认分支（多为 `main`）。

```bash
$ cd gitskills
$ git remote -v
origin  git@github.com:your-username/gitskills.git (fetch)
origin  git@github.com:your-username/gitskills.git (push)
```

**克隆（HTTPS，免配 SSH，但 push 常要令牌）**

```bash
git clone https://github.com/your-username/gitskills.git
```

适合临时拷贝；长期协作仍建议 SSH 或配置好凭据管理。

#### SSH 与 HTTPS 对比

| 方式 | 典型体验 | 鉴权 | 适用 |
| --- | --- | --- | --- |
| SSH | 一般较快，一次配置 | 公钥 | 个人主力开发机 |
| HTTPS | 不依赖 SSH | 密码 / Personal Access Token | 受限网络、临时使用 |

#### 小结

| 命令 | 作用 |
| --- | --- |
| `git clone <url>` | 下载远程完整历史并在本地建目录、设好 `origin` |

---

### 场景三：日常拉取与推送

#### 场景

多人共用一个 `origin`，你本地开发前要**拿别人刚推的提交**，改完后再**把自己的提交推上去**。

#### 推荐心智模型

```
你本地：  ... → A → B（你的提交）
远程：    ... → A → C（同事刚推的）
```

若直接 `push`，Git 会拒绝**非快进**更新，要求你先 integrate（merge 或 rebase）远程多出来的 `C`，再推。

#### 实操：拉取远程最新

**方式一：`fetch` + `merge`（两步，看得更清）**

```bash
git fetch origin
# 此时远程分支引用会更新，例如 origin/main，但你的工作区暂不变
git merge origin/main      # 若你当前在 main 且跟踪的就是 origin/main
# 若你仍在用 master 命名，则可能是：git merge origin/master
```

**方式二：`pull`（一步，等价于 fetch + merge）**

```bash
git pull origin main
# 或已设上游：git pull
```

**方式三：`pull --rebase`（希望历史更直、少合并提交时）**

```bash
git pull --rebase origin main
```

- 与同事的改动**没改同一处**， often 快进或自动 replay，较顺滑。
- **同一文件冲突**时，Git 会停住让你解决冲突 → `git add` → `git rebase --continue`（或改走 merge 策略）。

#### 实操：推送本地提交

```bash
git push origin main
# 或：git push
```

#### 实操：推送被拒绝时（non-fast-forward）

```bash
$ git push origin master
 ! [rejected]        master -> master (non-fast-forward)
hint: Updates were rejected because the tip of your current branch is behind
```

**常见处理顺序：**

1. 先拉再推（merge 路线示例）：

```bash
git pull origin master    # 或 git pull
# 若有冲突：按提示改文件 → git add → git commit（merge 会多一个合并提交）
git push origin master
```

2. 若团队约定用 rebase：

```bash
git pull --rebase origin master
# 解决冲突后
git push origin master
```

#### 小结

| 命令 | 作用 |
| --- | --- |
| `git fetch origin` | 只更新远程跟踪分支，不自动改当前分支 |
| `git pull` | 拉取并合并（默认 merge，可配 rebase） |
| `git pull --rebase` | 拉取后以 rebase 方式接上远程新提交 |
| `git push` | 把本地提交推到远程（需快进或可合并） |

---

### 场景四：查看、解绑与更换远程

#### 场景

你要确认本地绑的是哪个地址、要换公司新仓库、或同时推到 GitHub 与国内镜像。

#### 实操：查看

```bash
$ git remote -v
origin  git@github.com:your-username/learngit.git (fetch)
origin  git@github.com:your-username/learngit.git (push)
```

#### 实操：解绑（只解本地配置，不删网站上的仓库）

```bash
git remote rm origin
```

#### 实操：改 `origin` 的 URL（搬家、HTTPS 改 SSH）

```bash
git remote set-url origin git@github.com:your-username/new-repo.git
```

#### 实操：多个远程（例如 GitHub + Gitee）

```bash
git remote add github git@github.com:your-username/learngit.git
git remote add gitee git@gitee.com:your-username/learngit.git

git push github main
git push gitee main
```

#### 小结

| 命令 | 作用 |
| --- | --- |
| `git remote -v` | 列出远程名与 URL |
| `git remote rm <name>` | 删除本地对该远程的登记 |
| `git remote set-url <name> <url>` | 修改某远程地址 |
| `git remote add <name> <url>` | 新增一个远程别名 |

---

### 常用命令速查

| 命令 | 说明 |
| --- | --- |
| `git remote add origin <url>` | 关联远程（名 `origin`） |
| `git remote -v` | 查看远程地址 |
| `git remote rm origin` | 解除与 `origin` 的绑定 |
| `git remote set-url origin <url>` | 修改 `origin` 的 URL |
| `git push -u origin <branch>` | 首次推送并设置上游 |
| `git push` / `git push origin <branch>` | 推送到远程 |
| `git fetch origin` | 只下载远程更新 |
| `git pull` / `git pull origin <branch>` | 拉取并集成到当前分支 |
| `git clone <url>` | 克隆远程仓库 |

---

---

## 4. 分支管理

> 更新：2026-03-25

---

### 分支原理

Git 的分支本质上只是一个**可移动的指针**，指向某个 commit。`HEAD` 指针则指向当前所在的分支。

```
创建 dev 分支之前：
HEAD → master → [commit C] → [commit B] → [commit A]

创建 dev 分支后：
HEAD → dev
master → [commit C]
dev    → [commit C]   ← 两个分支指向同一提交

在 dev 上提交一次后：
master → [commit C]
dev    → [commit D] → [commit C]

合并到 master（fast-forward）：
HEAD → master → [commit D]   ← master 直接移动到 dev 所在位置
```

创建分支非常快，因为只是增加了一个指针，工作区文件没有变化。

---

### 场景一：新功能开发（创建与合并分支）

#### 场景

你要开发一个新的登录功能，不想在 `master` 上直接改，想用独立分支开发，完成后合并回来。

#### 实操

**创建并切换到 dev 分支**

```bash
# 新语法（推荐，更清晰）
$ git switch -c feature/login

# 旧语法（等效）
$ git checkout -b feature/login

# 等价于以下两条命令
$ git branch feature/login
$ git switch feature/login
```

**查看当前所在分支**

```bash
$ git branch
* feature/login    ← * 表示当前分支
  master
```

**在 feature/login 上开发并提交**

```bash
# 编辑文件...
$ git add login.py
$ git commit -m "feat: 添加登录功能"
```

**切回 master，合并 feature/login**

```bash
$ git switch master
$ git merge feature/login
Updating d46f35e..b17d20e
Fast-forward
 login.py | 10 ++++++++++
 1 file changed, 10 insertions(+)
```

`Fast-forward` 表示 master 直接移动到 feature/login 的位置，速度极快。

**合并后删除分支**

```bash
$ git branch -d feature/login
Deleted branch feature/login (was b17d20e).
```

---

### 场景二：两人同时修改同一文件（解决冲突）

#### 场景

你和同事都修改了 `readme.txt` 的同一行，合并时产生冲突。

#### 实操

```bash
# 你在 master 上修改了 readme.txt，并提交
$ git add readme.txt && git commit -m "& simple"

# feature1 分支上也修改了同一行，并提交
$ git switch feature1
$ git add readme.txt && git commit -m "AND simple"

# 切回 master，尝试合并
$ git switch master
$ git merge feature1
Auto-merging readme.txt
CONFLICT (content): Merge conflict in readme.txt
Automatic merge failed; fix conflicts and then commit the result.
```

**查看冲突内容**

```bash
$ cat readme.txt
...
<<<<<<< HEAD
Creating a new branch is quick & simple.
=======
Creating a new branch is quick AND simple.
>>>>>>> feature1
```

**手动编辑文件，保留正确内容**

```bash
# 把冲突标记全部删除，只留下最终要保留的内容
Creating a new branch is quick AND simple.
```

**标记冲突已解决，提交**

```bash
$ git add readme.txt
$ git commit -m "conflict fixed"
```

**查看分支合并历史图**

```bash
$ git log --graph --pretty=oneline --abbrev-commit
*   cf810e4 (HEAD -> master) conflict fixed
|\
| * 14096d0 (feature1) AND simple
* | 5dc6824 & simple
|/
* b17d20e branch test
```

**删除已合并的分支**

```bash
$ git branch -d feature1
```

---

### 场景三：紧急修复线上 Bug（stash + bug 分支）

#### 场景

你正在 `dev` 分支上开发新功能（改到一半，无法提交），突然来了一个紧急 bug 需要立刻在 `master` 上修复。

#### 实操

**第一步：储藏当前未完成的工作**

```bash
$ git stash
Saved working directory and index state WIP on dev: f52c633 add merge

$ git status
nothing to commit, working tree clean   ← 工作区干净，可以切分支了
```

**第二步：切到 master，创建 bug 修复分支**

```bash
$ git switch master
$ git switch -c issue-101

# 修复 bug...
$ git add readme.txt
$ git commit -m "fix bug 101"

# 合并修复到 master
$ git switch master
$ git merge --no-ff -m "merged bug fix 101" issue-101
$ git branch -d issue-101
```

`--no-ff` 参数禁用 Fast-forward，强制生成一个合并 commit，保留分支历史记录。

**第三步：回到 dev，恢复工作现场**

```bash
$ git switch dev

# 查看储藏列表
$ git stash list
stash@{0}: WIP on dev: f52c633 add merge

# 恢复并删除 stash
$ git stash pop
```

**第四步（可选）：把 bug 修复同步到 dev 分支**

```bash
# 用 cherry-pick 把 issue-101 修复的 commit 复制到当前分支
$ git cherry-pick 4c805e2   # 4c805e2 是 "fix bug 101" 的 commit id
```

`cherry-pick` 会把指定 commit 的改动"复制"到当前分支，不用重复改代码。

#### stash 命令速查

```bash
git stash                    # 储藏当前工作区
git stash list               # 查看所有储藏
git stash pop                # 恢复最近一次储藏，并删除记录
git stash apply stash@{0}    # 恢复指定储藏（不删除记录）
git stash drop stash@{0}     # 手动删除指定储藏
```

---

### 场景四：实验性功能被砍掉（Feature 分支强制删除）

#### 场景

你为一个新功能创建了 `feature/experiment` 分支，开发到一半，产品经理通知这个功能不做了，需要删除这个分支。

#### 实操

```bash
$ git branch -d feature/experiment
error: The branch 'feature/experiment' is not fully merged.
If you are sure you want to delete it, run 'git branch -D feature/experiment'.
```

由于该分支从未合并过，普通 `-d` 会报错以防误删。强制删除用大写 `-D`：

```bash
$ git branch -D feature/experiment
Deleted branch feature/experiment (was e2e5d23).
```

---

### 场景五：团队多人协作推拉流程

#### 场景

你和同事共用 GitHub 上的 `origin` 远程仓库，需要在 `dev` 分支上协作开发。

#### 实操

**推送本地分支到远程**

```bash
$ git push origin dev        # 推送 dev 分支（团队开发分支需要推送）
$ git push origin master     # 推送 master 分支（稳定版本）
# bug 分支只在本地用，无需推送
```

**同事克隆后，切到 dev 分支**

```bash
$ git clone git@github.com:your-username/learngit.git
$ git checkout -b dev origin/dev   # 创建本地 dev 并与远程 dev 关联
```

**你们各自提交，同事先推上去了，你推送时报错**

```bash
$ git push origin dev
 ! [rejected]    dev -> dev (non-fast-forward)
```

**解决：先拉取，合并冲突，再推送**

```bash
# 如果提示没有追踪信息，先设置
$ git branch --set-upstream-to=origin/dev dev

$ git pull                  # 拉取远程 dev 并合并
# 若有冲突 → 手动解决 → git add → git commit
$ git push origin dev       # 再次推送
```

#### 多人协作标准流程

```
1. git push origin <branch>       尝试推送
2. 推送失败 → git pull            拉取远程最新
3. 有冲突 → 手动解决 → git commit
4. git push origin <branch>       重新推送
```

---

### 分支管理策略

#### `--no-ff` 合并（保留分支记录）

```bash
$ git merge --no-ff -m "merge with no-ff" dev
```

普通 Fast-forward 合并后，分支历史会"消失"，看不出曾经有过分支。`--no-ff` 强制生成一个 merge commit，在历史中保留分支记录。

```
Fast-forward（默认）：      --no-ff：
A - B - C (master)         A - B - C - M (master)
        \                           /
         D (dev)                   D
（合并后看不出有分支）      （明确记录了分支合并点）
```

#### 推荐分支模型

```
main/master   稳定发布版，只接受经测试的 merge
dev           日常开发主线，所有功能在这里汇集
feature/*     每个功能独立分支，完成后 merge 到 dev
fix/*         bug 修复分支，修完后 merge 到 master 和 dev
```

---

### 常用命令速查

| 命令 | 说明 |
| --- | --- |
| `git branch` | 查看本地所有分支 |
| `git branch -a` | 查看包括远端的所有分支 |
| `git switch -c <name>` | 创建并切换到新分支 |
| `git switch <name>` | 切换到已有分支 |
| `git merge <branch>` | 将指定分支合并到当前分支 |
| `git merge --no-ff -m "msg" <branch>` | 禁用 Fast-forward 合并 |
| `git branch -d <name>` | 删除已合并的分支 |
| `git branch -D <name>` | 强制删除分支（未合并也删）|
| `git stash` | 储藏当前工作区改动 |
| `git stash pop` | 恢复最近储藏 |
| `git cherry-pick <commit>` | 复制指定 commit 到当前分支 |
| `git log --graph` | 查看分支合并图 |

---

---

## 5. 标签管理

> 更新：2026-03-26

---

### 标签是什么

**标签（Tag）** 是对某个 commit 打的一个有意义的名字（如 `v1.0`、`release-2024`），方便日后快速找到对应的版本。

与 commit id（一串哈希值）相比，标签更加直观易记：

```
commit id：1094adb7b9b3807259d8cb349e7df1d4d6477073
标签：     v1.0
```

标签和 commit 的关系：**标签是 commit 的别名**，它永远指向打标签时的那个 commit，不会随着新提交移动（分支指针会移动，标签不会）。

---

### 场景一：给当前版本打标签（发布 v1.0）

#### 场景

功能开发完毕，测试通过，你要在 `master` 分支的当前 HEAD 上打一个 `v1.0` 标签，标志正式发布。

#### 实操

**切换到要打标签的分支**

```bash
$ git switch master
Switched to branch 'master'
```

**打轻量标签（只有名字，没有说明）**

```bash
$ git tag v1.0
```

**查看所有标签**

```bash
$ git tag
v1.0
```

**查看标签详情**

```bash
$ git show v1.0
commit 12a631b... (HEAD -> master, tag: v1.0)
Author: yourname <your@email.com>
Date:   ...

    merged bug fix 101

diff --git a/readme.txt b/readme.txt
...
```

> 注意：标签不是按时间排序，而是按字母顺序排序。

---

### 场景二：忘记打标签，补打历史 commit

#### 场景

本应在上周五发布 `v0.9` 时打标签，结果忘了。现在你想补打到那个 commit 上。

#### 实操

**查看提交历史，找到目标 commit id**

```bash
$ git log --pretty=oneline --abbrev-commit
12a631b (HEAD -> master, tag: v1.0) merged bug fix 101
4c805e2 fix bug 101
e1e9c68 merge with no-ff
f52c633 add merge      ← 你想打标签的那次提交
cf810e4 conflict fixed
...
```

**对历史 commit 补打标签**

```bash
$ git tag v0.9 f52c633
```

**验证**

```bash
$ git tag
v0.9
v1.0

$ git show v0.9
commit f52c63349bc3c1593499807e5c8e972b82c8f286 (tag: v0.9)
...
    add merge
```

---

### 场景三：创建带说明文字的标签

#### 场景

发布 `v0.1` 版本，希望在标签上附加发布说明，方便日后查阅。

#### 实操

```bash
# -a 指定标签名，-m 写说明文字，最后指定 commit id
$ git tag -a v0.1 -m "version 0.1 released" 1094adb
```

**查看带说明的标签**

```bash
$ git show v0.1
tag v0.1
Tagger: yourname <your@email.com>
Date:   ...

version 0.1 released       ← 说明文字显示在这里

commit 1094adb7b9b3807259d8cb349e7df1d4d6477073 (tag: v0.1)
Author: yourname <your@email.com>
Date:   ...

    append GPL
```

#### 轻量标签 vs 附注标签

| 类型 | 命令 | 存储内容 | 适用场景 |
| --- | --- | --- | --- |
| 轻量标签（lightweight）| `git tag v1.0` | 只有标签名 | 临时标记，私用 |
| 附注标签（annotated）| `git tag -a v1.0 -m "..."` | 标签名、作者、日期、说明 | 正式发布，推荐 |

---

### 场景四：推送标签到远程

#### 场景

标签默认只存在本地，你需要把 `v1.0` 发布到 GitHub，让其他人也能看到。

#### 实操

**推送单个标签**

```bash
$ git push origin v1.0
Total 0 (delta 0), reused 0 (delta 0)
To github.com:your-username/learngit.git
 * [new tag]         v1.0 -> v1.0
```

**一次性推送所有本地未推送的标签**

```bash
$ git push origin --tags
Total 0 (delta 0), reused 0 (delta 0)
To github.com:your-username/learngit.git
 * [new tag]         v0.9 -> v0.9
 * [new tag]         v0.1 -> v0.1
```

推送成功后，在 GitHub 仓库的 Releases / Tags 页面就能看到这些标签。

---

### 场景五：删除本地和远程标签

#### 场景

你打错了一个标签 `v0.1`，需要删除并重新打。

#### 删除本地标签

```bash
$ git tag -d v0.1
Deleted tag 'v0.1' (was f15b0dd)
```

本地标签删除很安全，因为标签默认只存在本地，不会自动推送到远程。

#### 删除远程标签（已经 push 到 GitHub 的情况）

需要两步：先删本地，再删远程：

```bash
# 第一步：删除本地
$ git tag -d v0.9

# 第二步：删除远程（推荐写法）
$ git push --delete origin v0.9
To github.com:your-username/learngit.git
 - [deleted]         v0.9
```

之后登录 GitHub 确认该标签已从 Tags 页面消失。

---

### 常用命令速查

| 命令 | 说明 |
| --- | --- |
| `git tag` | 查看所有标签 |
| `git tag <name>` | 对当前 HEAD 打轻量标签 |
| `git tag <name> <commit>` | 对指定 commit 打标签 |
| `git tag -a <name> -m "说明" <commit>` | 打附注标签（含说明）|
| `git show <name>` | 查看标签详情 |
| `git tag -d <name>` | 删除本地标签 |
| `git push origin <name>` | 推送单个标签到远程 |
| `git push origin --tags` | 推送所有未推送的本地标签 |
| `git push --delete origin <name>` | 删除远程标签（推荐）|
| `git push origin :refs/tags/<name>` | 删除远程标签（旧写法，等价） |

---

---

## 6. 自定义 Git

> 更新：2026-03-26

---

### 为什么要自定义 Git

#### 你在做什么

Git 自带的默认配置能用，但日常协作里，你通常会希望：

- **输出更清晰**：例如 `status/diff` 有颜色、更易读
- **仓库更干净**：避免把日志、构建产物、IDE 配置误提交
- **命令更省力**：用别名把常用长命令变短
- **配置更可控**：区分“只对当前仓库生效”与“对所有仓库生效”

这一章聚焦“实用且安全”的自定义方式，避免把配置搞成不可维护的黑盒。

---

### 场景一：让输出更友好（颜色与默认行为）

#### 场景

你希望 Git 的输出更醒目（例如 `git status` / `git diff`），以及一些默认行为更符合你的习惯。

#### 实操

**开启颜色显示（全局）**

```bash
git config --global color.ui auto
```

- `auto`：在终端支持颜色时显示（更通用）
- 也可设为 `true/false`

**查看当前配置**

```bash
git config --list
```

**查看某一项配置值（推荐读法）**

```bash
git config --get color.ui
```

#### 小结

| 命令 | 作用 |
| --- | --- |
| `git config --global color.ui auto` | 开启彩色输出（推荐） |
| `git config --list` | 查看当前生效的所有配置 |
| `git config --get <key>` | 查询某一项配置 |

---

### 场景二：忽略不该提交的文件（.gitignore）

#### 场景

你不想把这些文件提交进仓库：

- 编译/构建产物：`dist/`、`build/`
- 依赖目录：`node_modules/`
- 临时文件：`*.log`、`*.tmp`
- IDE 配置：`.idea/`、`.vscode/`（是否忽略看团队约定）

#### 实操

**第一步：在仓库根目录创建 `.gitignore`**

常见示例：

```gitignore
# logs
*.log

# build artifacts
dist/
build/

# dependencies
node_modules/

# OS / editor
.DS_Store
Thumbs.db
```

**通用模板（可直接复制到项目根目录）**

```gitignore
# 系统文件
.DS_Store
Thumbs.db

# 编辑器
.vscode/
.idea/
*.swp
*.swo

# 环境变量
.env
.env.local
.env.*.local

# 依赖
node_modules/
vendor/
__pycache__/
*.pyc

# 构建产物
dist/
build/
out/
*.log

# 个人笔记（不提交到公共仓库）
NOTES.md
TODO.md
```

**Next.js / 本博客项目额外忽略**

本仓库 [.gitignore](/.gitignore) 已包含 `/.next/`、`/out/` 等 Next.js 构建目录；若使用 Hugo/Jekyll 等静态站点生成器，可额外忽略：

```gitignore
public/        # Hugo/Jekyll 构建输出（注意：Next.js 项目的 public/ 是静态资源目录，不应忽略）
.hugo_build.lock
```

**第二步：让 Git 按规则忽略**

`.gitignore` 保存后，**新产生**且未被追踪的文件会自动被忽略。

> 关键点：如果某文件已经被 Git 追踪过（已经 commit 过），即使写进 `.gitignore` 也不会自动“消失”。需要先取消追踪再提交一次。

**第三步：某文件已被追踪，想停止追踪（保留在本地）**

```bash
git rm -r --cached dist
git add .gitignore
git commit -m "chore: ignore build artifacts"
```

**检查忽略规则是否生效（排查用）**

```bash
git status --ignored
```

#### 小结

| 命令/文件 | 作用 |
| --- | --- |
| `.gitignore` | 声明“哪些文件不该被提交” |
| `git status --ignored` | 查看哪些文件被忽略（排查） |
| `git rm --cached <path>` | 取消追踪（保留工作区文件），配合 `.gitignore` 使用 |

---

### 场景三：配置别名（alias）提升效率

#### 场景

你常用的命令太长，想把它们变短，而且尽量不影响团队（别名通常是个人习惯）。

#### 实操

**给常用命令起别名（全局）**

```bash
git config --global alias.st status
git config --global alias.co switch
git config --global alias.br branch
git config --global alias.ci commit
```

之后就可以这样用：

```bash
git st
git co main
git br
```

**把复杂命令做成别名（示例）**

```bash
git config --global alias.lg "log --graph --decorate --oneline --all"
```

使用：

```bash
git lg
```

> 注意：别名只是你本机的配置，别人机器上不一定有；写团队文档时，关键命令尽量写原命令。

#### 小结

| 命令 | 作用 |
| --- | --- |
| `git config --global alias.<name> <value>` | 创建全局别名 |
| `git <name>` | 使用别名执行对应命令 |

---

### 场景四：按仓库/全局/系统三层管理配置

#### 场景

你想搞清楚一条配置到底写在了哪里：只对某个仓库生效，还是对你电脑上所有仓库生效。

#### 实操

**查看配置优先级（从高到低）**

1. **仓库级**（`--local`）：只对当前仓库生效（默认写入 `.git/config`）
2. **用户级**（`--global`）：对当前用户所有仓库生效（写入 `~/.gitconfig`）
3. **系统级**（`--system`）：对整台机器所有用户生效（通常需要管理员权限）

**分别查看三层配置**

```bash
git config --local --list
git config --global --list
git config --system --list
```

**写入仓库级配置（示例：某个仓库单独用不同邮箱）**

```bash
git config --local user.email "work@email.com"
```

#### 小结

| 命令 | 作用 |
| --- | --- |
| `git config --local/--global/--system --list` | 查看对应层级配置 |
| `git config --local <key> <value>` | 仅对当前仓库生效的配置 |

---

### 常用命令速查

| 命令 | 说明 |
| --- | --- |
| `git config --global color.ui auto` | 让输出有颜色（推荐） |
| `git config --list` | 查看当前生效配置 |
| `git config --get <key>` | 查询单项配置 |
| `.gitignore` | 忽略不提交的文件规则 |
| `git status --ignored` | 查看被忽略的文件 |
| `git rm -r --cached <path>` | 取消追踪并保留本地文件 |
| `git config --global alias.<name> <value>` | 配置别名 |

---

## 7. 附录：命令速查与实战场景

> 各章正文中的 `常用命令速查` 与本附录互补：正文侧重场景理解，此处侧重一页查完。

---

### 常用命令速查（总表）

#### 查看状态

```bash
git status                  # 查看工作区状态
git log                     # 查看提交历史
git log --oneline --graph   # 简洁图形化历史
git diff                    # 查看未暂存的改动
git diff --staged           # 查看已暂存的改动
```

#### 暂存与提交

```bash
git add <file>              # 暂存指定文件
git add .                   # 暂存所有改动
git add -p                  # 交互式暂存（按块选择）

git commit -m "feat: 添加登录功能"
git commit --amend          # 修改最近一次 commit（未 push 时）
```

#### 储藏（Stash）

```bash
git stash                   # 临时储藏当前改动
git stash pop               # 恢复最近一次储藏
git stash list              # 查看所有储藏
git stash drop stash@{0}    # 删除指定储藏
```

#### 分支操作

**个人项目推荐分支策略：**

```
main        ← 稳定版本，只接受 merge
dev         ← 日常开发主线
feature/*   ← 新功能开发
fix/*       ← bug 修复
```

```bash
git branch                        # 查看所有本地分支
git branch -a                     # 查看包括远端的所有分支

git checkout -b feature/login     # 新建并切换分支
git switch -c feature/login       # 同上（新语法，推荐）

git switch main                   # 切换到 main
git merge feature/login           # 将 feature/login 合并到当前分支
git branch -d feature/login       # 删除已合并的分支

# Rebase（保持线性历史，个人项目推荐）
git rebase main                   # 将当前分支变基到 main
```

#### 远端操作

```bash
# 关联远端
git remote add origin git@github.com:user/repo.git
git remote -v                         # 查看远端地址

# 推送
git push origin main                  # 推送到远端 main
git push -u origin main               # 首次推送并设置上游
git push --force-with-lease           # 安全强推（比 --force 更安全）

# 拉取
git fetch origin                      # 只获取不合并
git pull origin main                  # 拉取并合并
git pull --rebase origin main         # 拉取并 rebase（保持线性）
```

#### 撤销与回退

```bash
# 撤销工作区改动（未 add）
git restore <file>

# 取消暂存（已 add，未 commit）
git restore --staged <file>

# 回退 commit（保留代码改动）
git reset --soft HEAD~1

# 回退 commit（放弃代码改动，危险）
git reset --hard HEAD~1

# 安全回退（生成新 commit 来撤销，已 push 时用这个）
git revert <commit-hash>

# 查找并恢复误删内容
git reflog                            # 查看所有操作记录
git checkout <hash>                   # 恢复到指定状态
```

> **原则**：已 push 到远端的 commit 用 `revert`，未 push 的用 `reset`。

---

### Commit 规范（Conventional Commits）

采用 **Conventional Commits** 格式：

```
<type>(<scope>): <subject>

[可选 body]

[可选 footer]
```

#### Type 类型

| Type       | 说明        | 示例                 |
| ---------- | --------- | ------------------ |
| `feat`     | 新功能       | `feat: 添加用户登录功能`   |
| `fix`      | bug 修复    | `fix: 修复登录跳转问题`    |
| `docs`     | 文档更新      | `docs: 更新 README`  |
| `refactor` | 重构（不影响功能） | `refactor: 提取公共方法` |
| `style`    | 代码格式      | `style: 统一缩进格式`    |
| `test`     | 测试相关      | `test: 添加登录单元测试`   |
| `chore`    | 构建/工具     | `chore: 升级依赖版本`    |
| `perf`     | 性能优化      | `perf: 优化列表渲染速度`   |

#### 示例

```bash
git commit -m "feat(auth): 添加 JWT 登录验证"
git commit -m "fix(blog): 修复文章列表分页错误"
git commit -m "docs: 更新 Git 使用文档"
```

> **原则**：每个 commit 只做一件事，粒度越小越好追溯。

---

### 合并 vs Rebase

|      | Merge        | Rebase                |
| ---- | ------------ | --------------------- |
| 历史记录 | 保留分支轨迹，有合并节点 | 线性整洁                  |
| 适用场景 | 团队协作、保留完整历史  | 个人项目、PR 前整理           |
| 风险   | 低            | 不要在已 push 的分支上 rebase |

---

### 常见场景

#### 场景 1：写到一半需要切换任务

```bash
git stash                    # 储藏当前改动
git switch fix/urgent-bug    # 切换去处理紧急 bug
# ... 修完 bug ...
git switch dev
git stash pop                # 恢复之前的工作
```

#### 场景 2：合并前整理 commit（squash）

```bash
git rebase -i HEAD~3         # 交互式 rebase 最近 3 个 commit
# 将多余的 commit 标记为 squash(s)，合并成一个干净的 commit
```

#### 场景 3：误删文件恢复

```bash
git checkout HEAD -- <file>  # 从最近一次 commit 恢复文件
```

#### 场景 4：查看某个文件的历史改动

```bash
git log --follow -p <file>   # 查看文件的完整改动历史
git blame <file>             # 查看每一行最后由谁修改
```

#### 场景 5：同步 fork 的上游仓库

```bash
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git merge upstream/main
```

---
