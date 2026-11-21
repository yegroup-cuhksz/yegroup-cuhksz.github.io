# Content guide

All public content is generated from `src/content/` and `src/data/`. A record added to the
documented locations appears automatically on the relevant index, detail page, homepage preview
or footer count without editing a page template.

New editors should start with [EDITOR_TUTORIAL.md](EDITOR_TUTORIAL.md). Copyable examples are in
[PAGE_TEMPLATES.md](PAGE_TEMPLATES.md), and branch/review rules are in
[GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md).

## Commands

```sh
npm run dev      # generate image derivatives and start the local server
npm run check    # validate content and local references
npm run build    # generate media, validate and build dist/
```

Before publishing, always run `npm run check` and `npm run build`. Build output is in `dist/`.

## Adding a member

Create `src/content/members/<slug>.md`. The filename stem must match the `slug` field. The
profile is generated at `/<slug>/`, so do not use a slug that collides with a static route
(`research`, `activities`, `people`, `alumni`, `publication`, `gallery`, `opening`, `contact`,
`news`, `404`).

```yaml
---
slug: given-family
name: Given Family
chinese: 中文姓名
role: PhD Student
group: PhD Students
group_order: 3
sort_order: 4
email: person@link.cuhk.edu.cn
office: Rx618
portrait: /assets/images/profile_photo/filename.jpg
portrait_alt: Portrait of Given Family.
profile_portrait: /assets/images/profile_photo/filename-large.jpg   # optional
profile_portrait_alt: Portrait of Given Family.        # required with profile_portrait
cv: /assets/images/cv.pdf                              # optional
links:                                                 # optional
  - label: Personal website
    url: https://example.edu/
---

## Education

- Institution, degree (year)

Biography paragraphs in Markdown.
```

Required fields: `slug`, `name`, `role`, `group`, `group_order`, `sort_order`. Optional fields
must be omitted rather than filled with placeholder values. `portrait_alt` is required whenever a
portrait is provided. Prefer a portrait that does not require cropping; the layouts use
`object-fit: contain` for member images.

`group` is the heading shown on the People page and `group_order` controls section order. Existing
group names are “Principal Investigator”, “Postdoctoral Researchers”, “PhD Students”,
“Undergraduate / BSc Students” and “Administrative / Support Staff”. A new group name requires only
the content field, not a template change.

Images and CV files belong under `public/assets/images/`. Use root-relative paths beginning
`/assets/images/` and include the subfolder, for example
`/assets/images/profile_photo/filename.jpg`. Current folders are `profile_photo/`, `group_photo/`,
`logo/`, `research_photo/` and `activity_photo/<album-slug>/`; the CV remains at
`/assets/images/cv.pdf`. Do not link to the old WordPress upload URLs.

## Adding a publication

Add one object to `src/data/publications.json`:

```json
{
  "id": "stable-lowercase-id",
  "title": "Full publication title",
  "authors": "Author list as published",
  "year": 2026,
  "venue": "Journal volume, page (year)",
  "url": "https://doi.org/...",
  "order": 3,
  "featured": false
}
```

- `id` must be unique and stable; it is the anchor on the Publications page.
- `year` controls the primary newest-first sort.
- `order` is the explicit secondary order within the same year. The pair `(year, order)` must be
  unique.
- `url` must be the original DOI, journal, arXiv or publisher link.
- Publications page ordering is `year` descending and then `order` ascending.

### Featured homepage papers

The homepage does not take the newest five records. It renders only records with `"featured": true`
and sorts them by `featured_order`. When changing the selection, give exactly the configured
number of records (`settings.homepage.featuredLimit`, currently 5) unique, contiguous
`featured_order` values beginning at 1:

```json
{
  "featured": true,
  "featured_order": 1
}
```

The current featured selection is provisional and still requires group confirmation. All
publication records, featured or not, remain on the full Publications page.

## Adding a research project

Create `src/content/research/<slug>.md`:

```yaml
---
slug: project-slug
title: Project title
image: /assets/images/project-logo.png
image_alt: Description of the project image.
summary: One or two sentences for index cards.
location: Optional location
order: 3
goals:
  - A verified research goal.
links:
  - label: Collaboration website
    url: https://example.org/
contributions:
  - Optional verified group contribution.
---

Full Markdown description.
```

