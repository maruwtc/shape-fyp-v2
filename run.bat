@echo off

rem Start pnpm dev in the background for frontend
start cmd /c "cd frontend && pnpm install && pnpm dev"

rem Run backend in the current window
cd backend
go run main.go