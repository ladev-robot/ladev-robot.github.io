# 个人博客 Git 维护操作手册

## 1. 手册目标

这份手册用于帮助你用接近企业标准、但适合个人长期坚持的方式维护个人博客项目 `Blog`。

项目特点：

- 使用 Git 管理版本
- 博客文章主要存放在 `contents/` 目录
- 代码托管在 GitHub
- 后续会部署到 GitHub Pages
- 通过真实项目熟悉 Git 命令、分支规范、提交规范和发布流程

本手册采用“企业标准简化版”：

- 每次修改都走分支
- 每次提交都有清晰说明
- 合并前先自查
- 发布前有检查清单
- 出问题时能回退、排查、修复

---

## 2. 推荐整体流程

```text
同步 main 分支
    ↓
新建任务分支
    ↓
修改或新增博客文章
    ↓
本地检查修改内容
    ↓
暂存文件
    ↓
提交 commit
    ↓
推送到 GitHub
    ↓
创建 Pull Request
    ↓
自查并合并到 main
    ↓
GitHub Pages 自动部署
    ↓
清理本地分支
```

这样做的意义：

- `main` 始终保持稳定
- 每次修改都有独立分支，方便回溯
- 提交记录更清晰
- 可以模拟企业真实开发流程
- 出问题时更容易定位是哪次修改导致的

---

## 3. 分支规范

### 3.1 主分支

建议保留一个长期稳定分支：

```bash
main
```

`main` 表示正式版本。

对于个人博客来说：

- `main` 上的内容应该是已经确认可以发布的内容
- GitHub Pages 通常会从 `main` 分支部署
- 不建议直接在 `main` 上修改和提交

---

### 3.2 任务分支

每次新增文章、修改文章、修复问题，都新建一个任务分支。

推荐格式：

```text
类型/简短描述
```

常用类型：

| 类型 | 使用场景 | 示例 |
|---|---|---|
| `article` | 新增或大幅更新博客文章 | `article/git-workflow` |
| `fix` | 修复错别字、链接、格式问题 | `fix/git-blog-typo` |
| `docs` | 修改说明文档、操作手册 | `docs/blog-guide` |
| `chore` | 项目维护类操作 | `chore/update-config` |

示例：

```bash
git switch -c article/git-workflow
```

命令解释：

- `git switch`：切换分支
- `-c`：创建一个新分支并切换过去
- `article/git-workflow`：新分支名称

---

## 4. 提交信息规范

### 4.1 推荐格式

建议使用类似企业中常见的提交规范：

```text
类型: 简短说明
```

示例：

```bash
git commit -m "article: add git workflow blog"
```

常用类型：

| 类型 | 含义 | 示例 |
|---|---|---|
| `article` | 新增或大幅更新文章 | `article: add git workflow blog` |
| `fix` | 修复错误 | `fix: correct typo in git article` |
| `docs` | 更新文档 | `docs: add blog maintenance guide` |
| `chore` | 项目维护 | `chore: update gitignore` |

---

### 4.2 好的提交信息

推荐：

```bash
git commit -m "article: add GitHub Pages deployment guide"
```

```bash
git commit -m "fix: correct markdown heading levels"
```

不推荐：

```bash
git commit -m "update"
```

```bash
git commit -m "改了一下"
```

```bash
git commit -m "111"
```

原因：

- 以后看不懂改了什么
- 出问题时难以回溯
- 不利于养成企业项目习惯

---

## 5. 日常维护流程

### 第一步：进入项目目录

```bash
cd c:/Users/Ao/Desktop/home/study/Blog
```

命令解释：

- `cd`：进入指定目录

意义：

确保后续 Git 命令都在博客项目中执行。

---

### 第二步：查看当前仓库状态

```bash
git status
```

命令解释：

- `git status`：查看当前分支、文件修改、暂存状态

你需要关注：

- 当前在哪个分支
- 有没有未提交的修改
- 有没有未跟踪的新文件

意义：

做任何操作前，先看状态。这是企业开发中的基本习惯。

---

### 第三步：切换到 main 分支

```bash
git switch main
```

命令解释：

