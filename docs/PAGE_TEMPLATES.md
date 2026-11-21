# Page templates

Copy the template for the page you are editing, replace every placeholder, and keep records in
`draft` status where the template supports it. Field definitions and validation rules are in
[CONTENT_GUIDE.md](CONTENT_GUIDE.md). Workflow instructions are in
[EDITOR_TUTORIAL.md](EDITOR_TUTORIAL.md).

Before submitting:

```sh
npm run check
npm run build
```

## Member profile

**File:** `src/content/members/<slug>.md`  
**Page:** `/people/` and `/<slug>/`  
**Template:**

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
portrait: /assets/images/profile_photo/example.jpg
portrait_alt: Portrait of Given Family.
profile_portrait: /assets/images/profile_photo/example-large.jpg
profile_portrait_alt: Portrait of Given Family.
cv: /assets/images/cv.pdf
links:
  - label: Personal website
    url: https://example.edu/
---

## Education

- Institution, degree (year)

Biography paragraph. Keep it factual and approved by the person or the PI.
```

- Required: `slug`, `name`, `role`, `group`, `group_order`, `sort_order`.
- `chinese`, `email`, `office`, `profile_portrait`, `cv` and `links` are optional.
- `portrait_alt` is required when `portrait` is set; `profile_portrait_alt` is required when
  `profile_portrait` is set.
- Use the existing group names: `Principal Investigator`, `Postdoctoral Researchers`,
  `PhD Students`, `Undergraduate / BSc Students`, `Administrative / Support Staff`.
- Do not use a slug that collides with a static route such as `people`, `research`, `news` or
  `gallery`.

## Research project

**File:** `src/content/research/<slug>.md`  
**Page:** `/research/` and homepage research cards  
**Template:**

```yaml
---
slug: project-slug
title: Project title
image: /assets/images/research_photo/example.png
image_alt: Description of the project image.
summary: One or two sentences for the index and homepage cards.
location: Optional verified location
order: 3
goals:
  - A verified research goal.
links:
  - label: Collaboration website
    url: https://example.org/
contributions:
  - Optional verified group contribution.
---

Full Markdown description. Use plain paragraphs; do not paste raw HTML.
```

- Required: `slug`, `title`, `image`, `image_alt`, `summary`, `order`.
- `location`, `goals`, `links` and `contributions` are optional.
- Omit optional fields entirely when unknown; do not use placeholder values.
- A new research record appears automatically; no page template edit is needed.

## Publication

**File:** `src/data/publications.json`  
**Page:** `/publication/` and possibly the homepage  
**Template:**

```json
{
  "id": "example-publication-2026",
  "title": "Full publication title",
  "authors": "Author list as published",
  "year": 2026,
  "venue": "Journal volume, page (year)",
  "url": "https://doi.org/example",
  "order": 3,
  "featured": false
}
```

- `id` must be unique and stable; it is the anchor on the Publications page.
- `(year, order)` must be unique. Ordering is newest year first, then ascending `order`.
- `url` must be the original DOI, journal, arXiv or publisher link.
- To feature a paper on the homepage, add `"featured": true` and a unique
  `"featured_order"` value. The configured number of featured papers must stay contiguous from
  1; see `settings.homepage.featuredLimit` and [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## News item

**File:** `src/data/news.json`  
**Page:** `/news/`, `/news/<slug>/` and the homepage  
**Template:**

```json
{
  "slug": "example-news-slug",
  "title": "Confirmed announcement title",
  "date": "2026-11-21",
  "category": "Publication",
  "summary": "One or two factual sentences.",
  "status": "draft",
  "body": "Optional longer text.\n\nA second paragraph."
}
```

- Required: `slug`, `title`, `date`, `category`, `summary`, `status`.
- Use a real ISO date (`YYYY-MM-DD`).
- Keep `status` as `draft` until the PI or editor approves the item.
- Optional fields: `event_date`, `image`, `image_alt`, `related_publications`,
  `related_members`, `related_albums`, `source_url`, `source_label`.
- `image` and `image_alt` must be provided together.
- `source_url` and `source_label` must be provided together.
- Do not use `editorial_preview` for normal news. It exists only for explicitly marked layout or
  copy samples.

## Activity

**File:** `src/data/activities.json`  
**Page:** `/activities/`, `/activities/<slug>/` and the homepage  
**Template:**

```json
{
  "slug": "example-seminar-2026",
  "title": "Example seminar title",
  "category": "Seminar",
  "summary": "One or two factual sentences.",
  "status": "draft",
  "date": "2026-11-21",
  "time": "14:00–15:00",
  "speaker": "Speaker name",
  "affiliation": "Speaker affiliation",
  "host": "Group host",
  "venue": "Room or building",
  "body": "First paragraph.\n\nSecond paragraph.",
  "image": "/assets/images/activity_photo/example-seminar/poster.jpg",
  "image_alt": "Poster for the seminar.",
  "photos": [
    {
      "image": "/assets/images/activity_photo/example-seminar/photo.jpg",
      "alt": "Photograph from the seminar.",
      "caption": "Optional caption."
    }
  ]
}
```

- `category` must be `Seminar`, `External Talk` or `Undergraduate Lecture`.
- Required: `slug`, `title`, `category`, `summary`, `status`.
- Optional: `date`, `time`, `speaker`, `affiliation`, `host`, `venue`, `body`, `image`,
  `image_alt`, `photos`, `source_url`, `source_label`, `related_albums`.
- `image` and `image_alt` must be provided together.
- Keep `status` as `draft` until the event details and images are approved.

## Gallery album

**File:** `src/data/albums.json`  
**Page:** `/gallery/`, `/gallery/<slug>/` and the homepage preview  
**Template:**

```json
{
  "slug": "example-album",
  "title": "Example album title",
  "category": "Group Life",
  "date": "2026-11-21",
  "date_precision": "day",
  "location": "Optional verified location",
  "description": "Optional verified description.",
  "cover": "/assets/images/activity_photo/example-album/example-cover.jpg",
  "photos": [
    {
      "image": "/assets/images/activity_photo/example-album/example-cover.jpg",
      "alt": "Meaningful description of the photograph.",
      "caption": "Optional original caption.",
      "credit": "Optional photographer or source credit."
    },
    {
      "image": "/assets/images/activity_photo/example-album/example-second.jpg",
      "alt": "Meaningful description of the second photograph.",
      "caption": "Optional original caption."
    }
  ]
}
```

- `category` must be `Conference`, `Workshop`, `Group Life` or `Outing`.
- Required: `slug`, `title`, `category`, `cover`, at least one photo.
- `cover` must also appear in `photos`.
- `date` and `date_precision` are both optional, but must be provided together.
  `date_precision` must be `day`, `month` or `year` and must match `YYYY-MM-DD`, `YYYY-MM` or
  `YYYY`.
- Put photographs under `public/assets/images/activity_photo/<album-slug>/` or another suitable
  image folder. See the image paths below.

## Alumni

**File:** `src/data/alumni.json`  
**Page:** `/alumni/` and the People page  
**Template:**

```json
{
  "name": "Former Member",
  "role": "BSc student",
  "period": "2024–2026",
  "destination": "Now a graduate student at Example University.",
  "sort_order": 8
}
```

- Required: `name`, `role`, `sort_order`.
- `period` and `destination` are optional; omit them when unknown.
- Use the same ordering style as the existing records.

## Openings

**File:** `src/content/openings/positions.md`  
**Page:** `/opening/`  
**Template:**

```yaml
---
title: Openings
intro: "We have open positions for Ph.D. students and Postdocs."
last_reviewed: "2026-11-21"
review_note: "Availability may change; please confirm the current status with the group before applying."
contact:
  name: Prof. Jingqiang Ye
  email: yejingqiang@cuhk.edu.cn
