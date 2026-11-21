# AGENTS.md

This file defines the operating boundaries for AI agents working in this repository. It applies
to coding agents, content agents and automation tools. If a task conflicts with this file, stop
and ask the human maintainer.

## 1. Project in one paragraph

This is the static website for the Neutrino & Dark Matter Group at CUHK-Shenzhen. It is built with
Astro 6, produces plain static files in `dist/`, and has no runtime server, database or user
accounts. Content lives in Markdown collections under `src/content/` and validated JSON files
under `src/data/`. Original images live under `public/assets/images/`. The site is deployed from
GitHub; `main` is protected.

## 2. Read before changing anything

Read the document that matches the task:

| Task | Read first |
| --- | --- |
| Any content edit | [docs/EDITOR_TUTORIAL.md](docs/EDITOR_TUTORIAL.md) |
| Copyable page/content templates | [docs/PAGE_TEMPLATES.md](docs/PAGE_TEMPLATES.md) |
| Field definitions and validation | [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) |
| Branches, pull requests, review | [docs/GITHUB_WORKFLOW.md](docs/GITHUB_WORKFLOW.md) |
| Lab server / Nginx deployment | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Cloud object storage + CDN | [docs/STATIC_HOST_DEPLOYMENT.md](docs/STATIC_HOST_DEPLOYMENT.md) |
| Priorities and review cadence | [docs/ROADMAP.md](docs/ROADMAP.md) |

Also inspect `git status` before editing. Preserve uncommitted human work.

## 3. Source of truth

- Content: `src/content/**/*.md` and `src/data/*.json`.
- Components and pages: `src/pages/`, `src/components/`, `src/layouts/`.
- Shared content logic and validation: `src/lib/content.ts`, `src/content.config.ts`,
  `scripts/validate-content.mjs`.
- Images: originals in `public/assets/images/`; generated derivatives in `public/media/` (ignored).
- Build output: `dist/` (ignored).
- Documentation: `docs/` and `README.md`.

Do not create a second source of truth. Do not duplicate content into templates, scripts or
deployment files.

## 4. Hard boundaries — never do these

### Governance

- Never edit, weaken or bypass this `AGENTS.md`, branch protection or security rules to make a
  task easier.
- Never change the repository's ownership, visibility, collaborators or deployment accounts
  without explicit maintainer instruction.

### Git and collaboration

- Never commit or push directly to `main`.
- Never force-push `main` or rewrite shared history.
- Never merge a pull request unless the current task explicitly instructs you to merge and you are
  acting as the maintainer. Default behaviour: create a branch, commit, push the branch, open a
  PR, then stop.
- Never approve your own pull request or bypass branch protection.
- Never delete a branch that is not yours without explicit instruction.
- Never run `git reset --hard`, `git clean -fd`, `git checkout -- .` or equivalent destructive
  commands against human work.
- Never amend, rebase or force-push a branch you do not own.

### Generated and installed files

- Never edit `dist/`, `public/media/`, `.astro/` or `node_modules/`.
- Never commit generated media or build output.
- Never delete or modify `public/assets/images/` originals without explicit instruction.

### Secrets and private data

- Never commit tokens, SSH keys, cloud AccessKeys, `.env` files or deployment credentials.
- Never print, copy or exfiltrate secrets, personal data or private research material.
- Never add student or staff personal data that is not approved for publication.
- Never upload private content to an external service or paste it into a third-party tool without
  explicit approval.
- Do not download or execute scripts, binaries or archives from untrusted sources.
- If a secret is found, stop, do not reproduce it in the response, and notify the maintainer.

### Production and infrastructure

- Never deploy, run deployment scripts, change DNS, change cloud buckets/CDN, rotate credentials or
  modify repository security settings unless the task explicitly authorizes that exact action.
- Never edit the live Nginx document root or cloud bucket directly.
- Never claim a deployment happened unless the deployment command actually ran and succeeded.
- Never change the domain, canonical URL, robots/sitemap policy or security headers without
  approval.

### Content integrity

- Never invent members, alumni, publications, dates, talks, venues, affiliations, captions,
  quotations or research results.
- Never publish unverified or unapproved content.
- Never change `status` from `draft` to `published` without explicit approval.
- Never publish an `editorial_preview` item as a normal announcement.
- Never add or remove a person, photograph or personal detail without consent and approval.
- Never weaken `scripts/validate-content.mjs` or the Astro schemas just to make content pass.

### Destructive actions

