# Neutrino & Dark Matter Group website

Static website for the Neutrino & Dark Matter Group at The Chinese University of Hong Kong,
Shenzhen. The site is built with Astro 6 and produces static files intended for Nginx at
`https://yegroup.cuhk.edu.cn`. No production deployment has been performed.

## Repository layout

- `src/` — Astro pages, components, layouts and structured content.
- `public/` — static files served by Astro, including the original images.
- `scripts/` — media generation, content validation and server-side deployment.
- `docs/` — content editing and deployment guides.
- `dist/`, `public/media/`, `.astro/` and `node_modules/` are generated or installed locally and are not tracked.

## Requirements

- Node.js 22.22.0 (see `.nvmrc`)
- npm with the committed `package-lock.json`
- The dependencies already pinned in `package.json`; no additional runtime or browser framework

## Install and develop

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

Read [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) before deploying. It contains a reviewable Nginx
example, release layout, server-side Git deployment, HTTPS placeholders, 404 and clean-URL
handling, validation, backup and rollback guidance. Server commands in that document were not
executed as part of this implementation.
