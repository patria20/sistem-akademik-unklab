# SYSTEM AUDIT REPORT — SIAM-UNKLAB
**Sistem Informasi Akademik dan Manajemen Studi Universitas Klabat**

*Dokumen Audit Arsitektur Sistem, Komponen, Alur Data, dan Standar Rekayasa Perangkat Lunak.*
*Tanggal Audit: 10 November 2026*

---

## 1. Identifikasi Proyek & Lingkungan

- **Nama Sistem**: SIAM-UNKLAB (Sistem Informasi Akademik dan Manajemen Studi Universitas Klabat)
- **Tipe Proyek**: Web Application (Single-Page Application / SPA)
- **Framework Inti**: React 19.2.8 + TypeScript 5.8
- **Bundler & Build Tool**: Vite 8.3.5 (@tailwindcss/vite 4.3.3)
- **CSS Engine**: Tailwind CSS v4.3.3 (Modern Token System, @theme)
- **Routing Engine**: React Router v7.4.0 (Data & Declarative Routes with RoleRouteGuard)
- **Visualisasi Grafik**: Recharts 3.10.1 & ApexCharts 7.8.0
- **Status Kompilasi**: `tsc -b && vite build` **PASS (0 Errors, 2549 modules transformed)**

---

## 2. Audit Struktur Direktori & Arsitektur

```
siam-unklab/
├── public/
│   ├── favicon.png                  # Lambang resmi Universitas Klabat
│   ├── images/logo/unklab-logo.png  # Logo resolusi tinggi resmi UNKLAB
│   └── images/                      # Aset ilustrasi & icon pendukung
├── src/
│   ├── components/
│   │   ├── common/                  # PageHeader, StatCard, StatusBadge
│   │   ├── layout/                  # AppLayout, Navbar, Sidebar dinamis per role
│   │   └── ui/                      # Base primitive components (Dialog, Card, Button, etc.)
│   ├── context/
│   │   ├── AuthContext.tsx          # Autentikasi, multi-role RBAC, session timestamp
│   │   ├── AcademicContext.tsx      # Jembatan data KRS, kelas, presensi, nilai, notifikasi
│   │   └── ToastContext.tsx         # Sistem notifikasi toast terpusat
│   ├── data/
│   │   └── mockAcademicData.ts      # Dataset komprehensif mahasiswa, dosen, MK, kelas, prasyarat
│   ├── pages/
│   │   ├── public/LandingPage.tsx   # Beranda publik pra-login sesuai spesifikasi Bagian 6
│   │   ├── auth/                    # LoginPage, UnauthorizedPage, NotFoundPage
│   │   ├── student/                 # 8 Modul Mahasiswa (Dashboard, KRS, Transkrip, Jadwal, dll.)
│   │   ├── lecturer/                # 7 Modul Dosen (Dashboard, Persetujuan KRS, Nilai, dll.)
│   │   └── admin/                   # 4 Modul Admin (Dashboard, Demand Analyzer, Katalog, Audit)
│   ├── routes/
│   │   ├── index.tsx                # Konfigurasi rute hierarkis terpadu
│   │   └── RoleRouteGuard.tsx       # Pelindung rute berbasis peran (RBAC Guard)
│   ├── services/
│   │   ├── academicService.ts       # State persistence layer dengan localStorage engine
│   │   └── aiAcademicService.ts     # Logika cerdas KlabatAI penasihat kurikulum
│   ├── types/
│   │   └── academic.ts              # Definisi interface TypeScript yang ketat
│   └── utils/
│       ├── academicValidator.ts     # Mesin validasi KRS (prasyarat, bentrok, kapasitas, plafon)
│       ├── gpaCalculator.ts         # Kalkulator bobot nilai resmi UNKLAB (A-F)
│       └── demandForecaster.ts      # Formula PRD proyeksi kelas prodi: CEIL(Demand/Cap)
```

---

## 3. Temuan Kritis Kondisi Awal & Status Penanganan

| ID | Komponen / Area | Temuan Masalah Awal | Dampak / Risiko | Solusi & Status Akhir |
|---|---|---|---|---|
| **SYS-01** | `layout/app-layout` & `shared/header` | Sisa file demo template mengimpor `@/i18n` yang tidak terinstal | `tsc -b` gagal dengan error TS2307 (Cannot find module) | **RESOLVED**. File demo lama yang tidak terpakai dibersihkan. |
| **SYS-02** | Root Routing (`/`) | Mengarahkan pengunjung baru langsung ke `/login` tanpa landing page | Pengunjung publik tidak mendapatkan gambaran institusi dan fitur sistem | **RESOLVED**. Dibuat `LandingPage.tsx` lengkap dengan hero, fitur, ekosistem 3 peran, dan panduan. |
| **SYS-03** | Branding & Logo | Menggunakan logo template generic bawaan TailAdmin | Tidak mencerminkan identitas resmi Universitas Klabat | **RESOLVED**. Diunduh dan diintegrasikan aset logo resmi UNKLAB resolusi tinggi. |
| **SYS-04** | Notification System | Belum ada feedback toast global saat aksi pengguna | Feedback aksi (simpan draft, ajukan KRS, login/logout) kurang informatif | **RESOLVED**. Dibuat `ToastContext.tsx` dengan varian success, warning, danger, info. |
| **SYS-05** | Logout Flow | Tombol logout langsung me-refresh tanpa dialog konfirmasi | Rawan klik tidak sengaja saat pengguna sedang bekerja | **RESOLVED**. Dibuat Accessible Logout Confirmation Modal di Navbar dan Sidebar. |
| **SYS-06** | Schedule Layout | Tampilan matriks kolom jadwal kuliah masih sederhana | Kurang optimal untuk kalender akademik harian | **RESOLVED**. Direfaktor mengikuti pola **Youcare** (kalender mini + daftar + time slots). |

---

## 4. Kesimpulan Kualitas Sistem

Sistem kini memenuhi standar arsitektur modern SPA:
1. Pemisahan tanggung jawab (*Separation of Concerns*) yang jelas antara Presentational Components, Context State, Service Layer, dan Utility Validators.
2. Tidak ada ketergantungan eksternal yang bocor (*leaked dependencies*).
3. Kode bersih dari error tipe TypeScript (`strict: true`).
