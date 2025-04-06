# Schedule Project Cleanup Script
# This PowerShell script sets up a scheduled task to run the project cleanup utility

# Configuration
$scriptPath = Join-Path $PSScriptRoot "project-cleanup.js"
$taskName = "ProjectFileCleanup"
$taskDescription = "Runs the project file cleanup utility to maintain a clean codebase"
$scheduleFrequency = "WEEKLY" # Options: MINUTE, HOURLY, DAILY, WEEKLY, MONTHLY
$scheduleDay = "SUNDAY"       # For WEEKLY: SUNDAY, MONDAY, TUESDAY, etc.
$scheduleTime = "03:00"       # 24-hour format

# Verify Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version $nodeVersion found."
} catch {
    Write-Error "Node.js is not installed or not in PATH. Please install Node.js to use this script."
    exit 1
}

# Verify the cleanup script exists
if (-not (Test-Path $scriptPath)) {
    Write-Error "Cleanup script not found at $scriptPath. Please ensure the file exists."
    exit 1
}

# Create the scheduled task
Write-Host "Creating scheduled task '$taskName'..."

# Building the command that will run
$command = "node `"$scriptPath`" --delete"

# Create the action
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"& { cd '$PSScriptRoot'; $command }`""

# Create the trigger based on frequency
switch ($scheduleFrequency) {
    "MINUTE" {
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1)
    }
    "HOURLY" {
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
    }
    "DAILY" {
        $trigger = New-ScheduledTaskTrigger -Daily -At $scheduleTime
    }
    "WEEKLY" {
        # Convert day string to DayOfWeek
        $dayOfWeek = [System.DayOfWeek]::$scheduleDay
        $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $dayOfWeek -At $scheduleTime
    }
    "MONTHLY" {
        $trigger = New-ScheduledTaskTrigger -Monthly -DaysOfMonth 1 -At $scheduleTime
    }
    default {
        $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At $scheduleTime
    }
}

# Create principal (run with current user privileges)
$principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType S4U

# Create the task settings
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Register the task
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description $taskDescription -Force
    Write-Host "Task '$taskName' created successfully. It will run $scheduleFrequency on $scheduleDay at $scheduleTime."
} catch {
    Write-Error "Failed to create scheduled task: $_"
    exit 1
}

Write-Host "Done!" 