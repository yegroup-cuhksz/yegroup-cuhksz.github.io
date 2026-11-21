# GitHub workflow and version management

The GitHub repository is the single source of truth for the website:
<https://github.com/OA3lllhhy/ye-group-website> (private).

`main` is the production-ready branch. Content edits and code changes reach it only through a
pull request, never by editing the live server or the cloud bucket directly.

## Golden rules (read first)

1. **Contributors must never commit or push directly to `main`.** `main` is protected.
2. **Contributors must start every change on a new branch** created from an up-to-date `main`.
3. **Contributors must open a pull request.** The maintainer may commit directly to `main`.
4. **Contributors must not merge their own pull request.** Only the maintainer merges.
5. **Do not approve or merge without the required content approval** from the editor or PI.
6. **Never force-push or delete `main`.**
7. If branch protection blocks you, ask the maintainer. Do not try to bypass it.

The repository setting enforces these rules for contributors. The maintainer is the only person
allowed to push directly or use an administrative bypass. Maintainers should still use a
branch/PR for risky or large changes so there is a review and rollback point.

## 1. Roles

| Role | Responsibilities |
| --- | --- |
| Maintainer | Repository settings, CI, deployment, **may commit/push directly to `main`**, the only role that merges PRs, backups, access review |
| Editor | Copy quality, image permissions, alt text, content review; does not merge unless also the maintainer |
| PI | Final approval for claims, people, roles, publications and positions; does not merge unless also the maintainer |
| Contributor | Edits content or code on a branch, opens a pull request, responds to review; never merges to `main` |

Small groups can combine roles. If the maintainer also writes content, their pull request still
needs review from the editor or PI before merge. If no second reviewer is available, the
maintainer may use the documented emergency bypass and record why.

## 2. Repository access

- Access is by invitation through **Settings → Collaborators and teams**.
- Every collaborator must enable two-factor authentication.
- Remove access when a member leaves the group or no longer needs edit rights.
- Review access at least quarterly.

Never share a personal access token. For automated deployment, use a repository deploy key or
short-lived, least-privilege credentials stored in GitHub Secrets.

## 3. Branch model

`main` is read-only for contributors. **Contributors must not edit, commit or push while on
`main`.** Create one short-lived branch per change. The maintainer may commit directly to `main`,
but should use a branch/PR for risky or large changes.

Check your current branch before editing:

```sh
git branch --show-current
```

If it prints `main`, stop and create a branch first.

Branch naming:

```text
content/add-november-seminar
content/update-haoyun-profile
fix/gallery-cover-path
docs/editor-tutorial
deploy/cloud-migration
```

Commit messages:

```text
content: add November seminar
fix: correct gallery cover path
docs: add editor tutorial
deploy: add static hosting workflow
```

One logical change per branch and pull request. Do not mix content edits, dependency upgrades and
deployment changes in the same pull request.

## 4. Pull request workflow

Contributors must follow these steps exactly. Do not skip the branch step. The maintainer may
skip the PR for a small direct change; see the maintainer workflow below.

1. Sync `main` (read only):

   ```sh
   git switch main
   git pull --ff-only
   ```

2. Create a branch **before making any edit**:

   ```sh
   git switch -c content/your-change
   ```

3. Confirm you are on the new branch:

   ```sh
   git branch --show-current
   ```

   It must not print `main`.

4. Make the change using [EDITOR_TUTORIAL.md](EDITOR_TUTORIAL.md) and
   [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md).
5. Validate locally:

   ```sh
   npm run check
   npm run build
   ```

6. Commit and push **the branch**, never `main`:

   ```sh
   git add <changed-files>
   git commit -m "content: describe the change"
   git push -u origin HEAD
   ```

7. Open a pull request on GitHub with base branch `main`. In the web editor, you must choose
   **Create a new branch for this commit and start a pull request**; never choose
   **Commit directly to the `main` branch**.
8. Fill in the pull request checklist:

   - What changed and why.
   - Affected page or content record.
   - `npm run check` and `npm run build` results.
   - Approval for names, dates, claims and photo permissions.
   - Screenshot or preview note for visual changes.

9. Request a reviewer. The editor reviews copy and images; the PI approves people, roles,
   publications and positions; the maintainer reviews deployment or structural changes.
10. Address review comments on the same branch. The pull request updates automatically.
11. **The maintainer merges** after approval and green checks. Contributors must not click
    **Merge pull request**. Use **Squash and merge** to keep `main` history readable.
12. Delete the branch after merging.

## Maintainer direct workflow

The maintainer may commit and push directly to `main` when they choose to skip the PR. This is a
maintainer-only path; contributors must keep using branches and PRs.

```sh
git switch main
git pull --ff-only
# edit and validate
npm run check
npm run build
git add <changed-files>
git commit -m "docs: describe the change"
git push origin main
```

Before pushing:

- Review `git diff --cached`.
- Confirm no generated files, secrets or unrelated changes are staged.
- Confirm the target is the official repository and the `main` branch.

Use a branch and PR for large, risky, cross-cutting or content-sensitive changes so there is a
review and rollback point. Do not use direct-main pushes to bypass CI or review for contributors.

