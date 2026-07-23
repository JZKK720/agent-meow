@echo off
cd /d C:\Users\1\github-pr\agent-meow
echo === TRACKED CHANGES ===
git status --short | findstr /b /c:" M" /c:"M " /c:" D" /c:"D " /c:"A " /c:" A"
echo === UNTRACKED COUNT ===
git status --short | findstr /b /c:"??" | find /c "??"
echo === DONE ===
