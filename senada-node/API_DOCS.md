# Dokumentasi API SENADA (Auth & Master)

**Base URL**: `http://localhost:5000/api` (atau `http://localhost:5000`)

---

## 🚀 Cara Menjalankan Server Backend

1. Pastikan **MySQL di XAMPP** sudah berjalan dan database `senada_db` telah dimigrasi & di-seed.
2. Buka terminal di folder `senada-node`:
   ```bash
   cd senada-node
   npm run dev
   ```
3. Server aktif di `http://localhost:5000`.

---

## 📌 Ringkasan Endpoint

| Method | Endpoint | Auth Required | Rate Limited | Keterangan |
|---|---|---|---|---|
| `GET` | `/health` | Tidak | Tidak | Cek status server API |
| `POST` | `/api/auth/register` | Tidak | Tidak | Registrasi vendor/rekanan baru |
| `POST` | `/api/auth/login` | Tidak | **Ya** (10 req/15 min) | Login akun & peroleh token |
| `POST` | `/api/auth/refresh-token` | Tidak (via Cookie / Body) | Tidak | Rotasi & perpanjangan token |
| `POST` | `/api/auth/logout` | Opsional | Tidak | Batalkan refresh token & hapus cookie |
| `GET` | `/api/auth/me` | **Ya** (Bearer Token) | Tidak | Ambil profil, role & permissions user aktif |

---

## 📖 Detail & Instruksi Endpoint

---

### 1. Health Check
*Memeriksa apakah server backend berjalan normal.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/health`
- **Headers**: Tidak ada

#### Contoh cURL:
```bash
curl -X GET http://localhost:5000/health
```

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "message": "SENADA API is running."
}
```

---

### 2. Login User / Administrator / Vendor
*Autentikasi akun. Mengembalikan access token JWT (15 menit) dan menetapkan httpOnly cookie `refreshToken` (7 hari).*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: `Content-Type: application/json`

#### Default Akun Seeder (Admin):
- **Email**: `admin@senada.go.id`
- **Password**: `Admin#SENADA2026`

#### Request Body:
```json
{
  "email": "admin@senada.go.id",
  "password": "Admin#SENADA2026"
}
```

#### Contoh cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"email\":\"admin@senada.go.id\",\"password\":\"Admin#SENADA2026\"}"
```

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "00000000-0000-4000-8000-000000000099",
      "name": "Super Administrator",
      "email": "admin@senada.go.id",
      "employee_id": "198001012005011001",
      "avatar_url": null,
      "roles": ["admin"],
      "permissions": [
        "user:create", "user:read", "user:update", "user:delete",
        "role:create", "role:read", "role:update", "role:delete",
        "vendor:read", "vendor:verify",
        "hps:create", "hps:read", "hps:update", "hps:delete", "hps:verify",
        "undangan:create", "undangan:read", "undangan:update", "undangan:delete",
        "penawaran:create", "penawaran:read", "penawaran:update",
        "negosiasi:create", "negosiasi:read", "negosiasi:update", "negosiasi:respond",
        "spk:create", "spk:read", "spk:update", "spk:sign",
        "serah_terima:create", "serah_terima:read", "serah_terima:update",
        "laporan:create", "laporan:read", "laporan:update",
        "spm:create", "spm:read", "spm:update",
        "document:read", "document:upload", "document:delete",
        "audit:read"
      ],
      "vendorProfile": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login berhasil."
}
```

#### Response Gagal (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Email atau password salah."
}
```

---

### 3. Get Current User Profile (`/auth/me`)
*Mengambil profil, status, role, dan izin akses pengguna yang sedang login.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/auth/me`
- **Headers**:
  - `Authorization: Bearer <ACCESS_TOKEN>`

#### Contoh cURL:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "00000000-0000-4000-8000-000000000099",
    "name": "Super Administrator",
    "email": "admin@senada.go.id",
    "employee_id": "198001012005011001",
    "phone": "081234567890",
    "avatar_url": null,
    "status": "active",
    "last_login_at": "2026-09-01T14:31:09.000Z",
    "roles": ["admin"],
    "permissions": ["..."],
    "vendorProfile": null
  },
  "message": "Data profil pengguna berhasil didapatkan."
}
```

#### Response Gagal (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Akses ditolak. Token otorisasi tidak ditemukan."
}
```

---

### 4. Registrasi Vendor / Rekanan Baru
*Membuat akun vendor sekaligus entitas profil perusahaan (`vendor_profiles`) dalam satu transaksi.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**: `Content-Type: application/json`

