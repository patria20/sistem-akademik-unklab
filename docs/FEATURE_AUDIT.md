# FEATURE AUDIT REPORT — SIAM-UNKLAB
**Audit Fungsionalitas Modul, Interaktivitas Tombol, Form, dan Validasi Bisnis**

*Status Acuan: PASS (Berjalan Penuh), PARTIAL (Sebagian), FAIL (Gagal), NOT IMPLEMENTED (Belum Ada)*
*Tanggal Pengujian: 10 November 2026*

---

## 1. Modul Publik & Autentikasi

| Fitur | Elemen / Alur | Deskripsi Pengujian | Status | Catatan / Bukti |
|---|---|---|---|---|
| **Beranda Publik** | Header Navigation | Klik navigasi anchor (Beranda, Tentang, Fitur, Peran, Panduan) dan CTA Login | **PASS** | Halus, responsif pada desktop dan drawer mobile. |
| **Beranda Publik** | Hero Mockup Tabs | Tab beralih antara Mahasiswa, Dosen PA, dan Admin Prodi | **PASS** | State aktif berganti dinamis dengan preview metrik relevan. |
| **Login** | Form Submission | Validasi input email dan password kosong | **PASS** | Menolak submit jika kosong, menampilkan inline alert. |
| **Login** | Password Visibility | Toggle tombol Show/Hide Password mata | **PASS** | Beralih antara tipe `text` dan `password` dengan benar. |
| **Login** | 1-Click Demo Switch | Klik tombol Mahasiswa, Dosen PA, atau Admin | **PASS** | Mengisi otomatis kredensial dan memilih peran tujuan. |
| **Logout** | Konfirmasi Keluar | Klik tombol keluar pada Navbar atau Sidebar | **PASS** | Memunculkan modal dialog konfirmasi; jika dibatalkan tetap di halaman, jika ya menghapus sesi dan redirect ke beranda dengan toast. |

---

## 2. Modul Portal Mahasiswa (Student)

| Fitur | Elemen / Alur | Deskripsi Pengujian | Status | Catatan / Bukti |
|---|---|---|---|---|
| **Dashboard** | KPI Cards | Menampilkan IPK, IPS, SKS Lulus, dan SKS Ditempuh | **PASS** | Nilai sinkron dengan profil `David Wowor` (IPK 3.82, SKS 110/144). |
| **Dashboard** | Recharts Grafik Tren | Menampilkan chart area IPS vs IPK dari Semester 1 s/d 5 | **PASS** | Tooltip interaktif bekerja, kurva halus sesuai data riwayat. |
| **KRS Builder** | Pemilihan Kelas | Menambah mata kuliah ke keranjang rencana studi | **PASS** | Tombol `Pilih Kelas` menambahkan item ke daftar ringkasan. |
| **KRS Builder** | Hapus Kelas | Menghapus mata kuliah dari rencana studi | **PASS** | Menghapus item seketika dan mengkalkulasi ulang total SKS. |
| **KRS Builder** | Plafon SKS | Pengecekan batas SKS berdasarkan IPS semester lalu | **PASS** | Plafon 24 SKS untuk IPS 3.80; indikator berubah merah jika melebihi plafon. |
| **KRS Builder** | Cek Prasyarat | Validasi kelulusan mata kuliah prasyarat | **PASS** | Memeriksa nilai lulus minimal C pada mata kuliah prasyarat kurikulum. |
| **KRS Builder** | Deteksi Bentrok | Pengecekan hari dan rentang jam perkuliahan yang sama | **PASS** | Memunculkan alert peringatan jika jadwal hari/jam saling bertabrakan. |
| **KRS Builder** | Simpan Draf | Tombol `Simpan Draft` | **PASS** | Tersimpan di state dan localStorage, memicu toast notifikasi sukses. |
| **KRS Builder** | Ajukan KRS | Tombol `Ajukan KRS ke Dosen PA` | **PASS** | Mengubah status menjadi `submitted`, mengunci form dari perubahan tidak sah. |
| **Kemajuan Studi** | 144 SKS Tracker | Ringkasan pemenuhan kurikulum sarjana | **PASS** | Rincian kategori mata kuliah wajib, pilihan, konsentrasi, MBKM. |
| **Transkrip & KHS** | Tabel Nilai | Daftar nilai per semester dan transkrip lengkap | **PASS** | Skala bobot nilai resmi UNKLAB (A=4.0, A-=3.67, B+=3.33, B=3.0, dst). |
| **Presensi** | Monitoring 75% | Kalkulasi persentase kehadiran per mata kuliah | **PASS** | Indikator peringatan dini batas 75% untuk memenuhi syarat UAS. |
| **Jadwal Kuliah** | Pola Youcare | Kalender mini, daftar mata kuliah, dan grid mingguan | **PASS** | Filter hari bekerja, klik sesi membuka modal detail perkuliahan. |
| **Bimbingan PA** | Konsultasi Chat | Mengirim pesan bimbingan akademik ke Dosen PA | **PASS** | Pesan tersimpan dalam sesi percakapan bimbingan. |
| **AI Assistant** | KlabatAI Bot | Konsultasi kurikulum, rekomendasi MK, dan beban SKS | **PASS** | Memberikan jawaban berbasis aturan kurikulum UNKLAB disertai sumber & disclaimer. |

