# Deployment Guide

## 1. Server Preparation

```bash
sudo apt update
sudo apt install -y nginx mariadb-server
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

## 2. Database Setup

```bash
mysql -utestuser -p1234 pfm_ledger < /var/zzz/pfm-ledger/schema.sql
```

## 3. Environment Variables

Create `.env.local` with:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=testuser
DB_PASSWORD=1234
DB_NAME=pfm_ledger
JWT_SECRET=change-this-in-production
NEXT_PUBLIC_APP_NAME=Pocket Ledger
```

## 4. Application Start

```bash
npm install
npm run build
npm start
```

Default service port:

```bash
3000
```

Health check:

```bash
/api/health
```

## 5. Nginx Reverse Proxy

Example:

```nginx
server {
    server_name your-domain.example;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 6. Cloudflare

- Point the domain to the VM public IP
- Enable proxy mode if needed
- Set SSL mode to `Full` or `Full (strict)`
- Confirm `/api/health` returns `status: ok`
