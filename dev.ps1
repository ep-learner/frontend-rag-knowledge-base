# Quick Start - 一键启动前后端
# 用法：在项目根目录右键 → 在终端中打开 → 运行 .\dev.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend RAG Knowledge Base - 启动中" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root "server"
$clientDir = Join-Path $root "client"

# 检查 node_modules
if (-not (Test-Path (Join-Path $serverDir "node_modules"))) {
    Write-Host "[1/3] 安装后端依赖..." -ForegroundColor Yellow
    Set-Location $serverDir
    pnpm install
    Write-Host "后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "[1/3] 后端依赖已安装" -ForegroundColor Green
}

if (-not (Test-Path (Join-Path $clientDir "node_modules"))) {
    Write-Host "[2/3] 安装前端依赖..." -ForegroundColor Yellow
    Set-Location $clientDir
    pnpm install
    Write-Host "前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "[2/3] 前端依赖已安装" -ForegroundColor Green
}

Write-Host "[3/3] 启动服务..." -ForegroundColor Yellow
Write-Host ""

# 启动后端（新窗口）
$serverProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$serverDir'; pnpm dev" -PassThru

# 启动前端（新窗口）
$clientProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$clientDir'; pnpm dev" -PassThru

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  服务启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  前端地址: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  后端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  API 文档: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  按 Ctrl+C 关闭此窗口不会停止服务" -ForegroundColor Yellow
Write-Host "  要停止服务请关闭弹出的两个 PowerShell 窗口" -ForegroundColor Yellow
Write-Host ""

Set-Location $root