- `git switch main`：切换到 `main` 分支

意义：

新任务应该从最新的 `main` 分支开始，避免基于旧内容修改。

---

### 第四步：同步远程 main

```bash
git pull origin main
```

命令解释：

- `git pull`：拉取远程更新并合并到当前分支
- `origin`：远程仓库名称，通常默认叫 `origin`
- `main`：远程的 `main` 分支

意义：

确保本地 `main` 和 GitHub 上的 `main` 保持一致。

---

### 第五步：新建任务分支

新增文章：

```bash
git switch -c article/git-workflow
```

修复文章问题：

```bash
git switch -c fix/git-blog-typo
```

意义：

每个任务一个独立分支，方便管理、审查和回退。

---

### 第六步：编辑博客内容

你的文章主要放在：

```text
contents/
```

例如新增文章：

```text
contents/git-workflow.md
```

建议文章文件命名：

```text
主题-简短描述.md
```

示例：

```text
git-blog-to-github-case.md
github-pages-deployment.md
my-first-git-workflow.md
```

命名建议：

- 使用英文小写
- 单词之间用 `-`
- 不使用空格
- 文件名能表达文章主题

---

### 第七步：查看修改内容

查看修改了哪些文件：

```bash
git status
```

查看具体修改内容：

```bash
git diff
```

命令解释：

- `git diff`：查看尚未暂存的修改内容

意义：

提交前先自查，避免提交无关内容、错别字或临时修改。

---

### 第八步：暂存文件

暂存指定文件：

```bash
git add contents/git-workflow.md
```

暂存当前目录所有修改：

```bash
git add .
```

命令解释：

- `git add`：把修改加入暂存区
- `.`：表示当前目录下所有修改

建议：

学习阶段优先使用明确文件名：

```bash
git add contents/xxx.md
```

这样可以避免误把无关文件提交进去。

---

### 第九步：确认暂存内容

```bash
git status
```

查看已经暂存、即将提交的内容：

```bash
git diff --cached
```

命令解释：

- `--cached`：查看暂存区内容，也就是下一次 commit 会提交的内容

意义：

这是提交前的最后检查。

---

### 第十步：提交 commit

```bash
git commit -m "article: add git workflow blog"
```

命令解释：

- `git commit`：创建一次提交
- `-m`：直接在命令中填写提交信息
- `"article: add git workflow blog"`：提交说明

意义：

commit 是 Git 中最重要的版本记录单位。每一次 commit 都应该表达一个明确的修改目的。

---

### 第十一步：推送分支到 GitHub

第一次推送新分支：

```bash
git push -u origin article/git-workflow
```

命令解释：

- `git push`：推送本地分支到远程仓库
- `-u`：建立本地分支和远程分支的关联
- `origin`：远程仓库
- `article/git-workflow`：要推送的分支名

之后如果继续在同一个分支上提交，只需要：

```bash
git push
```

意义：

把本地修改上传到 GitHub，方便创建 Pull Request。

---

### 第十二步：创建 Pull Request

进入 GitHub 仓库页面，通常会看到：

```text
Compare & pull request
```

点击后创建 PR。

PR 标题建议：

```text
article: add git workflow blog
```

PR 描述建议：

```markdown
## Summary

- 新增 Git 工作流博客文章
- 说明个人博客维护流程
- 补充常用 Git 命令解释

## Checklist

- [ ] 已检查文章标题
- [ ] 已检查 Markdown 格式
- [ ] 已检查链接是否正确
- [ ] 已确认没有提交无关文件
```

意义：

即使是个人项目，也通过 PR 做一次自查，模拟企业代码合并流程。

---

### 第十三步：合并 Pull Request

确认无误后，在 GitHub 页面点击：

```text
Merge pull request
```

个人博客推荐选择：

```text
Squash and merge
```

原因：

- 提交历史更简洁
- 一个 PR 最终对应一个清晰记录
- 适合个人项目维护

---

### 第十四步：同步本地 main

PR 合并后，回到本地终端：

```bash
git switch main
```

```bash
git pull origin main
```

意义：

让本地 `main` 更新到 GitHub 最新状态。

---

