# Misc

This directory contains miscellaneous files and scripts from various sources.

## Memory Management

This section is dedicated to memory management and how to optimize memory usage on the server.

```bash
# check disk space usage
df -h

# check swap memory
free -h

# check memory usage
htop

# interfactive memory explorer (not-installed by default)
sudo ncdu /

# check journalctl memory usage
journalctl --disk-usage

# clear old journalctl logs
journalctl --vacuum-time=3d

# check application memory usage
pm2 monit

# Clean package manager cache
apt-get clean
apt-get autoremove

# download `ncdu` to check detailed memory usage
sudo apt-get install ncdu
sudo ncdu /
sudo ncdu /var
sudo ncdu /var/log

# clear Bun cache
sudo rm -rf /root/.bun/install/cache/*
sudo rm -rf /usr/local/share/.cache

# check if an application was killed by OOM
dmesg | grep -i kill

# check largest directories/files
du -hs /* | sort -rh | head -n 10

# find large files (100MB+)
find / -type f -size +100M -exec ls -lh {} \;

# Find large node_modules, dist & build directories
find / -type d -name "node_modules" -exec du -sh {} \;
find / -type d -name "dist" -exec du -sh {} \;
find / -type d -name "build" -exec du -sh {} \;

# look for large log files
find /var/log -type f -size +100M
```

## Swap File

This was one of the most important changes which helped fix the OOM memory issues I was seeing while run `bun run build`, for some reason it wasn't enabled by default.

```bash
# Remove old swapfile
sudo swapoff /swapfile
sudo rm /swapfile

# Create new one with proper permissions (2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verify it's working
free -h
```

## Journalctl

This is a log management system that is used to store logs from various services, but can also destroy the your storage if not managed properly.

```bash
# check journalctl memory usage
journalctl --disk-usage

# clear old journalctl logs
journalctl --vacuum-time=3d

# set max log size
sudo nano /etc/systemd/journald.conf

# edit items listed below
# SystemMaxUse=500M
# SystemMaxFileSize=50M

# restart journalctl
sudo systemctl restart systemd-journald
```

add the following to the file:

```conf
# file: /etc/systemd/journald.conf
SystemMaxUse=500M
SystemMaxFileSize=50M
```
