#!/bin/sh

# Start pnpm dev in the background for frontend
(cd frontend && pnpm install && pnpm dev) &

# Run backend in the current shell
cd backend
go run main.go