### 第十五步：删除本地任务分支

```bash
git branch -d article/git-workflow
```

命令解释：

- `git branch`：管理分支
- `-d`：删除已经合并过的本地分支
- `article/git-workflow`：要删除的分支名

意义：

保持本地分支干净，避免分支越来越多。

如果 Git 提示分支未合并，不要强制删除，先检查原因。

---

## 6. GitHub Pages 发布流程

推荐规则：

```text
只有 main 分支代表正式发布内容
```

通常流程：

```text
PR 合并到 main
    ↓
GitHub Pages 自动构建
    ↓
博客网站更新
```

发布前检查：

- 文章标题是否正确
- Markdown 格式是否正常
- 图片路径是否正确
- 内部链接是否有效
- 是否有草稿内容误发布
- 是否有本地临时文件被提交

如果 GitHub Pages 没有更新，可以检查：

- GitHub 仓库的 `Actions`
- GitHub Pages 设置
- 构建日志是否报错
- 分支是否选择 `main`

---

## 7. 常见维护场景

### 场景一：新增一篇文章

```bash
git switch main
git pull origin main
git switch -c article/new-blog-topic
```

编辑文章：

```text
contents/new-blog-topic.md
```

检查：

```bash
git status
git diff
```

提交：

```bash
git add contents/new-blog-topic.md
git commit -m "article: add new blog topic"
git push -u origin article/new-blog-topic
```

然后在 GitHub 创建 PR，检查后合并。

---

### 场景二：修改已有文章

```bash
git switch main
git pull origin main
git switch -c fix/update-git-blog
```

修改文章：

```text
contents/git-blog-to-github-case.md
```

检查并提交：

```bash
git status
git diff
git add contents/git-blog-to-github-case.md
git commit -m "fix: update git blog content"
git push -u origin fix/update-git-blog
```

---

### 场景三：修复错别字

```bash
git switch main
git pull origin main
git switch -c fix/typo-git-blog
```

提交信息：

```bash
git commit -m "fix: correct typo in git blog"
```

意义：

即使是小修改，也走规范流程，可以培养稳定习惯。

---

### 场景四：删除文章

删除文件后：

```bash
git status
```

确认删除的是目标文章：

```bash
git add contents/old-article.md
git commit -m "article: remove old article"
git push -u origin article/remove-old-article
```

注意：

删除文章也建议走 PR，因为删除属于重要内容变更。

---

### 场景五：查看提交历史

```bash
git log --oneline
```

命令解释：

- `git log`：查看提交历史
- `--oneline`：每个提交显示为一行

示例输出：

```text
a1b2c3d article: add git workflow blog
e4f5g6h fix: correct typo in git article
```

意义：

快速查看项目历史。

---

### 场景六：撤销还没暂存的修改

如果你修改了文件，但还没有 `git add`，想放弃修改：

```bash
git restore contents/example.md
```

命令解释：

- `git restore`：恢复文件
- 后面跟文件名

注意：

这个操作会丢弃本地修改，执行前一定确认。

---

### 场景七：撤销已经暂存的文件

如果你已经执行了：

```bash
git add contents/example.md
```

但还没提交，可以取消暂存：

```bash
git restore --staged contents/example.md
```

命令解释：

- `--staged`：只从暂存区移除，不删除你的实际修改

意义：

适合发现暂存错文件时使用。

---

### 场景八：提交后发现还要补充修改

如果 commit 之后发现文章还有小问题，推荐再提交一次：

```bash
git add contents/example.md
git commit -m "fix: correct article formatting"
```

学习阶段不建议频繁使用：

```bash
git commit --amend
```

原因：

`--amend` 会改写提交历史，初学时容易混乱。等你熟悉 Git 后再使用。

---

### 场景九：本地分支落后 main

在任务分支上开发了一段时间后，如果 `main` 有新更新，可以执行：

```bash
git switch main
git pull origin main
git switch article/git-workflow
git merge main
```

命令解释：

- 先更新本地 `main`
- 再回到任务分支
- 用 `git merge main` 把最新主分支合并进来

意义：

减少后续 PR 合并冲突。

---

### 场景十：遇到冲突

