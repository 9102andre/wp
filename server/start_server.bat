@echo off
REM ─── Hospitally AI ── Python Scraper Server ───
REM Starts the FastAPI scraper backend using the local virtual environment.

cd /d "%~dp0"

echo [*] Checking virtual environment...
if not exist ".venv\Scripts\activate.bat" (
    echo [!] Virtual environment not found. Creating one...
    python -m venv .venv
    .venv\Scripts\pip.exe install --upgrade pip
    .venv\Scripts\pip.exe install -r requirements.txt
) else (
    echo [OK] Virtual environment found.
)

echo [*] Starting FastAPI scraper on http://localhost:8000 ...
.venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload
