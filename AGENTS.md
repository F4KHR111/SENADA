# AGENTS.md — SENADA (Sistem Pengadaan Barang dan Jasa)

Dokumen ini adalah panduan wajib bagi AI coding agent (Claude Code, Cursor, Copilot, dll) maupun developer manusia saat bekerja di repository ini. Ikuti aturan di sini sebelum menulis kode baru.

---

## 1. Tentang SENADA

**SENADA (Sistem Pengadaan Barang dan Jasa)** adalah aplikasi web internal untuk mendigitalisasi proses pengadaan barang/jasa instansi, mulai dari penyusunan HPS (Harga Perkiraan Sendiri), undangan ke penyedia, negosiasi harga, penerbitan SPK/Surat Pesanan, serah terima barang, hingga tautan ke proses pelaporan keuangan (SPM via SAKTI).

**Prinsip utama:**
- Tidak ada halaman yang bisa diakses tanpa login (full-authenticated app, zero public page kecuali `/login`).
- Setiap role hanya melihat & melakukan apa yang menjadi tanggung jawabnya (Role-Based Access Control).
- Setiap aksi penting (approve harga, tanda tangan SPK, setuju/tidak nego) harus tercatat di audit log — siapa, kapan, apa yang diubah.
- UI harus terasa **clean, simpel, dan premium** — bukan tampilan aplikasi pemerintahan yang berat/ramai.

---

## 2. Tech Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Frontend | **React** (Vite) | Bukan CRA, pakai Vite untuk dev speed |
| Styling | **Tailwind CSS** | Custom theme navy + putih (lihat §5) |
| State (client) | **Zustand** | Ringan, cocok untuk RBAC/session state |
| Server state / fetching | **TanStack Query (React Query)** | Caching, refetch, loading state konsisten |
| Routing | **React Router v6** | Dengan route guard per role |
| Form & validasi frontend | **React Hook Form + Zod** | Konsisten dengan validasi backend |
| Backend | **Node.js + Express** | REST API |
| Database | **MySQL (via XAMPP)** | Environment dev sekarang; siap dimigrasi ke MySQL managed di production |
| ORM | **Sequelize** | Kompatibel baik dengan MySQL/XAMPP, migration & seeder jelas. Konvensi skema lengkap di §10 (primary key UUID, tanpa `sync()`) |
| Auth | **JWT** (access token pendek, 15 menit) + **refresh token** di httpOnly cookie | Lihat §6 |
| Validasi backend | **Zod / Joi** | Semua input divalidasi sebelum masuk controller |
| Password hashing | **bcrypt** | Minimal 10 salt rounds |
| File upload (dokumen, surat jalan, dsb) | **Multer** + validasi tipe & ukuran file | Simpan di folder terpisah, jangan expose path langsung |
| Logging & audit | **Winston** (application log) + tabel `audit_logs` di DB | Wajib untuk aksi krusial |

---

## 3. Struktur Folder (Monorepo, Separation of Concerns)

```
senada/
├── senada-react/                 # Frontend React
│   ├── src/
│   │   ├── assets/
│   │   ├── components/          # Komponen reusable (Button, Card, Table, Modal, dst)
│   │   ├── layouts/             # AppLayout, AuthLayout
│   │   ├── features/            # 1 folder = 1 modul bisnis (lihat §4)
│   │   │   ├── hps/
│   │   │   ├── undangan/
│   │   │   ├── penyedia/
│   │   │   ├── negosiasi/
│   │   │   ├── spk/
│   │   │   ├── serah-terima/
│   │   │   ├── laporan/
│   │   │   └── auth/
│   │   ├── routes/               # Route guard per role
│   │   ├── services/             # API client (axios instance + endpoint per modul)
│   │   ├── store/                # Zustand stores (auth, ui)
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── styles/               # tailwind.config.js theme, global.css
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
├── senada-node/                   # Backend Node.js
│   ├── src/
│   │   ├── config/                # db.js, env.js, cors.js
│   │   ├── models/                # Sequelize models
│   │   ├── migrations/
│   │   ├── seeders/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # verifikasi JWT
│   │   │   ├── rbac.middleware.js       # cek role/permission
│   │   │   ├── validate.middleware.js   # Zod/Joi validation
│   │   │   ├── rateLimiter.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── services/               # business logic terpisah dari controller
│   │   ├── utils/
│   │   ├── audit/                  # logger khusus audit trail
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── AGENTS.md
└── README.md
```

