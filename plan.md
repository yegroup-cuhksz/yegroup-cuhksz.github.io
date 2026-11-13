# Neutrino & Dark Matter Group — Website Requirements Document

**Project:** Research Group Website  
**Institution:** The Chinese University of Hong Kong, Shenzhen (CUHK-Shenzhen)  
**Domain:** https://yegroup.cuhk.edu.cn  
**Version:** 1.3<br />
**Updated:** 2026-11-12

**Local implementation:** The Astro reconstruction is implemented. See [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md) for independently verified checks and open browser/release criteria. The checkboxes below remain release criteria, not a claim of production acceptance.

## 1. Project Overview

The website serves as the official homepage of the Neutrino & Dark Matter Group at CUHK-Shenzhen.

Its primary purposes are to:

- Introduce the research group and its scientific activities.
- Present research projects and scientific achievements.
- Showcase group members and alumni.
- Maintain an up-to-date list of publications.
- Share group news, milestones, and photographs from academic and social activities.
- Provide information for prospective students and collaborators.
- Establish a professional international academic presence.

**Target audience:** Researchers, prospective PhD students, academic collaborators, and the general public.

## 2. Website Structure

The website should contain eight main navigation sections: Home, Research, Activities, People, Publications, Gallery, Openings, and Contact. Alumni and individual member profiles are additional pages under People, rather than additional main navigation items. Preserve existing member profile URLs where possible. News appears on the homepage with a link to a dedicated archive; it does not need an additional main navigation item in the initial version.

### 2.1 Home

The homepage provides a concise introduction to the research group.

**Required content:**

- Group name: Neutrino & Dark Matter Group
- Institution: CUHK-Shenzhen
- Brief introduction to the group's research
- Hero image related to experimental particle physics
- Research highlights with links to research pages
- Selected Publications (initially five representative papers, explicitly chosen by the group)
- Latest News: recent published announcements with a link to the news archive
- A visible Activities overview with a link to the dedicated Activities page
- A compact Gallery preview with a link to the full Gallery
- Contact information in the footer

The homepage should be visually engaging but concise, avoiding excessive duplication of information from other pages.

Show the three most recent published news items by default, or all available items if fewer than three exist. Keep the display limit configurable, with at most five items on the homepage. Show dates, short titles, and brief summaries rather than full articles. Place Latest News after the opening introduction and before the longer research/publication sections so updates are easy to find. Link Gallery previews to albums instead of repeating full albums on the homepage.

The homepage order is fixed as: (1) General information — the existing hero, topic strip and introduction; (2) News; (3) Research; (4) Activities; (5) representative papers; (6) Gallery. The five representative papers retain their existing compact presentation between Activities and Gallery, with publication records and order unchanged. Gallery is the last main content section before the footer. The former standalone Join Us call-to-action band after Gallery is removed; recruitment content is unchanged and Openings remains available from the global navigation and footer.

The Activities section remains visible even when there are no published activities. In that state it shows a concise three-category overview and a working link to `/activities/` without fictional event cards. With published records it shows at most `settings.homepage.activityPreviewLimit` items, which must be an integer from 1 to 5.

**Selected versus latest publications:** Representative papers are an editorial selection, not automatically the newest five papers. Store the selection and its display order in publication data using `featured` and `featured_order`. The homepage shows this selection; the complete Publications page is sorted newest first. A separate Latest Publications homepage section is not required for the initial version. Do not duplicate the same publication records to populate different sections.

### 2.2 Research

Introduce the group's main research activities.

**Initial research areas:**

- **XENONnT:** Dark matter direct detection and rare-event searches using liquid xenon time projection chambers.
- **RELICS:** Research associated with the RELICS experiment.

Each research project should include:

- Project title
- Representative image or experiment diagram
- Short scientific introduction
- Main research goals
- Links to collaboration websites or relevant publications

The initial version may focus on the experiments, their scientific goals, and the group's research interests. A separate Group Contributions section is optional and deferred until the group has suitable, verified material to present. Do not add empty contribution sections or infer individual or group responsibilities from collaboration membership.

