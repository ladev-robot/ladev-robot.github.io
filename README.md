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

Production build:

```bash
npm run build
npm start
```

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
