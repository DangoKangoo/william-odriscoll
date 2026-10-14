#!/usr/bin/env bash
# The single definition of "done". A task is finished and a PR can open only
# when this exits 0. CI runs this same script. Link check and Lighthouse stay
# CI-only (lychee isn't installed locally; Lighthouse fails on Windows).
set -euo pipefail
cd "$(dirname "$0")/.."

step() { printf '\n==> %s\n' "$1"; }

step "Format (prettier --check)"
npm run --silent format:check

step "Types and content schema (astro check)"
npm run --silent check

step "Build (fails on bad site data or a missing screenshot)"
npm run --silent build

# CLAUDE.md bans em dashes everywhere. Written as UTF-8 bytes so this file
# doesn't contain one, and so it works in any locale. The empty excludesFile
# drops a global gitignore, so new files it hides (like .claude/) are scanned
# too, as Prettier checks them; the repo's .gitignore still applies.
step "No em dashes in tracked or new files"
set +e
git -c core.excludesFile= grep --untracked -n -I $'\xe2\x80\x94' -- . ':!package-lock.json'
status=$?
set -e
case $status in
  0)
    echo "Em dashes found (above). Rewrite with a comma, colon or full stop." >&2
    exit 1
    ;;
  1) echo "none" ;;
  *)
    echo "git grep failed with exit $status" >&2
    exit "$status"
    ;;
esac

printf '\nAll checks passed.\n'
