# AUTHENTICATION & SECURITY AUDIT — SIAM-UNKLAB
**Evaluasi Keamanan, Manajemen Sesi, dan Kontrol Akses Berbasis Peran (RBAC)**

*Klasifikasi Tingkat Risiko: LOW / MEDIUM / HIGH / CRITICAL*
*Tanggal Audit: 10 November 2026*

---

## 1. Audit Autentikasi & Penyimpanan Sesi

| Parameter | Implementasi Aktual | Analisis Risiko | Rekomendasi / Mitigasi |
|---|---|---|---|
| **Penyimpanan Kredensial** | `localStorage` hanya menyimpan metadata profil (`id`, `name`, `email`, `role`, `identityNumber`). Password **tidak pernah disimpan**. | **LOW** | Memenuhi kaidah keamanan frontend prototype. |
| **Session Tracking** | Timestamp login dicatat di `siam_unklab_session_time` untuk monitoring durasi sesi. | **LOW** | Mendukung pendeteksian sesi aktif dan kedaluwarsa. |
| **Logout Sanitization** | Memanggil `logout()`, menghapus kunci auth di `localStorage`, me-reset state context ke `null`, dan redirect ke `/`. | **LOW** | Sesi privat bersih seutuhnya; navigasi balik (Back) diblokir oleh guard. |
| **Input Sanitization** | Input email dan sandi divalidasi dan di-trim sebelum diproses. | **LOW** | Menghindari celah injeksi whitespace atau payload tak diinginkan. |

---

## 2. Role-Based Access Control (RBAC) & Protected Routes

Setiap rute di bawah `/student/*`, `/lecturer/*`, dan `/admin/*` dilindungi oleh komponen [`RoleRouteGuard`](file:///c:/projek%20finel%20frond end/siam-unklab/src/routes/RoleRouteGuard.tsx):

1. **Pemeriksaan Status Autentikasi**:
   - Jika pengguna belum login (`!isAuthenticated || !user`), permintaan rute privat langsung dialihkan ke `/login`.
2. **Pemeriksaan Otorisasi Peran**:
   - Jika pengguna dengan peran `student` mencoba mengakses URL langsung dosen `/lecturer/grades` atau admin `/admin/audit-logs`, sistem langsung menolak dan mengalihkan ke halaman `/unauthorized`.
   - Sebaliknya, dosen dan admin tidak dapat mengubah data mahasiswa di luar kewenangannya.
3. **Penyembunyian Menu Dinamis**:
   - Komponen Sidebar dan Navbar hanya merender menu navigasi yang relevan dengan peran aktif pengguna, mencegah kebocoran informasi struktural.

---

## 3. Batasan Keamanan Prototype (Security Disclosure)

> [!NOTE]
> **Pernyataan Batasan Keamanan (Frontend-Only Prototype):**
> SIAM-UNKLAB saat ini beroperasi sebagai arsitektur frontend prototype mandiri dengan simulasi penyimpanan berbasis browser (`localStorage`). Untuk implementasi *production-grade* di masa mendatang:
> 1. Autentikasi wajib menggunakan protokol standar industri seperti **OAuth 2.0 / OpenID Connect** atau **JWT dengan HttpOnly Cookies**.
> 2. Validasi hak akses (authorization) harus dievaluasi ulang di sisi backend/API server pada setiap *endpoint* mutasi data.
> 3. Integrasi rate-limiting untuk mencegah *brute-force login*.
