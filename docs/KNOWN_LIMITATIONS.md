# KNOWN LIMITATIONS & FUTURE ROADMAP — SIAM-UNKLAB
**Transparansi Batasan Prototipe dan Rekomendasi Tahap Lanjutan**

---

## 1. Batasan Status Prototipe Saat Ini

1. **Penyimpanan Berbasis Browser (`localStorage`)**:
   - Seluruh mutasi data akademik (pengajuan KRS, perubahan presensi, nilai, konsultasi chat) disimpan secara lokal di dalam browser pengguna melalui `AcademicService`.
   - Data simulasi akan kembali ke kondisi semula jika cache/storage browser dibersihkan secara manual.
2. **Ketiadaan Server Backend Nyata**:
   - Sistem belum terhubung ke database relasional PostgreSQL / MySQL di cloud atau sistem terpusat Universitas Klabat yang sebenarnya.
   - Hak akses dan aturan bisnis saat ini ditegakkan di sisi klien (*client-side deterministic validation*).
3. **AI Academic Assistant (Simulasi Cerdas Terpandu)**:
   - KlabatAI beroperasi menggunakan mesin simulasi aturan lokal (*deterministic curriculum reasoning engine*) yang membaca grafik prasyarat dan data riwayat mahasiswa.
   - Tidak menggunakan API Key cloud LLM pihak ketiga langsung di frontend untuk menjaga keamanan dari kebocoran token.
4. **Cetak Dokumen & Ekspor**:
   - Fitur cetak jadwal dan KHS memanfaatkan fungsi cetak native peramban (`window.print()`). Integrasi generator PDF server-side belum diimplementasikan.

---

## 2. Rekomendasi Roadmap Pengembangan Lanjutan

1. **Pembangunan API Backend**:
   - Mengembangkan backend REST / GraphQL menggunakan NestJS, Express, atau Go dengan database PostgreSQL.
2. **Integrasi OAuth 2.0 / SSO UNKLAB**:
   - Mengintegrasikan Single Sign-On (SSO) akun Google Workspace / Microsoft 365 resmi kampus (`@unklab.ac.id`).
3. **LLM RAG Engine**:
   - Membangun pipeline Retrieval-Augmented Generation (RAG) berbasis vector store dari Buku Pedoman Akademik UNKLAB untuk asisten AI.
