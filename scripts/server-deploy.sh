#!/usr/bin/env bash
# Run this on the lab server from a deploy-only checkout of the repository.
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/yegroup/app}"
RELEASES_DIR="${RELEASES_DIR:-/srv/yegroup/releases}"
CURRENT_LINK="${CURRENT_LINK:-/srv/yegroup/current}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "error: $APP_DIR is not a git checkout (set APP_DIR)" >&2
  exit 1
fi

cd "$APP_DIR"

echo "==> Fetching $REMOTE/$BRANCH"
git fetch --prune "$REMOTE" "$BRANCH"
git reset --hard "$REMOTE/$BRANCH"

echo "==> Installing dependencies"
npm ci

echo "==> Validating and building"
npm run check
npm run build

release="$(date +%Y%m%d-%H%M%S)"
release_dir="$RELEASES_DIR/$release"

echo "==> Publishing $release_dir"
mkdir -p "$release_dir"
rsync -a --delete "$APP_DIR/dist/" "$release_dir/"

mkdir -p "$(dirname "$CURRENT_LINK")"
ln -sfn "$release_dir" "$CURRENT_LINK"

echo "==> Live release: $release"
echo "    $CURRENT_LINK -> $release_dir"
