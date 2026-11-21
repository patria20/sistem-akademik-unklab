# SIAM-UNKLAB — Sistem Informasi Akademik & Manajemen Studi Universitas Klabat

**SIAM-UNKLAB** merupakan prototipe aplikasi Sistem Informasi Akademik dan Manajemen Studi Universitas Klabat yang dikembangkan untuk membantu pengelolaan aktivitas akademik mahasiswa dan dosen dalam satu sistem terpadu.

Aplikasi ini dirancang untuk mendukung proses akademik, mulai dari pengisian Kartu Rencana Studi (KRS), pemantauan jadwal dan presensi, pengelolaan nilai, pemantauan kemajuan studi, hingga konsultasi dan pelaporan masalah akademik.

SIAM-UNKLAB juga mengintegrasikan **AI Academic Assistant** berbasis Google Gemini untuk membantu mahasiswa memperoleh informasi dan rekomendasi akademik berdasarkan konteks data serta aturan akademik yang tersedia.

Aplikasi ini merupakan prototipe yang berfokus pada lingkungan akademik Program Studi Informatika Universitas Klabat dengan acuan kurikulum 2024.

---

## 1. Identitas Visual dan Design System

- **Tema Desain:** Professional University — Premium Academic Experience.
- **Primary Navy:** `#142B4A`
- **Primary Blue:** `#2563EB`
- **Background:** `#F5F7FB`
- **White:** `#FFFFFF`
- **Success:** `#16A34A`
- **Warning:** `#D97706`
- **Danger:** `#DC2626`
- **Text Primary:** `#1F2937`
- **Text Secondary:** `#64748B`

Antarmuka dirancang dengan pendekatan modern, responsif, dan konsisten agar mudah digunakan oleh mahasiswa maupun dosen.

---

## 2. Fitur Utama Berdasarkan Peran

### A. Portal Mahasiswa (Student)

1. **Dashboard Akademik**
   - Menampilkan ringkasan informasi akademik mahasiswa.
   - Menampilkan IPK, IPS, SKS, dan perkembangan studi.
   - Menampilkan informasi jadwal perkuliahan dan notifikasi akademik.
   - Menyediakan informasi dan rekomendasi akademik.

2. **Profil Mahasiswa**
   - Menampilkan informasi identitas dan data akademik mahasiswa.

3. **Pengisian dan Pengelolaan KRS**
   - Menampilkan mata kuliah yang dapat dikontrak.
   - Memeriksa prasyarat mata kuliah.
   - Memvalidasi jumlah SKS.
   - Memeriksa bentrok jadwal perkuliahan.
   - Menampilkan status pengajuan KRS.
   - Mendukung proses persetujuan dan revisi KRS oleh dosen.

4. **Pengajuan Add/Drop Mata Kuliah**
   - Memfasilitasi pengajuan penambahan atau penghapusan mata kuliah.
   - Menampilkan status pengajuan perubahan KRS.

5. **Jadwal Perkuliahan**
   - Menampilkan jadwal kuliah mahasiswa.
   - Membantu mahasiswa melihat informasi mata kuliah dan waktu perkuliahan.

6. **Presensi Perkuliahan**
   - Menampilkan catatan kehadiran mahasiswa.
   - Memantau persentase kehadiran setiap mata kuliah.

7. **Nilai Akademik**
   - Menampilkan nilai mata kuliah.
   - Menyediakan informasi hasil akademik mahasiswa.

8. **Transkrip dan Riwayat Akademik**
   - Menggabungkan informasi transkrip dan riwayat akademik dalam satu halaman.
   - Menampilkan riwayat mata kuliah dan nilai berdasarkan semester.

9. **Kemajuan Studi**
   - Menampilkan perkembangan penyelesaian studi.
   - Memantau jumlah SKS yang telah diperoleh dan sisa SKS menuju kelulusan.
   - Menampilkan informasi mata kuliah yang sudah dan belum diselesaikan.

10. **Konsultasi Akademik**
    - Memfasilitasi komunikasi mahasiswa dengan dosen penasihat akademik.
    - Menampilkan riwayat konsultasi dan tanggapan dosen.

11. **AI Academic Assistant (KlabatAI)**
    - Membantu mahasiswa memperoleh informasi akademik.
    - Memberikan rekomendasi perencanaan studi dan mata kuliah.
    - Membantu menjawab pertanyaan terkait permasalahan akademik.
    - Menggunakan Google Gemini sebagai model AI melalui backend aplikasi.

12. **Laporan Masalah Akademik**
    - Memungkinkan mahasiswa melaporkan masalah presensi, KRS, dan nilai.
    - Menyediakan pilihan kategori masalah.
    - Memungkinkan mahasiswa memilih mata kuliah terkait.
    - Menyediakan deskripsi masalah dan riwayat laporan.
    - Menampilkan status tindak lanjut laporan.

### B. Portal Dosen (Lecturer)

