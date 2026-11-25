# Ye Group website roadmap (2026–2027)

- **Owner:** Site maintainer
- **Approver:** Principal Investigator
- **Last reviewed:** 2026-11-21
- **Next review:** 2027-02-28
- **Status:** Draft for group review
- **Horizon:** December 2026 – November 2027

Status legend: **Now** (in progress), **Next** (next quarter), **Later** (future), **Won't**
(deliberately out of scope).

## 1. Why this roadmap exists

The website is now a maintained Astro static site rather than a WordPress prototype. It has
validated content, responsive images, activities and gallery albums, but it still lacks a single
statement of priorities, ownership, operational targets and content cadence. Production launch has
not happened yet.

This roadmap exists to:

- make launch readiness explicit and finish it in a controlled way;
- move the primary deployment to cloud object storage + CDN while retaining the lab server as a
  preview and fallback path;
- keep content current after launch;
- assign owners and review dates instead of relying on ad hoc updates.

## 2. Scope and non-goals

### In scope

- Content depth and editorial workflow.
- Front-end features and accessibility.
- Cloud hosting, automated deployment, backups, monitoring and security.
- Design consistency and documentation.

### Non-goals (for this roadmap)

- A CMS or headless back office.
- User accounts, comments or member-only areas.
- E-commerce or payment flows.
- Multilingual publishing.
- Site-wide search.
- Custom dashboards or enterprise SRE processes.
- Heavy client-side JavaScript or a front-end framework.

These are not permanent rejections. Revisiting one requires a recorded decision here with the
problem it solves and the maintenance cost it adds.

## 3. Current baseline (2026-11-21)

- Astro 6 static build, deployed as plain `dist/`; no runtime server is required in production.
- The 2026-11-21 baseline build produces 27 pages: Home, Research, People and member profiles,
  Publications, Activities and detail pages, News and detail pages, Gallery and album pages,
  Alumni, Openings, Contact and 404.
- Content is split between Astro collections (members, research, openings) and validated JSON
  files (publications, alumni, albums, news, activities, settings).
- Existing strengths: strict content validation, responsive WebP pipeline, draft/published gating,
  canonical/Open Graph metadata, sitemap, robots and a real 404 page.
- Existing constraints: no CI, no automated deploy, no uptime/TLS monitoring, no analytics, no
  backup retention policy, and no dependency-update automation.
- Production has not been switched from WordPress.com yet.
- `src/data/news.json` no longer contains an editorial preview; the former preview was approved
  and published on 2026-11-25.
- Content is still thin: the site has few news items, activities and albums. The roadmap should
  improve cadence rather than inflate the archive with unverified material.

Counts in this section are a dated snapshot. Do not treat them as permanent targets.

## 4. Workstreams and owners

| Workstream | Owner | Success signal |
| --- | --- | --- |
| Content / Editorial | PI + editor | Approved, current content on a predictable cadence |
| Features / UX | Site maintainer | Small, accessible improvements with clear payback |
| Deployment / Operations | Site maintainer; PI for accounts and approvals | Repeatable deploys, tested rollback, monitored site |
| Design / Accessibility | Maintainer + group reviewer | Consistent visual system and accessible pages |

Each roadmap item belongs to one primary workstream. Cross-team dependencies are listed in the
quarter tables.

## 5. Quarterly roadmap

### Q1 — Launch readiness and cloud migration (December 2026 – February 2027)

This is the gate quarter. Do not start large feature work until the production site is live and
rollback has been exercised.

| Deliverable | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- |
| Resolve the news editorial preview | PI + editor | Editorial decision | No unapproved preview is published |
| Add CI for install, validate and build | Maintainer | Repository access | PR and `main` builds run automatically |
| Provision OSS/COS bucket, CDN and TLS on a staging hostname | Maintainer + PI | Cloud account, ICP/domain ownership confirmed | Staging site passes the checklist in `STATIC_HOST_DEPLOYMENT.md` |
| Complete one manual cloud release and redirect checks | Maintainer | Staging resources | 404, nested routes, media/CV redirects and HTTPS verified |
| Switch the official domain/CNAME | School IT + PI | Staging acceptance and approval | `https://yegroup.cuhk.edu.cn` serves the new site |
| Keep the lab server as preview/fallback | Maintainer | Existing `DEPLOYMENT.md` flow | Fallback can be served without changing content |
| Add uptime and TLS-expiry monitoring | Maintainer | Production hostname | Alerts reach a named owner |
| Add privacy-friendly analytics if approved | PI + maintainer | Privacy decision | No personal data or third-party tracking beyond approval |
| Clean placeholder portrait filenames and align README/deployment docs | Maintainer | Content owner confirmation | No `tempimage*` names remain in published paths |
| Rehearse one rollback | Maintainer | Production release | Previous version restored and re-checked |

