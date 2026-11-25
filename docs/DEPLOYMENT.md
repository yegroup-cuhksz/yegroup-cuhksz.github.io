# Deployment guide

This document covers two deployment channels for the static Astro output: the GitHub Pages
mirror, which is live, and the lab-server Nginx path, which remains a reviewable plan. None of
the server actions below were executed as part of this implementation.

## Build artifact

```sh
npm ci
npm run check
npm run build
```

Only the contents of `dist/` are deployed. The following must remain outside the Nginx document
root:

- `src/`, `scripts/`, `docs/`, `public/` source files, `node_modules/`, `.astro/`, and Git
  metadata.

`npm run build` generates `dist/media/` from the supplied originals and copies the public
assets. The `public/media/` working directory itself is ignored by Git.

## GitHub Pages mirror

A public mirror of the site is published from GitHub Actions:

- Repository: <https://github.com/yegroup-cuhksz/yegroup-cuhksz.github.io>
- Site: <https://yegroup-cuhksz.github.io/>
- Workflow: `.github/workflows/deploy-pages.yml`

The root URL comes from the organization and repository names: GitHub serves
`https://<organization>.github.io/` from a repository named `<organization>.github.io`. A
`*.github.io` address cannot be attached to an unrelated repository as a custom domain, and no
`CNAME` file is used here.

### Trigger and Pages settings

Each push to `main` runs `npm ci`, `npm run check` and `npm run build` with the Node version in
`.nvmrc`, then uploads `dist/` as a Pages artifact. A deployment can also be started manually
from the Actions tab with `workflow_dispatch`.

Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Do not select
"Deploy from a branch": that would publish the repository root instead of the built `dist/`
tree. GitHub enforces HTTPS for the mirror.

### Canonical policy

The mirror is not the canonical origin. `src/data/settings.json` (`domain`) and
`astro.config.mjs` (`site`) stay `https://yegroup.cuhk.edu.cn`, so canonical links, `og:url`,
`sitemap.xml` and `robots.txt` all point at the university domain. Do not change them for a
mirror deployment. Adding `noindex` to the mirror would change the robots policy and needs
maintainer approval.

### Access, protection and limits

- The repository must be public on the GitHub Free plan. Pages for a private repository
  requires GitHub Team or above.
- Pushing changes under `.github/workflows/` requires a token with the `workflow` scope.
- `main` is protected: a pull request is required, force-push and branch deletion are disabled,
  and administrators may bypass when explicitly authorized as maintainer.
- GitHub Pages allows up to 1 GB per published site and about 100 GB of monthly bandwidth. The
  current build is about 52 MB.

### Rollback

Revert the failing commit on `main` and push; the workflow rebuilds and redeploys automatically.
Check the Actions log of the failed run and of the last successful run before reverting. The
mirror does not affect the Nginx or object-storage paths described below.

## Release layout

Use versioned releases and a `current` symlink rather than editing the live document root in
place:

```text
/srv/yegroup/
├── releases/
│   ├── 2026-11-12-a/
│   └── 2026-11-12-b/
├── current -> releases/2026-11-12-b
└── backups/
    ├── nginx-yegroup-2026-11-12.conf
    └── release-2026-11-12-a.tar.gz
```

Copy the verified `dist/` tree into a new release directory using the university-approved file
transfer mechanism. Do not copy source directories into any public path.

## Server-side Git deployment

Use this when the lab server can reach GitHub and has Node.js 22.22.0, npm, Git and rsync.

The server keeps a deploy-only checkout and never serves it directly. `scripts/server-deploy.sh`
fetches the latest `main`, runs `npm ci`, validates and builds the site, copies `dist/` into a new
release directory, and switches the `current` symlink. Nginx serves `current`, not the checkout.

### One-time server setup

Create a read-only GitHub deploy key on the server:

```sh
ssh-keygen -t ed25519 -C "ye-group-lab-server" -f ~/.ssh/ye_group_deploy -N ""
cat ~/.ssh/ye_group_deploy.pub
```

Add the public key under the GitHub repository's **Settings → Deploy keys** with write access
disabled. Then add a host entry:

```sshconfig
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/ye_group_deploy
  IdentitiesOnly yes
```

Verify access, then clone and run the first deployment:

```sh
ssh -T git@github.com

sudo mkdir -p /srv/yegroup
sudo chown -R "$USER":"$USER" /srv/yegroup
git clone git@github.com:yegroup-cuhksz/yegroup-cuhksz.github.io.git /srv/yegroup/app
cd /srv/yegroup/app
./scripts/server-deploy.sh
```

Set the Nginx document root to `/srv/yegroup/current` and reload Nginx after `nginx -t`.

If the server cannot use GitHub SSH on port 22 but can use HTTPS, clone with HTTPS and a
read-only fine-grained token instead. Do not commit the token or place it in a public URL.

### Updating the site

On the Mac, edit and push the changes:

