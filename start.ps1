# Virtual Try-On Startup Script
# This script starts both the backend and frontend servers

Write-Host "🚀 Starting Virtual Try-On Application..." -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Backend path
$BackendPath = Join-Path $ProjectRoot "skin-tone-backend\fast-api"
# Frontend path  
$FrontendPath = Join-Path $ProjectRoot "skin-tone-frontend"

# Check if backend directory exists
if (-Not (Test-Path $BackendPath)) {
    Write-Host "❌ Backend directory not found: $BackendPath" -ForegroundColor Red
    exit 1
}

# Check if frontend directory exists
if (-Not (Test-Path $FrontendPath)) {
    Write-Host "❌ Frontend directory not found: $FrontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Project root: $ProjectRoot" -ForegroundColor Gray
Write-Host "🔧 Backend path: $BackendPath" -ForegroundColor Gray
Write-Host "⚛️  Frontend path: $FrontendPath" -ForegroundColor Gray
Write-Host ""

# Function to start backend
$BackendJob = Start-Job -ScriptBlock {
    param($Path)
    Set-Location $Path
    
    # Activate virtual environment and start backend
    if (Test-Path ".venv\Scripts\Activate.ps1") {
        & ".venv\Scripts\Activate.ps1"
        uvicorn main:app --reload
    } elseif (Test-Path "..\..\venv\Scripts\Activate.ps1") {
        & "..\..\venv\Scripts\Activate.ps1"
        uvicorn main:app --reload
    } elseif (Test-Path "..\..\.venv\Scripts\Activate.ps1") {
        & "..\..\.venv\Scripts\Activate.ps1"
        uvicorn main:app --reload
    } else {
        Write-Host "Virtual environment not found. Trying to run uvicorn directly..." -ForegroundColor Yellow
        uvicorn main:app --reload
    }
} -ArgumentList $BackendPath

# Function to start frontend
$FrontendJob = Start-Job -ScriptBlock {
    param($Path)
    Set-Location $Path
    npm run dev
} -ArgumentList $FrontendPath

Write-Host "✅ Backend server starting..." -ForegroundColor Green
Write-Host "✅ Frontend server starting..." -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎯 Application is starting up!" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Backend will be available at: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "🌐 Frontend will be available at: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Magenta
Write-Host ""

# Monitor jobs and display output
try {
    while ($true) {
        # Get output from backend job
        $BackendOutput = Receive-Job -Job $BackendJob
        if ($BackendOutput) {
            Write-Host "[Backend] $BackendOutput" -ForegroundColor Blue
        }
        
        # Get output from frontend job
        $FrontendOutput = Receive-Job -Job $FrontendJob
        if ($FrontendOutput) {
            Write-Host "[Frontend] $FrontendOutput" -ForegroundColor Magenta
        }
        
        # Check if jobs are still running
        if ($BackendJob.State -eq 'Failed' -or $FrontendJob.State -eq 'Failed') {
            Write-Host "❌ One or more services failed to start" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Milliseconds 100
    }
}
finally {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $BackendJob, $FrontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $BackendJob, $FrontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "✅ All servers stopped" -ForegroundColor Green
}
