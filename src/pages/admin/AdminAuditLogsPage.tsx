import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { History, Shield, Search } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs } = useAcademic();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jejak Audit & Log Keamanan Sistem"
        subtitle="Perekaman kronologis setiap transaksi akademik, pengajuan KRS, persetujuan, dan perubahan master data"
        breadcrumbs={[
          { label: 'Administrator', path: '/admin/dashboard' },
          { label: 'Log Audit' },
        ]}
      />

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari user, aktivitas aksi, atau rincian log..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
        />
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] bg-slate-50">
                <th className="py-3 px-4">Waktu (WITA)</th>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Peran</th>
                <th className="py-3 px-4">Jenis Aksi</th>
                <th className="py-3 px-4">Rincian Perubahan</th>
                <th className="py-3 px-4">Alamat IP / Jaringan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-md">{log.details}</td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[10px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
