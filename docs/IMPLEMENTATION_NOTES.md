# Implementation notes

This document records implementation decisions, source corrections and checks performed for the
Astro reconstruction. It is not a record of group approval or supervisor acceptance.

## Outstanding release content checks

### Representative publications

The five papers shown on the homepage are a provisional editorial selection, not an automatically
generated “newest five” slice. The configured order is:

1. First Indication of Solar ⁸B Neutrinos via Coherent Elastic Neutrino-Nucleus Scattering with
   XENONnT (2024).
2. Search for Light Dark Matter in Low-Energy Ionization Signals from XENONnT (2025).
3. REactor neutrino LIquid xenon Coherent elastic Scattering experiment (2024).
4. First Dark Matter Search with Nuclear Recoils from the XENONnT Experiment (2023).
5. Search for New Physics in Electronic Recoil Data from XENONnT (2022).

**The group should confirm this provisional selection before public release.** It should not be
described as group-approved until that confirmation is recorded. The selection is stored in
`src/data/publications.json` with `featured` and `featured_order`; all 15 records remain on the
Publications page.

### Recruitment status

The Openings page preserves the captured statements and role-specific materials:

- PhD: transcript, CV and research statement (if any), with the `[CUHK-SZ PhD Application]`
  subject prefix.
- Postdoc: CV with publication list and research statement; cover letter and two recommendation
  letters for a formal application, with the `[CUHK-SZ Postdoc Application]` subject prefix.
- Undergraduate: listed as a closed role, with the captured statement that undergraduate positions
  are not open. Closed roles omit application materials.

The displayed “last reviewed” date records a review against the archived source capture, not a
fresh confirmation by the PI that positions remain available. **The group must confirm current
recruitment status and the last-reviewed date before release** and whenever availability changes.
The public page presents the review date and review note; it does not expose the capture/provenance
wording. That provenance remains recorded here and in `docs/CONTENT_GUIDE.md`.

### Xiaoling Cheng record

The archived member record contains an empty “Education” heading and no biography text. No
education or biography content was invented. The profile therefore presents the role, contact and
office information only, with an HTML comment in the Markdown source recording the empty baseline
record.

### News

`src/data/news.json` originally started as an empty array. A subsequent user request added one local Solar pp preview template (`xenonnt-solar-pp-preview`), visibly marked with `editorial_preview: true` and an on-page preview note, and dated to the official collaboration announcement on 31 August 2026. It is deliberately `published` to show the homepage, archive and detail layouts locally; change it to `draft` or remove it before a production release unless approved. The following describes the initial empty-data implementation.

The initial news dataset was empty. No verified exact announcement date
was supplied for a new item, so no sample news was fabricated. The homepage News module is hidden
while the published list is empty, and `/news/` shows an explicit empty state. Publishing a
record with `status: "published"` makes it appear automatically in the archive, homepage feed and
sitemap; drafts are excluded.

### Activities

`src/data/activities.json` now holds the two supplied activities: the 2026-11-07 CUHKSZ Physical
Society lecture by Prof. Jingqiang Ye and the 2026-11-12 seminar by Prof. Kenny Ng. Each record
uses its supplied poster as the main image and keeps the event photographs in the optional
`photos` array. Copyable draft templates and the content-only workflow are documented in
`docs/CONTENT_GUIDE.md`.

The homepage always shows an Activities section, including a three-category overview and a link
to `/activities/` when the published list is empty. A record becomes visible on the homepage,
the Activities index and its own `/activities/<slug>/` route only when its `status` is
`published`; drafts are also excluded from `sitemap.xml`. Published means editorial visibility,
not that the activity has already taken place. The configured homepage preview limit is
`settings.homepage.activityPreviewLimit` (default 3, range 1–5).

### Image credits and permission

No photographer credits were present in the captured gallery captions, so optional `credit` fields
are omitted rather than guessed. Group confirmation of image attribution and permission is still
recommended before release.

### External link verification

Original DOI, journal, arXiv, collaboration, university and PhD-programme URLs were preserved from
the supplied data and source pages. External network access was restricted in this implementation
environment, so live HTTP status and redirects for those destinations were not revalidated.

### Group contributions

A separate Group Contributions account is optional and was not supplied. No empty contribution
headings or inferred responsibilities were added. The Research template supports an optional
`contributions` field for future verified material.

### Content ownership

The group still needs to designate the maintainer responsible for News and Gallery updates, and
the person who reviews recruitment availability. The content workflow is documented, but no
individual ownership was supplied or inferred.

## Source corrections and editorial changes

The migration used the archived source inventory captured at
`2026-11-12T08:09:16Z`, together with the captured original pages and their local media. The
Openings content comes from the archived `opening.html` capture; it was not obtained from a new
live check of the production WordPress site.

1. **Typo correction:** “Electronic Recoil Date” in the XENONnT reference list was corrected to
   “Electronic Recoil Data”.
