@echo off
setlocal

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL%==0 (
    echo Java is already installed, skipping Java installation.
) else (
    echo Java is not installed, use dependencies instead.
    icacls backend\dependencies\jdk_windows\bin\java.exe /grant *S-1-5-32-544:F
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL%==0 (
    echo Node.js is already installed, skipping Node.js installation.
) else (
    echo Node.js is not installed, installing dependencies.
    REM Install Chocolatey if not installed
    where choco >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    )
    choco install -y curl git
    curl -fsSL https://fnm.vercel.app/install | bash

    REM Add FNM to PATH
    setx FNM_DIR "%USERPROFILE%\.fnm"
    call "%USERPROFILE%\.fnm\fnm" env --use-on-cd

    REM Install Node.js version 22 using fnm
    call "%USERPROFILE%\.fnm\fnm" install 22
    call "%USERPROFILE%\.fnm\fnm" use 22
    call npm install -g pnpm
)

REM Run frontend setup
cd frontend
call pnpm install
start /b call pnpm dev > pnpm.log 2>&1
cd ..

REM Check if Go is installed
where go >nul 2>nul
if %ERRORLEVEL%==0 (
    echo GoLang is already installed, skipping GoLang installation.
    cd backend
    go run main.go
) else (
    if exist backend\dependencies\go\bin\go.exe (
        echo GoLang is already downloaded, skipping GoLang installation.
        cd backend
        backend\dependencies\go\bin\go run main.go
    ) else (
        echo GoLang is not installed, download archive instead.
        curl -O https://dl.google.com/go/go1.22.4.windows-amd64.zip
        powershell -Command "Expand-Archive -Path go1.22.4.windows-amd64.zip -DestinationPath backend\dependencies\"
        del go1.22.4.windows-amd64.zip
        cd backend
        backend\dependencies\go\bin\go run main.go
    )
)

endlocal
pause
