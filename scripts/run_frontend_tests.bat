@echo off
setlocal enabledelayedexpansion

echo ======================================
echo Running Frontend Test Suite
echo ======================================

cd frontend

echo.
echo Step 1: Installing dependencies...
npm install

echo.
echo Step 2: Running tests with coverage...
npm run test:coverage

echo.
echo ======================================
echo Frontend test suite completed!
echo ======================================
echo.
echo Coverage report generated at: frontend\coverage\index.html

endlocal