The structure should allow additional projects to be added in the future.

### 2.3 Activities

Provide a first-class `/activities/` page for three kinds of activity:

- **Seminar:** talks hosted by the group.
- **External Talk:** talks given outside our university or group.
- **Undergraduate Lecture:** lectures for undergraduate students on campus.

The page must work as an intentional empty state before verified records exist. It should explain
that seminars, external talks and undergraduate lectures will appear there, show a three-category
overview, and not display fictional cards or claim that an activity happened. No event, date,
speaker, venue or past talk may be invented to fill the layout.

**Activity content:**

- Required stable lowercase slug, title, category, summary and `draft`/`published` status.
- Category must be exactly `Seminar`, `External Talk` or `Undergraduate Lecture`.
- Optional real event date (`YYYY-MM-DD`), human-readable time, speaker, affiliation, host,
  venue and plain-text body split into paragraphs on blank lines.
- Optional local image with required alt text, optional absolute `http(s)` source URL with a
  label, and optional references to existing gallery albums.
- Unknown fields and unfilled optional fields must be omitted; omitted metadata must not produce
  empty headings, placeholders or `undefined`.
- Impossible or partial dates must fail validation rather than being normalized.

Published activities are sorted by known event date descending, with unknown dates last and a
stable tie-breaker. `published` is an editorial visibility state, not evidence that an event has
already taken place. Drafts must not appear on the homepage, Activities index, detail routes or
sitemap.

Each published activity receives `/activities/<slug>/`, showing its category, title, summary,
known metadata, escaped plain paragraphs, optional image, source link and related albums. Reading
and navigation must work without JavaScript. Adding a record through the content data alone must
update the homepage preview, Activities index, detail route and sitemap without a template edit.

### 2.4 People

Introduce current group members and alumni.

**Member categories:**

- Principal Investigator
- Postdoctoral Researchers
- PhD Students
- Undergraduate / BSc Students
- Research Assistants / Visiting Students, when applicable
- Administrative / Support Staff

Alumni are former members, rather than a current academic position. Keep their former role, period in the group, and subsequent destination where this information is available.

Each current member record must contain a name, role, and stable URL slug. Profiles should include the following information when supplied or already available on the original site:

- Name
- Academic position
- Portrait
- Education and a short biography
- Research interests
- Email address (optional)
- Office (optional)
- Personal website / Google Scholar / ORCID (optional)
- CV link, particularly for the PI (when provided)

Display current members as a responsive grid of profile cards, with alumni on a separate linked page. Retain independent member profile pages and existing education, biography, and CV content. Do not discard a member because their role does not fit a predefined category. Missing optional information should be omitted; a missing portrait may use an accessible neutral fallback.

### 2.5 Publications

Present the group's academic publications.

**Required content:**

- Publication title
- Authors
- Journal / Conference
- Publication year
- DOI / arXiv / Journal links, as available
- Stable record ID
- `featured` and optional `featured_order` for the curated homepage selection

**Organization:**

- Sort by publication year, newest first.
- Use a publication date or explicit secondary order when several papers share the same year.
- Highlight selected or representative publications using the same curated records as the homepage.
- Provide a consistent citation format.
- Support easy addition of future publications.

The initial homepage selection contains five group-approved papers. Record the selections explicitly rather than taking the first five items in the complete list. Preserve scientific notation, author information, and available publication links.

A lightweight year filter may be added if the list becomes long.

### 2.6 Openings

Provide information for prospective students and researchers.

**Required content:**

- Brief introduction to research opportunities
- PhD student and postdoctoral recruitment information, in separate sections
- General applicant expectations
- Application instructions and required materials for each role
- Contact information
- Link to official university admissions information
- Recruitment status and last-reviewed date

Preserve the role-specific application materials and email subject instructions from the verified source. Clearly distinguish PhD admission from postdoctoral employment. Do not imply that master's, undergraduate, RA, or visiting positions are available unless explicitly confirmed by the group.