```sh
npm run check
npm run build
git add -A
git commit -m "Update site content"
git push
```

Then, in a terminal on the lab server itself, run:

```sh
cd /srv/yegroup/app
./scripts/server-deploy.sh
```

No SSH from the Mac is required when the server can be operated directly. If remote access is
used instead, the same command can be run through SSH.

The deploy script keeps each release directory so a rollback is a symlink switch, also run on the
server:

```sh
cd /srv/yegroup
ln -sfn releases/<previous-release> current
```

## DNS, HTTPS and ownership

Before changing production, confirm:

- Who controls `yegroup.cuhk.edu.cn` DNS and the server virtual host.
- Who manages the TLS certificate and renewal.
- The correct document root and whether another service currently occupies ports 80/443.
- Whether coordination with university IT is required for the domain cutover.

The old domain `yegroup-cuhksz.org` is separately controlled. Its redirects must not be promised
or configured until its owner and hosting are confirmed.

## Reviewable Nginx example

Replace certificate paths, server names and release dates with the confirmed values. Validate
the final file with the server's Nginx version before applying it.

```nginx
# Place maps in the http context.
# Root path plus page_id only. Ordinary extra query parameters are allowed and
# stripped by the redirect. A matching query on a non-root path is not matched.
map $request_uri $legacy_page_redirect {
    default "";
    ~^/\?(?:[^&=]+(?:=[^&]*)?&)*page_id=92(?:&.*)?$   /;
    ~^/\?(?:[^&=]+(?:=[^&]*)?&)*page_id=109(?:&.*)?$  /alumni/;
}

# Archived WordPress upload paths.
# Every value is a fixed local path, so no request input can choose the
# redirect host or target.
map $uri $legacy_media_redirect {
    default "";
    /wp-content/uploads/2024/11/cv.pdf /assets/images/cv.pdf;
    /wp-content/uploads/2024/11/jingqiang2-689642022-e1732801026118.jpg /assets/images/profile_photo/jingqiang2-689642022-e1732801026118.jpg;
    /wp-content/uploads/2024/11/renyuanyuan-346225708-e1732800139141.jpeg /assets/images/profile_photo/renyuanyuan-346225708-e1732800139141.jpeg;
    /wp-content/uploads/2024/11/tempimageu02rr4.jpg /assets/images/profile_photo/tempimageu02rr4.jpg;
    /wp-content/uploads/2024/11/tianyuanzha.jpg /assets/images/profile_photo/tianyuanzha.jpg;
    /wp-content/uploads/2024/11/yejingqiang1.jpg /assets/images/profile_photo/yejingqiang1.jpg;
    /wp-content/uploads/2024/12/logo_standard.png /assets/images/logo/logo_standard.png;
    /wp-content/uploads/2024/12/relics_logo.jpg /assets/images/logo/relics_logo.jpg;
    /wp-content/uploads/2024/12/tempimagetm8w31.jpg /assets/images/profile_photo/tempimagetm8w31.jpg;
    /wp-content/uploads/2025/01/e181_1.png /assets/images/research_photo/e181_1.png;
    /wp-content/uploads/2025/01/groupphoto_20240711.jpg /assets/images/group_photo/groupphoto_20240711.jpg;
    /wp-content/uploads/2025/01/groupphoto_20250110-1.jpg /assets/images/group_photo/groupphoto_20250110-1.jpg;
    /wp-content/uploads/2025/05/xiaolingcheng-2.jpg /assets/images/profile_photo/xiaolingcheng-2.jpg;
    /wp-content/uploads/2025/05/xiaolingcheng1.jpg /assets/images/profile_photo/xiaolingcheng1.jpg;
    /wp-content/uploads/2025/05/zixichen-e1747299946193.jpg /assets/images/profile_photo/zixichen-e1747299946193.jpg;
    /wp-content/uploads/2025/09/jiafuli.png /assets/images/profile_photo/jiafuli.png;
    /wp-content/uploads/2026/09/haoyun.jpeg /assets/images/profile_photo/haoyun.jpeg;
}

server {
    listen 80;
    server_name yegroup.cuhk.edu.cn;

    # Keep the WordPress query string for the HTTPS request, where the explicit
    # page_id mapping can clear it. Do not add a broad root redirect.
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    # For older Nginx, replace the two lines above with:
    # listen 443 ssl http2;
    server_name yegroup.cuhk.edu.cn;

    root /srv/yegroup/current;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/yegroup.cuhk.edu.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yegroup.cuhk.edu.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Exact page_id mapping on the root path. The redirect target has no legacy
    # query parameters, so /?page_id=92 maps once to / and cannot loop.
    if ($legacy_page_redirect) {
        return 301 https://yegroup.cuhk.edu.cn$legacy_page_redirect;
    }

    # Archived media and CV paths redirect to the matching local asset.
    if ($legacy_media_redirect) {
        return 301 https://yegroup.cuhk.edu.cn$legacy_media_redirect;
    }

    charset utf-8;
    server_tokens off;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Directory URLs such as /research/ resolve to research/index.html.
    # Unknown paths keep an actual 404 status.
    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    # Long-lived immutable build assets. The fingerprints change on rebuild.
    location /_astro/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
    }

    # Generated WebP derivatives and supplied media.
    location ~* ^/(media|assets/images)/.+\.(?:webp|jpe?g|png|svg|pdf)$ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    # HTML and metadata should be revalidated promptly after a release switch.
    location ~* \.(?:html|xml|txt)$ {
        try_files $uri =404;
        expires -1;
        add_header Cache-Control "no-cache";
    }
}
```

