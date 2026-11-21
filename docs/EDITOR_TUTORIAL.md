# Editor tutorial

This tutorial is for group members who need to update the website. You do not need to be a
programmer. Choose the workflow that matches the size of your change.

- Small text fix: edit in the GitHub web interface.
- Most content changes: clone the repository, preview locally, then open a pull request.
- Structural or design changes: ask the site maintainer first.

Field-level reference lives in [CONTENT_GUIDE.md](CONTENT_GUIDE.md). Copyable examples for each
page type live in [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md). Branch, review and merge rules live in
[GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md).

## Golden rules (read first)

These rules apply to every editor except the repository maintainer.

- **Never commit or push directly to `main`.** It is protected.
- **Always create a new branch before editing.** Do not edit files while on `main`.
- **Always open a pull request.** Every change reaches `main` through a pull request.
- **Only the maintainer merges.** Contributors must not click **Merge pull request**, even after
  approval.
- **Do not merge without the required content approval** from the editor or PI.
- If GitHub blocks you, ask the maintainer. Do not try to bypass branch protection.

The maintainer may commit directly to `main` when they choose to skip the PR. This exception does
not apply to anyone else. The detailed branch, review and merge rules are in
[GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md).

## 1. What you can edit

You can safely edit:

- `src/content/members/*.md` — member profiles.
- `src/content/research/*.md` — research project pages.
- `src/content/openings/positions.md` — openings and application instructions.
- `src/data/publications.json` — publication records.
- `src/data/news.json` — news items.
- `src/data/activities.json` — seminars, talks and undergraduate lectures.
- `src/data/albums.json` — gallery albums.
- `src/data/alumni.json` — former members.
- `src/data/settings.json` — site identity, contact details, homepage hero slides and limits.
- `public/assets/images/` — original photographs, logos and CV files.

Do not edit:

- `dist/`, `public/media/`, `.astro/` or `node_modules/` — generated or installed files.
- Files under `.github/workflows/` or deployment credentials unless you are the maintainer.
- Other people's personal data, unpublished results or photographs without permission.
- An existing member's name, role or affiliation without confirmation from the PI or editor.

## 2. Before you start

1. Ask the site maintainer for access to the private GitHub repository.
2. Use a GitHub account with two-factor authentication enabled.
3. Agree the content with the PI or editor before publishing claims, people, positions or
   photographs.
4. Read the relevant section of [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md) before copying a record.

## 3. Option A: small edit in the browser

Use this for a typo, a caption change or a small text update. It does not require Node.js or a
local clone, but it cannot preview the whole site.

1. Open <https://github.com/OA3lllhhy/ye-group-website>.
2. Navigate to the file you need.
3. Click the pencil icon (**Edit this file**).
4. Make the change.
5. At the bottom, **do not choose “Commit directly to the `main` branch”**. Choose
   **Create a new branch for this commit and start a pull request**.
6. Use a short branch name, for example `content/fix-haoyun-bio`.
7. Commit the change and open the pull request against `main`.
8. Ask the editor or maintainer to review it. **Only the maintainer merges.** Do not click
   **Merge pull request**, even if GitHub shows the button as available.

For image uploads, use **Add file → Upload files**, then place the file in the correct folder
under `public/assets/images/`. Use the exact path shown in [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md).

## 4. Option B: local editing with preview

This is the recommended workflow for member profiles, news, activities, albums and anything that
changes layout or images.

### Install the tools

