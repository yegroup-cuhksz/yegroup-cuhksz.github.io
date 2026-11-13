# URL and media map

Canonical production origin: `https://yegroup.cuhk.edu.cn`

## Preserved and new clean routes

| Legacy URL | New URL | Status |
| --- | --- | --- |
| `/` | `/` | Preserved |
| `/research/` | `/research/` | Preserved |
| `/people/` | `/people/` | Preserved |
| `/publication/` | `/publication/` | Preserved (singular retained) |
| `/opening/` | `/opening/` | Preserved (singular retained) |
| `/contact/` | `/contact/` | Preserved |
| `/?page_id=92` | `/` | Explicit legacy query redirect |
| `/?page_id=109` | `/alumni/` | Explicit legacy query redirect |
| `/?page_id=92&<ordinary query>` | `/` | Same redirect; extra parameters stripped |
| `/?page_id=109&<ordinary query>` | `/alumni/` | Same redirect; extra parameters stripped |
| — | `/gallery/` | New |
| — | `/gallery/group-photo-2025-01-10/` | New |
| — | `/gallery/group-photo-2024-07-11/` | New |
| — | `/news/` | New |
| — | `/news/<slug>/` | New, generated only for published news |
| — | `/activities/` | New |
| — | `/activities/<slug>/` | New, generated only for published activities |
| — | `/sitemap.xml` | New |
| — | `/robots.txt` | New |
| — | `/404.html` | New 404 response document |

The two legacy WordPress query URLs require explicit redirect handling because path-only rules
do not match query parameters. See `docs/DEPLOYMENT.md`. The map matches only the root path with
`page_id=92` or `page_id=109`, allows ordinary additional query parameters, and removes the
legacy query when redirecting. It does not loop on `/`, and `/some-path/?page_id=92` is not
redirected.

## Individual profile routes

All nine existing profile slugs remain at the site root:

| URL | Member |
| --- | --- |
| `/jingqiang-ye/` | Jingqiang Ye |
| `/jiafu-li/` | Jiafu Li |
| `/huayu-dai/` | Huayu Dai |
| `/hongkun-li/` | Hongkun Li |
| `/haoyun-liu/` | Haoyun Liu |
| `/yuanyuan-ren/` | Yuanyuan Ren |
| `/tianyuan-zha/` | Tianyuan Zha |
| `/zixi-chen/` | Zixi Chen |
| `/xiaoling-cheng/` | Xiaoling Cheng |

Alumni are on `/alumni/` and are not current profile routes. The News archive is `/news/`; Alumni
and News are linked contextually and in the footer rather than added to the eight-item top
navigation. Activities are a top-level navigation section at `/activities/`.

## Original media and CV paths

The WordPress source URLs below map to local files under `public/assets/images/`. Internal links
in the new site use the local paths shown in the right-hand column. The reviewable Nginx example
in `docs/DEPLOYMENT.md` contains an explicit permanent redirect for each of these 17 unique
upload paths. The path map is static: it uses no request captures and always targets a local
`/assets/images/...` file.

| Original WordPress upload URL | Local path |
| --- | --- |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2025/01/groupphoto_20250110-1.jpg` | `/assets/images/group_photo/groupphoto_20250110-1.jpg` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2025/01/e181_1.png` | `/assets/images/research_photo/e181_1.png` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2025/01/groupphoto_20240711.jpg` | `/assets/images/group_photo/groupphoto_20240711.jpg` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2024/12/logo_standard.png` | `/assets/images/logo/logo_standard.png` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2024/12/relics_logo.jpg` | `/assets/images/logo/relics_logo.jpg` |
| `https://yegroup-cuhksz.org/wp-content/uploads/2024/11/jingqiang2-689642022-e1732801026118.jpg` | `/assets/images/profile_photo/jingqiang2-689642022-e1732801026118.jpg` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2025/09/jiafuli.png` | `/assets/images/profile_photo/jiafuli.png` |
| `https://yegroup-cuhksz.org/wp-content/uploads/2024/12/tempimagetm8w31.jpg` | `/assets/images/profile_photo/tempimagetm8w31.jpg` |
| `https://yegroup-cuhksz.org/wp-content/uploads/2024/11/tempimageu02rr4.jpg` | `/assets/images/profile_photo/tempimageu02rr4.jpg` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2026/09/haoyun.jpeg` | `/assets/images/profile_photo/haoyun.jpeg` |
| `https://yegroup-cuhksz.org/wp-content/uploads/2024/11/renyuanyuan-346225708-e1732800139141.jpeg` | `/assets/images/profile_photo/renyuanyuan-346225708-e1732800139141.jpeg` |
| `https://yegroup-cuhksz.org/wp-content/uploads/2024/11/tianyuanzha.jpg` | `/assets/images/profile_photo/tianyuanzha.jpg` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2025/05/zixichen-e1747299946193.jpg` | `/assets/images/profile_photo/zixichen-e1747299946193.jpg` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2025/05/xiaolingcheng1.jpg` | `/assets/images/profile_photo/xiaolingcheng1.jpg` |
| `https://yegroup.cuhk.edu.cn/wp-content/uploads/2025/05/xiaolingcheng-2.jpg` | `/assets/images/profile_photo/xiaolingcheng-2.jpg` |
| `https://yegroup-cuhksz.org/wp-content/uploads/2024/11/yejingqiang1.jpg` | `/assets/images/profile_photo/yejingqiang1.jpg` |
| `https://yegroup-cuhksz.org/wp-content/uploads/2024/11/cv.pdf` | `/assets/images/cv.pdf` |

The original WordPress hosts use both `https://yegroup.cuhk.edu.cn/wp-content/uploads/` and
`https://yegroup-cuhksz.org/wp-content/uploads/`. The redirects above are path-based and are
configured for the `yegroup.cuhk.edu.cn` server in the example. `yegroup-cuhksz.org` is a
separately controlled domain: its DNS, hosting and redirect ownership must be confirmed before
the same rules are applied there or any redirect from that domain is promised.

The generated responsive WebP derivatives live under `/media/`, for example
`/media/groupphoto_20250110-1-jpg-960.webp`. The source extension is part of each generated
name so two originals with the same stem (`person.jpg` and `person.png`) cannot overwrite each
other. They are derived only from the supplied originals and are rebuilt by
`scripts/generate-media.mjs`.

## Removed legacy URLs

WordPress-only endpoints such as `/feed/`, `/comments/feed/`, `/wp-admin/`, `/wp-json/`,
`/xmlrpc.php`, oEmbed endpoints, WordPress login/remote-login scripts and query URLs other than
the two documented pages are not reproduced by the static site. The only `/wp-content/uploads/`
paths handled by the example are the 17 archived media/CV paths listed above, which redirect to
their local replacements. The server must not expose a WordPress installation at this document
root.

No redirect is required for `/gallery/`, `/news/` or `/activities/` because those routes did not
exist in the captured prototype.
