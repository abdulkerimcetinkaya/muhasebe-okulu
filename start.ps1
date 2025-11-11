# MuhasebeOkulu - PowerShell Startup Script
# Loads environment variables from .env and starts the application

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MuhasebeOkulu - Muhasebe Egitim Platformu" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "[ERROR] .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with required configuration."
    Write-Host "See .env.example for template."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[INFO] Loading environment variables from .env file..." -ForegroundColor Yellow

# Read .env file and set environment variables
Get-Content ".env" | ForEach-Object {
    $line = $_.Trim()
    # Skip comments and empty lines
    if ($line -and !$line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  Set $key" -ForegroundColor Gray
        }
    }
}

# Set JAVA_HOME if not already set
if (![Environment]::GetEnvironmentVariable("JAVA_HOME", "Process")) {
    if (Test-Path "C:\Program Files\Java\jdk-25") {
        $env:JAVA_HOME = "C:\Program Files\Java\jdk-25"
        Write-Host "[INFO] JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
    } elseif (Test-Path "C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.3\jbr") {
        $env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.3\jbr"
        Write-Host "[INFO] JAVA_HOME set to IntelliJ bundled JBR" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Java not found! Please install JDK or set JAVA_HOME manually." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "[OK] Environment variables loaded successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  - Database URL: $env:DB_URL"
Write-Host "  - Database User: $env:DB_USERNAME"
Write-Host "  - Database Password: **** (hidden)"
Write-Host "  - JWT Secret: **** (hidden)"
Write-Host "  - Server Port: $env:SERVER_PORT"
Write-Host "  - Java Home: $env:JAVA_HOME"
Write-Host ""

Write-Host "[INFO] Starting Spring Boot application..." -ForegroundColor Yellow
Write-Host ""

# Start the application
& .\mvnw.cmd spring-boot:run

# Check exit code
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Application failed to start! Exit code: $LASTEXITCODE" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit $LASTEXITCODE
}