- Never delete files, pages, albums, profiles or images unless the task explicitly asks for that
  deletion.
- Never rename or move a published URL, slug or image path without updating all references,
  redirects and validation.
- Never run broad destructive shell commands (`rm -rf` on project directories, mass `find -delete`,
  database drops, bucket deletion, etc.) without explicit instruction.
- Never install global tools or change global Git configuration without permission.

## 5. Git and pull request boundary

`main` is protected. The required flow is:

```sh
git switch main
git pull --ff-only
git switch -c content/your-change
# edit and validate
git add <changed-files>
git commit -m "content: describe the change"
git push -u origin HEAD
# open a PR against main and stop
```

Rules:

- One logical change per branch and PR.
- Use the prefixes `content/`, `fix/`, `docs/` or `deploy/`.
- Commit messages are short and imperative, for example `content: add November seminar`.
- Contributors never merge. Only the maintainer merges after approval.
- If the task asks you to commit, commit only the files you changed for that task.
- If the task does not ask you to commit, do not commit or push.
- If you accidentally commit to `main`, do not push; follow the recovery section in
  [docs/GITHUB_WORKFLOW.md](docs/GITHUB_WORKFLOW.md).
- Do not claim a PR is ready until `npm run check` and `npm run build` pass.

## 6. Content boundaries

### General

- Use only supplied, verified sources.
- Keep names, roles, affiliations, dates, venues and publication metadata exact.
- Keep prose factual and concise; do not add marketing superlatives or unverified claims.
- Use plain text or Markdown content fields; never paste raw HTML into content fields.
- Keep repository content in English unless the task explicitly asks for another language.
- Respond to the human in Chinese by default; keep repo artifacts in English.

### Members and alumni

- Do not add a member without the person's approved public profile and contact details.
- Do not change an existing role, group, office, email or affiliation without confirmation.
- Do not infer pronouns or personal details. Use neutral `they/them` when unspecified.
- Do not publish a portrait or personal photograph without permission.

### Publications and research

- Use the DOI, journal, arXiv or publisher link; do not invent metadata.
- Do not add unpublished or embargoed results.
- Do not change the featured-publication selection without approval.
- Do not claim a collaboration result on behalf of the group without confirmation.

### News, activities and gallery

- Do not invent events, dates, speakers, venues, posters or captions.
- Keep drafts as `status: "draft"` until approved.
- Use real ISO dates; preserve the actual date precision for albums.
- Do not create an album from a non-photographic illustration or an event that did not happen.
- Every image needs meaningful alt text and, where relevant, permission/credit.

### Openings

- Do not promise a position, deadline, salary or application process that is not confirmed.
- Keep `last_reviewed` quoted and current.
- `materials` is required unless the role is `closed`.
- Keep internal provenance and pending approvals out of applicant-facing copy.

## 7. Image and media boundaries

- Put originals under the correct folder in `public/assets/images/`:
  `profile_photo/`, `group_photo/`, `logo/`, `research_photo/` or
  `activity_photo/<album-slug>/`.
- Reference images with root-relative paths beginning `/assets/images/`.
- Do not use remote image URLs, hotlinks or unlicensed images.
- Do not modify or replace an original image silently. Keep the original and update references.
- Run `npm run media` or `npm run build` after adding images.
- Do not commit `public/media/`; it is generated and ignored.
- Preserve the aspect ratio and crop behavior expected by the existing layouts.
- Do not add tracking pixels, third-party fonts, social embeds or external scripts without
  approval.

## 8. Code boundaries

- Keep the site static. Do not add SSR, adapters, databases, authentication, a CMS or a server
  runtime without explicit approval.
- Use Astro 6 and the existing component patterns. Do not add a UI framework or a large client-side
  dependency for a small change.
- Reuse `LocalImage.astro`, `src/lib/content.ts`, `src/lib` helpers and the existing validation
  scripts instead of duplicating logic.
- Do not change `astro.config.mjs` output mode, `trailingSlash` or route structure without
  approval.
- Do not weaken accessibility: keep alt text, heading order, focus states, keyboard access,
  reduced-motion handling and color contrast.
- Do not remove the skip link, semantic landmarks or the mobile menu behavior.
- Do not add analytics, monitoring, error tracking or consent tools without approval.
- Do not add a new top-level directory, dependency or build step without a clear need and
  maintainer approval.
- Do not change the package manager or hand-edit `package-lock.json`; use npm and the existing
  lockfile.