Avoid displaying outdated positions. Store an explicit status such as open, closed, or general inquiry, plus `last_reviewed` and any confirmed deadline. The group should designate a maintainer to review recruitment information before launch and whenever availability changes. If no specific position is available, retain a general invitation for academic inquiries without suggesting that a funded vacancy exists. Resolve any contradictory recruitment statements across personal profiles and the Openings page before launch.

### 2.7 Contact

Provide the group's institutional contact information.

**Required content:**

- Group name and institution
- Campus location
- Office address
- Contact email
- Official university website link

An embedded map is optional.

### 2.8 Gallery

Provide a dedicated `/gallery/` page for photographs from conferences, workshops, group gatherings, and casual outings. Organize photos into activity-based albums, with a simple cover grid linking to an album page such as `/gallery/<album-slug>/`.

**Album content:**

- Stable slug, activity title, and cover photo
- Activity category: Conference, Workshop, Group Life, or Outing
- Date and location when known; preserve the known date precision rather than inventing a day
- A short description when useful
- Ordered photos with meaningful alt text, optional captions, and photographer/credit information when available

Start with verified existing group photographs and any additional materials supplied by the group. Albums need not exist for every category at launch. Categories without content should not appear as empty sections. Outings mentioned as being planned are future possibilities, not completed activities to populate with invented dates or photos.

The initial version uses a responsive image grid, thumbnails, and links to larger local images. A lightbox is optional; if included, it must support keyboard operation, Escape to close, visible controls, and correct focus restoration. Viewing photos must remain possible without JavaScript. Category/year filtering and advanced slideshow features are not required for the initial version.

### 2.9 News

Include a required homepage Latest News module and a dedicated `/news/` archive containing all published items, sorted newest first. Short announcements can be read in the archive and link directly to the relevant paper, member, album, or external source; individual article pages are optional for longer stories.

**Initial news topics:**

- New publications and research results
- Conferences and workshops
- Student graduation and thesis defenses
- Awards and honors
- Other confirmed group milestones and activities

**News content:**

- Stable slug, title, confirmed announcement date, category, and short summary
- Publication state: draft or published
- Optional image, longer body, related publication/member/album references, and source links
- A separate event date when needed to distinguish when an event happened from when the announcement was published

Use concise, factual announcements supplied or checked by the group. Link publication news to the canonical publication record rather than maintaining a second citation. News about an event and its photo album may link to one another. News should communicate the update and its context; the Selected Publications section remains the curated representative-paper list.

Drafts must not appear in public pages or the homepage feed. There is no minimum number of news items required to launch. If there are no published items, hide the homepage news module and show a concise empty state on the archive. Do not invent milestones or dates to fill the layout. A designated content maintainer should add updates as they become available; automatic collection from external feeds is not required.

## 3. Visual Design Requirements

**Style:** Modern, minimal, professional academic website.

Design principles:

- Clean layout with generous whitespace.
- White or light-neutral background.
- Dark typography with restrained accent colors.
- Consistent navigation and footer across all pages.
- High-quality scientific images.
- Responsive design for desktop, tablet, and mobile.
- Clear typography and visual hierarchy.
- Avoid unnecessary animations, decorative elements, and repetitive sections.

Make the full group name and institutional affiliation easy to identify on the homepage. A compact header wordmark may coexist with the full name in the homepage introduction; avoid repeating identical long text in adjacent sections.

## 4. Content Management

The website should allow straightforward updates without extensive programming knowledge.

Frequently updated content includes:

- Group members
- Publications
- Research projects
- Recruitment announcements
- News and milestone announcements
- Seminars, external talks and undergraduate lectures
- Gallery albums, photos, and captions

Prefer structured content files such as Markdown, YAML, or JSON rather than hardcoding all information into individual pages.

Use Astro build-time content collections or equivalent structured data with field validation. Store longer biographies and research descriptions in Markdown, with metadata in frontmatter or structured files. Shared layouts and components should generate the navigation, footer, member cards, and publication entries.

Minimum content fields should cover:

