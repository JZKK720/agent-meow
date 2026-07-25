@echo off
cd /d C:\Users\1\github-pr\agent-meow
del /f /q .git\index.lock 2>nul

echo === ADD LOG FILES TO GITIGNORE ===
echo dev/web_output*.log>> .gitignore
echo dev/gateway_output*.log>> .gitignore
git rm --cached dev/web_output2.log 2>nul
git rm --cached dev/web_output.log 2>nul
git rm --cached dev/gateway_output.log 2>nul
git rm --cached dev/gateway_output2.log 2>nul
git rm --cached dev/gateway_output3.log 2>nul
git add .gitignore
git commit -s -m "chore: gitignore dev log files" 2>&1

echo === STATUS ===
git status --short 2>&1

echo === FILTER BRANCH ===
set FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch graphify-out/graph.json" --prune-empty -- --all 2>&1

echo === LOG ===
git log --oneline -5

echo === CHECK FILE IN HISTORY ===
git log --oneline -- graphify-out/graph.json 2>&1

echo === DONE ===
