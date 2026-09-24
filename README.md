# SENADA — Sistem Pengadaan Barang dan Jasa

SENADA adalah aplikasi web internal untuk mendigitalisasi proses pengadaan barang dan jasa instansi, mulai dari penyusunan HPS (Harga Perkiraan Sendiri), penerbitan undangan ke penyedia, negosiasi harga, penerbitan SPK/Surat Pesanan, serah terima barang, hingga integrasi data pelaporan realisasi keuangan dan SPM.

---

## 🏛️ Arsitektur & Alur Bisnis

1. **HPS (Harga Perkiraan Sendiri)** — Dibuat oleh **PPK** (bisa import langsung dari template Excel), diverifikasi oleh **PBJ**.
2. **Undangan Pengadaan** — PBJ membuat paket undangan berdasarkan HPS dan mengundang penyedia rekanan.
3. **Penawaran Penyedia** — Rekanan login, menerima undangan, dan menginput penawaran harga.
4. **Negosiasi** — PBJ dan Rekanan bernegosiasi secara transparan dan terekam di sistem.
5. **SPK / Surat Pesanan** — Diterbitkan oleh PPK setelah kesepakatan negosiasi.
6. **Serah Terima** — Pencatatan BAST (Berita Acara Serah Terima) dan BAP (Berita Acara Pembayaran).
7. **Laporan & Referensi SPM** — Penyusunan laporan realisasi anggaran serta referensi SPM ke sistem SAKTI oleh PPSPM.

---

## 💻 Tech Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, Zustand, TanStack Query, React Hook Form, Zod, Lucide Icons.
- **Backend**: Node.js, Express.js, Sequelize ORM (MySQL), JWT Authentication (HttpOnly cookie refresh token rotation), Multer, Winston Logger.
- **Database**: MySQL.

---

## 🚀 Panduan Menjalankan Proyek

### 1. Prasyarat
- Node.js (v18+)
- MySQL Server (XAMPP / MariaDB / Standalone MySQL)

### 2. Setup Backend (`senada-node`)
```bash
cd senada-node

# Install dependencies
npm install

# Konfigurasi environment
cp .env.example .env
# Sesuaikan DB_USER, DB_PASSWORD, DB_NAME, dan JWT Secret di .env

# Jalankan migrasi dan seeder database
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# Jalankan backend server
npm run dev
```

### 3. Setup Frontend (`senada-react`)
```bash
cd senada-react

# Install dependencies
npm install

# Konfigurasi environment (opsional)
cp .env.example .env

# Jalankan frontend development server
npm run dev
```

Aplikasi frontend dapat diakses di: `http://localhost:5173`
API backend berjalan di: `http://localhost:5000`

---

## 🛡️ Keamanan & Akses (RBAC)

- Otentikasi berbasis JWT dengan access token dan refresh token.
- Role-Based Access Control (RBAC): Admin, PPK, PBJ, Penyedia, PPSPM, Petugas Laporan Realisasi.
- Proteksi brute-force, parameterized query via Sequelize ORM, dan audit trail logging pada setiap perubahan krusial.
