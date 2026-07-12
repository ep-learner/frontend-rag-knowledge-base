# Quick Start - Start frontend and backend with one click
# Usage: Right-click in project root -> Open in Terminal -> Run .\dev.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend RAG Knowledge Base - Starting" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root "server"
$clientDir = Join-Path $root "client"

# Check node_modules
if (-not (Test-Path (Join-Path $serverDir "node_modules"))) {
    Write-Host "[1/3] Installing server dependencies..." -ForegroundColor Yellow
    Set-Location $serverDir
    pnpm install
    Write-Host "Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[1/3] Server dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path (Join-Path $clientDir "node_modules"))) {
    Write-Host "[2/3] Installing client dependencies..." -ForegroundColor Yellow
    Set-Location $clientDir
    pnpm install
    Write-Host "Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[2/3] Client dependencies already installed" -ForegroundColor Green
}

Write-Host "[3/3] Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start server (new window)
$serverProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$serverDir'; pnpm dev" -PassThru

# Start client (new window)
$clientProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$clientDir'; pnpm dev" -PassThru

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Closing this window will NOT stop the services." -ForegroundColor Yellow
Write-Host "  To stop, close the two PowerShell windows that opened." -ForegroundColor Yellow
Write-Host ""

Set-Location $root