#### Request Body:
```json
{
  "name": "Budi Santoso",
  "email": "vendor.prima@gmail.com",
  "password": "PasswordVendor#2026",
  "company_name": "PT Prima Pengadaan Nusantara",
  "npwp": "01.234.567.8-999.000",
  "address": "Jl. Sudirman Kav. 25, Jakarta Selatan",
  "city": "Jakarta",
  "phone": "081298765432",
  "bank_name": "Bank Mandiri",
  "bank_account_number": "1230009876543",
  "bank_account_holder": "PT Prima Pengadaan Nusantara"
}
```

#### Contoh cURL:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Budi Santoso\",\"email\":\"vendor.prima@gmail.com\",\"password\":\"PasswordVendor#2026\",\"company_name\":\"PT Prima Pengadaan Nusantara\",\"npwp\":\"01.234.567.8-999.000\",\"address\":\"Jl. Sudirman Kav. 25\",\"city\":\"Jakarta\",\"phone\":\"081298765432\",\"bank_name\":\"Bank Mandiri\",\"bank_account_number\":\"1230009876543\",\"bank_account_holder\":\"PT Prima Pengadaan Nusantara\"}"
```

#### Response Sukses (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "c71d6bb7-8622-4411-9a70-d9d20c572a11",
    "name": "Budi Santoso",
    "email": "vendor.prima@gmail.com",
    "phone": "081298765432",
    "status": "active",
    "vendorProfile": {
      "id": "18f9d0c2-55c3-42e1-8d26-681b9cfb7e22",
      "user_id": "c71d6bb7-8622-4411-9a70-d9d20c572a11",
      "company_name": "PT Prima Pengadaan Nusantara",
      "npwp": "01.234.567.8-999.000",
      "address": "Jl. Sudirman Kav. 25, Jakarta Selatan",
      "city": "Jakarta",
      "phone": "081298765432",
      "bank_name": "Bank Mandiri",
      "bank_account_number": "1230009876543",
      "bank_account_holder": "PT Prima Pengadaan Nusantara",
      "verification_status": "pending"
    }
  },
  "message": "Registrasi penyedia berhasil. Akun Anda menunggu proses verifikasi."
}
```

---

### 5. Refresh Token (Rotasi Token)
*Memperbarui access token dengan menukarkan refresh token lama. Refresh token lama otomatis dibatalkan (revoked) dan digantikan dengan yang baru.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/refresh-token`
- **Headers**: `Content-Type: application/json`
- **Cookie / Body**: Token dapat dikirimkan otomatis via Cookie browser atau via body JSON `{ "refreshToken": "..." }`.

#### Request Body (jika tidak via browser cookie):
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN_STRING"
}
```

#### Contoh cURL (menggunakan file cookie):
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt
```

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Access token berhasil diperbarui."
}
```

---

### 6. Logout
*Membatalkan (revoke) refresh token di database dan menghapus cookie pada browser.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/logout`
- **Headers**:
  - `Authorization: Bearer <ACCESS_TOKEN>` (opsional)
  - `Content-Type: application/json`
- **Cookie / Body**: Mengirim cookie atau `{ "refreshToken": "..." }`.

#### Contoh cURL:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt -c cookies.txt
```

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "message": "Logout berhasil."
}
```

---

## 🧪 Panduan Skenario Pengujian Bertahap (Step-by-Step)

Anda dapat menggunakan **Postman**, **Thunder Client (VS Code)**, atau **cURL** untuk mencoba skenario berikut:

```
[1. Health Check] ──► GET http://localhost:5000/health
                         │
