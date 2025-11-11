@echo off
REM MuhasebeOkulu - Secure Application Startup Script
REM This script loads environment variables from .env file and starts the application

echo.
echo ================================================
echo   MuhasebeOkulu - Muhasebe Egitim Platformu
echo ================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create a .env file with required configuration.
    echo See .env.example for template.
    pause
    exit /b 1
)

echo [INFO] Loading environment variables from .env file...

REM Read .env file and set environment variables
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    set "line=%%a"
    REM Skip comments and empty lines
    if not "!line:~0,1!"=="#" (
        if not "%%a"=="" (
            set "%%a=%%b"
        )
    )
)

REM Enable delayed expansion for variable substitution
setlocal enabledelayedexpansion

REM Validate required environment variables
set "missing_vars="

if "!DB_URL!"=="" set "missing_vars=!missing_vars! DB_URL"
if "!DB_USERNAME!"=="" set "missing_vars=!missing_vars! DB_USERNAME"
if "!DB_PASSWORD!"=="" set "missing_vars=!missing_vars! DB_PASSWORD"
if "!JWT_SECRET!"=="" set "missing_vars=!missing_vars! JWT_SECRET"

if not "!missing_vars!"=="" (
    echo [ERROR] Missing required environment variables:!missing_vars!
    echo Please check your .env file configuration.
    pause
    exit /b 1
)

echo [OK] Environment variables loaded successfully
echo.

REM Set JAVA_HOME if not already set
if "!JAVA_HOME!"=="" (
    if exist "C:\Program Files\Java\jdk-25" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-25"
        echo [INFO] JAVA_HOME set to: !JAVA_HOME!
    ) else if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.3\jbr" (
        set "JAVA_HOME=C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.3\jbr"
        echo [INFO] JAVA_HOME set to IntelliJ bundled JBR: !JAVA_HOME!
    ) else (
        echo [ERROR] Java not found! Please install JDK or set JAVA_HOME manually.
        pause
        exit /b 1
    )
)

echo.
echo Configuration:
echo   - Database URL: !DB_URL!
echo   - Database User: !DB_USERNAME!
echo   - Database Password: **** (hidden)
echo   - JWT Secret: **** (hidden)
echo   - Server Port: !SERVER_PORT!
echo   - Java Home: !JAVA_HOME!
echo.

echo [INFO] Starting Spring Boot application...
echo.

REM Start the application
call mvnw.cmd spring-boot:run

REM Check exit code
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Application failed to start! Exit code: %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

endlocal
