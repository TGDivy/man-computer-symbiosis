#!/usr/bin/env bash

set -euo pipefail

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Publish checkpoints from the main branch." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Commit or stash all changes before publishing a checkpoint." >&2
  exit 1
fi

bbgithub_url="git@bbgithub.dev.bloomberg.com:dbramhecha/man-computer-symbiosis.git"

if git remote get-url bbgithub >/dev/null 2>&1; then
  git remote set-url bbgithub "$bbgithub_url"
else
  git remote add bbgithub "$bbgithub_url"
fi

npm test
git push origin main:main
git push bbgithub main:main

printf '%s\n' \
  "GitHub Pages: https://www.divyb.xyz/man-computer-symbiosis/" \
  "BBGitHub Pages: https://bbgithub.dev.bloomberg.com/pages/dbramhecha/man-computer-symbiosis/"
