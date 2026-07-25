@echo off
cd /d C:\Users\1\github-pr\agent-meow
del /f /q .git\index.lock 2>nul
git checkout -- dev/web_output2.log 2>nul
del /f /q dev\cleanup.bat dev\web_output3.log 2>nul
git status --short
echo === STATUS DONE ===