2. **Reference correction:** In the XENONnT research paragraph, the citations for XENONnT
   new-physics constraints and the 2022 XENONnT result now point to reference [3], the existing
   2022 XENONnT new-physics paper. They previously pointed to [2], the 2020 XENON1T excess paper.
   The reference list and scientific conclusions were otherwise preserved.
3. **Jiafu Li biography:** The ambiguous invitation to “undergraduate and PhD students to join us”
   was rewritten as an invitation to academic discussions and collaboration with undergraduate and
   PhD students. This avoids implying that undergraduate vacancies exist while preserving the
   research description.
4. **WordPress markup removal:** Long-form content was migrated into Markdown and the original
   WordPress wrappers, blocks, scripts and editor styles were removed.
5. **CV path rewrite:** The PI CV link now points to `/assets/images/cv.pdf` rather than the old
   WordPress upload URL.
6. **Alumni presentation:** Names, roles, periods and destinations were retained from the source.
   Minor capitalization and sentence presentation were normalized for the page layout.

### Publisher metadata corrections

Two publication titles were corrected against the publisher article pages, without changing
identifiers, URLs, venues, authors, years, featured flags or ordering:

- DOI `10.1103/PhysRevLett.133.191002`
  (`https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.133.191002`): the published title
  is “First Indication of Solar ⁸B Neutrinos via Coherent Elastic Neutrino-Nucleus Scattering
  with XENONnT”.
- DOI `10.1103/PhysRevLett.129.161805`
  (`https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.129.161805`): the published title
  is “Search for New Physics in Electronic Recoil Data from XENONnT”.

The remaining publication records were not changed. The publication URLs and metadata were not
fetched in this restricted environment; the publisher pages above are the recorded sources for
these two corrections.

## Validation and rendering changes

- Frontmatter is parsed by `scripts/validate-content.mjs` with `js-yaml`'s `CORE_SCHEMA`, which
  does not resolve implicit timestamps. The validator checks `last_reviewed` as a raw
  `YYYY-MM-DD` string and a real calendar date. The Astro schema requires that the YAML value be quoted. Unquoted or quoted impossible dates such as
  `2026-02-30` fail before any `Date` coercion. The Astro collection schema also requires a
  quoted string, so a direct Astro build rejects unquoted YAML dates rather than normalizing
  them.
- Album dates support unknown (both fields omitted), `YYYY` with `year`, `YYYY-MM` with `month`,
  and `YYYY-MM-DD` with `day`. Both validators reject a precision/format mismatch and impossible
  month or day values. The stored record keeps only the known components; `formatAlbumDate` and
  `formatAlbumDateTime` render the same precision without inventing month or day values.
- `formatPhoneDial` removes the domestic trunk zero after `+86` for the `tel:` URI while the
  displayed number is unchanged. Footer and Contact both use the exported `phoneDial` value, so
  the current number produces `tel:+8675523519735` in both places.
- Activity validation requires a stable unique slug, title, summary, category, status and rejects
  unknown fields. The category is one of `Seminar`, `External Talk` or `Undergraduate Lecture`;
  status is `draft` or `published`. Optional event dates must be real `YYYY-MM-DD` values and are
  never normalized. Paired image/alt and source URL/label fields must be provided together;
  local activity images must exist and related album slugs must resolve.
- Generated media names now include the lowercased source extension. This separates
  `person.jpg` from `person.png`; if different originals would still sanitize to the same name,
  `scripts/generate-media.mjs` stops with a clear collision error rather than overwriting.
- The public News archive no longer mentions drafts; draft handling remains documented for
  editors. Empty states avoid referring to content files. Alumni `period` and `destination` are
  optional and render without a stray separator when absent.

## Image accounting

| Supplied asset | Use |
| --- | --- |
| `groupphoto_20250110-1.jpg` | Homepage hero and the 10 January 2025 group album |
| `groupphoto_20240711.jpg` | 11 July 2024 group album and default social preview image |
| `e181_1.png` | Modest APS Physics 2024 highlight on Home; deliberately **not** made into an activity album |
| `logo_standard.png` | XENONnT research record image |
| `relics_logo.jpg` | RELICS research record image |
| Portraits | People cards and member profiles |
| `cv.pdf` | PI profile and People card CV link |

No image was fetched, generated or invented. All displayed raster images derive from the supplied
originals. Responsive WebP derivatives are generated into ignored `public/media/` by
`scripts/generate-media.mjs` and are not part of the committed patch.

## Architecture notes

- Astro 6 content collections use `glob` loaders and Zod schemas for members, research and
  openings.
- Publications, alumni, albums, news, activities and settings use validated JSON data.
- Member, research, album, published-news and published-activity detail routes are generated
  from their records; adding a record does not require template edits.
- The homepage order is hero, topic strip, Research, News, Activities, representative papers and
  Gallery. The standalone group-introduction section was removed; its role is covered by the hero
  and Research sections. The previous Join Us band after Gallery was removed; Openings remains in
  the global navigation and footer.
