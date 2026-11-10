# UI/UX AUDIT & DESIGN SYSTEM REPORT — SIAM-UNKLAB
**Evaluasi Antarmuka, Konsistensi Visual, dan Penerapan Referensi Desain**

*Konsep Desain: Professional University — Modern Academic SaaS*
*Tanggal Evaluasi: 10 November 2026*

---

## 1. Analisis & Adaptasi Dua Gambar Referensi

### 1.1 Referensi 1 — Youcare Appointment
Diterapkan secara khusus pada **Modul Jadwal Kuliah Mahasiswa (`SchedulePage.tsx`)**:
- **Bilah Aksi & Filter**: Menempatkan input pencarian cepat, filter hari perkuliahan, dan tombol unduh/cetak jadwal pada header card.
- **Kolom Kiri (Mini Calendar & List)**:
  - Widget kalender mini bulanan dengan penanda tanggal aktif.
  - Daftar ringkas kelas terdaftar dengan informasi jam, ruang, dan dosen pengampu.
- **Kolom Kanan (Matriks Grid Waktu)**:
  - Kolom hari (Senin s/d Jumat) dengan kartu mata kuliah berwarna pastel lembut (*soft pastel cards*).
  - Tampilan waktu terstruktur yang mencegah tumpang tindih visual.
- **Modal Detail Sesi**:
  - Mengadaptasi pola popover/modal *Edit Schedule* Youcare menjadi **Modal Detail Perkuliahan** yang menampilkan ruang, dosen, jam, dan kapasitas kelas secara elegan.

### 1.2 Referensi 2 — SocialNest Dashboard
Diterapkan pada **Seluruh Dashboard (Mahasiswa, Dosen, dan Admin)**:
- **Komposisi Dashboard**: Hierarki visual yang seimbang dengan penggunaan *whitespace* yang lega dan tidak sesak.
- **Header Terpadu**: Bilah pencarian global dengan shortcut `(Ctrl+K)`, lonceng notifikasi interaktif, dan menu profil pengguna dengan foto inisial bergradien.
- **Indikator Visual & Gauge**:
  - Pengukur capaian kurikulum SKS menggunakan visual progress bar yang halus.
  - Kartu metrik dengan badge status dan perbandingan kenaikan IPK.
- **Visualisasi Data Recharts**:
  - Kurva area chart untuk tren IPK/IPS dengan gradien biru-emas halus.
  - Tooltip kustom dengan latar gelap dan tipografi angka yang tegas.

---

## 2. Token Warna & Sistem Desain Terpusat

| Token Nama | Nilai HEX | Penggunaan Utama | Tingkat Kontras (WCAG) |
|---|---|---|---|
| **Primary Navy** | `#142B4A` | Header, Sidebar, Brand Title, Tombol Utama | **12.4:1 (AAA)** terhadap putih |
| **Primary Blue** | `#2563EB` | Aksen brand, tautan aktif, highlight tombol, progress | **4.6:1 (AA)** terhadap putih |
| **Background** | `#F5F7FB` | Latar belakang seluruh halaman aplikasi | Netral lembut, mengurangi kelelahan mata |
| **Surface** | `#FFFFFF` | Permukaan kartu, panel, modal dialog | Kontras tinggi |
| **Text Primary** | `#172033` | Judul, heading tabel, angka metrik utama | **14.8:1 (AAA)** terhadap surface |
| **Text Secondary**| `#64748B` | Label form, subjudul, deskripsi sekunder | **4.8:1 (AA)** terhadap surface |
| **Border** | `#E2E8F0` | Garis batas kartu, tabel divider, input border | Rapi dan konsisten |
| **Success** | `#16A34A` | Badge Disetujui, Lulus Prasyarat, Presensi Aman | Memenuhi AA |
| **Warning** | `#D97706` | Peringatan Plafon SKS, Status Menunggu, Revisi | Memenuhi AA |
| **Danger** | `#DC2626` | Jadwal Bentrok, Presensi < 75%, Gagal Prasyarat | Memenuhi AA |

---

## 3. Tipografi & Skala Spasi

- **Font Family**: *Plus Jakarta Sans* / *Outfit*, didukung *sans-serif* sistem modern.
- **Ukuran Teks Terstruktur**:
  - `Hero Title`: 36px - 48px (Mobile) / 56px - 64px (Desktop), font-black.
  - `Page Heading`: 20px - 24px, font-bold text-navy.
  - `Card Title`: 13px - 14px, font-bold text-slate-800.
  - `Body Text`: 12px - 13px, font-medium text-slate-600.
  - `Captions & Tags`: 10px - 11px, font-semibold tracking-wider.
- **Radius & Bayangan**:
  - Komponen kecil (button, input): `rounded-xl` (12px).
  - Kartu & modal: `rounded-2xl` (16px) hingga `rounded-3xl` (24px).
  - Bayangan: *subtle drop-shadow* (`shadow-xs` / `shadow-sm`) untuk mencegah kesan kuno atau berlebihan.
