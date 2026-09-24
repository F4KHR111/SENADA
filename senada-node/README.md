# senada-node — Backend API SENADA

Backend REST API untuk sistem pengadaan barang/jasa **SENADA**, dibangun dengan Node.js + Express + Sequelize + MySQL.

---

## Prasyarat

| Tools | Versi minimum | Catatan |
|---|---|---|
| Node.js | 18 LTS | |
| XAMPP | Bebas | Pastikan **Apache** & **MySQL** di-start |
| Git | Bebas | |

---

## Persiapan Awal

### 1. Clone & Install Dependencies

```bash
cd senada-node
npm install
```

### 2. Buat File `.env`

Salin dari template lalu isi nilainya:

```bash
cp .env.example .env
```

Buka `.env` dan isi minimal variabel berikut:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=senada_db
DB_USER=root
DB_PASSWORD=          # kosongkan jika XAMPP default (tanpa password)

JWT_ACCESS_SECRET=isi_dengan_string_acak_panjang
JWT_REFRESH_SECRET=isi_dengan_string_acak_berbeda
ADMIN_DEFAULT_PASSWORD=password_admin_default_untuk_seeder
```

> **Tips**: Generate secret yang kuat, contoh via terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### 3. Buat Database `senada_db` via phpMyAdmin

Sebelum menjalankan migration, database harus dibuat terlebih dahulu secara manual:

1. **Buka XAMPP Control Panel** → klik **Start** pada `Apache` dan `MySQL`.
2. **Buka browser** → akses **http://localhost/phpmyadmin**.
3. Di panel kiri, klik **New** (atau tombol `+` di sidebar).
4. Pada kolom **Database name**, ketik: `senada_db`
5. Pada dropdown **Collation**, pilih: **`utf8mb4_unicode_ci`**
   > Wajib `utf8mb4` agar mendukung karakter Unicode lengkap (emoji, aksara khusus, dst).
6. Klik tombol **Create**.

Database `senada_db` sekarang muncul di sidebar kiri phpMyAdmin.

> **Alternatif via MySQL CLI** (jika lebih suka terminal XAMPP Shell):
> ```sql
> CREATE DATABASE senada_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```

---

### 4. Jalankan Migration & Seeder

Setelah database dibuat dan `.env` terisi:

```bash
# Jalankan semua migration (buat semua tabel)
npm run db:migrate

# Isi data awal: roles, permissions, role_permissions, akun admin
npm run db:seed:all
```

Rollback jika perlu:

```bash
npm run db:migrate:undo   # undo satu migration terakhir
# atau
npx sequelize-cli db:migrate:undo:all  # undo semua
```

---

## Menjalankan Server

```bash
# Development (auto-restart dengan nodemon)
npm run dev

# Production
npm start
```

Server berjalan di: **http://localhost:5000**

Health check: **GET http://localhost:5000/health**

---

## Struktur Folder

```
senada-node/
├── server.js               # Entry point
├── .env.example            # Template environment variables
├── .sequelizerc            # Path config untuk sequelize-cli
└── src/
    ├── app.js              # Express app (middleware, routes)
    ├── config/
    │   ├── config.js       # Config sequelize-cli (baca dari .env)
    │   ├── db.js           # Sequelize instance (dipakai app)
    │   ├── env.js          # Centralized env variables
    │   └── cors.js         # CORS options
    ├── models/             # Sequelize models
    │   └── index.js        # Model loader & associations
    ├── migrations/         # Sequelize migration files
    ├── seeders/            # Sequelize seeder files
    ├── controllers/        # Request handlers (thin layer)
    ├── routes/             # Express router per modul
    ├── middlewares/
    │   ├── auth.middleware.js        # Verifikasi JWT
    │   ├── rbac.middleware.js        # Cek permission granular
    │   ├── validate.middleware.js    # Validasi input (Zod)
    │   ├── rateLimiter.middleware.js # Rate limiting
    │   └── errorHandler.middleware.js# Centralized error handler
    ├── services/           # Business logic (dipanggil controller)
    ├── utils/
    │   └── logger.js       # Winston logger
    └── audit/
        └── auditLogger.js  # Audit trail ke tabel audit_logs
```

---

## Konvensi Kode

Lihat [AGENTS.md](../AGENTS.md) di root project untuk panduan lengkap:
- §3 Struktur Folder
- §5 RBAC & Permission Matrix
- §8 Konvensi Kode
- §10 Skema Database & Strategi Migrasi

### Format API Response

```json
// Sukses
{ "success": true, "data": {}, "message": "" }

// Error
{ "success": false, "message": "", "errors": [] }
```

---

## npm Scripts

| Script | Perintah | Keterangan |
|---|---|---|
| `npm run dev` | `nodemon server.js` | Development server (auto-restart) |
| `npm start` | `node server.js` | Production server |
| `npm run db:migrate` | `sequelize-cli db:migrate` | Jalankan migration |
| `npm run db:migrate:undo` | `sequelize-cli db:migrate:undo` | Rollback 1 migration |
| `npm run db:seed:all` | `sequelize-cli db:seed:all` | Jalankan semua seeder |
| `npm run db:seed:undo:all` | `sequelize-cli db:seed:undo:all` | Rollback semua seeder |
