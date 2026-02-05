@echo off
setlocal enabledelayedexpansion

echo ======================================
echo Running AI Psychologist Test Suite
echo ======================================

cd backend

echo.
echo Step 1: Running unit tests...
pytest tests/ -m unit -v --cov=app --cov-report=term-missing

echo.
echo Step 2: Running integration tests...
pytest tests/ -m integration -v --cov=app --cov-report=term-missing --cov-append

echo.
echo Step 3: Running emotion recognition tests...
pytest tests/ -m emotion -v

echo.
echo Step 4: Running assessment tests...
pytest tests/ -m assessment -v

echo.
echo Step 5: Running alert tests...
pytest tests/ -m alert -v

echo.
echo Step 6: Running suggestion tests...
pytest tests/ -m suggestion -v

echo.
echo Step 7: Running chat tests...
pytest tests/ -m chat -v

echo.
echo Step 8: Generating coverage report...
pytest tests/ --cov=app --cov-report=html --cov-report=xml --cov-report=term

echo.
echo ======================================
echo Test suite completed successfully!
echo ======================================
echo.
echo Coverage report generated at: backend\htmlcov\index.html
echo Coverage XML report: backend\coverage.xml

endlocal