**Aturan:** logic bisnis TIDAK boleh langsung di controller. Controller hanya menerima request → panggil service → kirim response. Semua query DB lewat model/service, tidak ada raw query tersebar di controller.

---

## 4. Alur Bisnis & Modul (berdasarkan workflow yang diberikan)

Setiap modul di `senada-react/src/features/` dan `senada-node/src/controllers/` mengikuti tahapan ini secara berurutan:

1. **HPS (Harga Perkiraan Sendiri)** — dibuat oleh **PPK**, diverifikasi **PBJ**.
   - Upload / create HPS, rincian barang, volume, dan harga bersifat *fixed* setelah disubmit.
   - Output: Total Harga HPS.
2. **Undangan** — PBJ membuat undangan dari Total Harga HPS, lalu memilih penyedia (bisa lebih dari satu).
3. **Akun & Penawaran Penyedia** — **Penyedia/Rekanan** login, menerima undangan PBJ, input rincian penawaran (rincian barang & volume fixed dari HPS, penyedia hanya input harga).
   - Sediakan fitur download rincian dalam format cetak (untuk ditandatangani + cap basah, lalu diupload kembali sebagai bukti).
4. **Negosiasi** — PBJ melakukan negosiasi ya/tidak dengan penyedia, hasil harga nego dicatat, penyedia approve/reject (setuju/tidak).
5. **Surat Pesanan / SPK** — dibuat PPK dari hasil negosiasi yang disetujui.
   - SPK butuh tanda tangan digital ATAU tetap disediakan opsi cetak dokumen (karena kebutuhan materai & dokumen fisik untuk ke bagian keuangan) — jangan hilangkan opsi export PDF/print.
   - Catat nomor dokumen SPK/SP dan jangka waktu kerja.
6. **Serah Terima** — upload dokumen surat jalan/pengiriman/izin mulai kerja → menghasilkan Berita Acara Serah Terima & Berita Acara Pembayaran → Resume SPK.
7. **Pelaporan (view-only, integrasi)**
   - **PPSPM**: melihat Resume SPK untuk keperluan pembuatan SPM di aplikasi **SAKTI** (SAKTI adalah sistem eksternal — SENADA hanya menyediakan data view/export, tidak membuat SPM sendiri).
   - **Petugas Laporan Realisasi**: melihat Resume SPK dan menginput data realisasi ke modul laporan keuangan internal.

> Saat membangun/mengubah fitur, agent WAJIB mengecek tahap ini berada di urutan mana, dan status apa saja yang valid berpindah dari satu tahap ke tahap lain (state machine, jangan izinkan lompat tahap dari UI maupun API).

---

## 5. Roles & Permission Matrix (RBAC)

| Role | Deskripsi | Akses Utama |
|---|---|---|
| **Admin** | Mengelola user, role, master data | Full akses manajemen user & konfigurasi sistem |
| **PPK** (Pejabat Pembuat Komitmen) | Pemilik proses pengadaan | Create/verifikasi HPS, terbitkan & tanda tangan SPK, terima Berita Acara |
| **PBJ** (Pejabat Pengadaan) | Menjalankan proses pemilihan penyedia | Buat undangan, pilih penyedia, jalankan negosiasi |
| **Penyedia/Rekanan** | Vendor eksternal | Daftar akun, terima undangan, input penawaran, respon nego, upload dokumen kirim |
| **PPSPM** | Bagian keuangan (penerbit SPM) | View Resume SPK (read-only), export data untuk SAKTI |
| **Petugas Laporan Realisasi** | Bagian pelaporan | View Resume SPK, input & kelola laporan realisasi keuangan |