- The header contains eight links (Home, Research, Activities, People, Publications, Gallery,
  Openings and Contact). Intermediate-width header spacing was tightened, and the mobile menu
  behavior and its 820px breakpoint are unchanged.
- Displayed totals are computed from records.
- The companion Node validator duplicates the important cross-record checks because it runs
  before Astro and can check filesystem assets and references independently.
- Canonical URLs, sitemap and robots use `https://yegroup.cuhk.edu.cn`.
- The single progressive-enhancement script handles the mobile menu and publication filters.
  Navigation, publications and larger gallery images remain available without JavaScript. The
  mobile menu state is reset when the viewport crosses to the desktop breakpoint, so
  `body.menu-open` cannot remain locked.
- The reviewable Nginx example includes exact legacy media/CV redirects for all 17 unique upload
  paths in `reference/source-inventory.json`, plus root-path `page_id=92`/`109` handling that
  tolerates ordinary extra query parameters. Targets are fixed local paths.

## Checks actually run in this implementation environment

- `npm run media` — generated 16 image records and their WebP variants successfully.
- `npm run check` — passed at the initial implementation stage with 9 members, 2 research
  projects, 1 openings record, 7 alumni, 15 publications (5 featured), 2 gallery albums and
  0 news items.
- `npm run build` — completed successfully at the initial implementation stage with 21 static
  HTML pages plus `robots.txt` and `sitemap.xml`.
- Unquoted and quoted `last_reviewed: 2026-02-30` fixtures each made `npm run check` and
  `npm run build` fail with the raw date in the error. A direct Astro build also failed the
  schema check for the quoted invalid date.
- Temporary album fixtures using `2025-01` with `month`, `2025` with `year`, and no date both
  passed check and build. Generated HTML used `<time datetime="2025-01">January 2025</time>`,
  `<time datetime="2025">2025</time>`, and no `<time>` element for the unknown date. Fixtures
  with `2025-13` as a month, a format/precision mismatch, and precision without a date failed
  check with specific errors. The fixtures were removed.
- A temporary alumni record without `period` or `destination` passed check and build and
  rendered as `BSc student` with no stray separator or `undefined`; the record was restored.
- Temporary `person.jpg` and `person.png` fixtures generated distinct `person-jpg-*` and
  `person-png-*` variants. `person photo.jpg` plus `person-photo.jpg` produced a clear
  generated-name collision error instead of overwriting. Fixtures were removed and media was
  regenerated.
- The built Contact page and footer output `tel:+8675523519735` while still displaying
  `+86 0755-23519735`.
- A temporary fixture containing one published and one draft news item verified that only the
  published record appears on the homepage, archive and sitemap, and that a detail route is
  generated only for the published item. The fixture was removed and `src/data/news.json` was
  restored to its empty initial state before the final build.
- A temporary member fixture with a duplicate slug, mismatched filename and missing portrait made
  `npm run check` fail with all three errors reported clearly. The fixture was then removed.
- The Activities implementation pass used `src/data/activities.json` fixtures containing two
  published records and one draft. `npm run check` and `npm run build` passed; the two published
  records appeared on the homepage, `/activities/`, their detail routes and `sitemap.xml`, while
  the draft appeared in none of them and generated no detail route. The known date sorted before
  the unknown date on the homepage, and the unknown-date detail page rendered no empty `<time>`
  or placeholder text. Plain body markup was escaped, source and related-album links rendered,
  and speaker/affiliation text rendered without stray separators.
- An invalid Activities fixture made `npm run check` fail with eight specific errors covering an
  impossible date (`2026-02-30`), an invalid category, duplicate slug, unknown field,
  missing image, missing source label and unknown related album. A root object instead of an
  array failed with `activities.json: root must be an array`. A temporary
  `homepage.activityPreviewLimit` of 6 failed with the 1–5 range error. These fixtures were
  removed and `src/data/activities.json` was restored to `[]` before the final check and build.
- A separate invalid Activities fixture with a non-string title and an unsupported status failed
  with both field errors reported clearly.
- The final empty-activities build generated `/activities/` with the three-category overview and
  empty state, kept the homepage Activities section visible, and produced 23 static pages.
- A local Node link scan over all generated HTML checked 103 unique internal targets and found no
  missing internal asset or route targets after canonical corrections.
- `git diff --check` — passed.

### Limitations

- No real-browser visual, keyboard, responsive-viewport or screen-reader QA was performed in this
  environment. The supervisor performs browser acceptance separately.
- A local static HTTP server could not bind to a port under the sandbox policy, so direct HTTP
  status and refresh testing was not completed here. Generated routes and local references were
  inspected on disk instead.
- External links were not fetched or revalidated.
- Nginx configuration was written for review only and was not applied or tested with `nginx -t`
  in this environment.
- No deployment, DNS change or production verification was performed.