1. **Dashboard Dosen**
   - Menampilkan ringkasan aktivitas akademik dosen.
   - Menampilkan informasi kelas dan mahasiswa bimbingan.
   - Menyediakan informasi aktivitas akademik yang perlu ditindaklanjuti.

2. **Manajemen Mahasiswa Bimbingan**
   - Menampilkan daftar mahasiswa yang menjadi tanggung jawab dosen penasihat akademik.
   - Menyediakan akses informasi akademik mahasiswa bimbingan.

3. **Manajemen Kelas**
   - Menampilkan dan mengelola informasi kelas perkuliahan.

4. **Roster Perkuliahan**
   - Menampilkan daftar mahasiswa yang terdaftar dalam kelas.
   - Membantu dosen melihat peserta perkuliahan.

5. **Input dan Pengelolaan Nilai**
   - Memfasilitasi pengisian dan pengelolaan nilai mahasiswa.
   - Menyediakan informasi nilai berdasarkan mata kuliah dan mahasiswa.

6. **Persetujuan KRS**
   - Menampilkan pengajuan KRS mahasiswa bimbingan.
   - Memungkinkan dosen menyetujui atau meminta revisi pengajuan.
   - Menyediakan catatan untuk tindak lanjut pengajuan mahasiswa.

7. **Konsultasi Akademik**
   - Memungkinkan dosen melihat konsultasi dari mahasiswa.
   - Menyediakan fasilitas untuk memberikan tanggapan konsultasi.

8. **Laporan Masalah Akademik**
   - Menampilkan laporan masalah akademik mahasiswa bimbingan.
   - Mengelola status laporan menjadi dalam peninjauan atau selesai.
   - Membantu dosen memantau tindak lanjut masalah presensi, KRS, dan nilai.

---

## 3. Aturan Akademik Sistem

SIAM-UNKLAB menerapkan aturan akademik berdasarkan ketentuan yang digunakan dalam prototipe.

| Ketentuan | Aturan |
|---|---|
| Program studi | Informatika Universitas Klabat |
| Acuan kurikulum | Kurikulum 2024 |
| Target kelulusan | 151 SKS |
| Maksimum SKS | 23 SKS jika IPK ≥ 3,35 |
| Maksimum SKS lainnya | 20 SKS jika IPK < 3,35 |
| Nilai kelulusan mata kuliah | C atau lebih tinggi |
| Prasyarat mata kuliah | Harus memenuhi ketentuan prasyarat |
| Pengulangan mata kuliah | Menggunakan nilai resmi terbaru berdasarkan tahun akademik dan semester |

Untuk mata kuliah yang diulang, perhitungan IPK dan SKS kelulusan menggunakan nilai resmi dari percobaan terakhir, bukan nilai terbaik. Nilai yang masih menunggu persetujuan atau ditolak tidak menggantikan nilai resmi.

---

## 4. Integrasi Artificial Intelligence (AI)

SIAM-UNKLAB mengintegrasikan Google Gemini melalui backend untuk menyediakan layanan AI Academic Assistant.

### Teknologi AI
- **AI Provider:** Google Gemini.
- **Integrasi Backend:** Node.js dan Express.
- **Library:** `@google/genai`.
- **Konfigurasi API Key:** `GEMINI_API_KEY` melalui file `.env`.

### Fungsi AI
1. Membantu memberikan rekomendasi perencanaan studi berdasarkan data akademik mahasiswa.
2. Membantu menjawab pertanyaan terkait permasalahan akademik.
3. Memberikan informasi berdasarkan konteks akademik yang tersedia.

AI digunakan sebagai pendukung pengambilan keputusan, bukan pengganti validasi aturan akademik. Pemeriksaan prasyarat, batas SKS, dan perhitungan akademik tetap dilakukan oleh logika aplikasi.

**Catatan:** Nama model Gemini yang pernah digunakan dalam konfigurasi sebelumnya adalah `gemini-3.5-flash-lite`. Pastikan kembali konfigurasi `server.js` sebelum mencantumkan versi model sebagai konfigurasi terbaru.

---

## 5. Teknologi yang Digunakan

| Bagian | Teknologi |
|---|---|
| Frontend | React 19 |
| Bahasa pemrograman | TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router |
| Ikon | Lucide React |
| Backend | Node.js |
| Backend framework | Express 5 |
| AI | Google Gemini |
| AI SDK | `@google/genai` |
| Konfigurasi lingkungan | dotenv |
| Penyimpanan prototipe | Browser Local Storage |

### Arsitektur Aplikasi

Aplikasi menggunakan pendekatan frontend dan backend terpisah:

- **Frontend:** Menangani antarmuka dan interaksi pengguna.
- **Backend:** Menangani permintaan layanan AI melalui endpoint API.
- **AI Service:** Menghubungkan aplikasi dengan Google Gemini.
- **Academic Service:** Mengelola proses dan data akademik aplikasi.
- **Local Storage:** Menyimpan data prototipe pada browser pengguna.