- **Members:** stable slug, name, role, current/alumni status, optional portrait, education, biography, contact details, CV, and alumni history.
- **Publications:** stable ID, title, authors, venue, year, available DOI/arXiv/journal URLs, and homepage selection/order.
- **Research:** stable slug, title, image, scientific introduction, goals, and relevant links. Group contributions remain optional.
- **Openings:** role, recruitment status, application instructions/materials, contact, last-reviewed date, and optional deadline.
- **Gallery albums:** stable slug, title, category, optional activity date/location/description, cover photo, and an ordered photo list containing local image paths, alt text, and optional captions/credits.
- **News:** stable slug, title, announcement date, category, summary, draft/published state, optional event date/image/body, and optional references to publication, member, or album records.
- **Activities:** stable slug, title, category, summary, draft/published state, optional event date/time/speaker/affiliation/host/venue, plain-text body, optional local image with alt text, optional source URL/label and optional related-album references.

Adding a member, publication, research project, news item, activity, or gallery album must not require editing page templates. Counts, lists, and menus derived from content must update automatically. A single news record must populate both the archive and the homepage preview when eligible; a single published activity record must populate the Activities index, homepage preview, detail route and sitemap; a single album record must populate its album page, Gallery cover grid, and any homepage preview. Validate referenced records and image paths. Document the edit, local preview, build, and deployment steps for the maintainer.

## 5. Technical Requirements

- **Framework:** Astro
- **Frontend:** HTML, CSS, minimal JavaScript
- **Hosting:** Research group's Linux server
- **Web server:** Nginx
- **Domain:** yegroup.cuhk.edu.cn
- **HTTPS:** Required
- **Version control:** Git
- **Development:** Local development on macOS using Codex / VS Code

The final website should be statically generated and should not require WordPress, PHP, or a database.

Astro is the development and build tool; HTML is part of the output served to visitors. Build locally or in a documented build environment and deploy the generated `dist/` files to Nginx. The production server must not require a running Astro or Node.js application. Record the supported Node.js version, package manager, and lockfile so the build can be reproduced.

The existing Python-generated HTML site is a local prototype and content migration source. Reuse its verified content and suitable visual assets when implementing the Astro version; it does not yet satisfy the Astro build requirement.

Additional requirements:

- Mobile-friendly responsive layout.
- Basic search engine optimization (SEO).
- Accessible navigation and semantic HTML.
- Optimized images and fast page loading.
- Easy deployment and maintenance.
- Preservation or appropriate redirection of important existing website URLs.

## 6. Content Sources

Use the following sources for the initial reconstruction:

1. **Existing official website:** https://yegroup.cuhk.edu.cn — primary reference for existing research, people, publications, and institutional information.
2. **Research group-provided materials:** photographs, member profiles, publication lists, scientific figures, and updated descriptions. Confirmed updates take precedence over older source content.
3. **Local source archive:** the captured original pages and media may be used to check migration completeness and preserve existing links and files.

All scientific facts, member information, and publication details should be verified before publication. Do not invent missing information.

## 7. Initial Deliverables

The first version should include:

- [ ] Responsive homepage
- [ ] Research page
- [ ] Activities index, homepage Activities module, and published activity detail pages
- [ ] People and Alumni page
- [ ] Independent member profile pages and preserved PI CV
- [ ] Publications page
- [ ] Gallery index, activity-based albums, and a compact homepage preview
- [ ] Homepage Latest News module and News archive with draft/published content handling
- [ ] Openings page
- [ ] Contact page
- [ ] Shared header, navigation, and footer
- [ ] Structured content management
- [ ] Basic SEO and accessibility
- [ ] Production build suitable for Nginx deployment
- [ ] Documented content update workflow
- [ ] Browser-based acceptance results and any unresolved issues
- [ ] Old-to-new URL inventory and redirect plan
- [ ] Deployment, backup, and rollback instructions

## 8. Project Priorities

**Phase 1 — Core Website**

Implement the Astro site structure, shared components, and validated content models, including Activities, Gallery and News; establish a consistent visual design and populate essential content. Reuse the existing local migration data where appropriate.

**Phase 2 — Content Refinement**

