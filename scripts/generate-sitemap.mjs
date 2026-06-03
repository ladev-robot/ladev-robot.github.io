import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDirectory = path.join(__dirname, "../contents");
const outPath = path.join(__dirname, "../public/sitemap.xml");

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const baseUrl = (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

function getAllPosts() {
  const files = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"));

  return files.map((file) => {
    const fullPath = path.join(postsDirectory, file);
    const { data } = matter(fs.readFileSync(fullPath, "utf8"));
    return {
      slug: data.slug ? data.slug : file.replace(/\.md$/, ""),
      tags: data.tags || [],
      category: data.category,
    };
  });
}

function generateSiteMap({ slugs, categories, tags }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
  </url>
  <url>
    <loc>${baseUrl}/blog/categories</loc>
  </url>
  <url>
    <loc>${baseUrl}/blog/tags</loc>
  </url>
  ${categories
    .map(
      (category) => `
  <url>
    <loc>${baseUrl}/blog/categories/${category}</loc>
  </url>`
    )
    .join("")}
  ${tags
    .map(
      (tag) => `
  <url>
    <loc>${baseUrl}/blog/tags/${tag}</loc>
  </url>`
    )
    .join("")}
  ${slugs
    .map(
      (slug) => `
  <url>
    <loc>${baseUrl}/blog/posts/${slug}</loc>
  </url>`
    )
    .join("")}
</urlset>
`;
}

const posts = getAllPosts();

const categories = posts
  .map((post) => slugify(post.category))
  .filter((x, i, a) => a.indexOf(x) === i);

let tags = [];
for (const post of posts) {
  if (post.tags?.length) tags.push(...post.tags);
}
tags = tags.filter((x, i, a) => a.indexOf(x) === i);

const slugs = posts.map((post) =>
  encodeURIComponent(String(post.slug).trim())
);

fs.writeFileSync(outPath, generateSiteMap({ slugs, tags, categories }));
console.log(`Wrote ${outPath}`);
