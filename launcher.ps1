# College ERP Launcher
# Starts backend and frontend servers, opens browser, and provides graceful shutdown.

$Host.UI.RawUI.WindowTitle = "College ERP Launcher"

# Detect project root: works both as .ps1 script and as compiled .exe
if ($PSScriptRoot) {
    $projectRoot = $PSScriptRoot
} else {
    # When compiled with ps2exe, use the exe's own location
    $projectRoot = Split-Path -Parent ([System.Diagnostics.Process]::GetCurrentProcess().MainModule.FileName)
}

$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend\app"

# Validate directories exist
if (-not (Test-Path $backendDir)) {
    Write-Host "[ERROR] Backend directory not found: $backendDir" -ForegroundColor Red
    Write-Host "Make sure College_ERP.exe is in the project root directory."
    Read-Host "Press Enter to exit"
    exit 1
}
if (-not (Test-Path $frontendDir)) {
    Write-Host "[ERROR] Frontend directory not found: $frontendDir" -ForegroundColor Red
    Write-Host "Make sure College_ERP.exe is in the project root directory."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       College ERP - Starting Up        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c cd /d `"$backendDir`" && npm start" `
    -WindowStyle Minimized `
    -PassThru

Write-Host "       Backend PID: $($backendProcess.Id)" -ForegroundColor DarkGray

# Start Frontend
Write-Host "[2/3] Starting Frontend Dev Server..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c cd /d `"$frontendDir`" && npm run dev" `
    -WindowStyle Minimized `
    -PassThru

Write-Host "       Frontend PID: $($frontendProcess.Id)" -ForegroundColor DarkGray

# Wait for servers to start
Write-Host "[3/3] Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser
$frontendUrl = "http://localhost:5173"
Write-Host ""
Write-Host "Opening browser at $frontendUrl ..." -ForegroundColor Green
Start-Process $frontendUrl

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   College ERP is running!              " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "   Backend  : http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend : $frontendUrl" -ForegroundColor White
Write-Host ""
Write-Host "   Press ENTER to stop all servers..." -ForegroundColor Yellow
Write-Host ""

Read-Host

# Shutdown
Write-Host ""
Write-Host "Shutting down servers..." -ForegroundColor Yellow

# Kill process trees (cmd + child node processes)
function Stop-ProcessTree($processId) {
    try {
        $children = Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $processId }
        foreach ($child in $children) {
            Stop-ProcessTree $child.ProcessId
        }
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    } catch {
        # Process already exited
    }
}

if (-not $backendProcess.HasExited) {
    Stop-ProcessTree $backendProcess.Id
    Write-Host "   Backend stopped." -ForegroundColor DarkGray
}

if (-not $frontendProcess.HasExited) {
    Stop-ProcessTree $frontendProcess.Id
    Write-Host "   Frontend stopped." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "All servers stopped. Goodbye!" -ForegroundColor Green
Start-Sleep -Seconds 2
