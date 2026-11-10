import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link } from 'react-router';
import {
  FileCheck,
  Users,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';

export const LecturerDashboard: React.FC = () => {
  const { activeLecturer, studyPlans, classes, attendances, consultations } = useAcademic();

  if (!activeLecturer) return null;

  // Pending KRS
  const pendingKrsList = studyPlans.filter((p) => p.status === 'submitted');
  const lecturerClasses = classes.filter((c) => c.lecturerId === activeLecturer.id);
  const pendingCorrections = attendances.filter((a) => a.correctionStatus === 'pending');
  const waitingConsultations = consultations.filter((c) => c.status === 'waiting');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Dashboard Dosen — ${activeLecturer.name}`}
        subtitle={`${activeLecturer.title} — ${activeLecturer.department}, ${activeLecturer.faculty}`}
        actions={
          <Link
            to="/lecturer/krs-approval"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            Tinjau KRS Masuk ({pendingKrsList.length})
          </Link>
        }
      />

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="KRS Menunggu Persetujuan"
          value={`${pendingKrsList.length} Berkas`}
          subtitle="Memerlukan tindakan Dosen PA"
          icon={FileCheck}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          badge={pendingKrsList.length > 0 ? 'Perlu Tinjauan' : 'Selesai'}
          badgeColor="bg-amber-100 text-amber-800"
        />
        <StatCard
          title="Mahasiswa Bimbingan (PA)"
          value={`${activeLecturer.adviseeCount} Orang`}
          subtitle="Program Studi Informatika"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Kelas Diampu Semester Ini"
          value={`${lecturerClasses.length} Kelas`}
          subtitle="Total kuota perkuliahan aktif"
          icon={BookOpen}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Permohonan Koreksi Absensi"
          value={`${pendingCorrections.length} Pengajuan`}
          subtitle="Mahasiswa mengajukan koreksi"
          icon={Clock}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Main Grid: Pending KRS Table & Classes Taught */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending KRS List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#142B4A]">Pengajuan KRS Menunggu Verifikasi Dosen PA</h2>
              <p className="text-xs text-slate-500">Tinjau kesesuaian SKS dan beban mata kuliah mahasiswa</p>
            </div>
            <Link
              to="/lecturer/krs-approval"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingKrsList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Semua KRS Mahasiswa Telah Ditinjau</p>
              <p className="text-slate-500 mt-0.5">Tidak ada antrean persetujuan rencana studi saat ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                    <th className="py-2.5 px-3">Mahasiswa</th>
                    <th className="py-2.5 px-3 text-center">Beban SKS</th>
                    <th className="py-2.5 px-3">Waktu Masuk</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingKrsList.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{plan.studentName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">NIM: {plan.studentNim}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">
                        {plan.totalCredits} SKS
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {plan.submittedAt || 'Baru saja'}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={plan.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Link
                          to="/lecturer/krs-approval"
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors inline-block"
                        >
                          Tinjau KRS
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Classes Taught */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-[#142B4A]">Kelas Perkuliahan Anda</h2>
            <p className="text-xs text-slate-500">Mata kuliah yang Anda ampu semester ini</p>
          </div>

          <div className="space-y-3">
            {lecturerClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                      {cls.courseCode} ({cls.section})
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1">{cls.courseName}</h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">{cls.credits} SKS</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span>
                    {cls.day}, {cls.startTime} - {cls.endTime}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {cls.enrolled}/{cls.capacity} Mhs
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/lecturer/classes"
            className="block text-center py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Kelola Daftar Hadir & Nilai Kelas
          </Link>
        </div>
      </div>
    </div>
  );
};
