# RESPONSIVE DESIGN AUDIT REPORT — SIAM-UNKLAB
**Pengujian Multi-Device & Evaluasi Breakpoint Layar**

*Standar Target: 320px (Mobile S), 375px/390px (Mobile M/L), 768px (Tablet), 1024px (Laptop), 1280px+ (Desktop)*
*Tanggal Pengujian: 10 November 2026*

---

## 1. Matriks Pengujian Breakpoint

| Layar / Perangkat | Resolusi | Area Diuji | Hasil Pengujian | Catatan Perilaku |
|---|---|---|---|---|
| **Mobile Kecil** | 320px - 360px | Landing Page, Login, Dashboard | **PASS** | Teks judul tidak terpotong, tombol 1-klik demo tersusun rapi, tanpa horizontal scrollbar tidak disengaja. |
| **Mobile Standar** | 375px - 414px | KRS Builder, Jadwal, Presensi | **PASS** | Header beralih ke tombol menu hamburger; sidebar muncul sebagai drawer dengan backdrop blur. |
| **Tablet Portrait** | 768px | Matriks Jadwal, Tabel Nilai, Dosen | **PASS** | Grid 2-kolom aktif, tabel presensi dapat digulir horizontal dengan aman (*controlled scroll*). |
| **Laptop / Desktop** | 1024px - 1440px | Seluruh Modul & Dashboard | **PASS** | Sidebar vertikal penuh (288px), container max-width 7xl (1280px), layout multi-kolom bekerja maksimal. |

---

## 2. Pola Adaptasi Komponen Kunci pada Mobile

### 2.1 Navigasi & Header
- **Desktop (≥ 1024px)**: Sidebar kiri tetap terlihat (*fixed/static*), header menampilkan search bar lengkap dengan shortcut `Ctrl+K`, tombol switcher peran, notifikasi bell, dan avatar pengguna.
- **Mobile (< 1024px)**:
  - Tombol hamburger di kiri atas membuka *Off-Canvas Drawer* dengan backdrop gelap transparan (`bg-slate-900/60`).
  - Search bar disembunyikan agar header tetap bersih dan tidak bertumpukan.
  - Menu profil dan notifikasi tetap dapat diakses dengan mudah di kanan atas.

### 2.2 Tabel Data & Daftar Kartu
- Tabel nilai dan presensi dibungkus container `overflow-x-auto` dengan padding sentuh (*touch target*) minimal 44px untuk memastikan kenyamanan pengguna di layar sentuh.
- Pada KRS Builder, kolom ringkasan berpindah ke bagian bawah katalog mata kuliah pada layar smartphone, sehingga alur pemilihan tetap berurutan dan logis.

### 2.3 Modal & Popover
- Seluruh modal dialog (Konfirmasi Keluar, Detail Kelas, Ajukan KRS) memiliki `max-w-md w-full mx-4` dengan padding aman, sehingga tidak pernah melebihi batas layar ponsel (*no screen overflow*).