`goals`, `links`, `location` and `contributions` are optional. The Group Contributions block is
omitted entirely when `contributions` is absent; do not add empty headings. The Research page
loops over every record, so a new project needs no page edit.

## Publishing news

Add an object to `src/data/news.json`. It currently contains one user-requested Solar pp
editorial preview, marked with `editorial_preview: true` and a visible preview note. Its date
follows the collaboration announcement, not an independently confirmed group announcement. Set it
to `draft` or remove it before deploying unless the group approves it.

```json
{
  "slug": "stable-news-slug",
  "title": "Confirmed announcement title",
  "date": "2026-11-12",
  "category": "Publication",
  "summary": "One-sentence factual summary.",
  "status": "published",
  "editorial_preview": false,
  "body": "Optional longer text.\n\nA second paragraph.",
  "event_date": "2026-11-10",
  "image": "/assets/images/optional-image.jpg",
  "image_alt": "Required when image is set.",
  "related_publications": ["publication-id"],
  "related_members": ["member-slug"],
  "related_albums": ["album-slug"],
  "source_url": "https://example.org/source",
  "source_label": "Source"
}
```

- `date` is the announcement date and must be a real ISO date (`YYYY-MM-DD`).
- `event_date` is optional and only for the date an event happened when that differs from the
  announcement date.
- `status` must be `published` or `draft`. Drafts do not appear on the homepage, archive, detail
  pages or sitemap.
- `editorial_preview` and `preview_note`: set `editorial_preview` to `true` only for an unapproved
  layout or copy sample, and provide a `preview_note`. The note appears with the item on the
  homepage, archive and detail page. Omit both fields for normal announcements.
- A published record automatically appears in the `/news/` archive and, if among the newest
  published items, in the homepage module. The homepage module is hidden when there are no
  published items.
- The homepage shows the newest `settings.homepage.newsLimit` items. It must be between 1 and 3
  (default 3). Older published items remain in the `/news/` archive.
- Related IDs and slugs must resolve to existing publication, member and album records. The
  build fails on unknown references.
- Optional body text is plain text split into paragraphs on blank lines. Do not paste raw HTML.

Every published news item also receives a `/news/<slug>/` page, which is included in
`sitemap.xml`. Remove or keep the record as `draft` while facts and dates are unconfirmed.

## Adding an activity

Add an object to `src/data/activities.json`. Only include verified events, dates, speakers and
past talks; do not add invented records to fill the page.

Required fields:

- `slug`: stable lowercase slug, unique across activities. It generates
  `/activities/<slug>/` for published records.
- `title`: activity title.
- `category`: exactly `Seminar`, `External Talk` or `Undergraduate Lecture`.
- `summary`: one or two factual sentences for the index and homepage.
- `status`: `draft` or `published`.

Optional fields:

- `date`: the real event date as `YYYY-MM-DD`. If the date is unknown, omit the field. Do not
  use partial, approximate or impossible dates.
- `time`: human-readable time, for example `14:00–15:00 (UTC+8)`.
- `speaker`, `affiliation`, `host`, `venue`: omit any value that is unknown.
- `body`: plain text split into paragraphs on blank lines.
- `image` and `image_alt`: provide both or neither. The image must be a local file under
  `/assets/images/`. Use the event poster here when one is available.
- `photos`: optional array of event photographs. Each entry needs `image` and `alt`; `caption` is
  optional. Images must be local files under `/assets/images/`.
- `source_url` and `source_label`: provide both or neither. The URL must be an absolute
  `http(s)` URL.
- `related_albums`: an array of existing gallery album slugs.

Unknown fields, duplicate slugs, invalid categories or statuses, invalid field types, missing
local images and unknown album references fail validation. `published` means the record is
editorially visible; it does not by itself prove that an event took place. Drafts never appear on
the homepage, `/activities/`, detail routes or `sitemap.xml`.

The following examples are copyable templates, not real activities. Replace every placeholder
value before publishing and keep the record as `draft` until the details are confirmed.

### Seminar template

