import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  UserX,
  FileEdit,
  CheckCircle2,
  Calendar,
  X,
  Send,
} from 'lucide-react';
import type { AttendanceRecord } from '../../types/academic';

export const AttendancePage: React.FC = () => {
  const { activeStudent, attendances, requestAttendanceCorrection } = useAcademic();

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!activeStudent) return null;

  const totalMeetings = attendances.length;
  const hadirCount = attendances.filter((a) => a.status === 'hadir').length;
  const izinCount = attendances.filter((a) => a.status === 'izin').length;
  const sakitCount = attendances.filter((a) => a.status === 'sakit').length;
  const alpaCount = attendances.filter((a) => a.status === 'alpa').length;

  const attendancePercentage = totalMeetings > 0 ? Math.round(((hadirCount + izinCount) / totalMeetings) * 100) : 100;

  const handleOpenCorrection = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setCorrectionReason('');
  };

  const handleSubmitCorrection = () => {
    if (!selectedRecord || !correctionReason.trim()) return;
    requestAttendanceCorrection(selectedRecord.id, correctionReason);
    setSelectedRecord(null);
    setSuccessToast(`Permohonan koreksi presensi untuk ${selectedRecord.courseName} berhasil diajukan ke Dosen.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presensi & Rekap Kehadiran Perkuliahan"
        subtitle="Monitor riwayat absensi perkuliahan — Syarat minimal mengikuti Ujian Akhir Semester adalah 75%"
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'Presensi Kehadiran' },
        ]}
      />

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Persentase Kehadiran"
          value={`${attendancePercentage}%`}
          subtitle={attendancePercentage >= 75 ? 'Memenuhi syarat UAS' : 'Di bawah batas minimum UAS!'}
          icon={CheckSquare}
          iconColor={attendancePercentage >= 75 ? 'text-emerald-600' : 'text-red-600'}
          iconBg={attendancePercentage >= 75 ? 'bg-emerald-50' : 'bg-red-50'}
          badge="Batas Min 75%"
        />
        <StatCard
          title="Hadir Fisik / Kelas"
          value={`${hadirCount} Sesi`}
          subtitle="Tercatat fingerprint / scan QR"
          icon={CheckCircle2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Izin / Sakit"
          value={`${izinCount + sakitCount} Sesi`}
          subtitle="Surat keterangan resmi"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Alpa (Tanpa Keterangan)"
          value={`${alpaCount} Sesi`}
          subtitle={alpaCount > 0 ? 'Dapat mengajukan koreksi' : 'Tidak ada alpa'}
          icon={UserX}
          iconColor={alpaCount > 0 ? 'text-red-600' : 'text-slate-400'}
          iconBg={alpaCount > 0 ? 'bg-red-50' : 'bg-slate-100'}
        />
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#142B4A]">Riwayat Absensi Perkuliahan Terdata</h2>
            <p className="text-xs text-slate-500">Klik "Ajukan Koreksi" jika terdapat kekeliruan sistem presensi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                <th className="py-3 px-4">Pertemuan</th>
                <th className="py-3 px-4">Mata Kuliah</th>
                <th className="py-3 px-4">Tanggal Perkuliahan</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
                <th className="py-3 px-4">Status Koreksi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendances.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    Pertemuan #{rec.meetingNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{rec.courseName}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {rec.date}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={rec.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    {rec.correctionRequested ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          {rec.correctionStatus === 'approved'
                            ? 'Koreksi Disetujui'
                            : 'Koreksi Diajukan'}
                        </span>
                        {rec.correctionReason && (
                          <p className="text-[10px] text-slate-500 italic max-w-xs truncate">
                            "{rec.correctionReason}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {rec.status === 'alpa' && !rec.correctionRequested ? (
                      <button
                        onClick={() => handleOpenCorrection(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        Ajukan Koreksi
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Tervalidasi</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Formulir Pengajuan Koreksi Presensi
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p>
                  <strong>Mata Kuliah:</strong> {selectedRecord.courseName}
                </p>
                <p>
                  <strong>Sesi:</strong> Pertemuan #{selectedRecord.meetingNumber} ({selectedRecord.date})
                </p>
                <p>
                  <strong>Status Saat Ini:</strong>{' '}
                  <span className="font-bold text-red-600 uppercase">{selectedRecord.status}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Alasan / Keterangan Koreksi:
                </label>
                <textarea
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Contoh: Saya hadir di ruang kelas, tetapi sensor scanner QR saat itu mengalami gangguan teknis..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  disabled={!correctionReason.trim()}
                  onClick={handleSubmitCorrection}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  Kirim ke Dosen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