**Aturan implementasi RBAC:**
- Definisikan permission granular (bukan cuma nama role) di tabel `roles` & `permissions`, misal `hps:create`, `spk:sign`, `laporan:input`.
- RBAC **wajib dicek dua kali**: di middleware backend (`rbac.middleware.js`) DAN di route guard frontend (untuk UX, sembunyikan menu yang tidak relevan) — backend adalah sumber kebenaran, frontend hanya UX.
- Jangan pernah percaya role dari payload frontend; role selalu diambil ulang dari token/DB di server.

---

## 6. Keamanan (Security Baseline — WAJIB)

Karena aplikasi ini publik-facing dan menyimpan data harga/dokumen pengadaan yang sensitif:

1. **Autentikasi**
   - Login wajib untuk semua route kecuali `/login` dan `/forgot-password`.
   - JWT access token umur pendek (± 15 menit), refresh token disimpan di httpOnly + secure + sameSite cookie, rotasi refresh token setiap dipakai.
   - Password di-hash dengan bcrypt (≥10 rounds), tidak pernah disimpan/di-log plaintext.
   - Lockout/backoff setelah beberapa kali percobaan login gagal (brute-force protection), plus rate limiting per IP di endpoint `/login`.
2. **Otorisasi**
   - Middleware `rbac.middleware.js` di setiap route yang butuh permission spesifik.
   - Validasi kepemilikan data (misal: penyedia hanya boleh lihat undangan miliknya sendiri, bukan semua undangan).
3. **Validasi Input**
   - Semua body/query/params request divalidasi dengan Zod/Joi sebelum masuk controller.
   - Sanitasi input untuk mencegah XSS & injection; gunakan parameterized query lewat Sequelize (tidak ada raw SQL string concatenation).
4. **Transport & Header**
   - HTTPS wajib di production.
   - Gunakan `helmet` untuk security headers, CORS whitelist origin frontend saja (bukan `*`).
   - CSRF protection untuk endpoint berbasis cookie.
5. **File Upload**
   - Validasi tipe file (pdf/jpg/png saja untuk dokumen) & batas ukuran.
   - Simpan file di luar folder yang bisa diakses langsung publik, generate nama file acak.
6. **Audit Trail**
   - Setiap aksi krusial (approve/reject nego, tanda tangan SPK, ubah harga HPS) wajib ditulis ke tabel `audit_logs`: user_id, aksi, entity, timestamp, before/after value bila relevan.
7. **Rahasia & Environment**
   - Semua kredensial di `.env`, tidak pernah di-commit. Sediakan `.env.example`.
8. **Error Handling**
   - Jangan expose stack trace / detail error internal ke client di production; gunakan `errorHandler.middleware.js` terpusat.

---

## 7. Design System — "Clean, Simple, Premium"

**Palet warna:**

| Token | Hex | Penggunaan |
|---|---|---|
| `navy-900` | `#0B1E3D` | Sidebar, header, teks penting, tombol primary |
| `navy-700` | `#1B3A66` | Hover state, aksen sekunder |
| `navy-500` | `#2E5090` | Link, badge, ikon aktif |
| `white` | `#FFFFFF` | Background utama |
| `gray-50` | `#F7F8FA` | Background section/card alternatif |
| `gray-200` | `#E4E7EC` | Border, divider |
| `gray-500` | `#667085` | Teks sekunder |
| `success` | `#1E7F52` | Status disetujui |
| `danger` | `#C1362E` | Status ditolak/error |
| `warning` | `#B7791F` | Status pending/menunggu approval |

**Prinsip visual:**
- Whitespace generous, jangan padat. Card dengan padding cukup (min 24px).
- Shadow tipis (`shadow-sm`/`shadow-md`), border radius sedang (8–12px) — bukan bulat penuh, kesan tegas & profesional.
- Border tipis `1px solid gray-200` sebagai pemisah, hindari garis tebal.
- Tipografi: **Inter** atau **Plus Jakarta Sans**, weight 400–600, hindari font terlalu tebal/berat.
- Tabel data rapi dengan zebra-row minimal (gray-50), bukan warna-warni.
- Status pakai badge kecil berwarna (success/danger/warning), bukan teks polos.
- Hindari ikon/ilustrasi ramai; gunakan icon set konsisten (mis. `lucide-react`), monoline, warna navy.
- Dashboard per role menampilkan hanya data & aksi yang relevan dengan tahap alur kerja role tersebut.

