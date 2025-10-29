@echo off
echo Updating vaccination record vaccine names...
cd /d "%~dp0"
python update_vaccine_names.py
pause


