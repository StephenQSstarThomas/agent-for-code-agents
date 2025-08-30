# Agent for Code Agents PowerShell Starter
param(
    [switch]$SkipBrowser,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Agent for Code Agents Starter

Usage:
  .\start.ps1                # Start all services and open browser
  .\start.ps1 -SkipBrowser   # Start services without opening browser
  .\start.ps1 -Help          # Show this help

Services:
  - Backend: http://localhost:8002
  - Frontend: http://localhost:3000
"@
    exit 0
}

# Set console title
$Host.UI.RawUI.WindowTitle = "Agent for Code Agents - AI Workflow System"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host " Agent for Code Agents Starter" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if conda is available and environment is active
$condaEnv = $env:CONDA_DEFAULT_ENV
if ($condaEnv) {
    Write-Host "✓ Conda environment '$condaEnv' is active" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: No conda environment detected" -ForegroundColor Yellow
    Write-Host "  Consider running: conda activate daily" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Agent for Code Agents..." -ForegroundColor Yellow
Write-Host ""

try {
    # Start backend in background
    Write-Host "[1/3] Starting Backend Server (Port 8002)..." -ForegroundColor Blue
    $backendProcess = Start-Process -FilePath "python" -ArgumentList "simple_backend.py" -PassThru -WindowStyle Normal
    Start-Sleep 3

    # Check if backend started successfully
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8002/" -TimeoutSec 5 -UseBasicParsing
        Write-Host "✓ Backend started successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Backend failed to start" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    # Start frontend in background  
    Write-Host "[2/3] Starting Frontend Server (Port 3000)..." -ForegroundColor Blue
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -PassThru -WindowStyle Normal
    Start-Sleep 5

    # Check if frontend started successfully
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 10 -UseBasicParsing
        Write-Host "✓ Frontend started successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Frontend may still be starting..." -ForegroundColor Yellow
    }

    # Open browser
    if (-not $SkipBrowser) {
        Write-Host "[3/3] Opening browser..." -ForegroundColor Blue
        Start-Process "http://localhost:3000"
        Write-Host "✓ Browser opened" -ForegroundColor Green
    } else {
        Write-Host "[3/3] Skipping browser (use -SkipBrowser flag)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host " All services started!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend:  http://localhost:8002" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Process IDs:" -ForegroundColor Gray
    Write-Host "  Backend:  $($backendProcess.Id)" -ForegroundColor Gray
    Write-Host "  Frontend: $($frontendProcess.Id)" -ForegroundColor Gray
    Write-Host ""

    # Interactive menu
    do {
        Write-Host "Available Commands:" -ForegroundColor Yellow
        Write-Host "  1 - Open Frontend" -ForegroundColor White
        Write-Host "  2 - Open Backend API" -ForegroundColor White
        Write-Host "  3 - Show Service Status" -ForegroundColor White
        Write-Host "  4 - Stop All Services" -ForegroundColor White
        Write-Host "  0 - Exit" -ForegroundColor White
        Write-Host ""
        
        $choice = Read-Host "Enter your choice (0-4)"
        
        switch ($choice) {
            "1" { 
                Start-Process "http://localhost:3000"
                Write-Host "✓ Frontend opened" -ForegroundColor Green
            }
            "2" { 
                Start-Process "http://localhost:8002"
                Write-Host "✓ Backend API opened" -ForegroundColor Green
            }
            "3" {
                Write-Host ""
                Write-Host "Checking service status..." -ForegroundColor Yellow
                
                # Check backend
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:8002/" -TimeoutSec 3 -UseBasicParsing
                    Write-Host "Backend:  ✓ ONLINE" -ForegroundColor Green
                } catch {
                    Write-Host "Backend:  ✗ OFFLINE" -ForegroundColor Red
                }
                
                # Check frontend
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 3 -UseBasicParsing
                    Write-Host "Frontend: ✓ ONLINE" -ForegroundColor Green
                } catch {
                    Write-Host "Frontend: ✗ OFFLINE" -ForegroundColor Red
                }
                Write-Host ""
            }
            "4" {
                Write-Host ""
                Write-Host "Stopping all services..." -ForegroundColor Yellow
                
                # Stop processes
                if ($backendProcess -and !$backendProcess.HasExited) {
                    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "✓ Backend stopped" -ForegroundColor Green
                }
                
                if ($frontendProcess -and !$frontendProcess.HasExited) {
                    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "✓ Frontend stopped" -ForegroundColor Green
                }
                
                # Kill any remaining processes
                Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "python" } | Stop-Process -Force -ErrorAction SilentlyContinue
                Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
                
                Write-Host "All services stopped." -ForegroundColor Green
                Start-Sleep 2
                break
            }
            "0" {
                Write-Host ""
                Write-Host "Services are still running in background." -ForegroundColor Yellow
                Write-Host "Use option 4 to stop them, or close their windows manually." -ForegroundColor Yellow
                break
            }
            default {
                Write-Host "Invalid choice. Please enter 0-4." -ForegroundColor Red
            }
        }
        
        if ($choice -ne "0" -and $choice -ne "4") {
            Write-Host ""
        }
        
    } while ($choice -ne "0" -and $choice -ne "4")

} catch {
    Write-Host ""
    Write-Host "Error starting services: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Thank you for using Agent for Code Agents!" -ForegroundColor Cyan
Start-Sleep 2
