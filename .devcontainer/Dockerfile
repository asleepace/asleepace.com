FROM ubuntu:24.04

# Install essential packages and NGINX
RUN apt-get update && apt-get install -y \
    zsh \
    curl \
    git \
    build-essential \
    sudo \
    wget \
    unzip \
    ca-certificates \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Create cursor user
RUN useradd -m -s /bin/zsh cursor && \
    echo "cursor ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Copy and configure NGINX
COPY nginx-dev.conf /etc/nginx/sites-available/asleepace.local
RUN ln -s /etc/nginx/sites-available/asleepace.local /etc/nginx/sites-enabled/ && \
    rm -f /etc/nginx/sites-enabled/default

# Switch to cursor user
USER cursor
WORKDIR /home/cursor

# Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
RUN echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.zshrc

# Install PM2 using Bun
RUN /home/cursor/.bun/bin/bun install -g pm2

# Set zsh as default shell
USER root
RUN chsh -s /bin/zsh cursor

USER cursor
WORKDIR /workspace

# Add helpful aliases
RUN echo '' >> ~/.zshrc && \
    echo '# Custom aliases' >> ~/.zshrc && \
    echo 'alias ll="ls -la"' >> ~/.zshrc && \
    echo 'alias nginx-start="sudo service nginx start"' >> ~/.zshrc && \
    echo 'alias nginx-stop="sudo service nginx stop"' >> ~/.zshrc && \
    echo 'alias nginx-restart="sudo service nginx restart"' >> ~/.zshrc && \
    echo 'alias nginx-status="sudo service nginx status"' >> ~/.zshrc && \
    echo 'alias nginx-reload="sudo service nginx reload"' >> ~/.zshrc && \
    echo 'alias astro-dev="bun run dev"' >> ~/.zshrc && \
    echo 'alias logs-nginx="sudo tail -f /var/log/nginx/error.log"' >> ~/.zshrc