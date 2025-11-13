@echo off
REM Temporary test runner script with explicit JAVA_HOME

echo Setting JAVA_HOME...
for /f "tokens=*" %%i in ('powershell -Command "(Get-Command java).Path"') do set JAVA_EXE=%%i
for %%i in ("%JAVA_EXE%") do set JAVA_BIN=%%~dpi
for %%i in ("%JAVA_BIN%..") do set JAVA_HOME=%%~fi

echo JAVA_HOME=%JAVA_HOME%
echo.

echo Running JUnit tests...
call mvnw.cmd test

echo.
echo Test execution completed with exit code: %ERRORLEVEL%
exit /b %ERRORLEVEL%