[2. Login Admin]  ──► POST /api/auth/login  (admin@senada.go.id / Admin#SENADA2026)
                         │ (Simpan accessToken)
[3. Cek Profil]   ──► GET /api/auth/me      (Header: Authorization: Bearer <accessToken>)
                         │
[4. Daftar Vendor]──► POST /api/auth/register (Daftarkan PT Baru)
                         │
[5. Login Vendor] ──► POST /api/auth/login  (Login vendor baru -> Cek roles: ["penyedia"])
                         │
[6. Refresh Token]──► POST /api/auth/refresh-token (Mendapatkan token baru)
                         │
[7. Logout]       ──► POST /api/auth/logout (Revoke token)
```

---

# 📦 Modul 1: HPS (Harga Perkiraan Sendiri)

Sesuai **AGENTS.md §4**:
- **PPK**: Menyusun dan mengupdate paket HPS (status: `draft`).
- **PBJ**: Memverifikasi paket HPS (status: `draft` ➔ `verified` / `fixed`).
- **State Machine**: Begitu HPS berstatus `verified` atau `fixed`, rincian barang dan harga **bersifat tetap (locked)** dan tidak dapat diubah lagi.

---

### Kredensial User Pengujian HPS:

| Role | Email | Password | Hak Akses HPS |
|---|---|---|---|
| **PPK** | `ppk@senada.go.id` | `Ppk#SENADA2026` | `hps:create`, `hps:read`, `hps:update`, `hps:delete` |
| **PBJ** | `pbj@senada.go.id` | `Pbj#SENADA2026` | `hps:read`, `hps:verify` |
| **Admin** | `admin@senada.go.id` | `Admin#SENADA2026` | Full Akses (`*`) |

---

### 1. Buat Paket HPS Baru
*Membuat paket HPS baru dengan status awal `draft` beserta rincian barang/jasa dan opsional file pendukung.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/hps`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_ATAU_ADMIN>`
  - `Content-Type: application/json` *(atau `multipart/form-data` jika melampirkan file)*
- **Izin Diperlukan**: `hps:create`

#### Request Body (`application/json`):
```json
{
  "nama_paket": "Pengadaan Laptop dan Perangkat IT Kantor 2026",
  "deskripsi": "Pengadaan 10 unit laptop kerja dan 2 unit printer multifungsi",
  "fiscal_year": 2026,
  "items": [
    {
      "nama_barang": "Laptop Kerja Core i7 16GB SSD 512GB",
      "spesifikasi": "Layar 14 inch FHD, RAM 16GB, SSD 512GB NVMe, Windows 11 Pro",
      "satuan": "Unit",
      "volume": 10,
      "harga_satuan": 15000000,
      "urutan": 1
    },
    {
      "nama_barang": "Printer Laser Multifungsi A4",
      "spesifikasi": "Print, Scan, Copy, Network LAN & Wi-Fi, Duplex",
      "satuan": "Unit",
      "volume": 2,
      "harga_satuan": 7500000,
      "urutan": 2
    }
  ]
}
```

#### Response Sukses (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "092577aa-c2e6-4cab-9a1a-91bbdd6c64c9",
    "nomor_hps": "HPS/2026/09/0001",
    "nama_paket": "Pengadaan Laptop dan Perangkat IT Kantor 2026",
    "deskripsi": "Pengadaan 10 unit laptop kerja dan 2 unit printer multifungsi",
    "fiscal_year": 2026,
    "status": "draft",
    "total_harga": 165000000,
    "ppk": {
      "id": "9a66db0b-84ab-4d29-b785-01eb0734ecb0",
      "name": "Ahmad Dahlan (PPK)",
      "email": "ppk@senada.go.id"
    },
    "items": [
      {
        "id": "87f2e143-4dc9-4670-b18d-f5e27a69c0d1",
        "nama_barang": "Laptop Kerja Core i7 16GB SSD 512GB",
        "satuan": "Unit",
        "volume": 10,
        "harga_satuan": 15000000,
        "subtotal": 150000000,
        "urutan": 1
      },
      {
        "id": "a5d3f9b2-38e1-4c55-9b2f-981f2ec4a290",
        "nama_barang": "Printer Laser Multifungsi A4",
        "satuan": "Unit",
        "volume": 2,
        "harga_satuan": 7500000,
        "subtotal": 15000000,
        "urutan": 2
      }
    ],
    "documents": []
  },
  "message": "Paket HPS berhasil dibuat dengan status draft."
}
```

---

### 2. Ambil Daftar HPS (List & Pagination)
*Mengambil daftar seluruh HPS dengan fitur pencarian dan filter status/tahun anggaran.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/hps?page=1&limit=10&search=Laptop&status=draft`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_PBJ_ADMIN>`
- **Izin Diperlukan**: `hps:read`

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": "092577aa-c2e6-4cab-9a1a-91bbdd6c64c9",
      "nomor_hps": "HPS/2026/09/0001",
      "nama_paket": "Pengadaan Laptop dan Perangkat IT Kantor 2026",
      "fiscal_year": 2026,
      "status": "draft",
      "total_harga": 165000000,
      "ppk": {
        "id": "9a66db0b-84ab-4d29-b785-01eb0734ecb0",
        "name": "Ahmad Dahlan (PPK)",
        "email": "ppk@senada.go.id"
      }
    }
  ],
  "pagination": {
    "totalData": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10
  },
  "message": "Daftar HPS berhasil diambil."
}
```

---

### 3. Ambil Detail HPS (`/api/hps/:id`)
*Mengambil detail lengkap HPS, termasuk semua rincian item barang, data pembuat (PPK), verifikator (PBJ), dan dokumen pendukung.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/hps/092577aa-c2e6-4cab-9a1a-91bbdd6c64c9`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_PBJ_ADMIN>`
- **Izin Diperlukan**: `hps:read`

---

### 4. Perbarui Paket HPS (Update)
*Memperbarui nama paket, tahun anggaran, atau rincian item barang pada HPS yang berstatus `draft`.*

- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/hps/092577aa-c2e6-4cab-9a1a-91bbdd6c64c9`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_PEMBUAT_ATAU_ADMIN>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `hps:update`

#### Request Body:
```json
{
  "nama_paket": "Pengadaan Laptop dan Perangkat IT Kantor 2026 (Revisi)",
  "items": [
    {
      "nama_barang": "Laptop Kerja Core i7 16GB SSD 512GB",
      "satuan": "Unit",
      "volume": 12,
      "harga_satuan": 15000000,
      "urutan": 1
    }
  ]
}
```

---

### 5. Verifikasi HPS oleh PBJ (Verify)
*Memverifikasi paket HPS dari status `draft` menjadi `verified` atau `fixed`.*

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/hps/092577aa-c2e6-4cab-9a1a-91bbdd6c64c9/verify`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PBJ_ATAU_ADMIN>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `hps:verify`

#### Request Body:
```json
{
  "status": "verified",
  "catatan": "Harga dan spesifikasi wajar sesuai standar harga pasar."
}
```

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "092577aa-c2e6-4cab-9a1a-91bbdd6c64c9",
    "nomor_hps": "HPS/2026/09/0001",
    "status": "verified",
    "verified_at": "2026-09-02T02:17:38.000Z",
    "pbj": {
      "id": "e4d114b4-dd4e-41bc-9679-c2886970b695",
      "name": "Siti Rahma (PBJ)",
      "email": "pbj@senada.go.id"
    }
  },
  "message": "Paket HPS berhasil diverifikasi dengan status 'verified'."
}
```

---

### 6. Unggah Dokumen Pendukung Tambahan HPS
*Mengunggah file dokumen pendukung (PDF, JPG, PNG, DOCX, XLSX) untuk HPS.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/hps/092577aa-c2e6-4cab-9a1a-91bbdd6c64c9/documents`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_ATAU_ADMIN>`
- **Body**: `form-data` dengan field:
  - `file`: (Pilih file yang akan diunggah, maksimal 10 MB)

---

### 7. Hapus HPS
*Menghapus paket HPS (Hanya diizinkan jika status masih `draft`).*

- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/hps/092577aa-c2e6-4cab-9a1a-91bbdd6c64c9`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_PEMBUAT_ATAU_ADMIN>`
- **Izin Diperlukan**: `hps:delete`

---

# ✉️ Modul 2: Undangan Pengadaan

Sesuai **AGENTS.md §4 Tahap 2 & §6.2**:
- **PBJ**: Membuat undangan dari HPS yang sudah `verified` / `fixed`, memilih beberapa vendor penyedia, lalu menerbitkan/mengirimkan undangan (`draft` ➔ `sent`).
- **Penyedia / Vendor**: Hanya melihat undangan yang mengundang perusahaannya. Ketika vendor membuka detail undangan, status undangan vendor otomatis tercatat menjadi `viewed`. Vendor juga dapat menolak undangan (`declined`).

---

### 1. Buat Paket Undangan Baru (Draft)
*Menerbitkan draf undangan pengadaan mengacu pada paket HPS yang sudah terverifikasi dan memilih vendor.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/undangan`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PBJ_ATAU_ADMIN>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `undangan:create`

#### Request Body (`application/json`):
```json
{
  "hps_id": "092577aa-c2e6-4cab-9a1a-91bbdd6c64c9",
  "batas_waktu_penawaran": "2026-09-15T17:00:00.000Z",
  "vendor_ids": [
    "18f9d0c2-55c3-42e1-8d26-681b9cfb7e22",
    "29e8c0a1-44b2-41d0-9c15-570a8bea6f11"
  ]
}
```

#### Response Sukses (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "9eb9d4a7-c941-4438-b852-e2666ada4c9d",
    "nomor_undangan": "UND/2026/09/0001",
    "status": "draft",
    "batas_waktu_penawaran": "2026-09-15T17:00:00.000Z",
    "hps": {
      "nomor_hps": "HPS/2026/09/0001",
      "nama_paket": "Pengadaan Laptop dan Perangkat IT Kantor 2026",
      "total_harga": 165000000
    },
    "undanganVendors": [
      {
        "vendor_id": "18f9d0c2-55c3-42e1-8d26-681b9cfb7e22",
        "status": "invited",
        "vendor": {
          "company_name": "PT Prima Pengadaan Nusantara"
        }
      }
    ]
  },
  "message": "Paket undangan pengadaan berhasil dibuat dengan status draft."
}
```

---

### 2. Kirim / Terbitkan Undangan ke Vendor (`/send`)
*Menerbitkan undangan sehingga dapat dilihat oleh para vendor yang diundang (`draft` ➔ `sent`).*

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/undangan/9eb9d4a7-c941-4438-b852-e2666ada4c9d/send`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PBJ_ATAU_ADMIN>`
- **Izin Diperlukan**: `undangan:update`

---

### 3. Ambil Daftar Undangan (`/api/undangan`)
*Mengambil daftar undangan pengadaan. Jika login sebagai Vendor, sistem secara otomatis hanya menampilkan undangan yang ditujukan kepada perusahaannya.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/undangan?page=1&limit=10&status=sent`
- **Headers**:
  - `Authorization: Bearer <TOKEN_USER>`
