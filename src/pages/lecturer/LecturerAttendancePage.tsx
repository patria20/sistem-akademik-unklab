import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-react';

export const LecturerAttendancePage: React.FC = () => {
  const { attendances, approveAttendanceCorrection } = useAcademic();
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const pendingCorrections = attendances.filter((a) => a.correctionStatus === 'pending');

  const handleDecision = (id: string, approve: boolean, studentName: string) => {
    approveAttendanceCorrection(id, approve);
    setSuccessToast(
      approve
        ? `Koreksi presensi untuk ${studentName} DISETUJUI (status diubah menjadi Hadir).`
        : `Koreksi presensi untuk ${studentName} DITOLAK.`
    );
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifikasi Presensi & Koreksi Absensi"
        subtitle="Kelola status kehadiran mahasiswa dan tinjau pengajuan koreksi presensi kelas"
        breadcrumbs={[
          { label: 'Dosen', path: '/lecturer/dashboard' },
          { label: 'Presensi & Absensi' },
        ]}
      />

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Pending Correction Review Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#142B4A]">
              Permohonan Koreksi Presensi Menunggu Tindakan ({pendingCorrections.length})
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi alasan ketidakhadiran yang diajukan oleh mahasiswa
            </p>
          </div>
          {pendingCorrections.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Perlu Respon
            </span>
          )}
        </div>

        {pendingCorrections.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            Tidak ada pengajuan koreksi absensi yang pending saat ini.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingCorrections.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rec.studentName}</span>
                    <span className="font-mono text-slate-500">({rec.studentNim})</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                      {rec.courseName}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Sesi: Pertemuan #{rec.meetingNumber} ({rec.date}) • Tercatat Awal: <strong className="text-red-600 uppercase">{rec.status}</strong>
                  </p>
                  <p className="text-slate-800 italic bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                    Alasan: "{rec.correctionReason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDecision(rec.id, false, rec.studentName)}
                    className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                  >
                    Tolak Koreksi
                  </button>
                  <button
                    onClick={() => handleDecision(rec.id, true, rec.studentName)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Setujui (Hadir)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Attendance Roster Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-[#142B4A]">Semua Log Presensi Terdata</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                <th className="py-3 px-4">Mahasiswa</th>
                <th className="py-3 px-4">Mata Kuliah</th>
                <th className="py-3 px-4">Pertemuan & Tanggal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Status Koreksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendances.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{rec.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{rec.studentNim}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{rec.courseName}</td>
                  <td className="py-3 px-4 text-slate-600">
                    Pertemuan #{rec.meetingNumber} ({rec.date})
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={rec.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    {rec.correctionStatus === 'approved' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Koreksi Disetujui
                      </span>
                    ) : rec.correctionStatus === 'pending' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Menunggu Tinjauan
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
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
