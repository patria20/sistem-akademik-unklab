import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Award,
  CheckSquare,
  MessageSquare,
  Bot,
  Users,
  FileCheck,
  ClipboardList,
  GraduationCap,
  Building2,
  GitBranch,
  BarChart3,
  History,
  X,
  Sparkles,
  Info,
  LogOut,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user, logout } = useAuth();
  const { activeKrs } = useAcademic();
  const { info } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    info('Sesi Diakhiri', 'Anda telah berhasil keluar dari sistem SIAM-UNKLAB.');
    navigate('/');
  };

  // Navigation Items per Role
  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    {
      name: 'Rencana Studi (KRS)',
      path: '/student/study-plan',
      icon: BookOpen,
      badge: activeKrs?.status ? activeKrs.status.toUpperCase() : undefined,
      badgeColor:
        activeKrs?.status === 'approved'
          ? 'bg-emerald-500/20 text-emerald-300'
          : 'bg-amber-500/20 text-amber-300',
    },
    { name: 'Kemajuan Studi', path: '/student/academic-progress', icon: Award },
    { name: 'Transkrip & KHS', path: '/student/grades', icon: ClipboardList },
    { name: 'Laporkan Masalah', path: '/student/report-problem', icon: AlertTriangle },
    { name: 'Jadwal Kuliah', path: '/student/schedule', icon: Calendar },
    { name: 'Konsultasi Dosen PA', path: '/student/consultation', icon: MessageSquare },
    {
      name: 'AI Academic Assistant',
      path: '/student/ai-assistant',
      icon: Bot,
      highlight: true,
      badge: 'BETA',
      badgeColor: 'bg-blue-500/30 text-blue-300',
    },
  ];

  const lecturerNav = [
    { name: 'Dashboard Dosen', path: '/lecturer/dashboard', icon: LayoutDashboard },
    { name: 'Kelas Saya', path: '/lecturer/classes', icon: BookOpen },
    { name: 'Mahasiswa Bimbingan', path: '/lecturer/students', icon: Users },
    {
      name: 'Persetujuan KRS',
      path: '/lecturer/krs-approval',
      icon: FileCheck,
      badge: '3 Baru',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    { name: 'Presensi & Absensi', path: '/lecturer/attendance', icon: CheckSquare },
    { name: 'Input Nilai Kuliah', path: '/lecturer/grades', icon: Award },
    { name: 'Konsultasi Bimbingan', path: '/lecturer/consultation', icon: MessageSquare },
    { name: 'Analisis Kelas', path: '/lecturer/class-analysis', icon: BarChart3 },
  ];

  const adminNav = [
    { name: 'Dashboard Admin', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Data Mahasiswa', path: '/admin/students', icon: Users },
    { name: 'Data Dosen', path: '/admin/lecturers', icon: GraduationCap },
    { name: 'Program Studi', path: '/admin/programs', icon: Building2 },
    { name: 'Kurikulum MBKM', path: '/admin/curriculums', icon: GitBranch },
    { name: 'Katalog Mata Kuliah', path: '/admin/courses', icon: BookOpen },
    { name: 'Peta Prasyarat', path: '/admin/prerequisites', icon: GitBranch },
    { name: 'Manajemen Kelas', path: '/admin/classes', icon: ClipboardList },
    { name: 'Jadwal Perkuliahan', path: '/admin/schedules', icon: Calendar },
    {
      name: 'Course Demand Analyzer',
      path: '/admin/reports',
      icon: BarChart3,
      badge: 'CEIL FORMULA',
      badgeColor: 'bg-blue-500/20 text-blue-300',
    },
    { name: 'Log Audit Sistem', path: '/admin/audit-logs', icon: History },
  ];

  const currentNav = role === 'student' ? studentNav : role === 'lecturer' ? lecturerNav : adminNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#142B4A] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-30 border-r border-slate-700/60 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with Official UNKLAB Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-700/60 bg-[#11233d]">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo/unklab-logo.png"
              alt="Logo Resmi Universitas Klabat"
              className="w-9 h-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
            />
            <div>
              <h1 className="text-sm font-black tracking-tight text-white leading-tight">
                SIAM<span className="text-[#2563EB]">-UNKLAB</span>
              </h1>
              <p className="text-[10px] text-blue-200/70 font-semibold uppercase tracking-wider">
                Universitas Klabat
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 lg:hidden"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Info in Sidebar */}
        <div className="px-6 py-4 border-b border-slate-700/40 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-300 font-medium truncate">
                {user?.identityNumber || user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {role === 'student'
                ? 'Menu Akademik Mahasiswa'
                : role === 'lecturer'
                  ? 'Menu Dosen Pembimbing'
                  : 'Menu Administrasi Prodi'}
            </p>
          </div>

          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider shrink-0 ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Section: Public link & Logout */}
        <div className="p-4 border-t border-slate-700/40 bg-[#11233d] space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Kunjungi Beranda Publik</span>
          </Link>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Keluar</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi akademik Anda di <strong>SIAM-UNKLAB</strong>?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