- **Izin Diperlukan**: `undangan:read`

---

### 4. Ambil Detail Undangan (`/api/undangan/:id`)
*Melihat rincian paket HPS dan item pengadaan. Jika diakses oleh vendor pertama kali, status undangan vendor otomatis berubah dari `invited` menjadi `viewed`.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/undangan/9eb9d4a7-c941-4438-b852-e2666ada4c9d`
- **Headers**:
  - `Authorization: Bearer <TOKEN_USER>`
- **Izin Diperlukan**: `undangan:read`

---

### 5. Respon Vendor / Tolak Undangan (`/respond`)
*Vendor menolak undangan pengadaan jika tidak dapat mengikuti penawaran.*

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/undangan/9eb9d4a7-c941-4438-b852-e2666ada4c9d/respond`
- **Headers**:
  - `Authorization: Bearer <TOKEN_VENDOR>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `undangan:read` (Role: Penyedia)

#### Request Body:
```json
{
  "status": "declined",
  "catatan": "Kapasitas produksi sedang penuh untuk periode ini."
}
```

---

### 6. Tutup Masa Penawaran Undangan (`/close`)
*Menutup masa penawaran undangan setelah batas waktu berakhir (`sent` ➔ `closed`).*

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/undangan/9eb9d4a7-c941-4438-b852-e2666ada4c9d/close`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PBJ_ATAU_ADMIN>`
- **Izin Diperlukan**: `undangan:update`

---

# 📑 Modul 3: Penawaran Harga (Penyedia)

Sesuai **AGENTS.md §4 Tahap 3**:
- **Penyedia/Rekanan**: Menerima undangan, menginput harga satuan penawaran. Rincian barang & volume **bersifat fixed dari HPS** (penyedia hanya mengisi `harga_satuan`).
- **Dokumen Penawaran**: Disediakan endpoint untuk mengunggah surat penawaran bermaterai / bertandatangan & cap basah.

---

### 1. Ajukan Penawaran Harga Baru
*Mengajukan rincian harga penawaran untuk paket pengadaan yang diundang.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/penawaran`
- **Headers**:
  - `Authorization: Bearer <TOKEN_VENDOR>`
  - `Content-Type: application/json` *(atau `multipart/form-data` dengan field `file`)*
- **Izin Diperlukan**: `penawaran:create`

#### Request Body (`application/json`):
```json
{
  "undangan_id": "9eb9d4a7-c941-4438-b852-e2666ada4c9d",
  "items": [
    {
      "hps_item_id": "87f2e143-4dc9-4670-b18d-f5e27a69c0d1",
      "harga_satuan": 14500000
    },
    {
      "hps_item_id": "a5d3f9b2-38e1-4c55-9b2f-981f2ec4a290",
      "harga_satuan": 7000000
    }
  ]
}
```

#### Response Sukses (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "0ed19bb6-2109-47d5-99bc-fff48fa18166",
    "total_penawaran": 159000000,
    "status": "submitted",
    "submitted_at": "2026-09-02T02:35:00.000Z",
    "items": [
      {
        "hps_item_id": "87f2e143-4dc9-4670-b18d-f5e27a69c0d1",
        "harga_satuan": 14500000,
        "subtotal": 145000000
      }
    ]
  },
  "message": "Penawaran harga berhasil diajukan."
}
```

---

### 2. Ambil Daftar Penawaran (`/api/penawaran`)
*Mengambil daftar penawaran harga. Otomatis terfilter hanya milik perusahaan vendor yang sedang login jika diakses oleh vendor.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/penawaran?page=1&limit=10&undangan_id=...`
- **Headers**:
  - `Authorization: Bearer <TOKEN_USER>`
- **Izin Diperlukan**: `penawaran:read`

---

### 3. Unggah Dokumen Surat Penawaran Cap Basah (`/documents`)
*Mengunggah surat penawaran bertandatangan dan berstempel resmi perusahaan.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/penawaran/0ed19bb6-2109-47d5-99bc-fff48fa18166/documents`
- **Headers**:
  - `Authorization: Bearer <TOKEN_VENDOR>`
- **Body**: `form-data` dengan field `file` (PDF/JPG/PNG/DOCX)

---

# 🤝 Modul 4: Negosiasi Harga

Sesuai **AGENTS.md §4 Tahap 4**:
- **PBJ**: Mengajukan ronde harga usulan negosiasi (`harga_usulan`) kepada penyedia.
- **Penyedia**: Merespon persetujuan/penolakan (`accepted` / `rejected`).
- **Histori Ronde**: Seluruh histori ronde terekam lengkap (Round 1, Round 2, dst) beserta catatan dan tanggal respon.
- **State Transition**: Begitu usulan disetujui (`accepted`), status penawaran otomatis menjadi `approved` untuk menjadi dasar penerbitan SPK.

---

### 1. Ajukan Usulan Negosiasi Ronde Baru (PBJ)
*Mengajukan ronde usulan harga negosiasi kepada penyedia.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/negosiasi`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PBJ_ATAU_ADMIN>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `negosiasi:create`