**Exit criteria:** the official HTTPS domain serves every page, 404 and legacy redirects are
correct, one rollback has been rehearsed, and CI is green.

### Q2 — Reliability and content depth (March – May 2027)

| Deliverable | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- |
| Automated deploy on `main` with CDN purge and failed-build protection | Maintainer | Q1 CI and cloud credentials | A normal content update ships without manual server work |
| Backup and restore policy: bucket versioning, release snapshots, restore drill | Maintainer + PI | Cloud account ownership | A restore drill passes and is recorded |
| Content cadence: at least 3 news posts, 2 activities and 2 albums in the quarter | PI + editor | Editorial pipeline | All published items are approved and dated |
| Dependency-update bot and Node/Astro upgrade policy | Maintainer | CI | Monthly grouped updates, no unreviewed major upgrades |
| Non-blocking CI checks for HTML, broken links, accessibility and Lighthouse | Maintainer | CI | Checks report regressions without blocking urgent fixes |

**Exit criteria:** a content update can ship without manual server work, and a restore drill has
passed.

### Q3 — UX and accessibility (June – August 2027)

| Deliverable | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- |
| Gallery lightbox with keyboard and touch support | Maintainer | Q2 stable deploy | Open, close, next/previous and Escape work without a mouse |
| Cross-links between activities, albums, news and publications | Editor + maintainer | Content model review | Related content is discoverable from detail pages |
| Document the alumni update workflow | Editor | Content guide | A former member can be added or updated without template changes |
| Publication citation/export improvement (e.g. BibTeX) | Maintainer | Publication data review | Export matches the displayed record |
| Accessibility fixes and performance budgets | Maintainer + reviewer | Q2 CI checks | Key pages meet agreed Lighthouse/accessibility targets |

**Exit criteria:** accessibility review passed and performance targets met on Home, People and
Gallery.

### Q4 — Consolidation and annual review (September – November 2027)

| Deliverable | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- |
| Annual audit of members, publications, alumni, openings and external links | PI + editor | Content owners available | Every record is confirmed or archived |
| Photo permission and privacy review | PI + editor | Consent records | Published portraits and event photos have permission |
| Security and credential review | Maintainer + PI | Account inventory | 2FA, least privilege and secret rotation confirmed |
| Cloud cost review | PI + maintainer | Billing access | Cost and renewal dates recorded |
| Add RSS only if news cadence was sustained | Maintainer | Q2–Q3 content volume | Feed is generated from published news only |
| Retrospective and next-year roadmap | Group | Metrics and feedback | Dated next-year plan approved |

**Exit criteria:** reviewed content, documented owners for renewals, and a dated next-year plan.

## 6. Content governance

### Cadence

- News: monthly or event-driven.
- Activities and albums: within two weeks of an event.
- Publications: reviewed quarterly.
- Member profiles: updated at the start of each term and when roles change.
- Openings: reviewed twice a year and whenever a position opens or closes.
- Alumni: updated when a former member's destination or role is confirmed.

### Roles

- **PI:** approves claims, voice and public representation of the group.
- **Editor:** owns copy, image permissions, alt text and publication status.
- **Maintainer:** owns build, deployment, backups and technical validation.
- **Students and group members:** submit changes through pull requests or a clearly named editor.

### Review checklist

Extend the existing checklist in [CONTENT_GUIDE.md](CONTENT_GUIDE.md) with:

- editorial-preview status resolved before launch;
- alt text for every image;
- photo permission and privacy for portraits and event photos;
- external links checked;
- unpublished or unapproved results excluded;
- dates, names and affiliations confirmed.

## 7. Operational reliability

- CI is required for merges; production deploys only from `main`.
- Automated deploy must fail closed: a failed build or CDN purge must not replace a known-good
  release.
