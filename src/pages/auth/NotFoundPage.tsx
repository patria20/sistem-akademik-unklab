import React from 'react';
import { Link } from 'react-router';
import { FileQuestion, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotFoundPage: React.FC = () => {
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
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">404 — Halaman Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tautan yang Anda tuju tidak tersedia atau telah dipindahkan dalam sistem akademik SIAM-UNKLAB.
        </p>
        <div className="pt-2">
          <Link
            to={homePath}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};
