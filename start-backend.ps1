# AttendEase Backend Launcher
$mvn = "C:\Users\SUNIL\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd"
Set-Location -Path "$PSScriptRoot\backend"
Write-Host ">>> Starting AttendEase Spring Boot Backend (Port 8080)..." -ForegroundColor Cyan
& $mvn spring-boot:run