---

## 3. Modul Portal Dosen (Lecturer)

| Fitur | Elemen / Alur | Deskripsi Pengujian | Status | Catatan / Bukti |
|---|---|---|---|---|
| **Dashboard** | Metrik Kelas & Bimbingan | Ringkasan kelas ajar, mahasiswa PA, dan antrean KRS | **PASS** | Sinkron dengan profil dosen `Dr. Ronny Gosal`. |
| **KRS Approval** | Verifikasi Rencana Studi | Meninjau daftar mata kuliah yang diajukan mahasiswa | **PASS** | Modal peninjauan menampilkan rincian MK, total SKS, dan riwayat IPK. |
| **KRS Approval** | Aksi 1-Klik Setujui | Tombol `Setujui KRS` | **PASS** | Mengubah status KRS menjadi `approved`, memicu notifikasi toast hijau. |
| **KRS Approval** | Aksi Catatan Revisi | Memberikan feedback revisi ke mahasiswa | **PASS** | Mengubah status menjadi `revision` dengan pesan catatan dosen. |
| **Kelas & Absensi** | Presensi Mahasiswa | Melihat rekap dan melakukan koreksi absensi | **PASS** | Perhitungan persentase kehadiran mahasiswa terbarui. |
| **Input Nilai** | Komponen Nilai | Input nilai tugas, kuis, UTS, dan UAS | **PASS** | Kalkulasi nilai huruf otomatis berdasarkan bobot. |
| **Konsultasi** | Balas Bimbingan | Membalas pesan bimbingan mahasiswa | **PASS** | Riwayat pesan bimbingan terbarui secara kronologis. |

---

## 4. Modul Portal Admin (Akademik & Prodi)

| Fitur | Elemen / Alur | Deskripsi Pengujian | Status | Catatan / Bukti |
|---|---|---|---|---|
| **Dashboard** | KPI Universitas | Total mahasiswa, dosen, prodi, dan kelas aktif | **PASS** | Ringkasan terstruktur dengan kartu metrik analitik. |
| **Demand Analyzer**| Formula CEIL PRD | Kalkulasi proyeksi kebutuhan kelas semester depan | **PASS** | Menerapkan formula `CEIL(Permintaan / Kapasitas)` secara deterministik. |
| **Katalog MK** | Manajemen Kurikulum | Pencarian mata kuliah, bobot SKS, dan semester | **PASS** | Filter program studi dan pencarian teks bekerja lancar. |
| **Peta Prasyarat** | Visualisasi Dependensi | Diagram dependensi antar mata kuliah | **PASS** | Menyajikan hubungan prasyarat yang jelas dan terbaca. |
| **Audit Logs** | Rekaman Aktivitas | Riwayat transaksi keamanan dan aktivitas akademik | **PASS** | Mencatat timestamp, user ID, aksi, dan deskripsi kejadian. |