#### Request Body:
```json
{
  "penawaran_id": "0ed19bb6-2109-47d5-99bc-fff48fa18166",
  "harga_usulan": 150000000,
  "catatan": "Mohon penyesuaian harga paket laptop dan printer menjadi Rp 150.000.000."
}
```

#### Response Sukses (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "b868dc30-88bf-4221-93e2-15bdc2a7642e",
    "penawaran_id": "0ed19bb6-2109-47d5-99bc-fff48fa18166",
    "round": 1,
    "harga_usulan": 150000000,
    "status": "pending",
    "catatan": "Mohon penyesuaian harga paket laptop dan printer menjadi Rp 150.000.000.",
    "pengaju": {
      "id": "e4d114b4-dd4e-41bc-9679-c2886970b695",
      "name": "Siti Rahma (PBJ)",
      "email": "pbj@senada.go.id"
    }
  },
  "message": "Usulan negosiasi ronde #1 berhasil diajukan kepada penyedia."
}
```

---

### 2. Respon Usulan Negosiasi (Penyedia)
*Penyedia menyetujui (`accepted`) atau menolak (`rejected`) usulan harga negosiasi dari PBJ.*

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/negosiasi/b868dc30-88bf-4221-93e2-15bdc2a7642e/respond`
- **Headers**:
  - `Authorization: Bearer <TOKEN_VENDOR>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `negosiasi:respond`

#### Request Body (Setuju / Accepted):
```json
{
  "status": "accepted",
  "catatan": "Penyedia menyetujui harga kesepakatan final Rp 150.000.000."
}
```

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "b868dc30-88bf-4221-93e2-15bdc2a7642e",
    "round": 1,
    "harga_usulan": 150000000,
    "status": "accepted",
    "responded_at": "2026-09-02T02:36:00.000Z",
    "penawaran": {
      "id": "0ed19bb6-2109-47d5-99bc-fff48fa18166",
      "status": "approved"
    }
  },
  "message": "Usulan harga negosiasi berhasil disetujui oleh penyedia."
}
```

---

### 3. Ambil Riwayat Histori Ronde Negosiasi
*Mengambil seluruh jejak ronde negosiasi untuk suatu penawaran harga.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/negosiasi/penawaran/0ed19bb6-2109-47d5-99bc-fff48fa18166/history`
- **Headers**:
  - `Authorization: Bearer <TOKEN_USER>`
- **Izin Diperlukan**: `negosiasi:read`

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "penawaran": {
      "id": "0ed19bb6-2109-47d5-99bc-fff48fa18166",
      "total_penawaran": 159000000,
      "status": "approved",
      "vendor": "PT Prima Pengadaan Nusantara"
    },
    "total_rounds": 2,
    "history": [
      {
        "id": "11111111-2222-3333-4444-555555555555",
        "round": 1,
        "harga_usulan": 145000000,
        "status": "rejected",
        "catatan": "Harga terlalu rendah | Respon Penyedia: Belum dapat menyetujui",
        "responded_at": "2026-09-02T02:35:30.000Z",
        "pengaju": {
          "name": "Siti Rahma (PBJ)",
          "email": "pbj@senada.go.id"
        }
      },
      {
        "id": "b868dc30-88bf-4221-93e2-15bdc2a7642e",
        "round": 2,
        "harga_usulan": 150000000,
        "status": "accepted",
        "catatan": "Harga kompromi final | Respon Penyedia: Kami setuju",
        "responded_at": "2026-09-02T02:36:00.000Z",
        "pengaju": {
          "name": "Siti Rahma (PBJ)",
          "email": "pbj@senada.go.id"
        }
      }
    ]
  },
  "message": "Riwayat negosiasi berhasil diambil."
}
```

---

# 📜 Modul 5: Surat Perintah Kerja (SPK) / Surat Pesanan

Sesuai **AGENTS.md §4 Tahap 5**:
- **PPK**: Menerbitkan SPK dari hasil negosiasi yang berstatus `accepted`. Nilai kontrak otomatis mengambil harga kesepakatan final.
- **Tanda Tangan**: Disediakan aksi tanda tangan digital/elektronik oleh PPK (`/sign`).
- **Export PDF Resmi**: Endpoint `/spk/:id/pdf` menghasilkan file PDF resmi lengkap dengan kop instansi, rincian barang, dan kolom tanda tangan bermaterai.

