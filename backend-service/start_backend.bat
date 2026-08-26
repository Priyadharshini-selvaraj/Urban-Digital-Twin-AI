@echo off
echo ====================================================
echo   Urban Digital Twin AI - Spring Boot Backend
echo   Port:      http://localhost:8081
echo   Upload:    http://localhost:8081/api/v1/models/upload-skp
echo   Database:  MySQL 8.0 ^> urbantwindb
echo ====================================================
cd /d "%~dp0"

:: Use system-installed JDK 17
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=C:\Program Files\Java\jdk-17\bin;%PATH%

echo [OK] Using JDK 17 at %JAVA_HOME%
echo [OK] MySQL database: urbantwindb on localhost:3306
echo.
echo Starting Spring Boot backend...
echo (Wait ~60 seconds for "Started SpringBootSecurityJwtApplication")
echo.

call mvnw.cmd spring-boot:run
pause
