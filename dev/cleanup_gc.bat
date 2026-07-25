@echo off
cd /d C:\Users\1\github-pr\agent-meow
echo === Remove backup refs ===
for /f "delims=" %%r in ('git for-each-ref --format="%%(refname)" refs/original/') do git update-ref -d "%%r"
echo.
echo === Expire reflog ===
git reflog expire --expire=now --all
echo.
echo === GC ===
git gc --prune=now --aggressive 2>&1
echo.
echo === Check large file ===
git rev-list --objects --all | findstr graph.json
echo DONE