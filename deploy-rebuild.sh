#!/usr/bin/env bash
#
# deploy-rebuild.sh
# Copies the helloSCULE rebuild into the zona-scule git repo on a NEW branch,
# preserving git history, the repo's real .env.local, deps and build output.
# It commits locally but does NOT push — you run the push yourself.
#
# Run it from anywhere:  bash deploy-rebuild.sh
#
set -euo pipefail

REPO="/Users/silviu.ardelean/Library/CloudStorage/GoogleDrive-silviuxardelean@gmail.com/My Drive/ZONA SCULE DATABASES/www8/zona-scule"
REBUILD="/Users/silviu.ardelean/Library/Mobile Documents/com~apple~CloudDocs/CLOUD CLAUDE VAN DAMME/helloSCULE"
BRANCH="rebuild-$(date +%Y%m%d)"

echo "Repo:    $REPO"
echo "Rebuild: $REBUILD"
echo "Branch:  $BRANCH"
echo

# Safety: repo must be a clean git working tree on main before we start.
cd "$REPO"
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: '$REPO' has uncommitted changes. Commit or stash them first, then re-run."
  git status --short
  exit 1
fi

git checkout main
git fetch origin && git merge --ff-only origin/main || echo "(skipping fast-forward; continuing on local main)"
git checkout -b "$BRANCH"

# Copy the rebuild over the repo, replacing old code.
# Preserve: .git, node_modules, .next build output, the repo's real .env.local, .vercel.
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.env.local' \
  --exclude '.vercel/' \
  "$REBUILD/" "$REPO/"

echo
echo "=== Changes staged for commit ==="
git add -A
git status --short | head -50
echo

git commit -m "Replace site with rebuild: route groups, admin auth, contact persistence, ISR, optimized images"

echo
echo "============================================================"
echo "DONE locally on branch '$BRANCH'. Nothing has been pushed yet."
echo
echo "NEXT STEPS (you run these):"
echo
echo "  1. Push the branch to GitHub:"
echo "       cd \"$REPO\""
echo "       git push -u origin $BRANCH"
echo
echo "  2. In Vercel, this branch gets a PREVIEW deployment automatically."
echo "     Before it builds correctly, add these env vars to the Vercel"
echo "     project (Settings -> Environment Variables), values are in"
echo "     helloSCULE/.env.local:"
echo "       ADMIN_USER"
echo "       ADMIN_PASS"
echo "     (Supabase vars should already exist; confirm they're present.)"
echo
echo "  3. Open the preview URL, verify the site + /admin login work."
echo
echo "  4. When happy, merge to main to go live:"
echo "       git checkout main && git merge $BRANCH && git push"
echo
echo "  ROLLBACK if needed: git checkout main  (branch '$BRANCH' is untouched)"
echo "============================================================"
