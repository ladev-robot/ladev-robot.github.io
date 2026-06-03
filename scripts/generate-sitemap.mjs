import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "contents");
const publicDir = path.join(process.cwd(), "public");

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

function loadSiteUrl() {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const env = fs.readFileSync(envPath, "utf8");
    for (const line of env.split("\n")) {
      const match = line.match(/^NEXT_PUBLIC_URL=(.+)$/);
      if (match) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // .env.local optional
  }
  return process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
}

function getAllPosts() {
  const files = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"));

  return files.map((file) => {
    const fullPath = path.join(postsDirectory, file);
    const { data } = matter(fs.readFileSync(fullPath, "utf8"));
    return {
      slug: data.slug || file.replace(/\.md$/, ""),
      tags: data.tags || [],
      category: data.category || "",
    };
  });
}

function generateSiteMap({ slugs, categories, tags }, siteUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${siteUrl}</loc>
      </url>
      <url>
        <loc>${siteUrl}/blog</loc>
      </url>
      <url>
        <loc>${siteUrl}/blog/categories</loc>
      </url>
      <url>
        <loc>${siteUrl}/blog/tags</loc>
      </url>
      ${categories
        .map(
          (category) => `
        <url>
        <loc>${siteUrl}/blog/categories/${category}</loc>
        </url>
      `
        )
        .join("")}
      ${tags
        .map(
          (tag) => `
        <url>
        <loc>${siteUrl}/blog/tags/${tag}</loc>
        </url>
      `
        )
        .join("")}
      ${slugs
        .map(
          (slug) => `
        <url>
        <loc>${siteUrl}/blog/posts/${slug}</loc>
        </url>
      `
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
const slugs = posts.map((post) => encodeURIComponent(String(post.slug).trim()));

const siteUrl = loadSiteUrl().replace(/\/$/, "");
const sitemap = generateSiteMap({ slugs, categories, tags }, siteUrl);

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
console.log("Generated public/sitemap.xml");
