@echo off
cd /d C:\Users\1\github-pr\agent-meow
echo === STASHING ===
git stash push -u -m "pre-upstream-sync-stash-2" 2>&1
echo === MERGING ===
git merge upstream/main --no-edit 2>&1
echo === CONFLICTS ===
git diff --name-only --diff-filter=U 2>&1
echo === DONE ===
