#!/usr/bin/env bash
# ---------------------------------------------------------------
#  One-shot GitHub Pages deploy.
#  Usage:  ./deploy.sh <your-github-username> [repo-name]
#  Requires: git + gh CLI (https://cli.github.com) already logged in
#            (`gh auth login`).
# ---------------------------------------------------------------
set -euo pipefail

USER="${1:-}"
REPO="${2:-wedding-ayila-zidane}"

if [ -z "$USER" ]; then
  echo "Usage: ./deploy.sh <github-username> [repo-name]"; exit 1
fi

command -v gh >/dev/null || { echo "gh CLI not found → https://cli.github.com"; exit 1; }

git init -q 2>/dev/null || true
git add -A
git -c user.name="$USER" -c user.email="$USER@users.noreply.github.com" \
    commit -qm "Wedding invitation — Ayila & Zidane" || echo "nothing new to commit"
git branch -M main

if gh repo view "$USER/$REPO" >/dev/null 2>&1; then
  echo "Repo exists — pushing."
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$USER/$REPO.git"
  git push -u origin main --force
else
  gh repo create "$USER/$REPO" --public --source=. --remote=origin --push
fi

# Turn on Pages via GitHub Actions
gh api -X POST "repos/$USER/$REPO/pages" \
  -f "build_type=workflow" >/dev/null 2>&1 \
  || gh api -X PUT "repos/$USER/$REPO/pages" -f "build_type=workflow" >/dev/null 2>&1 \
  || echo "Enable Pages manually: Settings ▸ Pages ▸ Source = GitHub Actions"

echo ""
echo "✓ Pushed.  Site will be live in ~1 minute at:"
echo "  https://$USER.github.io/$REPO/"
