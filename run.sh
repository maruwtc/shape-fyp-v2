#!/bin/sh
sudo apt-get update && sudo apt-get install -y curl git
if command -v node >/dev/null 2>&1; then
    echo "Node.js is already installed, skipping Node.js installation."
else
    curl -fsSL https://fnm.vercel.app/install | bash
    cat <<EOT >>~/.bashrc
export FNM_DIR="$HOME/.local/share/fnm"
[[ -s "$FNM_DIR/fnm" ]] && eval "$(fnm env --use-on-cd)"
EOT
    source ~/.bashrc
    fnm install 22
    fnm use 22
    npm install -g pnpm

fi
(cd frontend && pnpm install && pnpm next build && pnpm dev >pnpm.log 2>&1) &
if command -v go >/dev/null 2>&1; then
    echo "GoLang is already installed, skipping GoLang installation."
    cd backend && go run main.go
else
    echo "GoLang is not installed, download archive instead."
    curl -O https://dl.google.com/go/go1.22.4.linux-amd64.tar.gz
    tar -C ./backend/dependencies/ -xzf go1.22.4.linux-amd64.tar.gz
    cd backend && ./dependencies/go/bin/go run main.go
fi