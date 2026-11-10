import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  CheckSquare,
  MessageSquare,
  Bot,
  BarChart3,
  Shield,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'student' | 'lecturer' | 'admin'>('student');

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'lecturer') return '/lecturer/dashboard';
    return '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner Disclaimer */}
      <div className="bg-[#142B4A] text-white py-1.5 px-4 text-center text-xs font-medium border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-sm bg-blue-600 text-[10px] font-bold tracking-wider uppercase">
            PROTOTIPE SISTEM
          </span>
          <span className="text-slate-300">
            Sistem Informasi Akademik dan Manajemen Studi Universitas Klabat (SIAM-UNKLAB).
          </span>
          <span className="text-blue-300 font-semibold hidden sm:inline">
            Tahun Akademik 2026/2027 Ganjil
          </span>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo/unklab-logo.png"
              alt="Logo Universitas Klabat"
              className="w-12 h-12 object-contain transition-transform group-hover:scale-105"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#142B4A]">SIAM</span>
                <span className="text-xl font-black tracking-tight text-[#2563EB]">-UNKLAB</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                Universitas Klabat
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#beranda" className="text-blue-600 hover:text-blue-700 transition-colors">
              Beranda
            </a>
            <a href="#tentang" className="hover:text-blue-600 transition-colors">
              Tentang Sistem
            </a>
            <a href="#fitur" className="hover:text-blue-600 transition-colors">
              Fitur Utama
            </a>
            <a href="#ekosistem" className="hover:text-blue-600 transition-colors">
              Peran Pengguna
            </a>
            <a href="#panduan" className="hover:text-blue-600 transition-colors">
              Panduan
            </a>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#0f2139] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Buka Dashboard ({user?.role?.toUpperCase()})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#142B4A] to-[#2563EB] hover:from-[#0f2139] hover:to-[#1d4ed8] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
            <a
              href="#beranda"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-blue-600"
            >
              Beranda
            </a>
            <a
              href="#tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-600"
            >
              Tentang Sistem
            </a>
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-600"
            >
              Fitur Utama
            </a>
            <a
              href="#ekosistem"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-600"
            >
              Peran Pengguna
            </a>
            <a
              href="#panduan"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-600"
            >
              Panduan
            </a>
            <div className="pt-2 border-t border-slate-100">
              {isAuthenticated ? (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#142B4A] text-white text-xs font-bold"
                >
                  <span>Buka Dashboard ({user?.role?.toUpperCase()})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold"
                >
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="beranda" className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Sistem Akademik Generasi Baru Universitas Klabat</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#142B4A] tracking-tight leading-tight sm:leading-none">
              SIAM<span className="text-[#2563EB]">-UNKLAB</span>
            </h1>
            <p className="mt-3 text-lg sm:text-xl font-bold text-slate-700">
              Sistem Informasi Akademik dan Manajemen Studi Universitas Klabat
            </p>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Platform terintegrasi yang menghubungkan aktivitas mahasiswa, dosen penasihat akademik,
              dan pimpinan program studi dalam satu ekosistem akademik yang terstruktur, transparan, dan
              didukung asisten kecerdasan buatan.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#142B4A] to-[#2563EB] hover:from-[#0e1d32] hover:to-[#1d4ed8] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>Masuk ke Portal Akademik</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#fitur"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Pelajari Fitur Utama</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500 bg-white/80 backdrop-blur-xs py-2 px-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="font-bold text-slate-700">Mode Uji Coba:</span>
              <span>Tersedia akun demo instan untuk Mahasiswa, Dosen PA, dan Admin (1-Klik di Login)</span>
            </div>
          </div>

          {/* Interactive Mockup Dashboard Preview Tabs */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-400 ml-2 tracking-wide">
                  PRATINJAU ANTARMUKA SISTEM
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('student')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'student'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portal Mahasiswa
                </button>
                <button
                  onClick={() => setActiveTab('lecturer')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'lecturer'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portal Dosen PA
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portal Admin Prodi
                </button>
              </div>
            </div>

            {/* Tab Content Cards */}
            <div className="mt-6">
              {activeTab === 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">Indeks Prestasi Kumulatif</span>
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-black text-blue-700 mt-2">3.82</p>
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">
                      Predikat: Magna Cum Laude • 110 SKS Lulus
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Rencana Studi (KRS)</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-black text-emerald-700 mt-2">20 SKS</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      Status: Disetujui Dosen PA (Batas Plafon 24 SKS)
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900">AI Academic Assistant</span>
                      <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-xs text-indigo-800 font-medium mt-2 line-clamp-2">
                      "Anda memenuhi syarat mengambil Tugas Akhir pada semester genap mendatang..."
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 text-indigo-800">
                      KlabatAI Aktif
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'lecturer' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Mahasiswa Bimbingan</span>
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-black text-emerald-700 mt-2">24 Mhs</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      3 KRS menunggu persetujuan Anda
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">Kelas Perkuliahan Aktif</span>
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-black text-blue-700 mt-2">4 Kelas</p>
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">
                      Algoritma, Pemrograman Web, AI Terapan
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">Verifikasi Presensi</span>
                      <CheckSquare className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-3xl font-black text-amber-700 mt-2">94.8%</p>
                    <p className="text-[11px] text-amber-600 font-semibold mt-1">
                      Rata-rata kehadiran mahasiswa di kelas
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900">Course Demand Analyzer</span>
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-black text-purple-700 mt-2">98.4%</p>
                    <p className="text-[11px] text-purple-600 font-semibold mt-1">
                      Akurasi proyeksi kelas formula CEIL
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">Mata Kuliah & Prasyarat</span>
                      <Compass className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-black text-blue-700 mt-2">68 MK</p>
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">
                      Kurikulum Informatika & Sistem Informasi
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Audit Keamanan & Log</span>
                      <Shield className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-3xl font-black text-slate-800 mt-2">100%</p>
                    <p className="text-[11px] text-slate-600 font-semibold mt-1">
                      Seluruh transaksi akademik terekam rapi
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
              <img
                src="/images/logo/unklab-logo.png"
                alt="Lambang Resmi Universitas Klabat"
                className="w-32 h-32 object-contain mb-6 drop-shadow-md"
              />
              <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-3">
                Tentang Universitas Klabat
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#142B4A]">
                Pendidikan Unggul Berlandaskan Iman & Karakter
              </h2>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Berdiri sejak tahun 1965 di kaki Gunung Klabat, Airmadidi, Universitas Klabat
                menyelenggarakan pendidikan tinggi berasas Kristen Advent yang mengintegrasikan
                keunggulan akademis, pengabdian spiritual, dan pembentukan integritas karakter.
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs font-bold text-slate-700">
                <a
                  href="https://www.unklab.ac.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800"
                >
                  <span>Situs Resmi UNKLAB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span>•</span>
                <a
                  href="https://filkom.unklab.ac.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800"
                >
                  <span>Fakultas Ilmu Komputer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#142B4A]">Pusat Akademik Terpadu</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Menyederhanakan siklus pengisian rencana studi, peninjauan prasyarat MK, persetujuan
                  dosen, hingga rekapitulasi KHS dan transkrip kumulatif.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#142B4A]">Tata Kelola & Validasi Ketat</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Plafon SKS berdasar IPS resmi UNKLAB, pembatasan 75% absensi untuk ujian akhir, dan
                  peta prasyarat yang terpantau secara otomatis.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#142B4A]">Analisis Kebutuhan Berbasis Data</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Memberikan rekomendasi kuota dan jumlah kelas yang dibutuhkan semester depan bagi
                  program studi menggunakan formula matematis presisi.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#142B4A]">Dukungan Asisten Cerdas</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Asisten AI KlabatAI siap membantu mahasiswa mengecek beban studi, syarat kelulusan,
                  dan konsultasi rencana karier keilmuan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="fitur" className="py-20 bg-[#F5F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Kaya Fitur & Lengkap
            </span>
            <h2 className="text-3xl font-black text-[#142B4A] mt-3">
              8 Fitur Utama Unggulan SIAM-UNKLAB
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Dirancang khusus untuk memenuhi standar tata kelola perguruan tinggi modern.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B4A]">KRS & Study Plan Builder</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Pilih mata kuliah dengan validasi prasyarat otomatis, pengecekan bentrok jadwal
                *real-time*, dan batas plafon SKS berdasar IPS semester sebelumnya.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B4A]">Jadwal Kuliah Kalender</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Tampilan jadwal perkuliahan terstruktur berbasis waktu dan hari ala antarmuka
                Youcare, lengkap dengan informasi ruang, dosen, dan modal detail sesi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B4A]">Transkrip & KHS Resmi</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Skala penilaian resmi UNKLAB (A, A-, B+, B, B-, C+, C, D, F), penghitungan IPK/IPS
                akurat, dan grafik tren kemajuan akademik mahasiswa.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B4A]">Presensi Kehadiran (75% UAS)</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Monitoring persentase kehadiran per mata kuliah dengan indikator peringatan dini batas
                minimal 75% untuk memenuhi syarat mengikuti Ujian Akhir Semester.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B4A]">Bimbingan Dosen PA</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Kanal percakapan dan konsultasi terstruktur antara mahasiswa dengan dosen penasihat
                akademik sebelum dan selama semester berjalan.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B4A]">Course Demand Analyzer</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Alat bantu cerdas bagi admin prodi untuk memproyeksikan kebutuhan pembukaan kelas
                semester baru berdasarkan formula resmi PRD: CEIL(Permintaan / Kapasitas).
              </p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B4A]">AI Academic Assistant</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Asisten AI interaktif (KlabatAI) yang memahami konteks kurikulum, memberi rekomendasi
                MK pilihan, dan membantu merencanakan kelulusan tepat waktu.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142B4A]">Notifikasi & Log Audit</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Pusat notifikasi terintegrasi untuk pemberitahuan status persetujuan KRS dan rekaman
                audit keamanan sistem yang transparan dan akuntabel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 User Roles / Ecosystem Section */}
      <section id="ekosistem" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Satu Ekosistem Akademik
            </span>
            <h2 className="text-3xl font-black text-[#142B4A] mt-3">
              Dirancang untuk 3 Peran Akademik
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Setiap peran memiliki dashboard spesifik, navigasi terisolasi, dan wewenang yang jelas.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-200/70 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold mb-6 shadow-md">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#142B4A]">Mahasiswa</h3>
                <p className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wide">
                  Student Experience
                </p>
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Susun KRS dengan kalkulasi otomatis batas SKS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Lihat KHS, transkrip nilai & grafik IPK</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Pantau jadwal mingguan dan batas kehadiran 75%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Konsultasi Dosen PA & KlabatAI Assistant</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-200/60">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center block transition-colors"
                >
                  Akses Sebagai Mahasiswa
                </Link>
              </div>
            </div>

            {/* Lecturer Card */}
            <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-200/70 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-6 shadow-md">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#142B4A]">Dosen Penasihat (PA)</h3>
                <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wide">
                  Faculty Advisor & Instructor
                </p>
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Persetujuan KRS mahasiswa bimbingan 1-klik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kelola kelas ajar & daftar presensi mahasiswa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Input dan rekapitulasi nilai komponen kuliah</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Balas bimbingan konsultasi studi mahasiswa</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-200/60">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center block transition-colors"
                >
                  Akses Sebagai Dosen
                </Link>
              </div>
            </div>

            {/* Admin Card */}
            <div className="p-8 rounded-3xl bg-purple-50/50 border border-purple-200/70 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold mb-6 shadow-md">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#142B4A]">Admin Program Studi</h3>
                <p className="text-xs font-semibold text-purple-600 mt-1 uppercase tracking-wide">
                  Academic Leadership
                </p>
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Master data mahasiswa, dosen & kurikulum MK</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Course Demand Analyzer proyeksi kebutuhan kelas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Pengelolaan jadwal perkuliahan & alokasi ruang</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Log audit transaksi keamanan seluruh sistem</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-purple-200/60">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center block transition-colors"
                >
                  Akses Sebagai Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guide / 4 Steps Section */}
      <section id="panduan" className="py-20 bg-[#F5F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Alur Akademik
            </span>
            <h2 className="text-3xl font-black text-[#142B4A] mt-3">
              4 Langkah Mudah Registrasi Studi
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Prosedur terpadu pengisian KRS hingga perkuliahan berjalan lancar.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-[#142B4A]">Konsultasi Awal</h3>
              <p className="mt-2 text-xs text-slate-600">
                Lakukan bimbingan dengan Dosen PA secara tatap muka atau melalui modul Konsultasi
                SIAM-UNKLAB.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-[#142B4A]">Pemilihan Mata Kuliah</h3>
              <p className="mt-2 text-xs text-slate-600">
                Pilih mata kuliah di KRS Builder sesuai batas plafon SKS dan pastikan syarat prasyarat
                terpenuhi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-[#142B4A]">Persetujuan Dosen PA</h3>
              <p className="mt-2 text-xs text-slate-600">
                Dosen PA meninjau pengajuan dan memberikan persetujuan atau catatan revisi melalui panel
                KRS Approval.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="text-sm font-bold text-[#142B4A]">Perkuliahan & Monitoring</h3>
              <p className="mt-2 text-xs text-slate-600">
                Jadwal resmi diterbitkan, presensi kehadiran tercatat, dan mahasiswa siap mengikuti
                perkuliahan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#142B4A] text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-700/60">
            {/* Col 1: Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo/unklab-logo.png"
                  alt="Logo Universitas Klabat"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                    SIAM<span className="text-blue-400">-UNKLAB</span>
                  </h3>
                  <p className="text-[11px] text-blue-200/80 font-medium">Universitas Klabat</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Sistem Informasi Akademik dan Manajemen Studi Universitas Klabat — Sebuah prototipe
                perangkat lunak independen yang dirancang untuk mendukung ekosistem perkuliahan modern,
                berkualitas, dan terintegrasi.
              </p>
              <p className="text-[11px] text-slate-400">
                Alamat Kampus: Jl. Arnold Mononutu, Airmadidi Bawah, Minahasa Utara, Sulawesi Utara 95371
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <a href="#beranda" className="hover:text-white transition-colors">
                    Beranda
                  </a>
                </li>
                <li>
                  <a href="#tentang" className="hover:text-white transition-colors">
                    Tentang Sistem
                  </a>
                </li>
                <li>
                  <a href="#fitur" className="hover:text-white transition-colors">
                    Fitur Utama
                  </a>
                </li>
                <li>
                  <a href="#ekosistem" className="hover:text-white transition-colors">
                    Peran Pengguna
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Halaman Masuk (Login)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Official References */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
                Tautan Resmi Kampus
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <a
                    href="https://www.unklab.ac.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Website Resmi UNKLAB</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://filkom.unklab.ac.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Fakultas Ilmu Komputer</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.unklab.ac.id/tentang-unklab/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Identitas & Sejarah Kampus</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.unklab.ac.id/visi-misi-tujuan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Visi, Misi & Tujuan</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© 2026 Universitas Klabat. All rights reserved.</p>
            <p className="text-[11px] text-slate-500 text-center sm:text-right">
              Disclaimer: SIAM-UNKLAB adalah prototipe sistem akademik independen untuk demonstrasi dan evaluasi studi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
