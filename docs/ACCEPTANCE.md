# Independent acceptance record

Date: 12 November 2026 (Asia/Shanghai). Developer: actual DeepSeek provider via an isolated Codex CLI worker. Reviewer: GPT/Codex supervisor. Scope: local reconstruction only.

**Decision: local implementation accepted after source review and automated checks; full browser and production release acceptance remain incomplete.**

## Follow-up: Solar pp news preview

A user-requested local sample was added on 12 November 2026. It is visible in Home / Latest news,
the News archive and `/news/xenonnt-solar-pp-preview/`. The category “Preview template · Research”
and the final paragraph identify it as a sample, not an approved group announcement. Its date is
31 August 2026, from the [official collaboration release](https://xenonexperiment.org/xenonnt-first-measurement-of-low-energy-solar-neutrinos-scattering-off-electrons/);
the detail page links to [arXiv:2608.29450](https://arxiv.org/abs/2608.29450).

The one-file DeepSeek patch was reviewed and checked before application. The updated build
produces 22 HTML pages and passes 856 static assertions. Home, archive and detail each returned
HTTP 200 with the sample on the already-running local development server. Chrome accessibility
inspection verified the homepage entry and clicked through to the correct detail page, including
its body, preview label and paper link. Screenshot/complete responsive acceptance remains limited
as described below. See `qa/results/news-preview.json` for this follow-up's provenance and checks.
Set the sample to `draft` or remove it before production deployment unless the group approves it.

The counts and empty-News observations below record the initial reconstruction before this sample.

## Delivered

Astro 6 generates 21 static HTML pages. The site retains 9 current members and profile routes, 7 alumni, 15 publications, the PI CV and all original media. Seven primary navigation sections are implemented. Gallery contains two verified group-photo albums. News supports published/draft records, automatic detail pages, archive, homepage limit and sitemap inclusion; its initial dataset is empty because no verified announcement was supplied. Five explicitly configured representative papers are provisional pending group confirmation.

## Independent checks

| Check | Result | Evidence and limits |
| --- | --- | --- |
| Full source and patch review | Pass | Reviewed components, pages, schemas, validators, data, styling, client script and migration documentation; exact file scope checked. |
| Fresh dependency installation | Pass | Node 22.22.0, npm 10.9.4; a clean directory installed using the regenerated portable lockfile, then built successfully. |
| Static output audit | Pass | 21 pages; 830 assertions for routes, internal links/anchors, responsive sources, alt/dimensions, metadata, baseline records, telephone URI and corrected paper titles. |
| Disposable content fixtures | Pass | 20 cases: malformed dates, duplicate IDs/slugs, orphan references, missing assets, homepage limits, partial album dates, optional alumni fields, drafts, automatic additions, empty/single album and image-name collisions. Fixtures never enter delivered content. |
| Compiled client script | Pass | 12 event-harness checks covering menu/Escape/navigation/desktop resize and publication search/year/combined-empty/reset/count behavior. This is not browser layout or keyboard acceptance. |
| Original uploads | Pass | 17 unique archived upload paths have closed local mappings in the Nginx example; all target originals exist. |
| Static HTTP | Pass | 110 final-output checks on loopback HTTP: page/resource responses, nested paths, repeat requests and unknown/source-path 404. This does not validate Nginx or browser refresh. |

Run from the project root after `npm ci` and `npm run build`:

```sh
python3 qa/audit_static.py dist
python3 qa/probe_content.py .
node qa/probe_client.mjs .
```

The content probe creates a disposable copy under the system temporary directory. It does not edit the website content. The probe links the installed project dependencies into that temporary copy and removes only its own temporary directory after testing. Results are written to `qa/results/content-fixtures.json`.

## Browser observations and unfinished acceptance

Chrome rendered the homepage and Publications page on the loopback static preview. In the first implementation, native accessibility observations verified that searching `RELICS` returned one publication, a nonmatching query showed zero results, and Clear filters restored all 15 records. Desktop and narrower layouts were observed, but exact viewport sizes were not controlled. These observations do not constitute a complete test of the final revision.

Browser automation remained unreliable after reconnecting: the browser host was unavailable; native coordinate input returned `noWindowsAvailable`, input sometimes did not take effect, and screenshots could lag the accessibility state. This remained true after the user confirmed Chrome was idle. No application failure is inferred from those control errors.

The following release checks remain open:

- Final-version Home, Research, People/profile, Publications, Openings, Gallery/album and News at 375, 768 and 1440 CSS px.
- Actual-browser combined year/search filters, mobile menu, desktop resize scroll unlock, keyboard focus/Escape, 200% zoom, JavaScript disabled, console/network review.
- Safari and mobile-device/emulation checks; direct larger-image interaction.
- Group confirmation of featured papers, current vacancies/review date, member details, captions/credits and content-maintainer ownership.
- Staging Nginx `nginx -t`, actual redirects, HTTPS, production refresh/404, deployment access and rollback verification.

## Content corrections

The supervisor cross-checked the 14 DOI records against Crossref metadata and reviewed publisher/arXiv pages. Two materially wrong titles were corrected without changing identifiers or links:

- [PRL 133, 191002](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.133.191002): “First Indication”, replacing “First Measurement”.
- [PRL 129, 161805](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.129.161805): “Electronic Recoil Data”, replacing “Electronic Recoils”.

Other source corrections and editorial decisions are listed in [IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md). Journal metadata checks do not confirm current member or vacancy information, and do not establish that every external destination is reachable from every network.

## Migration boundary

Only `dist/` is deployable. Original captures, the earlier prototype, source data and development tools remain outside that output. No live site, DNS, certificate, server configuration or production files were changed. The Nginx configuration is a reviewed example, not an installed or syntax-tested configuration.

## Delegation provenance

The second worker turn completed and exited successfully, but its wrapper classified the run as failed because four recovered network-reconnect messages were logged. The supervisor preserved that original status, independently verified that these were transport-only notices, checked completion, exit status, patch digest, exact file scope and unchanged source, reviewed the entire revision and retested before manual recovery. No runner result was relabelled or silently accepted.

Run IDs, patch digests, final source digest and recovery details are recorded in `qa/results/provenance.json`. Credentials, Codex home directories and full private runner logs are excluded from the project.
