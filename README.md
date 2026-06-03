# Leo.dev — Portfolio & Blog

Next.js (SSG) + TypeScript personal site. Markdown posts in `contents/`, Tailwind CSS styling, light/dark themes.

## Prerequisites

- Node.js **18.17+** ([`.nvmrc`](.nvmrc) pins major version)
- npm (ships with Node.js)
- Git + SSH access to GitHub (private repo requires read permission)

## Quick Start

```bash
git clone git@github.com:<you>/<repo>.git
cd <repo>
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm ci
npm run dev                  # http://localhost:3000
```

Production build (static export → `out/`):

```bash
npm run build
npx serve out
```

## Deploy to GitHub Pages (用户站)

仓库名须为 **`<github-username>.github.io`**，站点地址为 `https://<github-username>.github.io/`。

1. 在 GitHub 将仓库重命名或新建为 `yourusername.github.io`，推送本仓库代码到 `main`。
2. 仓库 **Settings → Pages → Build and deployment** 选择 **GitHub Actions**。
3. 推送后 **Actions** 中的 “Deploy to GitHub Pages” 会自动构建并发布 `out/` 目录。
4. 本地 `.env.local` 中设置 `NEXT_PUBLIC_URL=https://yourusername.github.io`（须与线上一致，影响 SEO、sitemap、OG）。

可选：在仓库 **Settings → Secrets and variables → Actions → Variables** 配置 `NEXT_PUBLIC_EMAIL`、`NEXT_PUBLIC_GOOGLE_ANALYTICS`。

## Environment Variables

Copy [`.env.example`](.env.example) to `.env.local` and edit:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_URL` | Site base URL (SEO, sitemap, OG) |
| `NEXT_PUBLIC_EMAIL` | Contact email shown on site |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS` | GA4 measurement ID (optional) |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

## Project Structure

```
contents/          Markdown blog posts
components/        React components
pages/             Next.js routes
public/            Static assets
constants/         Site config
utils/             Content & markdown helpers
```

## Git Workflow

See [contents/git-blog-to-github-case.md](contents/git-blog-to-github-case.md) for the enterprise PR workflow used with this repo.

## License

Private repository. All rights reserved unless otherwise noted.
