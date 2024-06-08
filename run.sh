# Function to install and setup Node.js using fnm
install_node() {
    curl -fsSL https://fnm.vercel.app/install | bash
    if [ "$OSTYPE" = "darwin" ]; then
        CONFIG_FILE="$HOME/.zshrc"
    else
        CONFIG_FILE="$HOME/.bashrc"
    fi
    cat <<EOT >>"$CONFIG_FILE"
export FNM_DIR="\$HOME/.local/share/fnm"
[[ -s "\$FNM_DIR/fnm" ]] && eval "\$(fnm env --use-on-cd)"
EOT
    source "$CONFIG_FILE"
    fnm install 22
    fnm use 22
    npm install -g pnpm
}

# Detect the operating system
if [ "$(uname)" = "Darwin" ]; then
    OS="macOS"
    JDK_PATH="./backend/dependencies/jdk_mac/bin/java"
    GO_TAR_URL="https://dl.google.com/go/go1.22.4.darwin-amd64.tar.gz"
    CONFIG_FILE="$HOME/.zshrc"
else
    OS="Linux"
    JDK_PATH="./backend/dependencies/jdk_linux/bin/java"
    GO_TAR_URL="https://dl.google.com/go/go1.22.4.linux-amd64.tar.gz"
    CONFIG_FILE="$HOME/.bashrc"
fi

# Check if Java is installed
case $(command -v java) in
    "")
        echo "Java is not installed, use dependencies instead."
        sudo chmod +x $JDK_PATH
        ;;
    *)
        echo "Java is already installed, skipping Java installation."
        ;;
esac

# Check if Node.js is installed
case $(command -v node) in
    "")
        if [ "$OS" = "macOS" ]; then
            # Install Homebrew if not installed
            if ! command -v brew >/dev/null 2>&1; then
                echo "Homebrew is not installed. Installing Homebrew."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew update
            brew install curl git
        else
            sudo apt-get update && sudo apt-get install -y curl git
        fi
        install_node
        ;;
    *)
        echo "Node.js is already installed, skipping Node.js installation."
        ;;
esac

# Run frontend setup
(cd frontend && pnpm install && pnpm dev >pnpm.log 2>&1) &

# Check if Go is installed
case $(command -v go) in
    "")
    if ! command -v go >/dev/null 2>&1 || ! find ./backend/dependencies/ -maxdepth 1 -name "go*" >/dev/null 2>&1; then
        echo "GoLang is not installed or downloaded, download archive instead."
        curl -O $GO_TAR_URL
        tar -C ./backend/dependencies/ -xzf $(basename $GO_TAR_URL)
        cd backend && ./dependencies/go/bin/go run main.go
    else
        echo "GoLang is already installed or downloaded, skipping GoLang installation."
        cd backend && go run main.go
    fi
        ;;
    *)
        echo "GoLang is already installed, skipping GoLang installation."
        cd backend && go run main.go
        ;;
esac
