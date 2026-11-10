import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { role } = useAuth();

  const homePath =
    role === 'student'
      ? '/student/dashboard'
      : role === 'lecturer'
      ? '/lecturer/dashboard'
      : '/admin/dashboard';

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6 text-center">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">403 — Akses Ditolak</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Anda tidak memiliki izin untuk mengakses halaman atau fitur ini. Setiap modul dalam SIAM-UNKLAB
          dibatasi berdasarkan hak akses peran (Mahasiswa, Dosen, atau Administrator).
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to={homePath}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dashboard Saya
          </Link>
        </div>
      </div>
    </div>
  );
};