### Legacy query redirect behaviour

- `https://yegroup.cuhk.edu.cn/?page_id=92` → `https://yegroup.cuhk.edu.cn/` (Home).
- `https://yegroup.cuhk.edu.cn/?page_id=109` → `https://yegroup.cuhk.edu.cn/alumni/` (Alumni).
- The same redirects apply when ordinary extra query parameters are present, for example
  `/?utm_source=newsletter&page_id=109&ref=old` → `/alumni/`. Those parameters are stripped.
- The map requires the root path. A query such as `/research/?page_id=92` is not redirected.
- The redirect target contains no legacy query and no request captures, so the rules do not
  loop and cannot become an open redirect.
- A request to `/` without a legacy query is not redirected by this rule.
- Query parameters on other URLs are not removed.

### Archived media and CV redirect behaviour

- The 17 archived `/wp-content/uploads/...` paths each redirect permanently to the matching
  supplied file under `/assets/images/`.
- Matching uses the normalized request path (`$uri`), so a query string on an archived media URL
  is ignored. Other `/wp-content/` paths are not redirected.
- Every map value is a fixed root-relative local path. No captures or variable host names are
  used, so the rule cannot redirect to an arbitrary external site.
- The example maps paths for the `yegroup.cuhk.edu.cn` server. `yegroup-cuhksz.org` is separately
  controlled; do not promise or configure redirects there until its owner and hosting are
  confirmed.

### 404 and clean URLs

- `try_files $uri $uri/ =404` serves existing directory indexes and preserves a real 404 status
  for unknown paths.
- `error_page 404 /404.html` uses the generated Astro 404 page. Do not add `=200` to this rule:
  the status must remain 404.
- `/publication/`, `/opening/`, `/gallery/<album>/` and `/news/<slug>/` work on direct visits
  and refreshes because each is a real directory with `index.html`.
- No SPA fallback to `index.html` is used.

## HTTPS and headers

- Use a valid certificate for `yegroup.cuhk.edu.cn`.
- Confirm HTTP redirects to HTTPS without dropping legitimate paths (other than the explicit
  legacy query mapping).
- Consider HSTS only after HTTPS and all subdomains are confirmed; do not enable it casually.
- If adding a Content-Security-Policy, account for Astro's generated module script and the small
  inline document-class script. Test it in staging before production.

## Pre-switch validation

On a local or staging copy:

1. Run `npm ci`, `npm run check` and `npm run build` with Node 22.22.0.
2. Serve `dist/` through a static HTTP server and visit every route, including nested member,
   album and news URLs by direct request.
3. Check CSS, JavaScript, WebP sources, original images, the CV PDF, sitemap and robots.
4. Confirm the 404 page returns HTTP 404.
5. Verify canonicals use `https://yegroup.cuhk.edu.cn` and contain no preview host.
6. Test `/?page_id=92`, `/?page_id=109`, and the same URLs with an extra ordinary query
   parameter against the staging Nginx configuration. Also request the archived media and CV
   paths and confirm each redirects to the matching local `/assets/images/...` file.
7. Run `nginx -t` against the final configuration before any reload. Do not apply an invalid
   configuration.

## Backup, switch and rollback

Before the switch:

1. Back up the current document root, current release and Nginx configuration. Record the release
   identifier and checksums in the deployment log.
2. Keep the previous release directory intact.
3. Stage the new release and validate it through a test hostname or temporary port.
4. Atomically point `current` at the new release.
5. Reload Nginx only after `nginx -t` succeeds.

Rollback:

1. Point `current` back to the known-good previous release.
2. Restore the previous Nginx configuration if it was changed.
3. Run `nginx -t` and reload.
4. Re-check the home page, nested routes, media, CV, 404 and legacy query redirects.

Do not delete the previous release or backup until the post-launch checks have passed.

## Post-launch checks

- Verify HTTPS certificate validity and renewal.
- Revisit Home, Research, People, all nine profile routes, Publications, Openings, Contact,
  Alumni, Gallery, both album routes and the News archive.
- Directly request and refresh a nested URL.
- Confirm the 404 page and HTTP status.
- Check the CV download, representative publication links and official university link.
- Confirm `robots.txt` and `sitemap.xml` use the official domain.
- Record remaining content issues before release.