## If you accidentally commit to `main`

Do not push. Move the commit onto a branch first:

```sh
git switch -c content/recover-my-change
git switch main
git reset --hard origin/main
git switch content/recover-my-change
git push -u origin HEAD
```

Then open a pull request as usual.

If the commit was already pushed to `main`, notify the maintainer immediately. Do not force-push
or try to rewrite history yourself. The maintainer will move or revert the change through a pull
request and record the incident.

## 5. `main` protection

`main` is protected in the GitHub repository. The required rules are:

- A pull request is required before merging.
- At least one approval is required.
- Approvals are dismissed when new commits are pushed.
- All review conversations must be resolved before merging.
- Linear history is required; use **Squash and merge**.
- Force pushes and branch deletion are blocked.
- Status checks will be required once CI exists: content validation and build.

Direct pushes to `main` are blocked for contributors. The maintainer may push directly using the
administrative bypass reserved for that role. Record the reason, affected commit and follow-up PR
for emergency bypasses; normal maintainer direct pushes should still have clear commit messages.

Until CI is implemented, the author must paste the result of `npm run check` and `npm run build`
into the pull request. The roadmap makes CI a Q1 deliverable.

## 6. Review checklist

Use this checklist in every pull request:

- [ ] Change is one logical unit.
- [ ] Content is approved by the editor or PI where required.
- [ ] Names, roles, affiliations and dates are confirmed.
- [ ] Photographs have permission and meaningful alt text.
- [ ] No unpublished results or private personal data are included.
- [ ] Internal links and image paths resolve.
- [ ] `npm run check` passes.
- [ ] `npm run build` passes.
- [ ] Visual changes were checked at desktop and phone widths.
- [ ] No secrets, tokens, `.env` files or cloud keys are included.

## 7. Merge and deployment

After a pull request is merged into `main`:

1. The maintainer deploys manually, or the automated deployment runs after CI is enabled.
2. Check the live homepage and the changed page.
3. Check images, the CV download and navigation.
4. Record the deployed commit hash in the deployment log.

Deployment steps live in [DEPLOYMENT.md](DEPLOYMENT.md) for the lab server and
[STATIC_HOST_DEPLOYMENT.md](STATIC_HOST_DEPLOYMENT.md) for cloud object storage + CDN.

Do not edit HTML, CSS or content directly in the live Nginx directory or cloud bucket. The next
deployment would overwrite it, and the change would be missing from Git history.

## 8. Version history, tags and rollback

Git history is the primary version record. Keep commits small and messages descriptive.

For production releases, create an annotated tag after a successful deployment:

```sh
git tag -a site-2026-12-01 -m "Production release: 2026-12-01"
git push origin site-2026-12-01
```

Rollback options:

- **Content mistake:** revert the pull request on GitHub, or create a revert commit and open a new
  pull request.
- **Bad deployment:** use the previous release directory or cloud deployment history; see the
  deployment docs.
- **Lost file:** restore it from Git history or a release archive.

Never force-push `main`. Do not rewrite shared history. If a secret was committed, rotate the
secret first; deleting the commit is not enough.

## 9. Conflicts

If GitHub reports a conflict:

1. Update your branch with the latest `main`.
2. Resolve the conflict in GitHub Desktop, VS Code or the command line.
3. Run `npm run check` and `npm run build` again.
4. Push the resolved branch.

If you are unsure, ask the maintainer. Do not delete files or discard changes to make a conflict
disappear.

## 10. Issues and content requests

Use GitHub Issues for larger content requests:

- Title: page or record to change.
- Source material: approved text, poster, photograph or link.
- Deadline and publication date.
- Approval owner.
- Labels: `content`, `bug`, `deployment`, `accessibility` or `documentation`.

Small updates can go directly to a pull request. Use an issue when the request needs discussion,
approval or material from someone else.

## 11. Secrets and sensitive data

Never commit:

- GitHub tokens, SSH private keys or cloud AccessKeys.
- `.env` files or deployment credentials.
- Student or staff personal data that is not approved for publication.
- Unpublished research results or embargoed material.

Use GitHub Secrets for deployment credentials. Keep the real values in the group's approved
password manager or internal document, not in this repository.

## 12. Housekeeping

- Delete merged branches.
- Review open pull requests and issues at least monthly.
- Review collaborator access quarterly.
- Keep dependency updates grouped and tested.
- Update this workflow when the branch protection or deployment process changes.

## 13. Where to go next

- Editing instructions: [EDITOR_TUTORIAL.md](EDITOR_TUTORIAL.md).
- Copyable templates: [PAGE_TEMPLATES.md](PAGE_TEMPLATES.md).
- Field reference: [CONTENT_GUIDE.md](CONTENT_GUIDE.md).
- Deployment: [DEPLOYMENT.md](DEPLOYMENT.md) and
  [STATIC_HOST_DEPLOYMENT.md](STATIC_HOST_DEPLOYMENT.md).
- Priorities and review cadence: [ROADMAP.md](ROADMAP.md).
