# FIXES & IMPROVEMENTS CHANGELOG — SIAM-UNKLAB
**Catatan Perubahan dan Rekayasa Perbaikan Terinci**

---

## [Versi 1.1.0] — 10 November 2026

### 🚀 Fitur Baru Ditambahkan
1. **Beranda Publik Pra-Login (`LandingPage.tsx`)**:
   - Membangun landing page profesional berstandar universitas modern di rute `/`.
   - Dilengkapi hero section dengan headline, deskripsi, CTA, dan mockup dashboard interaktif dengan tab 3 peran.
   - Menyajikan 8 fitur unggulan, ringkasan ekosistem 3 peran pengguna, 4 langkah alur akademik, dan footer institusi dengan tautan resmi UNKLAB.
2. **Sistem Notifikasi Toast Terpusat (`ToastContext.tsx`)**:
   - Mendukung varian: `success`, `warning`, `danger`, `info`.
   - Mengambang elegan di kanan bawah layar dengan animasi halus dan auto-dismiss.
   - Terintegrasi pada login, logout, penyimpanan draft KRS, submit KRS, dan persetujuan dosen.
3. **Modal Dialog Konfirmasi Keluar (Logout Confirmation)**:
   - Pengguna disuguhkan dialog konfirmasi sebelum sesi diakhiri untuk mencegah aksi tidak disengaja.

### 🎨 Desain & UI/UX Refinement
1. **Aset Branding Resmi UNKLAB**:
   - Mengunduh dan menerapkan logo resmi Universitas Klabat resolusi tinggi (`unklab-logo.png`) pada favicon, header beranda, login, sidebar, navbar, dan footer.
2. **Pola Jadwal Perkuliahan Youcare (`SchedulePage.tsx`)**:
   - Layout 2 kolom: Mini kalender bulanan dan daftar mata kuliah di kiri, serta matriks jadwal waktu dan hari (Senin s/d Jumat) di kanan.
   - Kartu sesi perkuliahan menggunakan warna pastel lembut dengan indikator jam dan ruang.
   - Popover modal rincian kelas saat kartu sesi diklik.
3. **Penyempurnaan Halaman Login (`LoginPage.tsx`)**:
   - Penambahan tombol *Show/Hide Password* (ikon mata).
   - Penambahan opsi *Remember Me*.
   - Tombol navigasi kembali ke beranda utama.
   - Peningkatan responsivitas tombol pintas demo 1-klik.

### 🛠️ Perbaikan Teknis & Bug Fixes
1. **Pembersihan Modul Tak Terpakai**:
   - Menghapus folder sisa template `src/components/layout/app-layout` dan `src/components/shared/header` yang menyebabkan kegagalan build TS2307 (`@/i18n`).
2. **Penyempurnaan AuthContext**:
   - Pengunjung baru tidak lagi otomatis login secara *default*, melainkan memulai sesi dari beranda publik.
   - Penambahan pencatatan timestamp login sesi.
3. **Integritas Tipe Data TypeScript**:
   - Memperbaiki pemanggilan properti `identityNumber` pada `User`, `enrolled` pada `CourseClass`, dan `createdAt` pada `SystemNotification`.
   - Memastikan `tsc -b` berhasil dengan 0 error.
