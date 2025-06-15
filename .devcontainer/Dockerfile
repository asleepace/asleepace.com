FROM ubuntu:23.10

# Install essential packages
RUN apt-get update && apt-get install -y \
    zsh \
    curl \
    git \
    build-essential \
    sudo \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create vscode user
RUN useradd -m -s /bin/zsh vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install MongoDB
RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add - && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org && \
    rm -rf /var/lib/apt/lists/*

# Configure MongoDB
RUN mkdir -p /data/db && \
    chown -R mongodb:mongodb /data/db

# Switch to vscode user
USER vscode
WORKDIR /home/vscode

# Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install ASDF v16.0+
RUN git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.16.0

# Configure ASDF for ZSH (v16.0+ method)
RUN echo '# ASDF Configuration' >> ~/.zshrc && \
    echo 'export PATH="${ASDF_DATA_DIR:-$HOME/.asdf}/shims:$PATH"' >> ~/.zshrc && \
    echo '' >> ~/.zshrc && \
    echo '# ASDF completions' >> ~/.zshrc && \
    echo 'fpath=(${ASDF_DATA_DIR:-$HOME/.asdf}/completions $fpath)' >> ~/.zshrc && \
    echo 'autoload -Uz compinit && compinit' >> ~/.zshrc

# Set up ASDF completions
RUN mkdir -p "${HOME}/.asdf/completions" && \
    ~/.asdf/bin/asdf completion zsh > "${HOME}/.asdf/completions/_asdf"

# Install Node.js via ASDF
RUN ~/.asdf/bin/asdf plugin add nodejs && \
    ~/.asdf/bin/asdf install nodejs latest && \
    ~/.asdf/bin/asdf global nodejs latest

# Install PM2 (using the shim path)
RUN export PATH="${HOME}/.asdf/shims:$PATH" && npm install -g pm2

# Set zsh as default shell
USER root
RUN chsh -s /bin/zsh vscode

USER vscode
WORKDIR /workspace

# Add helpful aliases to .zshrc
RUN echo '' >> ~/.zshrc && \
    echo '# Custom aliases' >> ~/.zshrc && \
    echo 'alias ll="ls -la"' >> ~/.zshrc && \
    echo 'alias mongodb-start="sudo service mongodb start"' >> ~/.zshrc && \
    echo 'alias mongodb-stop="sudo service mongodb stop"' >> ~/.zshrc && \
    echo 'alias mongodb-status="sudo service mongodb status"' >> ~/.zshrc