roles:
  - id: phd
    title: PhD
    kind: PhD
    status: open
    subject_prefix: "[CUHK-SZ PhD Application]"
    instructions: "Please email the following items to Prof. Jingqiang Ye (yejingqiang@cuhk.edu.cn) with a prefix of [CUHK-SZ PhD Application] in the title."
    materials:
      - Transcript
      - CV
      - Research Statement (if any)
    external_url: https://example.edu/program
---

If you have any questions, don’t hesitate to get in touch with us. Contact: Prof. Jingqiang Ye,
[yejingqiang@cuhk.edu.cn](mailto:yejingqiang@cuhk.edu.cn).
```

- Quote `last_reviewed`; unquoted YAML dates are rejected.
- `kind` must be `PhD`, `Postdoc` or `Other`.
- `status` must be `open`, `closed` or `general_inquiry`.
- `materials` is required unless the role is `closed`.
- `subject_prefix`, `formal_application_note`, `formal_materials` and `external_url` are optional.

## Homepage settings

**File:** `src/data/settings.json`  
**Page:** homepage hero and preview limits  
**Template for one hero slide:**

```json
{
  "image": "/assets/images/group_photo/example.jpg",
  "alt": "Description of the group photograph.",
  "caption": "Group photo @Month Year. From left to right: …"
}
```

Add the object to `hero.slides`. The first slide appears first; the carousel rotates every five
seconds.

Homepage limits:

```json
"homepage": {
  "newsLimit": 3,
  "featuredLimit": 5,
  "galleryPreviewLimit": 3,
  "activityPreviewLimit": 3
}
```

`newsLimit` and `activityPreviewLimit` must be between 1 and 3. Older items remain on their
archive pages. Do not hardcode counts in page copy.

## Image paths

| Image kind | Folder | Example path |
| --- | --- | --- |
| Member portrait | `public/assets/images/profile_photo/` | `/assets/images/profile_photo/example.jpg` |
| Group photograph | `public/assets/images/group_photo/` | `/assets/images/group_photo/example.jpg` |
| Experiment logo | `public/assets/images/logo/` | `/assets/images/logo/example.png` |
| Research highlight | `public/assets/images/research_photo/` | `/assets/images/research_photo/example.png` |
| Activity poster/photo | `public/assets/images/activity_photo/<slug>/` | `/assets/images/activity_photo/example/poster.jpg` |
| CV | `public/assets/images/` | `/assets/images/cv.pdf` |

Every image needs `alt` text. Confirm permission before publishing people or event photos.

## Final checklist

- [ ] Placeholders replaced.
- [ ] Slug is unique and lowercase.
- [ ] Dates are real and use the expected precision.
- [ ] Images exist under `public/assets/images/` and paths start with `/assets/images/`.
- [ ] Alt text and captions are meaningful.
- [ ] Required related IDs and album slugs exist.
- [ ] `npm run check` passes.
- [ ] `npm run build` passes.
- [ ] The change is approved by the editor or PI.