Update scientific descriptions, confirm the five representative papers, verify publication records, complete member profiles, resolve recruitment inconsistencies, organize verified photos into albums, add available confirmed news and activity records, and optimize images. A separate account of group contributions is not required for this phase. Planned activities and missing news content do not justify invented entries or hold up launch of the supported content structures.

**Phase 3 — Deployment**

Complete the acceptance and migration checklists below, then deploy the static website to the research group's Linux server, configure HTTPS, and coordinate any required official domain transition with university IT.

**Out of scope for the initial version:** User accounts, databases, comment systems, online editing dashboards, visitor photo uploads, automatic news feeds, complex animations, and other unnecessary backend features.

## 9. Acceptance Checklist

These are release criteria, not a record of work already completed. Record the tested version, browser, viewport, and result. Any outstanding item must be resolved or explicitly documented before launch.

### 9.1 Content and maintenance

- [ ] All eight main navigation sections (Home, Research, Activities, People, Publications, Gallery, Openings and Contact), Alumni, the News archive, and retained individual member pages are present and reachable through navigation or contextual links. Gallery albums are reachable from their cover cards.
- [ ] Compare the migration against the captured baseline: 9 current members, 9 personal profiles, 7 alumni, 15 publications, and the original homepage images/CV. Account for existing imagery when organizing Gallery and News; not every image is an activity photograph. Document confirmed additions, removals, or corrections rather than treating baseline counts as permanent requirements.
- [ ] The homepage shows the five explicitly approved representative papers in the configured order; the full list sorts newest first.
- [ ] Scientific text, publication metadata, member details, image captions, and image attribution/permission are checked against reliable sources or group-confirmed updates.
- [ ] Recruitment status, application materials, and instructions are consistent across pages and have a recorded review date.
- [ ] Adding a temporary member/publication/project/news/activity/album record through the documented content workflow updates the appropriate pages without changing a template; remove temporary records after verification.
- [ ] The homepage shows only the configured number of recent published news items, newest first; the archive includes all published items. Drafts stay unpublished, dates are accurate, and related content links resolve.
- [ ] The homepage order matches General information, News, Research, Activities, representative papers, Gallery; Gallery is the last main content section before the footer and the former standalone Join Us band is absent.
- [ ] The Activities section remains visible and links to `/activities/` when there are no published records, showing the three-category overview without fictional cards. With published records it shows no more than the configured limit.
- [ ] A published activity record alone populates the homepage preview, `/activities/`, its `/activities/<slug>/` detail route and `sitemap.xml`; drafts appear in none of them. Empty pages do not claim that activities took place.
- [ ] Activity validation rejects invalid event dates, invalid categories/statuses, duplicate slugs, unknown fields, broken album references, missing local images and unpaired optional metadata without producing empty headings or placeholders.
- [ ] News and Gallery behave sensibly with zero or one entry: no fabricated entries, broken grids, empty category sections, or misleading dates. Planned outings are not presented as completed events.
- [ ] Album covers, photo order, captions, and credits match the content records. Full-size image links work, and homepage previews lead to the correct album.
- [ ] Missing required fields or duplicate slugs/IDs produce a clear validation failure. Missing optional fields do not produce empty headings, broken images, or placeholder text.

### 9.2 Layout, navigation, and browser behavior

- [ ] Inspect representative pages at 375 px mobile, 768 px tablet, and 1440 px desktop viewport widths. Include Home, Activities, a published activity detail page, People, an individual profile, Publications, Research, Openings, Gallery, an album, and the News archive.
- [ ] No unintended horizontal scrolling, clipped text, overlapping controls, or cropped faces in important portraits; all eight header links and the footer remain usable at intermediate widths, and the mobile menu keeps its existing JavaScript behavior and breakpoint.
- [ ] Check the mobile menu and any implemented search/year filters in actual browsers, including a combined filter, no-results state, reset, and result count. DOM simulations alone do not complete this item.
- [ ] Check desktop Safari and Chrome, plus at least one mobile browser or browser device emulation; record whether mobile verification used a physical device or emulation.
- [ ] Keyboard users can reach and operate navigation and controls, see focus, and close an open mobile menu with Escape.
- [ ] If a gallery lightbox is implemented, verify open/close, previous/next where offered, keyboard operation, Escape, and focus restoration in an actual browser; otherwise verify direct access to larger images.
- [ ] Each page has one meaningful H1 and a logical heading order; images have appropriate alt text and form controls have labels.
- [ ] Text remains readable and controls usable with 200% browser zoom; text and interactive elements have adequate contrast.
- [ ] With JavaScript disabled, core content and navigation remain available; optional interactive enhancements may be unavailable.

