# SIAM-UNKLAB — Sistem Informasi Akademik & Manajemen Studi Universitas Klabat

**SIAM-UNKLAB** adalah prototipe enterprise aplikasi portal akademik Universitas Klabat yang modern, responsif, dan kaya fitur. Aplikasi ini dirancang untuk mendemonstrasikan integrasi aktivitas mahasiswa, dosen penasihat akademik (PA), dan bagian administrasi universitas dalam satu ekosistem terpadu.

---

## 🎨 Identitas Visual & Design System

- **Tema Desain**: *Professional University — Premium Academic Experience*
- **Primary Navy**: `#142B4A`
- **Primary Blue**: `#2563EB`
- **Background**: `#F5F7FB`
- **White**: `#FFFFFF`
- **Success**: `#16A34A`
- **Warning**: `#D97706`
- **Danger**: `#DC2626`
- **Text Primary**: `#1F2937`
- **Text Secondary**: `#64748B`

---

## 🚀 Fitur Utama Berdasarkan Peran

### 1. 🎓 Portal Mahasiswa (Student)
- **Dashboard Akademik**: Ringkasan IPK kumulatif, IPS terakhir, SKS lulus/ditempuh/sisa, grafik perkembangan IP semester, kartu notifikasi penting, jadwal hari ini, dan rekomendasi AI.
- **Rencana Studi (KRS) Builder**:
  - Validasi prasyarat mata kuliah otomatis (memeriksa lulus mata kuliah prasyarat dengan nilai minimum C).
  - Pengecekan konflik jadwal kuliah secara *real-time* (hari dan jam bentrok).
  - Pembatasan batas maksimum SKS berdasarkan IPS semester sebelumnya (Aturan UNKLAB: IPS ≥ 3.00: 24 SKS, IPS 2.50-2.99: 21 SKS, IPS 2.00-2.49: 18 SKS, IPS < 2.00: 15 SKS).
  - Status pengajuan KRS (*draft*, diajukan, disetujui, revisi).
- **Kemajuan Studi (Academic Progress)**: Pelacak kelulusan 144 SKS, pengelompokan mata kuliah wajib, konsentrasi, pilihan, dan MBKM.
- **Transkrip & Nilai (Grades)**: Tampilan KHS semester dan transkrip kumulatif lengkap dengan skala bobot nilai resmi UNKLAB (A hingga F).
- **Presensi Kehadiran (Attendance)**: Monitoring kehadiran per mata kuliah dengan peringatan dini batas minimal 75% kehadiran untuk mengikuti Ujian Akhir Semester (UAS).
- **Jadwal Kuliah Mingguan (Schedule)**: Kalender dan tabel jadwal perkuliahan terstruktur.
- **Konsultasi Dosen PA**: Formulir dan riwayat percakapan bimbingan akademik dengan Dosen Penasihat Akademik.
- **AI Academic Assistant (KlabatAI)**: Chatbot asisten AI interaktif untuk konsultasi mata kuliah, syarat kelulusan, dan rekomendasi beban SKS.

### 2. 👨‍🏫 Portal Dosen (Lecturer)
- **Dashboard Dosen**: Metrik kelas yang diajar, jumlah mahasiswa bimbingan, antrean KRS menunggu persetujuan, dan jadwal mengajar hari ini.
- **Persetujuan KRS (KRS Approval)**: Panel verifikasi dan peninjauan rencana studi mahasiswa bimbingan dengan tombol 1-klik Setujui, Revisi, atau Tolak berserta catatan dosen.
- **Manajemen Kelas & Mahasiswa**: Daftar mahasiswa terdaftar per kelas perkuliahan.
- **Input & Koreksi Presensi**: Rekap kehadiran pertemuan mahasiswa dengan kalkulasi persentase otomatis.
- **Input Nilai Kuliah**: Pengisian nilai komponen tugas, kuis, UTS, dan UAS.
- **Bimbingan & Konsultasi**: Balas pesan bimbingan mahasiswa.
- **Analisis Kelas**: Statistik distribusi nilai dan tingkat kehadiran per kelas.

### 3. 🏛️ Portal Administrasi Akademik (Admin)
- **Dashboard Admin**: KPI universitas (total mahasiswa aktif, dosen, program studi, kelas berjalan).
- **Course Demand Analyzer**: Kalkulasi otomatis estimasi kebutuhan kelas semester depan menggunakan formula PRD:
  $$\text{Dibutuhkan} = \lceil \text{Estimasi Permintaan} / \text{Kapasitas Maksimal Kelas} \rceil$$
- **Katalog Mata Kuliah & Peta Prasyarat**: Master data kurikulum, kode MK, bobot SKS, dan aturan prasyarat.
- **Log Audit Sistem**: Pelacak aktivitas keamanan dan riwayat aksi pengguna secara transparan.

---

## 🔑 Kredensial Akun Demo (1-Klik di Halaman Login)

Halaman login telah dilengkapi tombol pintas **1-Klik Demo Switcher** untuk berpindah peran tanpa perlu mengetik manual:

| Peran (Role) | Email Demo | Password Demo | Halaman Tujuan |
|---|---|---|---|
| **Mahasiswa** | `mahasiswa@unklab.ac.id` | `student123` | `/student/dashboard` |
| **Dosen PA** | `dosen@unklab.ac.id` | `lecturer123` | `/lecturer/dashboard` |
| **Admin Akademik** | `admin@unklab.ac.id` | `admin123` | `/admin/dashboard` |

> *Catatan*: Terdapat juga *Role Switcher Dropdown* di Navbar kanan atas untuk berpindah peran secara instan saat sesi sedang aktif.

---

## 💻 Menjalankan Aplikasi Secara Lokal

### 1. Prasyarat
- Node.js versi 18 atau yang lebih baru.

### 2. Menjalankan Mode Development
Buka terminal di folder project (`c:\projek finel frond end\siam-unklab`) dan jalankan:

```bash
npm run dev
```

Aplikasi akan berjalan pada alamat:
`http://localhost:5173`

### 3. Build & Preview Mode Produksi
Untuk memastikan kompilasi TypeScript dan bundler Vite bersih:

```bash
npm run build
npm run preview
```

---

## 📁 Struktur Direktori

```
siam-unklab/
├── dist/                  # Hasil kompilasi siap deploy
├── src/
│   ├── components/        # Komponen UI Reusable
│   │   ├── common/        # PageHeader, StatCard, StatusBadge
│   │   ├── layout/        # AppLayout, Navbar, Sidebar dinamis per role
│   │   └── ui/            # Komponen base (Button, Card, Badge, dll.)
│   ├── context/           # React Context (AuthContext & AcademicContext)
│   ├── data/              # Mock data terpadu (mahasiswa, dosen, MK, KRS, dll.)
│   ├── pages/
│   │   ├── admin/         # Dashboard, CourseDemandAnalyzer, Courses, AuditLogs
│   │   ├── auth/          # LoginPage, UnauthorizedPage, NotFoundPage
│   │   ├── lecturer/      # Dashboard, KRSApproval, Classes, Grades, Attendance, dll.
│   │   └── student/       # Dashboard, StudyPlan (KRS), Progress, Grades, AI, dll.
│   ├── routes/            # React Router v7 & RoleRouteGuard
│   ├── services/          # AcademicService & AIAcademicService
│   ├── types/             # Definisi TypeScript lengkap (academic.ts)
│   └── utils/             # AcademicValidator, GPACalculator, DemandForecaster
├── package.json
└── vite.config.ts
```

---
*Dikembangkan dengan penuh dedikasi untuk Universitas Klabat (UNKLAB).*