- Git: <https://git-scm.com/downloads>
- Node.js 22.22.0: use [nvm](https://github.com/nvm-sh/nvm) or the official installer.
- A Git client: GitHub Desktop, VS Code with Git support, or the command line.

Check the versions:

```sh
git --version
node --version
npm --version
```

### Clone and install

```sh
git clone git@github.com:OA3lllhhy/ye-group-website.git
cd ye-group-website
npm ci
```

If SSH is not configured, use GitHub Desktop to clone the repository or use the HTTPS URL shown
on the repository page.

### Start the local preview

```sh
npm run dev
```

Open <http://127.0.0.1:4321>. The command regenerates responsive images before starting the
server. Keep the terminal open while you edit.

### Make the change

1. **Before editing, create a branch.** Never edit while on `main`:

   ```sh
   git branch --show-current
   git switch -c content/your-change
   ```

   The first command must not print `main` after you create the branch.

2. Edit the file using the path and template from [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md).
3. Add or replace images under `public/assets/images/`.
4. Refresh the local preview and check the page at desktop and phone widths.

### Validate before committing

```sh
npm run check
npm run build
```

`npm run check` validates fields, dates, references and image paths. `npm run build` also
generates the production `dist/` output. If either command fails, fix the reported file and line
before continuing.

### Commit and push the branch

```sh
git branch --show-current
git add <changed-files>
git commit -m "content: update Haoyun Liu profile"
git push -u origin HEAD
```

The branch name must not be `main`. If you accidentally committed while on `main` and have not
pushed, follow the recovery steps in [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md#if-you-accidentally-commit-to-main).

Then open a pull request against `main`. A short commit message such as
`content: add November seminar` or `fix: correct gallery cover path` is enough.

## 5. Where to edit what

| I want to… | Edit | Template | Appears on |
| --- | --- | --- | --- |
| Add or update a member | `src/content/members/<slug>.md` | [Member profile](PAGE_TEMPLATES.md#member-profile) | People and `/<slug>/` |
| Add a research project | `src/content/research/<slug>.md` | [Research project](PAGE_TEMPLATES.md#research-project) | Research and homepage |
| Add a publication | `src/data/publications.json` | [Publication](PAGE_TEMPLATES.md#publication) | Publications and possibly homepage |
| Add news | `src/data/news.json` | [News item](PAGE_TEMPLATES.md#news-item) | News archive and homepage |
| Add a seminar, talk or lecture | `src/data/activities.json` | [Activity](PAGE_TEMPLATES.md#activity) | Activities and homepage |
| Add a gallery album | `src/data/albums.json` | [Gallery album](PAGE_TEMPLATES.md#gallery-album) | Gallery and homepage preview |
| Update former members | `src/data/alumni.json` | [Alumni](PAGE_TEMPLATES.md#alumni) | Alumni and People |
| Change openings | `src/content/openings/positions.md` | [Openings](PAGE_TEMPLATES.md#openings) | Openings |
| Change homepage hero or limits | `src/data/settings.json` | [Homepage settings](PAGE_TEMPLATES.md#homepage-settings) | Homepage |

## 6. Images

- Put originals under `public/assets/images/`, not in `dist/` and not in `public/media/`.
- Use the existing folders: `profile_photo/`, `group_photo/`, `logo/`, `research_photo/` and
  `activity_photo/<album-slug>/`.
- Reference images with a root-relative path, for example
  `/assets/images/profile_photo/example.jpg`.
- Every image needs alt text. Describe the content, not “image” or “photo”.
- Confirm permission before publishing portraits, event photographs or student names.
- Do not commit generated `public/media/` files. `npm run dev` and `npm run build` recreate them.

## 7. Submit for review

A pull request should contain one logical change. Fill in:

- What changed and why.
- Which page or content record is affected.
- Confirmation that `npm run check` and `npm run build` pass.
- Confirmation that names, dates, claims and photo permissions are approved.
- A screenshot or preview note for visual changes.

The editor or maintainer reviews the pull request. The PI approves claims about people, roles,
publications and positions. **Only the maintainer merges to `main`.** Contributors must not click
**Merge pull request**, even after approval. See [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md) for the
full review and merge rules.

## 8. Common errors

| Message or symptom | Likely cause | Fix |
| --- | --- | --- |
| `local image is missing at public...` | Wrong path or file not uploaded | Put the file under `public/assets/images/` and match the path exactly |
| `must be a local image path under /assets/images/` | Missing leading `/` or wrong folder | Use `/assets/images/...` |
| `must be a real calendar date` | Invalid or partial date | Use a real `YYYY-MM-DD` date |
| `unknown field` | Typo or unsupported field | Remove the field or check `CONTENT_GUIDE.md` |
| `unknown album slug` | Album does not exist | Create the album or fix the slug |
| `duplicate slug` | Two records use the same slug | Choose a unique lowercase slug |
| `materials are required unless the role is closed` | Openings role missing materials | Add `materials` or set `status: closed` |
| `No generated media found` | Media manifest is stale | Run `npm run media` or restart `npm run dev` |

## 9. After merge and deployment

After a pull request is merged:

1. The maintainer or automated deployment publishes the site.
2. Open the live page and check the change at desktop and phone widths.
3. Check that images, links and the CV download work.
4. If something is wrong, report it immediately; do not edit the live site directly.

Deployment details are in [DEPLOYMENT.md](DEPLOYMENT.md) and
[STATIC_HOST_DEPLOYMENT.md](STATIC_HOST_DEPLOYMENT.md).

## 10. Getting help

- Content structure and fields: [CONTENT_GUIDE.md](CONTENT_GUIDE.md).
- Copyable examples: [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md).
- Git branches, pull requests and review: [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md).
- Broken build or deployment: contact the site maintainer.
- Claims about people, roles, publications or positions: ask the PI or editor.