```json
{
  "slug": "draft-seminar-example",
  "title": "Draft seminar title",
  "category": "Seminar",
  "summary": "One-sentence summary to replace.",
  "status": "draft",
  "date": "2099-01-01",
  "time": "14:00–15:00 (UTC+8)",
  "speaker": "Speaker name to replace",
  "affiliation": "Speaker affiliation to replace",
  "host": "Group host to replace",
  "venue": "Venue to replace",
  "body": "First paragraph to replace.\n\nSecond paragraph to replace.",
  "image": "/assets/images/activity_photo/event-slug/poster.jpg",
  "image_alt": "Poster for the seminar.",
  "photos": [
    {
      "image": "/assets/images/activity_photo/event-slug/photo.jpg",
      "alt": "Photograph from the seminar.",
      "caption": "Optional caption."
    }
  ]
}
```

### External talk template

```json
{
  "slug": "draft-external-talk-example",
  "title": "Draft external talk title",
  "category": "External Talk",
  "summary": "One-sentence summary to replace.",
  "status": "draft",
  "date": "2099-02-01",
  "speaker": "Speaker name to replace",
  "affiliation": "Speaker affiliation to replace",
  "venue": "Institution or conference to replace",
  "source_url": "https://example.org/talk",
  "source_label": "Event page"
}
```

### Undergraduate lecture template

```json
{
  "slug": "draft-undergraduate-lecture-example",
  "title": "Draft undergraduate lecture title",
  "category": "Undergraduate Lecture",
  "summary": "One-sentence summary to replace.",
  "status": "draft",
  "date": "2099-03-01",
  "time": "10:30–12:15 (UTC+8)",
  "host": "Course or host to replace",
  "venue": "Campus venue to replace",
  "body": "Lecture description to replace.\n\nFurther details to replace."
}
```

Content-only workflow:

1. Add or edit the record in `src/data/activities.json`, leaving unknown optional fields out.
2. Run `npm run check`.
3. To preview an unapproved record locally, temporarily set its `status` to `published`, run
   `npm run dev`, and inspect the homepage, `/activities/` and `/activities/<slug>/`. A `draft`
   record generates no detail route, so it cannot be previewed at that URL.
4. Before deployment, restore `status` to `draft` when the record is not approved for public
   visibility. Keep it `published` only once the details have been approved.
5. Run `npm run check` and `npm run build` again before deployment.

## Adding a gallery album

Add an object to `src/data/albums.json`:

```json
{
  "slug": "activity-slug",
  "title": "Activity title",
  "category": "Group Life",
  "date": "2026-11-12",
  "date_precision": "day",
  "location": "Optional verified location",
  "description": "Optional verified description.",
  "cover": "/assets/images/cover.jpg",
  "photos": [
    {
      "image": "/assets/images/cover.jpg",
      "alt": "Meaningful description of the photograph.",
      "caption": "Optional original caption.",
      "credit": "Optional photographer or source credit."
    }
  ]
}
```

- `slug` is unique and generates `/gallery/<slug>/`.
- `category`, `title`, `cover` and at least one photograph are required.
- `category` must be `Conference`, `Workshop`, `Group Life` or `Outing`.
- `cover` must also appear in `photos`.
- `date` is optional. When the date is unknown, omit both `date` and `date_precision`. When a
  date is known, `date_precision` is required and must match the stored format exactly:
  `YYYY-MM-DD` with `day`, `YYYY-MM` with `month`, or `YYYY` with `year`. Preserve the
  precision actually known rather than inventing a month or day. The page renders only the
  known components (`2025`, `January 2025` or `10 January 2025`) and uses the same value in the
  HTML `datetime` attribute.
- `location`, `description`, `caption` and `credit` are optional and omitted cleanly when absent.
- Photo order in the array is the display order.
- Use only local files in `public/assets/images/`. The album page links each photograph to its
  original local file; no JavaScript lightbox is required.

Albums automatically populate the `/gallery/` cover grid, their album pages and the compact
homepage preview. Categories with no albums do not appear as empty sections. Do not create an
album from a non-photographic illustration or from an activity that has not happened.

## Updating alumni

Add or edit objects in `src/data/alumni.json`:

