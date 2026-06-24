#!/usr/bin/env bash
#
# deploy-rebuild-local.sh
# Git does NOT work inside Google Drive (mmap timeouts on streamed files).
# So we clone the repo fresh to a normal LOCAL folder (~/zona-scule-deploy),
# copy the helloSCULE rebuild into it, commit on a new branch, and stop.
# You then push. Same GitHub repo, same Vercel project.
#
# Run:  bash deploy-rebuild-local.sh
#
set -euo pipefail

REMOTE="https://github.com/silviuiux/zona-scule.git"
LOCAL="$HOME/zona-scule-deploy"
REBUILD="/Users/silviu.ardelean/Library/Mobile Documents/com~apple~CloudDocs/CLOUD CLAUDE VAN DAMME/helloSCULE"
BRANCH="rebuild-$(date +%Y%m%d)"

echo "Remote:  $REMOTE"
echo "Local:   $LOCAL   (normal disk, NOT Google Drive)"
echo "Rebuild: $REBUILD"
echo "Branch:  $BRANCH"
echo

# 1. Fresh clone (or reuse + update an existing local clone)
if [ -d "$LOCAL/.git" ]; then
  echo "Local clone already exists — updating it..."
  cd "$LOCAL"
  git checkout main
  git pull --ff-only
else
  git clone "$REMOTE" "$LOCAL"
  cd "$LOCAL"
fi

# 2. New branch off main (never touch main directly)
git checkout -B "$BRANCH" main

# 3. Copy the rebuild in, replacing old code.
#    Keep .git. Bring the rebuild's .env.local for local dev
#    (it's gitignored, so it never gets pushed/deployed).
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.vercel/' \
  "$REBUILD/" "$LOCAL/"

# 4. Stage + commit locally (no push)
git add -A
echo
echo "=== Changes to be committed ==="
git status --short | head -60
echo
git commit -m "Replace site with rebuild: route groups, admin auth, contact persistence, ISR, optimized images"

echo
echo "============================================================"
echo "DONE locally at: $LOCAL  (branch '$BRANCH'). Nothing pushed yet."
echo
echo "NEXT STEPS (you run these):"
echo
echo "  1. Push the branch:"
echo "       cd \"$LOCAL\""
echo "       git push -u origin $BRANCH"
echo
echo "  2. In Vercel (project: zona-scule), add these env vars if missing"
echo "     (Settings -> Environment Variables; values are in"
echo "     helloSCULE/.env.local):"
echo "       ADMIN_USER"
echo "       ADMIN_PASS"
echo "     Confirm the Supabase vars are already present."
echo
echo "  3. Vercel auto-builds a PREVIEW for the branch. Verify it +"
echo "     /admin login, then go live:"
echo "       git checkout main && git merge $BRANCH && git push"
echo
echo "  From now on, do git here ($LOCAL), NOT in Google Drive."
echo "============================================================"