---

## 8. Konvensi Kode

- **Penamaan file:** `PascalCase` untuk komponen React (`HpsForm.jsx`), `camelCase` untuk service/util (`hpsService.js`), `snake_case` untuk kolom database.
- **API response format** konsisten:
  ```json
  { "success": true, "data": {}, "message": "" }
  ```
  Error format:
  ```json
  { "success": false, "message": "", "errors": [] }
  ```
- **Commit message:** Conventional Commits (`feat:`, `fix:`, `chore:`, dst).
- Semua endpoint baru wajib didaftarkan di file dokumentasi API (`senada-node/README.md` atau OpenAPI jika ada).
- Jangan menaruh secret/API key langsung di kode.

---

## 9. Environment Variables (senada-node/.env.example)

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=senada_db
DB_USER=root
DB_PASSWORD=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 10. Skema Database & Strategi Migrasi

### 10.1 Prinsip Wajib

- Gunakan **Sequelize CLI migrations** (`npx sequelize-cli migration:generate`). **DILARANG** memakai `sequelize.sync({ alter: true })` di kode aplikasi/production — semua perubahan skema harus lewat migration file yang bisa direview & dijalankan tim IT.
- **Primary key semua tabel = UUID v4** (`DataTypes.UUID`, `defaultValue: DataTypes.UUIDV4`), BUKAN auto-increment integer. Alasan: mencegah ID enumeration, karena vendor (pihak eksternal) juga mengakses sistem ini lewat URL/API yang bisa ditebak kalau pakai integer.
- Semua kolom nominal uang pakai `DECIMAL(15,2)`, jangan `FLOAT`/`DOUBLE` (mencegah floating point rounding error pada nilai kontrak).
- Semua tabel wajib punya `created_at`, `updated_at`. Tabel data master (`users`, `vendor_profiles`, `roles`) tambahkan `deleted_at` (soft delete, `paranoid: true` di Sequelize).
- Semua foreign key didefinisikan eksplisit dengan `onDelete`/`onUpdate`:
  - `RESTRICT` untuk relasi ke data transaksi penting (tidak boleh terhapus kalau masih dipakai).
  - `CASCADE` hanya untuk data anak yang memang ikut terhapus bersama induknya (mis. `hps_items` ikut terhapus jika `hps` induknya dihapus saat masih draft).
- Index wajib ditambahkan di semua kolom foreign key dan kolom yang sering dipakai filter/pencarian (`status`, `email`, `nomor_hps`, `nomor_spk`, kombinasi `entity_type + entity_id`).
- Semua status pakai tipe `ENUM` di level database (bukan cuma divalidasi di aplikasi), supaya integritas data tetap terjaga walau ada perubahan data langsung dari tools DB.
- 1 migration file = 1 perubahan skema. Nama file otomatis dari Sequelize CLI (`YYYYMMDDHHMMSS-create-nama_tabel.js`), jangan diedit manual urutannya.
- **Seeder wajib** untuk: 6 roles, permissions dasar per modul, role_permissions, dan 1 akun admin default (password dari `.env`, bukan hardcode).
- **Serah terima ke tim IT** cukup 2 perintah setelah clone repo & isi `.env`:
  ```
  npx sequelize-cli db:migrate
  npx sequelize-cli db:seed:all
  ```
  Rollback jika perlu: `npx sequelize-cli db:migrate:undo:all`.

> **Aturan untuk AI agent:** jangan membuat/mengubah tabel di luar daftar §10.2 tanpa diminta eksplisit. Jika ada kebutuhan kolom/tabel baru, tambahkan dulu ke AGENTS.md ini sebelum generate migration, supaya dokumen ini selalu jadi sumber kebenaran skema (single source of truth) yang bisa diserahkan ke tim IT kapan saja.

### 10.2 Daftar Tabel, Kolom, dan Relasi

