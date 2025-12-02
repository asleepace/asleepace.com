# Postgres Database

Initialize the database root user and password:

```bash
# Connect to PostgreSQL 18
sudo -u postgres psql -p 5433

# Then run these commands (use password in .env)
CREATE DATABASE asleepace;
CREATE USER asleepace_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE asleepace TO asleepace_user;

# Grant schema privileges (needed for PG 15+)
\c asleepace
GRANT ALL ON SCHEMA public TO asleepace_user;
\q
```

Setup the database to accept remote connections:

```bash
sudo nano /etc/postgresql/18/main/postgresql.conf

# then add this line
listen_addresses = '*'
```

Then also edit the `pg_hba.conf` to accept remote connections:

```bash
sudo nano /etc/postgresql/18/main/pg_hba.conf

#Scroll to the bottom where you'll see sections like:
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
# local   all             all                                     peer

# IPv4 local connections:
# host    all             all             127.0.0.1/32            scram-sha-256

# --- Replace the IPv4 section with: ---

# IPv4 local connections:
host    asleepace       asleepace_user  0.0.0.0/0              scram-sha-256
host    all             postgres        127.0.0.1/32           scram-sha-256

# Then save and restart
sudo systemctl restart postgresql

# Then open the firewall
sudo ufw allow 5433/tcp
```
