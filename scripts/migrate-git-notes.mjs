import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const notesDir = "C:/Users/Ao/Desktop/home/study/Git/note";
const outDir = path.join(__dirname, "../contents");

function convertBody(raw) {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\[\[#([^\]]+)\]\]/g, "$1")
    .replace(/^>路径：.*\n/gm, "")
    .replace(/^> 路径：.*\n/gm, "")
    .replace(/^_上一章：.*\n?/gm, "")
    .replace(/^_下一章：.*\n?/gm, "")
    .replace(/^_参考：.*\n?/gm, "")
    .replace(/\[\[git-workflow\]\].*\n/g, "")
    .replace(/\[\[github-actions\]\].*\n/g, "")
    .replace(/\[\[obsidian-git\]\].*\n/g, "")
    .replace(/^## 相关链接\n\n[\s\S]*?(?=\n---|\n## |$)/m, "")
    .replace(/^> 来源：.*\n\n?/m, "")
    .replace(/^## 目录\n\n[\s\S]*?\n---\n\n/m, "")
    .trim();
}

function stripChapterTitle(body) {
  return body.replace(/^## [^\n]+\n\n---\n\n/m, "");
}

/** 章内原 ## 降为 ###，原 ### 降为 ####，避免与章标题同级 */
function demoteHeadings(body) {
  return body
    .replace(/^##### /gm, "###### ")
    .replace(/^#### /gm, "##### ")
    .replace(/^### /gm, "#### ")
    .replace(/^## /gm, "### ");
}

function toYaml(fm) {
  const tags = fm.tags.map((t) => `  - ${t}`).join("\n");
  const lines = [
    "---",
    `title: ${fm.title}`,
    `description: ${fm.description}`,
    `excerpt: ${fm.excerpt}`,
    `datetime: ${fm.datetime}`,
    `slug: ${fm.slug}`,
    `featured: ${fm.featured}`,
    `category: ${fm.category}`,
    "tags:",
    tags,
    `author: ${fm.author}`,
    `language: ${fm.language}`,
  ];
  if (fm.toc) lines.push("toc: true");
  lines.push("---");
  return lines.join("\n");
}

const guideChapters = [
  {
    source: "2. 创建版本库.md",
    title: "创建版本库",
    sourceUrl:
      "https://liaoxuefeng.com/books/git/create-repo/index.html",
  },
  {
    source: "3. 版本回退.md",
    title: "版本回退",
    sourceUrl:
      "https://liaoxuefeng.com/books/git/time-travel/index.html",
  },
  {
    source: "4. 远程仓库.md",
    title: "远程仓库",
    sourceUrl: "https://liaoxuefeng.com/books/git/remote/index.html",
  },
  {
    source: "5. 分支管理.md",
    title: "分支管理",
    sourceUrl: "https://liaoxuefeng.com/books/git/branch/index.html",
  },
  {
    source: "6. 标签管理.md",
    title: "标签管理",
    sourceUrl: "https://liaoxuefeng.com/books/git/tag/index.html",
  },
  {
    source: "7. 自定义Git.md",
    title: "自定义 Git",
    sourceUrl: "https://liaoxuefeng.com/books/git/customize/index.html",
  },
];

const guideParts = guideChapters.map(({ source, title }, index) => {
  const raw = fs.readFileSync(path.join(notesDir, source), "utf8");
  const body = demoteHeadings(stripChapterTitle(convertBody(raw)));
  return `## ${index + 1}. ${title}\n\n${body}`;
});

const guideContent = `${toYaml({
  title: "Git 入门完整教程",
  description: "从创建版本库到分支、远程、标签与自定义配置",
  excerpt: "六章合一的 Git 学习笔记，右侧目录可快速跳转",
  datetime: "2026-05-30T10:00:00.000Z",
  slug: "git-guide",
  featured: true,
  category: "Git",
  tags: ["git", "tutorial", "guide"],
  author: "Ao",
  language: "Chinese",
  toc: true,
})}

本教程为个人学习笔记，主要参考 [廖雪峰 Git 教程](https://liaoxuefeng.com/books/git/introduction/)。命令速查见 [Git 使用速查](/blog/posts/git-cheatsheet)。

${guideParts.join("\n\n---\n\n")}
`;

fs.writeFileSync(path.join(outDir, "git-guide.md"), guideContent, "utf8");
console.log("Wrote git-guide.md");

const cheatsheetRaw = fs.readFileSync(
  path.join(notesDir, "1. Git使用文档.md"),
  "utf8"
);
const cheatsheetBody = convertBody(cheatsheetRaw);
const cheatsheetContent = `${toYaml({
  title: "Git 使用速查",
  description: "安装、概念、常用命令、分支策略与 .gitignore 模板",
  excerpt: "个人整理的 Git 速查手册：从安装配置到撤销回退与常见场景",
  datetime: "2026-05-29T10:00:00.000Z",
  slug: "git-cheatsheet",
  featured: true,
  category: "Git",
  tags: ["git", "cheatsheet", "notes"],
  author: "Ao",
  language: "Chinese",
})}

${cheatsheetBody}

按章节学习请阅读 [Git 入门完整教程](/blog/posts/git-guide)。
`;

fs.writeFileSync(path.join(outDir, "git-cheatsheet.md"), cheatsheetContent, "utf8");
console.log("Wrote git-cheatsheet.md");

const removeFiles = [
  "git-create-repo.md",
  "git-reset.md",
  "git-remote.md",
  "git-branch.md",
  "git-tag.md",
  "git-customize.md",
  "git-series.md",
];

for (const file of removeFiles) {
  const filePath = path.join(outDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("Removed", file);
  }
}
