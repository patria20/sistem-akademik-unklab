import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Prototype Notification Banner */}
      <div className="bg-[#142B4A] text-white py-1 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 border-b border-slate-700/60">
        <span className="px-1.5 py-0.5 rounded-sm bg-blue-600 text-[10px] font-bold tracking-wider uppercase">
          DATA SIMULASI
        </span>
        <span className="hidden sm:inline">
          Prototipe Sistem Informasi Akademik & Manajemen Studi Universitas Klabat (SIAM-UNKLAB).
        </span>
        <span className="text-blue-300 font-semibold">Tahun Akademik 2026/2027 Ganjil</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Dynamic Role Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header */}
          <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Institutional Footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <img
                  src="/images/logo/unklab-logo.png"
                  alt="Logo UNKLAB"
                  className="w-5 h-5 object-contain"
                />
                <p>
                  © 2026 <strong>Universitas Klabat</strong>. All rights reserved.
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                SIAM-UNKLAB Enterprise Academic Information System — Faith • Learning • Character
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
