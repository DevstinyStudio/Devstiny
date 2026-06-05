# Deployment Guide — Devstiny

Stack: **NestJS 11** (backend, port 4000) · **Next.js 16** (frontend, port 4001) · **PostgreSQL** · **Resend** (email)

---

## Prerequisites

- Node.js ≥ 20
- PostgreSQL database (cloud or VPS)
- Resend account with `devstiny.com` domain verified
- Domain pointed to server (for HTTPS/reverse proxy)

---

## 1. Clone & Install

```bash
git clone <repo-url> devstiny
cd devstiny

# Backend
cd backend-devstiny
npm install

# Frontend
cd ../frontend-devstiny
npm install
```

---

## 2. Environment Variables

### Backend — `backend-devstiny/.env`

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/devstiny?schema=public"
JWT_SECRET="<random-long-string-min-32-chars>"
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
FRONTEND_URL="https://devstiny.com"
```

> **JWT_SECRET**: Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Frontend — `frontend-devstiny/.env.local`

```env
NEXT_PUBLIC_API_URL="https://api.devstiny.com"
```

> Sesuaikan URL dengan domain backend Anda. Jika backend dan frontend di server yang sama, bisa pakai `https://devstiny.com/api` (dengan reverse proxy).

---

## 3. Database Setup

```bash
cd backend-devstiny

# Push schema ke database production
npx prisma db push

# Generate Prisma client
npx prisma generate
```

---

## 4. Import Data Konten

Import data konten dari export database lokal (lebih lengkap dari seed script):

```bash
psql "postgresql://<user>:<password>@<host>:5432/devstiny" < content-export.sql
```

> File `content-export.sql` tidak disertakan di repo (ada di `.gitignore`). Transfer manual ke server production sebelum menjalankan perintah di atas.
>
> Alternatif jika tidak punya file export: jalankan `npx ts-node --esm prisma/seed-prod.ts` sebagai fallback (data lebih sedikit).

---

## 5. Buat Akun Admin

```bash
ADMIN_EMAIL=admin@devstiny.com \
ADMIN_PASSWORD=PasswordKuat123! \
ADMIN_USERNAME=admin \
npx ts-node --esm prisma/create-admin.ts
```

> - `ADMIN_PASSWORD` minimal 12 karakter
> - `ADMIN_USERNAME` opsional, default: `admin`
> - Jika akun sudah ada (email/username sama), script otomatis upgrade role ke `ADMIN`

---

## 6. Build

### Backend

```bash
cd backend-devstiny
npm run build
# Output: dist/
```

### Frontend

```bash
cd frontend-devstiny
npm run build
# Output: .next/
```

---

## 7. Jalankan di Production

### Menggunakan PM2 (direkomendasikan)

```bash
npm install -g pm2

# Backend
cd backend-devstiny
pm2 start dist/main.js --name devstiny-api

# Frontend
cd ../frontend-devstiny
pm2 start npm --name devstiny-web -- start

# Simpan konfigurasi PM2
pm2 save
pm2 startup
```

### Tanpa PM2

```bash
# Backend (port 4000)
cd backend-devstiny
npm run start:prod

# Frontend (port 4001)
cd frontend-devstiny
npm start
```

---

## 8. Reverse Proxy (Nginx)

Contoh konfigurasi Nginx untuk satu domain:

```nginx
server {
    listen 80;
    server_name devstiny.com www.devstiny.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name devstiny.com www.devstiny.com;

    ssl_certificate     /etc/letsencrypt/live/devstiny.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/devstiny.com/privkey.pem;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> Jika backend di subdomain `api.devstiny.com` terpisah, hapus blok `location /api/` dan buat server block baru untuk subdomain tersebut.

---

## 9. Urutan Deploy Ulang (Update)

Setiap kali ada perubahan kode:

```bash
git pull

# Backend
cd backend-devstiny
npm install
npx prisma db push      # hanya jika ada perubahan schema
npm run build
pm2 restart devstiny-api

# Frontend
cd ../frontend-devstiny
npm install
npm run build
pm2 restart devstiny-web
```

---

## Checklist Sebelum Go-Live

- [ ] `DATABASE_URL` mengarah ke database production
- [ ] `JWT_SECRET` sudah diganti (bukan nilai default)
- [ ] `RESEND_API_KEY` valid dan domain `devstiny.com` terverifikasi di Resend
- [ ] `FRONTEND_URL` di backend `.env` sudah sesuai domain production
- [ ] `NEXT_PUBLIC_API_URL` di frontend `.env.local` sudah sesuai
- [ ] `npx prisma db push` berhasil
- [ ] `content-export.sql` sudah diimport (atau `seed-prod.ts` sebagai fallback)
- [ ] Akun admin sudah dibuat via `create-admin.ts`
- [ ] HTTPS aktif (SSL certificate terpasang)
- [ ] Test registrasi → email verifikasi diterima
- [ ] Test forgot password → email reset diterima
- [ ] Test login dengan akun admin

---

## Variabel yang WAJIB Diganti

| Variable | Nilai Default (DEV) | Nilai Production |
|---|---|---|
| `DATABASE_URL` | `localhost:5432/devstiny` | URL database production |
| `JWT_SECRET` | `devstiny-secret-key-change-in-production` | String random 32+ karakter |
| `RESEND_API_KEY` | *(key dev)* | Key production dari Resend dashboard |
| `FRONTEND_URL` | `http://localhost:4001` | `https://devstiny.com` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | `https://api.devstiny.com` |
