import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router';
import {
  Bell,
  Search,
  Menu,
  GraduationCap,
  UserCheck,
  Shield,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { UserRole } from '../../types/academic';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useAcademic();
  const { info, success } = useToast();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRoleSelect = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleSwitcher(false);
    success('Peran Dialihkan', `Anda kini melihat sistem sebagai ${newRole.toUpperCase()}.`);
    if (newRole === 'student') navigate('/student/dashboard');
    else if (newRole === 'lecturer') navigate('/lecturer/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setShowProfileMenu(false);
    info('Sesi Diakhiri', 'Anda telah berhasil keluar dari sistem SIAM-UNKLAB.');
    navigate('/');
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Mahasiswa
          </span>
        );
      case 'lecturer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5" />
            Dosen PA
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3.5 h-3.5" />
            Admin Akademik
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 shadow-2xs">
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 rounded-xl hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Bar */}
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mata kuliah, jadwal, dosen, atau pengumuman... (Ctrl+K)"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 font-medium transition-all"
            />
          </div>
        </div>

        {/* Right Side: Role Badge, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-semibold text-slate-700"
              title="Ganti Peran Demonstrasi"
            >
              {getRoleBadge(role)}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Ganti Peran Demonstrasi (1-Klik)
                  </p>
                </div>
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => handleRoleSelect('student')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                      role === 'student' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <div>
                      <p>Mahasiswa (David Wowor)</p>
                      <p className="text-[10px] text-slate-400">NIM: 105022110001</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('lecturer')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                      role === 'lecturer'
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p>Dosen PA (Dr. Ronny Gosal)</p>
                      <p className="text-[10px] text-slate-400">NIDN: 0912038401</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                      role === 'admin'
                        ? 'bg-purple-50 text-purple-700 font-bold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    <div>
                      <p>Admin Akademik (Semuel M.)</p>
                      <p className="text-[10px] text-slate-400">Biro Administrasi Akademik</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 rounded-xl hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-800">Notifikasi Akademik</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi saat ini.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                          !n.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !n.read ? 'bg-blue-600' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {n.createdAt}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-hidden"
              aria-label="Menu Pengguna"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#142B4A] to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                  {user?.name || 'Pengguna'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                  {user?.email || 'user@unklab.ac.id'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2">{getRoleBadge(role)}</div>
                </div>

                <div className="p-1">
                  <Link
                    to="/"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Halaman Beranda Utama</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
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
