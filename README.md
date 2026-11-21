# Neutrino & Dark Matter Group website

Static website for the Neutrino & Dark Matter Group at The Chinese University of Hong Kong,
Shenzhen. The site is built with Astro 6 and produces static files intended for Nginx at
`https://yegroup.cuhk.edu.cn`. No production deployment has been performed.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the one-year plan, owners and review cadence.

## Repository layout

- `src/` — Astro pages, components, layouts and structured content.
- `public/` — static files served by Astro, including the original images.
- `scripts/` — media generation, content validation and server-side deployment.
- `docs/` — content editing, deployment and planning guides.
- `dist/`, `public/media/`, `.astro/` and `node_modules/` are generated or installed locally and are not tracked.

## Documentation

- [AI agent boundaries](AGENTS.md) — read before any AI-assisted change.
- [Editor tutorial](docs/EDITOR_TUTORIAL.md) — start here for content updates and local preview.
- [Page templates](docs/PAGE_TEMPLATES.md) — copyable templates for every content/page type.
- [Content guide](docs/CONTENT_GUIDE.md) — field definitions, validation and editorial rules.
- [GitHub workflow](docs/GITHUB_WORKFLOW.md) — branches, pull requests, review, releases and rollback.
- [Roadmap](docs/ROADMAP.md) — one-year priorities, owners and review cadence.
- [Lab server deployment](docs/DEPLOYMENT.md) — Nginx, release layout and rollback.
- [Cloud static hosting](docs/STATIC_HOST_DEPLOYMENT.md) — OSS/COS + CDN migration guide.

## Requirements

- Node.js 22.22.0 (see `.nvmrc`)
- npm with the committed `package-lock.json`
- The dependencies already pinned in `package.json`; no additional runtime or browser framework

## Install and develop on MAC

```sh
npm ci
npm run dev
```

`npm run dev` first generates responsive WebP derivatives in `public/media/`, then starts the
local Astro server at `http://127.0.0.1:4321`.

## Checks and production build

```sh
npm run check
npm run build
npm run preview
```

- `npm run check` runs `scripts/validate-content.mjs`. It validates structured JSON, Markdown
  frontmatter, required fields, slugs and IDs, publication ordering, dates, record references,
  local image/CV paths, activity records, and editorial limits such as the five featured
  publications.
- `npm run build` regenerates `public/media/`, runs the validator, and then runs `astro build`.
- `npm run preview` serves the generated `dist/` output locally.
- Deployment output is entirely contained in `dist/`. No Node.js process is required in
  production.

Astro telemetry is disabled in the npm scripts so builds do not attempt to write outside the
project directory.

## Content

- `src/content/members/*.md` — one Markdown record per current member.
- `src/content/research/*.md` — one Markdown record per research project.
- `src/content/openings/positions.md` — recruitment information and structured role sections.
- `src/data/publications.json` — publication records, links, explicit secondary order and the
  homepage selection.
- `src/data/alumni.json` — former members.
- `src/data/albums.json` — gallery albums and ordered photographs.
- `src/data/news.json` — news items, including draft/published state. A user-requested Solar pp
  editorial preview is currently visible locally with an explicit preview notice. Set it to
  `draft` or remove it before production deployment unless the group approves the copy.
- `src/data/activities.json` — seminars, external talks and undergraduate lectures. Only verified
  records are included, with optional posters and event photographs; drafts never appear in
  public output.
- `src/data/settings.json` — institutional identity, contact details and homepage display limits.

Adding a record to these content files updates the relevant pages without template changes. See
[`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) for field definitions, optional fields, draft
handling and image instructions.

## Images

Original supplied files remain unchanged under `public/assets/images/`, organised into
`profile_photo/`, `group_photo/`, `logo/`, `research_photo/` and `activity_photo/<album-slug>/`;
the CV stays at `public/assets/images/cv.pdf`. `scripts/generate-media.mjs` walks these subfolders,
uses the installed `sharp` dependency to create compressed, responsive WebP variants plus
`public/media/manifest.json`. The generated directory is ignored by Git and is rebuilt on every
`npm run dev` and `npm run build`.

## Routes

The legacy singular routes `/publication/` and `/opening/` are retained. Member profile URLs are
kept at the site root, for example `/jingqiang-ye/`. The archived WordPress media/CV redirects are
documented in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

Activities use `/activities/` and generate `/activities/<slug>/` for published records only.

## Deployment

There are two deployment options:

- [`docs/STATIC_HOST_DEPLOYMENT.md`](docs/STATIC_HOST_DEPLOYMENT.md) describes the managed-static
  production path using Alibaba Cloud OSS, Tencent Cloud COS or an equivalent institutional
  platform, including GitHub deployment, WordPress cutover, redirects and rollback.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) contains the single-Windows-host and Nginx
  deployment plan, including release layout and a reviewable Nginx example.

The managed-static deployment is preferred for the permanent public site. Do not change the
university CNAME or WordPress.com domain mapping until the replacement site has passed its
pre-launch checks.