```json
{
  "name": "Former Member",
  "role": "BSc student",
  "period": "2024–2026",
  "destination": "Now a graduate student at Example University.",
  "sort_order": 8
}
```

`name`, `role` and `sort_order` are required. `period` and `destination` are optional and are
omitted cleanly when the period in the group or the subsequent destination is unknown. The
Alumni page count and list are generated from this file.

## Updating openings

`src/content/openings/positions.md` stores `last_reviewed` as a quoted ISO date
(`"2026-11-12"`). Quote the date in the frontmatter: Astro's YAML parser coerces unquoted
timestamps to `Date` objects, so the collection schema requires a quoted string. The required
visitor-facing `review_note` is shown beside the date. Each role has a `status` of `open`,
`closed` or `general_inquiry`. Open and general-inquiry roles require `materials`; a closed role
may omit them, and the page then hides its application-materials block. Keep internal provenance
and pending group confirmation out of applicant-facing copy.

## Settings and display limits

`src/data/settings.json` holds:

- Group, institution, school and address details used across pages and metadata.
- Email, telephone and official university URL.
- The production domain used for canonicals, Open Graph URLs, the sitemap and robots file.
- Hero slides: each slide has an image, alt text and optional caption. The homepage rotates
  through them every five seconds, starting with the first entry.
- `homepage.newsLimit` (1–3, default 3), `homepage.featuredLimit` (currently 5),
  `homepage.galleryPreviewLimit` and `homepage.activityPreviewLimit` (1–3, default 3). Older
  news and activities remain on their respective archive pages.

Displayed counts for members, publications, albums, photographs and alumni are computed from the
records; do not hardcode totals in page copy.

## Images and generated media

1. Put supplied originals in the matching subfolder of `public/assets/images/` (`profile_photo/`,
   `group_photo/`, `logo/`, `research_photo/` or `activity_photo/<album-slug>/`).
2. Reference them with `/assets/images/<subfolder>/<filename>` in the content file.
3. Run `npm run media` directly, or use `npm run dev` / `npm run build`, which run it first.
4. `scripts/generate-media.mjs` reads each raster original, creates reproducible WebP variants
   (up to the original width, never upscaled) and writes `public/media/manifest.json`. Generated
   names include the lowercased source extension, so `person.jpg` and `person.png` produce
   distinct `person-jpg-*` and `person-png-*` files. If two different originals would still map
   to the same generated name, the script stops with a collision error instead of overwriting.
5. `LocalImage.astro` looks up the original dimensions and variants, emits `picture`/`srcset`
   markup, and fails clearly if a referenced file has not been generated.

When replacing a published image or CV, use a new filename and update its content record: the example Nginx configuration caches these non-fingerprinted paths for 30 days.

Do not edit or replace originals to make the build pass. Do not assume portrait images are square;
their intrinsic dimensions are read from image metadata. Hero images are eager; below-the-fold
images are lazy-loaded.

The `public/media/` output is ignored by Git and is not committed. Only `dist/` should be
deployed.

## Validation rules

`npm run check` fails with a non-zero exit code and a descriptive error list for, among other
things:

- Missing required fields or invalid field types.
- Duplicate member/research/album/news slugs or publication IDs.
- Duplicate activity slugs, invalid activity categories/statuses, or unknown activity fields.
- Publication `(year, order)` duplicates and invalid featured ordering.
- Invalid or impossible dates, including impossible calendar dates in quoted or unquoted
  frontmatter and album dates that do not match their declared precision.
- Invalid activity event dates, categories, statuses, paired optional fields or local images.
- Unquoted YAML dates in collection frontmatter, because Astro's parser coerces them to `Date`
  objects before the schema can check the raw value. Quote `last_reviewed` and any future
  frontmatter dates.
- Broken references from news to publications, members or albums.
- Missing local images, portraits, album covers or CV files.
- Invalid absolute URLs.
- Member slugs colliding with static routes.
- Residual WordPress/editor markup in Markdown bodies.

Optional fields must be omitted when unknown. The validator and Astro collection schemas both
enforce these rules so a content-only addition cannot silently produce a broken page.

## Review before release

Recruitment availability, the provisional representative-paper selection, image credits and
external links need group/editorial confirmation.