- Backups: bucket versioning, release snapshots, 90-day retention and an annual archive.
- Monitoring: uptime, TLS expiry, CDN error rate and broken links.
- Renewal calendar: domain, TLS certificate, cloud account, ICP/filing and WordPress retention.
- Monthly dependency and security review; least-privilege credentials and 2FA.
- Keep a short incident/rollback runbook and record each rollback drill.

Commands and platform-specific steps stay in [DEPLOYMENT.md](DEPLOYMENT.md) and
[STATIC_HOST_DEPLOYMENT.md](STATIC_HOST_DEPLOYMENT.md). This roadmap only records ownership,
targets and acceptance.

## 8. Feature roadmap

| Status | Item | Why |
| --- | --- | --- |
| Now | Editorial cleanup, CI, cloud migration, monitoring | Launch and reliability |
| Next | Gallery lightbox, cross-links, alumni update flow, citation export | Highest user value for low maintenance |
| Later | RSS, richer publication filtering | Useful only after content volume grows |
| Won't | CMS, accounts/comments, multilingual, site-wide search, heavy JS, social automation | High maintenance or no demonstrated need |

## 9. Metrics and review cadence

| Metric | Target or signal |
| --- | --- |
| Uptime | Monthly availability reviewed; incidents recorded |
| TLS expiry | At least 30 days remaining at every monthly check |
| Lighthouse / accessibility | Agreed baseline on Home, People and Gallery |
| Broken links | Zero known broken internal links at each release |
| Deploy lead time | Content update to production within one working day |
| Content freshness | News, activities and albums meet the quarterly cadence |
| Backup restore | At least one successful restore drill per year |

Review cadence:

- Monthly: maintainer checks uptime, TLS, backups, dependencies and open issues.
- Quarterly: group reviews progress, adjusts priorities and updates dates.
- Annually: full roadmap reset, content audit and ownership refresh.

Delayed items keep their original date visible and receive a new date; do not silently delete them.

## 10. Risks and mitigations

| Risk | Mitigation | Trigger |
| --- | --- | --- |
| Bus factor | Document owners, deploy steps and rollback; keep the build reproducible | Maintainer unavailable |
| Cloud account, ICP or DNS ownership | Use a school-managed account where possible; record account and DNS owners | Renewal or incident |
| Cost drift | Quarterly cost review and a budget threshold | Unexpected bill or usage spike |
| Content stagnation | Named editor, cadence targets and quarterly review | Two quarters without updates |
| Photo consent and privacy | Permission checklist before publishing people or events | New portrait or event album |
| Dependency breakage | Update bot, CI and tested rollback | Failed build or security advisory |
| Platform lock-in | Keep `dist/` portable; retain the lab-server fallback | Cloud outage or migration decision |
| Documentation drift | Source-of-truth table below; update docs at the point of change | Conflicting instructions |

## 11. Documentation map

| Document | Owns |
| --- | --- |
| `docs/ROADMAP.md` | Priorities, sequence, owners, acceptance, metrics |
| [AGENTS.md](../AGENTS.md) | AI-agent permissions, hard boundaries and definition of done |
| [EDITOR_TUTORIAL.md](EDITOR_TUTORIAL.md) | Step-by-step editing and local preview workflow |
| [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md) | Copyable templates for each content/page type |
| [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md) | Branches, pull requests, review, releases and rollback |
| [CONTENT_GUIDE.md](CONTENT_GUIDE.md) | Content fields, editorial checklist, image rules |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Lab-server/Nginx fallback and rollback |
| [STATIC_HOST_DEPLOYMENT.md](STATIC_HOST_DEPLOYMENT.md) | Cloud bucket/CDN setup and Actions template |
| [README.md](../README.md) | Entry points and local development |

## 12. Open decisions

- Aliyun OSS vs Tencent COS vs a school-managed static hosting platform.
- ICP/filing status, cloud account owner and billing owner.
- Domain, DNS and TLS ownership, including who approves CNAME changes.
- WordPress.com retention period after cutover.
- Whether to use privacy-friendly analytics, and which provider.

Record each decision with a date, owner and consequence. Do not leave account ownership implicit.

## 13. Change log

| Date | Change | Owner |
| --- | --- | --- |
| 2026-11-21 | Initial draft created | Site maintainer |