**`users`** — akun seluruh pengguna sistem (internal & vendor)
- id: UUID, PK
- name: STRING, not null
- email: STRING, unique, not null
- password_hash: STRING, not null
- employee_id: STRING, unique, nullable (NIP/ID pegawai, kosong untuk vendor)
- phone: STRING, nullable
- avatar_url: STRING, nullable
- status: ENUM('active','inactive','suspended'), default 'active'
- last_login_at: DATETIME, nullable
- created_at, updated_at, deleted_at
- Relasi: has many `user_roles`; has one `vendor_profiles` (jika berperan sebagai penyedia); has many `refresh_tokens`, `audit_logs`

**`roles`** — daftar role (Admin, PPK, PBJ, Penyedia, PPSPM, Petugas Laporan Realisasi)
- id: UUID, PK
- name: STRING, unique (slug: `admin`, `ppk`, `pbj`, `penyedia`, `ppspm`, `petugas_laporan`)
- label: STRING (nama tampilan)
- description: TEXT, nullable
- created_at, updated_at
- Relasi: many-to-many ke `users` lewat `user_roles`; many-to-many ke `permissions` lewat `role_permissions`

**`permissions`** — permission granular per modul
- id: UUID, PK
- name: STRING, unique (mis. `hps:create`, `spk:sign`, `laporan:input`)
- module: STRING (mis. `hps`, `undangan`, `spk`)
- description: TEXT, nullable
- created_at, updated_at

**`role_permissions`** (pivot)
- id: UUID, PK
- role_id: UUID, FK → roles.id, onDelete CASCADE
- permission_id: UUID, FK → permissions.id, onDelete CASCADE
- unique composite: (role_id, permission_id)

**`user_roles`** (pivot)
- id: UUID, PK
- user_id: UUID, FK → users.id, onDelete CASCADE
- role_id: UUID, FK → roles.id, onDelete RESTRICT
- unique composite: (user_id, role_id)

**`refresh_tokens`**
- id: UUID, PK
- user_id: UUID, FK → users.id, onDelete CASCADE
- token_hash: STRING, not null (jangan simpan token mentah)
- user_agent: STRING, nullable
- ip_address: STRING, nullable
- expires_at: DATETIME, not null
- revoked_at: DATETIME, nullable
- created_at

**`vendor_profiles`** — profil perusahaan penyedia (1-1 dengan users)
- id: UUID, PK
- user_id: UUID, FK → users.id, unique, onDelete CASCADE
- company_name: STRING, not null
- npwp: STRING, unique, not null
- address: TEXT, nullable
- city: STRING, nullable
- phone: STRING, nullable
- bank_name: STRING, nullable
- bank_account_number: STRING, nullable
- bank_account_holder: STRING, nullable
- verification_status: ENUM('pending','verified','rejected'), default 'pending'
- verified_by: UUID, FK → users.id, nullable
- verified_at: DATETIME, nullable
- created_at, updated_at

**`hps`** — Harga Perkiraan Sendiri
- id: UUID, PK
- nomor_hps: STRING, unique, not null
- nama_paket: STRING, not null
- deskripsi: TEXT, nullable
- fiscal_year: INTEGER, not null
- ppk_id: UUID, FK → users.id, onDelete RESTRICT
- pbj_id: UUID, FK → users.id, nullable (diisi saat verifikasi)
- status: ENUM('draft','verified','fixed'), default 'draft'
- total_harga: DECIMAL(15,2), default 0
- verified_at, fixed_at: DATETIME, nullable
- created_at, updated_at
- Relasi: has many `hps_items`; has one `undangan`

**`hps_items`** — rincian barang/jasa dalam HPS (fixed, jadi acuan penawaran)
- id: UUID, PK
- hps_id: UUID, FK → hps.id, onDelete CASCADE
- nama_barang: STRING, not null
- spesifikasi: TEXT, nullable
- satuan: STRING, not null
- volume: DECIMAL(15,2), not null
- harga_satuan: DECIMAL(15,2), not null
- subtotal: DECIMAL(15,2), not null (volume × harga_satuan)
- urutan: INTEGER, default 0
- created_at, updated_at