冲突通常发生在多个分支修改了同一处内容时。

先查看状态：

```bash
git status
```

打开冲突文件后，会看到类似内容：

```text
<<<<<<< HEAD
当前分支内容
=======
另一边分支内容
>>>>>>> main
```

你需要手动编辑成最终想要的内容，然后：

```bash
git add 冲突文件
git commit
```

意义：

冲突不是错误，而是 Git 无法自动判断该保留哪一份内容，需要你人工决定。

---

## 8. 发布前检查清单

每次 PR 合并前，建议检查：

```markdown
## Blog Publish Checklist

- [ ] 文章文件名清晰，使用英文小写和短横线
- [ ] 文章标题正确
- [ ] Markdown 标题层级合理
- [ ] 代码块语言标记正确
- [ ] 图片路径正确
- [ ] 链接可以打开
- [ ] 没有提交临时文件
- [ ] `git diff --cached` 已检查
- [ ] commit message 符合规范
```

---

## 9. 推荐个人维护节奏

### 写文章时

可以先在任务分支中慢慢写，不急着合并。

```bash
git switch -c article/my-new-topic
```

写到一个阶段就提交一次：

```bash
git add contents/my-new-topic.md
git commit -m "article: draft my new topic"
```

继续修改后再提交：

```bash
git add contents/my-new-topic.md
git commit -m "article: refine my new topic"
```

文章确认完成后再创建 PR。

---

### 小修改时

错别字、格式、链接修复也走分支：

```bash
git switch -c fix/article-link
```

这样可以训练完整流程。

---

### 每周维护一次

建议每周做一次：

```bash
git switch main
git pull origin main
git branch
git status
```

检查：

- 当前分支是否干净
- 是否有未提交内容
- 是否有长期不用的分支
- GitHub Pages 是否正常部署

---

## 10. 常用命令速查

| 命令 | 作用 |
|---|---|
| `git status` | 查看当前仓库状态 |
| `git switch main` | 切换到 main 分支 |
| `git switch -c 分支名` | 创建并切换到新分支 |
| `git pull origin main` | 拉取远程 main 最新内容 |
| `git diff` | 查看未暂存的修改 |
| `git diff --cached` | 查看已暂存、准备提交的修改 |
| `git add 文件名` | 暂存指定文件 |
| `git add .` | 暂存当前目录所有修改 |
| `git commit -m "说明"` | 创建提交 |
| `git push -u origin 分支名` | 首次推送新分支 |
| `git push` | 推送当前分支 |
| `git log --oneline` | 简洁查看提交历史 |
| `git branch` | 查看本地分支 |
| `git branch -d 分支名` | 删除已合并的本地分支 |
| `git restore 文件名` | 放弃未暂存修改 |
| `git restore --staged 文件名` | 取消暂存 |

---

## 11. 推荐最小工作流

如果完整流程太长，至少坚持这个最小流程：

```bash
git status
git switch main
git pull origin main
git switch -c article/your-topic
```

修改文章后：

```bash
git status
git diff
git add contents/your-topic.md
git diff --cached
git commit -m "article: add your topic"
git push -u origin article/your-topic
```

然后去 GitHub 创建 PR，检查后合并。

这是最适合个人博客长期坚持的企业化简化流程。

---

## 12. 核心原则

维护个人博客时，记住这几个原则：

1. 不直接在 `main` 上开发
2. 一个任务一个分支
3. 一个 commit 表达一个清晰目的
4. 提交前一定看 `git diff`
5. 合并前通过 PR 自查
6. `main` 永远代表可发布版本
7. 遇到问题先 `git status`

---

## 13. 推荐练习路线

为了熟悉 Git，可以按下面顺序练习：

1. 新建一篇测试文章并提交
2. 修改这篇文章并再次提交
3. 创建 PR 并合并
4. 删除本地分支
5. 修复一个错别字并走完整流程
6. 查看提交历史
7. 尝试撤销一次未暂存修改
8. 尝试取消暂存文件
9. 熟悉 GitHub Pages 发布结果

完成这些练习后，你就已经走过了一套简化版企业 Git 工作流。
