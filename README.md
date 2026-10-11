# SIKRA — SENADA (Sistem Pengadaan Barang dan Jasa)
### 🏛️ Digitalisasi Pengadaan Barang & Jasa Instansi Pemerintah

[![SENADA Portal](https://img.shields.io/badge/Status-Operasional-success.svg)](#)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933.svg?logo=node.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](#)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000.svg?logo=express&logoColor=white)](#)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20MySQL-4169E1.svg?logo=postgresql&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](#)

---

## 📌 Ringkasan Proyek
**SENADA (Sistem Pengadaan Barang dan Jasa)** adalah platform digital terpadu untuk mendigitalisasi seluruh tahapan pengadaan barang dan jasa di lingkungan instansi pemerintah secara akuntabel, transparan, dan terintegrasi dari hulu ke hilir. Sistem ini menggantikan proses pengadaan manual berbasis kertas dengan alur kerja digital terstruktur: mulai dari penyusunan HPS (Harga Perkiraan Sendiri) oleh PPK, verifikasi dan penerbitan undangan oleh PBJ, penawaran harga oleh rekanan, negosiasi harga transparan, penerbitan SPK/Surat Pesanan resmi, serah terima barang (BAST/BAP), hingga integrasi data pelaporan realisasi keuangan dan rujukan SPM via aplikasi eksternal kementerian (**SAKTI**).

---

## 📖 Panduan Lengkap Pengguna (User Manual)
Untuk petunjuk langkah demi langkah pengoperasian aplikasi, alur kerja tiap peran (PPK, PBJ, Penyedia, PPSPM, Petugas Laporan, Admin), dan akun demo siap pakai, silakan baca:
👉 **[Buku Panduan Penggunaan Sistem (PANDUAN_PENGGUNA.md)](./PANDUAN_PENGGUNA.md)**

---

## 🚀 Fitur Unggulan
1. **Executive Dashboard Berbasis Peran (RBAC)**:
   - Tampilan ringkasan paket, statistik serapan anggaran, dan status pengadaan yang disesuaikan secara dinamis untuk setiap peran (PPK, PBJ, Penyedia, PPSPM, Petugas Laporan, Administrator).
2. **Penyusunan & Import HPS Otomatis**:
   - Penyusunan rincian barang, volume, dan perkiraan harga satuan secara interaktif.
   - Fitur unggulan **Import Excel (.xlsx)** langsung dari template HPS instansi tanpa perlu input manual baris demi baris.
3. **Paket Undangan & Penawaran Rekanan**:
   - Penerbitan surat undangan pengadaan resmi kepada satu atau banyak rekanan terdaftar.
   - Rekanan dapat mengunduh format cetak rincian barang acuan HPS untuk dibubuhi cap basah dan tanda tangan fisik.
   - Pemasukan penawaran harga secara digital dengan rincian barang dan volume yang terkunci aman.
4. **Negosiasi Harga Transparan & Terekam**:
   - Fasilitas putaran negosiasi harga antara PBJ dan rekanan.
   - Opsi persetujuan (*Accept*) atau penolakan (*Reject*) dengan riwayat jejak harga yang tidak dapat dimanipulasi.
5. **Penerbitan SPK & Surat Pesanan Resmi**:
   - Otomasi penerbitan dokumen SPK dari hasil negosiasi yang disetujui.
   - Opsi tanda tangan digital serta ekspor siap cetak PDF dengan alokasi ruang meterai fisik untuk keperluan administrasi keuangan.
6. **Serah Terima (BAST & BAP) & Penilaian Kinerja Vendor**:
   - Rekanan mengunggah surat jalan / bukti pengiriman barang.
   - Penerbitan Berita Acara Serah Terima (BAST) dan Berita Acara Pembayaran (BAP) oleh PPK.
   - Evaluasi kinerja vendor (*Vendor Evaluation*) berkelanjutan (skor kualitas, ketepatan waktu, dan layanan skala 1–5).
7. **Pusat Pelaporan & Integrasi SPM SAKTI**:
   - **PPSPM**: Tinjauan Resume SPK lengkap dan pencatatan nomor/tanggal SPM hasil penerbitan dari aplikasi **SAKTI**.
   - **Petugas Laporan Realisasi**: Pencatatan nilai dan tanggal penyerapan realisasi kas negara secara berkala.
8. **Keamanan & Audit Trail (Administrator)**:
   - Pengelolaan master user dan verifikasi kelayakan profil vendor baru.
   - Pencatatan seluruh aksi krusial sistem secara real-time pada tabel audit trail (*who, when, what, IP address*).

---

## 🛠️ Arsitektur & Teknologi

- **Frontend (`senada-react`)**:
  - React 18 & Vite (Dev Speed & Optimized Build)
  - Tailwind CSS (Clean, Modern Navy & White Corporate Palette)
  - Zustand (Lightweight Global State & Session Management)
  - TanStack Query v5 (Server State, Caching & Auto-Refetch)
  - React Router DOM v6 (Role-Based Route Guards)
  - React Hook Form & Zod (Skema Validasi Formulir)
  - Lucide React (Konsistensi Ikonografi Monoline)
- **Backend (`senada-node`)**:
  - Node.js & Express.js
  - RESTful Architecture dengan Pemisahan Controller & Service
  - Sequelize ORM (Mendukung PostgreSQL & MySQL)
  - Otentikasi JWT (Short-Lived Access Token + Refresh Token Rotation via HttpOnly Cookie)
  - Role-Based Access Control (RBAC Middleware granular)
  - Multer (Validasi & unggah dokumen pengadaan aman)
  - Winston Logger & Database Audit Logging
  - Express Rate Limit & Helmet (Proteksi Brute-Force & Security Headers)
- **Database**:
  - PostgreSQL (Vercel Postgres / Neon / Supabase) & MySQL (Localhost XAMPP)

---

## 💻 Panduan Instalasi Lokal (Development Setup)

### 1. Kloning Repositori
```bash
git clone https://github.com/F4KHR111/SENADA.git
cd SENADA
```

### 2. Instalasi Dependensi
Jalankan instalasi dependensi pada masing-masing folder:

**Backend (`senada-node`):**
```bash
cd senada-node
npm install
```

**Frontend (`senada-react`):**
```bash
cd ../senada-react
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin atau buat file `.env` pada folder `senada-node`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=senada_db
DB_USER=root
DB_PASSWORD=
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(Catatan: Jika menggunakan PostgreSQL / Vercel Postgres, Anda cukup menyertakan `POSTGRES_URL="postgres://..."`)*

Dan pada folder `senada-react`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Inisialisasi Database
Pada folder `senada-node`, jalankan perintah migrasi dan seeder awal:
```bash
cd senada-node
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 5. Menjalankan Aplikasi
Buka dua jendela terminal terpisah:

**Terminal 1 (Backend API):**
```bash
cd senada-node
npm run dev
# Server API aktif di http://localhost:5000
```

**Terminal 2 (Frontend Web):**
```bash
cd senada-react
npm run dev
# Web app aktif di http://localhost:5173
```

---

## 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 **SENADA — Sistem Pengadaan Barang dan Jasa**.  
Dikembangkan untuk mendigitalisasi proses pengadaan barang dan jasa instansi pemerintah secara akuntabel, efisien, dan transparan.