**`undangan`**
- id: UUID, PK
- nomor_undangan: STRING, unique, not null
- hps_id: UUID, FK → hps.id, unique, onDelete RESTRICT
- pbj_id: UUID, FK → users.id, onDelete RESTRICT
- status: ENUM('draft','sent','closed'), default 'draft'
- tanggal_undangan: DATE, nullable
- batas_waktu_penawaran: DATETIME, nullable
- created_at, updated_at
- Relasi: many-to-many ke `vendor_profiles` lewat `undangan_vendors`

**`undangan_vendors`** (pivot — penyedia yang diundang)
- id: UUID, PK
- undangan_id: UUID, FK → undangan.id, onDelete CASCADE
- vendor_id: UUID, FK → vendor_profiles.id, onDelete RESTRICT
- status: ENUM('invited','viewed','submitted','declined'), default 'invited'
- invited_at, viewed_at: DATETIME, nullable
- unique composite: (undangan_id, vendor_id)
- Relasi: has one `penawaran`

**`penawaran`** — penawaran harga dari vendor
- id: UUID, PK
- undangan_vendor_id: UUID, FK → undangan_vendors.id, unique, onDelete RESTRICT
- total_penawaran: DECIMAL(15,2), not null
- status: ENUM('submitted','negotiating','approved','rejected'), default 'submitted'
- submitted_at: DATETIME, nullable
- created_at, updated_at
- Relasi: has many `penawaran_items`, `negosiasi`

**`penawaran_items`**
- id: UUID, PK
- penawaran_id: UUID, FK → penawaran.id, onDelete CASCADE
- hps_item_id: UUID, FK → hps_items.id, onDelete RESTRICT (barang/volume tetap mengacu ke HPS)
- harga_satuan: DECIMAL(15,2), not null
- subtotal: DECIMAL(15,2), not null
- created_at, updated_at

**`negosiasi`**
- id: UUID, PK
- penawaran_id: UUID, FK → penawaran.id, onDelete CASCADE
- round: INTEGER, default 1
- diajukan_oleh: UUID, FK → users.id (PBJ), onDelete RESTRICT
- harga_usulan: DECIMAL(15,2), not null
- status: ENUM('pending','accepted','rejected'), default 'pending'
- catatan: TEXT, nullable
- responded_at: DATETIME, nullable
- created_at, updated_at

**`spk`** — Surat Perintah Kerja / Surat Pesanan
- id: UUID, PK
- nomor_spk: STRING, unique, not null
- negosiasi_id: UUID, FK → negosiasi.id (round yang disetujui), unique, onDelete RESTRICT
- ppk_id: UUID, FK → users.id, onDelete RESTRICT
- vendor_id: UUID, FK → vendor_profiles.id, onDelete RESTRICT
- tanggal_spk: DATE, nullable
- tanggal_mulai, tanggal_selesai: DATE, nullable
- nilai_kontrak: DECIMAL(15,2), not null
- status: ENUM('draft','signed','active','completed','cancelled'), default 'draft'
- signed_at: DATETIME, nullable
- created_at, updated_at
- Relasi: has one `serah_terima`; has many `laporan_realisasi`, `spm_references`

**`serah_terima`**
- id: UUID, PK
- spk_id: UUID, FK → spk.id, unique, onDelete RESTRICT
- tanggal_serah_terima: DATE, nullable
- status: ENUM('pending','completed'), default 'pending'
- diterima_oleh: UUID, FK → users.id (PPK), onDelete RESTRICT
- created_at, updated_at

**`laporan_realisasi`** — diisi Petugas Laporan Realisasi
- id: UUID, PK
- spk_id: UUID, FK → spk.id, onDelete RESTRICT
- petugas_id: UUID, FK → users.id, onDelete RESTRICT
- nilai_realisasi: DECIMAL(15,2), not null
- tanggal_realisasi: DATE, nullable
- keterangan: TEXT, nullable
- status: ENUM('draft','submitted'), default 'draft'
- created_at, updated_at

