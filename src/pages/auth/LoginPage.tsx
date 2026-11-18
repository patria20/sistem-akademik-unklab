import React, { useState } from 'react';
import { useAuth, detectRoleFromUnklabEmail } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router';
import {
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import type { UserRole } from '../../types/academic';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, danger } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('12410168@student.unklab.ac.id');
  const [password, setPassword] = useState('unklab2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const detectedRole = detectRoleFromUnklabEmail(email);

  const handleQuickDemo = (_demoRole: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('unklab2026');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mohon isi alamat email UNKLAB dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        success('Login Berhasil', 'Selamat datang di Portal Akademik SIAM-UNKLAB.');
        const targetPath =
          result.user.role === 'student' ? '/student/dashboard' : '/lecturer/dashboard';
        navigate(targetPath, { replace: true });
      } else {
        const message =
          result.error || 'Email UNKLAB tidak valid. Gunakan @student.unklab.ac.id atau @unklab.ac.id.';
        setErrorMsg(message);
        danger('Login Gagal', message);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* Return to Home link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Utama</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official UNKLAB Logo */}
        <div className="inline-flex items-center justify-center p-2 mb-3 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <img
            src="/images/logo/unklab-logo.png"
            alt="Logo Resmi Universitas Klabat"
            className="w-16 h-16 object-contain"
          />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[#142B4A]">
          SIAM<span className="text-[#2563EB]">-UNKLAB</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
          Sistem Informasi Akademik & Manajemen Studi Universitas Klabat
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80 space-y-6">
          {/* Quick Demo Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilih Cepat Akun (1-Klik):
              </label>
            </div> 
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('student', '12410168@student.unklab.ac.id')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  detectedRole === 'student'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">Mahasiswa</span>
                <span className="text-[10px] text-slate-500 font-normal block truncate">
                  @student.unklab.ac.id
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('lecturer', 'dosen@unklab.ac.id')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  detectedRole === 'lecturer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs block">Dosen PA</span>
                <span className="text-[10px] text-slate-500 font-normal block truncate">
                  @unklab.ac.id
                </span>
              </button>
            </div>
          </div>
 
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Email UNKLAB
                </label>
                {detectedRole && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      detectedRole === 'student'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    Terdeteksi: {detectedRole === 'student' ? 'Mahasiswa' : 'Dosen'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="12410168@student.unklab.ac.id atau dosen@unklab.ac.id"
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Mahasiswa: <code>nim@student.unklab.ac.id</code> • Dosen: <code>nama@unklab.ac.id</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Masukkan password bebas..."
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Ingat sesi saya</span>
              </label>
              <span className="text-[11px] text-slate-400">Pusat Bantuan TIK</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#142B4A] to-[#2563EB] hover:from-[#0F2038] hover:to-[#1D4ED8] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi Akses...</span>
              ) : (
                <>
                  <span>Masuk ke SIAM-UNKLAB</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-100">
            <p>
              Mengalami kendala akun? Hubungi <strong>Helpdesk TIK UNKLAB</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
