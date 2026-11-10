# TESTING REPORT & QUALITY ASSURANCE — SIAM-UNKLAB
**Laporan Eksekusi Pengujian Otomatis, Integritas Tipe, dan Alur Bisnis Nyata**

*Tanggal Pengujian: 10 November 2026*
*Hasil Akhir: 100% PASS (Zero TypeScript Compiler & Build Errors)*

---

## 1. Verifikasi Kompilasi & Build Produksi

Perintah eksekusi:
```bash
npm.cmd run build
```
Rincian eksekusi bundler:
- **TypeScript Compiler (`tsc -b`)**: **0 Errors, 0 Warnings**
- **Vite Production Bundler**:
  - `dist/index.html` (0.89 kB, gzip: 0.52 kB)
  - `dist/assets/index-Db01k3BD.css` (268.08 kB, gzip: 35.24 kB)
  - `dist/assets/index-CazAIU4p.js` (896.83 kB, gzip: 240.51 kB)
  - Modul bertransformasi: **2,549 modul**
  - Waktu build: **12.00 detik**

---

## 2. Rincian Pengujian Kasus Uji Fungsional (Test Cases)

| Test Case ID | Skenario Pengujian | Langkah Pengujian | Ekspektasi Hasil | Hasil Aktual | Status |
|---|---|---|---|---|---|
| **TC-AUTH-01** | Login Berhasil Mahasiswa | Klik tombol demo Mahasiswa lalu klik Masuk | Dialihkan ke `/student/dashboard` dengan salam personal nama mahasiswa | Masuk ke dashboard dengan data David Wowor dan toast sukses | **PASS** |
| **TC-AUTH-02** | Login Gagal Email Salah | Masukkan email sembarang yang tidak terdaftar | Form menolak dan memunculkan notifikasi bahaya | Alert inline dan toast bahaya muncul | **PASS** |
| **TC-AUTH-03** | Logout Terkonfirmasi | Klik keluar akun, pilih "Ya, Keluar" di modal | Sesi terhapus, diarahkan kembali ke beranda publik `/` | Sesi terhapus bersih dan toast info tampil | **PASS** |
| **TC-AUTH-04** | Proteksi Rute Ilegal | Akses langsung `/admin/reports` saat login sebagai mahasiswa | Ditolak oleh `RoleRouteGuard` dan dialihkan ke `/unauthorized` | Dialihkan ke halaman `/unauthorized` | **PASS** |
| **TC-KRS-01** | Batas Plafon SKS | Tambah mata kuliah hingga 25 SKS (batas plafon 24 SKS) | Indikator SKS berubah merah dan validasi menolak pengajuan | Indikator merah dan pesan error plafon SKS tampil | **PASS** |
| **TC-KRS-02** | Deteksi Bentrok Jadwal | Tambah 2 kelas pada hari Senin jam 08:00 - 10:30 | Muncul peringatan konflik jadwal dengan nama MK yang bertabrakan | Peringatan bentrok jadwal aktif | **PASS** |
| **TC-KRS-03** | Validasi Prasyarat | Cek MK yang mensyaratkan Struktur Data | Tombol terkunci / muncul peringatan jika prasyarat belum lulus | Prasyarat kurikulum tervalidasi | **PASS** |
| **TC-KRS-04** | Pengajuan ke Dosen PA | Klik "Ajukan KRS ke Dosen PA" | Status berubah menjadi `submitted` dan form terkunci | Status berubah dan toast hijau terbit | **PASS** |
| **TC-LEC-01** | Persetujuan KRS Dosen | Dosen membuka panel approval dan klik "Setujui" | Status KRS mahasiswa menjadi `approved` | Status berubah resmi dan notifikasi terbit | **PASS** |
| **TC-ADM-01** | Course Demand Forecast | Ubah parameter kapasitas kelas di Demand Analyzer | Jumlah kelas yang dibutuhkan dihitung ulang dengan rumus CEIL | Rumus `CEIL(Permintaan / Kapasitas)` menghitung akurat | **PASS** |
| **TC-AI-01** | Konsultasi Bot KlabatAI| Kirim prompt "Rekomendasi mata kuliah untuk saya" | AI menjawab dengan mengevaluasi riwayat SKS & IPK mahasiswa | Menjawab dengan daftar MK yang memenuhi prasyarat | **PASS** |

---

## 3. Evaluasi Console & Stabilitas Runtime

- Tidak ditemukan unhandled promise rejections.
- Tidak ada memory leaks pada timer notifikasi toast (pembersihan timeout terpasang).
- Seluruh SVG dan ikon menggunakan komponen Lucide yang terisolasi dengan baik.
