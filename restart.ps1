# PowerShell script to restart CareerLaunchpad development environment
# This script will:
# 1. Kill any processes on ports 3001 and 5173
# 2. Start the backend server
# 3. Start the frontend server

# Configuration
$CONFIG = @{
    BackendPort = 3001
    FrontendPort = 5173
    BackendDir = Join-Path $PSScriptRoot "backend"
    ProjectRoot = $PSScriptRoot
}

# Set colors for console output
function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $originalColor
}

# Display a banner
function Show-Banner {
    Write-ColorOutput "`n==========================================" "Cyan"
    Write-ColorOutput "  CareerLaunchpad Development Environment" "Cyan"
    Write-ColorOutput "==========================================" "Cyan"
}

# Kill processes on a specific port
function Stop-ProcessOnPort {
    param (
        [Parameter(Mandatory=$true)]
        [int]$Port
    )
    
    Write-ColorOutput "Stopping any processes on port $Port..." "Yellow"
    $processes = netstat -ano | findstr ":$Port" | findstr "LISTENING"
    
    if ($processes) {
        $processes | ForEach-Object {
            $parts = $_ -split '\s+', 5
            if ($parts.Count -ge 5) {
                $processId = $parts[4]
                Write-ColorOutput "Killing process with PID: $processId on port $Port" "Yellow"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-ColorOutput "No processes found on port $Port" "Green"
    }
}

# Check if necessary directories exist
function Test-Environment {
    if (-not (Test-Path $CONFIG.BackendDir)) {
        Write-ColorOutput "Backend directory not found at $($CONFIG.BackendDir)" "Red"
        exit 1
    }
    
    # Check for .env file in backend
    $backendEnvFile = Join-Path $CONFIG.BackendDir ".env"
    if (-not (Test-Path $backendEnvFile)) {
        Write-ColorOutput "⚠️ Warning: Backend .env file not found at $backendEnvFile" "Yellow"
    }
    
    # Check for .env file in root
    $rootEnvFile = Join-Path $CONFIG.ProjectRoot ".env"
    if (-not (Test-Path $rootEnvFile)) {
        Write-ColorOutput "⚠️ Warning: Root .env file not found at $rootEnvFile" "Yellow"
    }
}

# Start the development environment
function Start-DevEnvironment {
    Show-Banner
    
    # Check environment
    Test-Environment
    
    # Kill any running processes on ports
    Stop-ProcessOnPort -Port $CONFIG.BackendPort
    Stop-ProcessOnPort -Port $CONFIG.FrontendPort
    
    Write-ColorOutput "`n🚀 Starting development environment..." "Cyan"
    
    # Start backend server
    Write-ColorOutput "`n🚀 Starting Backend API server..." "Cyan"
    $backendPath = $CONFIG.BackendDir
    Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$backendPath'; node server.js" -NoNewWindow
    
    # Wait for backend to start
    Write-ColorOutput "Waiting for backend server to initialize..." "Yellow"
    Start-Sleep -Seconds 3
    
    # Start frontend server
    Write-ColorOutput "`n🚀 Starting Frontend server..." "Cyan"
    $frontendPath = $CONFIG.ProjectRoot
    Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$frontendPath'; npm run dev" -NoNewWindow
    
    # Display access information
    Write-ColorOutput "`n✅ Development environment started!" "Green"
    Write-ColorOutput "`n📋 Access points:" "Cyan"
    Write-ColorOutput "  • Backend API: http://localhost:$($CONFIG.BackendPort)" "Cyan"
    Write-ColorOutput "  • Frontend:    http://localhost:$($CONFIG.FrontendPort)" "Cyan"
    Write-ColorOutput "`n⚠️ Note: Close the command prompt windows to stop the servers" "Yellow"
}

# Run the script
Start-DevEnvironment 