---

### 1. Terbitkan SPK Baru (PPK)
*Menerbitkan SPK dari ronde negosiasi yang telah disepakati.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/spk`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_ATAU_ADMIN>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `spk:create`

#### Request Body:
```json
{
  "negosiasi_id": "b868dc30-88bf-4221-93e2-15bdc2a7642e",
  "tanggal_spk": "2026-09-10",
  "tanggal_mulai": "2026-09-15",
  "tanggal_selesai": "2026-10-15"
}
```

#### Response Sukses (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "64d91f1f-c35a-482e-80ec-9b347010b8ce",
    "nomor_spk": "SPK/2026/09/0001",
    "nilai_kontrak": 150000000,
    "status": "draft",
    "tanggal_spk": "2026-09-10",
    "tanggal_mulai": "2026-09-15",
    "tanggal_selesai": "2026-10-15",
    "vendor": {
      "company_name": "PT Prima Pengadaan Nusantara",
      "npwp": "01.234.567.8-999.000"
    },
    "ppk": {
      "name": "Ahmad Dahlan (PPK)",
      "employee_id": "198001012005011001"
    }
  },
  "message": "Surat Perintah Kerja (SPK) berhasil diterbitkan dengan status draft."
}
```

---

### 2. Tanda Tangan SPK oleh PPK (`/sign`)
*Menandatangani SPK oleh Pejabat Pembuat Komitmen (`draft` ➔ `signed`).*

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/spk/64d91f1f-c35a-482e-80ec-9b347010b8ce/sign`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_ATAU_ADMIN>`
- **Izin Diperlukan**: `spk:sign`

---

### 3. Unduh / Export Dokumen SPK ke Format PDF (`/pdf`)
*Menghasilkan dokumen cetak resmi SPK dalam format PDF untuk keperluan berkas fisik & penempelan materai.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/spk/64d91f1f-c35a-482e-80ec-9b347010b8ce/pdf`
- **Headers**:
  - `Authorization: Bearer <TOKEN_USER>`
- **Response**: File binary `application/pdf` (`Content-Disposition: attachment; filename="SPK-....pdf"`)

---

# 🚚 Modul 6: Serah Terima Barang & Resume SPK

Sesuai **AGENTS.md §4 Tahap 6**:
- **Penyedia**: Mengunggah berkas pengiriman (Surat Jalan / BAST / Izin Mulai Kerja).
- **PPK**: Melakukan verifikasi fisik barang dan menyelesaikan proses serah terima (`pending` ➔ `completed`), yang otomatis memperbarui status SPK menjadi `completed`.
- **Resume SPK**: Menyediakan ringkasan pengadaan lengkap untuk integrasi pelaporan keuangan **SAKTI (oleh PPSPM)** dan **Laporan Realisasi**.

---

### 1. Unggah Dokumen Surat Jalan / Pengiriman (Penyedia)
*Penyedia mengunggah surat jalan atau bukti pengiriman barang.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/serah-terima/64d91f1f-c35a-482e-80ec-9b347010b8ce/documents`
- **Headers**:
  - `Authorization: Bearer <TOKEN_VENDOR>`
- **Body**: `form-data` dengan field `file` (PDF/JPG/PNG)

---

### 2. Selesaikan Proses Serah Terima (PPK)
*PPK menandatangani BAST dan menyelesaikan penerimaan barang (`pending` ➔ `completed`).*

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/serah-terima/64d91f1f-c35a-482e-80ec-9b347010b8ce/complete`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPK_ATAU_ADMIN>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `serah_terima:update`

#### Request Body:
```json
{
  "tanggal_serah_terima": "2026-10-10",
  "catatan": "Barang diterima lengkap sesuai spesifikasi teknis dan telah diuji fungsi."
}
```

---

### 3. Ambil Resume SPK Lengkap (`/resume`)
*Mengambil ringkasan lengkap seluruh proses pengadaan (HPS, Undangan, Penawaran, Kesepakatan Negosiasi, SPK, dan Serah Terima).*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/serah-terima/64d91f1f-c35a-482e-80ec-9b347010b8ce/resume`
- **Headers**:
  - `Authorization: Bearer <TOKEN_USER>`