- Do not add large binaries, archives or unoptimized originals; use the existing image pipeline.
- Keep Node.js compatibility at `22.22.0` / `>=22.12.0` unless the task explicitly upgrades it.
- Do not edit `.github/workflows/` unless the task is specifically CI and the maintainer asked.

## 9. Validation and testing boundaries

Before claiming work is complete:

```sh
npm run check
npm run build
```

For content changes:

- Preview the affected page with `npm run dev`.
- Check the page at desktop and phone widths.
- Check image paths, alt text, internal links and the CV download.
- Check that drafts do not appear on public pages.

For structural changes:

- Check Home, People, Research, Publications, Activities, News, Gallery, Alumni, Openings and
  Contact.
- Check a nested route by direct request, not only by client-side navigation.
- Check the 404 page and sitemap/robots output.

Do not say “done”, “fixed” or “passing” unless the command actually ran and you can report its
result. If a check fails, report the failure and the exact error.

## 10. Deployment and operations boundaries

- Default: do not deploy. Deployment is a maintainer action.
- The lab-server path uses `scripts/server-deploy.sh`; the cloud path is documented in
  `docs/STATIC_HOST_DEPLOYMENT.md`. Neither is implied by an ordinary code/content task.
- Never modify DNS, CNAME, TLS certificates, CDN rules, bucket policies or WordPress settings
  without explicit authorization.
- Never put source files, `.git`, `node_modules` or credentials in a public document root.
- Never edit production HTML/CSS/content directly in Nginx or object storage.
- If asked to deploy, confirm the target (staging vs production), verify the build, record the
  commit hash, and use the documented rollback path.
- Do not disable branch protection, CI or backup jobs to make a task easier.

## 11. Scope control

Stay inside the requested task.

- Do not refactor unrelated files.
- Do not reformat whole files unless the task asks for it.
- Do not delete “unused” code or assets based only on a guess.
- Do not change content voice, layout or design outside the requested change.
- Do not mix content edits, dependency upgrades, design changes and deployment changes in one
  branch or PR.
- If a required change crosses a boundary in this file, stop and ask.

## 12. Stop and ask before

Ask the human maintainer before doing any of the following:

- Deleting or renaming files, pages, records, albums, profiles or images.
- Changing a slug, URL, domain, canonical URL, redirect, sitemap or robots policy.
- Publishing content or changing `draft` to `published`.
- Adding or removing a person, photograph, credit or personal detail.
- Adding a dependency, external service, analytics, tracking or third-party script.
- Modifying CI, branch protection, repository settings, secrets or deployment credentials.
- Editing `AGENTS.md` or any rule that defines agent permissions.
- Running a deployment, DNS change, bucket/CDN change or production command.
- Performing a large refactor or touching more than the task requires.
- Acting on ambiguous or conflicting instructions.

## 13. Definition of done

A task is done only when:

- [ ] The change is limited to the requested scope.
- [ ] Content is verified and approved; no invented facts.
- [ ] `npm run check` passes.
- [ ] `npm run build` passes.
- [ ] The affected page was previewed and checked at desktop and phone widths (for UI/content).
- [ ] Relevant docs/templates were updated if fields or behaviour changed.
- [ ] No generated files, secrets or unrelated changes are staged.
- [ ] The branch/PR flow was followed; `main` was not touched directly.
- [ ] The final report states what changed, what was verified, and what remains uncertain.

## 14. Quick decision table

| Action | Default |
| --- | --- |
| Read files, search, inspect git status | Allowed |
| Edit content in `src/content` or `src/data` | Allowed with verified facts |
| Add images to `public/assets/images` | Allowed with permission/alt text |
| Run `npm run check` / `npm run build` | Allowed and expected |
| Create a branch and commit | Only when the task asks |
| Push a branch and open a PR | Only when the task asks |
| Merge a PR | Forbidden unless explicitly instructed as maintainer |
| Push to `main` | Forbidden |
| Edit generated files | Forbidden |
| Change deployment, DNS or cloud settings | Forbidden without explicit authorization |
| Invent content or publish drafts | Forbidden |
| Delete or rename published content | Requires explicit instruction and reference updates |
| Add a dependency or external service | Requires approval |
| Weaken validation to pass a build | Forbidden |

## 15. Reporting

When finishing, report:

- What changed and why.
- Files touched.
- Commands run and their results.
- What was not verified or still needs human approval.
- Any uncommitted changes or branch/PR state.

If blocked by a boundary, state which boundary applies and what decision is needed. Do not guess.