Penyimpanan menggunakan Local Storage berarti data tidak otomatis tersinkronisasi antarperangkat atau browser yang berbeda.

---

## 6. Akun Demo dan Hak Akses

SIAM-UNKLAB menyediakan dua jenis akun demo:

| Role | Hak Akses |
|---|---|
| Mahasiswa | Mengakses fitur akademik mahasiswa, KRS, jadwal, presensi, nilai, kemajuan studi, konsultasi, AI, dan laporan masalah |
| Dosen | Mengakses dashboard dosen, mahasiswa bimbingan, kelas, roster, nilai, persetujuan KRS, konsultasi, dan laporan masalah |

Sistem menggunakan satu akun demo mahasiswa dan satu akun demo dosen. Informasi email dan password demo mengikuti konfigurasi autentikasi yang tersedia dalam source code.

---

## 7. Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js versi 18 atau lebih baru.
- npm.
- Git (opsional, untuk mengambil repository).

### Instalasi

```bash
git clone https://github.com/patria20/sistem-akademik-unklab.git
cd sistem-akademik-unklab
npm install
```

### Konfigurasi Environment

Buat file `.env` di direktori utama proyek:

```env
GEMINI_API_KEY=API_KEY_MILIK_ANDA
```

Gunakan API key milik sendiri dan jangan membagikan atau mengunggah file `.env` ke repository publik.

### Menjalankan Development Server

```bash
npm run dev
```

Untuk backend AI, jalankan server backend sesuai script yang tersedia pada `package.json` atau konfigurasi proyek.

Frontend Vite secara default menggunakan alamat:

`http://localhost:5173`

Backend Express menggunakan port 3001 dalam konfigurasi pengembangan yang digunakan sebelumnya.

### Build Produksi

```bash
npm run build
```

### Preview Hasil Build

```bash
npm run preview
```

---

## 8. Struktur Direktori Proyek

```text
sistem-akademik-unklab/
├── dist/                       # Hasil build aplikasi
├── src/
│   ├── components/
│   │   ├── common/             # Komponen umum
│   │   ├── layout/             # Layout, Navbar, Sidebar
│   │   └── ui/                 # Komponen antarmuka
│   ├── context/
│   │   ├── AuthContext.tsx     # Pengelolaan autentikasi
│   │   └── AcademicContext.tsx # Pengelolaan konteks akademik
│   ├── data/
│   │   └── mockAcademicData.ts # Data prototipe akademik
│   ├── pages/
│   │   ├── auth/               # Halaman autentikasi
│   │   ├── student/            # Halaman mahasiswa
│   │   └── lecturer/           # Halaman dosen
│   ├── routes/
│   │   └── index.tsx           # Pengaturan routing
│   ├── services/
│   │   ├── academicService.ts  # Layanan akademik
│   │   ├── aiAcademicService.ts# Integrasi layanan AI
│   │   └── reportService.ts    # Layanan laporan masalah
│   ├── types/                  # Definisi tipe TypeScript
│   └── utils/                  # Validasi dan perhitungan akademik
├── server.js                   # Backend Express
├── .env                        # Konfigurasi environment
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Struktur di atas merupakan gambaran direktori utama. File dan subdirektori tambahan mengikuti implementasi terbaru dalam repository.

---

## 9. Status dan Batasan Prototipe

SIAM-UNKLAB dikembangkan sebagai prototipe sistem informasi akademik. Beberapa batasan implementasi saat ini:

1. Data akademik prototipe disimpan menggunakan Local Storage dan data simulasi yang tersedia dalam aplikasi.
2. Data tidak menggunakan database terpusat yang tersinkronisasi antarperangkat.
3. Autentikasi akun demo belum dapat dianggap sebagai autentikasi produksi yang aman.
4. Persetujuan KRS, pengelolaan nilai, dan proses akademik lainnya merupakan simulasi alur kerja dalam prototipe.
5. Layanan AI bergantung pada konfigurasi backend dan ketersediaan API Gemini.
6. AI tidak memiliki kewenangan untuk menyetujui KRS atau mengubah nilai resmi mahasiswa secara mandiri.

Dengan demikian, sistem ini ditujukan untuk demonstrasi alur kerja dan fungsionalitas aplikasi akademik, bukan sebagai pengganti sistem akademik resmi universitas.

---

## 10. Penutup

SIAM-UNKLAB diharapkan dapat menjadi gambaran penerapan sistem informasi akademik yang terintegrasi, dengan menggabungkan pengelolaan aktivitas mahasiswa, layanan dosen penasihat akademik, dan dukungan kecerdasan buatan.

Melalui sistem ini, proses akademik diharapkan dapat disajikan secara lebih terstruktur, informatif, dan mudah dipantau oleh pengguna.

**Dikembangkan sebagai prototipe aplikasi Sistem Informasi Akademik dan Manajemen Studi Universitas Klabat (SIAM-UNKLAB).**