- **Izin Diperlukan**: `serah_terima:read` atau `spk:read`

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "spk": {
      "id": "64d91f1f-c35a-482e-80ec-9b347010b8ce",
      "nomor_spk": "SPK/2026/09/0001",
      "status": "completed",
      "nilai_kontrak": 150000000,
      "tanggal_spk": "2026-09-10",
      "signed_at": "2026-09-10T08:00:00.000Z"
    },
    "pihak": {
      "ppk": { "name": "Ahmad Dahlan (PPK)", "employee_id": "198001012005011001" },
      "vendor": { "company_name": "PT Prima Pengadaan Nusantara", "npwp": "01.234.567.8-999.000" }
    },
    "pengadaan": {
      "nomor_hps": "HPS/2026/09/0001",
      "nama_paket": "Pengadaan Laptop dan Perangkat IT Kantor 2026",
      "total_hps": 165000000
    },
    "kesepakatan_negosiasi": {
      "harga_final": 150000000,
      "catatan": "Penyedia menyetujui harga kesepakatan final Rp 150.000.000."
    },
    "serah_terima": {
      "id": "fdd0bf13-1762-47dd-923e-7952da4da617",
      "status": "completed",
      "tanggal_serah_terima": "2026-10-10",
      "documents": [
        {
          "file_name": "Surat_Jalan_Workstation_001.pdf",
          "file_type": "application/pdf"
        }
      ]
    }
  },
  "message": "Resume SPK dan Berita Acara berhasil diambil."
}
```

---

# 📊 Modul 7: Pelaporan Keuangan (SAKTI & Laporan Realisasi)

Sesuai **AGENTS.md §4 Tahap 7 & §5**:
- **PPSPM (Pejabat Penandatangan SPM)**: Bagian keuangan melihat data Resume SPK untuk keperluan penerbitan SPM di aplikasi eksternal **SAKTI**, lalu mencatat nomor referensi SPM yang diterbitkan ke SENADA.
- **Petugas Laporan Realisasi**: Melihat Resume SPK dan menginput/mengelola data realisasi keuangan belanja instansi.

---

### 1. Input Nomor Referensi SPM dari SAKTI (PPSPM)
*Mencatat nomor SPM yang telah diterbitkan dari aplikasi SAKTI untuk suatu paket SPK.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/laporan/spm`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PPSPM_ATAU_ADMIN>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `spm:create`

#### Request Body:
```json
{
  "spk_id": "64d91f1f-c35a-482e-80ec-9b347010b8ce",
  "nomor_spm": "SPM/00234/2026",
  "tanggal_spm": "2026-10-12",
  "status": "processed"
}
```

#### Response Sukses (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "460e3d87-294a-43e3-83ce-e7c0606084ab",
    "spk_id": "64d91f1f-c35a-482e-80ec-9b347010b8ce",
    "nomor_spm": "SPM/00234/2026",
    "tanggal_spm": "2026-10-12",
    "status": "processed",
    "ppspm": {
      "name": "Dewi Lestari (PPSPM)",
      "employee_id": "198505122008122001"
    }
  },
  "message": "Referensi nomor SPM SAKTI berhasil dicatat."
}
```

---

### 2. Input Laporan Realisasi Keuangan (Petugas Realisasi)
*Mencatat data realisasi penyerapan anggaran atas kontrak SPK.*

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/laporan/realisasi`
- **Headers**:
  - `Authorization: Bearer <TOKEN_PETUGAS_LAPORAN_ATAU_ADMIN>`
  - `Content-Type: application/json`
- **Izin Diperlukan**: `laporan:create`

#### Request Body:
```json
{
  "spk_id": "64d91f1f-c35a-482e-80ec-9b347010b8ce",
  "nilai_realisasi": 150000000,
  "tanggal_realisasi": "2026-10-15",
  "keterangan": "Realisasi pembayaran pelunasan termin 100%.",
  "status": "submitted"
}
```

#### Response Sukses (`201 Created`):
```json
{
  "success": true,
  "data": {
    "id": "3b07f33f-9050-4a3f-b44b-9f2d4cb820dc",
    "spk_id": "64d91f1f-c35a-482e-80ec-9b347010b8ce",
    "nilai_realisasi": 150000000,
    "tanggal_realisasi": "2026-10-15",
    "keterangan": "Realisasi pembayaran pelunasan termin 100%.",
    "status": "submitted"
  },
  "message": "Laporan realisasi keuangan berhasil dibuat."
}
```

---

### 3. Rekapitulasi Pelaporan Keuangan (Dashboard)
*Menyajikan ringkasan nilai kontrak belanja, total realisasi anggaran, dan status proses SPM SAKTI.*

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/laporan/rekap`
- **Headers**:
  - `Authorization: Bearer <TOKEN_USER>`
- **Izin Diperlukan**: `laporan:read` atau `spm:read`

#### Response Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "rekap_kontrak": {
      "total_spk": 1,
      "total_nilai_kontrak": 150000000
    },
    "rekap_realisasi": {
      "total_realisasi_submitted": 150000000,
      "persentase_realisasi": "100.00"
    },
    "rekap_spm_sakti": {
      "processed": 1,
      "pending": 0
    }
  },
  "message": "Rekapitulasi pelaporan keuangan berhasil diambil."
}
```