**`spm_references`** — referensi ke SPM yang diterbitkan PPSPM lewat SAKTI (eksternal)
- id: UUID, PK
- spk_id: UUID, FK → spk.id, onDelete RESTRICT
- ppspm_id: UUID, FK → users.id, onDelete RESTRICT
- nomor_spm: STRING, nullable (diisi manual, hasil dari SAKTI)
- tanggal_spm: DATE, nullable
- status: ENUM('pending','processed'), default 'pending'
- created_at, updated_at

**`vendor_evaluations`** — penilaian kinerja penyedia oleh PPK setelah serah terima/SPK completed
- id: UUID, PK
- spk_id: UUID, FK → spk.id, unique, onDelete RESTRICT
- vendor_id: UUID, FK → vendor_profiles.id, onDelete RESTRICT
- evaluator_id: UUID, FK → users.id, onDelete RESTRICT
- kualitas_skor: INTEGER, not null (skala 1-5)
- waktu_skor: INTEGER, not null (skala 1-5)
- layanan_skor: INTEGER, not null (skala 1-5)
- skor_akhir: DECIMAL(3,2), not null (rata-rata: (kualitas + waktu + layanan) / 3)
- catatan: TEXT, nullable
- created_at, updated_at
- Relasi: belongsTo `spk`, belongsTo `vendor_profiles`, belongsTo `users` (evaluator)

**`documents`** — tabel polymorphic untuk semua file upload (HPS, penawaran, SPK, surat jalan, BA, dst)
- id: UUID, PK
- entity_type: STRING, not null (mis. `hps`, `penawaran`, `spk`, `serah_terima`)
- entity_id: UUID, not null
- file_name: STRING, not null
- file_path: STRING, not null
- file_type: STRING (mime type)
- file_size: INTEGER
- uploaded_by: UUID, FK → users.id, onDelete RESTRICT
- created_at
- Index composite: (entity_type, entity_id)

**`audit_logs`** — pencatatan semua aksi krusial (§6)
- id: UUID, PK
- user_id: UUID, FK → users.id, nullable, onDelete SET NULL
- action: STRING, not null (mis. `create`, `update`, `approve`, `sign`, `reject`)
- entity_type: STRING, not null
- entity_id: UUID, not null
- before_data: JSON, nullable
- after_data: JSON, nullable
- ip_address: STRING, nullable
- user_agent: STRING, nullable
- created_at
- Index composite: (entity_type, entity_id)

### 10.3 Ringkasan Alur Relasi (ERD Tekstual)

```
users ─┬─< user_roles >─ roles ─┬─< role_permissions >─ permissions
       ├─1:1─ vendor_profiles
       ├─1:N─ refresh_tokens
       ├─1:N─ vendor_evaluations (evaluator)
       └─1:N─ audit_logs

hps ─1:N─ hps_items
hps ─1:1─ undangan ─N:M(undangan_vendors)─ vendor_profiles
undangan_vendors ─1:1─ penawaran ─1:N─ penawaran_items (→ hps_items)
penawaran ─1:N─ negosiasi
negosiasi (accepted) ─1:1─ spk ─1:1─ serah_terima
spk ─1:1─ vendor_evaluations ─> vendor_profiles
spk ─1:N─ laporan_realisasi
spk ─1:N─ spm_references

documents (polymorphic) ──> hps | penawaran | spk | serah_terima
audit_logs (polymorphic) ──> semua entity di atas
```

---

## 11. Checklist Sebelum Merge/PR

- [ ] Endpoint baru sudah dicek middleware auth + rbac?
- [ ] Input sudah divalidasi (Zod/Joi)?
- [ ] Aksi krusial sudah tercatat di audit log?
- [ ] Tidak ada raw SQL / query rentan injection?
- [ ] Role yang tidak berkepentingan tidak bisa mengakses data/menu terkait?
- [ ] Tampilan konsisten dengan design system §7 (warna, spacing, tipografi)?
- [ ] Tidak ada secret ter-hardcode?

---

*Dokumen ini adalah living document — update setiap kali ada perubahan alur bisnis atau keputusan arsitektur baru.* 