### 9.3 Build, links, and delivery

- [ ] A fresh checkout installs dependencies using the documented Node.js/package-manager versions and lockfile, and `npm run build` (or the documented equivalent) succeeds.
- [ ] Serve the generated `dist/` through a static HTTP server and verify direct visits and refreshes on nested URLs. Do not rely solely on the development server or `file://` previews.
- [ ] Check internal links, fragment anchors, image/CSS/JavaScript paths, and the CV download; verify external publication and institutional links.
- [ ] Browser console and network inspection show no uncaught application errors, missing required assets, or mixed HTTP/HTTPS content.
- [ ] Use appropriately sized/compressed images, explicit image dimensions or aspect ratios, and lazy loading for below-the-fold images. The main hero image loads promptly and is not lazy-loaded.
- [ ] Each page has an appropriate title and description; production canonical URLs, sitemap, and robots settings match the official domain. Private preview URLs are not used as production canonicals.
- [ ] Unknown paths return a useful 404 page with an actual HTTP 404 status. Source archives and development files are excluded from deployment.

## 10. Migration and Deployment Checklist

### 10.1 Prepare and map existing URLs

- [ ] Archive the original public pages, media, CV, and source URL inventory before changing the live site.
- [ ] Record all important old URLs and their new destinations, including `/research/`, `/people/`, `/publication/`, `/opening/`, `/contact/`, individual profiles, and linked media/CV files.
- [ ] Document the new `/gallery/`, album, `/news/`, `/activities/` and published activity detail routes and include their public pages in navigation/contextual links and the sitemap. No legacy redirects are needed for routes that did not previously exist.
- [ ] Explicitly map the WordPress query URLs `/?page_id=92` (Home) and `/?page_id=109` (Alumni). Query parameters require explicit redirect handling; a matching `/` path alone is insufficient.
- [ ] Preserve existing clean URLs where possible. For changed URLs, document and test permanent redirects to the correct corresponding page, with no loops or unnecessary chains.
- [ ] List redirects involving `yegroup-cuhksz.org` separately and confirm who controls that domain/hosting before making commitments about its redirects.

### 10.2 Prepare the release

- [ ] Confirm the Linux hosting location, Nginx document root, deployment access, and who manages the official domain and TLS certificate.
- [ ] Place only the generated static output in a versioned release directory. Keep `reference/`, source data, scripts, and development configuration outside the public document root.
- [ ] Prepare and review Nginx configuration for clean directory URLs, the 404 page, required redirects (including WordPress query URLs), and HTTPS.
- [ ] Validate Nginx configuration before applying it. Document the release switch and how to restore the previous release/configuration.
- [ ] Preview the release through a suitable test URL or environment and complete Section 9 before switching the official site.

### 10.3 Switch, verify, and retain a rollback path

- [ ] Back up the current live site/configuration and record the release identifier before switching.
- [ ] Coordinate the production cutover with the group and university IT where required; change DNS only if the hosting transition requires it.
- [ ] Verify the HTTPS certificate and HTTP-to-HTTPS behavior on the official domain, then revisit the main pages, nested profiles, Gallery/album, News and Activities/detail routes, images, CV, 404 page, and representative old URLs.
- [ ] Confirm production indexing settings, canonical URLs, and sitemap after the switch.
- [ ] Keep the previous release and document a tested rollback procedure; record the post-launch checks and any remaining issues.
- [ ] Hand over concise instructions for editing content, adding news/albums and optimizing photos, reviewing openings, building, deploying, and rolling back future updates. Identify the maintainer responsible for News and Gallery updates.
